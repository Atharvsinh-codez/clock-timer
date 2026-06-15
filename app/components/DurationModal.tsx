'use client';

import { useRef } from 'react';
import { DurationWheels } from './DurationWheels';
import { MIN_DURATION, MAX_DURATION } from '../stores/timeStore';

interface DurationModalProps {
  open: boolean;
  title: string;
  initialSeconds: number;
  onClose: () => void;
  onSave: (seconds: number) => void;
  /** show the seconds wheel (default true) */
  showSeconds?: boolean;
}

const clamp = (s: number) => Math.max(MIN_DURATION, Math.min(MAX_DURATION, s));

export const DurationModal = ({ open, title, initialSeconds, onClose, onSave, showSeconds = true }: DurationModalProps) => {
  // Draft lives in a ref — the wheels render their own value via scroll position,
  // so scrolling never re-renders this modal.
  const draftRef = useRef(initialSeconds);
  draftRef.current = initialSeconds;

  const handleSet = () => {
    onSave(clamp(draftRef.current));
    onClose();
  };

  // Always mounted; visibility driven by plain CSS transitions on `open`.
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md transition-opacity duration-300"
      style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-7 px-9 py-9 transition-all duration-300 ease-out"
        style={{
          transform: open ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.9)',
          opacity: open ? 1 : 0,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[13px] font-semibold tracking-[0.25em] text-white/70">{title}</h2>
        {/* Re-mount the wheels each time the modal opens so they re-seed to the stored value. */}
        {open && (
          <DurationWheels
            initialValue={initialSeconds}
            showSeconds={showSeconds}
            onChange={(v) => { draftRef.current = v; }}
          />
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-glass rounded-full px-7 py-2.5 text-sm font-medium text-white/80 transition-all duration-200 hover:text-white hover:brightness-125 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleSet}
            className="btn-accent rounded-full px-7 py-2.5 text-sm font-semibold text-black transition-all duration-200 hover:brightness-110 active:scale-95"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};
