import React from 'react';
import { Shield, Users, Terminal, CheckCircle2, FileCode } from 'lucide-react';
import { CASE_STUDY_SOURCE } from '../../compiler/grammar.js';

export default function Phase0Overview() {
  const members = [
    { name: 'Presenter 1 (Group Member)', roll: 'CS-202X-001', role: 'Lexical & Syntax' },
    { name: 'Presenter 2 (Group Member)', roll: 'CS-202X-002', role: 'CLR(1) Parser Engine' },
    { name: 'Presenter 3 (Group Member)', roll: 'CS-202X-003', role: 'Semantic & Diagnostics' },
    { name: 'Presenter 4 (Group Member)', roll: 'CS-202X-004', role: 'TAC IR & iptables Codegen' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Hero Banner */}
      <div className="panel" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{
            background: '#8B5CF6',
            color: '#fff',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
          }}>
            <Shield size={28} />
          </div>
          <div>
            <h1>Network Firewall Rule Compiler (NFRC)</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px' }}>
              Compiler Construction Group Project — Theory & Implementation Defense
            </p>
          </div>
        </div>

        <p style={{ fontSize: '18px', color: 'var(--text-primary)', maxWidth: '900px', lineHeight: 1.5 }}>
          A formally specified compiler that translates high-level declarative network firewall policies into verified
          Three-Address Code (TAC) and production-grade Linux iptables filter rules with zero syntactic ambiguity.
        </p>

        {/* Verification metrics chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
          <div className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '6px 12px' }}>
            <CheckCircle2 size={15} /> 16 LR(1) Canonical States
          </div>
          <div className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '6px 12px' }}>
            <CheckCircle2 size={15} /> 0 Conflicts (Conflict-Free CLR)
          </div>
          <div className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '6px 12px' }}>
            <CheckCircle2 size={15} /> Exact 34-Step Parse Trace
          </div>
          <div className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34D399', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '6px 12px' }}>
            <CheckCircle2 size={15} /> 24 Tokens Stream
          </div>
        </div>
      </div>

      {/* Case Study Code Box */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCode size={20} color="#22D3EE" />
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>
              The Integrated Case-Study Program (§0.1)
            </h2>
          </div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Used across all compiler stages & verification
          </span>
        </div>

        <div style={{
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          overflow: 'hidden',
          fontFamily: 'var(--font-mono)'
        }}>
          {CASE_STUDY_SOURCE.split('\n').map((line, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderBottom: idx < 2 ? '1px solid var(--border-color)' : 'none',
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent'
              }}
            >
              <span style={{ width: '40px', color: 'var(--text-dim)', userSelect: 'none', fontSize: '15px' }}>
                {idx + 1}
              </span>
              <span style={{ color: '#E6EDF7', fontSize: '16.5px', fontWeight: 500 }}>
                {line}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Group Members Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Users size={18} color="#94A3B8" />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Group Presentation Team</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {members.map((m, idx) => (
            <div key={idx} className="card" style={{ padding: '14px' }}>
              <div style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {m.name}
              </div>
              <div style={{ fontSize: '13.5px', color: '#8B5CF6', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {m.roll}
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Assigned: {m.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

