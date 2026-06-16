'use client';

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Controls } from "./components/Controls";
import Magnet from "./components/Magnet";
import { ModeSwitcher } from "./components/ModeSwitcher";
import { ProgressContainer } from "./components/ProgressContainer";
import { useTimeStore } from "./stores/timeStore";
import { Time } from "./Time";
import { formatTitle } from "./utils/title";
import { useModeTiming } from "./hooks/useTiming";

export default function Home() {
  const mode = useTimeStore(store => store.mode);
  const setTime = useTimeStore(store => store.setTime);
  const theaterMode = useTimeStore(store => store.theaterMode);
  const setTheaterMode = useTimeStore(store => store.setTheaterMode);
  const [menuHovered, setMenuHovered] = useState(false);
  const { elapsedSeconds, totalSeconds, display } = useModeTiming();

  // Clock tick & title update
  useEffect(() => {
    const interval = setInterval(() => {
      const time = new Date();
      setTime(time);

      // Format title based on mode
      if (mode === 'clock') {
        document.title = formatTitle(time);
      } else if (mode === 'timer') {
        const percentage = Math.round(((totalSeconds - elapsedSeconds) / totalSeconds) * 100);
        const { hour, minute, second } = display;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
        document.title = `Timer: ${timeStr} • ${percentage}%`;
      } else {
        // stopwatch
        const percentage = Math.round((elapsedSeconds / totalSeconds) * 100);
        const { hour, minute, second } = display;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
        document.title = `Stopwatch: ${timeStr} • ${percentage}%`;
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [setTime, mode, elapsedSeconds, totalSeconds, display]);

  // Fullscreen API: enter/exit when theater mode toggles
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn('Fullscreen not supported or denied', err);
      }
    };
    const exitFullscreen = async () => {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.warn('Exit fullscreen failed', err);
        }
      }
    };

    if (theaterMode) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  }, [theaterMode]);

  // Sync theater mode when user exits fullscreen via ESC
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && theaterMode) {
        setTheaterMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [theaterMode, setTheaterMode]);

  // "T" key shortcut to toggle theater
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 't' || e.key === 'T') {
        // Ignore if user is typing in an input
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        setTheaterMode(!theaterMode);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theaterMode, setTheaterMode]);

  // Double-tap to toggle theater mode on mobile/tablet
  useEffect(() => {
    let lastTap = 0;
    const doubleTapDelay = 300; // ms between taps to count as double-tap

    const handleTouchEnd = (e: TouchEvent) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;

      if (tapLength < doubleTapDelay && tapLength > 0) {
        // Double tap detected
        e.preventDefault();
        setTheaterMode(!theaterMode);
      }
      lastTap = currentTime;
    };

    document.addEventListener('touchend', handleTouchEnd);
    return () => document.removeEventListener('touchend', handleTouchEnd);
  }, [theaterMode, setTheaterMode]);

  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] w-[100dvw] bg-black text-white">
      {/* ModeSwitcher: in theater mode, only visible on hover at top-left */}
      {/* Outer hover zone - always active to detect hover */}
      <div
        onMouseEnter={() => setMenuHovered(true)}
        onMouseLeave={() => setMenuHovered(false)}
        className="absolute top-0 left-0 w-64 h-32 z-30"
        style={{ pointerEvents: 'auto' }}
      >
        {/* Inner menu with opacity transition */}
        <div
          className={`p-4 transition-opacity duration-300 ${
            theaterMode && !menuHovered ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <ModeSwitcher />
        </div>
      </div>

      <Time />
      <ProgressContainer />

      {/* Controls: hidden in theater mode */}
      {!theaterMode && <Controls />}

      {/* X logo: hidden in theater mode */}
      {!theaterMode && (
        <a href="https://x.com/athrix_codes" target="_blank" className="absolute top-4 right-4 z-30">
          <Magnet magnetStrength={10}>
            <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
              <Image src="./x.svg" width="24" height="24" alt="X"/>
            </motion.div>
          </Magnet>
        </a>
      )}
    </div>
  );
}
