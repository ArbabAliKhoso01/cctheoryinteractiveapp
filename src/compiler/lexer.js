// Lexical Analyzer for NFRC
import { KEYWORDS } from './grammar.js';

export function tokenize(source) {
  const tokens = [];
  const errors = [];
  const steps = [];
  const symbolTable = new Map(); // id -> symbol entry

  let line = 1;
  let col = 1;
  let index = 0;
  const len = source.length;

  while (index < len) {
    const ch = source[index];

    // Whitespace handling
    if (/\s/.test(ch)) {
      steps.push({
        type: 'whitespace',
        char: ch,
        index,
        line,
        col,
        desc: `Skip whitespace '${ch === '\n' ? '\\n' : ch}'`
      });
      if (ch === '\n') {
        line++;
        col = 1;
      } else {
        col++;
      }
      index++;
      continue;
    }

    const startCol = col;
    const startLine = line;
    const startIndex = index;
    const remaining = source.slice(index);

    // Conflict patterns & longest match checks
    const candidates = [];

    // Keyword & specific tokens
    if (remaining.startsWith('RULE') && !/^[A-Za-z0-9]/.test(remaining.slice(4))) {
      candidates.push({ type: 'RULE', lexeme: 'RULE', len: 4 });
    }
    if (remaining.startsWith('ALLOW') && !/^[A-Za-z0-9]/.test(remaining.slice(5))) {
      candidates.push({ type: 'ACTION', value: 'ALLOW', lexeme: 'ALLOW', len: 5 });
    }
    if (remaining.startsWith('DENY') && !/^[A-Za-z0-9]/.test(remaining.slice(4))) {
      candidates.push({ type: 'ACTION', value: 'DENY', lexeme: 'DENY', len: 4 });
    }
    if (remaining.startsWith('TCP') && !/^[A-Za-z0-9]/.test(remaining.slice(3))) {
      candidates.push({ type: 'PROTOCOL', value: 'TCP', lexeme: 'TCP', len: 3 });
    }
    if (remaining.startsWith('UDP') && !/^[A-Za-z0-9]/.test(remaining.slice(3))) {
      candidates.push({ type: 'PROTOCOL', value: 'UDP', lexeme: 'UDP', len: 3 });
    }
    if (remaining.startsWith('PORT') && !/^[A-Za-z0-9]/.test(remaining.slice(4))) {
      candidates.push({ type: 'PORT', lexeme: 'PORT', len: 4 });
    }
    if (remaining.startsWith('SOURCE') && !/^[A-Za-z0-9]/.test(remaining.slice(6))) {
      candidates.push({ type: 'SOURCE', lexeme: 'SOURCE', len: 6 });
    }
    if (remaining.startsWith(':')) {
      candidates.push({ type: 'COLON', lexeme: ':', len: 1 });
    }
    if (remaining.startsWith(';')) {
      candidates.push({ type: 'SEMICOLON', lexeme: ';', len: 1 });
    }

    // ID regex: R[0-9]+
    const idMatch = remaining.match(/^R[0-9]+/);
    if (idMatch) {
      candidates.push({ type: 'ID', lexeme: idMatch[0], len: idMatch[0].length });
    }

    // IP_SPEC regex: [0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(/[0-9]+)?
    const ipMatch = remaining.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+(\/[0-9]+)?/);
    if (ipMatch) {
      candidates.push({ type: 'IP_SPEC', lexeme: ipMatch[0], len: ipMatch[0].length });
    }

    // PORT_SPEC regex: [0-9]+(-[0-9]+)?
    // Only if not matching as IP_SPEC
    const portMatch = remaining.match(/^[0-9]+(-[0-9]+)?/);
    if (portMatch) {
      candidates.push({ type: 'PORT_SPEC', lexeme: portMatch[0], len: portMatch[0].length });
    }

    if (candidates.length === 0) {
      // Lexical error
      const errLexeme = remaining.match(/^[^\s:;]+/)?.[0] || ch;
      const errorObj = {
        type: 'LEXICAL_ERROR',
        lexeme: errLexeme,
        line: startLine,
        col: startCol,
        message: `Lexical error: unrecognized token '${errLexeme}' at line ${startLine}, col ${startCol}`
      };
      errors.push(errorObj);
      steps.push({
        type: 'error',
        error: errorObj,
        index: startIndex,
        line: startLine,
        col: startCol
      });
      index += errLexeme.length;
      col += errLexeme.length;
      continue;
    }

    // Tie-break: longest match first, then keyword priority over ID
    candidates.sort((a, b) => {
      if (b.len !== a.len) return b.len - a.len;
      const aIsKw = KEYWORDS.includes(a.type) || ['COLON', 'SEMICOLON', 'RULE'].includes(a.type);
      const bIsKw = KEYWORDS.includes(b.type) || ['COLON', 'SEMICOLON', 'RULE'].includes(b.type);
      if (aIsKw && !bIsKw) return -1;
      if (!aIsKw && bIsKw) return 1;
      return 0;
    });

    const chosen = candidates[0];
    const tok = {
      type: chosen.type,
      lexeme: chosen.lexeme,
      value: chosen.value || chosen.lexeme,
      line: startLine,
      col: startCol,
      startIndex,
      endIndex: startIndex + chosen.len
    };
    tokens.push(tok);

    // Live update symbol table if ID
    if (tok.type === 'ID') {
      if (!symbolTable.has(tok.lexeme)) {
        symbolTable.set(tok.lexeme, {
          id: tok.lexeme,
          line: startLine,
          col: startCol,
          action: null,
          type: null,
          proto: null,
          ports: null,
          network: null
        });
      }
    }

    steps.push({
      type: 'token',
      token: tok,
      candidates,
      chosen,
      index: startIndex,
      line: startLine,
      col: startCol,
      desc: `Matched '${chosen.lexeme}' as ${chosen.type} (length ${chosen.len})`
    });

    index += chosen.len;
    col += chosen.len;
  }

  // End of input token
  const eofTok = {
    type: '$',
    lexeme: '$',
    value: '$',
    line,
    col,
    startIndex: index,
    endIndex: index
  };
  tokens.push(eofTok);
  steps.push({
    type: 'eof',
    token: eofTok,
    desc: 'End of input ($) reached'
  });

  return {
    tokens,
    errors,
    steps,
    symbolTable: Array.from(symbolTable.values())
  };
}
