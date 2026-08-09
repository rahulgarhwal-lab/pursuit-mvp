const E=window.PursuitEngine;
const $=id=>document.getElementById(id), $$=(q,r=document)=>[...r.querySelectorAll(q)];
const KEY="pursuit_release_candidate_1";
const DEFAULT={version:"S2-GENERALIZED-RC2.3-ATOMIC-DEV",source:null,profile:null,evidence:[],profileFacts:{workAuth:"",travel:"",productYears:"",gates:{}},ai:{endpoint:"",accessToken:""},opportunities:[],currentOpportunityId:null};
let S=loadState(),ACTIVE_GAP=null,PENDING=null,OPP_FILTER="active",OPP_SELECTED=new Set(),EDIT_EVIDENCE_ID=null;

function clone(x){return JSON.parse(JSON.stringify(x))}
function esc(s=""){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function ready(){return !!S.profile&&(S.evidence||[]).length>0}
function save(){localStorage.setItem(KEY,JSON.stringify(S));renderShell()}
function toast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove("show"),2600)}
function downloadText(text,name,type="text/plain"){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),800)}
function currentOpp(){return S.opportunities.find(x=>x.id===S.currentOpportunityId)||null}
function displayedAnalysis(o=currentOpp()){return o?(o.archived&&o.snapshot?o.snapshot:o.analysis):null}
function effectiveMeta(o=currentOpp(),a=displayedAnalysis(o)){return {...(a?.meta||{}),...(o?.metaOverride||{})}}
function fmtDate(value){if(!value)return"";try{return new Date(value).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}catch{return""}}
function importHealth(){return S.profile?.importHealth||{roles:S.profile?.roles?.length||0,workItems:S.evidence.filter(e=>e.evidenceType==="work").length,education:S.evidence.filter(e=>e.evidenceType==="education").length,certifications:S.evidence.filter(e=>e.evidenceType==="certification").length,warnings:[]}}
function healthSummary(){const h=importHealth(),w=(h.warnings||[]).length;return w?`Import check: ${w} suspicious line${w===1?"":"s"} quarantined · ${h.workItems||0} work evidence items`:`Import looks healthy ✓ · ${h.workItems||0} work evidence items · ${h.education||0} degree${h.education===1?"":"s"} · ${h.certifications||0} certification${h.certifications===1?"":"s"}`}

function migrateOld(){
  for(const k of ["pursuit_full_build_v6","pursuit_full_build_v5","pursuit_full_build_v4"]){
    try{
      const raw=localStorage.getItem(k);if(!raw)continue;
      const old=JSON.parse(raw);
      if(!old.source?.text)continue;
      const profile=E.parseResume(old.source.text);
      const base=E.evidenceFromProfile(profile,old.source.filename||"Resume");
      const validated=(old.evidence||[]).filter(e=>e.sourceType==="validation").map(e=>({
        id:e.id||"m_"+Math.random(),category:e.category||E.classifyText(e.statement||"").category,capability:e.capability||"",
        statement:e.statement||e.polishedStatement||"",rawValidation:e.rawUserEvidence||e.rawValidation||"",
        answers:e.answers||{},company:e.company||"",role:e.role||"",period:e.period||"",scope:e.scope||"",
        authority:e.authority||"",metric:!!e.metric,direct:e.direct===true,sourceType:"validation",sourceLabel:"Remembered from earlier Pursuit build",createdAt:e.createdAt||new Date().toISOString()
      })).filter(e=>e.statement);
      return {version:"S2-GENERALIZED-RC2.3-ATOMIC-DEV",source:{filename:old.source.filename||"Resume",text:old.source.text,createdAt:old.source.createdAt||new Date().toISOString()},profile,evidence:[...base,...validated],profileFacts:{workAuth:old.profileFacts?.workAuthorization||"",travel:old.profileFacts?.travelReady||""},opportunities:[],currentOpportunityId:null};
    }catch{}
  }
  return clone(DEFAULT);
}
function loadState(){
  try{
    const raw=localStorage.getItem(KEY);
    const state=raw?{...clone(DEFAULT),...JSON.parse(raw)}:migrateOld();
    const oldVersion=state.version||"";
    state.opportunities=(state.opportunities||[]).map(o=>({...o,archived:o.archived===true,archivedAt:o.archivedAt||null,snapshot:o.snapshot||null}));
    state.profileFacts={workAuth:"",travel:"",productYears:"",gates:{},...(state.profileFacts||{})};state.profileFacts.gates={...(state.profileFacts.gates||{})};
    // RC4.4 rebuilds resume-derived evidence from the original source so older misclassified imports cannot survive an upgrade.
    if(state.source?.text&&(oldVersion!=="S2-GENERALIZED-RC2.3-ATOMIC-DEV"||(state.evidence||[]).some(e=>e.sourceType==="resume"&&!e.evidenceType))){
      const remembered=(state.evidence||[]).filter(e=>e.sourceType==="validation").map(e=>({...e,evidenceType:"validation",usable:e.usable!==false}));
      const profile=E.parseResume(state.source.text);
      state.profile=profile;state.evidence=[...E.evidenceFromProfile(profile,state.source.filename||"Resume"),...remembered];
    }
    state.ai={endpoint:"",accessToken:"",...(state.ai||{})};
    state.version="S2-GENERALIZED-RC2.3-ATOMIC-DEV";
    return state;
  }catch{return clone(DEFAULT)}
}

// ---------- navigation ----------
function setView(name){
  $("setupView").classList.toggle("hidden",ready());
  $("topNav").classList.toggle("hidden",!ready());
  $("opportunitiesView").classList.toggle("hidden",name!=="opportunities"||!ready());
  $("profileView").classList.toggle("hidden",name!=="profile"||!ready());
  $$(".navbtn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  if(name==="profile")renderProfile();
  if(name==="opportunities")renderRecent();
  window.scrollTo({top:0,behavior:"smooth"});
}
$$(".navbtn").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.view)));
$("brandHome").addEventListener("click",()=>setView("opportunities"));

