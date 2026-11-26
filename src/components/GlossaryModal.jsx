import React from 'react';
import { X, BookOpen } from 'lucide-react';

const GLOSSARY_ITEMS = [
  {
    term: 'Context-Free Grammar (CFG)',
    def: 'A 4-tuple (V, Σ, R, S) of non-terminals, terminals, rewrite rules, and a start symbol used to specify programming language syntax formally.'
  },
  {
    term: 'Left-Recursion',
    def: 'A grammar production where the left-hand non-terminal appears as the first symbol on the right-hand side (e.g. S -> S R). Left recursion causes infinite loops in top-down parsers (LL/RDP) but is natural and stack-efficient for bottom-up LR parsers.'
  },
  {
    term: 'CLR(1) / Canonical LR(1)',
    def: 'Bottom-up parser with 1-token lookahead encoded directly in the LR items [A -> α • β, a]. It is the most powerful LR parsing technique, detects syntax errors before any invalid reductions, and avoids reduce-reduce conflicts.'
  },
  {
    term: 'Shift-Reduce Conflict',
    def: 'A parser state ambiguity where the parser cannot decide whether to shift the next input symbol onto the stack or reduce the top stack symbols by a grammar production (e.g. state I2 in LR(0)).'
  },
  {
    term: 'Operator Grammar',
    def: 'A grammar with NO epsilon (ε) productions and NO two adjacent non-terminals on any RHS. Our grammar has S -> S R (two adjacent non-terminals), so operator-precedence parsing cannot be used.'
  },
  {
    term: 'FIRST and FOLLOW Sets',
    def: 'FIRST(α) is the set of terminals that can appear as the first symbol of a string derived from α. FOLLOW(A) is the set of terminals that can immediately follow non-terminal A in some sentential form.'
  },
  {
    term: 'Syntax-Directed Translation (SDT)',
    def: 'A compiler construction technique where semantic actions (code generation, symbol table insertions) are attached directly to grammar productions and executed during parsing.'
  },
  {
    term: 'Backpatching',
    def: 'A method for generating jump instructions in TAC where the target addresses/labels are left blank initially and filled in later once the target location is determined.'
  },
  {
    term: 'Three-Address Code (TAC)',
    def: 'A linear intermediate representation where each instruction has at most one operator and at most three operands/addresses (e.g. t1 = proto == TCP; if_false t1 goto L1).'
  },
  {
    term: 'CIDR Network Form',
    def: 'In CIDR notation (e.g., 192.168.1.0/24), all bits outside the network prefix mask must be zero. If host bits are non-zero (like 192.168.1.10/24), it is semantically invalid as a subnet specifier.'
  }
];

export default function GlossaryModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px'
    }}>
      <div className="panel" style={{
        maxWidth: '720px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} color="#8B5CF6" />
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Compiler Construction Glossary</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm"
            style={{ padding: '4px 8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '20px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {GLOSSARY_ITEMS.map((item, idx) => (
            <div key={idx} className="card" style={{ padding: '14px' }}>
              <div style={{
                fontWeight: 700,
                color: '#8B5CF6',
                fontSize: '15.5px',
                marginBottom: '4px'
              }}>
                {item.term}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-primary)',
                lineHeight: 1.5
              }}>
                {item.def}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

