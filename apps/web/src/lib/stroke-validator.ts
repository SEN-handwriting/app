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
 * Returns true if the point is close enough to the current gate to advance to the next one.
 * Separated from getRealtimeStatus so coloring can use a looser window while gate
 * advancement stays strict.
 */
export function shouldAdvanceGate(
  point: Point,
  waypoints: Point[],
  gateIndex: number,
  tolerancePx: number,
): boolean {
  if (gateIndex >= waypoints.length - 1) return false;
  return distance(point, waypoints[gateIndex]!) <= tolerancePx;
}

/**
 * Real-time proximity check for coloring only.
 * Checks a window of gates around gateIndex so the stroke stays green/yellow
 * between consecutive gates, not just exactly on each gate.
 */
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

  // Look at a window of gates (one behind, two ahead) so transitions between
  // gates don't flash red — the user is on the path even between two gates.
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

function pathLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) len += distance(points[i - 1]!, points[i]!);
  return len;
}

/**
 * Detects aller-retour by projecting every user point onto the stroke's main axis
 * and measuring the largest backward movement relative to the stroke length.
 * Returns 100 if the user barely backtracks, 0 for a full aller-retour.
 */
function computeBacktrackScore(user: Point[], waypoints: Point[]): number {
  if (waypoints.length < 2 || user.length < 3) return 100;
  const wStart = waypoints[0]!;
  const wEnd = waypoints[waypoints.length - 1]!;
  const totalDist = distance(wStart, wEnd);
  if (totalDist < 15) return 100; // very short stroke — skip
  const dx = (wEnd.x - wStart.x) / totalDist;
  const dy = (wEnd.y - wStart.y) / totalDist;

  let maxProj = (user[0]!.x - wStart.x) * dx + (user[0]!.y - wStart.y) * dy;
  let maxBacktrack = 0;
  for (const p of user) {
    const proj = (p.x - wStart.x) * dx + (p.y - wStart.y) * dy;
    if (proj > maxProj) maxProj = proj;
    else maxBacktrack = Math.max(maxBacktrack, maxProj - proj);
  }

  // Normalize: fraction of total stroke length that the user went backward.
  // Allow up to 25% (natural corrections, hooks); hard-fail at 75%+.
  const r = maxBacktrack / totalDist;
  if (r <= 0.25) return 100;
  if (r >= 0.75) return 0;
  return Math.round(100 - ((r - 0.25) / 0.50) * 100);
}

/**
 * Detects lateral detours using a SEQUENTIAL dense gate.
 *
 * The key insight: checking against all 40 waypoints spatially fails on curves
 * because a "future" waypoint (e.g. the bottom-left of a C-curve) can be close
 * to where the user deviated higher up. By advancing the dense gate only when
 * the user is genuinely near it (tight 15 px tolerance), a lateral deviation
 * keeps the gate stuck at the correct position and the distance is measured
 * honestly against that position, not a future one.
 */
function computeExcursionScore(user: Point[], denseWaypoints: Point[], tolerancePx: number): number {
  if (denseWaypoints.length === 0 || user.length === 0) return 100;

  const ADVANCE_TOL = 15; // px — tight so curved future gates can't absorb a deviation
  let gate = 0;
  let maxExcursion = 0;

  for (const p of user) {
    // Advance sequential gate only when genuinely close (not just spatially near a future gate)
    while (gate < denseWaypoints.length - 1 && distance(p, denseWaypoints[gate]!) <= ADVANCE_TOL) {
      gate++;
    }
    maxExcursion = Math.max(maxExcursion, distance(p, denseWaypoints[gate]!));
  }

  // Score 100 within tolerancePx, 0 at 1.5× tolerancePx.
  // isValid threshold 40 → fails when maxExcursion > 1.3× tolerancePx (~58 px at level 0).
  if (maxExcursion <= tolerancePx) return 100;
  if (maxExcursion >= tolerancePx * 1.5) return 0;
  return Math.round(100 - ((maxExcursion - tolerancePx) / (tolerancePx * 0.5)) * 100);
}

