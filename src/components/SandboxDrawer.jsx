import React, { useState } from 'react';
import { X, Play, RefreshCw, CheckCircle, AlertTriangle, AlertOctagon, Terminal } from 'lucide-react';
import { tokenize } from '../compiler/lexer.js';
import { buildCanonicalCollection, buildActionGotoTable, parseTokenStream } from '../compiler/lrParser.js';
import { analyzeSemantics } from '../compiler/semantic.js';
import { generateTAC } from '../compiler/tac.js';
import { generateIptables } from '../compiler/optimizer.js';

const PRESETS = [
  {
    name: 'Valid 3-Rule Case Study',
    code: `RULE R1: ALLOW TCP PORT 443;
RULE R2: DENY SOURCE 192.168.1.10;
RULE R3: DENY UDP PORT 1000-2000;`
  },
  {
    name: 'Missing Semicolon (Syntax Error)',
    code: `RULE R1: ALLOW TCP PORT 443
RULE R2: DENY SOURCE 192.168.1.10;`
  },
  {
    name: 'Unknown Action "BLOCK" (Lexical Error)',
    code: `RULE R1: BLOCK TCP PORT 443;`
  },
  {
    name: 'Port Out of Range (Semantic Error)',
    code: `RULE R1: ALLOW TCP PORT 70000;`
  },
  {
    name: 'Policy Conflict (Overlapping IPs)',
    code: `RULE R1: DENY SOURCE 192.168.1.10;
RULE R2: ALLOW SOURCE 192.168.1.0/24;`
  }
];

export default function SandboxDrawer({ isOpen, onClose }) {
  const [code, setCode] = useState(PRESETS[0].code);
  const [runResult, setRunResult] = useState(null);

  if (!isOpen) return null;

  const handleRun = () => {
    // 1. Lexical
    const lex = tokenize(code);

    // 2. Parser
    const { states, transitions } = buildCanonicalCollection();
    const { actionTable, gotoTable } = buildActionGotoTable(states, transitions);
    const parse = lex.errors.length === 0 ? parseTokenStream(lex.tokens, actionTable, gotoTable) : null;

    // 3. Semantic
    const semantic = (parse && parse.success) ? analyzeSemantics(lex.tokens) : null;

    // 4. TAC
    const tac = (semantic && semantic.valid) ? generateTAC(semantic.rules) : null;

    // 5. Iptables
    const target = (semantic && semantic.valid) ? generateIptables(semantic.rules) : null;

    setRunResult({
      lex,
      parse,
      semantic,
      tac,
      target
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '680px',
      maxWidth: '100vw',
      height: '100vh',
      background: 'var(--bg-panel)',
      borderLeft: '1px solid var(--border-color)',
      boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Terminal size={20} color="#FBBF24" />
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Compiler Sandbox Drawer</h2>
        </div>
        <button onClick={onClose} className="btn btn-sm">
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Presets */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Load Preset Test Program:
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => { setCode(p.code); setRunResult(null); }}
                className="btn btn-sm"
                style={{ fontSize: '12.5px', padding: '4px 10px' }}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Firewall Policy Input:
            </label>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
              Case-sensitive uppercase keywords
            </span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={5}
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'var(--font-mono)',
              fontSize: '14.5px',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleRun}
          className="btn btn-primary"
          style={{ width: '100%', gap: '8px' }}
        >
          <Play size={16} />
          <span>Run Entire Compiler Pipeline</span>
        </button>

        {/* Results Stream */}
        {runResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              Execution Diagnostics
            </h3>

            {/* 1. Lexer */}
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--c-lexical)' }}>
                  1. Lexical Analysis:
                </span>
                {runResult.lex.errors.length === 0 ? (
                  <span style={{ color: '#34D399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle size={14} /> {runResult.lex.tokens.length} tokens
                  </span>
                ) : (
                  <span style={{ color: '#F87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertOctagon size={14} /> {runResult.lex.errors.length} error(s)
                  </span>
                )}
              </div>
              {runResult.lex.errors.map((e, idx) => (
                <div key={idx} style={{ color: '#F87171', fontSize: '13px', marginTop: '6px' }}>
                  {e.message}
                </div>
              ))}
            </div>

            {/* 2. Parser */}
            {runResult.parse && (
              <div className="card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--c-syntax)' }}>
                    2. CLR(1) Syntax Analysis:
                  </span>
                  {runResult.parse.success ? (
                    <span style={{ color: '#34D399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={14} /> Accepted ({runResult.parse.steps.length} steps)
                    </span>
                  ) : (
                    <span style={{ color: '#F87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertOctagon size={14} /> Syntax Error
                    </span>
                  )}
                </div>
                {!runResult.parse.success && (
                  <div style={{ color: '#F87171', fontSize: '13px', marginTop: '6px' }}>
                    {runResult.parse.steps[runResult.parse.steps.length - 1]?.description || runResult.parse.error}
                  </div>
                )}
              </div>
            )}

            {/* 3. Semantic */}
            {runResult.semantic && (
              <div className="card" style={{ padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--c-semantic)' }}>
                    3. Semantic Analysis:
                  </span>
                  {runResult.semantic.valid ? (
                    <span style={{ color: '#34D399', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={14} /> Validated (0 conflicts)
                    </span>
                  ) : (
                    <span style={{ color: '#F87171', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertOctagon size={14} /> Semantic/Policy Error
                    </span>
                  )}
                </div>
                {runResult.semantic.errors.map((e, idx) => (
                  <div key={idx} style={{ color: '#F87171', fontSize: '13px', marginTop: '6px' }}>
                    {e.message}
                  </div>
                ))}
                {runResult.semantic.conflicts.map((c, idx) => (
                  <div key={idx} style={{ color: '#FBBF24', fontSize: '13px', marginTop: '6px' }}>
                    {c.description}
                  </div>
                ))}
              </div>
            )}

            {/* 4. TAC */}
            {runResult.tac && (
              <div className="card" style={{ padding: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--c-ir)', display: 'block', marginBottom: '6px' }}>
                  4. Intermediate Three-Address Code (TAC):
                </span>
                <pre style={{
                  background: 'var(--bg-primary)',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  lineHeight: '1.4',
                  overflowX: 'auto'
                }}>
                  {runResult.tac.flatLines.map(l => l.fullLine).join('\n')}
                </pre>
              </div>
            )}

            {/* 5. Target Code */}
            {runResult.target && (
              <div className="card" style={{ padding: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--c-target)', display: 'block', marginBottom: '6px' }}>
                  5. iptables Target Code:
                </span>
                <pre style={{
                  background: 'var(--bg-primary)',
                  padding: '8px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  lineHeight: '1.4',
                  overflowX: 'auto',
                  color: '#34D399'
                }}>
                  {runResult.target.commands.map(c => c.command).join('\n')}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

