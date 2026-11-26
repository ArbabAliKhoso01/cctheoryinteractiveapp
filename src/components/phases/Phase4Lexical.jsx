import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, AlertTriangle, ArrowRight, Binary } from 'lucide-react';
import { tokenize } from '../../compiler/lexer.js';
import { CASE_STUDY_SOURCE } from '../../compiler/grammar.js';

const CONFLICT_CLINIC = [
  {
    id: 'ip-vs-port',
    title: '192.168.1.10 (IP_SPEC vs PORT_SPEC)',
    input: '192.168.1.10',
    candidates: [
      { token: 'PORT_SPEC', matched: '192', len: 3 },
      { token: 'IP_SPEC', matched: '192.168.1.10', len: 12 }
    ],
    rule: 'Longest Match (Maximal Munch)',
    verdict: 'IP_SPEC selected (12 characters > 3 characters).',
    isError: false
  },
  {
    id: 'rule-vs-id',
    title: 'RULE vs R1 (Keyword vs Identifier)',
    input: 'RULE vs R1',
    candidates: [
      { token: 'RULE (Keyword)', matched: 'RULE', len: 4 },
      { token: 'ID (Regex R[0-9]+)', matched: 'R1', len: 2 }
    ],
    rule: 'ID Requires Digits + Keyword Priority',
    verdict: 'RULE is not followed by digits, so it matches the keyword; R1 has digit 1, matching ID.',
    isError: false
  },
  {
    id: 'port-range',
    title: '1000-2000 (Single Token vs Expression)',
    input: '1000-2000',
    candidates: [
      { token: 'PORT_SPEC', matched: '1000-2000', len: 9 },
      { token: 'NUMBER - NUMBER', matched: 'N/A (No minus operator in DSL)', len: 0 }
    ],
    rule: 'Composite Regex Pattern',
    verdict: 'Treated as ONE atomic PORT_SPEC token; prevents operator precedence ambiguity.',
    isError: false
  },
  {
    id: 'block-error',
    title: '"BLOCK" (Unknown Word)',
    input: 'BLOCK',
    candidates: [
      { token: 'ACTION', matched: 'None (only ALLOW|DENY)', len: 0 },
      { token: 'ID', matched: 'None (must start with R + digits)', len: 0 }
    ],
    rule: 'Strict Lexical Filtering',
    verdict: 'LEXICAL ERROR: Unrecognized token at line 1, col 10.',
    isError: true
  },
  {
    id: 'illegal-char',
    title: '"@" (Illegal Symbol)',
    input: '@',
    candidates: [
      { token: 'Any terminal', matched: 'None', len: 0 }
    ],
    rule: 'Character Set Whitelist',
    verdict: 'LEXICAL ERROR: Illegal character "@" reported with line and column.',
    isError: true
  }
];

