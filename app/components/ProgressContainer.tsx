'use client';

import { useEffect, useState } from 'react';
import { Progress, type ProgressDirection } from './Progress';
import { useTimeStore, elapsedMs } from '../stores/timeStore';

const CELLS = 60;

/**
 * Feeds per-mode timing into the generalized progress bar.
 *
 * The clock face ticks once per second, but a short cycle (e.g. 10s) has cells
 * only ~0.17s wide — a 1s tick would jump several cells at once and make boxes
 * "fly in" together. So we sample time with requestAnimationFrame and only push
 * a new elapsed value the instant the active cell changes. The bar then fills
 * one cell at a time, each animating over its own slice.
 */
export const ProgressContainer = () => {
  const mode = useTimeStore((s) => s.mode);
  const clockCycleSeconds = useTimeStore((s) => s.clockCycleSeconds);
  const timerDurationSeconds = useTimeStore((s) => s.timerDurationSeconds);
  const stopwatchTargetSeconds = useTimeStore((s) => s.stopwatchTargetSeconds);
  const runningSince = useTimeStore((s) => s.runningSince);
  const accumulatedMs = useTimeStore((s) => s.accumulatedMs);

  const totalSeconds =
    mode === 'timer'
      ? timerDurationSeconds
      : mode === 'stopwatch'
        ? stopwatchTargetSeconds
        : clockCycleSeconds;
  const direction: ProgressDirection = mode === 'timer' ? 'drain' : 'fill';

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const secondsPerCell = totalSeconds / CELLS;

    const computeElapsed = () => {
      if (mode === 'clock') {
        const d = new Date();
        const wallSeconds =
          d.getHours() * 3600 +
          d.getMinutes() * 60 +
          d.getSeconds() +
          d.getMilliseconds() / 1000;
        return wallSeconds % totalSeconds;
      }
      return Math.min(totalSeconds, elapsedMs(runningSince, accumulatedMs, Date.now()) / 1000);
    };

    // Seed immediately so a mode/duration change snaps the bar right away.
    setElapsedSeconds(computeElapsed());

    // A paused timer/stopwatch never moves — no need to spin a rAF loop.
    if (mode !== 'clock' && runningSince === null) return;

    let raf = 0;
    let lastCell = -1;
    const tick = () => {
      const e = computeElapsed();
      const cell = Math.min(CELLS - 1, Math.floor(e / secondsPerCell));
      if (cell !== lastCell) {
        lastCell = cell;
        setElapsedSeconds(e);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, totalSeconds, runningSince, accumulatedMs]);

  return (
    <Progress elapsedSeconds={elapsedSeconds} totalSeconds={totalSeconds} direction={direction} />
  );
};
