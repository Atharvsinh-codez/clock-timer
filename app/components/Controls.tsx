'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Magnet from './Magnet';
import { DurationModal } from './DurationModal';
import {
  CLOCK_CYCLE_MIN_DURATION,
  STOPWATCH_MIN_DURATION,
  TIMER_MIN_DURATION,
  useTimeStore,
} from '../stores/timeStore';

/** Bottom-left controls: clock-cycle editor, or timer/stopwatch transport + duration setup. */
export const Controls = () => {
  // Subscribe to fields individually so the per-second clock tick (which updates
  // `time`/`second`) does not re-render this component unnecessarily.
  const mode = useTimeStore((s) => s.mode);
  const clockCycleSeconds = useTimeStore((s) => s.clockCycleSeconds);
  const setClockCycleSeconds = useTimeStore((s) => s.setClockCycleSeconds);
  const timerDurationSeconds = useTimeStore((s) => s.timerDurationSeconds);
  const setTimerDurationSeconds = useTimeStore((s) => s.setTimerDurationSeconds);
  const stopwatchTargetSeconds = useTimeStore((s) => s.stopwatchTargetSeconds);
  const setStopwatchTargetSeconds = useTimeStore((s) => s.setStopwatchTargetSeconds);
  const runningSince = useTimeStore((s) => s.runningSince);
  const accumulatedMs = useTimeStore((s) => s.accumulatedMs);
  const start = useTimeStore((s) => s.start);
  const pause = useTimeStore((s) => s.pause);
  const reset = useTimeStore((s) => s.reset);

  const [editOpen, setEditOpen] = useState(false);
  const running = runningSince !== null;
  const dirty = running || accumulatedMs > 0;

  // Clock mode: pencil to edit the cycle length.
  if (mode === 'clock') {
    return (
      <>
        <button
          onClick={() => setEditOpen(true)}
          aria-label="Edit clock cycle"
          className="absolute bottom-6 left-6 z-30"
        >
          <Magnet magnetStrength={10}>
            <motion.div whileHover={{ scale: 1.4 }} whileTap={{ scale: 0.9 }}>
              <Image src="./edit.svg" width={22} height={22} alt="edit" />
            </motion.div>
          </Magnet>
        </button>
        <DurationModal
          open={editOpen}
          title="Bar Cycle"
          initialSeconds={clockCycleSeconds}
          minSeconds={CLOCK_CYCLE_MIN_DURATION}
          maxHours={24}
          onClose={() => setEditOpen(false)}
          onSave={setClockCycleSeconds}
        />
      </>
    );
  }

  // Timer / Stopwatch: duration setup + transport buttons.
  const isTimer = mode === 'timer';
  const setupSeconds = isTimer ? timerDurationSeconds : stopwatchTargetSeconds;
  const setSetup = isTimer ? setTimerDurationSeconds : setStopwatchTargetSeconds;

  return (
    <>
      <div className="absolute bottom-16 left-1/2 z-30 flex -translate-x-1/2 flex-nowrap items-center gap-2 sm:bottom-10 sm:gap-3">
        <AnimatePresence mode="popLayout">
          {!running ? (
            <motion.button
              key="start"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.92 }}
              onClick={start}
              className="btn-accent shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm text-black transition-[filter] duration-200 hover:brightness-110 sm:px-7"
            >
              {dirty ? 'Resume' : 'Start'}
            </motion.button>
          ) : (
            <motion.button
              key="pause"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.92 }}
              onClick={pause}
              className="btn-glass shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm text-white transition-[filter] duration-200 hover:brightness-125 sm:px-7"
            >
              Pause
            </motion.button>
          )}

          {dirty && (
            <motion.button
              key="reset"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.92 }}
              onClick={reset}
              className="btn-glass shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm text-white/75 transition-[filter] duration-200 hover:brightness-125 sm:px-7"
            >
              Reset
            </motion.button>
          )}

          {!dirty && (
            <motion.button
              key="edit"
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setEditOpen(true)}
              className="btn-glass shrink-0 whitespace-nowrap rounded-full px-5 py-2.5 text-sm text-white/75 transition-[filter] duration-200 hover:brightness-125 sm:px-7"
            >
              Set duration
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <DurationModal
        open={editOpen}
        title={isTimer ? 'Timer Duration' : 'Stopwatch Target'}
        initialSeconds={setupSeconds}
        minSeconds={isTimer ? TIMER_MIN_DURATION : STOPWATCH_MIN_DURATION}
        onClose={() => setEditOpen(false)}
        onSave={setSetup}
      />
    </>
  );
};
