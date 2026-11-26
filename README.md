# Network Firewall Rule Compiler (NFRC) — Interactive React Presentation

A self-contained, interactive React application and live presentation aid built for the **Compiler Construction Theory Group Project (5th Semester)**.

All compiler phases (Lexer, Parser, Semantic Analysis, TAC IR, and Target Codegen) are **computed live from the formal grammar definition** and asserted against the project's verified ground-truth invariants:
- **16 Canonical LR(1) States** (I0 to I15)
- **0 Parsing Conflicts** (Strictly conflict-free CLR(1) table)
- **Exact 34-Step Parse Trace** (23 shifts, 10 reductions, 1 accept)
- **24 Emitted Tokens** (including end-of-file `$`)
- **7 Temporaries (`t1`–`t7`) & 3 Labels (`L1`–`L3`)** in intermediate TAC

---

## How to Run & Present

### Option A: Local Vite Dev Server (Recommended for Live Defense)
```bash
# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

1. Push this project to a GitHub, GitLab, or Bitbucket repository.
2. In Vercel, choose **Add New → Project** and import that repository.
3. Keep the detected settings, or use `npm run build` as the build command and `dist` as the output directory.
4. Choose **Deploy**. Future pushes to the connected branch will trigger new deployments.

The root `vercel.json` provides the build command and output directory for Vercel. No environment variables are required.

### Option B: Standalone Single-File (100% Offline, Zero Server)
Open `standalone.html` directly in any web browser (Chrome, Firefox, Edge, Safari):
- Double-click `standalone.html` or drag it into your browser.
- Contains all HTML, CSS, JavaScript, and inline SVGs bundled in a single file.

---

## Interactive Features & Presentation Aids

1. **Dual-Panel Defense Layout**:
   - **Left Panel**: Interactive visual diagrams (Pipeline, Derivation, Scanner tape, LR State Machine, Parse Trace Stack, Overlap Diagram, etc.).
   - **Right Panel**: Plain-language **Explain Panel** answering:
     - *What is happening in this exact step?*
     - *Why was this compiler design decision made?*
     - *What is the next step?*
     - *Examiner Defense Tip* providing targeted technical responses.

2. **Keyboard Shortcuts**:
   - `←` / `→` : Previous / Next phase or sub-step
   - `Space` : Auto-Play / Pause advance
   - `F` : Presentation / Fullscreen Mode (larger fonts for projectors, hides sidebar)
   - `G` : Open Compiler Construction Glossary

3. **Persistent Sandbox Drawer**:
   - Click the **"Sandbox"** button in the header (or press the drawer toggle) to type custom firewall rules or load presets.
   - Executes live through all phases (Lexer → Parser → Semantic → TAC → iptables) with error handling.

4. **Self-Test Verification**:
   - On load, the system runs `runSelfTests()` and logs green assertions for all ground-truth numbers in the browser console.

---

## Compiler Phases Included

- **Phase 0: Overview & Ground Truth**: Case-study program, group member placeholders, verified invariant badges.
- **Phase 1: Compiler Pipeline**: 6-stage architecture with animated data packet flow + shared Error Handler and Central Symbol Table.
- **Phase 2: Language Design**: Data types, deliberate restrictions with technical justifications, valid vs invalid rule cards.
- **Phase 3: Context-Free Grammar**: Productions (0) to (6), interactive leftmost derivation with growing SVG parse tree.
- **Phase 4: Lexical Analysis**: Maximal-munch scanning tape, conflict clinic (`192.168.1.10`, `RULE` vs `R1`, `1000-2000`, `BLOCK`, `@`), live symbol table.
- **Phase 5: Syntax Analysis (CLR(1))**:
  - *5.1 RDP & LL(1)*: Left-recursion elimination, LL(1) table, call stack trace.
  - *5.2 Parser Comparison*: LR(0) state I2 conflict vs SLR(1), LALR(1), and CLR(1).
  - *5.3 Operator Precedence Check*: Formal rejection of operator grammar due to `S → S R`.
  - *5.4 Augmentation*: `P' → P` and initial item `[P' → • P, $]`.
  - *5.5 FIRST & FOLLOW*: Live computed lookahead sets.
  - *5.6 Closure & GOTO*: Step-by-step closure walkthrough for State I0.
  - *5.7 16 States Diagram*: Canonical LR(1) collection with clickable state inspector.
  - *5.8 ACTION/GOTO Table*: 16 states, colour-coded actions, 0 conflicts verification.
  - *5.9 34-Step Parse Trace*: Stack, input tape, consulted table cell, and bottom-up tree builder.
- **Phase 6: Error Detection & Recovery**: 10+ error gallery, empty table cell lookup, early catch in CLR(1), suitable vs naive panic mode comparison.
- **Phase 7: Semantic Analysis**: Port range (1–65535), IPv4 octets, CIDR network form (no host bits set), duplicate IDs, policy conflict diagram.
- **Phase 8: Intermediate Code (TAC)**: Syntax-Directed Translation with backpatching, generating 7 temporaries and 3 labels.
- **Phase 9: Optimizer & Target Code**: Safe optimizations (normalization, duplicate removal, adjacent merge restrictions) and Linux `iptables` generation.
- **Phase 10: Integrated Case Study**: Unified scrubber timeline synchronizing source, tokens, parse step, tree, symbol table, TAC, and iptables.
- **Phase 11: Critical Analysis & What-If**: Disjoint condition limitations, directional shadowing, and the live ripple-effect of adding `ICMP` (17 states).
- **Phase 12: Summary & Defense**: Final recap card and anticipated examiner questions cheat-sheet.

