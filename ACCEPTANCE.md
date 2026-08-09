# RC4 quick acceptance

1. Open the standalone build in the same browser used for RC3.
2. Confirm Pursuit automatically rebuilds the saved resume evidence; re-upload only if no source resume was previously saved.
3. Analyze the same role that produced the bad `Agile product delivery` card.
4. Confirm:
   - `Evaluate ...` is never interpreted as UAT/Agile.
   - degrees/certifications never appear as work evidence for Agile or other role capabilities.
   - each driver title matches its JD requirement text.
   - each evidence statement is semantically relevant to that driver.
5. Open My Profile and confirm Education and Certification records are separate.
6. Run Alnylam and/or ndd as a sanity check; the stricter decision model and archived-opportunity behavior should remain intact.


## RC4.1 opportunity identity check
- Analysis header leads with `Company | exact job title`.
- Second line shows location, industry, and level when available.
- Third line shows compact search/recollection anchors (for example Veeva preferred, experience years, CRM / Commercial & Medical).
- `What this role really is` remains immediately below the factual identity.
- `Copy job search` copies company + quoted job title for quick LinkedIn Jobs searching.
- Active and Archived opportunity rows use the same `Company | Title` identity.


## RC4.2 compact opportunity header
- Opportunity identity is compact reference context, not a hero section.
- Company | exact title stays visually primary but should not push the decision analysis below the fold.
- Location / industry / level and search anchors remain visible in two compact lines.
- `What this role really is` remains directly beneath the identity in a single compact strip.
- Common page chrome such as `Overview` is removed from parsed company/title metadata.


## RC4.3 analysis-runtime safety
- Analyze completes locally instead of remaining on `Reading between the JD lines…`.
- Metadata cleaning helper is present and strips page chrome such as `Overview` safely.
- Any future analysis exception restores the Analyze button and shows a visible error instead of an infinite loading state.
- Reanalyze has the same fail-safe and never mutates an archived snapshot on failure.


## RC4.4 usability acceptance
- On a normal laptop viewport, the `Analyze role` button is visible without requiring a scroll after opening New Opportunity.
- Existing intelligence/scoring behavior is unchanged.
- One or multiple opportunity cards can be selected.
- Active selected opportunities can be archived in one action.
- Archived selected opportunities can be restored in one action.
- Selected opportunities can be permanently deleted after an explicit confirmation.
- Switching Active/Archived clears the prior selection to prevent accidental hidden bulk actions.


## RC4.6 acceptance
- Opportunity workflow and scoring outputs are unchanged from RC4.4.
- Analyze this role is visually obvious without changing the intake steps.
- HIGH PRIORITY/APPLY is green, SELECTIVE APPLY is amber, LOW PROBABILITY/PASS is red.
- My Profile clearly explains the source resume as a read-only foundation.
- Parsed work history, education, and certifications can be reviewed in the same structural groupings as the resume.
- Only user-validated additions/gaps appear under Verified additions.
- A verified addition can be edited or removed.
- No brain emoji appears in the profile or remembered-evidence UI.


## RC4.6 profile extraction audit
- Opportunity workflow, scoring, and recommendation logic remain unchanged.
- Review what Pursuit extracted shows work history, professional summary, all role work evidence/impact, core capabilities, technologies/platforms, domains/functions, normalized matching skill signals, scientific/early-career evidence, education, and certifications.
- Work evidence is grouped by role and remains read-only because the source resume is the system of record.
- Matching skill signals are derived only from resume-source evidence and show source-evidence support counts.

# Sprint 2 Intelligence RC1 — P0 acceptance

## Clarivate regression
Using the real Director of Product Management (Life Sciences & Healthcare) JD:
- Company must be `Clarivate` — never `Work This`, `Overview`, or responsibility prose.
- Title must be `Director of Product Management (Life Sciences & Healthcare)`.
- Location/work context should resolve to `Remote US / Barcelona / London` when those locations are in the JD.
- `What this role really is` must describe portfolio direction, enterprise scale, production AI, and commercial/customer outcomes.
- Top five must be:
  1. Senior product strategy & portfolio leadership
  2. Enterprise product leadership at scale
  3. Production AI product delivery
  4. Cross-functional product execution & senior stakeholder influence
  5. Commercial, GTM & customer-market leadership
- Scientific/biomedical foundation must not become a hiring gate because the JD lists life sciences/healthcare under preferred experience.
- The `10+ years of product-management experience` requirement must be handled as a separate mandatory gate.
- Pursuit must not count older non-product titles automatically toward the 10-year gate.
- AI pilots/exploration must not be treated as production AI without clarification.
- Evidence cards must show short, requirement-specific evidence snippets, not a full role/resume dump.

## Expected pre-clarification behavior for the current reference resume
- Recommendation: `SELECTIVE APPLY`
- Product strategy & portfolio: Strong
- Enterprise product leadership: Strong
- Production AI: Partial / needs clarification
- Cross-functional execution: Strong
- Commercial/GTM/customer-market: Strong
- 10+ product-management years: Uncertain until confirmed
- Evidence confidence: Medium

## Decision movement
- If 10+ genuine product-management years are confirmed AND production AI deployment is confirmed, the role is eligible to move to `HIGH PRIORITY - APPLY` when all five decision drivers are Strong.
- If the candidate confirms fewer than 10 years of genuine product-management work, recommendation becomes `PASS` because a mandatory requirement is not met.

