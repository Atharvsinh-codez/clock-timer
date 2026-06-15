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
            className="glass flex items-center gap-1 rounded-full p-1.5"
          >
            {MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setMode(key); setOpen(false); }}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                  mode === key
                    ? 'btn-accent text-black'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
