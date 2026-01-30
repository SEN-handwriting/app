/**
 * Utilitaire pour valider les tracés manuscrits par rapport aux paths SVG de référence
 */

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
}

/**
 * Parse un SVG path command en une série de points
 * Simplifié pour gérer les commandes M, L, C (moveto, lineto, curveto)
 */
function parseSvgPath(pathD: string): Point[] {
  const points: Point[] = [];

  // Nettoyer et normaliser le path
  const commands = pathD.match(/[MLCZ][-\d.,\s]*/gi) || [];

  if (commands.length === 0) {
    console.warn('⚠️ Aucune commande trouvée dans le path SVG:', pathD);
    return points;
  }

  let currentX = 0;
  let currentY = 0;

  commands.forEach((cmd, idx) => {
    const type = cmd[0].toUpperCase();
    const coordsStr = cmd.slice(1).trim();
    const coords = coordsStr.split(/[\s,]+/).filter(s => s.length > 0).map(Number);

    switch (type) {
      case 'M': // MoveTo
        if (coords.length >= 2) {
          currentX = coords[0];
          currentY = coords[1];
          points.push({ x: currentX, y: currentY });
        }
        break;

      case 'L': // LineTo
        for (let i = 0; i < coords.length; i += 2) {
          if (i + 1 < coords.length) {
            currentX = coords[i];
            currentY = coords[i + 1];
            points.push({ x: currentX, y: currentY });
          }
        }
        break;

      case 'C': // Cubic Bezier
        if (coords.length >= 6) {
          // On sample la courbe en plusieurs points
          const startX = currentX;
          const startY = currentY;
          const cp1x = coords[0];
          const cp1y = coords[1];
          const cp2x = coords[2];
          const cp2y = coords[3];
          const endX = coords[4];
          const endY = coords[5];

          // Sample 10 points sur la courbe de Bézier
          for (let t = 0; t <= 1; t += 0.1) {
            const x =
              Math.pow(1 - t, 3) * startX +
              3 * Math.pow(1 - t, 2) * t * cp1x +
              3 * (1 - t) * Math.pow(t, 2) * cp2x +
              Math.pow(t, 3) * endX;
            const y =
              Math.pow(1 - t, 3) * startY +
              3 * Math.pow(1 - t, 2) * t * cp1y +
              3 * (1 - t) * Math.pow(t, 2) * cp2y +
              Math.pow(t, 3) * endY;
            points.push({ x, y });
          }

          currentX = endX;
          currentY = endY;
        }
        break;
    }
  });

  if (points.length === 0) {
    console.error('❌ Aucun point extrait du path SVG:', pathD);
  }

  return points;
}

/**
 * Normalise les points d'un trait pour les mettre à l'échelle du canvas (300x300)
 * par rapport au viewBox SVG (109x109)
 */
function normalizePoints(points: Point[], canvasSize: number = 300, svgSize: number = 109): Point[] {
  const scale = canvasSize / svgSize;
  return points.map(p => ({
    x: p.x * scale,
    y: p.y * scale
  }));
}

/**
 * Calcule la distance euclidienne entre deux points
 */
function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Trouve le point le plus proche dans une liste
 */
function findClosestPoint(point: Point, points: Point[]): { point: Point; distance: number } {
  if (points.length === 0) {
    console.error('❌ findClosestPoint: liste vide');
    return { point: { x: 0, y: 0 }, distance: Infinity };
  }

  let minDist = Infinity;
  let closest = points[0];

  for (const p of points) {
    const dist = distance(point, p);
    if (isNaN(dist) || !isFinite(dist)) {
      console.error('❌ Distance invalide entre', point, 'et', p);
      continue;
    }
    if (dist < minDist) {
      minDist = dist;
      closest = p;
    }
  }

  return { point: closest, distance: minDist };
}

/**
 * Calcule la distance moyenne de Hausdorff entre deux ensembles de points
 * (mesure à quel point deux formes sont similaires)
 */
