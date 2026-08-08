# Pursuit — Full Functional Test Build v2.0

**Know your fit. Prove your value. Apply with purpose.**

This is the complete candidate-facing Day-1 test build. It intentionally removes the local-LLM/WebGPU dependency that made earlier builds feel like polished shells. The core application works immediately with a built-in deterministic evidence and role engine; no paid API, model download, database, or subscription is required.

## Candidate workflow

1. Upload or paste the most complete truthful master resume.
2. Pursuit parses employers, roles, dates, bullets, metrics and source evidence into a Master Profile and Verified Evidence Bank.
3. Add a role by career-page URL or manual JD paste.
4. Review and confirm the role metadata and full JD.
5. Analyze the opportunity.
6. Review Apply/Pass, ATS Readiness, recruiter/HM alignment ranges, top five distinct hiring drivers, knockout/logistics checks and evidence matches.
7. Resolve only important gaps through the Evidence Gate.
8. Save approved evidence to the Evidence Bank or Evidence Bank + Master Profile.
9. Reanalysis happens immediately and validated evidence is reused for future JDs.
10. Review a two-page role-aligned resume, edit bullets through truth guardrails, inspect evidence provenance and change log, and export Word/PDF.

## What is deliberately different from v1.0

- No local Llama model or semantic-model download is required for normal use.
- Analysis happens immediately.
- The top-five engine separates role-selection criteria from logistics/education knockout checks.
- Domain boundary rules are explicit: API != EHR/EMR; life sciences != exact medical-device/digital-health experience; matrix leadership != direct reports; value/revenue != budget ownership.
- Resume generation selects verified source evidence and keeps every bullet inside the correct employer/role boundary.
- User corrections recalculate the analysis immediately.
- Gap validation persists and is reused.

## Privacy

Career data is stored in browser `localStorage` for this personal test build. Do not commit resumes, JDs, generated applications, or exported backups to the public repository. The repository contains application code and synthetic/regression test descriptions only.

Career-page import may call the employer's public page and, when blocked, `r.jina.ai` as a fallback. Manual paste remains a first-class option.

## Branch workflow

```text
dev  -> candidate testing and fixes
main -> approved live version only
```

## Test

The pure application engine can be checked with Node:

```bash
node tests/test_core.js
```

The real acceptance test remains candidate use: master resume -> real JD -> analysis -> gap validation -> regenerated resume -> Word/PDF.
