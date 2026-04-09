import React, { useState, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea, Label,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label as UILabel } from '@/components/ui/label';
import { EquilibriumFormula } from '@/components/FormulaDisplay';
import { useI18n } from '@/lib/i18n';
import { WageParams, WageResult, SIMULATION_COLORS, computeWageAnalysis } from '@/lib/laborMarketModels';

const MAX_HISTORY = 10;

const defaultParams: WageParams = {
  minimumWage: 18,
  demandElasticity: 10,
  supplyElasticity: 8,
  demandIntercept: 25,
  supplyIntercept: 3,
};

export const MinWageTab: React.FC = () => {
  const { t } = useI18n();
  const [params, setParams] = useState<WageParams>(defaultParams);
  const [results, setResults] = useState<WageResult[]>([]);
  const [counter, setCounter] = useState(0);

  const createResult = useCallback((): WageResult => {
    const analysis = computeWageAnalysis(params);
    return {
      ...analysis,
      id: `wage-${counter}`,
      label: `w̄=${params.minimumWage}, εd=${params.demandElasticity}, εs=${params.supplyElasticity}`,
      color: SIMULATION_COLORS[counter % SIMULATION_COLORS.length],
    };
  }, [params, counter]);

  const runAnalysis = useCallback(() => {
    const newResult = createResult();
    setResults([{ ...newResult, color: SIMULATION_COLORS[0] }]);
    setCounter(1);
  }, [createResult]);

  const compareAnalysis = useCallback(() => {
    const newResult = createResult();
    setResults(prev => [...prev, newResult].slice(-MAX_HISTORY));
    setCounter(c => c + 1);
  }, [createResult]);

  const clearHistory = () => { setResults([]); setCounter(0); };
  const reset = () => { setParams(defaultParams); clearHistory(); };

  const preview = computeWageAnalysis(params);
  const latestResult = results.length > 0 ? results[results.length - 1] : null;

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
                {t('minimumWage')}: <span className="font-mono font-semibold">{params.minimumWage.toFixed(1)}</span>
              </UILabel>
              <Slider
                value={[params.minimumWage]}
                onValueChange={([v]) => setParams(p => ({ ...p, minimumWage: v }))}
                min={0} max={30} step={0.5}
              />
            </div>
            <div className="space-y-2">
              <UILabel className="text-xs">
                {t('demandElasticity')}: <span className="font-mono font-semibold">{params.demandElasticity.toFixed(1)}</span>
              </UILabel>
              <Slider
                value={[params.demandElasticity]}
                onValueChange={([v]) => setParams(p => ({ ...p, demandElasticity: v }))}
                min={1} max={30} step={0.5}
              />
            </div>
            <div className="space-y-2">
              <UILabel className="text-xs">
                {t('supplyElasticity')}: <span className="font-mono font-semibold">{params.supplyElasticity.toFixed(1)}</span>
              </UILabel>
              <Slider
                value={[params.supplyElasticity]}
                onValueChange={([v]) => setParams(p => ({ ...p, supplyElasticity: v }))}
                min={1} max={30} step={0.5}
              />
            </div>
            <div className="space-y-2">
              <UILabel className="text-xs">
                {t('demandIntercept')}: <span className="font-mono font-semibold">{params.demandIntercept.toFixed(1)}</span>
              </UILabel>
              <Slider
                value={[params.demandIntercept]}
                onValueChange={([v]) => setParams(p => ({ ...p, demandIntercept: v }))}
                min={10} max={50} step={1}
              />
            </div>
            <div className="space-y-2">
              <UILabel className="text-xs">
                {t('supplyIntercept')}: <span className="font-mono font-semibold">{params.supplyIntercept.toFixed(1)}</span>
              </UILabel>
              <Slider
                value={[params.supplyIntercept]}
                onValueChange={([v]) => setParams(p => ({ ...p, supplyIntercept: v }))}
                min={0} max={15} step={0.5}
              />
            </div>

            <div className="pt-2 space-y-2">
              <Button onClick={runAnalysis} className="w-full" size="sm">
                {t('runAnalysis')}
              </Button>
              <Button onClick={compareAnalysis} variant="secondary" className="w-full" size="sm" disabled={results.length === 0}>
                {t('compareAnalysis')}
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
              <p className="text-xs text-muted-foreground mb-2">{t('equilibriumCondition')}</p>
              <EquilibriumFormula wStar={preview.equilibriumWage} lStar={preview.equilibriumEmployment} />
            </div>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-serif">{t('legend')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {results.map(r => (
                <div key={r.id} className="flex items-center gap-2 text-xs">
                  <div className="w-6 h-0.5 shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="font-mono text-[10px]">{r.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex-1 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-serif">{t('supplyDemandCurve')}</CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="h-72 flex items-center justify-center text-muted-foreground text-sm">
                {t('adjustAndRunWage')}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <LineChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="L" type="number" domain={[0, 'auto']}
                    label={{ value: t('employment'), position: 'insideBottom', offset: -5, style: { fontFamily: 'serif', fontSize: 12 } }}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    label={{ value: t('wage'), angle: -90, position: 'insideLeft', style: { fontFamily: 'serif', fontSize: 12 } }}
                  />
                  <Tooltip formatter={(value: number, name: string) => [value.toFixed(2), name]} />

                  {results.map(r => (
                    <React.Fragment key={r.id}>
                      <Line
                        data={r.demandCurve}
                        dataKey="w"
                        stroke={r.color}
                        strokeWidth={2}
                        dot={false}
                        name={`${t('demand')} (${r.label})`}
                        connectNulls
                      />
                      <Line
                        data={r.supplyCurve}
                        dataKey="w"
                        stroke={r.color}
                        strokeWidth={2}
                        strokeOpacity={0.6}
                        dot={false}
                        name={`${t('supply')} (${r.label})`}
                        connectNulls
                      />
                    </React.Fragment>
                  ))}

                  {latestResult && (
                    <>
                      <ReferenceLine
                        y={latestResult.equilibriumWage}
                        stroke="hsl(var(--muted-foreground))"
                        strokeDasharray="4 4"
                        strokeOpacity={0.4}
                      >
                        <Label
                          value={`w*=${latestResult.equilibriumWage.toFixed(1)}`}
                          position="right"
                          style={{ fontSize: 10, fontFamily: 'serif' }}
                        />
                      </ReferenceLine>

                      {latestResult.params.minimumWage > latestResult.equilibriumWage && (
                        <>
                          <ReferenceLine
                            y={latestResult.params.minimumWage}
                            stroke="hsl(0, 70%, 50%)"
                            strokeWidth={2}
                            strokeDasharray="6 3"
                          >
                            <Label
                              value={`${t('minWageLine')} w̄=${latestResult.params.minimumWage}`}
                              position="right"
                              style={{ fontSize: 10, fontFamily: 'serif', fill: 'hsl(0, 70%, 50%)' }}
                            />
                          </ReferenceLine>
                          <ReferenceArea
                            x1={latestResult.minWageEmployment}
                            x2={latestResult.minWageLaborSupply}
                            y1={latestResult.params.minimumWage - 1}
                            y2={latestResult.params.minimumWage + 1}
                            fill="hsl(0, 70%, 50%)"
                            fillOpacity={0.1}
                            label={{
                              value: `${t('unemploymentLabel')}: ${latestResult.unemployment.toFixed(0)}`,
                              position: 'center',
                              style: { fontSize: 10, fontFamily: 'serif', fill: 'hsl(0, 70%, 50%)' },
                            }}
                          />
                        </>
                      )}
                    </>
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {latestResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground font-serif">{t('equilibriumWage')}</p>
                <p className="text-xl font-mono font-bold">{latestResult.equilibriumWage.toFixed(2)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground font-serif">{t('equilibriumEmployment')}</p>
                <p className="text-xl font-mono font-bold">{latestResult.equilibriumEmployment.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground font-serif">{t('unemployment')}</p>
                <p className="text-xl font-mono font-bold text-destructive">{latestResult.unemployment.toFixed(0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground font-serif">{t('dwl')}</p>
                <p className="text-xl font-mono font-bold">{latestResult.deadweightLoss.toFixed(1)}</p>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground font-serif">{t('minWageEmployment')}</p>
                <p className="text-xl font-mono font-bold">{latestResult.minWageEmployment.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">
                  ({t('vsEquilibrium')} {latestResult.equilibriumEmployment > 0
                    ? ((1 - latestResult.minWageEmployment / latestResult.equilibriumEmployment) * 100).toFixed(1)
                    : 0}% {t('decrease')})
                </p>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardContent className="pt-4 pb-3 text-center">
                <p className="text-xs text-muted-foreground font-serif">{t('wageIncrease')}</p>
                <p className={`text-xl font-mono font-bold ${latestResult.wageIncrease > 0 ? 'text-green-600' : ''}`}>
                  {latestResult.wageIncrease > 0 ? '+' : ''}{latestResult.wageIncrease.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">({t('vsEquilibrium')})</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
