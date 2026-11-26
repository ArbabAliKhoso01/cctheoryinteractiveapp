// Ground-Truth Grammar Specification for Network Firewall Rule Compiler (NFRC)

export const TERMINALS = [
  'RULE',
  'ID',
  'COLON',
  'ACTION',
  'PROTOCOL',
  'PORT',
  'PORT_SPEC',
  'SOURCE',
  'IP_SPEC',
  'SEMICOLON',
  '$'
];

export const NON_TERMINALS = ['P\'', 'P', 'S', 'R', 'CONDITION'];

export const PRODUCTIONS = [
  { id: 0, lhs: "P'", rhs: ['P'] },
  { id: 1, lhs: 'P', rhs: ['S'] },
  { id: 2, lhs: 'S', rhs: ['S', 'R'] },
  { id: 3, lhs: 'S', rhs: ['R'] },
  { id: 4, lhs: 'R', rhs: ['RULE', 'ID', 'COLON', 'ACTION', 'CONDITION', 'SEMICOLON'] },
  { id: 5, lhs: 'CONDITION', rhs: ['PROTOCOL', 'PORT', 'PORT_SPEC'] },
  { id: 6, lhs: 'CONDITION', rhs: ['SOURCE', 'IP_SPEC'] }
];

export const CASE_STUDY_SOURCE = `RULE R1: ALLOW TCP PORT 443;
RULE R2: DENY SOURCE 192.168.1.10;
RULE R3: DENY UDP PORT 1000-2000;`;

export const KEYWORDS = ['RULE', 'ALLOW', 'DENY', 'TCP', 'UDP', 'PORT', 'SOURCE'];

// ICMP Extended Grammar for What-If Analysis
export const PRODUCTIONS_WITH_ICMP = [
  ...PRODUCTIONS,
  { id: 7, lhs: 'CONDITION', rhs: ['ICMP'] }
];
export const TERMINALS_WITH_ICMP = [
  'RULE', 'ID', 'COLON', 'ACTION', 'PROTOCOL', 'PORT', 'PORT_SPEC', 'SOURCE', 'IP_SPEC', 'ICMP', 'SEMICOLON', '$'
];

