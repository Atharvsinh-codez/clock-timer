'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Magnet from './Magnet';
import { useTimeStore, type Mode } from '../stores/timeStore';

const MODES: { key: Mode; label: string }[] = [
  { key: 'clock', label: 'Clock' },
  { key: 'timer', label: 'Timer' },
  { key: 'stopwatch', label: 'Stopwatch' },
];

export const ModeSwitcher = () => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const mode = useTimeStore((s) => s.mode);
  const setMode = useTimeStore((s) => s.setMode);
  const theaterMode = useTimeStore((s) => s.theaterMode);
  const setTheaterMode = useTimeStore((s) => s.setTheaterMode);

  const chooseMode = (nextMode: Mode) => {
    setOpen(false);
    setMode(nextMode);
  };

  const toggleTheaterMode = () => {
    setOpen(false);
    setTheaterMode(!theaterMode);
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (triggerRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className={open ? 'fixed inset-0 z-30' : 'absolute top-4 left-4 z-30'}>
      <AnimatePresence>
        {open && (
          <motion.button
            key="mode-menu-backdrop"
            type="button"
            aria-label="Close mode menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 z-20 cursor-default bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <div className={open ? 'absolute top-4 left-4 z-30 flex items-center gap-3' : 'flex items-center gap-3'}>
        <button
          ref={triggerRef}
          onClick={() => setOpen((o) => !o)}
          aria-label="Switch mode"
          className="relative z-30"
        >
          <Magnet magnetStrength={10}>
            <motion.div
              whileHover={{ scale: 1.4 }}
              whileTap={{ scale: 0.9 }}
              animate={{ rotate: open ? 90 : 0 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image src="./menu.svg" width={24} height={24} alt="menu" />
            </motion.div>
          </Magnet>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              key="mode-menu-panel"
              ref={panelRef}
              initial={{ opacity: 0, x: -18, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -12, scale: 0.98 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative z-30 flex flex-col gap-1.5 rounded-2xl p-1.5"
            >
              {/* Row 1: Clock, Timer, Theater */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => chooseMode('clock')}
                  className={`rounded-full px-4 py-1.5 text-sm transition-all duration-200 active:scale-95 ${
                    mode === 'clock'
                      ? 'btn-accent text-black'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Clock
                </button>

                <button
                  onClick={() => chooseMode('timer')}
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
                    onClick={toggleTheaterMode}
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
                onClick={() => chooseMode('stopwatch')}
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
    </div>
  );
};
