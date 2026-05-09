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
  /** Combined score threshold (0–1) to consider a stroke valid */
  validThreshold: number;
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
  let lastCP2x = 0, lastCP2y = 0;
  let lastQCPx = 0, lastQCPy = 0;

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

      case 'A': { for (let k = 0; k < 5; k++) n(); const ex = n(), ey = n(); sampleLine(points, x, y, ex, ey); x = ex; y = ey; lastDrawCmd = 'A'; break; }
      case 'a': { for (let k = 0; k < 5; k++) n(); const dex = n(), dey = n(); sampleLine(points, x, y, x+dex, y+dey); x += dex; y += dey; lastDrawCmd = 'a'; break; }

      default: ti++; break;
    }
  }

  return points;
}

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

export function distance(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

export function shouldAdvanceGate(
  point: Point,
  waypoints: Point[],
  gateIndex: number,
  tolerancePx: number,
): boolean {
  if (gateIndex >= waypoints.length - 1) return false;
  return distance(point, waypoints[gateIndex]!) <= tolerancePx;
}

export function getRealtimeStatus(
  point: Point,
  waypoints: Point[],
  gateIndex: number,
  tolerancePx: number,
): "on" | "near" | "off" {
  if (waypoints.length === 0) return "off";

  if (gateIndex >= waypoints.length) {
    const last = waypoints[waypoints.length - 1]!;
    const d = distance(point, last);
    if (d <= tolerancePx * 1.5) return "on";
    if (d <= tolerancePx * 2.5) return "near";
    return "off";
  }

  const start = Math.max(0, gateIndex - 1);
  const end = Math.min(waypoints.length - 1, gateIndex + 2);
  let minDist = Infinity;
  for (let i = start; i <= end; i++) {
    minDist = Math.min(minDist, distance(point, waypoints[i]!));
  }

  if (minDist <= tolerancePx) return "on";
  if (minDist <= tolerancePx * 1.6) return "near";
  return "off";
}

// ─── Stroke Pre-processing ────────────────────────────────────────────────────

/**
 * Interpolate gaps in the user stroke so fast swipes (common on mobile)
 * don't create large point-to-point jumps that miss waypoints.
 */
function interpolateStroke(points: Point[], maxStep = 15): Point[] {
  if (points.length <= 1) return points;
  const out: Point[] = [points[0]!];
  for (let i = 1; i < points.length; i++) {
    const prev = out[out.length - 1]!;
    const curr = points[i]!;
    const d = distance(prev, curr);
    if (d > maxStep) {
      const steps = Math.ceil(d / maxStep);
      for (let s = 1; s <= steps; s++) {
        out.push({
          x: prev.x + (curr.x - prev.x) * (s / steps),
          y: prev.y + (curr.y - prev.y) * (s / steps),
        });
      }
    } else {
      out.push(curr);
    }
  }
  return out;
}

function pathLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += distance(points[i - 1]!, points[i]!);
  return len;
}

/**
 * Efficiency penalty multiplier (0–1) based on how much the user drew
 * relative to the expected stroke length.
 *
 * A zigzag draws 3–10× more than needed → factor approaches 0 → score collapses.
 * Natural wobbles (×1.5–1.8) → no penalty (factor = 1.0).
 *
 * Scale:
 *   ratio ≤ 2.0  → 1.0  (no penalty)
 *   ratio = 3.0  → 0.5
 *   ratio ≥ 4.0  → 0.0  (completely wrong)
 */
function efficiencyFactor(userLen: number, expectedLen: number): number {
  if (expectedLen < 10) return 1.0; // very short expected stroke — skip
  const ratio = userLen / expectedLen;
  if (ratio <= 2.0) return 1.0;
  if (ratio >= 4.0) return 0.0;
  return 1.0 - (ratio - 2.0) / 2.0;
}

// ─── Default Config ───────────────────────────────────────────────────────────

export const DEFAULT_LEVEL_CONFIG: LevelConfig = {
  waypointN: 8,
  tolerancePx: 50,
  validThreshold: 0.50,
};

// ─── Stroke Scoring ───────────────────────────────────────────────────────────

/**
 * Score a single user stroke against the expected SVG waypoints.
 *
 * Three components, one threshold:
 *
 *   base    = coverage × 0.70 + direction × 0.30
 *   final   = base × effFactor          ← zigzag killer
 *   isValid ⟺ final ≥ validThreshold
 *
 * - coverage:   fraction of waypoints hit in sequential order (≈ "did you follow the shape?")
 * - direction:  dot product of overall start→end vectors (≈ "did you go the right way?")
 * - effFactor:  1.0 for normal strokes, collapses toward 0 for zigzags (ratio > 2×)
 *
 * Only hard fail: nearly-backwards stroke (direction < 0.20, i.e. > 127° off).
 */
