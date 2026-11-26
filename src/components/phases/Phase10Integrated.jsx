import React, { useState } from 'react';
import { Sliders, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';
import { CASE_STUDY_SOURCE } from '../../compiler/grammar.js';
import { tokenize } from '../../compiler/lexer.js';
import { analyzeSemantics } from '../../compiler/semantic.js';
import { generateTAC } from '../../compiler/tac.js';
import { generateIptables } from '../../compiler/optimizer.js';

const CASE_RULES = [
  {
    index: 0,
    id: 'R1',
    source: 'RULE R1: ALLOW TCP PORT 443;',
    tokens: ['RULE', 'ID(R1)', ':', 'ALLOW', 'TCP', 'PORT', '443', ';'],
    lrStepSummary: 'Steps 1–11: Shifts tokens, reduces CONDITION→TCP PORT 443, then R→..., then S→R.',
    symbol: 'R1 [action: ALLOW, type: PORT, proto: TCP, ports: 443–443]',
    tac: [
      't1 = proto == TCP',
      'if_false t1 goto L1',
      't2 = dport >= 443',
      'if_false t2 goto L1',
      't3 = dport <= 443',
      'if_false t3 goto L1',
      'return ACCEPT'
    ],
    iptables: 'iptables -A INPUT -p tcp --dport 443 -j ACCEPT'
  },
  {
    index: 1,
    id: 'R2',
    source: 'RULE R2: DENY SOURCE 192.168.1.10;',
    tokens: ['RULE', 'ID(R2)', ':', 'DENY', 'SOURCE', '192.168.1.10', ';'],
    lrStepSummary: 'Steps 12–22: Shifts tokens, reduces CONDITION→SOURCE IP_SPEC, then R, then S→S R.',
    symbol: 'R2 [action: DENY, type: SOURCE_IP, network: 192.168.1.10/32]',
    tac: [
      'L1: t4 = src in 192.168.1.10/32',
      '    if_false t4 goto L2',
      '    return DROP'
    ],
    iptables: 'iptables -A INPUT -s 192.168.1.10 -j DROP'
  },
  {
    index: 2,
    id: 'R3',
    source: 'RULE R3: DENY UDP PORT 1000-2000;',
    tokens: ['RULE', 'ID(R3)', ':', 'DENY', 'UDP', 'PORT', '1000-2000', ';'],
    lrStepSummary: 'Steps 23–34: Shifts tokens, reduces CONDITION, reduces R, S→S R, P→S, then accepts on $.',
    symbol: 'R3 [action: DENY, type: PORT, proto: UDP, ports: 1000–2000]',
    tac: [
      'L2: t5 = proto == UDP',
      '    if_false t5 goto L3',
      '    t6 = dport >= 1000',
      '    if_false t6 goto L3',
      '    t7 = dport <= 2000',
      '    if_false t7 goto L3',
      '    return DROP',
      'L3: return DEFAULT'
    ],
    iptables: 'iptables -A INPUT -p udp --dport 1000:2000 -j DROP'
  }
];

export default function Phase10Integrated() {
  const [sliderIndex, setSliderIndex] = useState(0);
  const activeRule = CASE_RULES[sliderIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Integrated Case-Study Unified Timeline Scrubber</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Drag the scrubber below to witness the simultaneous synchronization across all 6 compiler representations.
        </p>
      </div>

      {/* Main Scrubber Control Bar */}
      <div className="panel glow-amber" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="#FBBF24" />
            <h3 style={{ fontSize: '17px', fontWeight: 800 }}>
              Rule Navigation Scrubber: <span style={{ color: '#FBBF24' }}>Rule {activeRule.id}</span>
            </h3>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#FBBF24' }}>
            Index {sliderIndex + 1} of 3
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="2"
          step="1"
          value={sliderIndex}
          onChange={(e) => setSliderIndex(Number(e.target.value))}
          style={{ width: '100%', height: '8px', cursor: 'pointer' }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span>1. Rule R1 (TCP Port 443)</span>
          <span>2. Rule R2 (Host 192.168.1.10)</span>
          <span>3. Rule R3 (UDP Range 1000-2000)</span>
        </div>
      </div>

      {/* Synchronized Columns Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        {/* 1. Source DSL */}
        <div className="panel" style={{ padding: '16px', borderLeft: '4px solid #94A3B8' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
            1. SOURCE CODE LINE
          </div>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '10px 12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            color: '#E6EDF7'
          }}>
            {activeRule.source}
          </div>
        </div>

        {/* 2. Tokens */}
        <div className="panel" style={{ padding: '16px', borderLeft: '4px solid #22D3EE' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#22D3EE', marginBottom: '6px' }}>
            2. SCANNER TOKEN STREAM
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {activeRule.tokens.map((tok, i) => (
              <span key={i} style={{
                background: 'rgba(34, 211, 238, 0.15)',
                color: '#22D3EE',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600
              }}>
                {tok}
              </span>
            ))}
          </div>
        </div>

        {/* 3. LR Parse Steps */}
        <div className="panel" style={{ padding: '16px', borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#8B5CF6', marginBottom: '6px' }}>
            3. LR(1) PARSER REDUCTION
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {activeRule.lrStepSummary}
          </p>
        </div>

        {/* 4. Symbol Table */}
        <div className="panel" style={{ padding: '16px', borderLeft: '4px solid #F472B6' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F472B6', marginBottom: '6px' }}>
            4. SYMBOL TABLE DECORATION
          </div>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '8px 10px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            color: '#F472B6'
          }}>
            {activeRule.symbol}
          </div>
        </div>

        {/* 5. TAC IR */}
        <div className="panel" style={{ padding: '16px', borderLeft: '4px solid #FBBF24' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FBBF24', marginBottom: '6px' }}>
            5. INTERMEDIATE CODE (TAC)
          </div>
          <pre style={{
            background: 'var(--bg-primary)',
            padding: '8px 12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '12.5px',
            color: '#FBBF24',
            lineHeight: 1.5
          }}>
            {activeRule.tac.join('\n')}
          </pre>
        </div>

        {/* 6. iptables Codegen */}
        <div className="panel" style={{ padding: '16px', borderLeft: '4px solid #34D399' }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#34D399', marginBottom: '6px' }}>
            6. TARGET LINUX IPTABLES COMMAND
          </div>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '10px 12px',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: '#34D399',
            fontWeight: 700
          }}>
            {activeRule.iptables}
          </div>
        </div>
      </div>
    </div>
  );
}

