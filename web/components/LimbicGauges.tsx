'use client';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
}

interface LimbicGaugesProps {
  state: LimbicState;
}

export function LimbicGauges({ state }: LimbicGaugesProps) {
  const gauges = [
    {
      label: 'Trust',
      value: state.trust,
      color: 'from-primary to-accent',
      ariaLabel: `Trust level: ${(state.trust * 100).toFixed(0)}%`,
    },
    {
      label: 'Warmth',
      value: state.warmth,
      color: 'from-accent to-warning',
      ariaLabel: `Warmth level: ${(state.warmth * 100).toFixed(0)}%`,
    },
    {
      label: 'Energy',
      value: state.arousal,
      color: 'from-warning to-error',
      ariaLabel: `Energy level: ${(state.arousal * 100).toFixed(0)}%`,
    },
    {
      label: 'Mood',
      value: (state.valence + 1) / 2, // Map -1 to 1 range to 0 to 1
      color: 'from-info to-success',
      ariaLabel: `Mood level: ${(state.valence * 100).toFixed(0)}%`,
    },
  ];

  return (
    <div role="region" aria-label="Emotional state gauges">
      <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
        Emotional State
      </h3>
      
      <div className="space-y-4">
        {gauges.map((gauge) => (
          <div key={gauge.label} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300">{gauge.label}</span>
              <span className="text-xs text-gray-500 font-mono">
                {gauge.value.toFixed(2)}
              </span>
            </div>
            <div
              className="h-1.5 bg-gray-700 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={gauge.value * 100}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={gauge.ariaLabel}
            >
              <div
                className={`h-full bg-gradient-to-r ${gauge.color} transition-all duration-500`}
                style={{ width: `${gauge.value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-3 bg-gray-700/50 rounded-lg text-center">
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
          Current Mode
        </div>
        <div className="text-lg font-semibold text-accent-light">
          {state.posture || 'PEER'}
        </div>
      </div>
    </div>
  );
}

