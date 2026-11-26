// Self-Test Suite asserting Ground-Truth PART 0 invariants
import { CASE_STUDY_SOURCE, PRODUCTIONS, TERMINALS, NON_TERMINALS } from './grammar.js';
import { tokenize } from './lexer.js';
import { computeFirstSets, computeFollowSets } from './firstFollow.js';
import { buildCanonicalCollection, buildActionGotoTable, parseTokenStream } from './lrParser.js';
import { analyzeSemantics } from './semantic.js';
import { generateTAC } from './tac.js';

export function runSelfTests() {
  const results = [];
  let allPassed = true;

  function assert(name, condition, expected, actual) {
    const passed = Boolean(condition);
    if (!passed) allPassed = false;
    results.push({
      name,
      passed,
      expected: String(expected),
      actual: String(actual)
    });
  }

  try {
    // 1. Lexer test: 24 tokens including $
    const lexResult = tokenize(CASE_STUDY_SOURCE);
    assert(
      'Token Count equals 24 (including $)',
      lexResult.tokens.length === 24,
      24,
      lexResult.tokens.length
    );

    // 2. FIRST & FOLLOW sets
    const firstSets = computeFirstSets(PRODUCTIONS, NON_TERMINALS, TERMINALS);
    const followSets = computeFollowSets(PRODUCTIONS, NON_TERMINALS, 'P', firstSets);

    assert(
      'FIRST(P) equals {RULE}',
      JSON.stringify(firstSets['P']) === JSON.stringify(['RULE']),
      ['RULE'],
      firstSets['P']
    );
    assert(
      'FIRST(CONDITION) equals {PROTOCOL, SOURCE}',
      JSON.stringify(firstSets['CONDITION'].sort()) === JSON.stringify(['PROTOCOL', 'SOURCE'].sort()),
      ['PROTOCOL', 'SOURCE'],
      firstSets['CONDITION']
    );
    assert(
      'FOLLOW(P) equals {$}',
      JSON.stringify(followSets['P']) === JSON.stringify(['$']),
      ['$'],
      followSets['P']
    );
    assert(
      'FOLLOW(S) equals {$, RULE}',
      JSON.stringify(followSets['S'].sort()) === JSON.stringify(['$', 'RULE'].sort()),
      ['$', 'RULE'],
      followSets['S']
    );

    // 3. LR(1) Canonical collection: 16 states
    const { states, transitions } = buildCanonicalCollection(PRODUCTIONS, TERMINALS, NON_TERMINALS);
    assert(
      'Canonical LR(1) States Count equals 16',
      states.length === 16,
      16,
      states.length
    );

    // 4. ACTION/GOTO Table: 0 conflicts
    const { actionTable, gotoTable, conflicts } = buildActionGotoTable(states, transitions, PRODUCTIONS, TERMINALS, NON_TERMINALS);
    assert(
      'ACTION/GOTO Conflicts Count equals 0',
      conflicts.length === 0,
      0,
      conflicts.length
    );

    // 5. Full Parse Trace: 34 steps (23 shifts, 10 reductions, 1 accept)
    const parseRes = parseTokenStream(lexResult.tokens, actionTable, gotoTable, PRODUCTIONS);
    assert('Parse Result is SUCCESS', parseRes.success === true, true, parseRes.success);
    assert('Parse Trace Step Count equals 34', parseRes.steps.length === 34, 34, parseRes.steps.length);

    const shifts = parseRes.steps.filter(s => s.action.startsWith('Shift')).length;
    const reduces = parseRes.steps.filter(s => s.action.startsWith('Reduce')).length;
    const accepts = parseRes.steps.filter(s => s.action === 'ACCEPT').length;

    assert('Shift Count equals 23', shifts === 23, 23, shifts);
    assert('Reduce Count equals 10', reduces === 10, 10, reduces);
    assert('Accept Count equals 1', accepts === 1, 1, accepts);

    // 6. Semantic analysis
    const semRes = analyzeSemantics(lexResult.tokens);
    assert('Semantic Validation passes', semRes.valid === true, true, semRes.valid);
    assert('Symbol Table contains 3 rule IDs (R1, R2, R3)', semRes.symbolTable.length === 3, 3, semRes.symbolTable.length);

    // 7. TAC Generation: 7 temporaries (t1-t7) and 3 labels (L1-L3)
    const tacRes = generateTAC(semRes.rules);
    assert('TAC Temporaries Count equals 7', tacRes.tempCount === 7, 7, tacRes.tempCount);
    assert('TAC Labels Count equals 3', tacRes.labelCount === 3, 3, tacRes.labelCount);

  } catch (err) {
    allPassed = false;
    results.push({
      name: 'Exception during self-tests',
      passed: false,
      expected: 'No errors',
      actual: err.message
    });
  }

  return { allPassed, results };
}
