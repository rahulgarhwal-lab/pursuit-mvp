# Pursuit — Development Branch v0.2

**Know your fit. Prove your value. Apply with purpose.**

This development build replaces the original keyword-overlap prototype with the first integrated intelligence architecture.

> Keep this version in the `dev` branch. Do not merge to `main` until regression testing is complete.

## What changed

- Local WebLLM reasoning model in the browser; no paid model API.
- Career-page URL import **or** manual JD paste.
- Five distinct hiring criteria instead of repeated keyword sentences.
- Explicit boundary rules for healthcare interoperability, healthcare domain, regulated cross-functional work, matrix leadership, metrics, and AI scope.
- Master resume -> local Verified Evidence Bank.
- Gap-driven validation questions.
- Approved evidence persists and is reused on future JDs.
- Evidence backup/export/import.
- ATS Readiness, recruiter alignment, hiring-manager alignment, Apply/Pass, and knockout-risk handling.
- Conservative resume composition that never moves bullets across employer/role boundaries.
- DOCX and PDF export.
- Visible fallback mode if the local reasoning model cannot load.

## Important model behavior

The default reasoning model is `Llama-3.2-3B-Instruct-q4f16_1-MLC`. It downloads on first use and is cached by the browser. A smaller 1B option is available in Settings.

## Regression Test #1

The ndd Medical Technologies JD exposed the original prototype's main failures. See `tests/REGRESSION_01_NDD.md`.

## Current production gate

This is a development build. Before merge to `main`, we still must verify:

- ndd regression behavior in-browser,
- local-model load and JSON reliability on the target computer,
- gap-validation persistence across multiple JDs,
- resume structure on PDF/DOCX input,
- Word/PDF output quality against the locked two-page submission template,
- broader strong-fit / adjacent-fit / stretch / pass regression set.

## Privacy

Resume and evidence are stored in browser local storage. The public repository contains application code only.

## Branch workflow

```text
dev   -> build, test, review
main  -> live approved release only
```
