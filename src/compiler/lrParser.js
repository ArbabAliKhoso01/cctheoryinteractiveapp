// Canonical LR(1) Parser Engine, Table Generator, and Parse Tracer
import { PRODUCTIONS, TERMINALS, NON_TERMINALS } from './grammar.js';
import { computeFirstSets, computeFirstOfSequence } from './firstFollow.js';

// Item representation: { prodId, dot, lookahead }
function itemKey(item) {
  return `${item.prodId}:${item.dot}:${item.lookahead}`;
}

export function closure(items, productions, firstSets) {
  const result = new Map();
  items.forEach(it => result.set(itemKey(it), it));

  let changed = true;
  while (changed) {
    changed = false;
    const currentItems = Array.from(result.values());
    for (const item of currentItems) {
      const prod = productions[item.prodId];
      if (item.dot < prod.rhs.length) {
        const B = prod.rhs[item.dot];
        const beta = prod.rhs.slice(item.dot + 1);
        const betaA = [...beta, item.lookahead];
        const lookaheads = computeFirstOfSequence(betaA, firstSets);

        // Find productions for B
        for (let pIdx = 0; pIdx < productions.length; pIdx++) {
          if (productions[pIdx].lhs === B) {
            for (const la of lookaheads) {
              if (la === 'ε') continue;
              const newItem = { prodId: pIdx, dot: 0, lookahead: la };
              const key = itemKey(newItem);
              if (!result.has(key)) {
                result.set(key, newItem);
                changed = true;
              }
            }
          }
        }
      }
    }
  }

  // Return sorted items
  return Array.from(result.values()).sort((a, b) => {
    if (a.prodId !== b.prodId) return a.prodId - b.prodId;
    if (a.dot !== b.dot) return a.dot - b.dot;
    return a.lookahead.localeCompare(b.lookahead);
  });
}

export function gotoState(items, symbol, productions, firstSets) {
  const moved = [];
  for (const item of items) {
    const prod = productions[item.prodId];
    if (item.dot < prod.rhs.length && prod.rhs[item.dot] === symbol) {
      moved.push({ prodId: item.prodId, dot: item.dot + 1, lookahead: item.lookahead });
    }
  }
  if (moved.length === 0) return null;
  return closure(moved, productions, firstSets);
}

function stateCoreKey(items) {
  // Sort and create fingerprint
  return items.map(itemKey).join('|');
}

export function buildCanonicalCollection(productions = PRODUCTIONS, terminals = TERMINALS, nonTerminals = NON_TERMINALS) {
  const firstSets = computeFirstSets(productions, nonTerminals, terminals);

  // Initial item: [P' -> • P, $]
  const initialItem = { prodId: 0, dot: 0, lookahead: '$' };
  const I0 = closure([initialItem], productions, firstSets);

  const states = [I0];
  const stateKeys = new Map();
  stateKeys.set(stateCoreKey(I0), 0);

  const transitions = []; // { from, symbol, to }

  // Symbol order: Non-terminals (P, S, R, CONDITION), then terminals
  const ntOrder = ['P', 'S', 'R', 'CONDITION'].filter(nt => nonTerminals.includes(nt));
  const tOrder = terminals.filter(t => t !== '$');
  const orderedSymbols = [...ntOrder, ...tOrder, '$'];

  let queueIdx = 0;
  while (queueIdx < states.length) {
    const currentI = states[queueIdx];
    const currentId = queueIdx;

    for (const sym of orderedSymbols) {
      if (sym === "P'") continue;
      const nextI = gotoState(currentI, sym, productions, firstSets);
      if (nextI && nextI.length > 0) {
        const key = stateCoreKey(nextI);
        let targetId;
        if (stateKeys.has(key)) {
          targetId = stateKeys.get(key);
        } else {
          targetId = states.length;
          states.push(nextI);
          stateKeys.set(key, targetId);
        }
        transitions.push({ from: currentId, symbol: sym, to: targetId });
      }
    }
    queueIdx++;
  }

  return { states, transitions, firstSets };
}

export function buildActionGotoTable(states, transitions, productions = PRODUCTIONS, terminals = TERMINALS, nonTerminals = NON_TERMINALS) {
  const actionTable = {}; // stateId -> { terminal: action }
  const gotoTable = {};   // stateId -> { nonTerminal: stateId }
  const conflicts = [];

  for (let i = 0; i < states.length; i++) {
    actionTable[i] = {};
    gotoTable[i] = {};
  }

  // 1. Fill transitions (Shifts and Gotos)
  for (const trans of transitions) {
    const { from, symbol, to } = trans;
    if (terminals.includes(symbol)) {
      if (actionTable[from][symbol] && actionTable[from][symbol] !== `s${to}`) {
        conflicts.push({
          state: from,
          symbol,
          existing: actionTable[from][symbol],
          conflicting: `s${to}`,
          type: 'shift-shift'
        });
      }
      actionTable[from][symbol] = `s${to}`;
    } else if (nonTerminals.includes(symbol)) {
      gotoTable[from][symbol] = to;
    }
  }

  // 2. Fill Reductions and Accept
  for (let sId = 0; sId < states.length; sId++) {
    const items = states[sId];
    for (const item of items) {
      const prod = productions[item.prodId];
      if (item.dot === prod.rhs.length) {
        // Dot at end -> reduction or accept
        if (prod.lhs === "P'" && item.lookahead === '$') {
          if (actionTable[sId]['$'] && actionTable[sId]['$'] !== 'acc') {
            conflicts.push({
              state: sId,
              symbol: '$',
              existing: actionTable[sId]['$'],
              conflicting: 'acc',
              type: 'accept-conflict'
            });
          }
          actionTable[sId]['$'] = 'acc';
        } else {
          const la = item.lookahead;
          const reduceAction = `r${item.prodId}`;
          if (actionTable[sId][la] && actionTable[sId][la] !== reduceAction) {
            conflicts.push({
              state: sId,
              symbol: la,
              existing: actionTable[sId][la],
              conflicting: reduceAction,
              type: actionTable[sId][la].startsWith('s') ? 'shift-reduce' : 'reduce-reduce'
            });
          } else {
            actionTable[sId][la] = reduceAction;
          }
        }
      }
    }
  }

  return { actionTable, gotoTable, conflicts };
}

