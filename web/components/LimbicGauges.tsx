'use client';

interface LimbicState {
  trust: number;
  warmth: number;
  arousal: number;
  valence: number;
  posture: string;
  empathy?: number;
  intuition?: number;
  creativity?: number;
  wisdom?: number;
  humor?: number;
}

interface LimbicGaugesProps {
  state: LimbicState;
}

export function LimbicGauges({ state }: LimbicGaugesProps) {
  const gauges = [
    {
      label: 'Trust',
      value: state.trust,
      color: 'from-violet-500 to-purple-600',
      ariaLabel: `Trust level: ${(state.trust * 100).toFixed(0)}%`,
    },
    {
      label: 'Warmth',
      value: state.warmth,
      color: 'from-cyan-500 to-blue-600',
      ariaLabel: `Warmth level: ${(state.warmth * 100).toFixed(0)}%`,
    },
    {
      label: 'Energy',
      value: state.arousal,
      color: 'from-amber-500 to-orange-600',
      ariaLabel: `Energy level: ${(state.arousal * 100).toFixed(0)}%`,
    },
    {
      label: 'Mood',
      value: (state.valence + 1) / 2, // Map -1 to 1 range to 0 to 1
      color: 'from-emerald-500 to-green-600',
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
        <div className="text-lg font-semibold text-violet-400">
          {state.posture || 'PEER'}
        </div>
      </div>
      
      {/* Extended Variables */}
      {(state.empathy !== undefined || state.intuition !== undefined || state.creativity !== undefined || state.wisdom !== undefined || state.humor !== undefined) && (
        <div className="mt-6 p-3 bg-gray-700/50 rounded-lg">
          <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            Advanced Capabilities
          </div>
          <div className="space-y-2">
            {state.empathy !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Empathy</span>
                <span className="text-xs text-gray-500 font-mono">
                  {state.empathy.toFixed(2)}
                </span>
              </div>
            )}
            {state.intuition !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Intuition</span>
                <span className="text-xs text-gray-500 font-mono">
                  {state.intuition.toFixed(2)}
                </span>
              </div>
            )}
            {state.creativity !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Creativity</span>
                <span className="text-xs text-gray-500 font-mono">
                  {state.creativity.toFixed(2)}
                </span>
              </div>
            )}
            {state.wisdom !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Wisdom</span>
                <span className="text-xs text-gray-500 font-mono">
                  {state.wisdom.toFixed(2)}
                </span>
              </div>
            )}
            {state.humor !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Humor</span>
                <span className="text-xs text-gray-500 font-mono">
                  {state.humor.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

