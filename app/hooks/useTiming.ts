'use client';

import { useTimeStore, elapsedMs } from '../stores/timeStore';
import type { ProgressDirection } from '../components/Progress';

export interface ModeTiming {
  /** seconds elapsed within the current cycle, clamped to [0, totalSeconds] */
  elapsedSeconds: number;
  /** full cycle length in seconds */
  totalSeconds: number;
  /** how the progress bar should move */
  direction: ProgressDirection;
  /** the hh:mm:ss to show on the digits for this mode */
  display: { hour: number; minute: number; second: number };
  /** whether the timer/stopwatch is actively running */
  running: boolean;
}

const toHms = (totalSeconds: number) => {
  const s = Math.max(0, Math.floor(totalSeconds));
  return {
    hour: Math.floor(s / 3600),
    minute: Math.floor((s % 3600) / 60),
    second: s % 60,
  };
};

/** Derives the per-mode timing the clock face and progress bar need. */
export const useModeTiming = (): ModeTiming => {
  const {
    mode, hour, minute, second,
    clockCycleSeconds, timerDurationSeconds, stopwatchTargetSeconds,
    runningSince, accumulatedMs,
  } = useTimeStore();

  if (mode === 'clock') {
    const wallSeconds = hour * 3600 + minute * 60 + second;
    const elapsedSeconds = wallSeconds % clockCycleSeconds;
    return {
      elapsedSeconds,
      totalSeconds: clockCycleSeconds,
      direction: 'fill',
      display: { hour, minute, second },
      running: true,
    };
  }

  // Read the real wall clock — NOT the per-second store `time`, which can lag
  // behind `runningSince` (set via Date.now()) when the tab is throttled, and
  // would make elapsed go negative. The `second` subscription above still drives
  // the per-second re-render cadence. Math.max(0, …) guards the first frame.
  const now = Date.now();
  const running = runningSince !== null;

  if (mode === 'timer') {
    const total = timerDurationSeconds;
    const elapsed = Math.max(0, Math.min(total, elapsedMs(runningSince, accumulatedMs, now) / 1000));
    return {
      elapsedSeconds: elapsed,
      totalSeconds: total,
      direction: 'drain',
      display: toHms(total - elapsed),
      running,
    };
  }

  // stopwatch
  const total = stopwatchTargetSeconds;
  const elapsed = Math.max(0, Math.min(total, elapsedMs(runningSince, accumulatedMs, now) / 1000));
  return {
    elapsedSeconds: elapsed,
    totalSeconds: total,
    direction: 'fill',
    display: toHms(elapsed),
    running,
  };
};
