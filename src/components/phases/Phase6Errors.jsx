import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, XCircle, ArrowRight, ShieldAlert, AlertTriangle } from 'lucide-react';
import { ERROR_SCENARIOS } from '../../compiler/errorsData.js';

export default function Phase6Errors() {
  const [selectedScenario, setSelectedScenario] = useState(ERROR_SCENARIOS[1]); // Default to missing semicolon
  const [showRecoveryComparison, setShowRecoveryComparison] = useState(true);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Syntax Error Detection & Recovery Strategies</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Exact parser state diagnostics, zero-reduction error detection in CLR(1), and synchronization recovery analysis.
        </p>
      </div>

      {/* Error Gallery Selector */}
      <div className="panel" style={{ padding: '16px' }}>
        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Select Error Test Scenario (§0.10 Gallery):
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {ERROR_SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => setSelectedScenario(sc)}
              className={`btn btn-sm ${selectedScenario.id === sc.id ? 'btn-primary' : ''}`}
              style={{
                fontSize: '12.5px',
                borderColor: selectedScenario.id === sc.id ? '#F87171' : 'var(--border-color)',
                color: selectedScenario.id === sc.id ? '#FFF' : 'var(--text-primary)'
              }}
            >
              {sc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Diagnostic Card */}
      <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #F87171' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertOctagon size={22} color="#F87171" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F87171' }}>
              {selectedScenario.title}
            </h3>
          </div>
          <span className="badge" style={{
            background: selectedScenario.stage === 'lexical' ? 'rgba(34, 211, 238, 0.15)' : selectedScenario.stage === 'syntax' ? 'rgba(167, 139, 250, 0.15)' : 'rgba(244, 114, 182, 0.15)',
            color: selectedScenario.stage === 'lexical' ? '#22D3EE' : selectedScenario.stage === 'syntax' ? '#A78BFA' : '#F472B6',
            border: '1px solid currentColor'
          }}>
            {selectedScenario.stage.toUpperCase()} PASS
          </span>
        </div>

        {/* Source Code with Caret Diagnostic */}
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          lineHeight: '1.6',
          marginBottom: '16px'
        }}>
          {selectedScenario.code.split('\n').map((line, idx) => (
            <div key={idx}>
              <div style={{ display: 'flex' }}>
                <span style={{ width: '32px', color: 'var(--text-dim)', userSelect: 'none' }}>
                  {idx + 1} |
                </span>
                <span style={{ color: '#E6EDF7' }}>{line}</span>
              </div>
              {/* Show caret if error line */}
              {idx + 1 === selectedScenario.caretLine && (
                <div style={{ display: 'flex', color: '#F87171', fontWeight: 800 }}>
                  <span style={{ width: '32px' }} />
                  <span style={{ marginLeft: `${(selectedScenario.caretCol - 1) * 8.4}px` }}>
                    ▲ {selectedScenario.diagnostic}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CLR(1) State & Empty Table Cell Diagnostic */}
        {selectedScenario.stage === 'syntax' && (
          <div className="card" style={{ background: 'var(--bg-card)', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ACTION Table Empty Cell Consultation:</div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#FBBF24', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              ACTION[ State I{selectedScenario.state} , {selectedScenario.lookahead} ] = ∅ (BLANK / SYNTAX ERROR)
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {selectedScenario.whyEarly}
            </div>
          </div>
        )}

        {/* Recovery Strategies Available */}
        <div>
          <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '8px' }}>
            Recovery Strategies for this Failure:
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            <div className="card">
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#60A5FA' }}>1. PANIC MODE</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedScenario.recovery.panicMode || 'Skip to safe boundary token'}
              </p>
            </div>
            <div className="card">
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>2. PHRASE LEVEL</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedScenario.recovery.phraseLevel || 'Insert missing token and resume'}
              </p>
            </div>
            <div className="card">
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#F87171' }}>3. HALT & REPORT</span>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {selectedScenario.recovery.stop || 'Stop parse immediately with pinpoint diagnostic'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unsuitable vs Suitable Recovery Comparison (Mandatory §0.10) */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>
          Mandatory Analysis: Unsuitable vs Suitable Recovery Strategy
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Scenario: Missing semicolon <code>;</code> after Rule R1: <code>... PORT 443 \n RULE R2: ...</code>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Unsuitable Naive Panic */}
          <div className="card" style={{ borderLeft: '4px solid #F87171' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F87171', fontWeight: 700, marginBottom: '6px' }}>
              <XCircle size={18} />
              <span>Unsuitable Recovery (Naive Panic to Next ;)</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              A naive panic mode parser discards all input tokens until the next semicolon (<code>;</code>).
            </p>
            <div style={{
              background: 'var(--bg-primary)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              color: '#F87171',
              marginTop: '8px'
            }}>
              🚨 <strong>Disastrous Consequence:</strong> It skips and swallows Rule R2 completely!
              R2's symbol table entry and duplicate-ID checks are skipped, producing misleading downstream error cascades.
            </div>
          </div>

          {/* Suitable Grammar-Aware Panic */}
          <div className="card" style={{ borderLeft: '4px solid #34D399' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 700, marginBottom: '6px' }}>
              <CheckCircle2 size={18} />
              <span>Suitable Recovery (Sync on FIRST/FOLLOW: "RULE")</span>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              Synchronizing on <code>RULE</code> (which is both <code>FIRST(R)</code> and <code>FOLLOW(R)</code>).
            </p>
            <div style={{
              background: 'var(--bg-primary)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12.5px',
              color: '#34D399',
              marginTop: '8px'
            }}>
              ✓ <strong>Clean Isolation:</strong> Only the malformed rule R1 is discarded.
              The parser immediately resynchronizes at the keyword <code>RULE</code> of R2, preserving R2 in the symbol table!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

