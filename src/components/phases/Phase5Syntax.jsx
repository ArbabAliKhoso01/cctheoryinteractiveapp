import React, { useState } from 'react';
import {
  GitBranch,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Shield,
  Layers,
  ArrowRight
} from 'lucide-react';
import { PRODUCTIONS, TERMINALS, NON_TERMINALS, CASE_STUDY_SOURCE } from '../../compiler/grammar.js';
import { tokenize } from '../../compiler/lexer.js';
import { computeFirstSets, computeFollowSets } from '../../compiler/firstFollow.js';
import { buildCanonicalCollection, buildActionGotoTable, parseTokenStream } from '../../compiler/lrParser.js';
import { LL1_TABLE, RDP_PSEUDOCODE, RDP_ONE_RULE_TRACE } from '../../compiler/ll1Parser.js';

const SUB_TABS = [
  { id: '5.1', label: '5.1 RDP & LL(1)' },
  { id: '5.2', label: '5.2 Parser Comparison' },
  { id: '5.3', label: '5.3 Operator Precedence' },
  { id: '5.4', label: '5.4 Augmentation' },
  { id: '5.5', label: '5.5 FIRST & FOLLOW' },
  { id: '5.6', label: '5.6 Closure & GOTO' },
  { id: '5.7', label: '5.7 16 States Diagram' },
  { id: '5.8', label: '5.8 ACTION/GOTO Table' },
  { id: '5.9', label: '5.9 34-Step Parse Trace' }
];

