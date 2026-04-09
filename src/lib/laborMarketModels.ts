// Labor Market Dynamics Models

// Expanded color palette — 10 distinct colors for comparisons
export const SIMULATION_COLORS = [
  'hsl(220, 70%, 50%)',   // blue
  'hsl(0, 70%, 50%)',     // red
  'hsl(140, 60%, 40%)',   // green
  'hsl(280, 60%, 50%)',   // purple
  'hsl(30, 80%, 50%)',    // orange
  'hsl(180, 60%, 40%)',   // teal
  'hsl(340, 70%, 50%)',   // pink
  'hsl(60, 70%, 40%)',    // olive
  'hsl(200, 80%, 45%)',   // cerulean
  'hsl(310, 50%, 55%)',   // magenta
];

// ============================================
// Tab 1: Flow Model (Search & Matching)
// ============================================

export interface FlowParams {
  accessionRate: number;
  separationRate: number;
  laborForce: number;
  matchingEfficiency: number;
  vacancyRate: number;
}

export interface SimulationResult {
  id: string;
  label: string;
  params: FlowParams;
  color: string;
  unemploymentPath: { t: number; u: number }[];
  steadyState: number;
  beveridgeCurve: { u: number; v: number }[];
}

export function steadyStateUnemployment(s: number, f: number): number {
  if (s + f === 0) return 0;
  return s / (s + f);
}

export function unemploymentDynamics(
  s: number, f: number, u0: number, periods: number = 50
): { t: number; u: number }[] {
  const uStar = steadyStateUnemployment(s, f);
  const path: { t: number; u: number }[] = [];
  for (let t = 0; t <= periods; t++) {
    const u = uStar + (u0 - uStar) * Math.exp(-(s + f) * t);
    path.push({ t, u: Math.round(u * 10000) / 10000 });
  }
  return path;
}

export function beveridgeCurve(
  s: number, A: number, alpha: number = 0.5, points: number = 50
): { u: number; v: number }[] {
  const curve: { u: number; v: number }[] = [];
  for (let i = 1; i <= points; i++) {
    const u = i / (points + 1);
    const flow = s * (1 - u);
    const uAlpha = Math.pow(u, alpha);
    if (uAlpha === 0 || A === 0) continue;
    const v = Math.pow(flow / (A * uAlpha), 1 / (1 - alpha));
    if (v >= 0 && v <= 1 && isFinite(v)) {
      curve.push({ u: Math.round(u * 1000) / 1000, v: Math.round(v * 1000) / 1000 });
    }
  }
  return curve;
}

// ============================================
// Tab 2: Minimum Wage Analysis
// ============================================

export interface WageParams {
  minimumWage: number;
  demandElasticity: number;
  supplyElasticity: number;
  demandIntercept: number;
  supplyIntercept: number;
}

export interface WageResult {
  id: string;
  label: string;
  params: WageParams;
  color: string;
  equilibriumWage: number;
  equilibriumEmployment: number;
  demandCurve: { L: number; w: number }[];
  supplyCurve: { L: number; w: number }[];
  minWageEmployment: number;
  minWageLaborSupply: number;
  unemployment: number;
  wageIncrease: number;
  deadweightLoss: number;
}

export function computeWageAnalysis(params: WageParams): Omit<WageResult, 'id' | 'label' | 'color'> {
  const { minimumWage, demandElasticity: ed, supplyElasticity: es, demandIntercept: ad, supplyIntercept: as_ } = params;

  const wStar = (ed * ad + es * as_) / (ed + es);
  const lStar = ed * (ad - wStar);

  const maxL = Math.max(lStar * 2, 100);
  const demandCurve: { L: number; w: number }[] = [];
  const supplyCurve: { L: number; w: number }[] = [];

  for (let L = 0; L <= maxL; L += maxL / 100) {
    const wd = ad - L / ed;
    if (wd >= 0) demandCurve.push({ L: Math.round(L * 100) / 100, w: Math.round(wd * 100) / 100 });
    const ws = as_ + L / es;
    if (ws <= ad * 1.5) supplyCurve.push({ L: Math.round(L * 100) / 100, w: Math.round(ws * 100) / 100 });
  }

  const minWageEmployment = minimumWage > wStar ? Math.max(0, ed * (ad - minimumWage)) : lStar;
  const minWageLaborSupply = minimumWage > wStar ? es * (minimumWage - as_) : lStar;
  const unemployment = Math.max(0, minWageLaborSupply - minWageEmployment);
  const wageIncrease = wStar > 0 ? ((minimumWage - wStar) / wStar) * 100 : 0;
  const deadweightLoss = minimumWage > wStar
    ? 0.5 * (lStar - minWageEmployment) * (minimumWage - wStar)
    : 0;

  return {
    params,
    equilibriumWage: Math.round(wStar * 100) / 100,
    equilibriumEmployment: Math.round(lStar * 100) / 100,
    demandCurve,
    supplyCurve,
    minWageEmployment: Math.round(minWageEmployment * 100) / 100,
    minWageLaborSupply: Math.round(minWageLaborSupply * 100) / 100,
    unemployment: Math.round(unemployment * 100) / 100,
    wageIncrease: Math.round(wageIncrease * 10) / 10,
    deadweightLoss: Math.round(deadweightLoss * 100) / 100,
  };
}
