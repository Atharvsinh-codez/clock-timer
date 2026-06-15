import { create } from 'zustand'

export type Mode = 'clock' | 'timer' | 'stopwatch';

export const MIN_DURATION = 60;        // 1 minute
export const MAX_DURATION = 24 * 3600; // 24 hours

const clampDuration = (seconds: number) =>
  Math.max(MIN_DURATION, Math.min(MAX_DURATION, Math.round(seconds)));

interface TimeStore {
  time: Date;
  hour: number;
  minute: number;
  second: number;
  setTime: (time: Date) => void;

  mode: Mode;
  setMode: (mode: Mode) => void;

  // user config, all in seconds, clamped [MIN_DURATION, MAX_DURATION]
  clockCycleSeconds: number;
  timerDurationSeconds: number;
  stopwatchTargetSeconds: number;
  setClockCycleSeconds: (seconds: number) => void;
  setTimerDurationSeconds: (seconds: number) => void;
  setStopwatchTargetSeconds: (seconds: number) => void;

  // run state for timer / stopwatch
  runningSince: number | null; // epoch ms when (re)started, null when paused/stopped
  accumulatedMs: number;       // elapsed ms banked across pauses
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export const useTimeStore = create<TimeStore>((set) => {
  const time = new Date();

  return {
    time,
    hour: time.getHours(),
    minute: time.getMinutes(),
    second: time.getSeconds(),

    setTime: (newTime: Date) => set({
      time: newTime,
      hour: newTime.getHours(),
      minute: newTime.getMinutes(),
      second: newTime.getSeconds(),
    }),

    mode: 'clock',
    setMode: (mode) => set({ mode, runningSince: null, accumulatedMs: 0 }),

    clockCycleSeconds: 3600,
    timerDurationSeconds: 300,
    stopwatchTargetSeconds: 300,
    setClockCycleSeconds: (seconds) => set({ clockCycleSeconds: clampDuration(seconds) }),
    setTimerDurationSeconds: (seconds) =>
      set({ timerDurationSeconds: clampDuration(seconds), runningSince: null, accumulatedMs: 0 }),
    setStopwatchTargetSeconds: (seconds) =>
      set({ stopwatchTargetSeconds: clampDuration(seconds), runningSince: null, accumulatedMs: 0 }),

    runningSince: null,
    accumulatedMs: 0,
    start: () => set((state) =>
      state.runningSince !== null ? state : { runningSince: Date.now() }),
    pause: () => set((state) =>
      state.runningSince === null
        ? state
        : {
            runningSince: null,
            accumulatedMs: state.accumulatedMs + (Date.now() - state.runningSince),
          }),
    reset: () => set({ runningSince: null, accumulatedMs: 0 }),
  };
});

/** Elapsed milliseconds for timer/stopwatch given run-state. */
export const elapsedMs = (runningSince: number | null, accumulatedMs: number, now: number) =>
  accumulatedMs + (runningSince !== null ? now - runningSince : 0);
