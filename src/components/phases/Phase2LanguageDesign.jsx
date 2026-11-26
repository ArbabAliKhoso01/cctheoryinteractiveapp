import React from 'react';
import { Check, X, Shield, Filter, AlertTriangle } from 'lucide-react';

export default function Phase2LanguageDesign() {
  const restrictions = [
    {
      restriction: 'IPv4 Only (No IPv6)',
      justification: 'Keeps lexical scanning deterministic with 32-bit integer arithmetic and 4-octet CIDR validation.'
    },
    {
      restriction: 'TCP & UDP Only',
      justification: 'Layer-4 transport protocols with port numbers; avoids complex header variance of raw IP protocols.'
    },
    {
      restriction: 'No Empty Program',
      justification: 'Security-by-default; a zero-rule firewall policy is ambiguous and dangerous in production.'
    },
    {
      restriction: 'One Condition Per Rule',
      justification: 'Enforces the maximum 7-production limit, preventing precedence ambiguity while maintaining expressive power.'
    },
    {
      restriction: 'INPUT Chain Default',
      justification: 'Focuses strictly on ingress packet filtering, preventing multi-chain routing conflicts.'
    }
  ];

  const validExamples = [
    'RULE R1: ALLOW TCP PORT 443;',
    'RULE R2: DENY SOURCE 192.168.1.10;',
    'RULE R3: DENY UDP PORT 1000-2000;',
    'RULE R4: ALLOW SOURCE 10.0.0.0/24;'
  ];

  const invalidExamples = [
    { code: 'RULE R1: ALLOW TCP PORT 443', reason: 'Missing terminating semicolon (;)' },
    { code: 'RULE R2: BLOCK UDP PORT 53;', reason: 'Keyword "BLOCK" is invalid (only ALLOW/DENY permitted)' },
    { code: 'RULE R3: ALLOW TCP PORT 70000;', reason: 'Port 70000 exceeds valid 16-bit range [1-65535]' },
    { code: 'RULE R4: DENY SOURCE 192.168.1.10/24;', reason: 'Host bits set in CIDR (network form violation)' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2>Language Design & Deliberate Restrictions</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15.5px' }}>
          Specification of the Network Firewall DSL grammar, data types, and deliberate design boundaries.
        </p>
      </div>

      {/* Core Constructs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ borderLeft: '4px solid #22D3EE' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#22D3EE', marginBottom: '8px' }}>
            Data Types
          </div>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '14.5px', color: 'var(--text-muted)' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>PORT_SPEC:</strong> Single port (e.g. <code>443</code>) or range (<code>1000-2000</code>).</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>IP_SPEC:</strong> Host IPv4 (<code>192.168.1.10</code>) or CIDR (<code>192.168.1.0/24</code>).</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>RULE ID:</strong> Unique alphanumeric identifier matching <code>R[0-9]+</code>.</li>
          </ul>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8B5CF6' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#8B5CF6', marginBottom: '8px' }}>
            Action & Protocol Atoms
          </div>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '14.5px', color: 'var(--text-muted)' }}>
            <li><strong style={{ color: 'var(--text-primary)' }}>Actions:</strong> <code>ALLOW</code> (permit packet) or <code>DENY</code> (drop packet).</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Protocols:</strong> <code>TCP</code> or <code>UDP</code>.</li>
            <li><strong style={{ color: 'var(--text-primary)' }}>Rule Format:</strong> <code>RULE ID: ACTION CONDITION;</code></li>
          </ul>
        </div>
      </div>

      {/* Deliberate Restrictions Table */}
      <div className="panel" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="#FBBF24" />
          <span>Deliberate Restrictions & Technical Justifications</span>
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14.5px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 12px' }}>Restriction</th>
              <th style={{ padding: '8px 12px' }}>Technical Justification</th>
            </tr>
          </thead>
          <tbody>
            {restrictions.map((r, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: idx % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#FBBF24', width: '35%' }}>
                  {r.restriction}
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>
                  {r.justification}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Valid vs Invalid Examples Side-by-Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Valid */}
        <div className="panel" style={{ padding: '18px', borderLeft: '4px solid #34D399' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34D399', fontWeight: 700, marginBottom: '12px' }}>
            <Check size={18} />
            <span>Valid DSL Programs</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {validExamples.map((ex, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13.5px',
                color: '#34D399'
              }}>
                {ex}
              </div>
            ))}
          </div>
        </div>

        {/* Invalid */}
        <div className="panel" style={{ padding: '18px', borderLeft: '4px solid #F87171' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F87171', fontWeight: 700, marginBottom: '12px' }}>
            <X size={18} />
            <span>Invalid Programs & Rejection Reasons</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {invalidExamples.map((ex, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13px'
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: '#F87171', fontSize: '13.5px' }}>
                  {ex.code}
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                  Reason: {ex.reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

