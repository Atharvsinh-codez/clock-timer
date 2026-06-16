'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Magnet from './Magnet';
import { useTimeStore, type Mode } from '../stores/timeStore';

const MODES: { key: Mode; label: string }[] = [
  { key: 'clock', label: 'Clock' },
  { key: 'timer', label: 'Timer' },
  { key: 'stopwatch', label: 'Stopwatch' },
];

export const ModeSwitcher = () => {
  const [open, setOpen] = useState(false);
  const mode = useTimeStore((s) => s.mode);
  const setMode = useTimeStore((s) => s.setMode);
  const theaterMode = useTimeStore((s) => s.theaterMode);
  const setTheaterMode = useTimeStore((s) => s.setTheaterMode);

  return (
    <div className="absolute top-4 left-4 z-30 flex items-center gap-3">
      <button onClick={() => setOpen((o) => !o)} aria-label="Switch mode">
        <Magnet magnetStrength={10}>
          <motion.div whileHover={{ scale: 1.4 }} whileTap={{ scale: 0.9 }} animate={{ rotate: open ? 90 : 0 }}>
            <Image src="./menu.svg" width={24} height={24} alt="menu" />
          </motion.div>
        </Magnet>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="glass flex flex-col gap-1.5 rounded-2xl p-1.5"
          >
            {/* Row 1: Clock, Timer, Theater */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setMode('clock'); setOpen(false); }}
                className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 active:scale-95 ${
                  mode === 'clock'
                    ? 'btn-accent text-black'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                Clock
              </button>

              <button
                onClick={() => { setMode('timer'); setOpen(false); }}
                className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 active:scale-95 ${
                  mode === 'timer'
                    ? 'btn-accent text-black'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                Timer
              </button>

              <div className="relative">
                <button
                  onClick={() => { setTheaterMode(!theaterMode); setOpen(false); }}
                  className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 active:scale-95 ${
                    theaterMode
                      ? 'btn-accent text-black'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Theater
                </button>
                {/* Green dot indicator - only shown when Theater mode is ON */}
                {theaterMode && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></div>
                )}
              </div>
            </div>

            {/* Row 2: Stopwatch (bigger) */}
            <button
              onClick={() => { setMode('stopwatch'); setOpen(false); }}
              className={`rounded-full px-6 py-2 text-base transition-all duration-200 active:scale-95 ${
                mode === 'stopwatch'
                  ? 'btn-accent text-black'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              Stopwatch
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
