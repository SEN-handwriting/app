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

export interface LevelConfig {
  waypointN: number;
  tolerancePx: number;
  sequentialThreshold: number;
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

// Exported for use by DrawCanvas dots guide mode — uses the full dense parseSvgPath sampling.
/** Sample SVG-space points at given fractional positions (0.0–1.0) along a path. */
export function samplePathPoints(pathD: string, fractions: number[]): Point[] {
  const all = parseSvgPath(pathD);
  if (all.length === 0) return [];
  return fractions.map(f => {
    const idx = Math.round(f * (all.length - 1));
    return all[Math.max(0, Math.min(idx, all.length - 1))]!;
  });
}

// ─── Geometry Helpers ─────────────────────────────────────────────────────────

function normalizePoints(points: Point[], canvasSize = 300, svgSize = 109): Point[] {
  const scale = canvasSize / svgSize;
  return points.map(p => ({ x: p.x * scale, y: p.y * scale }));
}

/**
 * Extract n evenly-spaced waypoints from an SVG path, in canvas pixel space.
 * Used by PracticeGrid to precompute gates and by the sequential scorer.
 */
export function buildWaypoints(
  svgPath: string,
  n: number,
  canvasSize = 300,
  svgSize = 109,
): Point[] {
  const all = normalizePoints(parseSvgPath(svgPath), canvasSize, svgSize);
  if (all.length === 0 || n <= 0) return [];
  if (n === 1) return [all[Math.round((all.length - 1) / 2)]!];
  const result: Point[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.round((i / (n - 1)) * (all.length - 1));
    result.push(all[idx]!);
  }
  return result;
}

function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

/**
 * Real-time proximity check: is the current pen position near gate[gateIndex]?
 * Returns "on" (within tolerance), "near" (within 1.8×tolerance), or "off".
 */
export function getRealtimeStatus(
  point: Point,
  waypoints: Point[],
  gateIndex: number,
  tolerancePx: number,
): "on" | "near" | "off" {
  // gateIndex past end means all gates satisfied — colour the rest green
  if (waypoints.length === 0 || gateIndex >= waypoints.length) return "on";
  const d = distance(point, waypoints[gateIndex]!);
  if (d <= tolerancePx) return "on";
  if (d <= tolerancePx * 1.8) return "near";
  return "off";
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

// ─── Stroke Scoring ──────────────────────────────────────────────────────────

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  waypointN: 8,
  tolerancePx: 38,
  sequentialThreshold: 60,
};

function scoreStrokeSequential(
  user: Point[],
  waypoints: Point[],
  config: LevelConfig,
  debug = false,
): StrokeResult {
  if (user.length < 3 || waypoints.length === 0) {
    return { isValid: true, score: 100, coverageScore: 100, directionScore: 100, feedback: '✓ OK' };
  }

  // Direction (30%) — dot product of overall start→end vectors
  const uStart = user[0]!, uEnd = user[user.length - 1]!;
  const wStart = waypoints[0]!, wEnd = waypoints[waypoints.length - 1]!;
  const uVec = { x: uEnd.x - uStart.x, y: uEnd.y - uStart.y };
  const wVec = { x: wEnd.x - wStart.x, y: wEnd.y - wStart.y };
  const uLen = Math.sqrt(uVec.x ** 2 + uVec.y ** 2) || 1;
  const wLen = Math.sqrt(wVec.x ** 2 + wVec.y ** 2) || 1;
  const dot = (uVec.x / uLen) * (wVec.x / wLen) + (uVec.y / uLen) * (wVec.y / wLen);
  const directionScore = ((dot + 1) / 2) * 100;

  // Sequential gate coverage (70%)
  // Each gate must be reached by a user point that comes AFTER the user point that reached the previous gate.
  let gatesPassed = 0;
  let searchFrom = 0;
  for (const gate of waypoints) {
    for (let i = searchFrom; i < user.length; i++) {
      if (distance(user[i]!, gate) <= config.tolerancePx) {
        gatesPassed++;
        searchFrom = i + 1;
        break;
      }
    }
  }
  const coverageScore = (gatesPassed / waypoints.length) * 100;
  const score = directionScore * 0.30 + coverageScore * 0.70;
  const isValid =
    coverageScore >= config.sequentialThreshold &&
    directionScore >= 45;

  if (debug) {
    console.log('🎯 scoreStrokeSequential:', {
      waypoints: waypoints.length,
      gatesPassed,
      tolerancePx: config.tolerancePx,
      directionScore: Math.round(directionScore),
      coverageScore: Math.round(coverageScore),
      score: Math.round(score),
      isValid,
    });
  }

  let feedback: string;
  if (!isValid) {
    if (directionScore < 45) feedback = '⚠️ La direction du trait est incorrecte';
    else feedback = '⚠️ Le tracé ne suit pas assez la forme';
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
  options: {
    canvasSize?: number;
    svgSize?: number;
    debug?: boolean;
    levelConfig?: LevelConfig;
  } = {},
): StrokeResult {
  const { canvasSize = 300, svgSize = 109, debug = false, levelConfig = DEFAULT_LEVEL_CONFIG } = options;
  const waypoints = buildWaypoints(svgPath, levelConfig.waypointN, canvasSize, svgSize);
  if (waypoints.length === 0) {
    return { isValid: true, score: 100, coverageScore: 100, directionScore: 100, feedback: '✓ OK' };
  }
  const user = simplifyStroke(userStroke, 3);
  return scoreStrokeSequential(user, waypoints, levelConfig, debug);
}

export function validateCharacter(
  userStrokes: Point[][],
  svgPaths: string[],
  options: { debug?: boolean; levelConfig?: LevelConfig } = {},
): CharacterResult {
  const { debug = false, levelConfig = DEFAULT_LEVEL_CONFIG } = options;

  if (userStrokes.length !== svgPaths.length) {
    return {
      isValid: false,
      score: 0,
      strokeResults: [],
      feedback: `Nombre de traits incorrect. Attendu : ${svgPaths.length}, Dessiné : ${userStrokes.length}`,
    };
  }

  const strokeResults = userStrokes.map((stroke, i) =>
    validateStroke(stroke, svgPaths[i]!, { debug, levelConfig }),
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
