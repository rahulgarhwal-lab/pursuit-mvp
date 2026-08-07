# Pursuit MVP

**Know your fit. Prove your value. Apply with purpose.**

Pursuit reduces the friction between reading a job description and submitting a strong, truthful application for the right role.

This first MVP is a static browser application. It costs nothing to host on GitHub Pages and uses no paid API.

## What version 1 does

- Stores a master resume locally in the browser
- Accepts a pasted job description
- Extracts high-priority qualification requirements
- Matches requirements to existing resume evidence
- Produces:
  - Apply or Pass
  - Recruiter-screening likelihood range
  - Hiring-manager-interest range
  - Top five qualification drivers
  - Strong evidence and important gaps
  - An aligned resume draft
  - Evidence audit
- Downloads the aligned draft as a text file

## Truth guardrail

Version 1 does not invent or expand claims. It aligns by selecting and reordering text already present in the master resume.

The source code is public when hosted through free GitHub Pages, but the user's master resume and job descriptions are not committed to GitHub. They remain in the browser's local storage.

## Run locally

No installation is required.

1. Download or clone the repository.
2. Open `index.html` in a browser.

For the most reliable browser behavior, use a local static server:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish with GitHub Pages

1. Create a public GitHub repository named `pursuit-mvp`.
2. Upload these files to the repository.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`.
6. Save.
7. GitHub will provide a project URL such as:

```text
https://<your-github-username>.github.io/pursuit-mvp/
```

## Recommended branch workflow

```text
dev   → build and review
main  → approved working application
```

Do not make changes directly in `main`.

## Known MVP limitations

- Text resume input only
- Downloads a `.txt` resume rather than a formatted `.docx`
- Uses deterministic evidence matching, not a local language model
- Scores are fit estimates, not empirically validated hiring probabilities
- Does not yet support user accounts, cloud sync, payments, or application tracking

## Next build steps

1. Add `.docx` resume upload and formatted `.docx` export
2. Add a structured evidence bank
3. Add browser-based local AI for semantic JD interpretation and controlled rewriting
4. Add change-by-change evidence tracing
5. Add application outcome tracking for personal score calibration
<!-- fresh Pages deployment -->
