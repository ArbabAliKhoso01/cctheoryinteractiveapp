import React from 'react';
import { Award, CheckCircle2, HelpCircle, FileCheck, Shield } from 'lucide-react';

const DEFENSE_QA = [
  {
    q: 'Why did you choose CLR(1) over SLR(1) or LALR(1)?',
    a: 'While SLR(1) and LALR(1) are also conflict-free for this grammar with 16 states, CLR(1) is strictly more powerful in general. Because each CLR(1) item embeds its exact lookahead, syntax errors (such as a missing semicolon in state I15) are caught instantly with ZERO unnecessary reductions. Furthermore, since no LR(1) states share identical cores here, CLR(1) incurs zero state explosion penalty.'
  },
  {
    q: 'Why is operator-precedence parsing disqualified?',
    a: 'According to formal compiler theory, an operator grammar strictly forbids two adjacent non-terminals on any RHS. Our grammar contains production (2) S → S R, where non-terminals S and R appear consecutively. Hence, it is not an operator grammar.'
  },
  {
    q: 'What is the precise meaning of the dot (•) in an LR item?',
    a: 'The dot marks the parser position during recognition: symbols to the left of the dot have already been parsed and shifted onto the stack, while symbols to the right are expected to be seen in the upcoming input stream.'
  },
  {
    q: 'What lookahead does [CONDITION → PROTOCOL PORT PORT_SPEC •] carry and why?',
    a: 'It carries strictly {SEMICOLON}. This lookahead comes from FIRST(β a) during closure of rule (4) R → ... ACTION • CONDITION SEMICOLON, where β is SEMICOLON. If the next token is RULE instead of SEMICOLON, CLR(1) immediately flags a syntax error without executing a reduction.'
  },
  {
    q: 'What would change in the grammar if empty programs were allowed?',
    a: 'We would need an ε-production (e.g. S → ε). This would introduce nullable non-terminals, altering FIRST sets and potentially causing shift-reduce conflicts on $ in LR(0)/SLR.'
  }
];

export default function Phase12Summary() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Compiler Project Summary & Defense Q&A Cheat-Sheet</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Final consolidated review of theoretical invariants, verified ground-truth metrics, and anticipated examiner questions.
        </p>
      </div>

      {/* Ground-Truth Metrics Grid */}
      <div className="panel glow-green" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <CheckCircle2 size={22} color="#34D399" />
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#34D399' }}>
            Ground-Truth Verified Compiler Invariants (§0.1 – §0.14)
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#A78BFA' }}>6 (+1)</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Grammar Productions</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Augmented: P' → P</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#22D3EE' }}>24</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Token Stream Count</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Including End-of-File ($)</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#8B5CF6' }}>16</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Canonical LR(1) States</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>States I0 to I15</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#34D399' }}>0</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Parsing Conflicts</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Conflict-Free Table</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#FBBF24' }}>34</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Parse Trace Steps</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>23 Shift, 10 Red, 1 Acc</div>
          </div>

          <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#F472B6' }}>7 / 3</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>IR Temporaries / Labels</div>
            <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>t1–t7 and L1–L3</div>
          </div>
        </div>
      </div>

      {/* Examiner Q&A Cheat-Sheet */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <HelpCircle size={20} color="#60A5FA" />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
            Anticipated Examiner Defense Questions & Technical Answers
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {DEFENSE_QA.map((item, idx) => (
            <div key={idx} className="card" style={{ borderLeft: '4px solid #60A5FA', padding: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#60A5FA', marginBottom: '6px' }}>
                Q{idx + 1}: {item.q}
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                <strong>Defense Response:</strong> {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

