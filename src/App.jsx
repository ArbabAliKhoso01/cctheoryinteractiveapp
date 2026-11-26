import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar, { PHASES } from './components/Sidebar.jsx';
import ExplainPanel from './components/ExplainPanel.jsx';
import ControlsBar from './components/ControlsBar.jsx';
import GlossaryModal from './components/GlossaryModal.jsx';
import SandboxDrawer from './components/SandboxDrawer.jsx';

import Phase0Overview from './components/phases/Phase0Overview.jsx';
import Phase1Pipeline from './components/phases/Phase1Pipeline.jsx';
import Phase2LanguageDesign from './components/phases/Phase2LanguageDesign.jsx';
import Phase3Grammar from './components/phases/Phase3Grammar.jsx';
import Phase4Lexical from './components/phases/Phase4Lexical.jsx';
import Phase5Syntax from './components/phases/Phase5Syntax.jsx';
import Phase6Errors from './components/phases/Phase6Errors.jsx';
import Phase7Semantic from './components/phases/Phase7Semantic.jsx';
import Phase8TAC from './components/phases/Phase8TAC.jsx';
import Phase9OptimTarget from './components/phases/Phase9OptimTarget.jsx';
import Phase10Integrated from './components/phases/Phase10Integrated.jsx';
import Phase11CriticalAnalysis from './components/phases/Phase11CriticalAnalysis.jsx';
import Phase12Summary from './components/phases/Phase12Summary.jsx';

import { runSelfTests } from './compiler/selfTest.js';