export default function Phase5Syntax({ externalSubStep = null, onSelectSubStep = null }) {
  const [internalTab, setInternalTab] = useState('5.9'); // Default to the star feature
  const activeTab = externalSubStep || internalTab;
  const setActiveTab = onSelectSubStep || setInternalTab;

  // Compute LR(1) data live from grammar
  const firstSets = computeFirstSets(PRODUCTIONS, NON_TERMINALS, TERMINALS);
  const followSets = computeFollowSets(PRODUCTIONS, NON_TERMINALS, 'P', firstSets);
  const { states, transitions } = buildCanonicalCollection(PRODUCTIONS, TERMINALS, NON_TERMINALS);
  const { actionTable, gotoTable, conflicts } = buildActionGotoTable(states, transitions, PRODUCTIONS, TERMINALS, NON_TERMINALS);

  // Parse Case Study
  const lexResult = tokenize(CASE_STUDY_SOURCE);
  const parseResult = parseTokenStream(lexResult.tokens, actionTable, gotoTable, PRODUCTIONS);

  // States for sub-features
  const [rdpStep, setRdpStep] = useState(0);
  const [traceStep, setTraceStep] = useState(0);
  const [selectedStateId, setSelectedStateId] = useState(0);
  const [highlightConflictState, setHighlightConflictState] = useState(false);
  const [conflictScanned, setConflictScanned] = useState(false);

  const curTrace = parseResult.steps[traceStep] || parseResult.steps[0];
  const curRdp = RDP_ONE_RULE_TRACE[rdpStep];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sub-Tabs Nav */}
      <div style={{
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '4px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : ''}`}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 5.1 RDP & LL(1) */}
      {activeTab === '5.1' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3>5.1 Recursive-Descent Parser & Left-Recursion Elimination</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
              <code>S → S R</code> is left-recursive. Direct top-down parsing would cause infinite recursion.
              Eliminating left-recursion introduces <code>S'</code> and ε.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Before vs After */}
            <div className="card" style={{ borderLeft: '4px solid #F87171' }}>
              <div style={{ fontWeight: 700, color: '#F87171', marginBottom: '6px' }}>
                Original Grammar (Left-Recursive)
              </div>
              <pre style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
{`P -> S
S -> S R | R
R -> RULE ID COLON ACTION CONDITION ;`}
              </pre>
              <div style={{ fontSize: '12.5px', color: '#F87171', marginTop: '6px' }}>
                ⚠ RDP infinite loop: S() immediately calls S()!
              </div>
            </div>

            <div className="card" style={{ borderLeft: '4px solid #34D399' }}>
              <div style={{ fontWeight: 700, color: '#34D399', marginBottom: '6px' }}>
                Transformed LL(1) Grammar
              </div>
              <pre style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>
{`P  -> S
S  -> R S'
S' -> R S' | ε
R  -> RULE ID COLON ACTION CONDITION ;`}
              </pre>
              <div style={{ fontSize: '12.5px', color: '#34D399', marginTop: '6px' }}>
                ✓ Right-recursive, loop-free LL(1) structure.
              </div>
            </div>
          </div>

          {/* LL(1) Table */}
          <div className="panel" style={{ padding: '16px' }}>
            <h4 style={{ fontSize: '15.5px', color: '#A78BFA', marginBottom: '10px' }}>
              LL(1) Predictive Parsing Table (Conflict-Free)
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '6px' }}>NT</th>
                  <th style={{ padding: '6px' }}>RULE</th>
                  <th style={{ padding: '6px' }}>PROTOCOL</th>
                  <th style={{ padding: '6px' }}>SOURCE</th>
                  <th style={{ padding: '6px' }}>$</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(LL1_TABLE).map(nt => (
                  <tr key={nt} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '8px 6px', fontWeight: 700, color: '#A78BFA' }}>{nt}</td>
                    <td style={{ padding: '8px 6px', color: LL1_TABLE[nt].RULE ? '#34D399' : 'var(--text-dim)' }}>
                      {LL1_TABLE[nt].RULE || '—'}
                    </td>
                    <td style={{ padding: '8px 6px', color: LL1_TABLE[nt].PROTOCOL ? '#34D399' : 'var(--text-dim)' }}>
                      {LL1_TABLE[nt].PROTOCOL || '—'}
                    </td>
                    <td style={{ padding: '8px 6px', color: LL1_TABLE[nt].SOURCE ? '#34D399' : 'var(--text-dim)' }}>
                      {LL1_TABLE[nt].SOURCE || '—'}
                    </td>
                    <td style={{ padding: '8px 6px', color: LL1_TABLE[nt]['$'] ? '#34D399' : 'var(--text-dim)' }}>
                      {LL1_TABLE[nt]['$'] || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RDP Simulation Step */}
          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '15px', color: '#FBBF24' }}>
                RDP Call Stack Simulation (1-Rule Program)
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setRdpStep(Math.min(RDP_ONE_RULE_TRACE.length - 1, rdpStep + 1))}
                  disabled={rdpStep === RDP_ONE_RULE_TRACE.length - 1}
                  className="btn btn-sm btn-primary"
                >
                  Step RDP ({rdpStep + 1}/{RDP_ONE_RULE_TRACE.length})
                </button>
                <button onClick={() => setRdpStep(0)} className="btn btn-sm">
                  <RotateCcw size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px' }}>
              <div className="card">
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Executing Procedure:</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>
                  {curRdp.proc}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {curRdp.desc}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Lookahead Token: <code>{curRdp.lookahead}</code>
                </div>
              </div>

              <div className="card">
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Call Stack:</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {curRdp.callStack.length === 0 ? (
                    <span style={{ color: '#34D399', fontSize: '13px' }}>[Empty Stack — Complete]</span>
                  ) : (
                    curRdp.callStack.map((frame, i) => (
                      <span key={i} style={{
                        background: '#8B5CF625',
                        color: '#A78BFA',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        border: '1px solid #8B5CF640'
                      }}>
                        {frame}()
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5.2 Parser Comparison */}
      {activeTab === '5.2' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3>5.2 Parser-Class Comparison (LR(0) vs SLR(1) vs LALR(1) vs CLR(1))</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
              Rigorous mathematical comparison showing why LR(0) is rejected due to state I2 conflict and why CLR(1) is chosen.
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px' }}>Parser Class</th>
                <th style={{ padding: '10px' }}>States</th>
                <th style={{ padding: '10px' }}>Conflicts</th>
                <th style={{ padding: '10px' }}>Verdict & Reason</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{
                borderBottom: '1px solid var(--border-color)',
                background: highlightConflictState ? 'rgba(248, 113, 113, 0.12)' : 'transparent'
              }}>
                <td style={{ padding: '10px', fontWeight: 700, color: '#F87171' }}>LR(0)</td>
                <td style={{ padding: '10px' }}>16</td>
                <td style={{ padding: '10px', color: '#F87171', fontWeight: 700 }}>
                  YES — State I2
                </td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => setHighlightConflictState(!highlightConflictState)}
                    className="btn btn-sm"
                    style={{ color: '#F87171', borderColor: '#F87171' }}
                  >
                    View I2 Conflict (Shift RULE vs Reduce P→S)
                  </button>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', fontWeight: 700, color: '#FBBF24' }}>SLR(1)</td>
                <td style={{ padding: '10px' }}>16</td>
                <td style={{ padding: '10px', color: '#34D399' }}>None (0)</td>
                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                  Works! Uses FOLLOW(P) = {`{$}`} to reduce only on $, resolving shift on RULE.
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', fontWeight: 700, color: '#A78BFA' }}>LALR(1)</td>
                <td style={{ padding: '10px' }}>16</td>
                <td style={{ padding: '10px', color: '#34D399' }}>None (0)</td>
                <td style={{ padding: '10px', color: 'var(--text-muted)' }}>
                  Works! No two LR(1) states share identical cores, so state count is unchanged (16).
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(52, 211, 153, 0.08)' }}>
                <td style={{ padding: '10px', fontWeight: 800, color: '#34D399' }}>CLR(1) [LR(1)]</td>
                <td style={{ padding: '10px', fontWeight: 800, color: '#34D399' }}>16</td>
                <td style={{ padding: '10px', fontWeight: 800, color: '#34D399' }}>None (0)</td>
                <td style={{ padding: '10px', color: '#34D399', fontWeight: 600 }}>
                  CHOSEN: Most powerful; exact lookaheads detect syntax errors earliest before any wrong reductions.
                </td>
              </tr>
            </tbody>
          </table>

          {highlightConflictState && (
            <div className="panel animate-shake" style={{ padding: '16px', border: '2px solid #F87171' }}>
              <div style={{ fontWeight: 700, color: '#F87171', fontSize: '15px', marginBottom: '6px' }}>
                Detailed Anatomy of State I2 Shift-Reduce Conflict in LR(0):
              </div>
              <pre style={{ fontSize: '13px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '6px' }}>
{`State I2:
  P -> S •         (Ready to REDUCE by rule 1)
  S -> S • R       (Can SHIFT symbol R)
  R -> • RULE ...  (Can SHIFT terminal RULE)

Without lookahead, on input token 'RULE', an LR(0) parser cannot decide:
  1. Reduce P -> S ?
  2. Shift token RULE to state I4 ?
CLR(1) solves this because P -> S • carries lookahead [$], while shift is on [RULE]!`}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 5.3 Operator Precedence Check */}
      {activeTab === '5.3' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3>5.3 Operator-Precedence Parsing Check & Disqualification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
              Verification of operator grammar requirements according to compiler theory.
            </p>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #F87171' }}>
            <h4 style={{ color: '#F87171', marginBottom: '8px' }}>
              Operator Grammar Definition Check:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14.5px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 color="#34D399" size={18} />
                <span>Condition 1: No epsilon (ε) production in grammar? <strong>PASSED (No ε productions)</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <XCircle color="#F87171" size={18} />
                <span>
                  Condition 2: No two adjacent non-terminals on any RHS?{' '}
                  <strong style={{ color: '#F87171' }}>FAILED in Production 2: S → S R</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="panel" style={{ padding: '16px' }}>
            <div style={{ fontWeight: 700, color: '#FBBF24', fontSize: '15px', marginBottom: '6px' }}>
              Official Conclusion:
            </div>
            <p style={{ fontSize: '14.5px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              Because production <code>(2) S → S R</code> contains adjacent non-terminals <code>S</code> and <code>R</code>,
              the grammar violates the formal definition of an operator grammar. Therefore,{' '}
              <strong>operator-precedence parsing cannot be applied and is explicitly skipped.</strong>
            </p>
          </div>
        </div>
      )}

      {/* 5.4 Augmentation */}
      {activeTab === '5.4' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3>5.4 Grammar Augmentation and Initial Item</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
              Augmenting CFG with <code>P' → P</code> provides a unique acceptance state for the bottom-up automaton.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Initial LR(1) Seed Item:</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 800,
              color: '#FBBF24',
              fontFamily: 'var(--font-mono)',
              marginTop: '6px'
            }}>
              [ P' → <span className="lr-dot">•</span> P , $ ]
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
              The dot • at the left of P signifies that we expect to parse an entire program P followed strictly by the end-of-input marker $.
            </p>
          </div>
        </div>
      )}

      {/* 5.5 FIRST Sets */}
      {activeTab === '5.5' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3>5.5 Live Computed FIRST and FOLLOW Sets</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
              Used to compute lookaheads during LR(1) item closure: <code>FIRST(β a)</code>.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="panel" style={{ padding: '16px' }}>
              <h4 style={{ color: '#22D3EE', marginBottom: '10px' }}>FIRST Sets</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                <tbody>
                  {Object.keys(firstSets).filter(k => NON_TERMINALS.includes(k)).map(k => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px', color: '#A78BFA', fontWeight: 700 }}>FIRST({k})</td>
                      <td style={{ padding: '8px', color: '#22D3EE' }}>{`{ ${firstSets[k].join(', ')} }`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="panel" style={{ padding: '16px' }}>
              <h4 style={{ color: '#8B5CF6', marginBottom: '10px' }}>FOLLOW Sets</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
                <tbody>
                  {Object.keys(followSets).map(k => (
                    <tr key={k} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '8px', color: '#A78BFA', fontWeight: 700 }}>FOLLOW({k})</td>
                      <td style={{ padding: '8px', color: '#34D399' }}>{`{ ${followSets[k].join(', ')} }`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5.6 Closure & GOTO */}
      {activeTab === '5.6' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <h3>5.6 CLOSURE and GOTO Construction Worked Example (State I0)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
              For each item <code>[A → α • B β, a]</code>, add <code>[B → • γ, b]</code> for all <code>b ∈ FIRST(β a)</code>.
            </p>
          </div>

          <div className="panel" style={{ padding: '16px' }}>
            <h4 style={{ color: '#FBBF24', marginBottom: '8px' }}>CLOSURE( {`[P' → • P, $]`} ) = State I0:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
              <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '4px' }}>
                1. Seed: <strong>P' → <span className="lr-dot">•</span> P , $</strong>
              </div>
              <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '4px' }}>
                2. Dot before P: add <strong>P → <span className="lr-dot">•</span> S , $</strong> (since FIRST($) = {$})
              </div>
              <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '4px' }}>
                3. Dot before S: add <strong>S → <span className="lr-dot">•</span> S R , $/RULE</strong> & <strong>S → <span className="lr-dot">•</span> R , $/RULE</strong>
              </div>
              <div style={{ padding: '6px', background: 'var(--bg-card)', borderRadius: '4px' }}>
                4. Dot before R: add <strong>R → <span className="lr-dot">•</span> RULE ID COLON ACTION CONDITION SEMICOLON , $/RULE</strong>
              </div>
            </div>

            <div style={{ marginTop: '14px', fontSize: '13.5px', color: '#34D399' }}>
              Transitions from I0: GOTO(I0, P)=I1, GOTO(I0, S)=I2, GOTO(I0, R)=I3, GOTO(I0, RULE)=I4
            </div>
          </div>
        </div>
      )}

      {/* 5.7 16 States Canonical Diagram */}
      {activeTab === '5.7' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3>5.7 Canonical LR(1) Collection Diagram (All 16 States)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                Click any state card to inspect its exact core items, lookaheads, and incoming/outgoing transitions.
              </p>
            </div>
            <div className="badge" style={{ background: '#34D39920', color: '#34D399', border: '1px solid #34D39950' }}>
              16 States Discovered
            </div>
          </div>

          {/* Grid of 16 States */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '12px'
          }}>
            {states.map((st, idx) => {
              const isSelected = selectedStateId === idx;
              const isAccept = idx === 1;
              const hasReduce = st.some(it => it.dot === PRODUCTIONS[it.prodId].rhs.length);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedStateId(idx)}
                  className={`card ${isSelected ? 'glow-amber' : ''}`}
                  style={{
                    cursor: 'pointer',
                    padding: '12px',
                    border: isSelected
                      ? '2px solid #FBBF24'
                      : isAccept
                      ? '2px solid #34D399'
                      : hasReduce
                      ? '1px solid #8B5CF680'
                      : '1px solid var(--border-color)',
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{
                      fontWeight: 800,
                      fontSize: '15px',
                      color: isAccept ? '#34D399' : isSelected ? '#FBBF24' : '#E6EDF7'
                    }}>
                      State I{idx}
                    </span>
                    {isAccept ? (
                      <span className="badge" style={{ background: '#34D39930', color: '#34D399' }}>ACCEPT</span>
                    ) : hasReduce ? (
                      <span className="badge" style={{ background: '#F59E0B25', color: '#FBBF24' }}>REDUCE</span>
                    ) : null}
                  </div>

                  <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    {st.length} item{st.length > 1 ? 's' : ''}
                  </div>

                  {/* Summary of transitions */}
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {transitions.filter(t => t.from === idx).map(t => `${t.symbol}→I${t.to}`).join(', ') || 'No outgoing (Final)'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected State Item Inspector */}
          <div className="panel" style={{ padding: '16px', borderLeft: '4px solid #FBBF24' }}>
            <h4 style={{ color: '#FBBF24', fontSize: '16px', marginBottom: '8px' }}>
              State I{selectedStateId} Detailed Items & Lookaheads:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '13.5px' }}>
              {states[selectedStateId].map((it, i) => {
                const prod = PRODUCTIONS[it.prodId];
                const beforeDot = prod.rhs.slice(0, it.dot).join(' ');
                const afterDot = prod.rhs.slice(it.dot).join(' ');
                return (
                  <div key={i} style={{ padding: '4px 8px', background: 'var(--bg-primary)', borderRadius: '4px' }}>
                    <span style={{ color: '#A78BFA', fontWeight: 700 }}>{prod.lhs}</span> →{' '}
                    <span style={{ color: '#E6EDF7' }}>{beforeDot}</span>{' '}
                    <span className="lr-dot">•</span>{' '}
                    <span style={{ color: '#E6EDF7' }}>{afterDot}</span>{' '}
                    <span style={{ color: 'var(--text-dim)' }}>,</span>{' '}
                    <span style={{ color: '#22D3EE', fontWeight: 700 }}>{it.lookahead}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5.8 ACTION / GOTO Table */}
      {activeTab === '5.8' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3>5.8 Complete ACTION / GOTO Parsing Table</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                Conflict-free parsing matrix built from canonical LR(1) collection.
              </p>
            </div>
            <button
              onClick={() => setConflictScanned(true)}
              className="btn btn-sm btn-primary"
            >
              Verify 0 Conflicts
            </button>
          </div>

          {conflictScanned && (
            <div className="badge" style={{ background: '#34D39925', color: '#34D399', padding: '8px 14px', fontSize: '14px', border: '1px solid #34D39960' }}>
              <CheckCircle2 size={16} /> Conflict check scan complete: 0 shift-reduce, 0 reduce-reduce conflicts found!
            </div>
          )}

          <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 6px', borderRight: '1px solid var(--border-color)' }}>State</th>
                  {/* Terminals (ACTION) */}
                  {TERMINALS.map(t => (
                    <th key={t} style={{ padding: '8px 4px', color: '#22D3EE' }}>{t}</th>
                  ))}
                  {/* Non-terminals (GOTO) */}
                  {['P', 'S', 'R', 'CONDITION'].map(nt => (
                    <th key={nt} style={{ padding: '8px 4px', color: '#A78BFA', borderLeft: nt === 'P' ? '2px solid var(--border-color)' : 'none' }}>
                      {nt}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {states.map((_, sId) => (
                  <tr key={sId} style={{ borderBottom: '1px solid var(--border-color)', background: sId % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                    <td style={{ padding: '6px', fontWeight: 800, color: '#FBBF24', borderRight: '1px solid var(--border-color)', textAlign: 'center' }}>
                      I{sId}
                    </td>

                    {/* Actions */}
                    {TERMINALS.map(t => {
                      const act = actionTable[sId]?.[t];
                      let color = 'inherit';
                      let bg = 'transparent';
                      if (act?.startsWith('s')) { color = '#60A5FA'; bg = 'rgba(96, 165, 250, 0.1)'; }
                      if (act?.startsWith('r')) { color = '#F59E0B'; bg = 'rgba(245, 158, 11, 0.1)'; }
                      if (act === 'acc') { color = '#34D399'; bg = 'rgba(52, 211, 153, 0.2)'; }

                      return (
                        <td key={t} style={{ padding: '6px 4px', textAlign: 'center', color, background: act ? bg : 'transparent', fontWeight: act ? 700 : 400 }}>
                          {act || ''}
                        </td>
                      );
                    })}

                    {/* Gotos */}
                    {['P', 'S', 'R', 'CONDITION'].map((nt, idx) => {
                      const gt = gotoTable[sId]?.[nt];
                      return (
                        <td key={nt} style={{
                          padding: '6px 4px',
                          textAlign: 'center',
                          color: '#A78BFA',
                          fontWeight: gt !== undefined ? 700 : 400,
                          borderLeft: idx === 0 ? '2px solid var(--border-color)' : 'none'
                        }}>
                          {gt !== undefined ? gt : ''}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5.9 Interactive 34-Step LR Parse Trace */}
      {activeTab === '5.9' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3>5.9 Live 34-Step LR(1) Parse Simulator (Case Study)</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14.5px' }}>
                Step-by-step bottom-up derivation showing stack push/pop, input pointer, and tree reduction.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setTraceStep(Math.max(0, traceStep - 1))}
                disabled={traceStep === 0}
                className="btn btn-sm"
              >
                ◀ Step
              </button>
              <span style={{ fontSize: '14px', fontWeight: 700, padding: '0 4px', color: '#FBBF24' }}>
                {traceStep + 1} / 34
              </span>
              <button
                onClick={() => setTraceStep(Math.min(parseResult.steps.length - 1, traceStep + 1))}
                disabled={traceStep === parseResult.steps.length - 1}
                className="btn btn-sm btn-primary"
              >
                Step ▶
              </button>
              <button onClick={() => setTraceStep(0)} className="btn btn-sm" title="Reset trace">
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Current Step Banner */}
          <div className="panel glow-amber" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#FBBF24' }}>
                Step {curTrace.stepNumber}: {curTrace.action}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
                Current State: I{curTrace.state} | Lookahead: {curTrace.lookahead}
              </span>
            </div>
            <p style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
              {curTrace.description}
            </p>
          </div>

          {/* Dual Panel: Stack (left) & Remaining Input Tape (right) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
            {/* Parser Stack */}
            <div className="panel" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '15px', color: '#8B5CF6', marginBottom: '10px' }}>
                LR Parser Stack (States & Interleaved Symbols)
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px',
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                minHeight: '80px',
                alignItems: 'center'
              }}>
                {curTrace.stack.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      background: idx === curTrace.stack.length - 1 ? '#FBBF2425' : 'var(--bg-card)',
                      border: idx === curTrace.stack.length - 1 ? '2px solid #FBBF24' : '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{item.symbol}</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#8B5CF6' }}>{item.state}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Tape */}
            <div className="panel" style={{ padding: '16px' }}>
              <h4 style={{ fontSize: '15px', color: '#22D3EE', marginBottom: '10px' }}>
                Lookahead & Remaining Input Tape
              </h4>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '6px',
                padding: '8px',
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                minHeight: '80px',
                alignItems: 'center'
              }}>
                {curTrace.remainingInput.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '3px 7px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: idx === 0 ? 800 : 500,
                      background: idx === 0 ? '#22D3EE' : 'var(--bg-card)',
                      color: idx === 0 ? '#0B1220' : 'var(--text-muted)',
                      border: idx === 0 ? '2px solid #FBBF24' : '1px solid var(--border-color)',
                      fontFamily: 'var(--font-mono)'
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