function hausdorffDistance(points1: Point[], points2: Point[]): number {
  if (!points1.length || !points2.length) {
    console.warn('⚠️ hausdorffDistance: liste de points vide');
    return Infinity;
  }

  let maxDist = 0;

  // Distance de points1 vers points2
  for (const p1 of points1) {
    const { distance: minDist } = findClosestPoint(p1, points2);
    if (isNaN(minDist) || !isFinite(minDist)) {
      console.error('❌ Distance invalide:', minDist, p1);
      continue;
    }
    maxDist = Math.max(maxDist, minDist);
  }

  // Distance de points2 vers points1
  for (const p2 of points2) {
    const { distance: minDist } = findClosestPoint(p2, points1);
    if (isNaN(minDist) || !isFinite(minDist)) {
      console.error('❌ Distance invalide:', minDist, p2);
      continue;
    }
    maxDist = Math.max(maxDist, minDist);
  }

  if (!isFinite(maxDist)) {
    console.error('❌ hausdorffDistance retourne Infinity');
    return Infinity;
  }

  return maxDist;
}

/**
 * Nouvelle validation intelligente multi-critères
 */
function validateStrokeIntelligent(
  userStroke: Point[],
  refPoints: Point[],
  options: {
    canvasSize?: number;
    debug?: boolean;
  } = {}
): {
  isValid: boolean;
  score: number;
  details: {
    startScore: number;
    endScore: number;
    directionScore: number;
    shapeScore: number;
    lengthScore: number;
  };
  feedback: string;
} {
  const { canvasSize = 300, debug = false } = options;

  if (userStroke.length < 3 || refPoints.length < 3) {
    return {
      isValid: true,
      score: 100,
      details: { startScore: 100, endScore: 100, directionScore: 100, shapeScore: 100, lengthScore: 100 },
      feedback: "✓ OK",
    };
  }

  // 1. VÉRIFICATION DU POINT DE DÉPART (20%)
  const userStart = userStroke[0];
  const refStart = refPoints[0];
  const startDist = distance(userStart, refStart);
  const startScore = Math.max(0, 100 - (startDist / 50) * 100); // Tolérance 50px

  // 2. VÉRIFICATION DU POINT DE FIN (20%)
  const userEnd = userStroke[userStroke.length - 1];
  const refEnd = refPoints[refPoints.length - 1];
  const endDist = distance(userEnd, refEnd);
  const endScore = Math.max(0, 100 - (endDist / 50) * 100);

  // 3. VÉRIFICATION DE LA DIRECTION (30%)
  // Comparer le vecteur global début→fin
  const userVector = { x: userEnd.x - userStart.x, y: userEnd.y - userStart.y };
  const refVector = { x: refEnd.x - refStart.x, y: refEnd.y - refStart.y };

  // Normaliser les vecteurs
  const userLength = Math.sqrt(userVector.x ** 2 + userVector.y ** 2);
  const refLength = Math.sqrt(refVector.x ** 2 + refVector.y ** 2);

  const userNorm = { x: userVector.x / userLength, y: userVector.y / userLength };
  const refNorm = { x: refVector.x / refLength, y: refVector.y / refLength };

  // Produit scalaire pour mesurer l'alignement (-1 à 1)
  const dotProduct = userNorm.x * refNorm.x + userNorm.y * refNorm.y;
  const directionScore = ((dotProduct + 1) / 2) * 100; // Convertir en 0-100

  // 4. VÉRIFICATION DE LA LONGUEUR (15%)
  const lengthRatio = Math.min(userLength, refLength) / Math.max(userLength, refLength);
  const lengthScore = lengthRatio * 100;

  // 5. VÉRIFICATION DE LA FORME (15%)
  // Échantillonner 5 points intermédiaires et comparer
  let shapeScore = 0;
  const samples = 5;
  for (let i = 1; i < samples - 1; i++) {
    const progress = i / (samples - 1);
    const userIdx = Math.floor(progress * (userStroke.length - 1));
    const refIdx = Math.floor(progress * (refPoints.length - 1));

    const userPoint = userStroke[userIdx];
    const refPoint = refPoints[refIdx];

    const dist = distance(userPoint, refPoint);
    const pointScore = Math.max(0, 100 - (dist / 60) * 100);
    shapeScore += pointScore;
  }
  shapeScore = shapeScore / (samples - 2);

  // SCORE GLOBAL PONDÉRÉ
  const score =
    startScore * 0.20 +
    endScore * 0.20 +
    directionScore * 0.30 +
    lengthScore * 0.15 +
    shapeScore * 0.15;

  // VALIDATION : Il faut au moins 60% sur chaque critère important
  const isValid =
    startScore >= 50 &&      // Bon point de départ
    endScore >= 50 &&        // Bon point de fin
    directionScore >= 60 &&  // Bonne direction
    score >= 65;             // Score global correct

  if (debug) {
    console.log('🎯 Validation intelligente:', {
      startDist: Math.round(startDist),
      endDist: Math.round(endDist),
      startScore: Math.round(startScore),
      endScore: Math.round(endScore),
      directionScore: Math.round(directionScore),
      lengthScore: Math.round(lengthScore),
      shapeScore: Math.round(shapeScore),
      score: Math.round(score),
      isValid,
    });
  }

  // FEEDBACK
  let feedback = '';
  if (!isValid) {
    if (startScore < 50) {
      feedback = "⚠️ Le point de départ n'est pas bon";
    } else if (endScore < 50) {
      feedback = "⚠️ Le point d'arrivée n'est pas bon";
    } else if (directionScore < 60) {
      feedback = "⚠️ La direction du trait est incorrecte";
    } else {
      feedback = "⚠️ Le tracé ne suit pas assez le modèle";
    }
  } else {
    if (score >= 90) feedback = "🎉 Parfait !";
    else if (score >= 80) feedback = "👍 Très bien !";
    else if (score >= 70) feedback = "✓ Bien !";
    else feedback = "✓ C'est correct !";
  }

  return {
    isValid,
    score,
    details: { startScore, endScore, directionScore, shapeScore, lengthScore },
    feedback,
  };
}

