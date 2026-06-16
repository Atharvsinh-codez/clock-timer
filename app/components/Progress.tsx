'use client';

import { useAnimate } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export type ProgressDirection = 'fill' | 'drain';

interface ProgressProps {
  /** seconds elapsed within the current cycle; caller clamps to [0, totalSeconds] */
  elapsedSeconds: number;
  /** full cycle length in seconds, [60, 86400] */
  totalSeconds: number;
  /** 'fill' = empty→full (clock, stopwatch), 'drain' = full→empty (timer) */
  direction?: ProgressDirection;
  /** number of cells across the bar */
  cells?: number;
}

const FULL = { bottom: 0, opacity: 1, rotate: '180deg' } as const;
const EMPTY = { bottom: '400px', opacity: 0, rotate: '90deg' } as const;

export const Progress = ({
  elapsedSeconds,
  totalSeconds,
  direction = 'fill',
  cells = 60,
}: ProgressProps) => {
  const divs = useMemo(() => new Array(cells).fill(null), [cells]);
  const [scope, animate] = useAnimate();
  const [width, setWidth] = useState(0);

  // Seconds represented by a single cell (always >= 1 for 1min..24hr over 60 cells).
  const secondsPerCell = totalSeconds / cells;

  // Which cell is currently changing, and how long until it completes.
  // `fill`: bar fills left→right.  `drain`: bar empties right→left.
  const { activeIndex, cellRemaining } = useMemo(() => {
    if (direction === 'drain') {
      const remaining = Math.max(0, Math.min(totalSeconds, totalSeconds - elapsedSeconds));
      const idx = Math.min(cells - 1, Math.floor(remaining / secondsPerCell));
      return { activeIndex: idx, cellRemaining: remaining - idx * secondsPerCell };
    }
    const e = Math.max(0, Math.min(totalSeconds, elapsedSeconds));
    const idx = Math.min(cells - 1, Math.floor(e / secondsPerCell));
    return { activeIndex: idx, cellRemaining: secondsPerCell - (e - idx * secondsPerCell) };
  }, [direction, elapsedSeconds, totalSeconds, secondsPerCell, cells]);

  // Keep the freshest cellRemaining without making it an effect dependency
  // (depending on it would restart the active cell's tween every tick).
  const cellRemainingRef = useRef(cellRemaining);
  cellRemainingRef.current = cellRemaining;

  useEffect(() => {
    const handleResize = () => setWidth((window.innerWidth ?? 0) / cells);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [cells]);

  useEffect(() => {
    if (!scope.current) return;
    // Cap the cascade so fast cycles (e.g. 1-min) don't queue delays longer than a tick.
    const staggerStep = Math.min(0.03, secondsPerCell / cells);
    const activeDuration = Math.max(0.1, cellRemainingRef.current);
    // Ultra-smooth easing curves for buttery animations
    const COME_EASE = [0.22, 1, 0.36, 1] as const; // gentle settle
    const GO_EASE = [0.33, 1, 0.68, 1] as const; // ultra-smooth fluid exit
    const GO_DURATION = 0.8; // slower, more elegant

    [...scope.current.children].forEach((child, index) => {
      if (direction === 'drain') {
        if (index < activeIndex) {
          animate(child, FULL, { duration: 0.9, delay: (cells - 1 - index) * staggerStep, ease: COME_EASE });
        } else if (index === activeIndex) {
          // Active cell is leaving (drain) — smooth now, paced to time slice.
          animate(child, EMPTY, { duration: Math.min(GO_DURATION, activeDuration), ease: GO_EASE });
        } else {
          animate(child, EMPTY, { duration: GO_DURATION, delay: (cells - 1 - index) * staggerStep, ease: GO_EASE });
        }
      } else {
        if (index < activeIndex) {
          animate(child, FULL, { duration: 0.9, delay: index * staggerStep, ease: COME_EASE });
        } else if (index === activeIndex) {
          // Active cell is arriving (fill) — slow, paced to its real time slice.
          animate(child, FULL, { duration: activeDuration, ease: COME_EASE });
        } else {
          animate(child, EMPTY, { duration: GO_DURATION, delay: (cells - index) * staggerStep, ease: GO_EASE });
        }
      }
    });
    // cellRemaining intentionally excluded — read via ref so the active tween is not restarted each tick.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, direction, totalSeconds, width, cells]);

  return (
    <div className="w-full flex fixed bottom-0 bg-emerald-900" style={{ height: `${width}px` }} ref={scope}>
      {divs.map((_, index) => (
        <div
          key={index}
          className="bg-emerald-400 border-emerald-400 border-1"
          style={{
            position: 'absolute',
            width: `${width}px`,
            height: `${width}px`,
            bottom: '400px',
            opacity: 0,
            boxSizing: 'content-box',
            left: `${index * width}px`,
          }}
        />
      ))}
    </div>
  )
}