export default function Phase4Lexical() {
  const [lexResult] = useState(() => tokenize(CASE_STUDY_SOURCE));
  const [scanStep, setScanStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeClinic, setActiveClinic] = useState(CONFLICT_CLINIC[0]);

  const tokenSteps = lexResult.steps.filter(s => s.type === 'token' || s.type === 'eof');

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setScanStep(prev => {
          if (prev >= tokenSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 700);
    }
    return () => clearInterval(timer);
  }, [isPlaying, tokenSteps.length]);

  const currentStepData = tokenSteps[scanStep] || tokenSteps[0];
  const scannedTokens = tokenSteps.slice(0, scanStep + 1).map(s => s.token);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Lexical Analysis & Scanner Simulator</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Maximal munch scanning, conflict resolution clinic, live token stream, and symbol table population.
        </p>
      </div>

      {/* Interactive Scanner Animation Box */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Binary size={18} color="#22D3EE" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>
              Live Scanner Tape & Lookahead Cursor
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`btn btn-sm ${isPlaying ? 'btn-amber' : 'btn-primary'}`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'Pause' : 'Scan Step'}</span>
            </button>
            <button
              onClick={() => { setScanStep(0); setIsPlaying(false); }}
              className="btn btn-sm"
              title="Reset scanner"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Character strip */}
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '15px',
          overflowX: 'auto',
          lineHeight: '1.8'
        }}>
          {CASE_STUDY_SOURCE.split('').map((char, cIdx) => {
            const isScanned = currentStepData?.token && cIdx < currentStepData.token.endIndex;
            const isCurrentLexeme = currentStepData?.token &&
              cIdx >= currentStepData.token.startIndex &&
              cIdx < currentStepData.token.endIndex;

            return (
              <span
                key={cIdx}
                style={{
                  padding: '2px 1px',
                  background: isCurrentLexeme
                    ? '#FBBF24'
                    : isScanned
                    ? 'rgba(34, 211, 238, 0.15)'
                    : 'transparent',
                  color: isCurrentLexeme ? '#0B1220' : isScanned ? '#22D3EE' : 'var(--text-muted)',
                  fontWeight: isCurrentLexeme ? 800 : isScanned ? 600 : 400,
                  borderRadius: isCurrentLexeme ? '3px' : '0'
                }}
              >
                {char === '\n' ? '↵\n' : char}
              </span>
            );
          })}
        </div>

        {/* Current match descriptor */}
        <div style={{
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-card)',
          padding: '10px 14px',
          borderRadius: '6px',
          fontSize: '14px'
        }}>
          <span>
            Current Token: <strong style={{ color: '#22D3EE' }}>{currentStepData.token.type}</strong>
            {currentStepData.token.value !== currentStepData.token.type && (
              <span style={{ color: '#FBBF24', marginLeft: '6px' }}>({currentStepData.token.lexeme})</span>
            )}
          </span>
          <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>
            Line {currentStepData.token.line}, Col {currentStepData.token.col} | Tokens: {scanStep + 1} / {tokenSteps.length}
          </span>
        </div>
      </div>

      {/* Live Stream & Symbol Table Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Token Stream Chips */}
        <div className="panel" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '15.5px', marginBottom: '10px', color: '#22D3EE' }}>
            Live Emitted Token Stream (Total: 24 Tokens)
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px'
          }}>
            {scannedTokens.map((t, idx) => (
              <span
                key={idx}
                style={{
                  background: idx === scanStep ? '#FBBF24' : 'rgba(34, 211, 238, 0.12)',
                  color: idx === scanStep ? '#0B1220' : '#22D3EE',
                  border: idx === scanStep ? '2px solid #FBBF24' : '1px solid rgba(34, 211, 238, 0.25)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {t.type === '$' ? '$ (EOF)' : `${t.type}${t.lexeme !== t.type ? `(${t.lexeme})` : ''}`}
              </span>
            ))}
          </div>
        </div>

        {/* Live Symbol Table */}
        <div className="panel" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '15.5px', marginBottom: '10px', color: '#8B5CF6' }}>
            Live Identifier Symbol Table
          </h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '6px' }}>Entry</th>
                <th style={{ padding: '6px' }}>Token</th>
                <th style={{ padding: '6px' }}>Line</th>
                <th style={{ padding: '6px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {['R1', 'R2', 'R3'].map(id => {
                const isDiscovered = scannedTokens.some(t => t.lexeme === id);
                return (
                  <tr key={id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '6px', color: '#FBBF24', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                      {id}
                    </td>
                    <td style={{ padding: '6px', color: '#22D3EE' }}>ID</td>
                    <td style={{ padding: '6px' }}>{id === 'R1' ? 1 : id === 'R2' ? 2 : 3}</td>
                    <td style={{ padding: '6px' }}>
                      {isDiscovered ? (
                        <span style={{ color: '#34D399', fontWeight: 600 }}>Active</span>
                      ) : (
                        <span style={{ color: 'var(--text-dim)' }}>Pending</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conflict Clinic Cards */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>
          Lexical Conflict Clinic — Disambiguation Rules (§0.3)
        </h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {CONFLICT_CLINIC.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveClinic(item)}
              className={`btn btn-sm ${activeClinic.id === item.id ? 'btn-primary' : ''}`}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="card" style={{ borderLeft: `4px solid ${activeClinic.isError ? '#F87171' : '#34D399'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '16px', color: activeClinic.isError ? '#F87171' : '#34D399' }}>
              {activeClinic.title}
            </span>
            <span style={{ fontSize: '12.5px', background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '4px', color: '#FBBF24' }}>
              Rule: {activeClinic.rule}
            </span>
          </div>

          <div style={{ fontSize: '14.5px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            <strong>Analysis & Verdict:</strong> {activeClinic.verdict}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {activeClinic.candidates.map((c, i) => (
              <div key={i} style={{
                background: 'var(--bg-primary)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                border: '1px solid var(--border-color)'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{c.token}: </span>
                <code style={{ color: '#22D3EE' }}>{c.matched}</code>
                <span style={{ color: 'var(--text-dim)', marginLeft: '6px' }}>({c.len} chars)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

