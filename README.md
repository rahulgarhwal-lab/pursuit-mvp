# Pursuit — Sprint 2 Intelligence RC1

This build keeps the accepted Day-1 UI/workflow from RC4.6 and upgrades the intelligence pipeline where real-role testing exposed trust failures.

## Locked from production RC4.6
- New Opportunity workflow
- opportunity library, archive/restore/delete
- recommendation color system and decision scale
- resume import integrity and My Profile audit
- verified additions / remembered evidence
- local-first storage and backup/restore behavior

## Sprint 2 P0 intelligence upgrades
### 1. Role identity before scoring
- Extracts exact role title patterns such as `Director of Product Management (Life Sciences & Healthcare)`.
- Looks for high-confidence company signals such as `At <Company>,`, company possessives, known source URLs, and existing specialist parsers.
- Avoids using page chrome or responsibility prose as a company name.
- Extracts compact location/work-model context, report-to context, and named portfolio context when the JD provides it.

### 2. Hiring-decision architecture
- Adds a senior enterprise/AI product-director archetype for roles explicitly combining portfolio leadership, enterprise products, production AI, cross-functional execution, and commercial/GTM accountability.
- Separates mandatory qualification gates from the five actual decision drivers.
- Treats `10+ years of product management` as a real eligibility gate rather than averaging it away.
- Production AI is not inferred from pilots, prototypes, or generic AI terminology.

### 3. Evidence retrieval instead of resume dumping
- Driver cards show up to three short, requirement-specific work-evidence snippets.
- Work/validated evidence is preferred over capability labels or summary prose.
- Evidence remains traceable to employer/role in the UI.
- Unrelated but impressive resume content is not allowed to fill an evidence card.

## Regression roles
- Clarivate — Director of Product Management (Life Sciences & Healthcare)
- Alnylam — Associate Director, CRM Product Owner
- ndd Medical Technologies — Product Manager, Digital Solutions

Do not merge this Sprint 2 RC into `main` until the real Clarivate JD plus Alnylam/ndd sanity checks pass in `dev`.


## Sprint 2 Model Intelligence RC1
This build changes the analysis architecture from deterministic JD parsing to:
1. GPT-5.6 semantic role / hiring-decision analysis
2. atomic evidence citation by ID
3. Pursuit deterministic scoring and truth auditing
4. model-assisted clarification wording

The existing opportunity workflow, archive/history, profile audit, and local persistence remain intact.

A small secure backend Worker is required. The OpenAI API key must stay in the Worker secret store, never in GitHub or browser code.

## RC1.1 intelligence-governance patch
- Role thesis is role-only; candidate fit/gaps cannot leak into `What this role really is`.
- Product-tenure/date math is calculated deterministically from resume role dates, not estimated by the model.
- Earlier differently titled work remains a clarification rather than being silently counted as PM tenure.
- One unresolved fact produces one clarification; product-tenure gate and driver questions are deduplicated.

## RC1.2 presentation-safety patch
- Internal evidence IDs are stripped from all user-facing model explanations.
- Driver reasons are capped at two concise sentences.
- Primary-risk explanations are compressed; detailed proof stays in evidence cards.
- No scoring, matching, hiring-gate, or recommendation logic changed.

## RC1.3 deterministic-scoring & stability patch
- The model interprets the role and selects evidence only; it no longer assigns fit grades or gate status.
- Pursuit deterministically assigns Strong / Partial / Adjacent / Gap and calculates ATS/recruiter/hiring-manager/recommendation.
- Same JD + same profile/evidence reuses the exact prior analysis, improving consistency and avoiding duplicate API cost.
- Evidence cards use short atomic fragments rather than raw resume paragraphs.
- Product-tenure gate buttons adapt to the JD's actual threshold.
- Primary-risk language is capped to a concise executive summary.

## RC1.4 decision-transparency patch
- Every material factor that holds Recruiter/Hiring Manager alignment below Strong must appear in `What would move this decision?`.
- Unresolved mandatory gates remain first and are deduplicated only against the same unresolved fact.
- Material adjacent/gap drivers appear as a clarification or explicit `Known gap`.
- Scoring, model prompts, evidence matching, caching, and recommendation logic are unchanged from RC1.3.

## RC1.5 capability/gate separation patch
- Proven capability is graded independently from duration/eligibility gates.
- An unresolved 8+/10+ year tenure requirement no longer downgrades proven product/portfolio leadership from Strong to Partial/Adjacent.
- ATS is strictly a resume/JD explicitness score; unresolved eligibility gates no longer reduce ATS.
- HCP/pharma commercialization decision movers are semantically deduplicated even when word order differs.
- The UI no longer injects mandatory gates a second time on top of `whatWouldChange`.
- No model prompt, Cloudflare Worker behavior, or API schema change from RC1.4.

