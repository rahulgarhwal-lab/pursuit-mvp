const STOP_WORDS = new Set([
  "the","and","for","with","that","this","from","you","your","our","are","will","have","has","into","their",
  "they","them","who","what","when","where","how","why","but","not","all","any","can","may","must","should",
  "would","could","about","across","within","through","using","use","used","more","than","such","including",
  "required","preferred","responsibilities","responsibility","qualifications","qualification","experience",
  "years","year","role","position","team","work","working","skills","skill","ability","strong","excellent",
  "related","other","business","company","organization","candidate","job","employment","opportunity","support"
]);

const IMPORTANT_MARKERS = [
  "required","must","minimum","at least","demonstrated","proven","responsible for",
  "you will","we are looking","preferred","ideally","key responsibilities"
];

const SENIORITY_WORDS = [
  "director","associate director","senior manager","manager","lead","principal",
  "head","vice president","vp","executive","owner","ownership"
];

const LEADERSHIP_WORDS = [
  "led","lead","leadership","owned","ownership","managed","influenced",
  "stakeholder","cross-functional","strategy","roadmap","prioritization","governance"
];

const OUTCOME_WORDS = [
  "revenue","saving","savings","growth","adoption","users","hours","cost",
  "incremental","improved","reduced","increased","impact","value","million","€","$","%"
];

const settingsDialog = document.getElementById("settingsDialog");
const openSettings = document.getElementById("openSettings");
const saveResume = document.getElementById("saveResume");
const clearResume = document.getElementById("clearResume");
const resumeInput = document.getElementById("resumeInput");
const resumeFile = document.getElementById("resumeFile");
const resumeStatus = document.getElementById("resumeStatus");
const analyzeBtn = document.getElementById("analyzeBtn");
const jdInput = document.getElementById("jdInput");
const results = document.getElementById("results");

const STORAGE_KEY = "pursuit_master_resume_v1";

function getMasterResume() {
  return localStorage.getItem(STORAGE_KEY) || "";
}

function setMasterResume(value) {
  localStorage.setItem(STORAGE_KEY, value.trim());
  updateResumeStatus();
}

function updateResumeStatus() {
  const resume = getMasterResume();
  if (resume) {
    resumeStatus.textContent = "Master resume ready";
    resumeStatus.className = "status success";
  } else {
    resumeStatus.textContent = "No master resume saved";
    resumeStatus.className = "status warning";
  }
}

openSettings.addEventListener("click", () => {
  resumeInput.value = getMasterResume();
  settingsDialog.showModal();
});

saveResume.addEventListener("click", (event) => {
  event.preventDefault();
  const value = resumeInput.value.trim();
  if (!value) {
    alert("Paste your master resume before saving.");
    return;
  }
  setMasterResume(value);
  settingsDialog.close();
});

clearResume.addEventListener("click", () => {
  if (confirm("Remove the saved master resume from this browser?")) {
    localStorage.removeItem(STORAGE_KEY);
    resumeInput.value = "";
    updateResumeStatus();
  }
});

resumeFile.addEventListener("change", async () => {
  const file = resumeFile.files?.[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".txt")) {
    alert("The first MVP accepts .txt files. You can also paste resume text directly.");
    return;
  }
  resumeInput.value = await file.text();
});

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s%$€+#.-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text) {
  return normalize(text)
    .split(" ")
    .map(t => t.replace(/^[.-]+|[.-]+$/g, ""))
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

function splitSentences(text) {
  return text
    .replace(/\r/g, "")
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z])/)
    .map(s => s.trim().replace(/^[-•*]\s*/, ""))
    .filter(s => s.length >= 25);
}

function wordFrequency(text) {
  const map = new Map();
  for (const t of tokens(text)) map.set(t, (map.get(t) || 0) + 1);
  return map;
}