function scoreStrokeSequential(
  user: Point[],
  waypoints: Point[],
  denseWaypoints: Point[],
  config: LevelConfig,
  debug = false,
): StrokeResult {
  if (user.length < 3 || waypoints.length === 0) {
    return { isValid: true, score: 100, coverageScore: 100, directionScore: 100, feedback: '✓ OK' };
  }

  // Direction (15%) — dot product of overall start→end vectors
  const uStart = user[0]!, uEnd = user[user.length - 1]!;
  const wStart = waypoints[0]!, wEnd = waypoints[waypoints.length - 1]!;
  const uVec = { x: uEnd.x - uStart.x, y: uEnd.y - uStart.y };
  const wVec = { x: wEnd.x - wStart.x, y: wEnd.y - wStart.y };
  const uLen = Math.sqrt(uVec.x ** 2 + uVec.y ** 2) || 1;
  const wLen = Math.sqrt(wVec.x ** 2 + wVec.y ** 2) || 1;
  const dot = (uVec.x / uLen) * (wVec.x / wLen) + (uVec.y / uLen) * (wVec.y / wLen);
  const directionScore = ((dot + 1) / 2) * 100;

  // Sequential gate coverage (45%)
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

  // Efficiency (10%) — ratio of user path length to expected path length.
  // A lateral zigzag draws 3-5× more than needed.
  const expectedLen = pathLength(waypoints);
  const userLen = pathLength(user);
  const ratio = expectedLen > 0 ? userLen / expectedLen : 1;
  const efficiencyScore = ratio <= 2.0
    ? 100
    : Math.max(0, Math.round(100 - ((ratio - 2.0) / 2.5) * 100));

  // Backtrack (15%) — detects aller-retour: going forward then coming back.
  const backtrackScore = computeBacktrackScore(user, waypoints);

  // Excursion (15%) — detects lateral detours: how far did the user stray from the path?
  // Uses dense waypoints (40 pts) so a "future" waypoint on a curve can't absorb a real detour.
  const excursionScore = computeExcursionScore(user, denseWaypoints, config.tolerancePx);

  const score = directionScore * 0.15 + coverageScore * 0.45 + efficiencyScore * 0.10 + backtrackScore * 0.15 + excursionScore * 0.15;
  const isValid =
    coverageScore >= config.sequentialThreshold &&
    directionScore >= 45 &&
    efficiencyScore >= 30 &&
    backtrackScore >= 40 &&
    excursionScore >= 40; // fails when user was more than 1.6× tolerancePx from the path

  if (debug) {
    console.log('🎯 scoreStrokeSequential:', {
      waypoints: waypoints.length,
      denseWaypoints: denseWaypoints.length,
      gatesPassed,
      tolerancePx: config.tolerancePx,
      directionScore: Math.round(directionScore),
      coverageScore: Math.round(coverageScore),
      efficiencyScore: Math.round(efficiencyScore),
      backtrackScore: Math.round(backtrackScore),
      excursionScore: Math.round(excursionScore),
      ratio: Math.round(ratio * 10) / 10,
      score: Math.round(score),
      isValid,
    });
  }

  let feedback: string;
  if (!isValid) {
    if (backtrackScore < 40)      feedback = '⚠️ Trace le trait sans revenir en arrière';
    else if (excursionScore < 40) feedback = '⚠️ Ne t\'écarte pas autant du tracé';
    else if (directionScore < 45) feedback = '⚠️ La direction du trait est incorrecte';
    else if (efficiencyScore < 30) feedback = '⚠️ Trace le trait d\'un seul geste, sans zigzaguer';
    else                          feedback = '⚠️ Le tracé ne suit pas assez la forme';
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
  // Dense waypoints used only for excursion checking — tight spacing (~7 px) prevents a
  // curve's "future" segment from absorbing a real lateral detour at an earlier position.
  const denseWaypoints = buildWaypoints(svgPath, 40, canvasSize, svgSize);
  const user = simplifyStroke(userStroke, 3);
  return scoreStrokeSequential(user, waypoints, denseWaypoints, levelConfig, debug);
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
