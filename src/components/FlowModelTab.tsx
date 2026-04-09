import React, { useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ScatterChart, Scatter, Label,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label as UILabel } from '@/components/ui/label';
import { SteadyStateFormula } from '@/components/FormulaDisplay';
import { useI18n } from '@/lib/i18n';
import {
  FlowParams, SimulationResult, SIMULATION_COLORS,
  steadyStateUnemployment, unemploymentDynamics, beveridgeCurve,
} from '@/lib/laborMarketModels';

const MAX_HISTORY = 10;

const defaultParams: FlowParams = {
  accessionRate: 0.15,
  separationRate: 0.05,
  laborForce: 1000,
  matchingEfficiency: 0.5,
  vacancyRate: 0.05,
};

export const FlowModelTab: React.FC = () => {
  const { t } = useI18n();
  const [params, setParams] = useState<FlowParams>(defaultParams);
  const [simulations, setSimulations] = useState<SimulationResult[]>([]);
  const [counter, setCounter] = useState(0);

  const createSimResult = useCallback((isCompare: boolean): SimulationResult => {
    const { accessionRate: f, separationRate: s, matchingEfficiency: A } = params;
    const uStar = steadyStateUnemployment(s, f);
    const u0 = isCompare && simulations.length > 0
      ? simulations[simulations.length - 1].steadyState
      : 0.1;
    const path = unemploymentDynamics(s, f, u0);
    const bc = beveridgeCurve(s, A);

    return {
      id: `sim-${counter}`,
      label: `s=${s}, f=${f}`,
      params: { ...params },
      color: SIMULATION_COLORS[counter % SIMULATION_COLORS.length],
      unemploymentPath: path,
      steadyState: uStar,
      beveridgeCurve: bc,
    };
  }, [params, simulations, counter]);

  const runAnalysis = useCallback(() => {
    const newSim = createSimResult(false);
    setSimulations([{ ...newSim, color: SIMULATION_COLORS[0] }]);
    setCounter(1);
  }, [createSimResult]);

  const compareAnalysis = useCallback(() => {
    const newSim = createSimResult(true);
    setSimulations(prev => [...prev, newSim].slice(-MAX_HISTORY));
    setCounter(c => c + 1);
  }, [createSimResult]);

  const clearHistory = () => { setSimulations([]); setCounter(0); };
  const reset = () => { setParams(defaultParams); clearHistory(); };

  const currentSteadyState = steadyStateUnemployment(params.separationRate, params.accessionRate);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-72 shrink-0 space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-serif">{t('parameters')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <UILabel className="text-xs">
                {t('jobFindingRate')}: <span className="font-mono font-semibold">{params.accessionRate.toFixed(2)}</span>
              </UILabel>
              <Slider
                value={[params.accessionRate]}
                onValueChange={([v]) => setParams(p => ({ ...p, accessionRate: v }))}
                min={0.01} max={0.5} step={0.01}
              />
            </div>
            <div className="space-y-2">
              <UILabel className="text-xs">
                {t('separationRate')}: <span className="font-mono font-semibold">{params.separationRate.toFixed(2)}</span>
              </UILabel>
              <Slider
                value={[params.separationRate]}
                onValueChange={([v]) => setParams(p => ({ ...p, separationRate: v }))}
                min={0.01} max={0.3} step={0.01}
              />
            </div>
            <div className="space-y-2">
              <UILabel className="text-xs">
                {t('matchingEfficiency')}: <span className="font-mono font-semibold">{params.matchingEfficiency.toFixed(2)}</span>
              </UILabel>
              <Slider
                value={[params.matchingEfficiency]}
                onValueChange={([v]) => setParams(p => ({ ...p, matchingEfficiency: v }))}
                min={0.1} max={2.0} step={0.05}
              />
            </div>

            <div className="pt-2 space-y-2">
              <Button onClick={runAnalysis} className="w-full" size="sm">
                {t('runSimulation')}
              </Button>
              <Button onClick={compareAnalysis} variant="secondary" className="w-full" size="sm" disabled={simulations.length === 0}>
                {t('compareSimulation')}
              </Button>
              <div className="flex gap-2">
                <Button onClick={clearHistory} variant="outline" size="sm" className="flex-1">
                  {t('clearHistory')}
                </Button>
                <Button onClick={reset} variant="outline" size="sm" className="flex-1">
                  {t('reset')}
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-2">{t('steadyState')}</p>
              <SteadyStateFormula value={currentSteadyState} />
            </div>
          </CardContent>
        </Card>

        {simulations.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif">{t('legend')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {simulations.map(sim => (
                <div key={sim.id} className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-0.5 shrink-0" style={{ backgroundColor: sim.color }} />
                  <span className="font-mono">{sim.label}</span>
                  <span className="text-muted-foreground">
                    (u*={((sim.steadyState) * 100).toFixed(1)}%)
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex-1 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif">{t('unemploymentDynamics')}</CardTitle>
          </CardHeader>
          <CardContent>
            {simulations.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                {t('adjustAndRun')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="t" type="number" domain={[0, 50]}
                    label={{ value: t('time'), position: 'insideBottom', offset: -5, style: { fontFamily: 'serif', fontSize: 12 } }}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: 'u(t)', angle: -90, position: 'insideLeft', style: { fontFamily: 'serif', fontSize: 12 } }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, t('unemploymentRate')]}
                    labelFormatter={(label: number) => `t = ${label}`}
                  />
                  {simulations.map(sim => (
                    <React.Fragment key={sim.id}>
                      <Line
                        data={sim.unemploymentPath}
                        dataKey="u"
                        stroke={sim.color}
                        strokeWidth={2}
                        dot={false}
                        name={sim.label}
                        connectNulls
                      />
                      <ReferenceLine
                        y={sim.steadyState}
                        stroke={sim.color}
                        strokeDasharray="4 4"
                        strokeOpacity={0.5}
                      >
                        <Label
                          value={`u*=${(sim.steadyState * 100).toFixed(1)}%`}
                          position="right"
                          style={{ fontSize: 10, fontFamily: 'serif', fill: sim.color }}
                        />
                      </ReferenceLine>
                    </React.Fragment>
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif">{t('beveridgeCurve')}</CardTitle>
          </CardHeader>
          <CardContent>
            {simulations.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                {t('beveridgeHint')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="u" type="number" domain={[0, 0.5]} name={t('unemploymentRate')}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: t('unemploymentRateAxis'), position: 'insideBottom', offset: -5, style: { fontFamily: 'serif', fontSize: 12 } }}
                  />
                  <YAxis
                    dataKey="v" type="number" domain={[0, 0.5]} name={t('vacancyRate')}
                    tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                    label={{ value: t('vacancyRate'), angle: -90, position: 'insideLeft', style: { fontFamily: 'serif', fontSize: 12 } }}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${(value * 100).toFixed(2)}%`,
                      name === 'u' ? t('unemploymentRate') : t('vacancyRate')
                    ]}
                  />
                  {simulations.map(sim => (
                    <Scatter
                      key={sim.id}
                      data={sim.beveridgeCurve}
                      fill={sim.color}
                      line={{ stroke: sim.color, strokeWidth: 2 }}
                      lineType="fitting"
                      shape="circle"
                      name={sim.label}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
