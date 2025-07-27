# LeaseSwift Design-Driven Requirements (DDR v1.3, adapted)

This document summarizes the goals and architecture of the MietLink platform. It is based on the original LeaseSwift DDR but updated to reflect the current Express and React implementation.

## 0. Scope & Success Criteria
- **Core use case**: Swiss lease hand-over connecting outgoing tenants with incoming candidates and landlords.
- **Target markets**: Zurich & Geneva with multilingual support (DE, FR, IT, EN, ES).
- **Primary KPIs**: ≤5 clicks for outgoing tenants to publish; ≤7 min incoming application; ≥80 % landlord acceptance of top‑3 dossiers.
- **Outcome KPI**: Landlord decision reported on ≥90 % of dossiers (voucher incentive).

## 1. Tech Stack
| Layer          | Choice                                   | Notes |
|--------------- |-------------------------------------------|-------|
| Front‑end      | React + TypeScript + Vite + Tailwind CSS  | SPA served from Express |
| Forms          | React‑Hook‑Form + Zod                     | Shared schemas with backend |
| Auth           | Replit OpenID Connect                     | Passwordless flow |
| API            | Express REST endpoints                    | TypeScript handlers |
| DB             | PostgreSQL (Supabase)                     | Row‑level security |
| Storage        | Supabase Storage                          | Presigned uploads |
| LLM            | OpenAI GPT‑4o                             | Contract parsing, doc classification, emails |
| OCR            | AWS Textract (planned)                    | Post‑process via LLM |
| Payments       | Stripe Checkout (TWINT primary)           | Badge upsell |
| Hosting        | Vercel / Supabase                         | EU-central |

## 2. Data Model (excerpt)
Tables include `users`, `properties`, `documents`, `candidates`, `tasks`, `visit_slots`, `payments` and `events`. Candidate status follows a state machine from `dossier_submitted` to `rejected`.

## 3. Key Flows
- **Outgoing Tenant Wizard**: property setup → task checklist → viewing slots → applicant desk.
- **Incoming Tenant Wizard**: document upload → AI cover letter → validation & badge → visit booking.

## 4. LLM Prompts
OpenAI prompts live in `/prompts/*.json` and power contract parsing, task generation, document classification, cover letters, score explanations and regie e-mails.

## 5. Security & Compliance
TLS 1.3, session cookies, Supabase RLS, data minimisation (docs auto-delete 14 d after email or 30 d after slot), EU data hosting and OpenAI zero-retention.

This updated DDR replaces the truncated assets in `attached_assets/` and matches the current repository layout.