function requirementScore(sentence, freq) {
  const lower = sentence.toLowerCase();
  let score = 0;
  IMPORTANT_MARKERS.forEach(marker => {
    if (lower.includes(marker)) score += marker === "required" || marker === "must" ? 6 : 3;
  });
  const unique = [...new Set(tokens(sentence))];
  score += unique.reduce((sum, t) => sum + Math.min(freq.get(t) || 0, 4), 0);
  if (/\b\d+\+?\s+years?\b/i.test(sentence)) score += 5;
  if (SENIORITY_WORDS.some(w => lower.includes(w))) score += 2;
  return score;
}

function extractRequirements(jd) {
  const freq = wordFrequency(jd);
  const sentences = splitSentences(jd)
    .map(text => ({ text, score: requirementScore(text, freq) }))
    .sort((a, b) => b.score - a.score);

  const selected = [];
  const seen = new Set();

  for (const item of sentences) {
    const key = tokens(item.text).slice(0, 6).join("|");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    selected.push(item);
    if (selected.length === 12) break;
  }
  return selected;
}

function parseResume(resume) {
  const lines = resume.replace(/\r/g, "").split("\n");
  const entries = [];
  let currentSection = "PROFILE";

  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (!line) {
      entries.push({ type: "blank", text: "", section: currentSection, index });
      return;
    }

    const isHeader =
      line.length < 70 &&
      (
        line === line.toUpperCase() ||
        /^(summary|profile|experience|professional experience|education|skills|certifications|awards|projects)$/i.test(line)
      ) &&
      !/[.!?]$/.test(line);

    if (isHeader) {
      currentSection = line;
      entries.push({ type: "header", text: line, section: currentSection, index });
      return;
    }

    const isBullet = /^[-•*]/.test(line) || line.length > 55;
    entries.push({
      type: isBullet ? "bullet" : "line",
      text: line.replace(/^[-•*]\s*/, ""),
      section: currentSection,
      index
    });
  });

  return entries;
}

function overlapScore(a, b) {
  const aSet = new Set(tokens(a));
  const bTokens = tokens(b);
  if (!aSet.size || !bTokens.length) return 0;
  let match = 0;
  bTokens.forEach(t => {
    if (aSet.has(t)) match += t.length > 7 ? 1.5 : 1;
  });
  return match / Math.max(4, Math.sqrt(aSet.size * bTokens.length));
}

function bestEvidence(requirement, resumeEntries) {
  const candidates = resumeEntries
    .filter(e => e.type === "bullet" || e.type === "line")
    .map(e => ({
      ...e,
      score: overlapScore(requirement, e.text)
    }))
    .sort((a, b) => b.score - a.score);

  return candidates[0] || { text: "No clear evidence found", score: 0 };
}

function fitLabel(score) {
  if (score >= 0.42) return { label: "Strong", className: "fit-strong" };
  if (score >= 0.20) return { label: "Partial", className: "fit-partial" };
  return { label: "Gap", className: "fit-gap" };
}

function keywordCoverage(jd, resume) {
  const freq = wordFrequency(jd);
  const jdKeywords = [...freq.entries()]
    .filter(([word, count]) => count >= 2 || word.length > 8)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 35)
    .map(([word]) => word);

  const resumeSet = new Set(tokens(resume));
  const matched = jdKeywords.filter(k => resumeSet.has(k));
  return {
    ratio: jdKeywords.length ? matched.length / jdKeywords.length : 0,
    matched,
    missing: jdKeywords.filter(k => !resumeSet.has(k))
  };
}

function mandatoryGapCount(requirements, matches) {
  let gaps = 0;
  requirements.slice(0, 8).forEach((req, i) => {
    const lower = req.text.toLowerCase();
    const mandatory = /\b(must|required|minimum|at least)\b/.test(lower);
    if (mandatory && matches[i]?.score < 0.16) gaps += 1;
  });
  return gaps;
}

