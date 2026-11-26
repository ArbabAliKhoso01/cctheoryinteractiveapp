// Three-Address Code (TAC) Intermediate Code Generator with Backpatching

export function generateTAC(semanticRules) {
  let tempCounter = 1;
  let labelCounter = 1;

  const instructions = [];
  const sdtSteps = [];

  for (let rIdx = 0; rIdx < semanticRules.length; rIdx++) {
    const rule = semanticRules[rIdx];
    const isLast = rIdx === semanticRules.length - 1;
    const nextLabel = `L${labelCounter++}`;

    const cond = rule.condition;
    const ruleInstructions = [];

    if (cond.kind === 'PORT') {
      const t1 = `t${tempCounter++}`;
      const t2 = `t${tempCounter++}`;
      const t3 = `t${tempCounter++}`;

      const lo = cond.ports.start;
      const hi = cond.ports.end;

      ruleInstructions.push({
        text: `${t1} = proto == ${cond.proto}`,
        type: 'assignment',
        temp: t1,
        ruleId: rule.id,
        desc: `Check protocol matches ${cond.proto}`
      });
      ruleInstructions.push({
        text: `if_false ${t1} goto ${nextLabel}`,
        type: 'branch',
        label: nextLabel,
        ruleId: rule.id,
        desc: `If protocol doesn't match, skip to next rule (${nextLabel})`
      });

      ruleInstructions.push({
        text: `${t2} = dport >= ${lo}`,
        type: 'assignment',
        temp: t2,
        ruleId: rule.id,
        desc: `Check destination port >= ${lo}`
      });
      ruleInstructions.push({
        text: `if_false ${t2} goto ${nextLabel}`,
        type: 'branch',
        label: nextLabel,
        ruleId: rule.id,
        desc: `If port < ${lo}, skip to next rule (${nextLabel})`
      });

      ruleInstructions.push({
        text: `${t3} = dport <= ${hi}`,
        type: 'assignment',
        temp: t3,
        ruleId: rule.id,
        desc: `Check destination port <= ${hi}`
      });
      ruleInstructions.push({
        text: `if_false ${t3} goto ${nextLabel}`,
        type: 'branch',
        label: nextLabel,
        ruleId: rule.id,
        desc: `If port > ${hi}, skip to next rule (${nextLabel})`
      });
    } else if (cond.kind === 'SOURCE_IP') {
      const t = `t${tempCounter++}`;
      const net = cond.ip.normalized;

      ruleInstructions.push({
        text: `${t} = src in ${net}`,
        type: 'assignment',
        temp: t,
        ruleId: rule.id,
        desc: `Check if source IP is within network ${net}`
      });
      ruleInstructions.push({
        text: `if_false ${t} goto ${nextLabel}`,
        type: 'branch',
        label: nextLabel,
        ruleId: rule.id,
        desc: `If IP outside ${net}, skip to next rule (${nextLabel})`
      });
    }

    // Action return
    const targetAction = rule.action === 'ALLOW' ? 'ACCEPT' : 'DROP';
    ruleInstructions.push({
      text: `return ${targetAction}`,
      type: 'return',
      ruleId: rule.id,
      desc: `Match! Return firewall action ${targetAction}`
    });

    sdtSteps.push({
      ruleId: rule.id,
      reduction: `R -> RULE ID COLON ACTION CONDITION SEMICOLON`,
      labelCreated: nextLabel,
      instructions: [...ruleInstructions]
    });

    instructions.push({
      label: rIdx === 0 ? null : `L${rIdx}`,
      instructions: ruleInstructions
    });
  }

  // Final fall-through label and default return
  const finalLabel = `L${labelCounter - 1}`;
  instructions.push({
    label: finalLabel,
    instructions: [
      {
        text: 'return DEFAULT',
        type: 'return',
        ruleId: 'DEFAULT',
        desc: 'Default firewall fall-through policy when no rule matches'
      }
    ]
  });

  // Flat lines list for display
  const flatLines = [];
  instructions.forEach(blk => {
    blk.instructions.forEach((ins, idx) => {
      const prefix = (idx === 0 && blk.label) ? `${blk.label}:`.padEnd(8, ' ') : '        ';
      flatLines.push({
        label: (idx === 0 && blk.label) ? blk.label : null,
        text: ins.text,
        fullLine: `${prefix}${ins.text}`,
        ruleId: ins.ruleId,
        desc: ins.desc,
        temp: ins.temp
      });
    });
  });

  return {
    instructions,
    flatLines,
    sdtSteps,
    tempCount: tempCounter - 1,
    labelCount: labelCounter - 1
  };
}

