// Syntax, Lexical, and Semantic Error Scenarios and Recovery Strategies
export const ERROR_SCENARIOS = [
  {
    id: 'missing-colon',
    title: 'Missing Colon after Rule ID',
    code: 'RULE R1 ALLOW TCP PORT 443;\nRULE R2: DENY SOURCE 192.168.1.10;',
    badToken: 'ALLOW',
    state: 6,
    lookahead: 'ACTION',
    stage: 'syntax',
    diagnostic: 'Syntax error: expected ":" after rule ID R1, encountered ACTION "ALLOW".',
    caretLine: 1,
    caretCol: 9,
    whyEarly: 'State I6 contains [R -> RULE ID • COLON ...]. Only COLON is valid; ACTION cannot follow ID without COLON.',
    recovery: {
      panicMode: 'Skip tokens until next rule boundary ("RULE")',
      phraseLevel: 'Insert missing ":" and continue parse',
      stop: 'Halt parsing immediately with precise line/column'
    }
  },
  {
    id: 'missing-semicolon',
    title: 'Missing Semicolon (Zero Extra Reductions)',
    code: 'RULE R1: ALLOW TCP PORT 443\nRULE R2: DENY SOURCE 192.168.1.10;',
    badToken: 'RULE',
    state: 15,
    lookahead: 'RULE',
    stage: 'syntax',
    diagnostic: 'Syntax error: expected ";" after port specification "443", encountered "RULE".',
    caretLine: 2,
    caretCol: 1,
    whyEarly: 'CLR(1) catches this in state I15 on lookahead "RULE" with ZERO extra reductions because item lookahead is strictly {SEMICOLON}.',
    recovery: {
      panicMode: 'Sync on "RULE" (FIRST(R) and FOLLOW(R)) - keeps R2 intact!',
      naivePanic: 'Naive panic skipping to next ";" swallows R2 entirely!',
      phraseLevel: 'Insert missing ";"'
    }
  },
  {
    id: 'missing-condition',
    title: 'Missing Condition',
    code: 'RULE R1: ALLOW ;\nRULE R2: DENY SOURCE 192.168.1.10;',
    badToken: ';',
    state: 8,
    lookahead: 'SEMICOLON',
    stage: 'syntax',
    diagnostic: 'Syntax error: expected PROTOCOL (TCP/UDP) or SOURCE after ACTION, encountered ";".',
    caretLine: 1,
    caretCol: 15,
    whyEarly: 'State I8 expects CONDITION (starting with PROTOCOL or SOURCE). Semicolon is invalid.',
    recovery: {
      panicMode: 'Skip to next RULE',
      stop: 'Halt parse'
    }
  },
  {
    id: 'missing-port-spec',
    title: 'Missing Port Spec after PORT keyword',
    code: 'RULE R1: ALLOW TCP PORT ;\nRULE R2: DENY SOURCE 192.168.1.10;',
    badToken: ';',
    state: 13,
    lookahead: 'SEMICOLON',
    stage: 'syntax',
    diagnostic: 'Syntax error: expected port number or range after "PORT", encountered ";".',
    caretLine: 1,
    caretCol: 25,
    whyEarly: 'State I13 only accepts PORT_SPEC.',
    recovery: {
      panicMode: 'Skip to next RULE',
      stop: 'Halt parse'
    }
  },
  {
    id: 'missing-ip-spec',
    title: 'Missing IP Spec after SOURCE keyword',
    code: 'RULE R1: DENY SOURCE ;\nRULE R2: ALLOW TCP PORT 80;',
    badToken: ';',
    state: 11,
    lookahead: 'SEMICOLON',
    stage: 'syntax',
    diagnostic: 'Syntax error: expected IPv4 or CIDR address after "SOURCE", encountered ";".',
    caretLine: 1,
    caretCol: 22,
    whyEarly: 'State I11 only accepts IP_SPEC.',
    recovery: {
      panicMode: 'Skip to next RULE',
      stop: 'Halt parse'
    }
  },
  {
    id: 'missing-rule-keyword',
    title: 'Missing "RULE" Keyword',
    code: 'R1: ALLOW TCP PORT 443;',
    badToken: 'R1',
    state: 0,
    lookahead: 'ID',
    stage: 'syntax',
    diagnostic: 'Syntax error: expected "RULE" at start of program, encountered ID "R1".',
    caretLine: 1,
    caretCol: 1,
    whyEarly: 'State I0 on ID has no valid shift action. FIRST(P) = {RULE}.',
    recovery: {
      panicMode: 'Skip until next "RULE"',
      stop: 'Halt parse'
    }
  },
  {
    id: 'empty-file',
    title: 'Empty File',
    code: '',
    badToken: '$',
    state: 0,
    lookahead: '$',
    stage: 'syntax',
    diagnostic: 'Syntax error: program requires at least one rule. Unexpected end-of-file ($) in state I0.',
    caretLine: 1,
    caretCol: 1,
    whyEarly: 'State I0 on "$" has no transition because S requires at least one R (no epsilon).',
    recovery: {
      stop: 'Halt parse with diagnostic'
    }
  },
  {
    id: 'stray-semicolon',
    title: 'Stray Semicolon',
    code: 'RULE R1: ALLOW TCP PORT 443; ;\nRULE R2: DENY SOURCE 192.168.1.10;',
    badToken: ';',
    state: 2,
    lookahead: 'SEMICOLON',
    stage: 'syntax',
    diagnostic: 'Syntax error: unexpected ";" in state I2 after rule completion.',
    caretLine: 1,
    caretCol: 30,
    whyEarly: 'In state I2, valid actions are shift RULE or reduce P->S on "$". Stray ";" is rejected.',
    recovery: {
      panicMode: 'Discard stray token and resume',
      stop: 'Halt parse'
    }
  },
  {
    id: 'lexical-unknown-word',
    title: 'Lexical Error: Unknown Keyword "BLOCK"',
    code: 'RULE R1: BLOCK TCP PORT 443;',
    badToken: 'BLOCK',
    stage: 'lexical',
    diagnostic: 'Lexical error: unrecognized token "BLOCK" at line 1, col 10 (not in action set ALLOW|DENY).',
    caretLine: 1,
    caretCol: 10,
    whyEarly: 'Rejected at scanning phase before parser invocation.',
    recovery: {
      stop: 'Halt scanner or skip invalid word'
    }
  },
  {
    id: 'lexical-illegal-char',
    title: 'Lexical Error: Illegal Character "@"',
    code: 'RULE R1: ALLOW TCP PORT 443; @',
    badToken: '@',
    stage: 'lexical',
    diagnostic: 'Lexical error: illegal character "@" at line 1, col 30.',
    caretLine: 1,
    caretCol: 30,
    whyEarly: 'Character "@" matches no token pattern or whitespace.',
    recovery: {
      stop: 'Halt scanner'
    }
  },
  {
    id: 'semantic-port-out-of-range',
    title: 'Semantic Error: Port 70000 Out of Range',
    code: 'RULE R1: ALLOW TCP PORT 70000;',
    badToken: '70000',
    stage: 'semantic',
    diagnostic: 'Semantic error in R1: Port "70000" out of range [1-65535]. Parser accepted the syntax!',
    caretLine: 1,
    caretCol: 25,
    whyEarly: 'The parser accepts any [0-9]+; semantic analysis validates the integer bounds.',
    recovery: {
      stop: 'Reject code generation'
    }
  },
  {
    id: 'semantic-inverted-port-range',
    title: 'Semantic Error: Inverted Port Range 2000-1000',
    code: 'RULE R1: ALLOW TCP PORT 2000-1000;',
    badToken: '2000-1000',
    stage: 'semantic',
    diagnostic: 'Semantic error in R1: Port range start (2000) cannot exceed end (1000).',
    caretLine: 1,
    caretCol: 25,
    whyEarly: 'Port range integrity check fails in semantic pass.',
    recovery: {
      stop: 'Reject code generation'
    }
  },
  {
    id: 'semantic-bad-ip-octet',
    title: 'Semantic Error: Invalid IPv4 Octet 300.1.1.1',
    code: 'RULE R1: DENY SOURCE 300.1.1.1;',
    badToken: '300.1.1.1',
    stage: 'semantic',
    diagnostic: 'Semantic error in R1: Invalid IPv4 address octet in "300.1.1.1" (must be 0-255).',
    caretLine: 1,
    caretCol: 21,
    whyEarly: 'Parser regex only checks digits and dots; semantic pass validates octet limits.',
    recovery: {
      stop: 'Reject code generation'
    }
  },
  {
    id: 'semantic-bad-cidr-prefix',
    title: 'Semantic Error: CIDR Prefix /40',
    code: 'RULE R1: DENY SOURCE 192.168.1.0/40;',
    badToken: '/40',
    stage: 'semantic',
    diagnostic: 'Semantic error in R1: Invalid CIDR prefix "/40" (must be 0-32).',
    caretLine: 1,
    caretCol: 21,
    whyEarly: 'IPv4 prefixes cannot exceed 32 bits.',
    recovery: {
      stop: 'Reject code generation'
    }
  },
  {
    id: 'semantic-duplicate-id',
    title: 'Semantic Error: Duplicate Rule ID "R1"',
    code: 'RULE R1: ALLOW TCP PORT 443;\nRULE R1: DENY SOURCE 10.0.0.1;',
    badToken: 'R1',
    stage: 'semantic',
    diagnostic: 'Semantic error: Duplicate rule identifier "R1" at line 2.',
    caretLine: 2,
    caretCol: 6,
    whyEarly: 'Rule identifiers must be unique in the symbol table.',
    recovery: {
      stop: 'Reject code generation'
    }
  },
  {
    id: 'semantic-policy-conflict',
    title: 'Semantic Error: Policy Conflict (Opposite Actions on Overlap)',
    code: 'RULE R1: DENY SOURCE 192.168.1.10;\nRULE R2: ALLOW SOURCE 192.168.1.0/24;',
    badToken: 'Overlap',
    stage: 'semantic',
    diagnostic: 'Policy conflict: R1 (DENY 192.168.1.10/32) overlaps with R2 (ALLOW 192.168.1.0/24). Code generation aborted!',
    caretLine: 2,
    caretCol: 1,
    whyEarly: 'Opposite security actions on overlapping IP spaces require human review to prevent security bypass.',
    recovery: {
      stop: 'Abort target code generation; present conflict visualization'
    }
  }
];