## RC1.6 semantic truth-guard isolation
- Truth guards now apply only to the driver they semantically govern.
- HCP/pharma expertise can cap an HCP/pharma-domain driver, but cannot downgrade a separate product/portfolio-leadership driver merely because HCP appears in its description.
- Equivalent isolation applies to Veeva, production AI, interoperability, regulated-development, people-management, and CRM-ownership guards.
- No model prompt, Cloudflare Worker behavior, caching, or scoring formula change from RC1.5.

## RC1.7 final argenx transparency cleanup
- Duration/tenure wording is removed from a proven capability driver when the JD already has a separate product-tenure hard gate.
- Product/portfolio leadership can display Strong without visually implying that the 8+/10+ duration gate has already been cleared.
- Semantic analyses now use `decisionMoverItems` in the UI, so unresolved hard gates cannot disappear from `What would move this decision?`.
- Recommendation helper text now reflects the actual number of material unresolved movers.
- No scoring, truth-guard, model prompt, Worker, API, or caching changes from RC1.6.

## RC2.0 — Universal Evidence Contract
The reasoning model now decomposes any JD into five decision drivers and atomic proof dimensions, then labels selected evidence only as direct or transferable. The deterministic browser engine—not the model—turns that contract into Strong / Partial / Adjacent / Gap, ATS, recruiter alignment, hiring-manager alignment, and Apply/Pass.

Duration and eligibility are separate hard gates. Stable factKey values deduplicate unresolved facts without employer-, industry-, technology-, or job-specific scoring code. Named jobs are regression cases only.

## RC2.1 — Cross-role calibration

1. Two-pass AI: role understanding is frozen before candidate evidence is shown; a second AI pass scans the entire evidence set for every proof dimension.
2. Pattern-based aggregation: one weaker sub-dimension no longer automatically collapses a complex driver to Adjacent.
3. Decision UX: answerable gates/clarifications are separated from established weaker areas.

No employer-, platform-, industry-, or regression-role-specific scoring rule was added.

## RC2.2 — Clarification and gate precision

This release does not change scoring.

- AI clarifications now point to exactly one under-proven proof dimension using `dimensionId`.
- Pursuit deterministically suppresses a clarification if that dimension is already directly proven.
- Clarification labels/questions are dimension-level, not whole-driver repeats.
- One driver can produce at most one actionable clarification in the alignment contract.
- Experience-duration gates are rendered deterministically as an exact `N+ years of/in/as <experience>` requirement.
- Role analysis is explicitly prohibited from combining unrelated qualifications into one hard gate.
- Known limitations remain separate from answerable questions.

## DEV candidate polish
Presentation-only cleanup after RC2.2 intelligence acceptance:
- Normalizes experience-duration gate labels.
- Removes boilerplate such as `Candidate must have`, `Minimum`, and repeated `at least N years experience`.
- Does not change model prompts, evidence alignment, dimension aggregation, ATS, recruiter/HM scoring, recommendation logic, or truth controls.

## Final DEV candidate cleanup
Presentation/deterministic hardening only. The accepted RC2.2 AI alignment and scoring architecture is unchanged.

- Robust duration parsing for `Minimum`, `Minimum of`, `at least`, possessive `years’ experience`, and `N+ years`.
- One Quick Check = one timed fact; separately testable competency clauses are removed from duration gates.
- Summary strengths come only from directly proven proof dimensions.
- Copy-ready resume output contains selected material only.
- Internal `KEEP / PRIORITIZE` and `DEPRIORITIZE FOR THIS ROLE` instructions are removed.
- Unplaced validated evidence remains visible for manual placement but is not silently included in one-click full resume copy.

## RC2.3 — Atomic Role Contract Enforcement

This release fixes a generalized role-decomposition failure found during fresh dev testing.

The five hiring drivers remain candidate-independent and frozen. Before candidate evidence alignment:
1. an AI atomicity auditor rewrites only each driver's proof dimensions;
2. each dimension must represent one independently provable factual axis;
3. a deterministic multi-axis detector checks the audited contract;
4. if obvious compound dimensions remain, a focused repair pass runs once;
5. if the role contract is still compound, Pursuit fails closed instead of scoring misleading dimensions.

Examples of facts that must stay separate when independently provable:
- capability/ownership vs domain/customer context
- platform ownership vs technology/ecosystem experience
- strategy/roadmap vs outcomes/value
- stakeholder influence vs people management
- core capability vs enterprise/global scale
- AI/product experience vs production deployment
- delivery/process vs regulatory/compliance context

No ATS weights, dimension aggregation thresholds, recruiter/HM scoring, recommendation logic, evidence truth rules, or resume-output logic changed.
