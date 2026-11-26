// Computation of FIRST and FOLLOW sets live from grammar
import { PRODUCTIONS, NON_TERMINALS, TERMINALS } from './grammar.js';

export function computeFirstSets(productions = PRODUCTIONS, nonTerminals = NON_TERMINALS, terminals = TERMINALS) {
  const first = {};

  terminals.forEach(t => {
    first[t] = new Set([t]);
  });
  nonTerminals.forEach(nt => {
    first[nt] = new Set();
  });

  let changed = true;
  while (changed) {
    changed = false;
    for (const prod of productions) {
      const { lhs, rhs } = prod;
      const beforeSize = first[lhs].size;

      let allEpsilon = true;
      for (const sym of rhs) {
        if (!first[sym]) {
          first[sym] = new Set([sym]);
        }
        for (const item of first[sym]) {
          if (item !== 'ε') {
            first[lhs].add(item);
          }
        }
        if (!first[sym].has('ε')) {
          allEpsilon = false;
          break;
        }
      }
      if (allEpsilon) {
        first[lhs].add('ε');
      }

      if (first[lhs].size > beforeSize) {
        changed = true;
      }
    }
  }

  // Convert Sets to sorted Arrays
  const result = {};
  for (const k of Object.keys(first)) {
    result[k] = Array.from(first[k]).sort();
  }
  return result;
}

export function computeFirstOfSequence(symbols, firstSets) {
  const result = new Set();
  let allCanBeEmpty = true;

  for (const sym of symbols) {
    const symFirst = firstSets[sym] || (sym === '$' ? ['$'] : [sym]);
    for (const f of symFirst) {
      if (f !== 'ε') result.add(f);
    }
    if (!symFirst.includes('ε')) {
      allCanBeEmpty = false;
      break;
    }
  }

  if (allCanBeEmpty) {
    result.add('ε');
  }
  return Array.from(result).sort();
}

export function computeFollowSets(productions = PRODUCTIONS, nonTerminals = NON_TERMINALS, startSymbol = 'P', firstSets = null) {
  if (!firstSets) {
    firstSets = computeFirstSets(productions, nonTerminals);
  }

  const follow = {};
  nonTerminals.forEach(nt => {
    follow[nt] = new Set();
  });

  follow[startSymbol].add('$');

  let changed = true;
  while (changed) {
    changed = false;
    for (const prod of productions) {
      const { lhs, rhs } = prod;
      for (let i = 0; i < rhs.length; i++) {
        const B = rhs[i];
        if (!nonTerminals.includes(B)) continue;

        const beta = rhs.slice(i + 1);
        const beforeSize = follow[B].size;

        if (beta.length > 0) {
          const firstBeta = computeFirstOfSequence(beta, firstSets);
          for (const f of firstBeta) {
            if (f !== 'ε') follow[B].add(f);
          }
          if (firstBeta.includes('ε')) {
            for (const item of follow[lhs]) {
              follow[B].add(item);
            }
          }
        } else {
          for (const item of follow[lhs]) {
            follow[B].add(item);
          }
        }

        if (follow[B].size > beforeSize) {
          changed = true;
        }
      }
    }
  }

  const result = {};
  for (const k of nonTerminals) {
    result[k] = Array.from(follow[k]).sort();
  }
  return result;
}
