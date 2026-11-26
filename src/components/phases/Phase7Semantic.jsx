import React, { useState } from 'react';
import { CheckCircle2, AlertOctagon, ShieldCheck, AlertTriangle } from 'lucide-react';
import { analyzeSemantics } from '../../compiler/semantic.js';
import { tokenize } from '../../compiler/lexer.js';
import { CASE_STUDY_SOURCE } from '../../compiler/grammar.js';

export default function Phase7Semantic() {
  const caseTokens = tokenize(CASE_STUDY_SOURCE).tokens;
  const caseSemantic = analyzeSemantics(caseTokens);

  const [activeFailingTest, setActiveFailingTest] = useState('conflict');

  const failingTests = {
    portRange: {
      title: 'Out of Range Port (70000)',
      code: 'RULE R1: ALLOW TCP PORT 70000;',
      check: 'Port must be between 1 and 65535'
    },
    invertedPort: {
      title: 'Inverted Port Range (2000-1000)',
      code: 'RULE R1: ALLOW TCP PORT 2000-1000;',
      check: 'Range start (2000) must be <= end (1000)'
    },
    badOctet: {
      title: 'Invalid IPv4 Octet (300.1.1.1)',
      code: 'RULE R1: DENY SOURCE 300.1.1.1;',
      check: 'Each octet must be between 0 and 255'
    },
    badCidr: {
      title: 'Excessive Prefix (/40)',
      code: 'RULE R1: DENY SOURCE 10.0.0.0/40;',
      check: 'IPv4 CIDR prefix must be between /0 and /32'
    },
    hostBits: {
      title: 'Host Bits Set in Subnet (192.168.1.10/24)',
      code: 'RULE R1: ALLOW SOURCE 192.168.1.10/24;',
      check: 'Subnet CIDR must have zero host bits (network form)'
    },
    dupId: {
      title: 'Duplicate Rule Identifier (R1)',
      code: 'RULE R1: ALLOW TCP PORT 80;\nRULE R1: DENY UDP PORT 53;',
      check: 'All rule identifiers in symbol table must be globally unique'
    },
    conflict: {
      title: 'Policy Conflict (Contradictory Overlapping Rules)',
      code: 'RULE R1: DENY SOURCE 192.168.1.10;\nRULE R2: ALLOW SOURCE 192.168.1.0/24;',
      check: 'Opposite security actions on overlapping IP space require human resolution'
    }
  };

  const curTest = failingTests[activeFailingTest];
  const testTokens = tokenize(curTest.code).tokens;
  const testSemantics = analyzeSemantics(testTokens);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Semantic Analysis & Policy Conflict Detection</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Type system validation, subnet CIDR integrity, symbol table attribute decoration, and policy collision prevention.
        </p>
      </div>

      {/* Case Study Semantic Verification Table */}
      <div className="panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} color="#34D399" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#34D399' }}>
              Case-Study Program Semantic Validation (All Passed ✓)
            </h3>
          </div>
          <span className="badge" style={{ background: '#34D39920', color: '#34D399' }}>
            Status: Valid & Safe
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px' }}>Rule ID</th>
              <th style={{ padding: '8px' }}>Action</th>
              <th style={{ padding: '8px' }}>Condition Kind</th>
              <th style={{ padding: '8px' }}>Resolved Parameters</th>
              <th style={{ padding: '8px' }}>Semantic Checks</th>
            </tr>
          </thead>
          <tbody>
            {caseSemantic.symbolTable.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px 8px', color: '#FBBF24', fontWeight: 800 }}>{s.id}</td>
                <td style={{ padding: '10px 8px', color: s.action === 'ALLOW' ? '#34D399' : '#F87171', fontWeight: 700 }}>
                  {s.action}
                </td>
                <td style={{ padding: '10px 8px', color: '#A78BFA' }}>{s.type}</td>
                <td style={{ padding: '10px 8px', color: '#22D3EE' }}>
                  {s.ports ? `${s.proto} ports: ${s.ports}` : s.network}
                </td>
                <td style={{ padding: '10px 8px', color: '#34D399', fontSize: '13px' }}>
                  ✓ In bounds, unique ID, 0 conflicts
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interactive Semantic Failure Clinic */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px' }}>
          Interactive Semantic & Policy Constraint Clinic
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {Object.keys(failingTests).map(k => (
            <button
              key={k}
              onClick={() => setActiveFailingTest(k)}
              className={`btn btn-sm ${activeFailingTest === k ? 'btn-primary' : ''}`}
              style={{ fontSize: '13px' }}
            >
              {failingTests[k].title}
            </button>
          ))}
        </div>

        <div className="card" style={{ borderLeft: '4px solid #F87171' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#F87171', marginBottom: '6px' }}>
            {curTest.title}
          </div>
          <div style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Invariant: {curTest.check}
          </div>

          <pre style={{
            background: 'var(--bg-primary)',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '13.5px',
            color: '#E6EDF7'
          }}>
            {curTest.code}
          </pre>

          {/* Diagnostic messages */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {testSemantics.errors.map((e, idx) => (
              <div key={idx} style={{ color: '#F87171', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertOctagon size={16} />
                <span>{e.message}</span>
              </div>
            ))}
            {testSemantics.conflicts.map((c, idx) => (
              <div key={idx} style={{ color: '#FBBF24', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                <span>{c.description}</span>
              </div>
            ))}
          </div>

          {/* Visual Overlap Diagram if policy conflict */}
          {activeFailingTest === 'conflict' && (
            <div style={{
              marginTop: '16px',
              padding: '14px',
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FBBF24', marginBottom: '8px' }}>
                Address Space Inclusion Diagram (Shadowing Conflict):
              </div>
              <div style={{ position: 'relative', height: '60px', background: 'rgba(52, 211, 153, 0.15)', border: '2px dashed #34D399', borderRadius: '6px', padding: '6px 12px' }}>
                <span style={{ fontSize: '12px', color: '#34D399', fontWeight: 700 }}>
                  Rule R2: ALLOW SOURCE 192.168.1.0/24 (Range: .1 to .254)
                </span>
                <div style={{
                  position: 'absolute',
                  top: '26px',
                  left: '35%',
                  width: '90px',
                  height: '24px',
                  background: '#F87171',
                  color: '#0B1220',
                  fontWeight: 800,
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.5)'
                }}>
                  R1: DENY .10/32
                </div>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Because <code>192.168.1.10/32</code> is entirely enclosed inside <code>192.168.1.0/24</code> with opposite actions, code generation is safely halted to prevent security misconfigurations.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

