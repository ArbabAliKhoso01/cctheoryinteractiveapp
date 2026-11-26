import React, { useState } from 'react';
import { PRODUCTIONS, TERMINALS, NON_TERMINALS } from '../../compiler/grammar.js';
import { Play, RotateCcw, ListTree, CheckCircle } from 'lucide-react';

const DERIVATION_STEPS = [
  {
    step: 0,
    sentential: ['P'],
    activeNtIdx: 0,
    prodUsed: null,
    treeNodes: [
      { id: 'p', label: 'P', x: 250, y: 30, parent: null }
    ]
  },
  {
    step: 1,
    sentential: ['S'],
    activeNtIdx: 0,
    prodUsed: '(1) P -> S',
    treeNodes: [
      { id: 'p', label: 'P', x: 250, y: 30, parent: null },
      { id: 's', label: 'S', x: 250, y: 80, parent: 'p' }
    ]
  },
  {
    step: 2,
    sentential: ['R'],
    activeNtIdx: 0,
    prodUsed: '(3) S -> R',
    treeNodes: [
      { id: 'p', label: 'P', x: 250, y: 30, parent: null },
      { id: 's', label: 'S', x: 250, y: 80, parent: 'p' },
      { id: 'r', label: 'R', x: 250, y: 130, parent: 's' }
    ]
  },
  {
    step: 3,
    sentential: ['RULE', 'ID', 'COLON', 'ACTION', 'CONDITION', 'SEMICOLON'],
    activeNtIdx: 4, // CONDITION is at index 4
    prodUsed: '(4) R -> RULE ID COLON ACTION CONDITION SEMICOLON',
    treeNodes: [
      { id: 'p', label: 'P', x: 250, y: 30, parent: null },
      { id: 's', label: 'S', x: 250, y: 80, parent: 'p' },
      { id: 'r', label: 'R', x: 250, y: 130, parent: 's' },
      { id: 't_rule', label: 'RULE', x: 60, y: 190, parent: 'r', isTerminal: true },
      { id: 't_id', label: 'ID(R1)', x: 135, y: 190, parent: 'r', isTerminal: true },
      { id: 't_colon', label: ':', x: 210, y: 190, parent: 'r', isTerminal: true },
      { id: 't_act', label: 'ALLOW', x: 285, y: 190, parent: 'r', isTerminal: true },
      { id: 'cond', label: 'CONDITION', x: 375, y: 190, parent: 'r' },
      { id: 't_semi', label: ';', x: 460, y: 190, parent: 'r', isTerminal: true }
    ]
  },
  {
    step: 4,
    sentential: ['RULE', 'ID', 'COLON', 'ACTION', 'PROTOCOL', 'PORT', 'PORT_SPEC', 'SEMICOLON'],
    activeNtIdx: -1, // completed!
    prodUsed: '(5) CONDITION -> PROTOCOL PORT PORT_SPEC',
    treeNodes: [
      { id: 'p', label: 'P', x: 250, y: 30, parent: null },
      { id: 's', label: 'S', x: 250, y: 80, parent: 'p' },
      { id: 'r', label: 'R', x: 250, y: 130, parent: 's' },
      { id: 't_rule', label: 'RULE', x: 60, y: 190, parent: 'r', isTerminal: true },
      { id: 't_id', label: 'ID(R1)', x: 135, y: 190, parent: 'r', isTerminal: true },
      { id: 't_colon', label: ':', x: 210, y: 190, parent: 'r', isTerminal: true },
      { id: 't_act', label: 'ALLOW', x: 285, y: 190, parent: 'r', isTerminal: true },
      { id: 'cond', label: 'CONDITION', x: 375, y: 190, parent: 'r' },
      { id: 't_semi', label: ';', x: 460, y: 190, parent: 'r', isTerminal: true },
      { id: 't_proto', label: 'TCP', x: 320, y: 250, parent: 'cond', isTerminal: true },
      { id: 't_port', label: 'PORT', x: 375, y: 250, parent: 'cond', isTerminal: true },
      { id: 't_pspec', label: '443', x: 430, y: 250, parent: 'cond', isTerminal: true }
    ]
  }
];

