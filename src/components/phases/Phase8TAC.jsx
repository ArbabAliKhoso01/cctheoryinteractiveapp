import React, { useState } from 'react';
import { FileSpreadsheet, ArrowRight, Play, RotateCcw, Link2 } from 'lucide-react';
import { generateTAC } from '../../compiler/tac.js';
import { analyzeSemantics } from '../../compiler/semantic.js';
import { tokenize } from '../../compiler/lexer.js';
import { CASE_STUDY_SOURCE } from '../../compiler/grammar.js';

const SDT_TABLE = [
  {
    prod: '(5) CONDITION → PROTOCOL PORT PORT_SPEC',
    action: 't1=newtemp(); t2=newtemp(); t3=newtemp(); CONDITION.code = [t1=proto==P; if_false t1 goto _; t2=dport>=lo; if_false t2 goto _; t3=dport<=hi; if_false t3 goto _]; CONDITION.falselist = positions of 3 jumps;'
  },
  {
    prod: '(6) CONDITION → SOURCE IP_SPEC',
    action: 't=newtemp(); CONDITION.code = [t=src in IP.norm; if_false t goto _]; CONDITION.falselist = {that jump};'
  },
  {
    prod: '(4) R → RULE ID COLON ACTION CONDITION SEMICOLON',
    action: 'R.next = newlabel(); backpatch(CONDITION.falselist, R.next); R.code = CONDITION.code || [return ACTION] || [R.next :];'
  },
  {
    prod: '(3) S → R',
    action: 'S.code = R.code;'
  },
  {
    prod: '(2) S → S1 R',
    action: 'S.code = S1.code || R.code;'
  },
  {
    prod: '(1) P → S',
    action: 'P.code = S.code || [return DEFAULT];'
  }
];

export default function Phase8TAC() {
  const caseTokens = tokenize(CASE_STUDY_SOURCE).tokens;
  const caseSemantic = analyzeSemantics(caseTokens);
  const tacResult = generateTAC(caseSemantic.rules);

  const [activeStep, setActiveStep] = useState(3); // All 3 rules emitted
  const [hoveredLineIdx, setHoveredLineIdx] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Intermediate Code Generation (Three-Address Code & SDT)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Syntax-Directed Translation (SDT) with backpatching, temporaries (t1–t7), and symbolic jump labels (L1–L3).
        </p>
      </div>

      {/* SDT Table */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>
          Syntax-Directed Translation (SDT) Grammar Actions (§0.12)
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px' }}>Production</th>
              <th style={{ padding: '8px' }}>Semantic Code-Generation Action (Backpatching)</th>
            </tr>
          </thead>
          <tbody>
            {SDT_TABLE.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                <td style={{ padding: '8px', color: '#A78BFA', fontWeight: 700, width: '42%' }}>
                  {item.prod}
                </td>
                <td style={{ padding: '8px', color: '#E6EDF7' }}>
                  {item.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generated TAC Code Display */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FBBF24' }}>
              Intermediate Three-Address Code for Case Study
            </h3>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Exactly 7 temporaries (t1–t7) and 3 labels (L1–L3) generated via first-match semantics.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge" style={{ background: '#FBBF2420', color: '#FBBF24' }}>
              7 Temporaries
            </span>
            <span className="badge" style={{ background: '#8B5CF620', color: '#A78BFA' }}>
              3 Labels
            </span>
          </div>
        </div>

        {/* Code Box */}
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '14.5px',
          lineHeight: '1.7'
        }}>
          {tacResult.flatLines.map((line, idx) => {
            const isHovered = hoveredLineIdx === idx;
            const isLabel = line.label !== null;
            const isReturn = line.text.startsWith('return');
            const isBranch = line.text.startsWith('if_false');

            return (
              <div
                key={idx}
                onMouseEnter={() => setHoveredLineIdx(idx)}
                onMouseLeave={() => setHoveredLineIdx(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: isHovered ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                  borderLeft: isHovered ? '3px solid #FBBF24' : '3px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {/* Label column */}
                <span style={{ width: '60px', color: '#FBBF24', fontWeight: 700 }}>
                  {line.label ? `${line.label}:` : ''}
                </span>

                {/* Instruction */}
                <span style={{
                  flex: 1,
                  color: isReturn ? '#34D399' : isBranch ? '#A78BFA' : '#22D3EE'
                }}>
                  {line.text}
                </span>

                {/* Rule Source Badge */}
                <span style={{ fontSize: '11.5px', color: 'var(--text-dim)' }}>
                  {line.desc}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hover inspector */}
        {hoveredLineIdx !== null && (
          <div style={{
            marginTop: '12px',
            background: 'var(--bg-card)',
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '13.5px',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)'
          }}>
            <strong style={{ color: '#FBBF24' }}>Instruction Explanation:</strong>{' '}
            {tacResult.flatLines[hoveredLineIdx].desc} (Derived from {tacResult.flatLines[hoveredLineIdx].ruleId})
          </div>
        )}
      </div>
    </div>
  );
}

