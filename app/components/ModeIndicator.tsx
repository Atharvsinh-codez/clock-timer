'use client';

import { useTimeStore } from '../stores/timeStore';
import { useModeTiming } from '../hooks/useTiming';

export const ModeIndicator = () => {
  const mode = useTimeStore((s) => s.mode);
  const { elapsedSeconds, totalSeconds } = useModeTiming();

  // Only show for timer/stopwatch
  if (mode === 'clock') return null;

  // Calculate percentage
  const percentage = mode === 'timer'
    ? Math.round(((totalSeconds - elapsedSeconds) / totalSeconds) * 100)
    : Math.round((elapsedSeconds / totalSeconds) * 100);

  const modeName = mode === 'timer' ? 'Timer' : 'Stopwatch';

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
      <div className="glass rounded-full px-6 py-2">
        <span className="text-sm font-medium text-white/90">
          {modeName} <span className="text-emerald-400 font-semibold">{percentage}%</span>
        </span>
      </div>
    </div>
  );
};