const EXPLANATIONS = {
  0: {
    title: 'Phase 0: Overview & Ground Truth',
    color: '#94A3B8',
    what: 'Presentation setup, team member roles, and the 3-rule integrated case-study program that serves as ground truth throughout all compiler phases.',
    why: 'Compiler construction requires mathematical determinism; using a unified case study guarantees consistent counts (16 states, 0 conflicts, 34 steps).',
    next: 'Examine the end-to-end 6-stage architecture and shared compiler services in Phase 1.',
    tip: 'Confirm to examiners that all figures are verified live in JS and asserted against Part 0 ground truth.'
  },
  1: {
    title: 'Phase 1: Compiler Pipeline',
    color: '#94A3B8',
    what: 'The 6 sequential transformation stages (Lexer -> Parser -> Semantic -> TAC -> Optimizer -> iptables) along with shared Error Handler and Central Symbol Table.',
    why: 'Clear separation of concerns allows each phase to maintain formal invariants without coupling to host OS or syntax quirks.',
    next: 'Review data types, operators, and deliberate DSL restrictions in Phase 2.',
    tip: 'Emphasize that the Central Symbol Table is populated in the lexer and queried continuously through target codegen.'
  },
  2: {
    title: 'Phase 2: Language Design',
    color: '#94A3B8',
    what: 'Specification of firewall rules: Port, IPv4, CIDR, and deliberate restrictions (IPv4 only, TCP/UDP only, no empty programs, one condition per rule).',
    why: 'Restricting rules to single conditions enforces the <=7 production limit, eliminating operator precedence ambiguities.',
    next: 'Inspect the Context-Free Grammar productions and leftmost derivation in Phase 3.',
    tip: 'Explain that "no empty program" is a security requirement: zero-rule firewalls leave undefined default policies.'
  },
  3: {
    title: 'Phase 3: Context-Free Grammar',
    color: '#A78BFA',
    what: 'Augmented grammar productions (0) to (6) and step-by-step leftmost derivation of Rule R1 with a growing SVG parse tree.',
    why: 'The grammar is strictly unambiguous; left-recursion S -> S R naturally models a left-associative sequence of firewall rules.',
    next: 'Move to lexical analysis to scan input characters into typed tokens in Phase 4.',
    tip: 'State clearly that operator precedence is not applicable because there are no arithmetic/boolean operators in the grammar.'
  },
  4: {
    title: 'Phase 4: Lexical Analysis',
    color: '#22D3EE',
    what: 'Character-by-character scanner emitting 24 tokens, updating the symbol table live, and resolving prefix conflicts via maximal munch.',
    why: 'Longest-match disambiguates numbers like 192.168.1.10 (IP_SPEC) from 192 (PORT_SPEC); keyword priority beats identifier R.',
    next: 'Perform syntax analysis with the 16-state Canonical LR(1) parser in Phase 5.',
    tip: 'Point out that "BLOCK" is caught here as a lexical error before any syntax checking begins.'
  },
  5: {
    title: 'Phase 5: Syntax Analysis (CLR(1))',
    color: '#8B5CF6',
    what: 'Canonical LR(1) parser engine: 16 states, conflict-free table, RDP LL(1) comparison, and full 34-step bottom-up parse trace.',
    why: 'CLR(1) is chosen because it embeds exact lookaheads into items, catching errors with zero extra reductions and 0 conflicts.',
    next: 'Examine syntax error diagnostics and synchronization recovery in Phase 6.',
    tip: 'Highlight that LR(0) is rejected due to state I2 conflict, while CLR(1) has 0 conflicts.'
  },
  6: {
    title: 'Phase 6: Error Detection & Recovery',
    color: '#F87171',
    what: 'Diagnosis of 10+ syntax/lexical/semantic error scenarios, pinpointing the exact empty ACTION table cell with caret output.',
    why: 'Demonstrates why synchronizing on RULE is suitable, whereas naive panic mode to ";" swallows Rule R2.',
    next: 'Validate port ranges, CIDR subnets, and policy collisions in Phase 7.',
    tip: 'Show examiners that a missing semicolon is caught in state I15 on lookahead RULE with ZERO extra reductions.'
  },
  7: {
    title: 'Phase 7: Semantic Analysis',
    color: '#F472B6',
    what: 'Validating ports (1-65535), IPv4 octets (0-255), CIDR host bits (network form), unique IDs, and opposite-action policy conflicts.',
    why: 'Syntax analysis accepts valid numbers; semantic analysis ensures safety against subnet misconfigurations and security bypasses.',
    next: 'Generate intermediate Three-Address Code with backpatching in Phase 8.',
    tip: 'Walk through the address inclusion diagram showing how 192.168.1.10/32 is shadowed by 192.168.1.0/24.'
  },
  8: {
    title: 'Phase 8: Intermediate Code (TAC)',
    color: '#FBBF24',
    what: 'Syntax-Directed Translation with backpatching, generating 7 temporaries (t1–t7) and 3 labels (L1–L3) implementing first-match logic.',
    why: 'TAC provides a machine-independent linear IR with explicit branching, perfectly modeling sequential packet filtering.',
    next: 'Apply safe optimizations and synthesize Linux iptables rules in Phase 9.',
    tip: 'Explain how backpatching resolves the forward jumps of CONDITION.falselist to R.next.'
  },
  9: {
    title: 'Phase 9: Optimizer & Target Code',
    color: '#34D399',
    what: 'Safe rule normalizations, duplicate detection, adjacent range merging rules, and compiled Linux iptables filter commands.',
    why: 'Firewall rules must preserve first-match evaluation; merging non-adjacent ranges is strictly forbidden because it alters policy semantics.',
    next: 'Scrub through all stages simultaneously in the integrated case study in Phase 10.',
    tip: 'Point to the safety notice: generated iptables text is for defense verification only and never executed.'
  },
  10: {
    title: 'Phase 10: Integrated Case Study',
    color: '#8B5CF6',
    what: 'Unified interactive slider controlling source, tokens, parse reductions, symbol table, TAC IR, and iptables in lockstep.',
    why: 'Provides examiners with 360-degree traceability for each rule in the case-study program.',
    next: 'Examine architectural limitations and the effect of adding ICMP in Phase 11.',
    tip: 'Move the slider to Rule R2 to show how the source IP branch directly maps to iptables -s.'
  },
  11: {
    title: 'Phase 11: Critical Analysis & What-If',
    color: '#A78BFA',
    what: 'Critique of DSL limitations (single-condition rules, conservative conflicts) and live demonstration of adding ICMP (17 states).',
    why: 'Demonstrates deep theoretical maturity by showing how grammar extensions ripple across compiler phases.',
    next: 'Review consolidated findings and defense cheat sheet in Phase 12.',
    tip: 'Show how adding CONDITION -> ICMP adds state I16 without introducing a single parsing conflict.'
  },
  12: {
    title: 'Phase 12: Summary & Defense',
    color: '#34D399',
    what: 'Consolidated review of verified invariants (16 states, 0 conflicts, 34 steps, 24 tokens) and anticipated examiner defense Q&A.',
    why: 'Serves as the concluding slide to defend the project and answer theoretical inquiries.',
    tip: 'Use the Q&A cards to answer questions regarding why operator precedence was skipped or why CLR(1) was chosen.'
  }
};

