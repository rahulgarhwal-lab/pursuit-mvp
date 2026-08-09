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
