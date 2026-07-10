# plaa-mvp
Here's the full developer-ready product spec for PLAA
PLAA — Publishing & Layout Assistant Agent

PLAA is an AI-powered publishing and layout tool that turns raw content — hymn lyrics, newsletter articles, manuscripts — into fully designed, print-ready publications. Built by McAbility.

This repo contains the Phase 1 MVP, scoped to two document types: Hymnals and Newsletters/Magazines.

What it does


Sign in and create a project (Hymnal or Newsletter, with a chosen trim size and optional brand colors).
Intake — paste raw manuscript text. The AI Content Structuring Agent detects headings, verses, choruses, bylines, and paragraphs, and turns them into editable layout blocks.
Style — the AI Layout Designer Agent proposes 3 distinct visual directions (palette + typography). Pick one to lock the project's design system.
Canvas — edit any block directly, reorder them, add new ones, or use the AI Rewrite Agent to condense, expand, or change the tone of any block — all with a live paginated preview.
Export — mark the project's review status and open a print-ready view to print or save as PDF.


Tech stack


Frontend: React + Vite + TypeScript + Tailwind CSS
Backend: TypeScript API (backend/index.ts) built on the AppDeploy SDK — handles project CRUD and calls out to an AI model for structuring, style generation, and rewriting
Icons: lucide-react
Fonts: Playfair Display, EB Garamond, Lora, Merriweather, Inter, Poppins, Work Sans (loaded via Google Fonts in index.html)


Project structure

plaa-app/
├── backend/
│   └── index.ts              # API routes: projects CRUD + AI agents (structure, styles, rewrite)
├── src/
│   ├── App.tsx                # Root component + hash-based routing
│   ├── main.tsx                # Entry point
│   ├── index.css               # Tailwind directives + print styles
│   ├── types.ts                 # Shared types, doc-type config (Hymnal / Newsletter)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── NewProjectModal.tsx
│   │   ├── BlockRow.tsx           # Block editor row with AI rewrite popover
│   │   ├── StyleProposalCard.tsx
│   │   └── PagePreview.tsx        # Paginated, styled live preview / print render
│   ├── lib/
│   │   ├── auth.tsx                # Auth context (AppDeploy client)
│   │   ├── router.ts                # Minimal hash router (no external deps)
│   │   └── paginate.ts               # Pagination logic per doc type
│   └── pages/
│       ├── Landing.tsx
│       ├── Dashboard.tsx
│       ├── Workspace.tsx              # Intake / Style / Canvas / Export tabs
│       └── PrintView.tsx
├── tailwind.config.js          # Brand tokens: navy, gold, ink, parchment
├── index.html
└── tests/
    └── tests.txt                # 8 QA test scenarios

Brand tokens

TokenHexUsenavy#064A76Primary brand colorgold#C7A24AAccent / secondaryink#1A1A1ABody textparchment#FBF8F2Background

Defined in tailwind.config.js and used throughout as bg-navy, text-gold, etc.

Running this project

This app was scaffolded for deployment on the AppDeploy platform, which provides @appdeploy/client (frontend auth/API helpers) and @appdeploy/sdk (backend router, database, and AI generation helpers) as managed dependencies — there's no separate database or auth server to stand up yourself.

To run it:


Deploy this repo through AppDeploy (or an equivalent environment that provides the @appdeploy/client and @appdeploy/sdk packages), or
Adapt src/lib/auth.tsx and backend/index.ts to your own auth/database/AI provider if you're hosting this elsewhere.


Roadmap (post-MVP)


Additional document types: Workbook, Teacher Guide, Annual Report, Brochure
EPUB and PPTX export
Multi-user collaboration, comments, and approval workflow
Chart & Data Agent for data-heavy documents
Preflight/accessibility checks before export
AppDeploy publishing for a digital companion app


See the full product specification for details on all Phase 2+ features, database schema, and the complete multi-agent architecture.


Built by McAbility.
