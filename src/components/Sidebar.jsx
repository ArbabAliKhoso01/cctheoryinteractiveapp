import React from 'react';
import {
  Layers,
  Cpu,
  FileCode2,
  ListTree,
  Binary,
  GitBranch,
  AlertOctagon,
  CheckCircle,
  FileSpreadsheet,
  Zap,
  Sliders,
  HelpCircle,
  Award
} from 'lucide-react';

export const PHASES = [
  { id: 0, title: 'Overview', icon: Award, color: '#94A3B8', tag: 'Start' },
  { id: 1, title: 'Compiler Pipeline', icon: Layers, color: '#94A3B8', tag: 'Architecture' },
  { id: 2, title: 'Language Design', icon: Cpu, color: '#94A3B8', tag: 'DSL Spec' },
  { id: 3, title: 'CFG & Derivation', icon: ListTree, color: '#A78BFA', tag: 'Grammar' },
  { id: 4, title: 'Lexical Analysis', icon: Binary, color: '#22D3EE', tag: 'Scanner' },
  { id: 5, title: 'Syntax Analysis (CLR)', icon: GitBranch, color: '#8B5CF6', tag: 'CLR(1)' },
  { id: 6, title: 'Error Detection', icon: AlertOctagon, color: '#F87171', tag: 'Diagnostics' },
  { id: 7, title: 'Semantic Analysis', icon: CheckCircle, color: '#F472B6', tag: 'Validation' },
  { id: 8, title: 'Intermediate Code', icon: FileSpreadsheet, color: '#FBBF24', tag: 'TAC (IR)' },
  { id: 9, title: 'Optimizer & Target', icon: Zap, color: '#34D399', tag: 'iptables' },
  { id: 10, title: 'Integrated Study', icon: Sliders, color: '#8B5CF6', tag: 'Timeline' },
  { id: 11, title: 'Critical Analysis', icon: HelpCircle, color: '#A78BFA', tag: 'What-If ICMP' },
  { id: 12, title: 'Summary & Defense', icon: Award, color: '#34D399', tag: 'Conclusion' }
];

export default function Sidebar({ currentPhase, onSelectPhase }) {
  return (
    <aside className="sidebar" style={{
      width: '280px',
      background: 'var(--bg-panel)',
      borderRight: '1px solid var(--border-color)',
      height: 'calc(100vh - 68px)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      gap: '4px',
      userSelect: 'none'
    }}>
      <div style={{
        padding: '0 8px 12px 8px',
        fontSize: '12px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'var(--text-dim)'
      }}>
        Compiler Phases
      </div>

      {PHASES.map((phase) => {
        const Icon = phase.icon;
        const isActive = currentPhase === phase.id;

        return (
          <button
            key={phase.id}
            onClick={() => onSelectPhase(phase.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '8px',
              background: isActive ? 'var(--bg-card)' : 'transparent',
              border: isActive ? `1.5px solid ${phase.color}` : '1.5px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
              color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            className={isActive ? 'glow-active' : ''}
          >
            {/* Color Accent Indicator */}
            <div style={{
              width: '4px',
              height: '24px',
              borderRadius: '2px',
              background: phase.color,
              opacity: isActive ? 1 : 0.4
            }} />

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: isActive ? `${phase.color}20` : 'var(--bg-card)',
              color: phase.color
            }}>
              <Icon size={16} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '14.5px',
                fontWeight: isActive ? 700 : 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {phase.id}. {phase.title}
              </div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                {phase.tag}
              </div>
            </div>

            {isActive && (
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: phase.color,
                boxShadow: `0 0 6px ${phase.color}`
              }} />
            )}
          </button>
        );
      })}
    </aside>
  );
}

