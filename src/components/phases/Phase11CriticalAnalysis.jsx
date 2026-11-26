import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function Phase11CriticalAnalysis() {
  const [showIcmpEffect, setShowIcmpEffect] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Critical Analysis & Architectural "What-If" (§0.14)</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Formal assessment of DSL language limitations, theoretical improvements, and live ripple-effect of adding ICMP support.
        </p>
      </div>

      {/* Two Inherent Limitations & Concrete Solutions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="panel" style={{ padding: '18px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#FBBF24', marginBottom: '8px' }}>
            Limitation 1: Disjoint Single-Condition Rules
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            A rule in our DSL can specify <strong>either</strong> a port condition or a source IP condition, but not both in a single rule.
          </p>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#34D399',
            marginTop: '10px'
          }}>
            <strong>Proposed Extension:</strong> Extend CFG with conjunction:<br />
            <code>CONDITION → CONDITION AND CONDITION</code><br />
            with precedence rules or compound production <code>SOURCE IP_SPEC PROTOCOL PORT PORT_SPEC</code>.
          </div>
        </div>

        <div className="panel" style={{ padding: '18px', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#FBBF24', marginBottom: '8px' }}>
            Limitation 2: Conservative Conflict Rejection
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Our semantic checker aggressively rejects any overlapping IP scope with opposite actions, even benign exceptions like
            "ALLOW specific host 192.168.1.10, then DENY entire subnet 192.168.1.0/24".
          </p>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '10px 12px',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#34D399',
            marginTop: '10px'
          }}>
            <strong>Proposed Extension:</strong> Implement order-aware directional shadowing analysis.
            Only flag an error if a broader rule precedes and completely conceals (shadows) a narrower rule.
          </div>
        </div>
      </div>

      {/* Interactive What-If: Add ICMP Protocol */}
      <div className="panel glow-amber" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FBBF24' }}>
              Ripple-Effect Experiment: What happens if we add "ICMP"?
            </h3>
            <span style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              See how a single language change propagates through all compiler components.
            </span>
          </div>

          <button
            onClick={() => setShowIcmpEffect(!showIcmpEffect)}
            className={`btn ${showIcmpEffect ? 'btn-amber' : 'btn-primary'}`}
          >
            {showIcmpEffect ? '✓ ICMP Extension Active' : 'Toggle "Add ICMP"'}
          </button>
        </div>

        {/* Comparison Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {/* 1. Lexer */}
          <div className="card" style={{ borderLeft: showIcmpEffect ? '4px solid #FBBF24' : '4px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#22D3EE' }}>1. LEXICAL ANALYZER</span>
            <div style={{ fontSize: '13.5px', marginTop: '6px', color: 'var(--text-primary)' }}>
              {showIcmpEffect ? (
                <span style={{ color: '#FBBF24' }}>
                  + 1 new reserved keyword token: <strong>ICMP</strong> added to keyword lookup table.
                </span>
              ) : (
                'Recognizes: RULE, ALLOW, DENY, TCP, UDP, PORT, SOURCE.'
              )}
            </div>
          </div>

          {/* 2. Grammar */}
          <div className="card" style={{ borderLeft: showIcmpEffect ? '4px solid #FBBF24' : '4px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#A78BFA' }}>2. CONTEXT-FREE GRAMMAR</span>
            <div style={{ fontSize: '13.5px', marginTop: '6px', color: 'var(--text-primary)' }}>
              {showIcmpEffect ? (
                <span style={{ color: '#FBBF24' }}>
                  + Production (7): <code>CONDITION → ICMP</code><br />
                  (7 total productions + augmentation).
                </span>
              ) : (
                '6 productions total (within ≤7 production limit).'
              )}
            </div>
          </div>

          {/* 3. LR(1) Automaton */}
          <div className="card" style={{ borderLeft: showIcmpEffect ? '4px solid #FBBF24' : '4px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#8B5CF6' }}>3. LR(1) AUTOMATON STATES</span>
            <div style={{ fontSize: '13.5px', marginTop: '6px', color: 'var(--text-primary)' }}>
              {showIcmpEffect ? (
                <span style={{ color: '#FBBF24' }}>
                  State I8 gains item <code>[CONDITION → • ICMP, ;]</code>.<br />
                  Yields <strong>17 States</strong> (New state I16: <code>CONDITION → ICMP •, ;</code>).
                  Conflict-free!
                </span>
              ) : (
                'Exactly 16 states (I0 to I15), 0 conflicts.'
              )}
            </div>
          </div>

          {/* 4. Semantic & IR */}
          <div className="card" style={{ borderLeft: showIcmpEffect ? '4px solid #FBBF24' : '4px solid var(--border-color)' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>4. TAC & CODEGEN</span>
            <div style={{ fontSize: '13.5px', marginTop: '6px', color: 'var(--text-primary)' }}>
              {showIcmpEffect ? (
                <span style={{ color: '#FBBF24' }}>
                  TAC: <code>t = proto == ICMP</code> (no port bounds to validate).<br />
                  Target: <code>iptables -A INPUT -p icmp -j ...</code>
                </span>
              ) : (
                'Evaluates TCP/UDP ports or IPv4 CIDR blocks.'
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

