import React from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw, FastForward } from 'lucide-react';

export default function ControlsBar({
  onPrev,
  onNext,
  canPrev,
  canNext,
  isPlaying,
  onTogglePlay,
  speed,
  onChangeSpeed,
  onReset,
  subStepLabel = null
}) {
  return (
    <footer className="controls-bar" style={{
      height: '62px',
      background: 'var(--bg-panel)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      userSelect: 'none'
    }}>
      {/* Left: Step navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="btn"
          style={{
            opacity: canPrev ? 1 : 0.4,
            cursor: canPrev ? 'pointer' : 'not-allowed'
          }}
          title="Previous Step [Left Arrow]"
        >
          <ChevronLeft size={18} />
          <span>Prev</span>
        </button>

        <button
          onClick={onNext}
          disabled={!canNext}
          className="btn btn-primary"
          style={{
            opacity: canNext ? 1 : 0.4,
            cursor: canNext ? 'pointer' : 'not-allowed'
          }}
          title="Next Step [Right Arrow]"
        >
          <span>Next</span>
          <ChevronRight size={18} />
        </button>

        {subStepLabel && (
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            background: 'var(--bg-card)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            {subStepLabel}
          </span>
        )}
      </div>

      {/* Middle: Play / Pause Auto-Advance & Speed */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onTogglePlay}
          className={`btn ${isPlaying ? 'btn-amber' : ''}`}
          title="Auto-advance play/pause [Space]"
        >
          {isPlaying ? <Pause size={17} /> : <Play size={17} />}
          <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FastForward size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Speed:</span>
          <input
            type="range"
            min="400"
            max="3000"
            step="200"
            value={3400 - speed}
            onChange={(e) => onChangeSpeed(3400 - Number(e.target.value))}
            style={{ width: '100px', cursor: 'pointer' }}
            title="Adjust auto-play animation speed"
          />
        </div>

        <button
          onClick={onReset}
          className="btn"
          title="Reset current phase to beginning"
        >
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>

      {/* Right: Keyboard shortcuts summary */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12.5px', color: 'var(--text-dim)' }}>
        <span>Keys:</span>
        <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>← / →</kbd>
        <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>Space</kbd>
        <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>F</kbd>
        <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>G</kbd>
      </div>
    </footer>
  );
}

