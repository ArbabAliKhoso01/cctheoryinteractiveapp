import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, ShieldAlert, Database, CheckCircle2 } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    id: 'source',
    name: 'Source Text',
    color: '#94A3B8',
    input: 'Plaintext file (*.nfrc)',
    output: 'Raw character stream',
    caseSnippet: 'RULE R1: ALLOW TCP PORT 443; ...',
    desc: 'The human-authored declarative firewall policy in our domain-specific language.'
  },
  {
    id: 'lexer',
    name: 'Lexical Analysis',
    color: '#22D3EE',
    input: 'Raw character stream',
    output: 'Stream of 24 typed tokens + symbol table',
    caseSnippet: '[RULE, ID(R1), COLON, ACTION(ALLOW), ...]',
    desc: 'Scans characters using maximal munch (longest match) and keyword priority over IDs.'
  },
  {
    id: 'parser',
    name: 'Syntax Analysis (CLR)',
    color: '#8B5CF6',
    input: 'Token stream',
    output: 'Concrete Parse Tree (bottom-up)',
    caseSnippet: '34-step conflict-free LR(1) shift-reduce derivations',
    desc: 'Constructs the derivation tree using a 16-state Canonical LR(1) automaton, catching syntax errors with zero extra reductions.'
  },
  {
    id: 'semantic',
    name: 'Semantic & Symbol Table',
    color: '#F472B6',
    input: 'Parse tree + identifiers',
    output: 'Decorated AST + verified scope attributes',
    caseSnippet: 'R1: port 443; R2: 192.168.1.10/32; R3: 1000–2000',
    desc: 'Validates port numbers (1-65535), CIDR network form (no host bits set), uniqueness of IDs, and checks for policy conflicts.'
  },
  {
    id: 'tac',
    name: 'Intermediate Code (TAC)',
    color: '#FBBF24',
    input: 'Decorated AST',
    output: 'Three-Address Code (7 temporaries, 3 labels)',
    caseSnippet: 't1 = proto == TCP; if_false t1 goto L1; ...',
    desc: 'Applies syntax-directed translation with backpatching to generate linear conditional evaluation code with first-match semantics.'
  },
  {
    id: 'target',
    name: 'Target Code (iptables)',
    color: '#34D399',
    input: 'Optimized TAC & policy model',
    output: 'Linux iptables packet filter commands',
    caseSnippet: 'iptables -A INPUT -p tcp --dport 443 -j ACCEPT ...',
    desc: 'Maps actions (ALLOW->ACCEPT, DENY->DROP) and formats network ports and subnets for Linux kernel packet filtering.'
  }
];

export default function Phase1Pipeline() {
  const [selectedStage, setSelectedStage] = useState(0);
  const [activePacketIdx, setActivePacketIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePacketIdx(prev => (prev + 1) % PIPELINE_STAGES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const cur = PIPELINE_STAGES[selectedStage];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2>Compiler Architecture & Flow Pipeline</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
            Click any phase box to inspect its specific transformation of the case-study program.
          </p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-card)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          fontSize: '13px'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: PIPELINE_STAGES[activePacketIdx].color,
            boxShadow: `0 0 8px ${PIPELINE_STAGES[activePacketIdx].color}`
          }} />
          <span>Packet currently in: <strong>{PIPELINE_STAGES[activePacketIdx].name}</strong></span>
        </div>
      </div>

      {/* Main Pipeline SVG / Interactive Nodes */}
      <div className="panel" style={{ padding: '24px 16px', position: 'relative' }}>
        {/* Horizontal Flow Stages */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '12px',
          position: 'relative',
          zIndex: 2
        }}>
          {PIPELINE_STAGES.map((stg, idx) => {
            const isSelected = selectedStage === idx;
            const hasPacket = activePacketIdx === idx;

            return (
              <div
                key={stg.id}
                onClick={() => setSelectedStage(idx)}
                style={{
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                  border: isSelected
                    ? `2px solid ${stg.color}`
                    : hasPacket
                    ? `1.5px dashed ${stg.color}`
                    : '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '14px 10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  boxShadow: isSelected ? `0 0 15px ${stg.color}40` : 'none'
                }}
              >
                {/* Step badge */}
                <span style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: stg.color,
                  color: '#0B1220',
                  fontWeight: 800,
                  fontSize: '11px',
                  padding: '1px 8px',
                  borderRadius: '10px'
                }}>
                  {idx + 1}
                </span>

                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: isSelected ? stg.color : 'var(--text-primary)',
                  marginTop: '4px'
                }}>
                  {stg.name}
                </div>

                {hasPacket && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '11px',
                    color: '#FBBF24',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FBBF24' }} />
                    Data Flowing
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Global Shared Services */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px dashed var(--border-color)'
        }}>
          <div className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(248, 113, 113, 0.4)',
            background: 'rgba(248, 113, 113, 0.05)'
          }}>
            <ShieldAlert size={24} color="#F87171" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#F87171' }}>
                Shared Error Handler
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Provides precise diagnostics (line, column, expected tokens) across Lexer, Parser, and Semantic passes.
              </div>
            </div>
          </div>

          <div className="card" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            background: 'rgba(59, 130, 246, 0.05)'
          }}>
            <Database size={24} color="#3B82F6" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#60A5FA' }}>
                Central Symbol Table
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Populated in Lexer (IDs), verified in Parser/Semantic (attributes), queried in TAC and Codegen.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Stage Detail Card */}
      <div className="panel" style={{ padding: '20px', borderLeft: `4px solid ${cur.color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: cur.color }}>
            Stage {selectedStage + 1}: {cur.name}
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Stage Details
          </span>
        </div>

        <p style={{ fontSize: '15.5px', color: 'var(--text-primary)', marginBottom: '16px' }}>
          {cur.desc}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          <div className="card">
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>INPUT:</span>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {cur.input}
            </div>
          </div>

          <div className="card">
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>OUTPUT:</span>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {cur.output}
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1', background: 'var(--bg-primary)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#FBBF24' }}>TRANSFORMATION OF CASE STUDY:</span>
            <div style={{ fontSize: '14px', color: '#E6EDF7', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              {cur.caseSnippet}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

