'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

const ITEM_HEIGHT = 44;
const VISIBLE = 5;            // odd → clear center row
const PAD = (VISIBLE - 1) / 2;

interface WheelProps {
  label: string;
  max: number; // inclusive max value
  value: number;
  onChange: (value: number) => void;
}

const Wheel = ({ label, max, value, onChange }: WheelProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);
  valueRef.current = value;
  const items = Array.from({ length: max + 1 }, (_, i) => i);

  // iOS "drum" look: each row tilts back on X and fades with distance from the centre.
  // No forward translateZ — pushing rows toward the viewer makes them grow and overlap.
  const paint = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const viewportCenter = el.scrollTop + (ITEM_HEIGHT * VISIBLE) / 2;
    for (const child of Array.from(el.children) as HTMLElement[]) {
      if (!child.dataset.row) continue;
      const rowCenter = child.offsetTop + ITEM_HEIGHT / 2;
      const dist = (rowCenter - viewportCenter) / ITEM_HEIGHT; // distance in rows
      const abs = Math.abs(dist);
      const rot = Math.max(-72, Math.min(72, dist * 24));
      const scale = Math.max(0.62, 1 - abs * 0.12);
      child.style.transform = `rotateX(${rot}deg) scale(${scale})`;
      child.style.opacity = `${Math.max(0.08, 1 - abs * 0.34)}`;
    }
  }, []);

  // Position the wheel on the current value (instantly) before paint — runs on mount + external change.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = value * ITEM_HEIGHT;
    if (Math.abs(el.scrollTop - target) > 1) el.scrollTop = target;
    paint();
  }, [value, paint]);

  const handleScroll = () => {
    paint();
    const el = ref.current;
    if (!el) return;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    // Debounced settle: once the user stops, snap to the nearest row and commit.
    settleTimer.current = setTimeout(() => {
      const idx = Math.max(0, Math.min(max, Math.round(el.scrollTop / ITEM_HEIGHT)));
      const snapTop = idx * ITEM_HEIGHT;
      if (Math.abs(el.scrollTop - snapTop) > 0.5) {
        el.scrollTo({ top: snapTop, behavior: 'smooth' });
      }
      if (idx !== valueRef.current) {
        valueRef.current = idx;
        onChange(idx);
      }
    }, 110);
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={ref}
        onScroll={handleScroll}
        className="no-scrollbar overflow-y-scroll relative select-none touch-pan-y"
        style={{
          height: ITEM_HEIGHT * VISIBLE,
          width: 72,
          perspective: 700,
          maskImage:
            'linear-gradient(to bottom, transparent, #000 26%, #000 74%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, #000 26%, #000 74%, transparent)',
        }}
      >
        <div style={{ height: ITEM_HEIGHT * PAD }} />
        {items.map((n) => (
          <button
            key={n}
            type="button"
            data-row="1"
            onClick={() => {
              if (n !== valueRef.current) {
                valueRef.current = n;
                onChange(n);
              }
              ref.current?.scrollTo({ top: n * ITEM_HEIGHT, behavior: 'smooth' });
            }}
            className="flex w-full items-center justify-center tabular-nums text-white"
            style={{
              height: ITEM_HEIGHT,
              fontSize: 30,
              lineHeight: `${ITEM_HEIGHT}px`,
              transformStyle: 'preserve-3d',
              willChange: 'transform, opacity',
            }}
          >
            {String(n).padStart(2, '0')}
          </button>
        ))}
        <div style={{ height: ITEM_HEIGHT * PAD }} />
      </div>
      <span className="mt-2 text-[11px] uppercase tracking-[0.2em] text-emerald-400/70">
        {label}
      </span>
    </div>
  );
};

interface DurationWheelsProps {
  /** initial total seconds — used only to position the wheels on mount */
  initialValue: number;
  /** reports the latest total seconds; does not need to feed back into `initialValue` */
  onChange: (totalSeconds: number) => void;
  /** show the seconds wheel (default true). Bar Cycle hides it — hr/min only. */
  showSeconds?: boolean;
}

export const DurationWheels = ({ initialValue, onChange, showSeconds = true }: DurationWheelsProps) => {
  // Uncontrolled: the wheels own their position. We keep h/m/s in refs and report
  // the combined total up on every change, without re-rendering this component.
  const hms = useRef({
    h: Math.floor(initialValue / 3600),
    m: Math.floor((initialValue % 3600) / 60),
    s: showSeconds ? initialValue % 60 : 0,
  });

  const emit = () => onChange(hms.current.h * 3600 + hms.current.m * 60 + hms.current.s);

  return (
    <div className="relative flex items-stretch justify-center gap-6 px-2">
      {/* centre selection — two thin hairlines, iOS style (no filled box) */}
      <div
        className="pointer-events-none absolute inset-x-0 z-10 border-y border-white/15"
        style={{ height: ITEM_HEIGHT, top: ITEM_HEIGHT * PAD }}
      />
      <Wheel label="hr" max={99} value={hms.current.h} onChange={(h) => { hms.current.h = h; emit(); }} />
      <Wheel label="min" max={59} value={hms.current.m} onChange={(m) => { hms.current.m = m; emit(); }} />
      {showSeconds && (
        <Wheel label="sec" max={59} value={hms.current.s} onChange={(s) => { hms.current.s = s; emit(); }} />
      )}
    </div>
  );
};
