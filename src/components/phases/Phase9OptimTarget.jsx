import React, { useState } from 'react';
import { Zap, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { generateIptables } from '../../compiler/optimizer.js';
import { analyzeSemantics } from '../../compiler/semantic.js';
import { tokenize } from '../../compiler/lexer.js';
import { CASE_STUDY_SOURCE } from '../../compiler/grammar.js';

export default function Phase9OptimTarget() {
  const caseTokens = tokenize(CASE_STUDY_SOURCE).tokens;
  const caseSemantic = analyzeSemantics(caseTokens);
  const targetResult = generateIptables(caseSemantic.rules);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Safe Optimizations & iptables Target Code Generation</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Rule normalization, safe vs unsafe range merging criteria, and production Linux packet filter output.
        </p>
      </div>

      {/* Mandatory Never-Executed Banner */}
      <div className="panel" style={{
        padding: '14px 20px',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <AlertTriangle size={24} color="#FBBF24" />
        <div>
          <div style={{ fontWeight: 800, fontSize: '15.5px', color: '#FBBF24' }}>
            SAFETY NOTICE: Target Commands are Synthesized Text Only
          </div>
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
            These iptables rules represent the compiled theoretical output and are never executed directly on the host system.
          </div>
        </div>
      </div>

      {/* Generated iptables Target Code */}
      <div className="panel" style={{ padding: '20px', borderLeft: '4px solid #34D399' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={20} color="#34D399" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#34D399' }}>
              Final Compiled iptables Code (§0.13)
            </h3>
          </div>
          <span className="badge" style={{ background: '#34D39920', color: '#34D399' }}>
            Target: Linux Netfilter (INPUT)
          </span>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '15px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {targetResult.commands.map((cmd, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: 'var(--text-dim)', width: '32px', userSelect: 'none' }}>
                #{idx + 1}
              </span>
              <span style={{ color: '#34D399', fontWeight: 600 }}>
                {cmd.command}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                (From rule {cmd.ruleId})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Rules Table */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>
          Safe Optimization Verification Matrix
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
          {targetResult.optimizations.map((opt, idx) => (
            <div key={idx} className="card" style={{ borderLeft: `4px solid ${opt.applied ? '#34D399' : '#8B5CF6'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '14.5px', color: opt.applied ? '#34D399' : 'var(--text-primary)' }}>
                  {opt.name}
                </span>
                <span className="badge" style={{ background: opt.applied ? '#34D39920' : 'rgba(255,255,255,0.05)', color: opt.applied ? '#34D399' : 'var(--text-muted)' }}>
                  {opt.applied ? 'Applied' : 'Checked'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {opt.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safe vs Unsafe Range Merging Comparison */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>
          Safe vs Unsafe Optimization: Range Merging Rules
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          Compiler rule: Never reorder rules; merge adjacent ranges ONLY when no intervening rule exists.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="card" style={{ borderLeft: '4px solid #34D399' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 700, marginBottom: '6px' }}>
              <CheckCircle2 size={18} />
              <span>Safe Merge (Adjacent, Same Action & Proto)</span>
            </div>
            <pre style={{ fontSize: '12.5px', background: 'var(--bg-primary)', padding: '8px', borderRadius: '4px' }}>
{`RULE R1: ALLOW TCP PORT 80;
RULE R2: ALLOW TCP PORT 81;
-> Merged: iptables -A INPUT -p tcp --dport 80:81 -j ACCEPT`}
            </pre>
            <div style={{ fontSize: '12px', color: '#34D399', marginTop: '6px' }}>
              ✓ Semantically equivalent with zero packet evaluation discrepancy.
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid #F87171' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F87171', fontWeight: 700, marginBottom: '6px' }}>
              <XCircle size={18} />
              <span>Unsafe Merge (Intervening Rule Exists)</span>
            </div>
            <pre style={{ fontSize: '12.5px', background: 'var(--bg-primary)', padding: '8px', borderRadius: '4px' }}>
{`RULE R1: ALLOW TCP PORT 80;
RULE R2: DENY SOURCE 192.168.1.10;  <-- Intervening!
RULE R3: ALLOW TCP PORT 81;`}
            </pre>
            <div style={{ fontSize: '12px', color: '#F87171', marginTop: '6px' }}>
              🚨 FORBIDDEN: Merging R1 and R3 would hoist port 81 before the IP drop, leaking traffic from 192.168.1.10!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

