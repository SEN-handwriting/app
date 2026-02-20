interface Point {
  x: number;
  y: number;
}

// ─── SVG Path Parser ─────────────────────────────────────────────────────────

function sampleCubicBezier(
  out: Point[],
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  x3: number, y3: number,
  steps = 20,
): void {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    out.push({
      x: mt * mt * mt * x0 + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x3,
      y: mt * mt * mt * y0 + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y3,
    });
  }
}

/** Sample `steps` points along a straight segment (end-point included). */
function sampleLine(
  out: Point[],
  x0: number, y0: number,
  x1: number, y1: number,
  steps = 12,
): void {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    out.push({ x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t });
  }
}

/**
 * Converts SVG path data to a dense array of sampled points.
 *
 * Supports absolute AND relative commands: M m L l C c H h V v Z z
 *
 * Lines (L/l) are sampled into 12 intermediate points so that the
 * coverage metric has enough data to detect wrong shapes on straight strokes.
 *
 * The tokenizer regex handles adjacent negative numbers (e.g. "8.62-0.25").
 */
function parseSvgPath(pathD: string): Point[] {
  const tokens =
    pathD.match(
      /[MmLlCcHhVvZzSsQqTtAa]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g,
    ) ?? [];

  const points: Point[] = [];
  let x = 0, y = 0, startX = 0, startY = 0;
  let ti = 0;
  let cmd = '';

  const n = (): number => parseFloat(tokens[ti++]);

  while (ti < tokens.length) {
    const tok = tokens[ti];

    if (/[a-zA-Z]/.test(tok)) {
      cmd = tok;
      ti++;
      if (cmd === 'Z' || cmd === 'z') { x = startX; y = startY; }
      continue;
    }

    switch (cmd) {
      case 'M': x = n(); y = n(); startX = x; startY = y; points.push({ x, y }); cmd = 'L'; break;
      case 'm': x += n(); y += n(); startX = x; startY = y; points.push({ x, y }); cmd = 'l'; break;

      // Lines: sample multiple points so coverage works on straight strokes
      case 'L': { const ex = n(), ey = n(); sampleLine(points, x, y, ex, ey); x = ex; y = ey; break; }
      case 'l': { const dx = n(), dy = n(); sampleLine(points, x, y, x + dx, y + dy); x += dx; y += dy; break; }
      case 'H': { const ex = n(); sampleLine(points, x, y, ex, y); x = ex; break; }
      case 'h': { const dx = n(); sampleLine(points, x, y, x + dx, y); x += dx; break; }
      case 'V': { const ey = n(); sampleLine(points, x, y, x, ey); y = ey; break; }
      case 'v': { const dy = n(); sampleLine(points, x, y, x, y + dy); y += dy; break; }

      case 'C': {
        const cp1x = n(), cp1y = n(), cp2x = n(), cp2y = n(), ex = n(), ey = n();
        sampleCubicBezier(points, x, y, cp1x, cp1y, cp2x, cp2y, ex, ey);
        x = ex; y = ey;
        break;
      }
      case 'c': {
        const dcp1x = n(), dcp1y = n(), dcp2x = n(), dcp2y = n(), dex = n(), dey = n();
        sampleCubicBezier(points, x, y, x + dcp1x, y + dcp1y, x + dcp2x, y + dcp2y, x + dex, y + dey);
        x += dex; y += dey;
        break;
      }
      default: ti++; break;
    }
  }

  return points;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function normalizePoints(points: Point[], canvasSize = 300, svgSize = 109): Point[] {
  const scale = canvasSize / svgSize;
  return points.map(p => ({ x: p.x * scale, y: p.y * scale }));
}

function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function simplifyStroke(points: Point[], tolerance = 5): Point[] {
  if (points.length <= 2) return points;
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    if (distance(out[out.length - 1], points[i]) >= tolerance) out.push(points[i]);
  }
  out.push(points[points.length - 1]);
  return out;
}

// ─── Stroke Scoring ──────────────────────────────────────────────────────────

/**
 * Score a user stroke against a reference path.
 *
 * Philosophy: shape matters, exact position does not.
 * If the user draws the right shape in roughly the right area,
 * it should be accepted — perfection is not required.
 *
 * Metrics:
 *   70% – path coverage  : does the stroke pass near every reference point?
 *   30% – direction      : does it go the right way (catches reversed strokes)?
 *
 * Start/end position is intentionally NOT scored separately — it is already
 * captured implicitly by coverage when the shape is correct.
 */