export default function Phase3Grammar() {
  const [derivStep, setDerivStep] = useState(0);

  const curDeriv = DERIVATION_STEPS[derivStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Context-Free Grammar & Leftmost Derivation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Exact augmented grammar definition, symbol classifications, and interactive parse tree growth.
        </p>
      </div>

      {/* Symbol Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        <div className="card" style={{ flex: 1, minWidth: '220px', padding: '12px 16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>START SYMBOL</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#A78BFA' }}>P</div>
        </div>

        <div className="card" style={{ flex: 2, minWidth: '260px', padding: '12px 16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>NON-TERMINALS (V)</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
            {NON_TERMINALS.map(nt => (
              <span key={nt} style={{
                background: 'rgba(167, 139, 250, 0.15)',
                color: '#A78BFA',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700,
                fontSize: '13px',
                fontFamily: 'var(--font-mono)'
              }}>
                {nt}
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ flex: 3, minWidth: '320px', padding: '12px 16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>TERMINALS (Σ)</div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
            {TERMINALS.map(t => (
              <span key={t} style={{
                background: 'rgba(34, 211, 238, 0.15)',
                color: '#22D3EE',
                padding: '2px 7px',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '12.5px',
                fontFamily: 'var(--font-mono)'
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Productions Table */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>
          Numbered Augmented Grammar (§0.2 — 6 Productions + Augmentation)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)', fontSize: '13px' }}>
              <th style={{ padding: '8px' }}>#</th>
              <th style={{ padding: '8px' }}>LHS (Non-Terminal)</th>
              <th style={{ padding: '8px' }}>Arrow</th>
              <th style={{ padding: '8px' }}>RHS (Body)</th>
              <th style={{ padding: '8px' }}>Role / Semantic Purpose</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTIONS.map(p => (
              <tr key={p.id} style={{
                borderBottom: '1px solid var(--border-color)',
                background: p.id === 0 ? 'rgba(139, 92, 246, 0.05)' : 'transparent'
              }}>
                <td style={{ padding: '10px 8px', color: '#FBBF24', fontWeight: 700 }}>
                  ({p.id})
                </td>
                <td style={{ padding: '10px 8px', color: '#A78BFA', fontWeight: 700 }}>
                  {p.lhs}
                </td>
                <td style={{ padding: '10px 8px', color: 'var(--text-dim)' }}>→</td>
                <td style={{ padding: '10px 8px' }}>
                  {p.rhs.map((sym, i) => (
                    <span
                      key={i}
                      style={{
                        marginRight: '6px',
                        color: NON_TERMINALS.includes(sym) ? '#A78BFA' : '#22D3EE',
                        fontWeight: NON_TERMINALS.includes(sym) ? 700 : 500
                      }}
                    >
                      {sym}
                    </span>
                  ))}
                </td>
                <td style={{ padding: '10px 8px', fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-sans)' }}>
                  {p.id === 0 && 'Augmentation for unique acceptance state'}
                  {p.id === 1 && 'Program start symbol'}
                  {p.id === 2 && 'Left-recursive list expansion (S -> S R)'}
                  {p.id === 3 && 'Base case: single rule list'}
                  {p.id === 4 && 'Complete rule structure'}
                  {p.id === 5 && 'Port-based condition'}
                  {p.id === 6 && 'Source IP / CIDR-based condition'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Leftmost Derivation & SVG Parse Tree Growing */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
              Interactive Leftmost Derivation of Rule R1
            </h3>
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Target sentence: <code>RULE R1: ALLOW TCP PORT 443;</code>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setDerivStep(Math.min(DERIVATION_STEPS.length - 1, derivStep + 1))}
              disabled={derivStep === DERIVATION_STEPS.length - 1}
              className="btn btn-sm btn-primary"
              style={{
                opacity: derivStep === DERIVATION_STEPS.length - 1 ? 0.4 : 1,
                cursor: derivStep === DERIVATION_STEPS.length - 1 ? 'not-allowed' : 'pointer'
              }}
            >
              <Play size={14} />
              <span>Expand Next</span>
            </button>
            <button
              onClick={() => setDerivStep(0)}
              className="btn btn-sm"
              title="Reset derivation"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Current sentential form */}
        <div className="card" style={{ marginBottom: '16px', background: 'var(--bg-primary)' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Derivation Step {curDeriv.step} of 4: {curDeriv.prodUsed || 'Initial Form'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            {curDeriv.sentential.map((sym, idx) => {
              const isTargetNt = idx === curDeriv.activeNtIdx;
              const isNt = NON_TERMINALS.includes(sym);
              return (
                <span
                  key={idx}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: isTargetNt ? 'rgba(251, 191, 36, 0.25)' : isNt ? 'rgba(167, 139, 250, 0.15)' : 'rgba(34, 211, 238, 0.1)',
                    color: isTargetNt ? '#FBBF24' : isNt ? '#A78BFA' : '#22D3EE',
                    border: isTargetNt ? '2px solid #FBBF24' : '1px solid transparent',
                    fontWeight: 700
                  }}
                  className={isTargetNt ? 'glow-amber' : ''}
                >
                  {sym}
                </span>
              );
            })}
          </div>
        </div>

        {/* Dynamic SVG Parse Tree */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <svg width="520" height="290" style={{ maxWidth: '100%' }}>
            {/* Draw parent-child connector lines */}
            {curDeriv.treeNodes.map(node => {
              if (!node.parent) return null;
              const p = curDeriv.treeNodes.find(n => n.id === node.parent);
              if (!p) return null;
              return (
                <line
                  key={`${p.id}-${node.id}`}
                  x1={p.x}
                  y1={p.y}
                  x2={node.x}
                  y2={node.y}
                  stroke="#334466"
                  strokeWidth="2"
                />
              );
            })}

            {/* Draw Nodes */}
            {curDeriv.treeNodes.map(node => (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
                <circle
                  r={node.isTerminal ? "14" : "18"}
                  fill={node.isTerminal ? "rgba(34, 211, 238, 0.2)" : "rgba(167, 139, 250, 0.25)"}
                  stroke={node.isTerminal ? "#22D3EE" : "#8B5CF6"}
                  strokeWidth="2"
                />
                <text
                  textAnchor="middle"
                  dy=".3em"
                  fill={node.isTerminal ? "#22D3EE" : "#E6EDF7"}
                  fontSize={node.isTerminal ? "11" : "12"}
                  fontFamily="var(--font-mono)"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Grammar Property Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        <div className="card" style={{ borderLeft: '4px solid #34D399' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#34D399', marginBottom: '4px' }}>
            ✓ Strictly Unambiguous
          </div>
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Every valid program sentence has exactly one unique parse tree and leftmost derivation.
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #A78BFA' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#A78BFA', marginBottom: '4px' }}>
            Left-Recursive List (S → S R)
          </div>
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            Natural left-associative sequence of firewall rules. Handled natively by LR bottom-up parsing without stack blowup.
          </div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #FBBF24' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#FBBF24', marginBottom: '4px' }}>
            Precedence / Associativity: N/A
          </div>
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            The language contains no binary arithmetic or boolean operators; rules evaluate sequentially (first match wins).
          </div>
        </div>
      </div>
    </div>
  );
}

