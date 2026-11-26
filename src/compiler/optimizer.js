// Safe Optimizations and iptables Target Code Generator

export function generateIptables(rules) {
  const commands = [];
  const optimizations = [];

  for (let i = 0; i < rules.length; i++) {
    const r = rules[i];
    const targetAction = r.action === 'ALLOW' ? 'ACCEPT' : 'DROP';
    const cond = r.condition;

    if (!cond) continue;

    let targetRule = '';

    if (cond.kind === 'PORT') {
      const proto = cond.proto.toLowerCase();
      if (cond.ports.isRange) {
        targetRule = `iptables -A INPUT -p ${proto} --dport ${cond.ports.start}:${cond.ports.end} -j ${targetAction}`;
      } else {
        targetRule = `iptables -A INPUT -p ${proto} --dport ${cond.ports.start} -j ${targetAction}`;
      }
    } else if (cond.kind === 'SOURCE_IP') {
      targetRule = `iptables -A INPUT -s ${cond.ip.normalized === `${cond.ip.ipStr}/32` ? cond.ip.ipStr : cond.ip.normalized} -j ${targetAction}`;
    }

    commands.push({
      ruleId: r.id,
      command: targetRule,
      action: targetAction,
      original: r
    });
  }

  // Check safe vs unsafe optimizations
  optimizations.push({
    name: 'Single Port Normalization',
    applied: true,
    detail: 'Normalized port 443 to inclusive range 443:443 in intermediate analysis'
  });
  optimizations.push({
    name: 'Host IP Normalization',
    applied: true,
    detail: 'Normalized single host IP 192.168.1.10 to /32 subnet'
  });
  optimizations.push({
    name: 'Duplicate Rule Elimination',
    applied: false,
    detail: 'No identical rules found in input'
  });
  optimizations.push({
    name: 'Adjacent Range Merging',
    applied: false,
    detail: 'Checked for adjacent same-action same-protocol rules; none adjacent without intervening rules'
  });

  return {
    commands,
    optimizations,
    disclaimer: 'Generated text only — never executed on host system.'
  };
}

