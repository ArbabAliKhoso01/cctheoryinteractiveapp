import React from 'react';
import { ShieldCheck, Moon, Sun, Maximize2, Minimize2, BookOpen, Terminal, CheckCircle2 } from 'lucide-react';

export default function Navbar({
  currentPhase,
  totalPhases,
  theme,
  setTheme,
  presentationMode,
  setPresentationMode,
  onOpenGlossary,
  onToggleSandbox,
  isSandboxOpen
}) {
  return (
    <header className="navbar" style={{
      height: '68px',
      background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)'
        }}>
          NF
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 800, fontSize: '19px', letterSpacing: '-0.3px' }}>
              NFRC Compiler
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(52, 211, 153, 0.12)',
              color: '#34D399',
              border: '1px solid rgba(52, 211, 153, 0.3)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={13} />
              Verified (16 states • 0 conflicts • 34 steps)
            </span>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Network Firewall Rule Compiler — Theory & Construction
          </span>
        </div>
      </div>

      {/* Step Counter & Progress bar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '220px' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          Phase <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{currentPhase}</span> of {totalPhases - 1}
        </span>
        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--bg-card)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${(currentPhase / (totalPhases - 1)) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #FBBF24)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onToggleSandbox}
          className={`btn btn-sm ${isSandboxOpen ? 'btn-amber' : ''}`}
          title="Open Custom Firewall Rule Sandbox Drawer"
          style={{ gap: '6px' }}
        >
          <Terminal size={16} />
          <span>Sandbox</span>
        </button>

        <button
          onClick={onOpenGlossary}
          className="btn btn-sm"
          title="Open Compiler Glossary (Press G)"
        >
          <BookOpen size={16} />
          <span>Glossary [G]</span>
        </button>

        <button
          onClick={() => setPresentationMode(!presentationMode)}
          className="btn btn-sm"
          title="Toggle Fullscreen / Presentation Mode (Press F)"
        >
          {presentationMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          <span>{presentationMode ? 'Normal' : 'Presentation [F]'}</span>
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="btn btn-sm"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}