function scoreBand(value) {
  const low = Math.max(5, Math.round(value - 6));
  const high = Math.min(95, Math.round(value + 6));
  return `${low}–${high}%`;
}

function confidenceFromData(jd, resume, requirementCount) {
  if (jd.length > 1200 && resume.length > 1500 && requirementCount >= 8) return "High confidence";
  if (jd.length > 700 && resume.length > 800) return "Medium confidence";
  return "Low confidence — add more complete source material";
}

function buildAlignedResume(entries, jd) {
  const sections = [];
  let current = { name: "", items: [] };

  for (const entry of entries) {
    if (entry.type === "header") {
      if (current.items.length || current.name) sections.push(current);
      current = { name: entry.text, items: [] };
    } else {
      current.items.push({
        ...entry,
        relevance: entry.type === "bullet" ? overlapScore(jd, entry.text) : 0
      });
    }
  }
  if (current.items.length || current.name) sections.push(current);

  return sections.map(section => {
    const lines = [];
    if (section.name) lines.push(section.name);

    const sortable = section.items.filter(i => i.type === "bullet");
    const fixed = section.items.filter(i => i.type !== "bullet");

    fixed.forEach(i => lines.push(i.text));
    sortable
      .sort((a, b) => b.relevance - a.relevance || a.index - b.index)
      .forEach(i => lines.push(`• ${i.text}`));

    return lines.join("\n");
  }).join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function safeText(text) {
  return text.replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[ch]));
}

