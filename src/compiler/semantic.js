// Semantic Analyzer and Policy Conflict Checker for NFRC

export function ipToInt(ip) {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) >>> 0) + ((parts[1] << 16) >>> 0) + ((parts[2] << 8) >>> 0) + (parts[3] >>> 0);
}

export function intToIp(intVal) {
  return [
    (intVal >>> 24) & 255,
    (intVal >>> 16) & 255,
    (intVal >>> 8) & 255,
    intVal & 255
  ].join('.');
}

export function parseIpCidr(ipSpec) {
  const [ipStr, prefixStr] = ipSpec.split('/');
  const prefix = prefixStr !== undefined ? parseInt(prefixStr, 10) : 32;
  const octets = ipStr.split('.').map(Number);

  // Validate octets
  if (octets.length !== 4 || octets.some(o => isNaN(o) || o < 0 || o > 255)) {
    return { valid: false, error: `Invalid IPv4 address octet in '${ipSpec}' (must be 0-255)` };
  }

  // Validate prefix
  if (isNaN(prefix) || prefix < 0 || prefix > 32) {
    return { valid: false, error: `Invalid CIDR prefix '/${prefixStr}' (must be 0-32)` };
  }

  const ipNum = ipToInt(ipStr);
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const netNum = (ipNum & mask) >>> 0;

  // Check host bits if prefix < 32
  if (prefix < 32 && (ipNum & ~mask) !== 0) {
    return {
      valid: false,
      error: `CIDR '${ipSpec}' is not in network form (host bits set; network is ${intToIp(netNum)}/${prefix})`
    };
  }

  const startIp = netNum;
  const endIp = (netNum | (~mask >>> 0)) >>> 0;

  return {
    valid: true,
    ipStr,
    prefix,
    normalized: `${intToIp(netNum)}/${prefix}`,
    startIp,
    endIp
  };
}

export function parsePortSpec(portSpec) {
  if (portSpec.includes('-')) {
    const [startStr, endStr] = portSpec.split('-');
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);

    if (isNaN(start) || start < 1 || start > 65535) {
      return { valid: false, error: `Port range start '${startStr}' out of range [1-65535]` };
    }
    if (isNaN(end) || end < 1 || end > 65535) {
      return { valid: false, error: `Port range end '${endStr}' out of range [1-65535]` };
    }
    if (start > end) {
      return { valid: false, error: `Port range start (${start}) cannot exceed end (${end})` };
    }
    return { valid: true, start, end, rangeStr: `${start}–${end}`, isRange: true };
  } else {
    const port = parseInt(portSpec, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      return { valid: false, error: `Port '${portSpec}' out of range [1-65535]` };
    }
    return { valid: true, start: port, end: port, rangeStr: `${port}–${port}`, isRange: false };
  }
}