function scoreStroke(
  user: Point[],
  waypoints: Point[],
  config: LevelConfig,
  effFactor: number,
  debug = false,
): StrokeResult {
  if (user.length < 2 || waypoints.length === 0) {
    return { isValid: true, score: 100, coverageScore: 100, directionScore: 100, feedback: '✓ OK' };
  }

  // ── Direction ─────────────────────────────────────────────────────────────
  const uStart = user[0]!, uEnd = user[user.length - 1]!;
  const wStart = waypoints[0]!, wEnd = waypoints[waypoints.length - 1]!;
  const uVec = { x: uEnd.x - uStart.x, y: uEnd.y - uStart.y };
  const wVec = { x: wEnd.x - wStart.x, y: wEnd.y - wStart.y };
  const uLen = Math.sqrt(uVec.x ** 2 + uVec.y ** 2) || 1;
  const wLen = Math.sqrt(wVec.x ** 2 + wVec.y ** 2) || 1;
  const dot = (uVec.x / uLen) * (wVec.x / wLen) + (uVec.y / uLen) * (wVec.y / wLen);
  const dirScore = (dot + 1) / 2; // [−1,1] → [0,1]

  // Completely backwards stroke → immediate fail
  if (dirScore < 0.20) {
    return {
      isValid: false,
      score: Math.round(dirScore * 40),
      coverageScore: 0,
      directionScore: Math.round(dirScore * 100),
      feedback: '⚠️ La direction du trait est incorrecte',
    };
  }

  // ── Coverage ──────────────────────────────────────────────────────────────
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
  const covScore = gatesPassed / waypoints.length; // 0–1

  // ── Combined (efficiency as multiplicative penalty) ────────────────────────
  const base = covScore * 0.70 + dirScore * 0.30;
  const combined = base * effFactor;
  const isValid = combined >= config.validThreshold;
  const score100 = Math.round(combined * 100);

  if (debug) {
    console.log('🎯 scoreStroke:', {
      gatesPassed, total: waypoints.length,
      coverageScore: Math.round(covScore * 100),
      directionScore: Math.round(dirScore * 100),
      effFactor: Math.round(effFactor * 100),
      base: Math.round(base * 100),
      combined: Math.round(combined * 100),
      threshold: Math.round(config.validThreshold * 100),
      tolerancePx: config.tolerancePx,
      isValid,
    });
  }

  let feedback: string;
  if (!isValid) {
    if (effFactor < 0.6) {
      feedback = '⚠️ Trace le trait d\'un seul geste, sans zigzaguer';
    } else if (dirScore < 0.42) {
      feedback = '⚠️ La direction du trait est incorrecte';
    } else {
      feedback = '⚠️ Essaie de mieux suivre le tracé';
    }
  } else if (score100 >= 88) {
    feedback = '🎉 Parfait !';
  } else if (score100 >= 75) {
    feedback = '👍 Très bien !';
  } else {
    feedback = '✓ C\'est correct !';
  }

  return {
    isValid,
    score: score100,
    coverageScore: Math.round(covScore * 100),
    directionScore: Math.round(dirScore * 100),
    feedback,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

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
  const {
    canvasSize = 300,
    svgSize = 109,
    debug = false,
    levelConfig = DEFAULT_LEVEL_CONFIG,
  } = options;

  const waypoints = buildWaypoints(svgPath, levelConfig.waypointN, canvasSize, svgSize);
  if (waypoints.length === 0) {
    return { isValid: true, score: 100, coverageScore: 100, directionScore: 100, feedback: '✓ OK' };
  }

  // Interpolate to fill gaps from fast mobile swipes
  const user = interpolateStroke(userStroke, 15);

  // Expected arc length from dense sampling (25 pts) for better curve approximation
  const densePath = buildWaypoints(svgPath, 25, canvasSize, svgSize);
  const expectedLen = pathLength(densePath);
  const userLen = pathLength(user);
  const effFactor = efficiencyFactor(userLen, expectedLen);

  return scoreStroke(user, waypoints, levelConfig, effFactor, debug);
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
        ? `Trait ${badIndexes[0]} : ${strokeResults[badIndexes[0]! - 1]!.feedback}`
        : `Traits ${badIndexes.join(', ')} à revoir — réessaie !`;
  } else if (score >= 85) {
    feedback = '🎉 Parfait !';
  } else if (score >= 70) {
    feedback = '👍 Très bien !';
  } else if (score >= 55) {
    feedback = '✓ Bien !';
  } else {
    feedback = "✓ C'est correct !";
  }

  return { isValid: allValid, score, strokeResults, feedback };
}