function summarizeRequirement(text) {
  const cleaned = text
    .replace(/^(you will|we are looking for|the successful candidate will|responsibilities include)\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 150 ? cleaned.slice(0, 147) + "..." : cleaned;
}

function analyze() {
  const jd = jdInput.value.trim();
  const resume = getMasterResume();

  if (!resume) {
    settingsDialog.showModal();
    alert("Save your master resume first.");
    return;
  }

  if (jd.length < 300) {
    alert("Paste a more complete job description before analyzing.");
    return;
  }

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  setTimeout(() => {
    const requirements = extractRequirements(jd);
    const resumeEntries = parseResume(resume);
    const topFive = requirements.slice(0, 5);
    const matches = requirements.map(r => bestEvidence(r.text, resumeEntries));
    const coverage = keywordCoverage(jd, resume);
    const mandatoryGaps = mandatoryGapCount(requirements, matches);

    const topMatchAvg = matches.slice(0, 5).reduce((s, m) => s + Math.min(m.score, 0.7), 0) / Math.max(1, Math.min(5, matches.length));
    const seniorityOverlap = SENIORITY_WORDS.filter(w => normalize(jd).includes(w) && normalize(resume).includes(w)).length;
    const leadershipSignals = LEADERSHIP_WORDS.filter(w => normalize(resume).includes(w)).length;
    const outcomeSignals = OUTCOME_WORDS.filter(w => normalize(resume).includes(w)).length;

    let recruiter = 35 + coverage.ratio * 40 + topMatchAvg * 28 + Math.min(seniorityOverlap * 3, 9) - mandatoryGaps * 16;
    let manager = 30 + topMatchAvg * 52 + Math.min(leadershipSignals * 1.4, 12) + Math.min(outcomeSignals * 1.2, 12) - mandatoryGaps * 10;

    recruiter = Math.max(10, Math.min(92, recruiter));
    manager = Math.max(10, Math.min(92, manager));

    const strongMatches = matches.slice(0, 5).filter(m => m.score >= 0.42).length;
    const partialMatches = matches.slice(0, 5).filter(m => m.score >= 0.20 && m.score < 0.42).length;

    const apply = mandatoryGaps === 0 && (recruiter >= 52 || strongMatches >= 2 || (strongMatches + partialMatches) >= 4);

    document.getElementById("decisionBadge").textContent = apply ? "APPLY" : "PASS";
    document.getElementById("decisionBadge").className = `decision-badge ${apply ? "apply" : "pass"}`;
    document.getElementById("decisionReason").textContent = apply
      ? "The role has enough evidence-backed alignment to justify a focused application."
      : mandatoryGaps
        ? `${mandatoryGaps} likely mandatory requirement${mandatoryGaps > 1 ? "s are" : " is"} not clearly supported by the current resume.`
        : "The current evidence is too weak across the role's highest-priority qualifications.";

    document.getElementById("recruiterScore").textContent = scoreBand(recruiter);
    document.getElementById("managerScore").textContent = scoreBand(manager);

    const confidence = confidenceFromData(jd, resume, requirements.length);
    document.getElementById("recruiterConfidence").textContent = confidence;
    document.getElementById("managerConfidence").textContent = confidence;

    document.getElementById("qualificationList").innerHTML = topFive.map((req, i) => {
      const match = matches[i];
      const fit = fitLabel(match.score);
      return `
        <div class="qualification-item">
          <div class="rank">${i + 1}</div>
          <div class="qualification-title">${safeText(summarizeRequirement(req.text))}</div>
          <div class="evidence">${safeText(match.score >= 0.10 ? match.text : "No clear supporting evidence found in the master resume.")}</div>
          <div class="fit-pill ${fit.className}">${fit.label}</div>
        </div>`;
    }).join("");

    const strengths = matches
      .slice(0, 8)
      .filter(m => m.score >= 0.32)
      .slice(0, 5)
      .map(m => m.text);

    const gaps = requirements
      .slice(0, 8)
      .map((r, i) => ({ requirement: r.text, score: matches[i]?.score || 0 }))
      .filter(x => x.score < 0.20)
      .slice(0, 5)
      .map(x => summarizeRequirement(x.requirement));

    document.getElementById("strengthList").innerHTML = strengths.length
      ? strengths.map(s => `<li>${safeText(s)}</li>`).join("")
      : "<li>No strong evidence match was found. Review the master resume for missing accomplishments.</li>";

    document.getElementById("gapList").innerHTML = gaps.length
      ? gaps.map(g => `<li>${safeText(g)}</li>`).join("")
      : "<li>No major evidence gaps were detected in the five highest-priority requirements.</li>";

    const aligned = buildAlignedResume(resumeEntries, jd);
    document.getElementById("alignedResume").value = aligned;

    document.getElementById("auditContent").innerHTML = `
      <div class="audit-row"><div class="audit-key">New facts introduced</div><div class="audit-value">None. The MVP only selects and reorders existing text.</div></div>
      <div class="audit-row"><div class="audit-key">JD keyword coverage</div><div class="audit-value">${Math.round(coverage.ratio * 100)}% of the role's recurring terms are present in the master resume.</div></div>
      <div class="audit-row"><div class="audit-key">Likely mandatory gaps</div><div class="audit-value">${mandatoryGaps}</div></div>
      <div class="audit-row"><div class="audit-key">Scoring caveat</div><div class="audit-value">These are evidence-based fit estimates, not measured hiring probabilities.</div></div>
      <div class="audit-row"><div class="audit-key">Storage</div><div class="audit-value">The master resume remains in this browser's local storage.</div></div>
    `;

    results.classList.remove("hidden");
    results.scrollIntoView({ behavior: "smooth", block: "start" });

    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze role";
  }, 250);
}

analyzeBtn.addEventListener("click", analyze);

document.getElementById("copyResume").addEventListener("click", async () => {
  const text = document.getElementById("alignedResume").value;
  await navigator.clipboard.writeText(text);
  const button = document.getElementById("copyResume");
  const original = button.textContent;
  button.textContent = "Copied";
  setTimeout(() => button.textContent = original, 1300);
});

document.getElementById("downloadResume").addEventListener("click", () => {
  const text = document.getElementById("alignedResume").value;
  if (!text) return;
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "Pursuit-Aligned-Resume.txt";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
});

updateResumeStatus();