## Regression protection
- Alnylam must remain CRM-specific and conservative about direct CRM-platform ownership/Veeva/field-process experience.
- ndd must remain conservative about direct healthcare domain, interoperability, and regulated Quality/Regulatory/Clinical experience.


## Sprint 2 model-intelligence acceptance
- Role identity must be semantically correct even when company casing/formatting is unusual.
- Exact title must not absorb surrounding prose.
- Exactly five hiring-decision drivers must reflect hiring gates/differentiators, not generic keyword buckets.
- Preferred qualifications must not be promoted to hiring gates.
- Each driver may cite at most four atomic evidence records by ID.
- Strong fit cannot survive without defensible cited evidence.
- Empty `Not touching these claims` is hidden.
- Meaningful protected claims are explicit.
- Model/API failure creates no saved score and never silently falls back to the legacy engine.

## RC1.1 governance acceptance
- `What this role really is` contains role/accountability only and no candidate assessment.
- The model does not estimate candidate tenure from dates.
- Explicitly titled product tenure is calculated by Pursuit from resume year ranges.
- A 10+ year product-management requirement produces one unresolved tenure question, not duplicate questions.
- Product-management-year gates expose the existing quick-check control and can be resolved once.

## RC1.2 presentation acceptance
- No internal evidence ID may appear anywhere in the UI.
- A driver explanation is at most two sentences and does not dump resume history.
- `What is holding this back` is concise; detailed evidence remains in Top-5 evidence cards.
- Intelligence/scoring behavior is unchanged from RC1.1.

## RC1.3 stability acceptance
- Model output contains no candidate fit grade and no hard-gate status.
- Pursuit assigns all fit statuses and final scores deterministically.
- Same JD + unchanged profile/evidence returns the same cached analysis and does not make another model call.
- Model-selected evidence is rendered as at most three atomic snippets.
- Product tenure quick-check uses the actual JD threshold.

## RC1.4 transparency acceptance
- Clarivate 10+ year PM tenure gate appears exactly once.
- Clarivate production-AI weakness appears separately under `What would move this decision?`.
- No unrelated factor is suppressed merely because it shares words such as `product management`.
- RC1.3 scoring and same-input cache behavior remain unchanged.

## RC1.5 regression acceptance
- Argenx product/portfolio leadership can grade Strong while the separate 8+ year tenure gate remains Uncertain.
- An unresolved tenure gate may affect recommendation/confidence but must not lower the capability grade.
- ATS must not be directly penalized by unresolved work-authorization or tenure gates.
- Rephrased HCP/pharma commercialization movers appear once.
- UI must not duplicate mandatory gates already present in `whatWouldChange`.

## RC1.6 argenx regression acceptance
- `Senior product ownership and portfolio leadership for commercialization technology` grades Strong from direct product/portfolio evidence even if its description mentions HCP.
- `Pharma/life-sciences domain experience and US HCP commercialization & engagement understanding` remains Adjacent/Partial unless direct HCP/pharma evidence exists.
- HCP truth guard must never contaminate product-strategy/product-portfolio capability.
- Separate 8+ year tenure gate remains unresolved until confirmed.

## RC1.7 argenx closure acceptance
- Product capability label does not contain `(8+ years)` when a separate 8+ year product-tenure gate exists.
- Product capability remains Strong.
- Separate 8+ year product-tenure gate appears under `What would move this decision?` as `Mandatory gate — confirm once`.
- US pharma/HCP expertise appears once as a separate decision mover.
- Recommendation helper count matches the material mover count.

## RC2.0 universal-engine acceptance
- Same engine must handle materially different jobs without code changes.
- Capability and experience duration are always separate.
- Transferable evidence cannot become direct merely through similarity.
- Matrix leadership cannot become direct people management without direct evidence.
- Pilot/AI experience cannot become production evidence without direct production evidence.
- Integration cannot become named platform/standard ownership without direct evidence.
- Business-case/value evidence cannot become direct P&L/budget ownership.
- Hard gates are created only from explicit mandatory JD requirements.
- factKey performs generic unresolved-fact deduplication.
- No named employer or regression job belongs in deterministic universal scoring logic.

## RC2.1 acceptance
- 3 direct critical dimensions -> Strong.
- 2 direct + 1 transferable -> Partial.
- 1 direct + 2 transferable -> Adjacent.
- 2 direct + 1 missing -> Adjacent.
- all transferable -> Adjacent.
- confirmed negative -> Gap.
- known limitations never appear in `What would move this decision?`.
- recommendation question count excludes known limitations.
- role interpretation and evidence alignment are separate AI passes.

## RC2.2 precision acceptance
- Clarification must reference one real proof dimension by dimensionId.
- If that dimension state is Direct, clarification is suppressed.
- Clarification display label is the dimension label, not the full driver label.
- Clarification question contains one factual issue, not multiple bundled facts.
- Experience-duration display label preserves the numeric threshold and measured experience.
- `Minimum 10 years of product management experience including leadership roles` normalizes to a 10+ year product-management duration gate.
- A capability driver may remain Strong/Partial independently of its duration gate.
- No scoring thresholds or employer-specific rules change in RC2.2.