// Full 34-step LR parse tracer
export function parseTokenStream(tokens, actionTable, gotoTable, productions = PRODUCTIONS) {
  // Stack entries: { state, symbol, treeNode }
  const stack = [{ state: 0, symbol: '$', treeNode: null }];
  const steps = [];
  let tokenIdx = 0;
  let stepNumber = 1;

  let nextNodeId = 1;

  while (tokenIdx < tokens.length) {
    const currentToken = tokens[tokenIdx];
    const lookahead = currentToken.type;
    const currentState = stack[stack.length - 1].state;
    const action = actionTable[currentState]?.[lookahead];

    const currentStackSnapshot = stack.map(s => ({ state: s.state, symbol: s.symbol }));
    const remainingTokensSnapshot = tokens.slice(tokenIdx).map(t => t.type);

    if (!action) {
      steps.push({
        stepNumber,
        state: currentState,
        lookahead,
        action: 'error',
        description: `Syntax error at line ${currentToken.line}, col ${currentToken.col}: unexpected '${currentToken.lexeme}' in state I${currentState}`,
        stack: currentStackSnapshot,
        remainingInput: remainingTokensSnapshot,
        errorToken: currentToken
      });
      return { success: false, steps, error: `Syntax error in state I${currentState} on '${lookahead}'` };
    }

    if (action.startsWith('s')) {
      const nextState = parseInt(action.slice(1), 10);
      const leafNode = {
        id: `leaf_${nextNodeId++}`,
        label: `${currentToken.type}(${currentToken.lexeme})`,
        type: 'terminal',
        token: currentToken,
        children: []
      };

      steps.push({
        stepNumber,
        state: currentState,
        lookahead,
        action: `Shift s${nextState}`,
        rawAction: action,
        description: `Shift '${currentToken.lexeme}' (${lookahead}), push state ${nextState}`,
        stack: currentStackSnapshot,
        remainingInput: remainingTokensSnapshot,
        shiftedToken: currentToken
      });

      stack.push({
        state: nextState,
        symbol: lookahead,
        treeNode: leafNode
      });
      tokenIdx++;
    } else if (action.startsWith('r')) {
      const prodId = parseInt(action.slice(1), 10);
      const prod = productions[prodId];
      const popCount = prod.rhs.length;

      const childrenNodes = [];
      for (let p = 0; p < popCount; p++) {
        const popped = stack.pop();
        childrenNodes.unshift(popped.treeNode);
      }

      const topState = stack[stack.length - 1].state;
      const nextGotoState = gotoTable[topState]?.[prod.lhs];

      const parentNode = {
        id: `node_${nextNodeId++}`,
        label: prod.lhs,
        prodId,
        type: 'nonterminal',
        children: childrenNodes
      };

      steps.push({
        stepNumber,
        state: currentState,
        lookahead,
        action: `Reduce r${prodId}`,
        rawAction: action,
        prodId,
        production: `${prod.lhs} -> ${prod.rhs.join(' ')}`,
        description: `Reduce by (${prodId}) ${prod.lhs} -> ${prod.rhs.join(' ')}, pop ${popCount} symbols, goto(${topState}, ${prod.lhs}) = ${nextGotoState}`,
        stack: currentStackSnapshot,
        remainingInput: remainingTokensSnapshot,
        reducedNode: parentNode
      });

      stack.push({
        state: nextGotoState,
        symbol: prod.lhs,
        treeNode: parentNode
      });
    } else if (action === 'acc') {
      const finalRoot = stack[stack.length - 1].treeNode;
      steps.push({
        stepNumber,
        state: currentState,
        lookahead,
        action: 'ACCEPT',
        rawAction: 'acc',
        description: `State ${currentState} on '$' reached ACCEPT. Parsing successfully completed!`,
        stack: currentStackSnapshot,
        remainingInput: remainingTokensSnapshot,
        tree: finalRoot
      });
      return { success: true, steps, parseTree: finalRoot };
    }

    stepNumber++;
    if (stepNumber > 200) {
      return { success: false, steps, error: 'Infinite loop guard triggered' };
    }
  }

  return { success: false, steps, error: 'Unexpected end of input stream' };
}
