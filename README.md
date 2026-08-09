# Pursuit Release Candidate 4.4

RC4.4 preserves the accepted decision model and opportunity archive from RC3, and hardens the resume-import and evidence-matching pipeline.

## RC4.4 integrity changes
- Resume evidence is typed as work, capability, summary, education, certification, scientific background, or validated evidence.
- Education/certification evidence cannot support work-experience capabilities such as Agile, CRM ownership, leadership, or delivery.
- Two-column PDF credential extraction is reconstructed into separate education and certification records.
- Suspicious credential rows are repaired where deterministic; otherwise they are quarantined and excluded from matching.
- Wrapped professional and scientific bullets are reconstructed before evidence matching.
- Core-capability lines are normalized into atomic capabilities instead of malformed wrapped fragments.
- Phrase matching uses token/phrase boundaries, so `UAT` no longer matches inside `evaluate`, and `API` no longer matches inside `capabilities`.
- Generic JDs no longer inherit CRM-specialist categories simply because broad words such as `commercial` appear.
- A new Product performance & value realization driver handles commercial-performance, KPI, effectiveness, feedback, and performance-data requirements.
- Work evidence is preferred over capability labels when displaying proof for a hiring driver.
- Older Pursuit local data automatically rebuilds resume-derived evidence from the original saved resume while preserving remembered validations and opportunity history.

## Release rule
Do not merge to `main` until a quick real-role test confirms that each Top-5 driver has a coherent requirement and relevant evidence.


## RC4.4 usability changes
- Locked RC4.3 intelligence, scoring, import integrity, and opportunity-card design.
- Reduced new-opportunity vertical space so Analyze role is visible on a normal laptop viewport.
- Added checkboxes to opportunity cards.
- Added Select all / Clear selection.
- Added bulk Archive for Active opportunities and bulk Restore for Archived opportunities.
- Added permanent bulk Delete with confirmation.


## RC4.6 presentation/profile polish
- Opportunity workflow, intelligence, scoring, import logic, and opportunity library are locked from RC4.4.
- Analyze action is more visually prominent and remains above the fold on a normal laptop viewport.
- Main recommendation text is colored green / amber / red to match the decision.
- My Profile now separates the read-only resume foundation from user-verified additions.
- Resume foundation explains what the source resume is and shows the extracted work/education/certification structure.
- Verified additions can be searched, edited, or removed.
- Brain emoji/icon language was removed from the profile and remembered-evidence cues.
