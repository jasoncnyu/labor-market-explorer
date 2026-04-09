import React from 'react';

interface FormulaDisplayProps {
  children: React.ReactNode;
  className?: string;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ children, className = '' }) => (
  <span className={`font-serif italic text-foreground ${className}`}>
    {children}
  </span>
);

// Common formulas as components
export const SteadyStateFormula: React.FC<{ value?: number }> = ({ value }) => (
  <div className="flex items-center gap-2 font-serif text-base">
    <span className="italic">u</span>
    <sup>*</sup>
    <span>=</span>
    <span className="inline-flex flex-col items-center">
      <span className="border-b border-foreground px-1 italic">s</span>
      <span className="px-1 italic">s + f</span>
    </span>
    {value !== undefined && (
      <>
        <span className="ml-2">=</span>
        <span className="ml-1 font-mono not-italic">{(value * 100).toFixed(2)}%</span>
      </>
    )}
  </div>
);

export const EquilibriumFormula: React.FC<{ wStar?: number; lStar?: number }> = ({ wStar, lStar }) => (
  <div className="flex flex-col gap-1 font-serif text-sm">
    <div className="flex items-center gap-1">
      <span className="italic">w</span><sup>*</sup>
      <span>=</span>
      <span className="inline-flex flex-col items-center">
        <span className="border-b border-foreground px-1 italic">ε<sub>d</sub> · a<sub>d</sub> + ε<sub>s</sub> · a<sub>s</sub></span>
        <span className="px-1 italic">ε<sub>d</sub> + ε<sub>s</sub></span>
      </span>
      {wStar !== undefined && (
        <>
          <span className="ml-2">=</span>
          <span className="ml-1 font-mono not-italic">{wStar.toFixed(2)}</span>
        </>
      )}
    </div>
  </div>
);