// ---------- resume reading ----------
async function readResumeFile(file){
  const name=file.name.toLowerCase();
  if(name.endsWith(".txt"))return await file.text();
  if(name.endsWith(".docx")){
    if(!window.mammoth)throw new Error("Word reader could not load. Refresh once or paste the resume text.");
    return (await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()})).value;
  }
  if(name.endsWith(".pdf")){
    if(!window.pdfjsLib)throw new Error("PDF reader could not load. Refresh once or upload the Word version.");
    pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise,pages=[];
    for(let p=1;p<=pdf.numPages;p++){
      const page=await pdf.getPage(p),content=await page.getTextContent();
      const items=content.items.map(i=>({t:i.str,x:i.transform?.[4]||0,y:i.transform?.[5]||0})).filter(i=>i.t.trim());
      items.sort((a,b)=>Math.abs(b.y-a.y)>2?b.y-a.y:a.x-b.x);
      let y=null,line=[],lines=[];
      for(const it of items){
        if(y!==null&&Math.abs(it.y-y)>3){if(line.length)lines.push(line.join(" "));line=[]}
        line.push(it.t);y=it.y;
      }
      if(line.length)lines.push(line.join(" "));
      pages.push(lines.join("\n"));
    }
    return pages.join("\n");
  }
  throw new Error("Use a PDF, Word (.docx), or TXT resume.");
}
function installResume(text,filename){
  if(String(text).trim().length<350)throw new Error("The resume looks incomplete.");
  const profile=E.parseResume(text);
  if(!profile.roles.length)throw new Error("Pursuit could not identify your work history. Try the Word file or paste the resume text.");
  const remembered=(S.evidence||[]).filter(e=>e.sourceType==="validation");
  const existingOpportunities=Array.isArray(S.opportunities)?S.opportunities:[];
  S.source={filename,text:String(text).trim(),createdAt:new Date().toISOString()};
  S.profile=profile;
  S.evidence=[...E.evidenceFromProfile(profile,filename),...remembered];
  S.opportunities=existingOpportunities;S.currentOpportunityId=null;
  save();setView("opportunities");
  toast(`Profile ready — ${profile.roles.length} roles · ${profile.importHealth?.workItems||0} work evidence items. ${(profile.importHealth?.warnings||[]).length?"Suspicious lines quarantined.":"Import looks healthy."}`);
}
async function handleResumeFile(file,status){
  status.textContent=`Reading ${file.name}...`;
  try{const text=await readResumeFile(file);installResume(text,file.name);status.textContent=""}
  catch(e){status.textContent=e.message}
}
$("resumeFile").addEventListener("change",()=>{const f=$("resumeFile").files?.[0];if(f)handleResumeFile(f,$("resumeStatus"))});
$("savePastedResume").addEventListener("click",()=>{try{installResume($("resumePaste").value,"Pasted resume")}catch(e){$("resumeStatus").textContent=e.message}});
$("replaceResumeFile").addEventListener("change",async()=>{const f=$("replaceResumeFile").files?.[0];if(!f)return;if(!confirm("Replace your source resume? Previously validated evidence will be preserved."))return;try{const t=await readResumeFile(f);installResume(t,f.name);setView("profile")}catch(e){toast(e.message)}});



const ANALYSIS_ENGINE_VERSION="S2-GENERALIZED-RC2.3-ATOMIC-DEV";
function stableHash(text=""){
  let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}
  return (h>>>0).toString(36);
}
function analysisInputSignature(jd){
  const ev=candidatePayload().map(e=>({id:e.id,evidenceType:e.evidenceType,category:e.category,statement:e.statement,company:e.company,role:e.role,period:e.period,direct:e.direct,negative:e.negative}))
    .sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  return stableHash(JSON.stringify({engine:ANALYSIS_ENGINE_VERSION,jd:String(jd||"").replace(/\s+/g," ").trim(),profileFacts:S.profileFacts||{},evidence:ev}));
}
function cachedAnalysis(signature){
  const hit=(S.opportunities||[]).find(o=>o.analysis?.engineVersion===ANALYSIS_ENGINE_VERSION&&o.analysis?.inputSignature===signature);
  return hit?clone(hit.analysis):null;
}

// ---------- secure AI reasoning service ----------
function aiReady(){return !!(S.ai?.endpoint&&S.ai?.accessToken)}
function normalizeEndpoint(x){return String(x||"").trim().replace(/\/+$/,"")}
function openAiSetup(){
  $("aiEndpoint").value=S.ai?.endpoint||"";
  $("aiAccessToken").value=S.ai?.accessToken||"";
  $("aiSetupDialog").showModal();
}
$("saveAiSetupBtn").addEventListener("click",async()=>{
  const endpoint=normalizeEndpoint($("aiEndpoint").value),accessToken=$("aiAccessToken").value.trim();
  if(!/^https:\/\//i.test(endpoint)||!accessToken){toast("Add the secure service URL and private access code.");return}
  const btn=$("saveAiSetupBtn"),prior=btn.textContent;btn.disabled=true;btn.textContent="Checking…";
  try{
    const r=await fetch(endpoint+"/health",{headers:{"X-Pursuit-Key":accessToken}});
    if(!r.ok)throw new Error("Connection failed");
    const data=await r.json();
    if(!data.ok)throw new Error("Connection failed");
    S.ai={endpoint,accessToken};save();$("aiSetupDialog").close();toast(`Connected — ${data.model||"reasoning model"} ready.`);
  }catch(e){toast("Could not connect. Check the Worker URL and access code.")}
  finally{btn.disabled=false;btn.textContent=prior}
});
function candidatePayload(){
  return (S.evidence||[]).filter(e=>e.usable!==false).map(e=>({
    id:e.id,evidenceType:e.evidenceType||"",category:e.category||"",statement:e.statement||"",
    company:e.company||"",role:e.role||"",period:e.period||"",scope:e.scope||"",authority:e.authority||"",
    sourceType:e.sourceType||"",negative:e.negative===true,direct:e.direct===true
  }));
}
async function serviceCall(path,payload){
  if(!aiReady()){openAiSetup();throw new Error("AI_SETUP_REQUIRED")}
  const r=await fetch(normalizeEndpoint(S.ai.endpoint)+path,{
    method:"POST",
    headers:{"Content-Type":"application/json","X-Pursuit-Key":S.ai.accessToken},
    body:JSON.stringify(payload)
  });
  if(!r.ok){
    let msg="Pursuit intelligence service failed.";
    try{const x=await r.json();if(x?.error)msg=x.error}catch{}
    throw new Error(msg);
  }
  return await r.json();
}
async function semanticAnalysis(jd,url=""){
  const deterministicFacts=E.deterministicProfileFacts(S.profile,S.evidence),signature=analysisInputSignature(jd),cached=cachedAnalysis(signature);
  if(cached){cached.cacheHit=true;return cached}
  const modelData=await serviceCall("/analyze",{jd,url,candidate:{profileFacts:S.profileFacts||{},deterministicFacts,evidence:candidatePayload()}});
  const analysis=E.fromSemanticModel(jd,S.profile,S.evidence,S.profileFacts,url,modelData,deterministicFacts);
  analysis.inputSignature=signature;analysis.engineVersion=ANALYSIS_ENGINE_VERSION;analysis.cacheHit=false;
  return analysis;
}


function publicText(text=""){
  return String(text||"")
    .replace(/\[(?:e|ev|evidence)[-_a-z0-9]+\]/gi,"")
    .replace(/\b(?:e|ev|evidence)[-_][a-z0-9]{6,}\b/gi,"")
    .replace(/\s+([,.;:!?])/g,"$1")
    .replace(/\s{2,}/g," ")
    .trim();
}
function compactReason(text="",max=360){
  const cleaned=publicText(text);
  const sentences=cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  let out=sentences.slice(0,2).join(" ");
  if(out.length>max){
    out=out.slice(0,max).replace(/\s+\S*$/,"").trim()+"…";
  }
  return out;
}

// ---------- job intake ----------
$("importJobBtn").addEventListener("click",async()=>{
  const url=$("jobUrl").value.trim();if(!/^https?:\/\//i.test(url)){toast("Paste a complete career-page URL.");return}
  const btn=$("importJobBtn");btn.disabled=true;btn.textContent="Importing...";
  $("importStatus").textContent="Reading the public career page...";
  let text="";
  try{const r=await fetch(url,{mode:"cors"});if(r.ok)text=htmlToText(await r.text())}catch{}
  if(text.length<500){
    try{const r=await fetch("https://r.jina.ai/"+url);if(r.ok)text=await r.text()}catch{}
  }
  btn.disabled=false;btn.textContent="Import";
  if(text.length<500){$("importStatus").textContent="This site blocked import. Paste the job description below instead.";return}
  $("jdText").value=text;$("importStatus").textContent="Job description imported. Review it if you want, then Analyze role.";
});
function htmlToText(html){
  const d=new DOMParser().parseFromString(html,"text/html");d.querySelectorAll("script,style,nav,footer,header,aside,svg,form").forEach(n=>n.remove());return(d.body?.innerText||"").replace(/\n{3,}/g,"\n\n").trim()
}
$("analyzeBtn").addEventListener("click",()=>runAnalysis(true));
async function runAnalysis(newOpportunity=false){
  const jd=$("jdText").value.trim(),url=$("jobUrl").value.trim(),btn=$("analyzeBtn");
  if(jd.length<500){toast("Add a more complete job description first.");return}
  if(!aiReady()){openAiSetup();return}
  btn.disabled=true;btn.textContent="Reading the role like a hiring team…";
  try{
    const analysis=await semanticAnalysis(jd,url);
    let opp=currentOpp();
    if(newOpportunity||!opp){
      opp={id:"j_"+Date.now().toString(36),jd,url,analysis,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),archived:false,archivedAt:null,snapshot:null};
      S.opportunities.unshift(opp);S.opportunities=S.opportunities.slice(0,100);S.currentOpportunityId=opp.id;
    }else{
      if(opp.archived){toast("Archived analyses stay frozen. Reanalyze it with your current profile instead.");return}
      opp.jd=jd;opp.url=url;opp.analysis=analysis;opp.updatedAt=new Date().toISOString();
    }
    save();renderAnalysis(analysis);$("opportunityHome").classList.add("hidden");$("analysisView").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});
  }catch(err){
    if(err.message!=="AI_SETUP_REQUIRED"){
      console.error("Pursuit analysis failed",err);
      toast(err.message||"Pursuit hit an intelligence-service error. Nothing was changed.");
      $("importStatus").textContent="Analysis stopped. No score was created or saved.";
    }
  }finally{
    btn.disabled=false;btn.textContent="Analyze this role →";
  }
}
$("backToNew").addEventListener("click",newOpportunity);
function newOpportunity(){
  S.currentOpportunityId=null;save();$("jdText").value="";$("jobUrl").value="";$("importStatus").textContent="";$("analysisView").classList.add("hidden");$("opportunityHome").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"});
}