export default function App() {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [theme, setTheme] = useState('dark');
  const [presentationMode, setPresentationMode] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1400);

  // Self tests on startup
  useEffect(() => {
    const testRes = runSelfTests();
    console.log('--- NFRC COMPILER INVARIANT SELF-TESTS ---');
    console.log('All tests passed:', testRes.allPassed);
    testRes.results.forEach(r => {
      console.log(`${r.passed ? '✓' : '✗'} [${r.name}] Expected: ${r.expected}, Actual: ${r.actual}`);
    });
  }, []);

  // Sync theme attribute to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync presentation mode class to body
  useEffect(() => {
    if (presentationMode) {
      document.body.classList.add('presentation-mode');
    } else {
      document.body.classList.remove('presentation-mode');
    }
  }, [presentationMode]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Avoid hotkeys when typing in textarea or inputs
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight') {
        setCurrentPhase(prev => Math.min(PHASES.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentPhase(prev => Math.max(0, prev - 1));
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      } else if (e.key.toLowerCase() === 'f') {
        setPresentationMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'g') {
        setIsGlossaryOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-play timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentPhase(prev => {
          if (prev >= PHASES.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  const curExplain = EXPLANATIONS[currentPhase] || EXPLANATIONS[0];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* Top Navbar */}
      <Navbar
        currentPhase={currentPhase}
        totalPhases={PHASES.length}
        theme={theme}
        setTheme={setTheme}
        presentationMode={presentationMode}
        setPresentationMode={setPresentationMode}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onToggleSandbox={() => setIsSandboxOpen(prev => !prev)}
        isSandboxOpen={isSandboxOpen}
      />

      {/* Main Workspace Layout */}
      <div style={{
        display: 'flex',
        flex: 1,
        height: 'calc(100vh - 68px - 62px)',
        overflow: 'hidden'
      }}>
        {/* Left Sidebar */}
        <Sidebar
          currentPhase={currentPhase}
          onSelectPhase={(id) => setCurrentPhase(id)}
        />

        {/* Center Main Stage + Right Explain Panel */}
        <main style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: presentationMode ? '1fr' : '1.35fr 1fr',
          gap: '20px',
          padding: '20px',
          overflowY: 'auto'
        }}>
          {/* Active Phase Content Component */}
          <div style={{ overflowY: 'auto', paddingRight: '4px' }}>
            {currentPhase === 0 && <Phase0Overview />}
            {currentPhase === 1 && <Phase1Pipeline />}
            {currentPhase === 2 && <Phase2LanguageDesign />}
            {currentPhase === 3 && <Phase3Grammar />}
            {currentPhase === 4 && <Phase4Lexical />}
            {currentPhase === 5 && <Phase5Syntax />}
            {currentPhase === 6 && <Phase6Errors />}
            {currentPhase === 7 && <Phase7Semantic />}
            {currentPhase === 8 && <Phase8TAC />}
            {currentPhase === 9 && <Phase9OptimTarget />}
            {currentPhase === 10 && <Phase10Integrated />}
            {currentPhase === 11 && <Phase11CriticalAnalysis />}
            {currentPhase === 12 && <Phase12Summary />}
          </div>

          {/* Right Explain & Walkthrough Panel */}
          {!presentationMode && (
            <div style={{ height: '100%', overflowY: 'hidden' }}>
              <ExplainPanel
                phaseTitle={curExplain.title}
                phaseColor={curExplain.color}
                whatIsHappening={curExplain.what}
                why={curExplain.why}
                whatIsNext={curExplain.next}
                examinerTip={curExplain.tip}
              />
            </div>
          )}
        </main>
      </div>

      {/* Bottom Controls Bar */}
      <ControlsBar
        onPrev={() => setCurrentPhase(Math.max(0, currentPhase - 1))}
        onNext={() => setCurrentPhase(Math.min(PHASES.length - 1, currentPhase + 1))}
        canPrev={currentPhase > 0}
        canNext={currentPhase < PHASES.length - 1}
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        speed={speed}
        onChangeSpeed={setSpeed}
        onReset={() => setCurrentPhase(0)}
        subStepLabel={`Phase ${currentPhase}: ${PHASES[currentPhase].title}`}
      />

      {/* Modals & Drawers */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
      />

      <SandboxDrawer
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
      />
    </div>
  );
}

