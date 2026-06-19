# Quality Document

This is a codebase health snapshot for the Python Wizard RPG POC. It supports
Harness Engineering work by making the current strengths, gaps, and verification
state visible to the next session.

Update cadence: after each significant feature session, before a benchmark or
demo pass, and after major asset/layout changes.

Grading scale:

- A: verification passing, clean architecture, agent-legible, stable tests
- B: verification passing, mostly clean, minor gaps in legibility or coverage
- C: partially working, known gaps, manual verification still important
- D: not working, unsafe, or structurally unclear

## Product Domains

| Domain | Grade | Verification | Agent Legibility | Test Stability | Key Gaps | Last Updated |
|--------|-------|-------------|-----------------|---------------|----------|-------------|
| Chapter 1 Content/Data | B | Frontend build passes | JSON is centralized in `lessons/game` | Schema coverage exists but not automated here | Needs schema validation command in harness | 2026-06-19 |
| Battle Engine | B | Frontend build passes | Engine logic isolated in `src/game/battle` | Demo/test coverage is light | Add focused tests for wrong-answer and cap behavior | 2026-06-19 |
| Battle UI/Animations | C | Frontend build passes | Components are findable | Manual visual testing required | Ongoing overlap, asset scale, and feel tuning | 2026-06-19 |
| Learning Flow | B | Frontend build passes | Tutorial/spellbook/hint components are separated | Manual UI testing required | Spellbook/pageflip needs periodic visual check | 2026-06-19 |
| World Map/Progress | B | Frontend build passes | `progressStore` is isolated | Manual refresh testing required | No automated localStorage tests | 2026-06-19 |
| Backend Runtime | B | Existing FastAPI endpoints present | Backend services are small | Compile/import check only | Not integrated into RPG flow yet | 2026-06-19 |

## Architectural Layers

| Layer | Grade | Boundary Enforcement | Agent Legibility | Key Gaps | Last Updated |
|-------|-------|---------------------|-----------------|----------|-------------|
| React Game Shell | B | UI lives under `frontend/src/game` | Good file separation by feature | Needs visual regression or smoke path | 2026-06-19 |
| Battle Engine | B | Engine separate from UI | Types and validation are explicit | More automated tests needed | 2026-06-19 |
| Lesson/Data Contracts | B | JSON data separate from components | Good enough for React consumption | Add schema validation in init/check script | 2026-06-19 |
| Asset Pipeline | C | Assets under `frontend/public/assets` | Folders are clear | Filename conventions still inconsistent | 2026-06-19 |
| FastAPI Backend | B | Runtime endpoint isolated | Small and readable | Not currently used by RPG battle loop | 2026-06-19 |
| Harness Docs | B | Templates now project-specific | Clear current commands and rules | Need to decide when to copy templates to root | 2026-06-19 |

## Change History

### 2026-06-19

- Changes: Adjusted harness templates for current Python Wizard RPG POC.
- Domains promoted: Harness Docs from generic to project-specific.
- Demoted: none.
- New gaps identified: manual visual checks remain important after asset/layout work.
- Gaps closed: removed generic chat/document-import placeholders from templates.
