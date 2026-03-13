interface Point {
  x: number;
  y: number;
}

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface StrokeResult {
  isValid: boolean;
  score: number;
  coverageScore: number;
  directionScore: number;
  feedback: string;
}

export interface CharacterResult {
  isValid: boolean;
  score: number;
  strokeResults: StrokeResult[];
  feedback: string;
}

// ─── SVG Sampling ─────────────────────────────────────────────────────────────

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
      x: mt**3*x0 + 3*mt**2*t*x1 + 3*mt*t**2*x2 + t**3*x3,
      y: mt**3*y0 + 3*mt**2*t*y1 + 3*mt*t**2*y2 + t**3*y3,
    });
  }
}

/**
 * Quadratic Bezier — degree-elevated to cubic for uniform sampling.
 * CP1 = P0 + 2/3*(P1-P0), CP2 = P2 + 2/3*(P1-P2)
 */
function sampleQuadraticBezier(
  out: Point[],
  x0: number, y0: number,
  x1: number, y1: number,
  x2: number, y2: number,
  steps = 16,
): void {
  sampleCubicBezier(
    out,
    x0, y0,
    x0 + (2 / 3) * (x1 - x0), y0 + (2 / 3) * (y1 - y0),
    x2 + (2 / 3) * (x1 - x2), y2 + (2 / 3) * (y1 - y2),
    x2, y2,
    steps,
  );
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

// ─── SVG Path Parser ──────────────────────────────────────────────────────────

/**
 * Converts SVG path data to a dense array of sampled points.
 *
 * Supports absolute AND relative: M m L l C c S s Q q T t H h V v A a Z z
 *
 * S/s  — smooth cubic  : CP1 = reflection of last C/S control point 2
 * Q/q  — quadratic     : degree-elevated to cubic for sampling
 * T/t  — smooth quad   : CP = reflection of last Q/T control point
 * A/a  — arc           : approximated as a straight line
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
  let lastDrawCmd = '';
  let lastCP2x = 0, lastCP2y = 0; // Last cubic control point 2 (for S/s)
  let lastQCPx = 0, lastQCPy = 0; // Last quadratic control point (for T/t)

  const n = (): number => parseFloat(tokens[ti++] ?? '0');

  while (ti < tokens.length) {
    const tok = tokens[ti];

    if (/[a-zA-Z]/.test(tok ?? '')) {
      cmd = tok!;
      ti++;
      if (cmd === 'Z' || cmd === 'z') { x = startX; y = startY; lastDrawCmd = cmd; }
      continue;
    }

    switch (cmd) {
      case 'M': x = n(); y = n(); startX = x; startY = y; points.push({ x, y }); cmd = 'L'; break;
      case 'm': x += n(); y += n(); startX = x; startY = y; points.push({ x, y }); cmd = 'l'; break;

      case 'L': { const ex = n(), ey = n(); sampleLine(points, x, y, ex, ey); x = ex; y = ey; lastDrawCmd = 'L'; break; }
      case 'l': { const dx = n(), dy = n(); sampleLine(points, x, y, x+dx, y+dy); x += dx; y += dy; lastDrawCmd = 'l'; break; }
      case 'H': { const ex = n(); sampleLine(points, x, y, ex, y); x = ex; lastDrawCmd = 'H'; break; }
      case 'h': { const dx = n(); sampleLine(points, x, y, x+dx, y); x += dx; lastDrawCmd = 'h'; break; }
      case 'V': { const ey = n(); sampleLine(points, x, y, x, ey); y = ey; lastDrawCmd = 'V'; break; }
      case 'v': { const dy = n(); sampleLine(points, x, y, x, y+dy); y += dy; lastDrawCmd = 'v'; break; }

      case 'C': {
        const cp1x = n(), cp1y = n(), cp2x = n(), cp2y = n(), ex = n(), ey = n();
        sampleCubicBezier(points, x, y, cp1x, cp1y, cp2x, cp2y, ex, ey);
        lastCP2x = cp2x; lastCP2y = cp2y; x = ex; y = ey; lastDrawCmd = 'C';
        break;
      }
      case 'c': {
        const dcp1x = n(), dcp1y = n(), dcp2x = n(), dcp2y = n(), dex = n(), dey = n();
        const acp2x = x + dcp2x, acp2y = y + dcp2y;
        sampleCubicBezier(points, x, y, x+dcp1x, y+dcp1y, acp2x, acp2y, x+dex, y+dey);
        lastCP2x = acp2x; lastCP2y = acp2y; x += dex; y += dey; lastDrawCmd = 'c';
        break;
      }

      // Smooth cubic: CP1 = reflection of last C/S control point 2 over current point
      case 'S': {
        const cp2x = n(), cp2y = n(), ex = n(), ey = n();
        const smooth = /[CcSs]/.test(lastDrawCmd);
        const cp1x = smooth ? x + (x - lastCP2x) : x;
        const cp1y = smooth ? y + (y - lastCP2y) : y;
        sampleCubicBezier(points, x, y, cp1x, cp1y, cp2x, cp2y, ex, ey);
        lastCP2x = cp2x; lastCP2y = cp2y; x = ex; y = ey; lastDrawCmd = 'S';
        break;
      }
      case 's': {
        const dcp2x = n(), dcp2y = n(), dex = n(), dey = n();
        const smooth = /[CcSs]/.test(lastDrawCmd);
        const cp1x = smooth ? x + (x - lastCP2x) : x;
        const cp1y = smooth ? y + (y - lastCP2y) : y;
        const acp2x = x + dcp2x, acp2y = y + dcp2y;
        sampleCubicBezier(points, x, y, cp1x, cp1y, acp2x, acp2y, x+dex, y+dey);
        lastCP2x = acp2x; lastCP2y = acp2y; x += dex; y += dey; lastDrawCmd = 's';
        break;
      }

      // Quadratic Bezier
      case 'Q': {
        const qcpx = n(), qcpy = n(), ex = n(), ey = n();
        sampleQuadraticBezier(points, x, y, qcpx, qcpy, ex, ey);
        lastQCPx = qcpx; lastQCPy = qcpy; x = ex; y = ey; lastDrawCmd = 'Q';
        break;
      }
      case 'q': {
        const dqcpx = n(), dqcpy = n(), dex = n(), dey = n();
        const aqcpx = x + dqcpx, aqcpy = y + dqcpy;
        sampleQuadraticBezier(points, x, y, aqcpx, aqcpy, x+dex, y+dey);
        lastQCPx = aqcpx; lastQCPy = aqcpy; x += dex; y += dey; lastDrawCmd = 'q';
        break;
      }

      // Smooth quadratic: CP = reflection of last Q/T control point over current point
      case 'T': {
        const ex = n(), ey = n();
        const smooth = /[QqTt]/.test(lastDrawCmd);
        const qcpx = smooth ? x + (x - lastQCPx) : x;
        const qcpy = smooth ? y + (y - lastQCPy) : y;
        sampleQuadraticBezier(points, x, y, qcpx, qcpy, ex, ey);
        lastQCPx = qcpx; lastQCPy = qcpy; x = ex; y = ey; lastDrawCmd = 'T';
        break;
      }
      case 't': {
        const dex = n(), dey = n();
        const smooth = /[QqTt]/.test(lastDrawCmd);
        const qcpx = smooth ? x + (x - lastQCPx) : x;
        const qcpy = smooth ? y + (y - lastQCPy) : y;
        sampleQuadraticBezier(points, x, y, qcpx, qcpy, x+dex, y+dey);
        lastQCPx = qcpx; lastQCPy = qcpy; x += dex; y += dey; lastDrawCmd = 't';
        break;
      }

      // Arc: approximate as a straight line (accurate enough for stroke validation)
      case 'A': { for (let k = 0; k < 5; k++) n(); const ex = n(), ey = n(); sampleLine(points, x, y, ex, ey); x = ex; y = ey; lastDrawCmd = 'A'; break; }
      case 'a': { for (let k = 0; k < 5; k++) n(); const dex = n(), dey = n(); sampleLine(points, x, y, x+dex, y+dey); x += dex; y += dey; lastDrawCmd = 'a'; break; }

      default: ti++; break;
    }
  }

  return points;
}

// ─── Geometry Helpers ─────────────────────────────────────────────────────────

function normalizePoints(points: Point[], canvasSize = 300, svgSize = 109): Point[] {
  const scale = canvasSize / svgSize;
  return points.map(p => ({ x: p.x * scale, y: p.y * scale }));
}

function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function simplifyStroke(points: Point[], tolerance = 5): Point[] {
  if (points.length <= 2) return points;
  const out: Point[] = [points[0]!];
  for (let i = 1; i < points.length - 1; i++) {
    if (distance(out[out.length - 1]!, points[i]!) >= tolerance) out.push(points[i]!);
  }
  out.push(points[points.length - 1]!);
  return out;
}

function centroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

/** Diagonal of the bounding box — used to derive adaptive coverage tolerance. */
function strokeBoundingDiagonal(points: Point[]): number {
  if (points.length === 0) return 100;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  return Math.sqrt((maxX - minX) ** 2 + (maxY - minY) ** 2);
}

// ─── Stroke Scoring ──────────────────────────────────────────────────────────

/**
 * Score a user stroke against a reference path.
 *
 * Philosophy: shape matters, exact position does not.
 * The user stroke is centroid-aligned to the reference before scoring —
 * small positional offsets are forgiven, wrong shapes are not.
 *
 * Metrics:
 *   70% – path coverage  : does the stroke pass near every reference point?
 *   30% – direction      : does it go the right way (catches reversed strokes)?
 *
 * Coverage tolerance adapts to stroke extent: short strokes require more
 * precision, long strokes get more absolute slack.
 */
function scoreStroke(user: Point[], ref: Point[], debug = false): StrokeResult {
  if (user.length < 3 || ref.length < 3) {
    return { isValid: true, score: 100, coverageScore: 100, directionScore: 100, feedback: '✓ OK' };
  }

  // ── 1. Direction (30%) ────────────────────────────────────────────────────
  const uStart = user[0]!, uEnd = user[user.length - 1]!;
  const rStart = ref[0]!,  rEnd = ref[ref.length - 1]!;
  const uVec = { x: uEnd.x - uStart.x, y: uEnd.y - uStart.y };
  const rVec = { x: rEnd.x - rStart.x, y: rEnd.y - rStart.y };
  const uLen = Math.sqrt(uVec.x ** 2 + uVec.y ** 2) || 1;
  const rLen = Math.sqrt(rVec.x ** 2 + rVec.y ** 2) || 1;
  const dot = (uVec.x / uLen) * (rVec.x / rLen) + (uVec.y / uLen) * (rVec.y / rLen);
  const directionScore = ((dot + 1) / 2) * 100; // 0–100

  // ── 2. Centroid alignment ─────────────────────────────────────────────────
  // Translate user stroke so its centroid matches the reference centroid.
  // This forgives small positional errors without accepting wrong shapes.
  const refC = centroid(ref);
  const userC = centroid(user);
  const dx = refC.x - userC.x;
  const dy = refC.y - userC.y;
  const alignedUser = user.map(p => ({ x: p.x + dx, y: p.y + dy }));

  // ── 3. Path coverage (70%) ────────────────────────────────────────────────
  // Tolerance scales with the stroke's bounding diagonal so that short strokes
  // require more precision and long strokes get proportionally more slack.
  const diagonal = strokeBoundingDiagonal(ref);
  const COVERAGE_TOLERANCE = Math.max(diagonal * 0.28, 35);

  let totalCoverage = 0;
  for (const rPt of ref) {
    let minDist = Infinity;
    for (const uPt of alignedUser) {
      const d = distance(uPt, rPt);
      if (d < minDist) minDist = d;
    }
    totalCoverage += Math.max(0, 100 - (minDist / COVERAGE_TOLERANCE) * 100);
  }
  const coverageScore = totalCoverage / ref.length;

  const score = directionScore * 0.30 + coverageScore * 0.70;
  const isValid = coverageScore >= 45 && directionScore >= 50 && score >= 52;

  if (debug) {
    console.log('🎯 scoreStroke:', {
      refPoints: ref.length,
      userPoints: user.length,
      centroidOffset: { dx: Math.round(dx), dy: Math.round(dy) },
      adaptiveTolerance: Math.round(COVERAGE_TOLERANCE),
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

  return { isValid, score, coverageScore, directionScore, feedback };
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function validateStroke(
  userStroke: Point[],
  svgPath: string,
  options: { canvasSize?: number; svgSize?: number; debug?: boolean } = {},
): StrokeResult {
  const { canvasSize = 300, svgSize = 109, debug = false } = options;

  const refPoints = normalizePoints(parseSvgPath(svgPath), canvasSize, svgSize);

  if (refPoints.length === 0) {
    return { isValid: true, score: 100, coverageScore: 100, directionScore: 100, feedback: '✓ OK' };
  }

  const user = simplifyStroke(userStroke, 3);
  const ref  = simplifyStroke(refPoints, 2);
  return scoreStroke(user, ref, debug);
}

export function validateCharacter(
  userStrokes: Point[][],
  svgPaths: string[],
  options: { debug?: boolean } = {},
): CharacterResult {
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
    validateStroke(stroke, svgPaths[i]!, { debug }),
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
        ? `❌ Trait ${badIndexes[0]} : ${strokeResults[badIndexes[0]! - 1]!.feedback}`
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