/**
 * Simplifie un trait en réduisant le nombre de points (algorithme Douglas-Peucker simplifié)
 */
function simplifyStroke(points: Point[], tolerance: number = 5): Point[] {
  if (points.length <= 2) return points;

  const simplified: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = points[i];

    if (distance(prev, curr) >= tolerance) {
      simplified.push(curr);
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

/**
 * Valide un trait utilisateur par rapport à un path SVG de référence
 */
export function validateStroke(
  userStroke: Point[],
  svgPath: string,
  options: {
    maxDistance?: number;      // Distance maximale tolérée (pixels)
    minDirectionScore?: number; // Score minimum pour la direction (0-1)
    canvasSize?: number;
    svgSize?: number;
    debug?: boolean;           // Activer les logs de debug
    ignoreDirection?: boolean; // Ignorer complètement la vérification du sens
  } = {}
): {
  isValid: boolean;
  score: number;           // Score global (0-100)
  distanceScore: number;   // Score de proximité (0-100)
  directionScore: number;  // Score de direction (0-1)
  feedback: string;
} {
  const {
    maxDistance = 220,       // Très augmenté pour les courbes complexes
    minDirectionScore = 0.6,
    canvasSize = 300,
    svgSize = 109,
    debug = false,
    ignoreDirection = false
  } = options;

  // Parser et normaliser le path de référence
  const refPoints = parseSvgPath(svgPath);
  const normalizedRefPoints = normalizePoints(refPoints, canvasSize, svgSize);

  if (debug) {
    console.log('🔍 Debug parsing:', {
      svgPathLength: svgPath.length,
      refPointsCount: refPoints.length,
      normalizedCount: normalizedRefPoints.length,
      userPointsCount: userStroke.length,
      firstRefPoint: refPoints[0],
      firstNormalizedPoint: normalizedRefPoints[0],
      firstUserPoint: userStroke[0],
    });
  }

  // Si pas de points de référence, accepter par défaut
  if (refPoints.length === 0 || normalizedRefPoints.length === 0) {
    console.warn('⚠️ Pas de points de référence - validation par défaut');
    return {
      isValid: true,
      score: 100,
      distanceScore: 100,
      directionScore: 1,
      feedback: "✓ Accepté (pas de référence)",
    };
  }

  // Simplifier les traits pour améliorer la performance
  const simplifiedUserStroke = simplifyStroke(userStroke, 3);
  const simplifiedRefPoints = simplifyStroke(normalizedRefPoints, 3);

  // UTILISER LA NOUVELLE VALIDATION INTELLIGENTE
  const result = validateStrokeIntelligent(simplifiedUserStroke, simplifiedRefPoints, {
    canvasSize,
    debug,
  });

  return {
    isValid: result.isValid,
    score: result.score,
    distanceScore: (result.details.startScore + result.details.endScore) / 2,
    directionScore: result.details.directionScore / 100,
    feedback: result.feedback,
  };
}

/**
 * Valide un caractère complet (tous les traits)
 */
export function validateCharacter(
  userStrokes: Point[][],
  svgPaths: string[],
  options: {
    requireCorrectOrder?: boolean; // Exiger l'ordre correct des traits
    maxDistance?: number;
    minDirectionScore?: number;
    debug?: boolean;
  } = {}
): {
  isValid: boolean;
  score: number;
  strokeResults: Array<ReturnType<typeof validateStroke>>;
  feedback: string;
} {
  const { requireCorrectOrder = true, debug = false } = options;

  // Vérifier que le nombre de traits est correct
  if (userStrokes.length !== svgPaths.length) {
    return {
      isValid: false,
      score: 0,
      strokeResults: [],
      feedback: `Nombre de traits incorrect. Attendu: ${svgPaths.length}, Dessiné: ${userStrokes.length}`
    };
  }

  const strokeResults = userStrokes.map((stroke, index) =>
    validateStroke(stroke, svgPaths[index], { ...options, debug })
  );

  // Score global (moyenne des scores de tous les traits)
  const score = strokeResults.reduce((sum, r) => sum + r.score, 0) / strokeResults.length;

  // CRITIQUE : Tous les traits doivent être valides !
  const allValid = strokeResults.every(r => r.isValid);

  if (debug) {
    console.log('📊 Validation du caractère complet:', {
      totalStrokes: strokeResults.length,
      validStrokes: strokeResults.filter(r => r.isValid).length,
      invalidStrokes: strokeResults.filter(r => !r.isValid).length,
      allValid,
      score: Math.round(score),
    });
  }

  let feedback = '';
  if (!allValid) {
    const invalidIndexes = strokeResults
      .map((r, i) => ({ index: i, result: r }))
      .filter(item => !item.result.isValid)
      .map(item => item.index + 1);

    if (invalidIndexes.length === 1) {
      const invalidIndex = invalidIndexes[0] - 1;
      feedback = `❌ Trait ${invalidIndexes[0]} : ${strokeResults[invalidIndex].feedback}`;
    } else {
      feedback = `❌ Traits ${invalidIndexes.join(', ')} incorrects. Réessayez !`;
    }
  } else {
    if (score >= 85) {
      feedback = "🎉 Parfait ! Vous maîtrisez ce caractère !";
    } else if (score >= 70) {
      feedback = "👍 Très bien ! Continuez comme ça !";
    } else if (score >= 55) {
      feedback = "✓ Bien ! Vous progressez !";
    } else {
      feedback = "✓ C'est correct ! On passe au suivant !";
    }
  }

  return {
    isValid: allValid,
    score,
    strokeResults,
    feedback
  };
}