export function analyzeSemantics(tokens) {
  const errors = [];
  const warnings = [];
  const rules = [];
  const seenIds = new Set();
  const symbolTable = [];

  // Group tokens into rules
  let currentRuleTokens = [];
  for (const t of tokens) {
    if (t.type === '$') break;
    currentRuleTokens.push(t);
    if (t.type === 'SEMICOLON') {
      // Process one rule: RULE ID COLON ACTION CONDITION SEMICOLON
      const idTok = currentRuleTokens.find(tok => tok.type === 'ID');
      const actionTok = currentRuleTokens.find(tok => tok.type === 'ACTION');
      const protoTok = currentRuleTokens.find(tok => tok.type === 'PROTOCOL');
      const portTok = currentRuleTokens.find(tok => tok.type === 'PORT');
      const portSpecTok = currentRuleTokens.find(tok => tok.type === 'PORT_SPEC');
      const sourceTok = currentRuleTokens.find(tok => tok.type === 'SOURCE');
      const ipSpecTok = currentRuleTokens.find(tok => tok.type === 'IP_SPEC');

      if (idTok) {
        const ruleId = idTok.lexeme;
        // Duplicate ID check
        if (seenIds.has(ruleId)) {
          errors.push({
            type: 'DUPLICATE_RULE_ID',
            ruleId,
            line: idTok.line,
            message: `Semantic error: Duplicate rule identifier '${ruleId}' at line ${idTok.line}`
          });
        }
        seenIds.add(ruleId);

        let parsedCondition = null;
        let symEntry = null;

        if (portSpecTok && protoTok) {
          const portCheck = parsePortSpec(portSpecTok.lexeme);
          if (!portCheck.valid) {
            errors.push({
              type: 'INVALID_PORT',
              ruleId,
              line: portSpecTok.line,
              message: `Semantic error in ${ruleId}: ${portCheck.error}`
            });
          }
          parsedCondition = {
            kind: 'PORT',
            proto: protoTok.value,
            ports: portCheck,
            start: portCheck.start,
            end: portCheck.end
          };
          symEntry = {
            id: ruleId,
            line: idTok.line,
            action: actionTok?.value,
            type: 'PORT',
            proto: protoTok.value,
            ports: portCheck.valid ? `${portCheck.start}–${portCheck.end}` : portSpecTok.lexeme,
            network: null
          };
        } else if (ipSpecTok && sourceTok) {
          const ipCheck = parseIpCidr(ipSpecTok.lexeme);
          if (!ipCheck.valid) {
            errors.push({
              type: 'INVALID_IP',
              ruleId,
              line: ipSpecTok.line,
              message: `Semantic error in ${ruleId}: ${ipCheck.error}`
            });
          }
          parsedCondition = {
            kind: 'SOURCE_IP',
            ip: ipCheck,
            startIp: ipCheck.startIp,
            endIp: ipCheck.endIp
          };
          symEntry = {
            id: ruleId,
            line: idTok.line,
            action: actionTok?.value,
            type: 'SOURCE_IP',
            proto: null,
            ports: null,
            network: ipCheck.valid ? ipCheck.normalized : ipSpecTok.lexeme
          };
        }

        if (symEntry) {
          symbolTable.push(symEntry);
        }

        rules.push({
          id: ruleId,
          action: actionTok?.value,
          condition: parsedCondition,
          line: idTok.line
        });
      }

      currentRuleTokens = [];
    }
  }

  // Policy Conflict Detection (opposite actions on overlapping scope)
  const conflicts = [];
  for (let i = 0; i < rules.length; i++) {
    for (let j = i + 1; j < rules.length; j++) {
      const r1 = rules[i];
      const r2 = rules[j];
      if (!r1.condition || !r2.condition) continue;
      if (r1.action === r2.action) continue; // Same action is not a policy conflict

      if (r1.condition.kind === 'PORT' && r2.condition.kind === 'PORT') {
        if (r1.condition.proto === r2.condition.proto) {
          const overlap = Math.max(r1.condition.start, r2.condition.start) <= Math.min(r1.condition.end, r2.condition.end);
          if (overlap) {
            conflicts.push({
              rule1: r1.id,
              rule2: r2.id,
              action1: r1.action,
              action2: r2.action,
              type: 'PORT_OVERLAP',
              description: `Policy conflict: ${r1.id} (${r1.action} ${r1.condition.proto} ${r1.condition.ports.rangeStr}) overlaps with ${r2.id} (${r2.action} ${r2.condition.proto} ${r2.condition.ports.rangeStr})`
            });
          }
        }
      } else if (r1.condition.kind === 'SOURCE_IP' && r2.condition.kind === 'SOURCE_IP') {
        if (r1.condition.ip?.valid && r2.condition.ip?.valid) {
          const overlap = Math.max(r1.condition.startIp, r2.condition.startIp) <= Math.min(r1.condition.endIp, r2.condition.endIp);
          if (overlap) {
            conflicts.push({
              rule1: r1.id,
              rule2: r2.id,
              action1: r1.action,
              action2: r2.action,
              type: 'IP_OVERLAP',
              description: `Policy conflict: ${r1.id} (${r1.action} ${r1.condition.ip.normalized}) overlaps with ${r2.id} (${r2.action} ${r2.condition.ip.normalized})`
            });
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0 && conflicts.length === 0,
    errors,
    warnings,
    conflicts,
    rules,
    symbolTable
  };
}

