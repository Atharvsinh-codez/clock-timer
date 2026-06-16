import { create } from 'zustand'

export type Mode = 'clock' | 'timer' | 'stopwatch';

export const TIMER_MIN_DURATION = 60; // 1 minute
export const STOPWATCH_MIN_DURATION = 60; // 1 minute
export const CLOCK_CYCLE_MIN_DURATION = 10 * 60; // 10 minutes
export const MAX_DURATION = 99 * 3600 + 59 * 60 + 59; // 99:59:59, matching the wheels

const clampDuration = (seconds: number, minSeconds: number) =>
  Math.max(minSeconds, Math.min(MAX_DURATION, Math.round(seconds)));

interface TimeStore {
  time: Date;
  hour: number;
  minute: number;
  second: number;
  setTime: (time: Date) => void;

  mode: Mode;
  setMode: (mode: Mode) => void;

  // user config, all in seconds, clamped to each mode's allowed range
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

  // theater mode: fullscreen with all UI hidden except digits and menu on hover
  theaterMode: boolean;
  setTheaterMode: (enabled: boolean) => void;
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
    setClockCycleSeconds: (seconds) =>
      set({ clockCycleSeconds: clampDuration(seconds, CLOCK_CYCLE_MIN_DURATION) }),
    setTimerDurationSeconds: (seconds) =>
      set({
        timerDurationSeconds: clampDuration(seconds, TIMER_MIN_DURATION),
        runningSince: null,
        accumulatedMs: 0,
      }),
    setStopwatchTargetSeconds: (seconds) =>
      set({
        stopwatchTargetSeconds: clampDuration(seconds, STOPWATCH_MIN_DURATION),
        runningSince: null,
        accumulatedMs: 0,
      }),

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

    theaterMode: false,
    setTheaterMode: (enabled) => set({ theaterMode: enabled }),
  };
});

/** Elapsed milliseconds for timer/stopwatch given run-state. */
export const elapsedMs = (runningSince: number | null, accumulatedMs: number, now: number) =>
  accumulatedMs + (runningSince !== null ? now - runningSince : 0);
