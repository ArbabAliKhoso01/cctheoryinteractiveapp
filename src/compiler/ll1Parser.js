// Recursive Descent Parser (RDP) & LL(1) Predictive Table
export const LL1_TRANSFORMED_PRODUCTIONS = [
  { id: 1, lhs: 'P', rhs: ['S'] },
  { id: 2, lhs: 'S', rhs: ['R', "S'"] },
  { id: 3, lhs: "S'", rhs: ['R', "S'"] },
  { id: 4, lhs: "S'", rhs: ['ε'] },
  { id: 5, lhs: 'R', rhs: ['RULE', 'ID', 'COLON', 'ACTION', 'CONDITION', 'SEMICOLON'] },
  { id: 6, lhs: 'CONDITION', rhs: ['PROTOCOL', 'PORT', 'PORT_SPEC'] },
  { id: 7, lhs: 'CONDITION', rhs: ['SOURCE', 'IP_SPEC'] }
];

export const LL1_TABLE = {
  P: {
    RULE: 'P -> S'
  },
  S: {
    RULE: "S -> R S'"
  },
  "S'": {
    RULE: "S' -> R S'",
    $: "S' -> ε"
  },
  R: {
    RULE: 'R -> RULE ID COLON ACTION CONDITION SEMICOLON'
  },
  CONDITION: {
    PROTOCOL: 'CONDITION -> PROTOCOL PORT PORT_SPEC',
    SOURCE: 'CONDITION -> SOURCE IP_SPEC'
  }
};

export const RDP_PSEUDOCODE = `P():
  S()

S():
  R()
  Sprime()

Sprime():
  if lookahead == RULE:
    R()
    Sprime()
  else if lookahead == $:
    /* ε reduction */
  else:
    error("Expected RULE or $")

R():
  match(RULE)
  match(ID)
  match(COLON)
  match(ACTION)
  CONDITION()
  match(SEMICOLON)

CONDITION():
  if lookahead == PROTOCOL:
    match(PROTOCOL)
    match(PORT)
    match(PORT_SPEC)
  else if lookahead == SOURCE:
    match(SOURCE)
    match(IP_SPEC)
  else:
    error("Expected PROTOCOL or SOURCE")`;

// Trace of RDP on the 1-rule case study
export const RDP_ONE_RULE_TRACE = [
  { step: 1, proc: 'P()', lookahead: 'RULE', callStack: ['P'], desc: 'Start parse; call S()' },
  { step: 2, proc: 'S()', lookahead: 'RULE', callStack: ['P', 'S'], desc: 'In S(); call R()' },
  { step: 3, proc: 'R()', lookahead: 'RULE', callStack: ['P', 'S', 'R'], desc: 'In R(); match(RULE)' },
  { step: 4, proc: 'R()', lookahead: 'ID', callStack: ['P', 'S', 'R'], desc: 'Consumed RULE; match(ID)' },
  { step: 5, proc: 'R()', lookahead: 'COLON', callStack: ['P', 'S', 'R'], desc: 'Consumed ID; match(COLON)' },
  { step: 6, proc: 'R()', lookahead: 'ACTION', callStack: ['P', 'S', 'R'], desc: 'Consumed COLON; match(ACTION)' },
  { step: 7, proc: 'CONDITION()', lookahead: 'PROTOCOL', callStack: ['P', 'S', 'R', 'CONDITION'], desc: 'In CONDITION(); lookahead is PROTOCOL' },
  { step: 8, proc: 'CONDITION()', lookahead: 'PORT', callStack: ['P', 'S', 'R', 'CONDITION'], desc: 'Consumed PROTOCOL; match(PORT)' },
  { step: 9, proc: 'CONDITION()', lookahead: 'PORT_SPEC', callStack: ['P', 'S', 'R', 'CONDITION'], desc: 'Consumed PORT; match(PORT_SPEC)' },
  { step: 10, proc: 'R()', lookahead: 'SEMICOLON', callStack: ['P', 'S', 'R'], desc: 'CONDITION returns; match(SEMICOLON)' },
  { step: 11, proc: 'S()', lookahead: '$', callStack: ['P', 'S'], desc: 'R() returns; call Sprime()' },
  { step: 12, proc: "Sprime()", lookahead: '$', callStack: ['P', 'S', "S'"], desc: "lookahead is $ -> take S' -> ε (return)" },
  { step: 13, proc: 'P()', lookahead: '$', callStack: [], desc: 'All calls returned; parse SUCCESS' }
];