function scoreStroke(
  user: Point[],
  ref: Point[],
  debug = false,
): { isValid: boolean; score: number; feedback: string } {
  if (user.length < 3 || ref.length < 3) {
    return { isValid: true, score: 100, feedback: '✓ OK' };
  }

  // ── 1. Direction (30%) ────────────────────────────────────────────────────
  // Compare the global start→end vector of both strokes.
  // This distinguishes a stroke drawn in the right vs wrong direction.
  const uStart = user[0], uEnd = user[user.length - 1];
  const rStart = ref[0],  rEnd = ref[ref.length - 1];
  const uVec = { x: uEnd.x - uStart.x, y: uEnd.y - uStart.y };
  const rVec = { x: rEnd.x - rStart.x, y: rEnd.y - rStart.y };
  const uLen = Math.sqrt(uVec.x ** 2 + uVec.y ** 2);
  const rLen = Math.sqrt(rVec.x ** 2 + rVec.y ** 2);
  const dot = (uVec.x / uLen) * (rVec.x / rLen) + (uVec.y / uLen) * (rVec.y / rLen);
  const directionScore = ((dot + 1) / 2) * 100; // 0–100

  // ── 2. Path coverage (70%) ────────────────────────────────────────────────
  // For every reference point, find the nearest point in the user stroke.
  // A generous tolerance (55 px on a 300×300 canvas ≈ 18 % of width) lets
  // natural hand variation through while still rejecting wrong shapes.
  const COVERAGE_TOLERANCE = 55;
  let totalCoverage = 0;
  for (const rPt of ref) {
    let minDist = Infinity;
    for (const uPt of user) {
      const d = distance(uPt, rPt);
      if (d < minDist) minDist = d;
    }
    totalCoverage += Math.max(0, 100 - (minDist / COVERAGE_TOLERANCE) * 100);
  }
  const coverageScore = totalCoverage / ref.length;

  const score = directionScore * 0.30 + coverageScore * 0.70;

  // Both coverage and direction must individually be acceptable.
  const isValid = coverageScore >= 45 && directionScore >= 50 && score >= 52;

  if (debug) {
    console.log('🎯 scoreStroke:', {
      refPoints: ref.length,
      userPoints: user.length,
      directionScore: Math.round(directionScore),
      coverageScore: Math.round(coverageScore),
      score: Math.round(score),
      isValid,
    });
  }

  let feedback: string;
  if (!isValid) {
    if (directionScore < 50) feedback = '⚠️ La direction du trait est incorrecte';
    else                     feedback = '⚠️ Le tracé ne suit pas assez la forme';
  } else {
    if (score >= 90)      feedback = '🎉 Parfait !';
    else if (score >= 78) feedback = '👍 Très bien !';
    else if (score >= 65) feedback = '✓ Bien !';
    else                  feedback = "✓ C'est correct !";
  }

  return { isValid, score, feedback };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function validateStroke(
  userStroke: Point[],
  svgPath: string,
  options: { canvasSize?: number; svgSize?: number; debug?: boolean } = {},
): { isValid: boolean; score: number; distanceScore: number; directionScore: number; feedback: string } {
  const { canvasSize = 300, svgSize = 109, debug = false } = options;

  const refPoints = normalizePoints(parseSvgPath(svgPath), canvasSize, svgSize);

  if (refPoints.length === 0) {
    return { isValid: true, score: 100, distanceScore: 100, directionScore: 1, feedback: '✓ OK' };
  }

  const user = simplifyStroke(userStroke, 3);
  // Keep the reference dense (simplify only duplicates) so coverage stays accurate
  const ref = simplifyStroke(refPoints, 2);
  const result = scoreStroke(user, ref, debug);

  return {
    isValid: result.isValid,
    score: result.score,
    distanceScore: result.score,
    directionScore: result.score / 100,
    feedback: result.feedback,
  };
}

export function validateCharacter(
  userStrokes: Point[][],
  svgPaths: string[],
  options: { debug?: boolean } = {},
): {
  isValid: boolean;
  score: number;
  strokeResults: ReturnType<typeof validateStroke>[];
  feedback: string;
} {
  const { debug = false } = options;

  if (userStrokes.length !== svgPaths.length) {
    return {
      isValid: false,
      score: 0,
      strokeResults: [],
      feedback: `Nombre de traits incorrect. Attendu : ${svgPaths.length}, Dessiné : ${userStrokes.length}`,
    };
  }

  const strokeResults = userStrokes.map((stroke, i) =>
    validateStroke(stroke, svgPaths[i], { debug }),
  );

  const score = strokeResults.reduce((s, r) => s + r.score, 0) / strokeResults.length;
  const allValid = strokeResults.every(r => r.isValid);

  if (debug) {
    console.log('📊 validateCharacter:', {
      valid: strokeResults.filter(r => r.isValid).length,
      invalid: strokeResults.filter(r => !r.isValid).length,
      score: Math.round(score),
    });
  }

  let feedback: string;
  if (!allValid) {
    const badIndexes = strokeResults
      .map((r, i) => (!r.isValid ? i + 1 : null))
      .filter((i): i is number => i !== null);
    feedback =
      badIndexes.length === 1
        ? `❌ Trait ${badIndexes[0]} : ${strokeResults[badIndexes[0] - 1].feedback}`
        : `❌ Traits ${badIndexes.join(', ')} incorrects. Réessayez !`;
  } else if (score >= 85) {
    feedback = '🎉 Parfait ! Vous maîtrisez ce caractère !';
  } else if (score >= 70) {
    feedback = '👍 Très bien ! Continuez comme ça !';
  } else if (score >= 55) {
    feedback = '✓ Bien ! Vous progressez !';
  } else {
    feedback = "✓ C'est correct ! On passe au suivant !";
  }

  return { isValid: allValid, score, strokeResults, feedback };
}