// ---------- render analysis ----------
function renderAnalysis(a){
  renderOpportunityHeader(a);
  const archived=!!currentOpp()?.archived;
  $("decisionLabel").textContent=a.recommendation.label;$("decisionReason").textContent=a.recommendation.reason;$("decisionAside").textContent=a.recommendation.aside||"";
  const dc=document.querySelector(".decision-card");dc.classList.remove("tone-green","tone-amber","tone-red");dc.classList.add(`tone-${a.recommendation.tone||"amber"}`);
  const em=effectiveMeta(currentOpp(),a);
  $("roleMeta").innerHTML=`<strong>${esc(em.title||"Opportunity")}</strong>${esc(em.company||"")}<br>${esc(em.location||"")}`;
  $("atsScore").textContent=`${a.scores.ats}/100`;
  const ra=a.scores.recruiterAlignment,ma=a.scores.managerAlignment,cf=a.evidenceConfidence;
  $("recruiterScore").textContent=ra.label;$("managerScore").textContent=ma.label;$("confidenceScore").textContent=cf.label;
  $("atsExplanation").textContent=atsExplanation(a);$("recruiterExplanation").textContent=ra.reason;$("managerExplanation").textContent=ma.reason;$("confidenceExplanation").textContent=cf.reason;
  setLevel($("recruiterBox"),ra.label);setLevel($("managerBox"),ma.label);setLevel($("confidenceBox"),cf.label);
  $("primaryRisk").textContent=a.primaryRisk;$("hiringProblem").textContent=a.hiringProblem;
  const changes=(a.whatWouldChange||[]).slice(0,4);
  $("decisionChange").classList.toggle("hidden",!changes.length);
  $("decisionChangeList").innerHTML=changes.map(x=>`<div class="decision-change-row"><span>${esc(x.label)}</span><em>${x.kind==="gate"?"Mandatory gate — confirm once":(x.changesDecision?"Could change the recommendation":"Could strengthen the case")}</em></div>`).join("");
  const limits=(a.knownLimitations||[]).slice(0,4);
  $("knownLimitations").classList.toggle("hidden",!limits.length);
  $("knownLimitationsList").innerHTML=limits.map(x=>`<div class="decision-change-row"><span>${esc(x.label)}</span><em>${esc(x.status||"Known limitation")}</em></div>`).join("");
  $("topFive").innerHTML=a.criteria.map((c,i)=>criterionHTML(c,a.matches[i],i)).join("");
  const checks=a.gates.filter(g=>g.status!=="clear");$("quickChecksCard").classList.toggle("hidden",!checks.length);$("quickChecks").innerHTML=checks.map(g=>checkHTML(g,archived)).join("");if(!archived)bindChecks();
  const gaps=(a.clarifications||[]).map(x=>({criterion:a.criteria[x.index],match:a.matches[x.index],index:x.index,changesDecision:x.changesDecision}));
  $("gapCard").classList.toggle("hidden",!gaps.length);$("gapList").innerHTML=gaps.map(g=>gapHTML(g,archived)).join("");if(!archived)$$('.validate-gap').forEach(b=>b.addEventListener("click",()=>openGap(Number(b.dataset.index))));
  renderOutput(a);renderNotAdded(a);
}
function renderOpportunityHeader(a){
  const o=currentOpp();if(!o)return;
  const meta=effectiveMeta(o,a),facts=(a.meta?.facts||[]).filter(Boolean);
  const title=meta.title||"Opportunity",company=meta.company||"Company not identified";
  $("oppHeaderCompany").textContent=company;
  $("oppHeaderTitle").textContent=title;

  const level=(facts.find(x=>/^(Associate Director|Senior Director|Executive Director|Director|Senior Manager|Senior Product Manager|Product Manager)$/i.test(x))||"").replace(/\b\w/g,c=>c.toUpperCase());
  const industry=facts.find(x=>/^(Life sciences|Healthcare technology)$/i.test(x))||"";
  const rawLocation=(meta.location||"").replace(/^location\s*[:\-]\s*/i,"").trim();
  const context=[rawLocation,industry,level].filter(Boolean);
  $("oppContextLine").textContent=context.join(" · ");

  const anchors=[];
  const add=x=>{if(x&&!anchors.includes(x))anchors.push(x)};
  const veeva=facts.find(x=>/veeva/i.test(x));
  if(veeva)add(/strongly preferred/i.test(veeva)?"Veeva preferred":veeva.replace(/CRM/i,"CRM"));
  const years=facts.find(x=>/^\d+\+ years$/i.test(x));if(years)add(years);
  const commercialMedical=facts.find(x=>/Commercial \+ Medical/i.test(x));
  if(commercialMedical)add(/crm/i.test(title)||facts.some(x=>/crm/i.test(x))?"CRM / Commercial & Medical":"Commercial & Medical");
  else{
    const commercial=facts.find(x=>/^Commercial$/i.test(x));
    if(commercial)add(/crm/i.test(title)||facts.some(x=>/crm/i.test(x))?"CRM / Commercial":"Commercial");
  }
  for(const f of facts){
    if(anchors.length>=3)break;
    if([level,industry,veeva,years,commercialMedical].filter(Boolean).some(x=>x===f))continue;
    if(/^(Hybrid|Remote|On-site)$/i.test(f)&&rawLocation)continue;
    if(/CRM platform ownership/i.test(f)&&/CRM/i.test(title))continue;
    add(f);
  }
  $("oppAnchorLine").textContent=anchors.join(" · ");
  $("oppRoleThesis").textContent=a.hiringProblem||"Pursuit is focusing on the requirements most likely to drive the hiring decision.";
  const dates=[`Analyzed ${fmtDate(a.createdAt||o.createdAt)}`];
  if(o.archivedAt)dates.push(`Archived ${fmtDate(o.archivedAt)}`);
  $("oppAnalyzedDate").textContent=dates.join(" · ");
  $("oppArchiveBadge").classList.toggle("hidden",!o.archived);
  $("archiveOppBtn").textContent=o.archived?"Restore to active":"Archive";
  $("reanalyzeOppBtn").classList.toggle("hidden",!o.archived);
  $("sourceLink").classList.toggle("hidden",!/^https?:\/\//i.test(o.url||""));
  if(/^https?:\/\//i.test(o.url||""))$("sourceLink").href=o.url;
}
function openJdDialog(){
  const o=currentOpp();if(!o)return;
  const a=displayedAnalysis(o),meta=effectiveMeta(o,a);
  $("jdDialogTitle").textContent=`${meta.company||""}${meta.company?" — ":""}${meta.title||"Opportunity"}`;
  $("jdDialogText").textContent=o.jd||"No job description saved.";
  $("jdDialog").showModal();
}
function openMetaDialog(){
  const o=currentOpp();if(!o)return;const meta=effectiveMeta(o);
  $("metaCompany").value=meta.company||"";$("metaTitle").value=meta.title||"";$("metaLocation").value=meta.location||"";$("metaDialog").showModal();
}
$("editMetaBtn").addEventListener("click",openMetaDialog);
$("saveMetaBtn").addEventListener("click",()=>{
  const o=currentOpp();if(!o)return;
  o.metaOverride={company:$("metaCompany").value.trim(),title:$("metaTitle").value.trim(),location:$("metaLocation").value.trim()};o.updatedAt=new Date().toISOString();save();$("metaDialog").close();renderAnalysis(displayedAnalysis(o));toast("Opportunity details saved.");
});
$("viewJdBtn").addEventListener("click",openJdDialog);
$("copyJobSearchBtn").addEventListener("click",async()=>{
  const o=currentOpp();if(!o)return;
  const meta=effectiveMeta(o,displayedAnalysis(o));
  const company=meta.company||"",title=meta.title||"";
  const query=[company,title?`"${title}"`:""].filter(Boolean).join(" ");
  if(!query)return toast("Add the company and job title first.");
  await copyText(query);
  toast("Job search copied — paste it into LinkedIn Jobs.");
});
$("archiveOppBtn").addEventListener("click",()=>{
  const o=currentOpp();if(!o)return;
  if(o.archived){o.archived=false;o.updatedAt=new Date().toISOString();toast("Restored to active opportunities.")}
  else{o.snapshot=clone(o.analysis);o.archived=true;o.archivedAt=new Date().toISOString();o.updatedAt=o.archivedAt;toast("Archived. This analysis is now a frozen snapshot.")}
  save();renderAnalysis(displayedAnalysis(o));
});
$("reanalyzeOppBtn").addEventListener("click",async()=>{
  const old=currentOpp();if(!old||!old.archived)return;
  if(!aiReady()){openAiSetup();return}
  const btn=$("reanalyzeOppBtn"),prior=btn.textContent;btn.disabled=true;btn.textContent="Reanalyzing…";
  try{
    const analysis=await semanticAnalysis(old.jd,old.url||"");
    const fresh={id:"j_"+Date.now().toString(36),jd:old.jd,url:old.url||"",analysis,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),archived:false,archivedAt:null,snapshot:null,reanalyzedFrom:old.id,metaOverride:old.metaOverride?clone(old.metaOverride):null};
    S.opportunities.unshift(fresh);S.opportunities=S.opportunities.slice(0,100);S.currentOpportunityId=fresh.id;save();
    $("jdText").value=fresh.jd;$("jobUrl").value=fresh.url;renderAnalysis(analysis);toast("Reanalyzed with the reasoning model. The archived version stayed unchanged.");window.scrollTo({top:0,behavior:"smooth"});
  }catch(err){
    console.error("Pursuit reanalysis failed",err);toast(err.message||"Reanalysis failed. The archived snapshot is unchanged.");
  }finally{btn.disabled=false;btn.textContent=prior}
});
function setLevel(el,label){el.classList.remove("level-excellent","level-strong","level-limited","level-weak","level-high","level-medium","level-low");if(el)el.classList.add(`level-${String(label||"").toLowerCase().replace(/\s+/g,"-")}`)}
function atsExplanation(a){const weak=a.criteria.map((c,i)=>({c,m:a.matches[i]})).filter(x=>x.m.status!=="Strong");return weak.length?`${weak.length} of the five decision drivers are not yet explicit/direct in the resume.`:"The five decision drivers are explicitly supported in the resume."}
function criterionHTML(c,m,i){
  const evidence=(m.supportingEvidence||[]).slice(0,3);
  const remembered=m.remembered?`<span class="remembered-note">✓ Verified earlier</span>`:"";
  const tier=c.tier===1?"HIRING GATE":"MAJOR DIFFERENTIATOR";
  const evidenceHTML=evidence.length?`<div class="evidence-list">${evidence.map(e=>{
    const src=[e.company,e.role].filter(Boolean).join(" · ");
    return `<div class="evidence-item"><p>${esc(e.text)}</p>${src?`<small>${esc(src)}</small>`:""}</div>`;
  }).join("")}</div>`:`<div class="evidence-empty">No defensible work evidence found.</div>`;
  return `<div class="criterion"><div class="rank">${i+1}</div><div><div class="criterion-title">${esc(c.label)}</div><div class="criterion-req"><b>${tier}</b> · ${esc(c.requirement)}</div><div class="criterion-why">${esc(c.why||"")}</div></div><div class="evidence-copy"><strong>Best evidence</strong>${evidenceHTML}<div class="evidence-judgment">${esc(compactReason(m.reason))}${remembered}</div></div><span class="fit ${m.status.toLowerCase()}">${esc(m.status)}</span></div>`;
}
function gapHTML(g,archived=false){
  const confirmed=g.match.confirmedGap===true,label=g.changesDecision?"COULD CHANGE THE DECISION":"WORTH CLARIFYING";
  const mq=g.criterion.clarification||{},title=mq.dimensionLabel||g.criterion.label,why=mq.question||g.match.reason;
  return `<div class="gap-item"><div><span class="gap-type">${esc(label)}</span><h3>${esc(title)}</h3><p>${esc(why)}</p></div>${archived?`<span class="archive-inline">Archived snapshot</span>`:confirmed?`<span class="fit gap">🚧 Honest gap saved</span>`:`<button class="secondary validate-gap" data-index="${g.index}">Check this</button>`}</div>`;
}
function checkHTML(g,archived=false){
  let controls="";const key=esc(g.factKey||g.id||"gate");
  if(g.gateType==="work_authorization"||g.category==="sponsorship")controls=`<button class="ghost check-set" data-kind="workAuth" data-value="authorized">I am authorized</button><button class="ghost check-set" data-kind="workAuth" data-value="sponsorship">I need sponsorship</button>`;
  else if(g.gateType==="travel"||g.category==="travel")controls=`<button class="ghost check-set" data-kind="travel" data-value="yes">I can meet this</button><button class="ghost check-set" data-kind="travel" data-value="no">I cannot</button>`;
  else if(g.gateType==="experience_duration"||g.category==="experience_duration"||g.category==="product_tenure"){
    const y=g.requiredYears||"";
    controls=y?`<button class="ghost check-set" data-gate-key="${key}" data-value="meets:${y}">Yes — I meet ${y}+ years</button><button class="ghost check-set" data-gate-key="${key}" data-value="under:${y}">No — under ${y} years</button>`:`<button class="ghost check-set" data-gate-key="${key}" data-value="yes">I meet this</button><button class="ghost check-set" data-gate-key="${key}" data-value="no">I do not</button>`;
  }else controls=`<button class="ghost check-set" data-gate-key="${key}" data-value="yes">I meet this</button><button class="ghost check-set" data-gate-key="${key}" data-value="no">I do not</button>`;
  return `<div class="check-item"><div><h3>${esc(g.label)}</h3><p>${esc(g.reason)}</p></div><div class="button-row">${archived?`<span class="archive-inline">Archived snapshot</span>`:controls}</div></div>`;
}
function bindChecks(){
  $$(".check-set").forEach(b=>b.addEventListener("click",()=>{
    if(b.dataset.gateKey){S.profileFacts.gates=S.profileFacts.gates||{};S.profileFacts.gates[b.dataset.gateKey]=b.dataset.value}
    else S.profileFacts[b.dataset.kind]=b.dataset.value;
    save();runAnalysis(false);
  }));
}

// ---------- gap validation ----------
function openGap(index){
  const opp=currentOpp();if(!opp)return;const c=opp.analysis.criteria[index],m=opp.analysis.matches[index];ACTIVE_GAP={index,criterion:c,match:m};PENDING=null;
  const mq=c.clarification||{};
  $("gapTitle").textContent=mq.dimensionLabel||c.label;$("gapContext").textContent=mq.question||m.reason;$("gapFreeText").value="";$("gapRolePeriod").value="";
  $("wordingPreview").classList.add("hidden");$("acceptEvidenceBtn").classList.add("hidden");$("suggestWordingBtn").classList.remove("hidden");
  const qs=(mq?.needed&&mq.question)?[{id:"model",label:mq.question,options:(mq.options||[]).length?mq.options:["Yes","Partially","No"],multi:mq.multiSelect===true}]:E.validationQuestions(c.category);
  $("gapQuestions").innerHTML=qs.map(q=>`<div class="question" data-q="${q.id}" data-multi="${q.multi?"1":"0"}"><label>${esc(q.label)}</label><div class="chips">${q.options.map(o=>`<button type="button" class="chip" data-value="${esc(o)}">${esc(o)}</button>`).join("")}</div></div>`).join("");
  $$("#gapQuestions .chip").forEach(ch=>ch.addEventListener("click",()=>{const q=ch.closest(".question");if(q.dataset.multi!=="1")q.querySelectorAll(".chip").forEach(x=>x.classList.remove("selected"));if(/^None$/i.test(ch.dataset.value)){q.querySelectorAll(".chip").forEach(x=>x.classList.remove("selected"));ch.classList.add("selected")}else{q.querySelectorAll(".chip").forEach(x=>{if(/^None$/i.test(x.dataset.value))x.classList.remove("selected")});ch.classList.toggle("selected") }}));
  $("gapDialog").showModal();
}
function gapAnswers(){const a={};$$("#gapQuestions .question").forEach(q=>a[q.dataset.q]=[...q.querySelectorAll(".chip.selected")].map(x=>x.dataset.value));return a}
$("suggestWordingBtn").addEventListener("click",async()=>{
  if(!ACTIVE_GAP)return;
  const answers=gapAnswers(),flat=Object.values(answers).flat(),free=$("gapFreeText").value.trim();
  if(!flat.length&&!free){toast("Choose the closest answer or add one short sentence.");return}
  const obviousNegative=flat.length&&flat.every(x=>/^None(?: of these)?$|^No$/i.test(x))&&!free;
  if(obviousNegative){
    const wording=`Confirmed: no direct evidence currently establishes ${ACTIVE_GAP.criterion.label}.`;
    PENDING={answers,free:"",wording,rolePeriod:$("gapRolePeriod").value.trim(),negative:true,direct:false};
    $("wordingText").textContent=wording;$("wordingScope").textContent="Good. We will remember the honest gap and stop asking about it unless a future role changes the scope.";
    $("wordingPreview").classList.remove("hidden");$("acceptEvidenceBtn").classList.remove("hidden");$("acceptEvidenceBtn").textContent="Remember this gap";$("suggestWordingBtn").classList.add("hidden");return;
  }
  if(!aiReady()){openAiSetup();return}
  const btn=$("suggestWordingBtn"),prior=btn.textContent;btn.disabled=true;btn.textContent="Turning that into evidence…";
  try{
    const x=await serviceCall("/polish-evidence",{
      criterion:{label:ACTIVE_GAP.criterion.clarification?.dimensionLabel||ACTIVE_GAP.criterion.label,requirement:ACTIVE_GAP.criterion.clarification?.question||ACTIVE_GAP.criterion.requirement,why:ACTIVE_GAP.criterion.why||"",memoryKey:ACTIVE_GAP.criterion.clarification?.factKey||ACTIVE_GAP.criterion.factKey||ACTIVE_GAP.criterion.category},
      answers,freeText:free,rolePeriod:$("gapRolePeriod").value.trim()
    });
    PENDING={answers,free,wording:x.wording,rolePeriod:$("gapRolePeriod").value.trim(),negative:x.negative===true,direct:x.direct===true};
    $("acceptEvidenceBtn").textContent=PENDING.negative?"Remember this gap":"Accept & remember";
    $("wordingText").textContent=x.wording;$("wordingScope").textContent=x.scopeNote||"This wording is intentionally limited to the scope you just validated.";
    $("wordingPreview").classList.remove("hidden");$("acceptEvidenceBtn").classList.remove("hidden");btn.classList.add("hidden");
  }catch(err){toast(err.message||"Could not improve the evidence wording.")}
  finally{btn.disabled=false;btn.textContent=prior}
});
$("acceptEvidenceBtn").addEventListener("click",()=>{
  if(!PENDING||!ACTIVE_GAP)return;
  const rec=E.evidenceRecordFromValidation(ACTIVE_GAP.criterion.category,ACTIVE_GAP.criterion,PENDING.answers,PENDING.free,PENDING.rolePeriod,PENDING.wording,PENDING.negative===true);
  if(PENDING.direct!==undefined)rec.direct=PENDING.direct===true;S.evidence.push(rec);save();$("gapDialog").close();toast(PENDING.negative?"Honest gap remembered. No need to answer that again.":"Saved to your profile. Pursuit will reuse this next time.");runAnalysis(false);
});
$("leaveGapBtn").addEventListener("click",()=>$("gapDialog").close());
$$("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close).close()));

// ---------- output ----------
function renderOutput(a){
  const out=a.output,sections=[];
  sections.push(outputSection("Recommended professional summary",out.summary));
  sections.push(outputSection("Capabilities worth emphasizing",out.capabilities.join(" • ")));
  for(const r of out.roleSections){
    let body=`${r.title}\n${r.companyLine}\n\n${r.bullets.map(x=>"• "+x).join("\n")}`;
    if((r.impactSelected||[]).length)body+=`\n\nSELECTED IMPACT\n${r.impactSelected.map(x=>"• "+x).join("\n")}`;
    sections.push(outputSection(r.companyLine.split("|")[0]||r.title,body));
  }
  if(out.additions.length){
    const body=out.additions.map(x=>`• ${x.statement}${x.company?` [${x.company}${x.role?" | "+x.role:""}]`:""}`).join("\n");
    sections.push(outputSection("Validated evidence to place manually",body));
  }
  $("tailoredOutput").innerHTML=sections.join("");
  $$(".copy-section").forEach(b=>b.addEventListener("click",()=>copyText(b.closest(".output-section").querySelector(".output-body").innerText)));
}
function outputSection(title,body){return `<div class="output-section"><div class="output-section-head"><h3>${esc(title)}</h3><button class="copybtn copy-section">Copy</button></div><div class="output-body">${esc(body)}</div></div>`}
$("copyAllBtn").addEventListener("click",()=>{const a=displayedAnalysis();if(a)copyText(a.fullText)});
async function copyText(t){try{await navigator.clipboard.writeText(t);toast("Copied.")}catch{const ta=document.createElement("textarea");ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand("copy");ta.remove();toast("Copied.")}}
function renderNotAdded(a){
  const rows=(a.protectedClaims||[]).filter(x=>x?.claim&&x?.reason);
  $("notAddedCard").classList.toggle("hidden",!rows.length);
  if(!rows.length){$("notAddedList").innerHTML="";return}
  $("notAddedList").innerHTML=`<div class="not-added">${rows.map(x=>`<div class="not-added-row"><strong>${esc(x.claim)}</strong><span>${esc(compactReason(x.reason,300))}</span></div>`).join("")}</div>`;
}

// ---------- opportunity library ----------
function visibleOpportunities(){
  const wantArchived=OPP_FILTER==="archived";
  return (S.opportunities||[]).filter(o=>!!o.archived===wantArchived);
}
function clearOpportunitySelection(render=true){
  OPP_SELECTED.clear();
  if(render)renderRecent();
}
function selectionCount(){return OPP_SELECTED.size}
function syncBulkControls(items=visibleOpportunities()){
  const ids=new Set(items.map(o=>o.id));
  for(const id of [...OPP_SELECTED])if(!ids.has(id))OPP_SELECTED.delete(id);
  const n=selectionCount(),allSelected=items.length>0&&items.every(o=>OPP_SELECTED.has(o.id));
  $("bulkBar").classList.toggle("hidden",n===0);
  $("bulkCount").textContent=`${n} selected`;
  $("selectVisibleBtn").textContent=allSelected?"Clear selection":"Select all";
  $("bulkArchiveBtn").textContent=OPP_FILTER==="archived"?"Restore selected":"Archive selected";
}
function renderRecent(){
  const all=S.opportunities||[];
  $("recentSection").classList.toggle("hidden",!all.length);
  $$(".opp-filter").forEach(b=>b.classList.toggle("active",b.dataset.filter===OPP_FILTER));
  const wantArchived=OPP_FILTER==="archived";
  const items=visibleOpportunities();
  $("recentList").innerHTML=items.length?items.map(o=>{
    const a=o.archived&&o.snapshot?o.snapshot:o.analysis;if(!a)return"";
    const meta=effectiveMeta(o,a),tone=a.recommendation?.tone||"amber";
    const facts=(a.meta?.facts||[]).slice(0,3).join(" · ");
    const identity=`${meta.company||"Company not identified"} | ${meta.title||"Opportunity"}`;
    const checked=OPP_SELECTED.has(o.id);
    return `<div class="recent-item tone-${tone} ${checked?"selected":""}" data-id="${o.id}">
      <input class="opp-select" type="checkbox" data-id="${o.id}" aria-label="Select ${esc(identity)}" ${checked?"checked":""}>
      <button class="recent-open" data-id="${o.id}">
        <div class="recent-copy">
          <strong>${esc(identity)}</strong>
          <span>${esc(facts)}</span>
          <small>${o.archived?"Archived ":"Analyzed "}${esc(fmtDate(o.archivedAt||a.createdAt||o.createdAt))}</small>
        </div>
        <em>${esc(a.recommendation?.label||"")}</em>
      </button>
    </div>`;
  }).join(""):`<div class="empty-library">${wantArchived?"Nothing archived yet.":"No active opportunities yet."}</div>`;

  $$(".recent-open").forEach(b=>b.addEventListener("click",()=>openOpportunity(b.dataset.id)));
  $$(".opp-select").forEach(cb=>cb.addEventListener("change",()=>{
    const id=cb.dataset.id;
    if(cb.checked)OPP_SELECTED.add(id);else OPP_SELECTED.delete(id);
    renderRecent();
  }));
  syncBulkControls(items);
}
function openOpportunity(id){
  const o=S.opportunities.find(x=>x.id===id);if(!o)return;
  S.currentOpportunityId=o.id;save();
  $("jdText").value=o.jd;$("jobUrl").value=o.url||"";
  renderAnalysis(displayedAnalysis(o));
  $("opportunityHome").classList.add("hidden");
  $("analysisView").classList.remove("hidden");
  window.scrollTo({top:0});
}
$$(".opp-filter").forEach(b=>b.addEventListener("click",()=>{
  OPP_FILTER=b.dataset.filter;
  OPP_SELECTED.clear();
  renderRecent();
}));
$("selectVisibleBtn").addEventListener("click",()=>{
  const items=visibleOpportunities();
  const allSelected=items.length>0&&items.every(o=>OPP_SELECTED.has(o.id));
  OPP_SELECTED.clear();
  if(!allSelected)items.forEach(o=>OPP_SELECTED.add(o.id));
  renderRecent();
});
$("clearSelectionBtn").addEventListener("click",()=>clearOpportunitySelection());
$("bulkArchiveBtn").addEventListener("click",()=>{
  const ids=new Set(OPP_SELECTED);
  if(!ids.size)return;
  const now=new Date().toISOString();
  let changed=0;
  for(const o of S.opportunities||[]){
    if(!ids.has(o.id))continue;
    if(OPP_FILTER==="archived"){
      o.archived=false;o.updatedAt=now;changed++;
    }else{
      if(!o.snapshot&&o.analysis)o.snapshot=clone(o.analysis);
      o.archived=true;o.archivedAt=now;o.updatedAt=now;changed++;
    }
  }
  OPP_SELECTED.clear();
  save();
  renderRecent();
  toast(OPP_FILTER==="archived"?`${changed} opportunit${changed===1?"y":"ies"} restored.`:`${changed} opportunit${changed===1?"y":"ies"} archived.`);
});
$("bulkDeleteBtn").addEventListener("click",()=>{
  const ids=new Set(OPP_SELECTED);
  const n=ids.size;if(!n)return;
  const noun=n===1?"opportunity":"opportunities";
  if(!confirm(`Delete ${n} ${noun}? This permanently removes the saved JD, analysis, and tailored output from Pursuit on this browser.`))return;
  S.opportunities=(S.opportunities||[]).filter(o=>!ids.has(o.id));
  if(ids.has(S.currentOpportunityId))S.currentOpportunityId=null;
  OPP_SELECTED.clear();
  save();
  renderRecent();
  toast(`${n} ${noun} deleted.`);
});

// ---------- profile ----------
function renderProfile(){
  const h=importHealth(),remembered=S.evidence.filter(e=>e.sourceType==="validation");
  $("sourceResumeMeta").textContent=S.source?`${S.source.filename} · imported ${new Date(S.source.createdAt).toLocaleDateString()}`:"";
  $("sourceHealth").innerHTML=(h.warnings||[]).length
    ? `<span class="health-badge warning">Needs attention</span><span>${h.warnings.length} suspicious imported line${h.warnings.length===1?"":"s"} quarantined and excluded from matching.</span>`
    : `<span class="health-badge healthy">Healthy import</span><span>No suspicious resume lines are influencing role matching.</span>`;
  $("workAuth").value=S.profileFacts.workAuth||"";$("travel").value=S.profileFacts.travel||"";
  $("profileStats").innerHTML=[
    ["Roles",S.profile?.roles?.length||0],
    ["Work evidence",S.evidence.filter(e=>e.evidenceType==="work"&&e.usable!==false).length],
    ["Degrees",h.education||0],
    ["Certifications",h.certifications||0]
  ].map(([a,b])=>`<div class="profile-stat"><strong>${b}</strong><span>${a}</span></div>`).join("");
  renderProfileStructure();
  $("verifiedCount").textContent=`${remembered.length} verified addition${remembered.length===1?"":"s"}`;
  renderEvidence();
}
function renderProfileStructure(){
  const p=S.profile||{},roles=p.roles||[],edu=p.education||[],certs=p.certifications||[],caps=p.capabilityLines||[],early=p.early||[];
  const block=(title,rows,cls="")=>rows.length?`<div class="structure-group ${cls}"><strong>${esc(title)}</strong>${rows.map(x=>`<div class="structure-row">${esc(x)}</div>`).join("")}</div>`:"";
  const roleRows=roles.map(r=>[r.title,r.company,r.dates].filter(Boolean).join(" · "));

  const workGroups=roles.map(r=>{
    const bullets=(r.bullets||[]).map(x=>({text:x,type:"Evidence"}));
    const impact=(r.impact||[]).map(x=>({text:x,type:"Impact"}));
    const items=[...bullets,...impact];
    if(!items.length)return"";
    const heading=[r.title,r.company,r.dates].filter(Boolean).join(" · ");
    return `<details class="evidence-role-group"><summary>${esc(heading)} <span>${items.length} item${items.length===1?"":"s"}</span></summary><div class="evidence-role-items">${items.map(x=>`<div class="structure-evidence-row"><span class="evidence-kind ${x.type==="Impact"?"impact":""}">${x.type}</span><p>${esc(x.text)}</p></div>`).join("")}</div></details>`;
  }).join("");

  const sourceEvidence=S.evidence.filter(e=>e.sourceType==="resume"&&e.usable!==false);
  const excludedCats=new Set(["general","education","travel","sponsorship"]);
  const signalCounts={};
  for(const e of sourceEvidence){
    if(!e.category||excludedCats.has(e.category))continue;
    signalCounts[e.category]=(signalCounts[e.category]||0)+1;
  }
  const analysisSignals=Object.entries(signalCounts)
    .map(([category,count])=>({label:E.TAXONOMY[category]?.label||category,count}))
    .sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label));

  const raw=String(p.raw||"");
  const literalSignals=[
    ["Salesforce CRM",/\bsalesforce(?:\s+crm)?\b/i],
    ["CRM",/\bcrm\b/i],
    ["ERP",/\berp\b/i],
    ["APIs",/\bapis?\b/i],
    ["Cloud data platforms",/\bcloud\s+(?:data\s+)?platforms?\b/i],
    ["Data science",/\bdata science\b/i],
    ["AI / machine learning",/\b(?:artificial intelligence|machine learning|\bAI\b)\b/i],
    ["Predictive analytics",/\bpredictive analytics\b/i],
    ["Digital commerce / eCommerce",/\b(?:digital commerce|ecommerce|e-commerce)\b/i],
    ["GA4",/\bGA4\b/i],
    ["ServiceMax",/\bServiceMax\b/i],
    ["Foundry",/\bFoundry\b/i],
    ["MCP",/\bMCP\b/i],
    ["AERA",/\bAERA\b/i],
    ["CSR",/\bCSR\b/i],
    ["TMIC",/\bTMIC\b/i],
    ["CTR",/\bCTR\b/i]
  ];
  let technologies=literalSignals.filter(([,rx])=>rx.test(raw)).map(([label])=>label);
  if(technologies.includes("Salesforce CRM"))technologies=technologies.filter(x=>x!=="CRM");

  const domainSignals=[
    ["Life sciences",/\blife sciences?\b/i],
    ["Commercial",/\bcommercial\b/i],
    ["Sales",/\bsales\b/i],
    ["Marketing",/\bmarketing\b/i],
    ["Customer Excellence",/\bcustomer excellence\b/i],
    ["Customer Support",/\bcustomer support\b/i],
    ["Business Development",/\bbusiness development\b/i],
    ["Supply chain",/\bsupply[ -]chain\b/i],
    ["Pricing",/\bpricing\b/i],
    ["R&D / research",/\b(?:r&d|research and development|research)\b/i],
    ["Scientific workflows",/\bscientific workflows?\b/i]
  ].filter(([,rx])=>rx.test(raw)).map(([label])=>label);

  const chipBlock=(title,items,help="")=>items.length?`<div class="structure-group"><strong>${esc(title)}</strong>${help?`<div class="structure-help">${esc(help)}</div>`:""}<div class="structure-chips">${items.map(x=>`<span>${esc(typeof x==="string"?x:x.label)}${typeof x==="object"&&x.count?` <em>${x.count}</em>`:""}</span>`).join("")}</div></div>`:"";
  const summaryBlock=p.summary?block("Professional summary",[p.summary]):"";
  const workBlock=workGroups?`<div class="structure-group"><strong>Work evidence</strong><div class="structure-help">These are the role bullets and impact statements Pursuit can use when matching you to a JD.</div><div class="work-evidence-groups">${workGroups}</div></div>`:"";
  const capabilityBlock=block("Core capabilities",caps);
  const technologyBlock=chipBlock("Technologies & platforms",technologies,"Literal technologies/platforms detected in the source resume.");
  const domainBlock=chipBlock("Domains & functions",domainSignals,"Context Pursuit can use when deciding whether experience is direct or adjacent.");
  const signalBlock=chipBlock("Matching skill signals",analysisSignals,"Normalized capability areas Pursuit assigned to resume evidence. The number shows how many source-evidence items support each signal.");
  const scientificBlock=early.length?block("Scientific & early-career evidence",early):"";

  $("profileStructure").innerHTML=
    block("Work history",roleRows)+
    summaryBlock+
    workBlock+
    capabilityBlock+
    technologyBlock+
    domainBlock+
    signalBlock+
    scientificBlock+
    block("Education",edu)+
    block("Certifications",certs)
    ||`<div class="helper">No structured resume details available.</div>`;
}
function renderEvidence(){
  const q=($("evidenceSearch").value||"").toLowerCase();
  const ev=S.evidence.filter(e=>e.sourceType==="validation").filter(e=>!q||[e.capability,e.statement,e.company,e.role,e.period,e.rawValidation].join(" ").toLowerCase().includes(q));
  $("evidenceList").innerHTML=ev.length?ev.map(e=>{
    const status=e.negative?"Confirmed gap":"Verified";
    const context=[e.company,e.role,e.period].filter(Boolean).join(" · ");
    const original=e.rawValidation?`<div class="evidence-original"><span>You originally said</span><p>${esc(e.rawValidation)}</p></div>`:"";
    return `<div class="verified-evidence-card ${e.negative?"negative":""}" data-id="${esc(e.id)}">
      <div class="verified-evidence-head">
        <div><strong>${esc(e.capability||E.TAXONOMY[e.category]?.label||"Verified evidence")}</strong>${context?`<small>${esc(context)}</small>`:""}</div>
        <span class="source-badge ${e.negative?"negative":"remembered"}">${esc(status)}</span>
      </div>
      <div class="evidence-remember"><span>Pursuit will remember</span><p>${esc(e.statement)}</p></div>
      ${original}
      <div class="verified-actions"><button class="ghost compact-control edit-evidence" data-id="${esc(e.id)}">Edit</button><button class="textbtn compact-control remove-evidence" data-id="${esc(e.id)}">Remove</button></div>
    </div>`;
  }).join(""):`<div class="empty-verified"><strong>Nothing extra to manage yet.</strong><span>When you verify a gap during an application, it will appear here — separate from your resume.</span></div>`;
  $$(".edit-evidence").forEach(b=>b.addEventListener("click",()=>openEvidenceEdit(b.dataset.id)));
  $$(".remove-evidence").forEach(b=>b.addEventListener("click",()=>removeEvidence(b.dataset.id)));
}
function openEvidenceEdit(id){
  const e=S.evidence.find(x=>x.id===id&&x.sourceType==="validation");if(!e)return;
  EDIT_EVIDENCE_ID=id;
  $("editEvidenceTitle").textContent=e.capability||"Edit what Pursuit remembers";
  $("editEvidenceStatement").value=e.statement||"";
  $("editEvidenceCompany").value=e.company||"";
  $("editEvidenceRole").value=e.role||"";
  $("editEvidencePeriod").value=e.period||"";
  $("evidenceEditDialog").showModal();
}
function removeEvidence(id){
  const e=S.evidence.find(x=>x.id===id&&x.sourceType==="validation");if(!e)return;
  if(!confirm(`Remove this ${e.negative?"confirmed gap":"verified addition"} from Pursuit's profile? Future analyses will no longer use it.`))return;
  S.evidence=S.evidence.filter(x=>x.id!==id);save();renderProfile();toast("Removed from your profile.");
}
$("saveEvidenceEditBtn").addEventListener("click",()=>{
  const e=S.evidence.find(x=>x.id===EDIT_EVIDENCE_ID&&x.sourceType==="validation");if(!e)return;
  const statement=$("editEvidenceStatement").value.trim();if(!statement){toast("Add the fact Pursuit should remember.");return}
  e.statement=statement;e.company=$("editEvidenceCompany").value.trim();e.role=$("editEvidenceRole").value.trim();e.period=$("editEvidencePeriod").value.trim();
  e.scope=e.scope||"Unspecified";e.updatedAt=new Date().toISOString();
  save();$("evidenceEditDialog").close();EDIT_EVIDENCE_ID=null;renderProfile();toast("Verified addition updated.");
});
$("evidenceSearch").addEventListener("input",renderEvidence);
$("savePractical").addEventListener("click",()=>{S.profileFacts.workAuth=$("workAuth").value;S.profileFacts.travel=$("travel").value;save();toast("Practical details saved.")});
$("backupBtn").addEventListener("click",()=>downloadText(JSON.stringify(S,null,2),"pursuit-profile-backup.json","application/json"));
$("restoreBackup").addEventListener("change",async()=>{const f=$("restoreBackup").files?.[0];if(!f)return;try{const x=JSON.parse(await f.text());if(!x.profile||!Array.isArray(x.evidence))throw new Error("Not a Pursuit profile backup.");S={...clone(DEFAULT),...x,version:"S2-GENERALIZED-RC2.3-ATOMIC-DEV"};save();renderProfile();toast("Profile restored.")}catch(e){toast(e.message)}});

// ---------- shell ----------
function renderShell(){
  const r=ready();$("setupView").classList.toggle("hidden",r);$("topNav").classList.toggle("hidden",!r);
  if(r){
    $("profileLine").innerHTML=`Resume ready: <strong>${esc(S.source?.filename||"source")}</strong> · ${esc(healthSummary())} · ${S.evidence.filter(e=>e.sourceType==="validation").length} remembered addition${S.evidence.filter(e=>e.sourceType==="validation").length===1?"":"s"}.`;
    if(!$("profileView").classList.contains("hidden"))renderProfile();
    renderRecent();
  }
}
renderShell();setView(ready()?"opportunities":"setup");
