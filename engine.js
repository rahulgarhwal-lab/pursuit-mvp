(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports)module.exports=api;
  root.PursuitEngine=api;
})(typeof window!=="undefined"?window:globalThis,function(){
"use strict";

const STOP=new Set("the a an and or for to of in on with from by as at is are was were be been being this that these those your our their you we they it its will would should could can may must have has had do does did into across through within about than more most other all any each both such role position work working strong ability experience years team teams company business product products".split(/\s+/));

const TAXONOMY={
  product_strategy:{label:"Product strategy & roadmap ownership",direct:["product strategy","product vision","roadmap","roadmaps","portfolio management","portfolio strategy","product lifecycle","product requirements","backlog","user stories","prioritization","business case","value proposition"],adjacent:["program strategy","project roadmap"]},
  customer_market:{label:"Customer insight & market translation",direct:["voice of the customer","customer insights","customer needs","customer feedback","user research","market research","market insights","industry trends","translate customer","product discovery"],adjacent:["customer analytics","market intelligence","competitive intelligence","workflow observation"]},
  commercialization:{label:"Customer insight, commercialization & adoption",direct:["customer discovery","go-to-market","go to market","product launch","launch readiness","commercialization","product positioning","customer engagement","adoption","customer satisfaction","sales and marketing"],adjacent:["market research","market intelligence","change management","user training","regional rollout","demand generation","campaign"]},
  performance_value:{label:"Product performance & value realization",direct:["product performance","performance measurement","commercial performance","business impact","kpi","kpis","success metrics","adoption measurement","usage measurement","value realization"],adjacent:["field feedback","customer signals","performance data","effectiveness","analytics"]},
  interoperability:{label:"Healthcare interoperability & integration",direct:["healthcare interoperability","ehr","emr","hl7","fhir","healthcare data exchange","healthcare it integration","digital health platform"],adjacent:["api","apis","data integration","system integration","data exchange","cloud platform"]},
  regulated:{label:"Quality, Regulatory & Clinical collaboration",direct:["quality","regulatory affairs","regulatory","clinical affairs","quality assurance","design controls"],adjacent:["r&d","research and development","engineering","compliance","governance","privacy","release readiness","go/no-go"]},
  healthcare_domain:{label:"Healthcare / medical technology domain",direct:["medical device","medical devices","digital health","healthcare software","healthcare it","diagnostics","diagnostic","health technology"],adjacent:["life sciences","life science","biomedical","biotechnology","scientific","pharma","pharmaceutical"]},
  agile_delivery:{label:"Agile product delivery",direct:["agile","scrum","sprint","backlog","user stories","acceptance criteria","release planning","uat","go-live"],adjacent:["project management","release readiness"]},
  data_ai:{label:"Data, analytics & AI products",direct:["ai product","machine learning","genai","generative ai","analytics product","data product","data platform","predictive analytics","ai assistant"],adjacent:["analytics","data science","cloud platform"]},
  crm_workflow:{label:"CRM & workflow integration",direct:["salesforce","crm","salesforce crm","lead-to-cash","opportunity","account planning","workflow integration"],adjacent:["erp","digital commerce","embedded analytics"]},
  leadership:{label:"Cross-functional product leadership",direct:["cross-functional","stakeholder management","matrix leadership","lead cross-functional","decision facilitation","risk and dependency"],adjacent:["partner","collaborate","coordinate"]},
  people_management:{label:"Direct people leadership",direct:["direct reports","people manager","people management","managed a team","performance reviews","hiring decisions","career development"],adjacent:["operationally lead","vendor resources","contractor resources","matrix leadership"]},
  recurring_revenue:{label:"Subscriptions & recurring revenue",direct:["subscription","subscriptions","recurring revenue","annual recurring revenue","arr"],adjacent:["digital services","service offerings","commercialization"]},
  financial:{label:"P&L / financial ownership",direct:["p&l","profit and loss","budget ownership","revenue ownership","financial ownership","pricing strategy"],adjacent:["business case","value realization","commercial impact","cost savings"]},
  scientific:{label:"Scientific / biomedical foundation",direct:["biomedical engineering","biotechnology","molecular biology","life sciences","scientific workflow","research"],adjacent:["phd","laboratory","therapeutics"]},
  crm_ownership:{label:"CRM product ownership & roadmap leadership",direct:["crm product owner","crm product ownership","own crm","owned crm","crm roadmap","crm backlog","accountable for crm","crm product strategy"],adjacent:["salesforce crm integration","crm integration","salesforce crm","product strategy","roadmap","backlog"]},
  crm_field:{label:"Life-sciences CRM & field-process experience",direct:["veeva crm","commercial field","medical field","medical affairs","field engagement","field processes","field productivity"],adjacent:["salesforce crm","salesforce","customer engagement","omnichannel","account planning","sales operations","commercial field"]},
  crm_modernization:{label:"CRM modernization, data integration & omnichannel ecosystem",direct:["crm modernization","next-generation crm","next generation crm","crm ecosystem","platform evolution","crm data management","data warehouse","omnichannel"],adjacent:["salesforce crm","api","apis","data integration","erp","cloud platform","digital engagement","customer engagement"]},
  crm_ops:{label:"CRM delivery, platform operations & vendor/SaaS management",direct:["platform operations","platform administration","managed services","issue resolution","vendor delivery","saas partner","vendor management","backlog management","release planning"],adjacent:["external partners","vendor resources","contractor resources","release readiness","uat","user stories","acceptance criteria"]},
  crm_governance:{label:"Governance, privacy, compliance, adoption & measurable value",direct:["privacy","compliance","quality","legal","data quality","adoption","usage","kpi","business impact","governance"],adjacent:["gdpr","pii","value realization","change management","training","success criteria"]},
  gtm_commercial:{label:"Commercial, GTM & customer-market leadership",direct:["go-to-market","go to market","product marketing","sales","customer facing","positioning","product launch","product launches","commercial execution","demand generation","customer engagement","tender response"],adjacent:["commercial","market intelligence","competitive intelligence","ecommerce","digital commerce","campaign","customer insights"]},
  enterprise_product:{label:"Enterprise product leadership at scale",direct:["enterprise product","enterprise products","large complex organizations","global product scaling","global portfolio","global suite","scaled the broader","2,500+ users","2500+ users","enterprise platform","enterprise data platform"],adjacent:["global","regional rollout","cloud platform","portfolio","large organizations","scaling products"]},
  ai_production:{label:"Production AI product delivery",direct:["ai-powered product capabilities in production","ai powered product capabilities in production","production ai","production environment","production environments","deployed ai","deployed machine learning","operationalized ai","scaled ai-powered","scaled ai powered","production deployment"],adjacent:["ai product management","applied ai","machine learning","genai","generative ai","ai assistant","ai assistants","predictive analytics","human-in-the-loop","ai evaluation","pilot","pilots"]},
  product_tenure:{label:"10+ years of product-management experience",direct:["10+ years product management","10 years product management","product manager","product owner","product management"],adjacent:["digital product","portfolio leader","commercial digital technologies"]},
  education:{label:"Education & credentials",direct:["bachelor","master","phd","mba","degree","certification","capm"],adjacent:[]},
  travel:{label:"Travel requirement",direct:["travel as required","ability to travel","travel required"],adjacent:[]},
  sponsorship:{label:"Work authorization / sponsorship",direct:["visa sponsorship","sponsorship","work authorization","authorized to work"],adjacent:[]}
};

const VALIDATION={
  ai_production:[
    {id:"production",label:"Which statement best describes the AI capability?",options:["Production and used by real users","Production but limited rollout","Pilot / evaluation only","Exploration / prototype","None"]},
    {id:"role",label:"What was your role?",options:["Accountable product owner","Product lead","Contributor","Advisor"]},
    {id:"scope",label:"What did you own directly?",multi:true,options:["Use-case prioritization","Requirements / acceptance criteria","Model or AI evaluation","Human-in-the-loop controls","Launch / rollout","Adoption / value measurement","None"]}
  ],
  product_tenure:[
    {id:"years",label:"How much of your career has genuinely been product-management work, even if an older title was different?",options:["10+ years","8-9 years","6-7 years","Under 6 years"]}
  ],
  crm_ownership:[
    {id:"ownership",label:"What was your actual relationship to the CRM product?",options:["Owned CRM roadmap/backlog","Shared CRM product ownership","Owned products that integrated with CRM","Contributor to CRM delivery","None"]},
    {id:"platform",label:"Which CRM platform did that involve?",multi:true,options:["Veeva CRM","Salesforce CRM","Other enterprise CRM","None"]},
    {id:"process",label:"Which business workflows did you support directly?",multi:true,options:["Commercial field","Medical Affairs field","Omnichannel/customer engagement","Sales operations","None"]}
  ],
  crm_field:[
    {id:"platform",label:"Which CRM platform have you used directly?",multi:true,options:["Veeva CRM","Salesforce CRM","Other enterprise CRM","None"]},
    {id:"process",label:"Which field processes have you supported directly?",multi:true,options:["Commercial field","Medical Affairs field","Omnichannel/customer engagement","Sales operations","None"]},
    {id:"role",label:"What was your role?",options:["Accountable owner","Product lead","Contributor","Advisor"]}
  ],
  crm_ops:[
    {id:"scope",label:"Which of these have you actually owned or coordinated?",multi:true,options:["Backlog/release planning","Platform operations/support","Managed services","Vendor/SaaS management","Issue resolution","None"]},
    {id:"role",label:"What was your role?",options:["Accountable owner","Product lead","Contributor","Advisor"]}
  ],
  crm_governance:[
    {id:"functions",label:"Which functions did you work with directly?",multi:true,options:["Legal","Privacy","Compliance","Quality","Commercial","Medical Affairs","None"]},
    {id:"scope",label:"What did the work cover?",multi:true,options:["Governance","Privacy/compliance","Data quality","Adoption/KPIs","Release readiness","None"]}
  ],
  interoperability:[
    {id:"systems",label:"Have you directly worked with any of these?",multi:true,options:["EHR/EMR","HL7/FHIR","Healthcare data exchange","Healthcare IT integration","API integration only","None"]},
    {id:"role",label:"What was your role?",options:["Accountable owner","Product lead","Contributor","Advisor"]}
  ],
  regulated:[
    {id:"functions",label:"Which functions did you work with directly?",multi:true,options:["Quality","Regulatory","Clinical Affairs","R&D","Engineering","None"]},
    {id:"role",label:"What was your role?",options:["Accountable owner","Product lead","Contributor","Advisor"]}
  ],
  healthcare_domain:[
    {id:"domain",label:"Which environment best describes your direct product experience?",options:["Medical devices","Digital health","Healthcare software / IT","Diagnostics","Life sciences / research tools","None"]},
    {id:"years",label:"Approximate direct experience",options:["5+ years","3-5 years","1-3 years","Less than 1 year"]}
  ],
  commercialization:[
    {id:"scope",label:"What have you done directly?",multi:true,options:["Customer discovery","Go-to-market planning","Product launch","Commercialization","Product positioning","Adoption / success metrics","None"]},
    {id:"role",label:"What was your role?",options:["Accountable owner","Product lead","Contributor","Advisor"]}
  ],
  customer_market:[
    {id:"scope",label:"What have you done directly?",multi:true,options:["Customer interviews","User research","Market research","Competitive research","Translate needs into requirements","None"]},
    {id:"role",label:"What was your role?",options:["Accountable owner","Product lead","Contributor","Advisor"]}
  ],
  product_strategy:[
    {id:"scope",label:"What did you own?",options:["Portfolio","Product","Program","Feature","Contributor only"]},
    {id:"authority",label:"Decision authority",options:["Direct accountability","Shared accountability","Influence only"]}
  ],
  people_management:[
    {id:"people",label:"What kind of leadership was this?",options:["Direct reports","Contractor/vendor resources","Matrix/cross-functional only","Advisor only"]},
    {id:"responsibility",label:"Which responsibilities did you have?",multi:true,options:["Hiring decisions","Performance reviews","Promotion input","Career development","Work allocation","None"]}
  ],
  financial:[{id:"scope",label:"What did you directly own?",options:["P&L","Budget","Pricing","Business case/value realization only","None"]}]
};

function norm(s=""){return String(s).toLowerCase().replace(/[–—]/g,"-").replace(/[^\p{L}\p{N}+#$€%&/.\-\s]/gu," ").replace(/\s+/g," ").trim()}
function tokens(s=""){return norm(s).split(" ").filter(x=>x.length>2&&!STOP.has(x))}
const PHRASE_CACHE=new Map();
function phraseRegex(phrase=""){
  const p=norm(phrase);if(!p)return null;if(PHRASE_CACHE.has(p))return PHRASE_CACHE.get(p);
  const escaped=p.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/\s+/g,"\\s+");
  const r=new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`,"u");PHRASE_CACHE.set(p,r);return r;
}
function hasPhrase(text,phrase){const r=phraseRegex(phrase);return !!r&&r.test(norm(text))}
function hasAny(text,arr=[]){return arr.some(x=>hasPhrase(text,x))}
function countAny(text,arr=[]){return arr.reduce((a,x)=>a+(hasPhrase(text,x)?1:0),0)}
function similarity(a,b){const A=new Set(tokens(a)),B=tokens(b);if(!A.size||!B.length)return 0;let hit=0;for(const x of B)if(A.has(x))hit++;return hit/Math.max(4,Math.sqrt(A.size*B.length))}
function unique(arr){return [...new Set(arr.filter(Boolean))]}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function uid(){return "e_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8)}
function cleanLine(s=""){
  return String(s).replace(/\f/g," ").replace(/\u00ad/g,"")
    .replace(/\bS\s*ELECTED\s+I\s*MPACT\b/gi,"SELECTED IMPACT")
    .replace(/[•●▪◦]/g,"•")
    .replace(/([A-Za-z])-\s+([A-Za-z])/g,"$1-$2")
    .replace(/([A-Za-z])\s+-\s+([A-Za-z])/g,"$1-$2")
    .replace(/\s+([,.;:])/g,"$1")
    .replace(/\s+/g," ").trim();
}
function cleanMetaLabel(s=""){
  return cleanLine(s)
    .replace(/^(?:overview|careers?|jobs?|job overview|position overview)\s*[:\-|]?\s*/i,"")
    .replace(/\s+(?:overview|careers?)$/i,"")
    .trim();
}
function sentenceCase(s=""){s=cleanLine(s);return s?s[0].toUpperCase()+s.slice(1):s}
function capWords(s=""){return String(s).replace(/\b[a-z]/g,c=>c.toUpperCase())}

function classifyText(text){
  let best={category:"general",score:0,direct:0,adjacent:0};
  for(const [key,c] of Object.entries(TAXONOMY)){
    const d=countAny(text,c.direct),a=countAny(text,c.adjacent);
    const score=d*4+a;
    if(score>best.score)best={category:key,score,direct:d,adjacent:a};
  }
  return best;
}
function classifyTextExcept(text,excluded=[]){
  const skip=new Set(excluded);let best={category:"general",score:0,direct:0,adjacent:0};
  for(const [key,c] of Object.entries(TAXONOMY)){if(skip.has(key))continue;const d=countAny(text,c.direct),a=countAny(text,c.adjacent),score=d*4+a;if(score>best.score)best={category:key,score,direct:d,adjacent:a}}
  return best;
}

function sectionName(line){
  const n=norm(line);
  if(/^(professional summary|summary)$/.test(n))return"summary";
  if(/^selected impact snapshot$/.test(n))return"snapshot";
  if(/^core capabilities$/.test(n))return"capabilities";
  if(/^professional experience$/.test(n))return"experience";
  if(/^selected impact$/.test(n))return"impact";
  if(/^scientific foundation/.test(n))return"early";
  if(/^education/.test(n))return"education";
  if(/^certifications?$/.test(n))return"certifications";
  return null;
}
function looksCompanyDate(line){
  return /\b(19|20)\d{2}\s*[-–]\s*(present|(19|20)\d{2})\b/i.test(line) || (/\|/.test(line)&&/\b[A-Z]{2}\b/.test(line)&&line.length<120);
}
function looksRole(line){
  const n=norm(line);
  return line.length<90 && /\b(product|director|manager|owner|specialist|scientist|intern|research|lead|consultant|engineer|analyst|architect)\b/.test(n) && !/[.!?]$/.test(line) && !/\b(accelerate|supporting|delivering|enabling|investigating|mapping|developing|building|conducted|completed)\b/.test(n);
}
function splitResumeLines(text){
  return String(text).replace(/\r/g,"").split("\n").map(x=>x.trim()).filter((x,i,a)=>x||a[i-1]);
}
function isDegreeLine(line=""){const x=cleanLine(line);return /^(?:ph\.?d\.?|m\.?s\.?|m\.?a\.?|b\.?s\.?|b\.?a\.?|mba)\s*[,–-]/i.test(x)||/^(?:doctorate|doctoral degree|master(?:'s)? degree|bachelor(?:'s)? degree)\b/i.test(x)}
function isCertificationLine(line=""){const n=norm(line);return /\b(certified|certification|certificate|capm|pmp)\b/.test(n)||/\bproject management institute\b/.test(n)||/\bsalesforce certified\b/.test(n)}
function isYearOnly(line=""){return /^(?:19|20)\d{2}$/.test(cleanLine(line))}
function looksInstitutionLine(line=""){return /^(?:university|college|institute|school|academy)\b/i.test(cleanLine(line))}
function credentialContamination(line=""){const degree=isDegreeLine(line),cert=isCertificationLine(line);return degree&&cert}
function splitCredentialRow(line=""){
  const x=cleanLine(line),anchors=[/\bSalesforce Certified\b/i,/\bCertified Associate\b/i,/\bCertified [A-Za-z]/i,/\bProject Management Institute\b/i,/\bCAPM\b/i,/\bPMP\b/i];
  let idx=-1;for(const r of anchors){const m=x.match(r);if(m&&m.index>0&&(idx<0||m.index<idx))idx=m.index}
  return idx>0?[cleanLine(x.slice(0,idx)),cleanLine(x.slice(idx))]:[x,""];
}
function parseCredentialRows(rows=[]){
  const education=[],certifications=[],warnings=[];
  const appendEdu=x=>{if(!x)return;if(education.length)education[education.length-1]=cleanLine(education[education.length-1]+" "+x);else warnings.push(`Unattached education continuation: ${x}`)};
  const appendCert=x=>{if(!x)return;if(certifications.length)certifications[certifications.length-1]=cleanLine(certifications[certifications.length-1]+" "+x);else warnings.push(`Unattached certification continuation: ${x}`)};
  for(const row of rows){let line=cleanLine(row.line);if(!line||/^education\s+certifications?$/i.test(line))continue;
    if(isDegreeLine(line)){
      const [left,right]=splitCredentialRow(line);education.push(left);
      if(right){if(/^project management institute\b/i.test(right)&&certifications.length)appendCert(right);else certifications.push(right)}
      continue;
    }
    if(isCertificationLine(line)){
      if(/^project management institute\b/i.test(line)&&certifications.length)appendCert(line);else certifications.push(line);continue;
    }
    // In two-column PDF extraction, a single row can contain the left-column school continuation and right-column certification year.
    const y=line.match(/^(.*?\S)\s+((?:19|20)\d{2})$/);
    if(y&&education.length&&certifications.length){appendEdu(y[1]);appendCert(y[2]);continue}
    if(isYearOnly(line)&&certifications.length){appendCert(line);continue}
    if(row.section==="education"&&education.length){appendEdu(line);continue}
    if(row.section==="certifications"&&certifications.length){appendCert(line);continue}
    warnings.push(`Unclassified credential row quarantined: ${line}`);
  }
  for(let i=0;i<education.length;i++)education[i]=cleanLine(education[i]).replace(/BiotechnologyUniversity/g,"Biotechnology - University");
  return {education,certifications,warnings};
}
function normalizeCapabilityLines(lines=[]){
  const out=[];let buf="";const flush=()=>{if(!buf)return;for(const part of buf.split("•").map(cleanLine).filter(Boolean)){const x=part.replace(/Leadto-Cash/gi,"Lead-to-Cash");if(x.length>2)out.push(x)}buf=""};
  for(const line0 of lines){const line=cleanLine(line0);if(!line)continue;const subhead=!line.includes("•")&&line.length<82&&line.split(/\s+/).length<=10&&/^(?:Define|Embed|Build|Drive|Lead|Create|Deliver|Manage|Develop|Own|Shape|Scale)\b/i.test(line);if(subhead){flush();continue}buf=cleanLine(buf+" "+line)}flush();return out;
}
function parseResume(text){
  const lines=String(text).replace(/\r/g,"").split("\n").map(x=>x.trim());
  let section="header",currentRole=null,pendingRole=null,impactMode=false;
  const roles=[],summary=[],capabilityLines=[],education=[],certifications=[],credentialRows=[],early=[],header=[],warnings=[];
  const nextNonEmpty=(idx)=>{for(let j=idx+1;j<lines.length;j++){const x=cleanLine(lines[j]);if(x)return x}return""};
  const addCredential=(line,declaredSection)=>{
    if(!line)return true;
    // PDF two-column extraction can place Education and Certifications headers before either column's content.
    // Content identity therefore wins over the most recently seen header.
    if(isDegreeLine(line)){
      if(credentialContamination(line)){warnings.push(`Mixed credential line quarantined: ${line}`);return true}
      education.push(line);return true;
    }
    if(isCertificationLine(line)){
      if(credentialContamination(line)){warnings.push(`Mixed credential line quarantined: ${line}`);return true}
      // A bare certifying organization can arrive on the same visual row as a degree. Do not turn it into work evidence.
      if(/^project management institute\b/i.test(line)&&certifications.length)certifications[certifications.length-1]=cleanLine(certifications[certifications.length-1]+" "+line);
      else certifications.push(line);
      return true;
    }
    if(isYearOnly(line)&&certifications.length){certifications[certifications.length-1]=cleanLine(certifications[certifications.length-1]+" "+line);return true}
    if(declaredSection==="education"&&looksInstitutionLine(line)&&education.length){education[education.length-1]=cleanLine(education[education.length-1]+" - "+line);return true}
    if(declaredSection==="certifications"&&certifications.length&&line.length<90){certifications[certifications.length-1]=cleanLine(certifications[certifications.length-1]+" "+line);return true}
    if(declaredSection==="education"){education.push(line);return true}
    if(declaredSection==="certifications"){certifications.push(line);return true}
    return false;
  };
  for(let i=0;i<lines.length;i++){
    const raw=lines[i],line=cleanLine(raw);if(!line)continue;
    const sec=sectionName(line);
    if(sec){
      if(sec==="impact"){impactMode=true;section="experience";continue}
      section=sec;impactMode=false;continue;
    }
    if(section==="header"){header.push(line);continue}
    if(section==="summary"){summary.push(line);continue}
    if(section==="capabilities"){capabilityLines.push(line);continue}
    if(section==="education"||section==="certifications"){credentialRows.push({line,section});continue}
    if(section==="early"){
      // Some PDFs print Education and Certifications side-by-side after this section heading.
      // If a credential-looking line appears here, classify it structurally instead of treating it as career evidence.
      if(isDegreeLine(line)){credentialRows.push({line,section:"education"});continue}
      if(isCertificationLine(line)){credentialRows.push({line,section:"certifications"});continue}
      if(isYearOnly(line)){credentialRows.push({line,section:"certifications"});continue}
      const starts=/^[•\-*]/.test(raw.trim()),piece=line.replace(/^[•\-*]\s*/,"").trim();
      const structural=looksRole(line)||looksCompanyDate(line)||/^(?:applied research experience|additional research experience|phd research)\b/i.test(line);
      if(starts||structural||!early.length)early.push(piece);else early[early.length-1]=cleanLine(early[early.length-1]+" "+piece);
      continue
    }
    if(section==="experience"){
      const nxt=nextNonEmpty(i);
      const isRole=looksRole(line)&&looksCompanyDate(nxt)&&!line.startsWith("•");
      if(isRole){pendingRole=line;continue}
      if(pendingRole&&looksCompanyDate(line)){
        currentRole={title:pendingRole,companyLine:line,bullets:[],impact:[]};
        const parts=line.split("|").map(x=>x.trim());
        currentRole.company=parts[0]||line;currentRole.dates=parts.find(x=>/\d{4}/.test(x))||"";
        roles.push(currentRole);pendingRole=null;impactMode=false;continue
      }
      if(!currentRole)continue;
      const target=impactMode?currentRole.impact:currentRole.bullets;
      const starts=/^[•\-*]/.test(raw.trim());
      const piece=line.replace(/^[•\-*]\s*/,"").trim();
      if(starts||!target.length)target.push(piece);
      else target[target.length-1]=cleanLine(target[target.length-1]+" "+piece);
    }
  }
  const parsedCredentials=parseCredentialRows(credentialRows);education.push(...parsedCredentials.education);certifications.push(...parsedCredentials.certifications);warnings.push(...parsedCredentials.warnings);
  const name=header.find(x=>/^[A-Z][A-Z\s,.'-]{4,}$/.test(x))||header[0]||"";
  const headline=header.find(x=>/\b(product|director|leader|manager)\b/i.test(x)&&x!==name)||"";
  const email=(text.match(/[\w.+-]+@[\w.-]+\.\w+/)||[])[0]||"";
  const phone=(text.match(/\b(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/)||[])[0]||"";
  const linkedin=(text.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i)||[])[0]||"";
  const normalizedCapabilities=normalizeCapabilityLines(capabilityLines);
  const importHealth={roles:roles.length,workItems:roles.reduce((n,r)=>n+r.bullets.length+r.impact.length,0),capabilities:normalizedCapabilities.length,education:education.length,certifications:certifications.length,warnings};
  return {raw:text,identity:{name,headline,email,phone,linkedin},summary:summary.join(" "),capabilityLines:normalizedCapabilities,roles,education,certifications,early,importHealth};
}
function scopeFrom(text){
  const n=norm(text);
  if(n.includes("enterprise"))return"Enterprise";
  if(n.includes("global"))return"Global";
  if(n.includes("portfolio"))return"Portfolio";
  if(n.includes("regional"))return"Regional";
  if(n.includes("product"))return"Product";
  if(n.includes("program"))return"Program";
  return"Unspecified";
}
function authorityFrom(text){
  const n=norm(text);
  if(/\bown|accountable|responsible for\b/.test(n))return"Direct accountability";
  if(/\blead|led|drive|drove\b/.test(n))return"Leadership";
  if(/\bpartner|collaborat|support|contribut\b/.test(n))return"Contributor / partner";
  return"Unspecified";
}
function metricFrom(text){return /[$€%]|\b\d+(?:\.\d+)?[KMB]\+?\b|\b\d{2,}\+?\b/i.test(text)}
function evidenceFromProfile(profile,filename="Resume"){
  const out=[];const now=()=>new Date().toISOString();
  const push=(obj)=>out.push({id:uid(),usable:true,sourceType:"resume",sourceLabel:filename,createdAt:now(),...obj});
  for(const role of profile.roles){
    for(const text of [...role.bullets,...role.impact]){
      const cls=classifyText(text);
      push({evidenceType:"work",category:cls.category,capability:TAXONOMY[cls.category]?.label||"Career evidence",statement:text,company:role.company||"",role:role.title||"",period:role.dates||"",scope:scopeFrom(text),authority:authorityFrom(text),metric:metricFrom(text)});
    }
  }
  for(const text of profile.capabilityLines){
    const cls=classifyText(text);
    push({evidenceType:"capability",category:cls.category,capability:TAXONOMY[cls.category]?.label||"Capability",statement:text,company:"",role:"Core capabilities",period:"",scope:scopeFrom(text),authority:"Declared capability",metric:false});
  }
  if(profile.summary){
    const cls=classifyText(profile.summary);
    push({evidenceType:"summary",category:cls.category,capability:"Professional summary",statement:profile.summary,company:"",role:"Summary",period:"",scope:scopeFrom(profile.summary),authority:authorityFrom(profile.summary),metric:metricFrom(profile.summary)});
  }
  for(const text of profile.education||[]){
    if(!text)continue;const contaminated=credentialContamination(text);
    push({evidenceType:"education",category:"education",capability:TAXONOMY.education.label,statement:text,company:"",role:"Education",period:"",scope:"Unspecified",authority:"Credential",metric:false,usable:!contaminated,quarantineReason:contaminated?"Mixed education/certification line":""});
  }
  for(const text of profile.certifications||[]){
    if(!text)continue;const contaminated=credentialContamination(text);
    push({evidenceType:"certification",category:"education",capability:TAXONOMY.education.label,statement:text,company:"",role:"Certification",period:"",scope:"Unspecified",authority:"Credential",metric:false,usable:!contaminated,quarantineReason:contaminated?"Mixed education/certification line":""});
  }
  for(const text of profile.early||[]){
    if(!text||looksRole(text)||looksCompanyDate(text))continue;
    const cls=classifyText(text);const useful=["scientific","healthcare_domain"].includes(cls.category)||/\b(research|scientific|biomedical|biotechnology|therapeutic|laboratory|molecular|clinical)\b/i.test(text);
    if(!useful)continue;
    push({evidenceType:"scientific_background",category:cls.category==="general"?"scientific":cls.category,capability:TAXONOMY.scientific.label,statement:text.replace(/^[•\-*]\s*/,""),company:"",role:"Scientific foundation",period:"",scope:"Unspecified",authority:"Background",metric:metricFrom(text)});
  }
  return out;
}



function sectionizeJD(jd){
  const raw=String(jd).replace(/\r/g,"").split("\n");
  let section="general";const lines=[];
  for(const x of raw){
    const line=cleanLine(x);if(!line)continue;const n=norm(line);
    if(/^(tasks|responsibilities|key responsibilities|what you will do|what youll do)/.test(n))section="tasks";
    else if(/^(your profile|qualifications|requirements|what you bring|basic qualifications|minimum qualifications)/.test(n))section="requirements";
    else if(/^(preferred|preferred qualifications|nice to have)/.test(n))section="preferred";
    else if(/^(about the position|about the role|the opportunity)/.test(n))section="about";
    else if(/^(why us|benefits|about us|contact|equal opportunity)/.test(n))section="boilerplate";
    lines.push({text:line,section});
  }
  const expanded=[];
  for(const item of lines){
    const parts=item.text.split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(cleanLine).filter(Boolean);
    if(parts.length>1)for(const p of parts)expanded.push({text:p,section:item.section});else expanded.push(item);
  }
  return expanded;
}
function sentenceContaining(jd,needles=[]){
  const items=sectionizeJD(jd).filter(x=>x.section!=="boilerplate");
  let best=null,bestScore=-1;
  for(const x of items){const hits=countAny(x.text,needles);if(!hits)continue;const s=hits*4+(x.section==="requirements"?1.5:x.section==="tasks"?1:0);if(s>bestScore){best=x.text;bestScore=s}}
  return best||"";
}
function portfolioFromJD(jd=""){
  const t=String(jd);const patterns=[/within\s+the\s+([^\.\n]{2,70}?\bportfolio)\b/i,/for\s+the\s+([^\.\n]{2,70}?\bportfolio)\b/i,/across\s+the\s+([^\.\n]{2,70}?\bportfolio)\b/i];
  for(const rx of patterns){const m=t.match(rx);if(m){const x=cleanLine(m[1]).replace(/^(?:a|an|the)\s+/i,"");if(x.length<80)return x}}
  return "";
}
function roleFactsFromJD(jd,title="",arch=""){
  const n=norm(jd),facts=[];const add=x=>{if(x&&!facts.includes(x))facts.push(x)};
  const senior=(title.match(/Associate Director|Senior Director|Executive Director|Director|Senior Manager|Senior Product Manager|Product Manager/i)||[])[0];if(senior)add(senior.replace(/\b\w/g,c=>c.toUpperCase()));
  if(hasAny(n,["life sciences","pharmaceutical","biopharma","therapeutics"]))add("Life sciences");
  else if(hasAny(n,["medical device","digital health","healthcare software","diagnostics"]))add("Healthcare technology");
  const portfolio=portfolioFromJD(jd);if(portfolio)add(portfolio);
  if(hasAny(n,["enterprise product experience","enterprise products"]))add("Enterprise products");
  if(hasAny(n,["ai-powered product capabilities","ai powered product capabilities","ai-driven innovation"]))add("AI-powered products");
  if(hasAny(n,["commercial"])&&hasAny(n,["medical affairs","medical field","medical organization","medical teams"]))add("Commercial + Medical");
  else if(hasAny(n,["commercial"]))add("Commercial");
  const yrs=String(jd).match(/(?:at least\s+)?(\d{1,2})\+?\s+years?\s+of\s+experience(?:\s+in\s+product management)?/i);if(yrs)add(`${yrs[1]}+ years`);
  if(/Veeva CRM[^.\n]{0,80}strongly preferred/i.test(jd)||/experience with Veeva CRM strongly preferred/i.test(jd))add("Veeva CRM strongly preferred");
  else if(/\bVeeva CRM\b/i.test(jd))add("Veeva CRM");
  if(/remote in the US/i.test(jd))add("Remote US");else if(/\bhybrid\b/i.test(jd))add("Hybrid");else if(/\bremote\b/i.test(jd))add("Remote");else if(/\bon[- ]site\b/i.test(jd))add("On-site");
  if(arch==="crm_product_owner")add("CRM platform ownership");
  return facts.slice(0,7);
}
function exactRoleTitle(text=""){
  const patterns=[
    /\b((?:Associate\s+|Senior\s+|Executive\s+)?Director\s+of\s+Product\s+Management(?:\s*\([^\)\n]{2,90}\))?)/i,
    /\b((?:Associate\s+Director|Senior\s+Director|Executive\s+Director|Director|Senior\s+Manager|Senior\s+Product\s+Manager|Product\s+Manager)[^\n.!?]{0,70}?(?:CRM\s+Product\s+Owner|Product\s+Owner|Product\s+Manager|Digital\s+Solutions))\b/i,
    /\b(Product\s+Manager\s*-?\s*Digital\s+Solutions)\b/i
  ];
  for(const rx of patterns){const m=String(text).match(rx);if(m)return cleanMetaLabel(m[1]).replace(/\s+to\s+join\s+us.*$/i,"").trim()}
  return "";
}
function companyFromJD(text="",url=""){
  const t=String(text);let company="",fromUrl=false;
  const at=t.match(/\bAt\s+([A-Z][A-Za-z0-9&.'’\-]+(?:\s+[A-Z][A-Za-z0-9&.'’\-]+){0,3})\s*,/);
  if(at)company=at[1];
  if(!company){
    const possessive=[...t.matchAll(/\b([A-Z][A-Za-z0-9&.'’\-]{2,}(?:\s+[A-Z][A-Za-z0-9&.'’\-]+){0,2})[’']s\s+(?:life sciences|healthcare|solutions|products|portfolio|team)\b/gi)];
    if(possessive.length)company=possessive[possessive.length-1][1];
  }
  if(!company&&/\bAlnylam Pharmaceuticals\b/i.test(t))company=(t.match(/\bAlnylam Pharmaceuticals\b/i)||[])[0]||"Alnylam Pharmaceuticals";
  if(!company&&/\bndd Medical Technologies\b/i.test(t))company=(t.match(/\bndd Medical Technologies\b/i)||[])[0]||"ndd Medical Technologies";
  if(!company&&url){try{company=new URL(url).hostname.replace(/^www\./,"").split(".")[0];fromUrl=true}catch{}}
  if(fromUrl)company=company.replace(/[-_]+/g," ").replace(/\b\w/g,c=>c.toUpperCase());
  return cleanMetaLabel(company);
}
function compactLocationFromJD(jd=""){
  const t=String(jd),parts=[];const add=x=>{if(x&&!parts.includes(x))parts.push(x)};
  if(/remote in the US|remote in the U\.S\.|remote.*United States/i.test(t))add("Remote US");
  if(/\bBarcelona\b/i.test(t))add("Barcelona");
  if(/\bLondon\b/i.test(t))add("London");
  if(!parts.length){
    const cityState=t.match(/\b(Cambridge|Boston|Burlington|Haverhill)\s*,\s*(MA|Massachusetts)\b/i);if(cityState)add(`${cityState[1]}, ${cityState[2].toUpperCase()==="MASSACHUSETTS"?"MA":cityState[2].toUpperCase()}`);
    else if(/\bremote\b/i.test(t))add("Remote");
  }
  return parts.join(" / ");
}
function metaFromJD(jd,url=""){
  const text=String(jd),lines=sectionizeJD(jd).map(x=>x.text);
  let title=exactRoleTitle(text)||"Opportunity";
  if(title==="Opportunity")title=lines.find(x=>/\b(product manager|product owner|director|associate director|senior manager)\b/i.test(x)&&x.length<150)||title;
  const company=companyFromJD(text,url),location=compactLocationFromJD(text),arch=detectArchetype(jd);
  const report=(text.match(/report\s+to\s+the\s+([^\.\n]{3,80})/i)||[])[1]||"";
  return {title:cleanMetaLabel(title),company:cleanMetaLabel(company),location,facts:roleFactsFromJD(jd,title,arch),reportsTo:cleanLine(report),portfolioName:portfolioFromJD(jd)};
}

function detectArchetype(jd){
  const n=norm(jd),crm=(n.match(/\bcrm\b/g)||[]).length;
  if(crm>=5&&hasAny(n,["product owner","product roadmap","roadmap","veeva crm","crm ecosystem"]))return"crm_product_owner";
  if(hasAny(n,["healthcare interoperability","ehr/emr","ehr","emr","pulmonary function","medical devices"])&&hasAny(n,["product manager","digital solutions","roadmap"]))return"healthcare_digital_product";
  if(hasAny(n,["director of product management"])&&hasAny(n,["enterprise product experience","enterprise products"])&&hasAny(n,["ai-powered product capabilities","ai powered product capabilities","ai-driven innovation"])&&hasAny(n,["product strategy","product vision","portfolio"]))return"enterprise_ai_product_director";
  return"general";
}
function crit(category,label,requirement,tier=2,mandatory=false,preferred=false,why=""){
  return {category,label,requirement:requirement||label,tier,mandatory,preferred,why,importance:tier===1?"Hiring gate":"Major differentiator"};
}
function archetypeCriteria(jd,arch){
  if(arch==="crm_product_owner")return[
    crit("crm_ownership","Life-sciences CRM product ownership & roadmap leadership",sentenceContaining(jd,["product owner","crm roadmap","accountable","roadmap","backlog"]),1,true,false,"This is the defining accountability of the role: owning the CRM product, not merely integrating with it."),
    crit("crm_field","Life-sciences CRM & Commercial/Medical field-process experience",sentenceContaining(jd,["veeva crm","commercial","medical","field processes","field engagement"]),1,false,true,"Direct field-CRM context determines how quickly someone can operate credibly with Commercial and Medical users."),
    crit("crm_modernization","CRM modernization, data integrations & omnichannel ecosystem",sentenceContaining(jd,["crm modernization","next-generation","integrations","data warehouse","omnichannel"]),2,false,false,"The role must improve today's platform while shaping the next CRM ecosystem."),
    crit("crm_ops","Product delivery, platform operations & vendor/SaaS management",sentenceContaining(jd,["platform operations","vendor","managed services","backlog","release planning","issue resolution"]),2,false,false,"This job owns the operating rhythm as well as the roadmap."),
    crit("crm_governance","Governance, privacy, compliance, adoption & measurable value",sentenceContaining(jd,["governance","privacy","compliance","quality","adoption","kpi","business impact"]),2,false,false,"Life-sciences CRM value depends on compliant operations, adoption, data quality, and measurable outcomes.")
  ];
  if(arch==="healthcare_digital_product")return[
    crit("product_strategy","Digital product strategy, roadmap & lifecycle ownership",sentenceContaining(jd,["product strategy","roadmap","portfolio","lifecycle"]),1,true,false,"The role is accountable for product direction and prioritization."),
    crit("healthcare_domain","Relevant healthcare / medical-technology product environment",sentenceContaining(jd,["medical devices","digital health","healthcare software","healthcare it","diagnostics"]),1,true,false,"The employer explicitly wants product-management experience in healthcare technology."),
    crit("interoperability","Healthcare interoperability, EHR/EMR & healthcare data exchange",sentenceContaining(jd,["healthcare interoperability","ehr","emr","healthcare data exchange","api"]),1,false,true,"Interoperability is a named product domain, not generic API experience."),
    crit("regulated","Quality, Regulatory & Clinical collaboration",sentenceContaining(jd,["quality","regulatory","clinical affairs","r&d"]),2,false,false,"Regulated cross-functional collaboration is part of the product lifecycle."),
    crit("commercialization","Customer insight, commercialization & adoption",sentenceContaining(jd,["customer insights","go-to-market","launch","commercialization","adoption"]),2,false,false,"The product manager must turn market insight into launched, adopted products.")
  ];
  if(arch==="enterprise_ai_product_director")return[
    crit("product_strategy","Senior product strategy & portfolio leadership",sentenceContaining(jd,["product vision","product strategy","portfolio","prioritization","roadmaps","investment decisions"]),1,true,false,"The Director is expected to set direction across a portfolio, make prioritization and investment decisions, and communicate that strategy to senior stakeholders."),
    crit("enterprise_product","Enterprise product leadership at scale",sentenceContaining(jd,["enterprise product experience","large, complex organizations","building and scaling products"]),1,true,false,"Enterprise scale is an explicit qualification, not a generic product-management preference."),
    crit("ai_production","Production AI product delivery",sentenceContaining(jd,["AI-powered product capabilities in production environments","AI powered product capabilities","scalable, reliable AI powered features"]),1,true,false,"The JD explicitly requires AI capabilities delivered in production; pilots or exploration alone are not equivalent."),
    crit("leadership","Cross-functional product execution & senior stakeholder influence",sentenceContaining(jd,["cross functional teams","matrix environment","senior stakeholders","engineering","UX","data science"]),2,true,false,"Execution depends on aligning product, engineering, UX, data science, commercial teams, and senior stakeholders without relying on direct authority."),
    crit("gtm_commercial","Commercial, GTM & customer-market leadership",sentenceContaining(jd,["go-to-market","Product Marketing","Sales","voice of the customer","market dynamics","competitive insights"]),2,false,false,"The role must connect product strategy to customer evidence, positioning, launches, sales, and market impact.")
  ];
  return null;
}

function requirementCandidates(jd){
  const items=sectionizeJD(jd),cand=[],arch=detectArchetype(jd),specialized=["crm_ownership","crm_field","crm_modernization","crm_ops","crm_governance"];
  for(const item of items){
    if(item.section==="boilerplate")continue;
    let cls=classifyText(item.text),ni=norm(item.text);
    if(arch!=="crm_product_owner"&&specialized.includes(cls.category))cls=classifyTextExcept(item.text,specialized);
    if(/\b(bachelor|masters?|phd|ph\.d|mba|degree|certification)\b/.test(ni))cls={category:"education",score:4,direct:1,adjacent:0};
    if(/\btravel\b/.test(ni))cls={category:"travel",score:4,direct:1,adjacent:0};
    if(/\bvisa sponsorship|sponsorship|work authorization\b/.test(ni))cls={category:"sponsorship",score:4,direct:1,adjacent:0};
    if(cls.score<=0)continue;
    let score=cls.score+(item.section==="requirements"?9:item.section==="preferred"?5:item.section==="tasks"?4:0);
    const mandatory=/\b(required|must|minimum|proven|8\+|7\+|5\+|experience in)\b/i.test(item.text);
    const preferred=/\b(preferred|strongly preferred|highly desirable|advantage|nice to have|familiarity)\b/i.test(item.text);
    if(mandatory)score+=6;if(preferred)score+=2;
    cand.push({category:cls.category,label:TAXONOMY[cls.category]?.label||item.text,requirement:item.text,score,mandatory,preferred,section:item.section,tier:mandatory?1:2,importance:mandatory?"Hiring gate":"Major differentiator"});
  }
  const by={};
  for(const c of cand){if(!by[c.category])by[c.category]={...c,mentions:1};else{by[c.category].mentions++;by[c.category].score+=Math.min(3,c.score*.15);by[c.category].mandatory||=c.mandatory;if(c.score>(by[c.category]._bestScore||0)){by[c.category].requirement=c.requirement;by[c.category]._bestScore=c.score}}}
  return Object.values(by).sort((a,b)=>b.score-a.score);
}
function topFiveRequirements(jd){const arch=detectArchetype(jd),special=archetypeCriteria(jd,arch);if(special)return special;return requirementCandidates(jd).filter(x=>!["travel","sponsorship","education","product_tenure"].includes(x.category)).slice(0,5)}
function gateRequirements(jd){
  const out=requirementCandidates(jd).filter(x=>["travel","sponsorship","education"].includes(x.category));
  const pm=String(jd).match(/(?:at least\s+)?(\d{1,2})\+?\s+years?\s+of\s+experience\s+in\s+product management/i);
  if(pm)out.unshift({category:"product_tenure",label:`${pm[1]}+ years of product-management experience`,requirement:cleanLine(pm[0]),requiredYears:Number(pm[1]),tier:1,mandatory:true,critical:true,importance:"Eligibility gate"});
  return out;
}

function evidenceEligible(c,e){
  if(!e||e.usable===false)return false;
  const t=e.evidenceType||(e.sourceType==="validation"?"validation":"work");
  if(["education","certification"].includes(t))return ["education","scientific","healthcare_domain"].includes(c.category);
  if(t==="scientific_background")return ["scientific","healthcare_domain"].includes(c.category);
  return true;
}
function roleGroups(evidence=[]){
  const map={};for(const e of evidence.filter(e=>e.usable!==false&&!["education","certification","scientific_background"].includes(e.evidenceType))){const k=(e.company||"")+"|"+(e.role||"");(map[k]||=[]).push(e)}return Object.values(map).map(g=>({items:g,text:g.map(e=>e.statement).join(" "),company:g[0]?.company||"",role:g[0]?.role||""}));
}
function bestGeneric(c,evidence=[]){
  const tax=TAXONOMY[c.category]||{direct:[],adjacent:[]};
  const ranked=evidence.filter(e=>evidenceEligible(c,e)).map(e=>{
    const t=e.evidenceType||(e.sourceType==="validation"?"validation":"work");
    let s=similarity(c.requirement+" "+c.label,e.statement)*.38;
    if(e.category===c.category)s+=.30;
    s+=Math.min(.34,countAny(e.statement,tax.direct)*.12);s+=Math.min(.14,countAny(e.statement,tax.adjacent)*.045);
    if(e.sourceType==="validation"&&e.category===c.category)s+=.22;
    if(t==="work")s+=.10;else if(t==="validation")s+=.14;else if(t==="capability")s-=.04;else if(t==="summary")s-=.08;else if(["education","certification","scientific_background"].includes(t))s-=.12;
    return {...e,_score:s};
  }).sort((a,b)=>b._score-a._score);
  return ranked;
}
function evidenceSnippetScore(text,c){
  const tax=TAXONOMY[c.category]||{direct:[],adjacent:[]};return similarity(c.requirement+" "+c.label,text)*.45+Math.min(.5,countAny(text,tax.direct)*.17)+Math.min(.18,countAny(text,tax.adjacent)*.06);
}
function evidenceFragments(text,c){
  const cleaned=cleanLine(text),parts=cleaned.split(/(?<=[.!?;])\s+|\s*;\s*/).map(cleanLine).filter(x=>x.length>24);
  const candidates=(parts.length?parts:[cleaned]).map(x=>({x,s:evidenceSnippetScore(x,c)})).sort((a,b)=>b.s-a.s);
  return candidates.filter(x=>x.s>.04).slice(0,2).map(({x})=>x.length>205?x.slice(0,202).replace(/\s+\S*$/,'')+"…":x);
}
function supportingEvidence(c,ranked=[]){
  const out=[],seen=new Set();
  const preferred=ranked.filter(e=>["work","validation"].includes(e.evidenceType||(e.sourceType==="validation"?"validation":"work")));
  const fallback=ranked.filter(e=>!preferred.includes(e));
  for(const e of preferred){
    if((e._score||0)<.18)continue;
    for(const text of evidenceFragments(e.statement,c)){
      const key=norm(text);if(!text||seen.has(key))continue;seen.add(key);
      out.push({text,company:e.company||"",role:e.role||"",period:e.period||"",sourceType:e.evidenceType||(e.sourceType==="validation"?"validation":"work"),score:e._score||0});if(out.length>=3)return out;
    }
  }
  if(!out.length){for(const e of fallback){
    if((e._score||0)<.22)continue;for(const text of evidenceFragments(e.statement,c)){const key=norm(text);if(!text||seen.has(key))continue;seen.add(key);out.push({text,company:e.company||"",role:e.role||"",period:e.period||"",sourceType:e.evidenceType||"resume",score:e._score||0});if(out.length>=2)return out;}
  }}
  return out;
}
function statusObj(status,gapType,reason,best,remembered=null,extra={}){return {status,gapType,reason,best:best||null,remembered,ranked:extra.ranked||[],supportingEvidence:extra.supportingEvidence||[],...extra}}
function rememberedFor(category,evidence=[]){return evidence.filter(e=>e.sourceType==="validation"&&e.category===category).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)))[0]||null}
function hasInSameRole(evidence,phrasesA,phrasesB){return roleGroups(evidence).some(g=>hasAny(g.text,phrasesA)&&hasAny(g.text,phrasesB))}

function matchCriterion(c,evidence=[]){
  const eligible=evidence.filter(e=>evidenceEligible(c,e)),all=eligible.map(e=>norm(e.statement)).join(" "),ranked=bestGeneric(c,eligible),top=ranked[0]||null,workCandidate=ranked.find(e=>["work","validation"].includes(e.evidenceType||(e.sourceType==="validation"?"validation":"work"))),best=workCandidate&&(!top||workCandidate._score>=top._score*.62)?workCandidate:top,remembered=rememberedFor(c.category,evidence),support=supportingEvidence(c,ranked);
  const pack=extra=>({ranked:ranked.slice(0,6),supportingEvidence:support,...(extra||{})});
  if(c.category==="product_strategy"){
    const directWork=ranked.find(e=>(e.evidenceType==="work"||e.sourceType==="validation")&&countAny(e.statement,TAXONOMY.product_strategy.direct)>=2);
    if(directWork)return statusObj("Strong","None","Direct work evidence covers portfolio/product strategy, prioritization, roadmap ownership, and lifecycle decisions.",directWork,remembered,pack());
  }
  if(c.category==="enterprise_product"){
    const groups=roleGroups(evidence),g=groups.find(x=>hasAny(x.text,["global suite","global portfolio","global product scaling","2,500+ users","2500+ users","scaled the broader"])&&hasAny(x.text,["product","portfolio","roadmap","cloud platform"]));
    const direct=ranked.find(e=>e.evidenceType==="work"&&hasAny(e.statement,TAXONOMY.enterprise_product.direct));
    if(direct||g)return statusObj("Strong","None","The resume shows products/portfolios scaled across a global enterprise context with substantial user and operating scope.",direct||best,remembered,pack());
    if(best&&best._score>=.3)return statusObj("Partial","Wording gap","Scaling evidence exists, but enterprise customer/organization scope is not fully explicit.",best,remembered,pack());
    return statusObj("Gap","Capability gap","No verified evidence currently establishes enterprise product leadership at scale.",best,remembered,pack());
  }
  if(c.category==="ai_production"){
    const val=evidence.find(e=>e.sourceType==="validation"&&e.category==="ai_production"&&e.direct&&!e.negative);
    const prod=ranked.find(e=>(e.evidenceType==="work"||e.sourceType==="validation")&&hasAny(e.statement,TAXONOMY.ai_production.direct)&&hasAny(e.statement,["ai","machine learning","genai","generative ai"]));
    const ai=ranked.find(e=>(e.evidenceType==="work"||e.sourceType==="validation")&&hasAny(e.statement,TAXONOMY.ai_production.adjacent));
    if(val||prod)return statusObj("Strong","None","Production AI product delivery is explicitly verified, including real-user deployment rather than pilot-only work.",val||prod,remembered,pack());
    if(ai)return statusObj("Partial","Resume gap","Substantial AI product-management evidence exists, but the resume does not clearly distinguish sustained production deployment from pilots, evaluation, or exploration.",ai,remembered,pack());
    return statusObj("Gap","Capability gap","No verified AI product-delivery evidence is currently available.",best,remembered,pack());
  }
  if(c.category==="leadership"){
    const direct=ranked.find(e=>e.evidenceType==="work"&&hasAny(e.statement,["cross-functional","matrix leadership","lead cross-functional"])&&hasAny(e.statement,["engineering","data science","commercial","stakeholder","external partners"]));
    if(direct)return statusObj("Strong","None","Direct work evidence shows cross-functional product leadership across technical, commercial, and partner teams.",direct,remembered,pack());
  }
  if(c.category==="gtm_commercial"){
    const direct=ranked.find(e=>e.evidenceType==="work"&&countAny(e.statement,TAXONOMY.gtm_commercial.direct)>=2);
    if(direct)return statusObj("Strong","None","Direct commercial evidence covers customer engagement, demand generation/sales-facing workflows, and market/competitive translation.",direct,remembered,pack());
    const adjacent=ranked.find(e=>e.evidenceType==="work"&&(countAny(e.statement,TAXONOMY.gtm_commercial.direct)+countAny(e.statement,TAXONOMY.gtm_commercial.adjacent)>=2));
    if(adjacent)return statusObj("Partial","Wording gap","Strong commercial and customer-market evidence exists, but explicit product positioning/launch ownership is not fully stated.",adjacent,remembered,pack());
  }
  if(remembered?.negative)return statusObj("Gap","Capability gap","Remembered from a previous check: "+remembered.statement,remembered,remembered,{ranked:ranked.slice(0,4),confirmedGap:true});
  if(c.category==="crm_ownership"){
    if(remembered?.direct)return statusObj("Strong","None","Direct CRM product ownership was verified in a previous gap check.",remembered,remembered,pack());
    const direct=evidence.find(e=>e.company&&hasAny(e.statement,["crm","salesforce","veeva"])&&hasAny(e.statement,["own crm","owned crm","crm roadmap","crm backlog","accountable for crm","crm product owner","product owner for crm"]));
    if(direct)return statusObj("Strong","None","Direct CRM ownership and roadmap/backlog evidence is explicit.",direct,remembered,pack());
    if(hasInSameRole(evidence,["crm","salesforce"],["own product","portfolio strategy","roadmap","backlog","product owner"]))return statusObj("Adjacent","Resume gap","You own products in the same role and work with Salesforce CRM, but ownership of the CRM platform itself is not established.",best,remembered,pack());
    if(hasAny(all,["salesforce crm","crm integration","crm"]))return statusObj("Adjacent","Adjacent experience","CRM integration experience exists, but product ownership of the CRM ecosystem is not verified.",best,remembered,pack());
    return statusObj("Gap","Capability gap","No verified evidence shows ownership of a CRM product or platform roadmap.",best,remembered,pack());
  }
  if(c.category==="crm_field"){
    const veeva=hasAny(all,["veeva crm"]),medical=hasAny(all,["medical affairs","medical field"]),commercialField=hasAny(all,["commercial field","field engagement","field processes"]);
    if(remembered?.direct)return statusObj("Strong","None","Direct CRM/field-process experience was verified previously.",remembered,remembered,pack());
    if(veeva&&(medical||commercialField))return statusObj("Strong","None","Direct Veeva CRM and relevant field-process experience is verified.",best,remembered,pack());
    if(veeva||medical||commercialField)return statusObj("Partial","Resume gap","Direct experience covers part of the field-CRM requirement, but not the full Veeva + Commercial/Medical context.",best,remembered,pack());
    if(hasAny(all,["salesforce crm","account planning","lead-to-cash","omnichannel","customer engagement","commercial analytics"]))return statusObj("Adjacent","Adjacent experience","Salesforce/commercial workflow experience is transferable, but Veeva CRM and direct Commercial/Medical field-process experience are not established.",best,remembered,pack());
    return statusObj("Gap","Capability gap","No verified life-sciences CRM field-process experience is currently established.",best,remembered,pack());
  }
  if(c.category==="crm_modernization"){
    if(remembered?.direct)return statusObj("Strong","None","Direct CRM modernization experience was verified previously.",remembered,remembered,pack());
    const modern=hasAny(all,["crm modernization","crm ecosystem","platform evolution","next-generation crm"]),integr=hasAny(all,["salesforce crm","data integration","apis","api","erp"]),omni=hasAny(all,["omnichannel","digital engagement","customer engagement"]);
    if(modern&&integr)return statusObj("Strong","None","Direct CRM modernization and integration evidence is verified.",best,remembered,pack());
    if(integr&&omni)return statusObj("Partial","Wording gap","Strong CRM/data-integration and omnichannel evidence exists, but explicit CRM-modernization/platform-evolution ownership is not established.",best,remembered,pack());
    if(integr)return statusObj("Adjacent","Adjacent experience","CRM/data-integration experience exists, but modernization and omnichannel ecosystem ownership are not yet explicit.",best,remembered,pack());
    return statusObj("Gap","Capability gap","No verified CRM modernization or ecosystem-integration evidence is currently available.",best,remembered,pack());
  }
  if(c.category==="crm_ops"){
    if(remembered?.direct)return statusObj("Strong","None","Platform-operations/vendor scope was verified previously.",remembered,remembered,pack());
    const delivery=hasAny(all,["backlog","user stories","acceptance criteria","release planning","uat","go-live","release readiness"]),vendor=hasAny(all,["vendor","external partners","contractor"]),ops=hasAny(all,["platform operations","platform administration","managed services","issue resolution"]);
    if(delivery&&vendor&&ops)return statusObj("Strong","None","Delivery, platform operations, and vendor-management evidence are all explicit.",best,remembered,pack());
    if(delivery&&vendor)return statusObj("Partial","Resume gap","Product delivery and vendor/partner leadership are strong; CRM platform operations, managed services, or issue-resolution ownership still need clarification.",best,remembered,pack());
    if(delivery||vendor)return statusObj("Adjacent","Adjacent experience","Some delivery/partner evidence exists, but the operating scope of the CRM platform is not established.",best,remembered,pack());
    return statusObj("Gap","Capability gap","No verified product-delivery or platform-operations evidence is currently available.",best,remembered,pack());
  }
  if(c.category==="crm_governance"){
    const govTerms=["governance","privacy","gdpr","pii","compliance","data quality"],adoptTerms=["adoption","usage","training","change management"],valueTerms=["value realization","business impact","commercial impact","kpi","success criteria","value measurement"];
    const gov=hasAny(all,govTerms),adopt=hasAny(all,adoptTerms),value=hasAny(all,valueTerms),support=ranked.find(e=>e.evidenceType==="work"&&hasAny(e.statement,govTerms))||best;
    if((gov&&adopt)||(gov&&value))return statusObj("Strong","None","Governance/privacy plus adoption or measurable-value evidence is explicit.",support,remembered,pack());
    if(gov||adopt||value)return statusObj("Partial","Wording gap","Relevant governance, adoption, or value evidence exists, but the complete life-sciences CRM operating context is not explicit.",support,remembered,pack());
    return statusObj("Gap","Capability gap","No verified governance/adoption/value evidence is currently available.",best,remembered,pack());
  }
  if(c.category==="interoperability"){
    const direct=hasAny(all,TAXONOMY.interoperability.direct),api=hasAny(all,TAXONOMY.interoperability.adjacent),apiWork=ranked.find(e=>e.evidenceType==="work"&&hasAny(e.statement,TAXONOMY.interoperability.adjacent))||best;
    if(remembered?.direct||direct){const directWork=ranked.find(e=>e.evidenceType==="work"&&hasAny(e.statement,TAXONOMY.interoperability.direct));return statusObj("Strong","None","Direct healthcare interoperability evidence is verified.",remembered||directWork||best,remembered,pack())}
    if(api)return statusObj("Adjacent","Adjacent experience","API/data-integration evidence exists, but EHR/EMR/HL7/FHIR or healthcare data-exchange experience is not verified.",apiWork,remembered,pack());
    return statusObj("Gap","Capability gap","No verified healthcare interoperability evidence is currently available.",best,remembered,pack());
  }
  if(c.category==="healthcare_domain"){
    const direct=hasAny(all,TAXONOMY.healthcare_domain.direct),adj=hasAny(all,TAXONOMY.healthcare_domain.adjacent);
    if(remembered?.direct||direct)return statusObj("Strong","None","Direct healthcare/medical-technology domain evidence is verified.",remembered||best,remembered,pack());
    if(adj)return statusObj("Adjacent","Adjacent experience","Strong life-science/biomedical experience exists, but direct medical-device/digital-health product experience is not verified.",best,remembered,pack());
  }
  if(c.category==="regulated"){
    if(remembered?.direct)return statusObj("Strong","None","Direct Quality/Regulatory/Clinical collaboration was verified previously.",remembered,remembered,pack());
    const exact=countAny(all,["quality","regulatory affairs","clinical affairs"]),adj=countAny(all,["r&d","engineering","compliance","governance","privacy","release readiness","go/no-go"]);
    if(exact>=2)return statusObj("Strong","None","Direct Quality/Regulatory/Clinical collaboration is verified.",best,remembered,pack());
    if(exact===1||adj>0)return statusObj("Partial","Resume gap","Related regulated-development collaboration exists, but the exact functions or scope need clarification.",best,remembered,pack());
    return statusObj("Gap","Capability gap","No verified Quality/Regulatory/Clinical collaboration is currently available.",best,remembered,pack());
  }
  const valBest=best?.sourceType==="validation"&&best.category===c.category?best:null;
  if(valBest?.direct)return statusObj("Strong","None","Direct verified evidence supports this requirement.",valBest,valBest,pack());
  const bestWork=ranked.find(e=>["work","validation"].includes(e.evidenceType||(e.sourceType==="validation"?"validation":"work"))&&e._score>=.66);
  if(bestWork)return statusObj("Strong","None","Direct verified work evidence supports this requirement.",bestWork,remembered,pack());
  if(best){
    const t=best.evidenceType||(best.sourceType==="validation"?"validation":"work");
    if(best._score>=.44)return statusObj("Partial","Wording gap",t==="capability"||t==="summary"?"The resume names this capability, but stronger work-example evidence is needed.":"Relevant experience exists, but the resume does not fully express the required scope.",best,remembered,pack());
    if(best._score>=.23)return statusObj("Adjacent","Adjacent experience","Transferable evidence exists, but the exact context or scope is not verified.",best,remembered,pack())
  }
  return statusObj("Gap","Capability gap","No verified evidence currently establishes this requirement.",best,remembered,pack());
}

function yearsFromPeriod(period=""){
  const m=String(period).match(/\b(19|20)\d{2}\b/g);if(!m?.length)return 0;const start=Number(m[0]),end=/present|current/i.test(period)?new Date().getFullYear():Number(m[1]||m[0]);return Math.max(0,end-start);
}
function explicitProductYears(evidence=[]){
  const seen=new Map();for(const e of evidence){if(e.usable===false||e.evidenceType!=="work")continue;const role=e.role||"";if(!/product\s+(?:owner|manager)|director\s+of\s+product|head\s+of\s+product/i.test(role))continue;const key=[e.company,role,e.period].join("|");seen.set(key,Math.max(seen.get(key)||0,yearsFromPeriod(e.period)))}return [...seen.values()].reduce((a,b)=>a+b,0);
}
function gateStatus(gates,profileFacts={},evidence=[]){
  return gates.map(g=>{
    if(g.category==="product_tenure"){
      const answer=profileFacts.productYears||"",verified=evidence.find(e=>e.sourceType==="validation"&&e.category==="product_tenure"&&!e.negative),explicit=explicitProductYears(evidence),req=g.requiredYears||10;
      if(answer==="10plus"||verified?.direct)return {...g,status:"clear",reason:`Profile confirms ${req}+ years of genuine product-management work, including leadership scope.`};
      if(answer==="under10")return {...g,status:"missing",reason:`The role requires ${req}+ years of product-management experience, and the profile confirms less than that.`};
      if(explicit>=req)return {...g,status:"clear",reason:`Resume titles explicitly establish approximately ${Math.round(explicit)} years of product-management experience.`};
      return {...g,status:"uncertain",reason:`The resume explicitly shows about ${Math.round(explicit)} years under Product Owner/Product Manager titles. Earlier product-management-equivalent work may count, but Pursuit will not assume it.`};
    }
    if(g.category==="sponsorship"){
      const noSponsor=/not available|no sponsorship|cannot sponsor/i.test(g.requirement),auth=profileFacts.workAuth||"";let status="uncertain",reason="Work authorization is not specified.";
      if(noSponsor&&auth==="sponsorship"){status="missing";reason="The role says sponsorship is unavailable, but the profile says sponsorship is required."}else if(noSponsor&&["authorized","citizen","permanent"].includes(auth)){status="clear";reason="Profile indicates U.S. work authorization without sponsorship."}return {...g,status,reason};
    }
    if(g.category==="travel"){const t=profileFacts.travel||"";return {...g,status:t==="yes"?"clear":t==="no"?"missing":"uncertain",reason:t==="yes"?"Profile confirms travel flexibility.":t==="no"?"Profile says travel is not possible.":"Travel flexibility is not specified."}}
    if(g.category==="education"){const all=evidence.filter(e=>e.usable!==false&&e.evidenceType==="education").map(e=>norm(e.statement)).join(" "),degree=/\b(phd|ph\.d|master|m\.s|bachelor|b\.s)\b/i.test(all);return {...g,status:degree?"clear":"uncertain",reason:degree?"Degree evidence is present in the Education section.":"Degree evidence was not confidently parsed from the resume."}}
    return {...g,status:"uncertain",reason:"Requires confirmation."};
  });
}

function weightedFit(criteria,matches){const val={Strong:1,Partial:.68,Adjacent:.38,Gap:0};let n=0,d=0;criteria.forEach((c,i)=>{const w=c.tier===1?1.65:1;d+=w;n+=(val[matches[i].status]||0)*w});return d?n/d:.2}
function alignmentLabel(level){return ["Weak","Limited","Strong","Excellent"][clamp(level,0,3)]}
function alignmentReason(kind,criteria,matches,arch){
  const rows=criteria.map((c,i)=>({c,m:matches[i]})),tier1=rows.filter(x=>x.c.tier===1),weak=tier1.filter(x=>x.m.status==="Gap"),adj=tier1.filter(x=>["Adjacent","Partial"].includes(x.m.status));
  if(kind==="recruiter"){
    if(weak.length)return `A defining requirement is not supported: ${weak[0].c.label}.`;
    if(adj.length>=2)return `The background is relevant, but ${adj.map(x=>x.c.label).slice(0,2).join(" and ")} are not direct enough on the current evidence.`;
    if(adj.length)return `Most core requirements translate, but ${adj[0].c.label} still needs stronger proof.`;
    return "The resume directly supports the role's defining qualifications and should read cleanly in an initial screen.";
  }
  if(weak.length)return `A hiring manager is likely to see a material gap in ${weak[0].c.label}.`;
  if(arch==="crm_product_owner"){
    const own=rows.find(x=>x.c.category==="crm_ownership"),field=rows.find(x=>x.c.category==="crm_field");
    if(own&&own.m.status!=="Strong")return "Your products connect to CRM, but direct accountability for the CRM ecosystem itself is not established. That is central to this role.";
    if(field&&["Adjacent","Gap"].includes(field.m.status))return "CRM product ownership may translate, but direct life-sciences field-CRM/Veeva context remains a material uncertainty.";
  }
  if(adj.length)return `Comparable problems are proven, but ${adj[0].c.label} remains materially adjacent.`;
  return "The evidence shows comparable ownership, operating scope, and outcomes on the role's core problems.";
}
function alignments(criteria,matches,gates,arch){
  const rows=criteria.map((c,i)=>({c,m:matches[i]})),tier1=rows.filter(x=>x.c.tier===1),hard=gates.some(g=>g.status==="missing"),fit=weightedFit(criteria,matches);
  const gaps=tier1.filter(x=>x.m.status==="Gap").length,nonStrong=tier1.filter(x=>x.m.status!=="Strong").length,partials=tier1.filter(x=>x.m.status==="Partial").length,adj=tier1.filter(x=>x.m.status==="Adjacent").length;
  let r=2,m=2;
  if(hard||gaps)r=0;else if(nonStrong>=2)r=1;else if(nonStrong===1)r=fit>.72?2:1;else if(fit>.91)r=3;
  if(hard||gaps)m=0;else if(arch==="crm_product_owner"&&rows.find(x=>x.c.category==="crm_ownership")?.m.status!=="Strong")m=rows.find(x=>x.c.category==="crm_ownership")?.m.status==="Partial"?1:0;else if(adj||partials>=2)m=1;else if(nonStrong===1)m=1;else if(fit>.9)m=3;
  return {recruiter:{label:alignmentLabel(r),level:r,reason:alignmentReason("recruiter",criteria,matches,arch)},manager:{label:alignmentLabel(m),level:m,reason:alignmentReason("manager",criteria,matches,arch)},fit};
}
function scores(criteria,matches,gates=[],arch="general",evidence=[]){
  const fit=weightedFit(criteria,matches);
  const explicit=criteria.reduce((n,c,i)=>n+({Strong:1,Partial:.72,Adjacent:.38,Gap:.05}[matches[i].status]||0)*(c.tier===1?1.4:1),0)/
    criteria.reduce((n,c)=>n+(c.tier===1?1.4:1),0);
  // ATS is strictly resume-to-JD explicitness. Eligibility/tenure gates influence recommendation and confidence, not ATS.
  const ats=clamp(Math.round(30+explicit*66),8,96),a=alignments(criteria,matches,gates,arch);
  return {ats,fit:a.fit,recruiterAlignment:a.recruiter,managerAlignment:a.manager};
}
function confidence(criteria,matches,evidence=[],gates=[]){
  const tierUnknown=criteria.map((c,i)=>({c,m:matches[i]})).filter(x=>x.c.tier===1&&["Resume gap","Adjacent experience"].includes(x.m.gapType)&&!x.m.confirmedGap).length;
  if(evidence.length<8)return {label:"Low",reason:"The source profile is too thin for a confident judgment."};
  if(gates.some(g=>g.critical&&g.status==="uncertain"))return {label:"Medium",reason:"A mandatory experience gate still needs confirmation before the recommendation can be treated as final."};
  if(tierUnknown>=2)return {label:"Medium",reason:"A few decision-changing questions remain unresolved."};
  if(tierUnknown===1)return {label:"Medium",reason:"One defining requirement still depends on clarification."};
  return {label:"High",reason:"The decision is well supported by explicit or previously verified evidence."};
}
const REC_RANK={"PASS":0,"LOW PROBABILITY":1,"SELECTIVE APPLY":2,"APPLY":3,"HIGH PRIORITY - APPLY":4};
function recommendation(criteria,matches,gates,s,arch="general"){
  if(gates.some(g=>g.status==="missing"))return {label:"PASS",tone:"red",reason:"A stated eligibility requirement appears not to be met.",aside:"Next. Your time is worth more."};
  const criticalUnknown=gates.find(g=>g.critical&&g.status==="uncertain");
  const rows=criteria.map((c,i)=>({c,m:matches[i]})),tier1=rows.filter(x=>x.c.tier===1),gaps=tier1.filter(x=>x.m.status==="Gap").length,nonStrong=tier1.filter(x=>x.m.status!=="Strong").length;
  if(arch==="crm_product_owner"){
    const own=rows.find(x=>x.c.category==="crm_ownership")?.m.status,field=rows.find(x=>x.c.category==="crm_field")?.m.status;
    if(["Gap","Adjacent"].includes(own)&&["Gap","Adjacent"].includes(field))return {label:"LOW PROBABILITY",tone:"red",reason:"The resume shows CRM-connected product experience, but not enough direct evidence of CRM-platform ownership or life-sciences field-CRM depth for this specific Product Owner role.",aside:"Save the tailoring time unless those gaps are hiding in your experience."};
  }
  if(gaps)return {label:"LOW PROBABILITY",tone:"red",reason:"At least one defining hiring gate is unsupported on the current evidence.",aside:"Don't spend 45 minutes polishing around a core gap."};
  if(criticalUnknown&&nonStrong){
    const pending=tier1.filter(x=>x.m.status!=="Strong"&&!gateCriterionOverlap(criticalUnknown,x.c)).map(x=>x.c.label);
    if(pending.length)return {label:"SELECTIVE APPLY",tone:"amber",reason:`The underlying fit is credible, but the decision is not final until Pursuit resolves ${criticalUnknown.label} and ${pending[0]}.`,aside:"Two answers could materially change where this lands."};
    return {label:"SELECTIVE APPLY",tone:"amber",reason:`The underlying fit is credible, but the decision is not final until Pursuit resolves ${criticalUnknown.label}.`,aside:"One answer could materially change where this lands."};
  }
  if(criticalUnknown)return {label:"SELECTIVE APPLY",tone:"amber",reason:`The core experience fit is credible, but a mandatory qualification still needs confirmation: ${criticalUnknown.label}.`,aside:"Answer the gate before spending serious tailoring time."};
  if(nonStrong>=2||s.managerAlignment.label==="Limited"||s.recruiterAlignment.label==="Limited")return {label:"SELECTIVE APPLY",tone:"amber",reason:"There is a credible bridge to the role, but at least one defining requirement is still adjacent or under-proven.",aside:"Interesting, but don't fall in love yet."};
  if(s.recruiterAlignment.label==="Weak"||s.managerAlignment.label==="Weak")return {label:"LOW PROBABILITY",tone:"red",reason:"The role's defining needs are not directly supported enough to justify a heavy tailoring investment.",aside:"Save the 45 minutes."};
  if(s.recruiterAlignment.label==="Excellent"&&s.managerAlignment.label==="Excellent")return {label:"HIGH PRIORITY - APPLY",tone:"green",reason:"Direct evidence covers the role's defining requirements with few meaningful gaps.",aside:"This one deserves your time."};
  return {label:"APPLY",tone:"green",reason:"The role is directly supported on its core requirements; remaining gaps are secondary and manageable.",aside:"Good fit. Worth a thoughtful application."};
}
function decisionChanging(criteria,matches,gates,s,arch){
  const base=recommendation(criteria,matches,gates,s,arch),out=[];
  criteria.forEach((c,i)=>{
    const m=matches[i];if(m.status==="Strong"||m.confirmedGap)return;
    const alt=matches.map((x,j)=>j===i?{...x,status:"Strong",gapType:"None"}:x),as=scores(criteria,alt,gates,arch,[]),ar=recommendation(criteria,alt,gates,as,arch);
    const changes=(REC_RANK[ar.label]||0)>(REC_RANK[base.label]||0);
    const changesOutput=c.tier===2&&m.gapType==="Resume gap";
    if(changes||c.tier===1||changesOutput)out.push({index:i,label:c.label,from:m.status,to:"Strong",changesDecision:changes,changesOutput,tier:c.tier,reason:m.reason});
  });
  return out.sort((a,b)=>(b.changesDecision-a.changesDecision)||(a.tier-b.tier)||(b.changesOutput-a.changesOutput)).slice(0,3);
}
function hiringProblem(criteria,arch,meta={}){
  if(arch==="crm_product_owner")return "This is not a generic product-owner role. They are hiring someone to own a life-sciences CRM ecosystem, modernize it, and keep Commercial/Medical workflows compliant, reliable, and adopted.";
  if(arch==="healthcare_digital_product")return "The job is really about owning a healthcare digital product, navigating regulated cross-functional delivery, and translating interoperability/customer needs into a roadmap that ships.";
  if(arch==="enterprise_ai_product_director"){const portfolio=meta.portfolioName||"the product portfolio";return `Lead ${portfolio}: set product and investment direction, scale enterprise products, turn AI into reliable production capabilities, and connect product execution to customers and commercial outcomes.`;}
  const x=criteria.slice(0,3).map(c=>c.label.toLowerCase());return x.length?`The JD is long. These are the problems that actually drive the decision: ${x.join("; ")}.`:"";
}
function primaryRisk(criteria,matches,gates){
  const bad=criteria.map((c,i)=>({c,m:matches[i]})).filter(x=>x.c.tier===1&&x.m.status!=="Strong")
    .concat(criteria.map((c,i)=>({c,m:matches[i]})).filter(x=>x.c.tier!==1&&x.m.status!=="Strong"));
  if(bad[0])return `What is holding this back: ${bad[0].c.label}. ${conciseHumanReason(bad[0].m.reason,1,240)}`;
  const ug=gates.find(g=>g.status!=="clear");if(ug)return`One practical check remains: ${ug.label}. ${conciseHumanReason(ug.reason,1,220)}`;
  return"No material gap is showing up in the role's defining requirements.";
}
function validationQuestions(category){return VALIDATION[category]||[{id:"role",label:"What was your role?",options:["Accountable owner","Lead","Contributor","Advisor"]},{id:"scope",label:"What was the scope?",options:["Enterprise","Portfolio","Product","Program","Feature"]}]}
function hasNone(vals){return vals.some(x=>/^none$|^no$/i.test(x))}
function directFromAnswers(category,answers){
  const flat=Object.values(answers).flat();if(hasNone(flat)&&flat.every(x=>/^none$|^no$/i.test(x)))return false;
  if(category==="crm_ownership")return flat.some(x=>/^Owned CRM roadmap\/backlog$|^Shared CRM product ownership$/i.test(x));
  if(category==="crm_field")return flat.some(x=>/Veeva CRM/i.test(x))&&flat.some(x=>/Commercial field|Medical Affairs field/i.test(x));
  if(category==="crm_ops")return flat.some(x=>/Platform operations|Managed services|Vendor\/SaaS|Issue resolution/i.test(x));
  if(category==="crm_governance")return flat.some(x=>/Privacy|Compliance|Quality|Legal/i.test(x));
  if(category==="interoperability")return flat.some(x=>/EHR|HL7|FHIR|Healthcare data exchange|Healthcare IT integration/i.test(x));
  if(category==="healthcare_domain")return flat.some(x=>/Medical devices|Digital health|Healthcare software|Diagnostics/i.test(x));
  if(category==="regulated")return flat.some(x=>/Quality|Regulatory|Clinical Affairs/i.test(x));
  if(category==="people_management")return flat.some(x=>/Direct reports/i.test(x));
  if(category==="financial")return flat.some(x=>/^P&L$|^Budget$|^Pricing$/i.test(x));
  if(category==="ai_production")return flat.some(x=>/Production and used by real users|Production but limited rollout/i.test(x));
  if(category==="product_tenure")return flat.some(x=>/^10\+ years$/i.test(x));
  return true;
}
function actionVerbForRole(flat){if(flat.some(x=>/Accountable owner|Direct accountability|Owned CRM/i.test(x)))return"Owned";if(flat.some(x=>/Product lead|Lead|Shared CRM product ownership/i.test(x)))return"Led";if(flat.some(x=>/Advisor/i.test(x)))return"Advised";return"Partnered"}
function polishedEvidence(category,answers={},freeText=""){
  const flat=Object.values(answers).flat(),verb=actionVerbForRole(flat),text=norm(freeText);let clause="";
  if(category==="ai_production"){
    const prod=flat.find(x=>/Production and used by real users|Production but limited rollout|Pilot \/ evaluation only|Exploration \/ prototype/.test(x))||"AI product work",scopes=flat.filter(x=>/Use-case|Requirements|evaluation|Human-in-the-loop|Launch|Adoption/.test(x));
    clause=`${verb} AI product delivery through ${scopes.length?scopes.join(", ").toLowerCase():"product definition, validation, and value measurement"}; ${prod.toLowerCase()}`;
  }else if(category==="product_tenure"){
    const yrs=flat.find(x=>/years/.test(x))||"product-management experience";clause=`Confirmed ${yrs} of genuine product-management work across formal and equivalent product roles`;
  }else if(category==="crm_ownership"){
    const rel=flat.find(x=>/Owned CRM|Shared CRM|Owned products|Contributor/.test(x))||"CRM product work",platform=flat.find(x=>/Veeva CRM|Salesforce CRM|Other enterprise CRM/.test(x))||"CRM";
    if(/Owned CRM roadmap/.test(rel))clause=`Owned ${platform} product roadmap, backlog, prioritization, and release decisions`;
    else if(/Shared CRM/.test(rel))clause=`Shared product ownership for ${platform}, shaping roadmap, backlog, prioritization, and release decisions`;
    else if(/Owned products that integrated/.test(rel))clause=`Owned digital products integrated with ${platform}, translating business priorities into roadmap and delivery decisions`;
    else clause=`Contributed to ${platform} product delivery and prioritization`;
    const proc=flat.filter(x=>/Commercial field|Medical Affairs field|Omnichannel|Sales operations/.test(x));if(proc.length)clause+=` supporting ${proc.join(", ").toLowerCase()} workflows`;
  }else if(category==="crm_field"){
    const platforms=flat.filter(x=>/Veeva CRM|Salesforce CRM|Other enterprise CRM/.test(x)),proc=flat.filter(x=>/Commercial field|Medical Affairs field|Omnichannel|Sales operations/.test(x));
    clause=`${verb} CRM product work${platforms.length?` across ${platforms.join(" and ")}`:""}${proc.length?`, supporting ${proc.join(", ").toLowerCase()} workflows`:""}`;
  }else if(category==="crm_ops"){
    const scopes=flat.filter(x=>/Backlog|Platform operations|Managed services|Vendor\/SaaS|Issue resolution/.test(x));clause=`${verb} ${scopes.length?scopes.join(", ").toLowerCase():"CRM delivery and operating activities"}`;
  }else if(category==="crm_governance"){
    const funcs=flat.filter(x=>/Legal|Privacy|Compliance|Quality|Commercial|Medical Affairs/.test(x)),scopes=flat.filter(x=>/Governance|Privacy\/compliance|Data quality|Adoption|Release readiness/.test(x));clause=`${verb} with ${funcs.length?funcs.join(", "):"cross-functional"} stakeholders on ${scopes.length?scopes.join(", ").toLowerCase():"CRM governance and delivery controls"}`;
  }else if(category==="regulated"){
    const funcs=flat.filter(x=>/Quality|Regulatory|Clinical Affairs|R&D|Engineering/.test(x)),group=funcs.length?funcs.join(", "):"regulated-product";
    clause=flat.some(x=>/Advisor/i.test(x))?`Advised ${group} partners`:flat.some(x=>/Contributor/i.test(x))?`Partnered with ${group} teams`:`Led cross-functional collaboration with ${group} teams`;
    if(/release readiness|release|go no go|go\/no-go|go-no-go/.test(text))clause+=" through release-readiness and go/no-go activities";else if(/requirement/.test(text))clause+=" to align product requirements and release decisions";else clause+=" across product-development and governance activities";
  }else if(category==="interoperability"){
    const sys=flat.filter(x=>/EHR|HL7|FHIR|Healthcare data exchange|Healthcare IT integration|API integration/.test(x));clause=`${verb} on ${sys.length?sys.join(", "):"digital integration"} capabilities${/requirement/.test(text)?" by defining product requirements and integration workflows":""}`;
  }else if(category==="healthcare_domain"){
    const d=flat.find(x=>/Medical devices|Digital health|Healthcare software|Diagnostics|Life sciences/.test(x))||"healthcare technology";clause=`Applied product-management experience in ${d.toLowerCase()} environments`;
  }else if(category==="commercialization"){
    const scopes=flat.filter(x=>/Customer discovery|Go-to-market|Product launch|Commercialization|Product positioning|Adoption/.test(x));clause=`${verb} ${scopes.length?scopes.join(", ").toLowerCase():"commercialization and adoption"} activities`;
  }else if(category==="product_strategy"){
    const scope=flat.find(x=>/Portfolio|Product|Program|Feature/.test(x))||"product";clause=`${verb} ${scope.toLowerCase()} strategy, prioritization, and roadmap decisions`;
  }else clause=`${verb} ${freeText?freeText.trim():"the relevant capability"}`;
  if(freeText){if(/\bglobal\b/.test(text)&&!/global/.test(norm(clause)))clause+=" at global scale";if(/\bmetric|measur|adoption|value/.test(text)&&!/measur|adoption|value/.test(norm(clause)))clause+=" with measurable adoption and value outcomes"}
  clause=clause.replace(/\bstakeholders\s+stakeholders\b/gi,"stakeholders").replace(/\s+/g," ").replace(/\s+,/g,",").trim();if(!/[.!?]$/.test(clause))clause+=".";return sentenceCase(clause);
}
function scoreEvidenceToCriteria(text,criteria){let best=0;for(const c of criteria){const tax=TAXONOMY[c.category]||{direct:[],adjacent:[]};let s=similarity(text,c.requirement)*.38+countAny(text,tax.direct)*.14+countAny(text,tax.adjacent)*.045;if(classifyText(text).category===c.category)s+=.2;if(c.tier===1)s*=1.12;best=Math.max(best,s)}return best}
function sanitizeBullet(text){return cleanLine(text).replace(/\bSELECTED IMPACT\b/gi,"").replace(/\s{2,}/g," ").trim()}
function improveBullet(text,criteria){let t=sanitizeBullet(text);if(!t)return"";if(/^Supported global commercial teams\b/i.test(t))t=t.replace(/^Supported global commercial teams/i,"Enabled global commercial teams");return sentenceCase(t)}
function roleRelevant(role,criteria){return role.bullets.concat(role.impact).reduce((m,b)=>Math.max(m,scoreEvidenceToCriteria(b,criteria)),0)}
function crmCapabilities(profile,evidence){
  const all=evidence.map(e=>norm(e.statement)).join(" "),caps=[];const add=(cond,label)=>{if(cond&&!caps.includes(label))caps.push(label)};
  add(hasAny(all,["product strategy","roadmap","portfolio strategy"]),"Product Strategy & Roadmaps");
  add(hasAny(all,["salesforce crm"]),"Salesforce CRM Integration");
  add(hasAny(all,["backlog","user stories","acceptance criteria","release planning","uat"]),"Product Ownership & Backlog Management");
  add(hasAny(all,["api","apis","data integration","erp"]),"CRM/Data Integration & APIs");
  add(hasAny(all,["account planning","lead-to-cash","workflow","commercial"]),"Commercial Workflow Design");
  add(hasAny(all,["omnichannel","customer engagement","digital engagement"]),"Omnichannel & Customer Engagement");
  add(hasAny(all,["release planning","release readiness","user training","adoption"]),"Release Planning & Adoption");
  add(hasAny(all,["data quality","governance"]),"Data Quality & Governance");
  add(hasAny(all,["privacy","gdpr","pii","compliance"]),"Privacy & Compliance");
  add(hasAny(all,["vendor","external partners","contractor"]),"Vendor & Partner Management");
  add(hasAny(all,["product kpi","performance measurement","value realization","usage measurement","commercial impact"]),"Product KPIs & Value Realization");
  add(hasAny(all,["global","regional rollout"]),"Global Product Scaling");
  add(hasAny(all,["veeva crm"]),"Veeva CRM");return caps.slice(0,10);
}
function cleanStrengthLabel(text=""){
  let s=cleanLine(text)
    .replace(/^(?:direct|proven|demonstrated)\s+/i,"")
    .replace(/^(?:own|owns|lead|leads|deliver|delivers|drive|drives|build|builds|manage|manages|translate|translates|align|aligns|define|defines|execute|executes|run|runs|oversee|oversees|embed|embeds)\s+/i,"")
    .replace(/\s{2,}/g," ").trim();
  return s?s.charAt(0).toLowerCase()+s.slice(1):"";
}
function humanList(items=[]){
  const a=items.filter(Boolean);
  if(a.length<=1)return a[0]||"";
  if(a.length===2)return `${a[0]} and ${a[1]}`;
  return `${a.slice(0,-1).join(", ")}, and ${a[a.length-1]}`;
}
function directStrengths(criteria=[],matches=[]){
  const out=[];
  for(let i=0;i<matches.length;i++){
    for(const d of matches[i]?.dimensions||[]){
      if(d.state!=="direct")continue;
      const x=cleanStrengthLabel(d.label||"");
      if(x&&!out.some(y=>norm(y)===norm(x)))out.push(x);
      if(out.length>=4)return out;
    }
  }
  return out;
}
function summaryFor(profile,criteria,matches,evidence,arch){
  const headline=(profile.identity.headline||"Digital Product Leader").replace(/[•|].*$/,"").trim();
  let s=`${headline} with experience translating business priorities into product strategy, roadmaps, delivery, adoption, and measurable value.`;
  const strengths=directStrengths(criteria,matches).slice(0,3);
  if(strengths.length)s+=` Role-relevant strengths include ${humanList(strengths)}.`;
  return s;
}
function capabilityRecommendations(profile,criteria,matches,evidence,arch){if(arch==="crm_product_owner")return crmCapabilities(profile,evidence);const phrases=[];for(const line of profile.capabilityLines||[])for(const p of line.split(/•|\s{2,}/).map(cleanLine).filter(x=>x.length>3))phrases.push(p);return unique(phrases).map(text=>({text,score:scoreEvidenceToCriteria(text,criteria)})).sort((a,b)=>b.score-a.score).filter(x=>x.score>.12).slice(0,10).map(x=>x.text)}
function outputScore(text,criteria,arch){
  let s=scoreEvidenceToCriteria(text,criteria),n=norm(text);
  if(arch==="crm_product_owner"){
    if(hasAny(n,["salesforce crm","crm","roadmap","backlog","user stories","acceptance criteria","release planning","uat","vendor","external partners","governance","privacy","data quality","adoption","usage measurement"]))s+=.28;
    if(hasAny(n,["ai product management","machine learning","genai","mcp"])&&!hasAny(n,["crm","salesforce"]))s-=.42;
    if(hasAny(n,["covid-19","vaccine development"]))s-=.2;
  }
  return s;
}
function tailoredOutput(profile,criteria,matches,evidence,arch){
  const summary=summaryFor(profile,criteria,matches,evidence,arch),
        capabilities=capabilityRecommendations(profile,criteria,matches,evidence,arch),
        validation=evidence.filter(e=>e.sourceType==="validation"&&!e.negative),
        used=new Set(),roleSections=[];
  const rankedRoles=(profile.roles||[]).map(r=>({r,score:roleRelevant(r,criteria)})).sort((a,b)=>b.score-a.score);
  for(const {r:role} of rankedRoles.slice(0,3)){
    const scored=role.bullets.map(b=>({text:sanitizeBullet(b),score:outputScore(b,criteria,arch)})).filter(x=>x.text).sort((a,b)=>b.score-a.score);
    const bullets=scored.slice(0,Math.min(5,scored.length)).map(x=>improveBullet(x.text,criteria)).filter(Boolean);
    for(const ev of validation){
      const companyMatch=ev.company&&norm(role.companyLine).includes(norm(ev.company)),
            relevant=criteria.some(c=>c.factKey===ev.category||c.category===ev.category);
      if(companyMatch&&relevant&&!bullets.includes(ev.statement)){bullets.push(ev.statement);used.add(ev.id)}
    }
    const impact=role.impact.map(b=>({text:sanitizeBullet(b),score:outputScore(b,criteria,arch)+(metricFrom(b)?.22:0)})).filter(x=>x.text).sort((a,b)=>b.score-a.score);
    roleSections.push({title:role.title,companyLine:role.companyLine,bullets:bullets.slice(0,6),impactSelected:impact.slice(0,3).map(x=>x.text)});
  }
  const additions=validation.filter(e=>!used.has(e.id)).map(e=>({statement:e.statement,company:e.company,role:e.role,period:e.period,category:e.category}));
  return {summary,capabilities,roleSections,additions};
}
function fullTextOutput(out){
  const lines=[];
  lines.push("PROFESSIONAL SUMMARY",out.summary,"","CORE CAPABILITIES",out.capabilities.join(" • "));
  for(const r of out.roleSections){
    lines.push("",r.title||"",r.companyLine||"");
    r.bullets.forEach(b=>lines.push("• "+b));
    if((r.impactSelected||[]).length){
      lines.push("SELECTED IMPACT");
      r.impactSelected.forEach(b=>lines.push("• "+b));
    }
  }
  return lines.join("\n").replace(/\n{3,}/g,"\n\n");
}
function analyze(jd,profile,evidence,profileFacts={},url=""){
  const arch=detectArchetype(jd),meta=metaFromJD(jd,url),criteria=topFiveRequirements(jd),matches=criteria.map(c=>matchCriterion(c,evidence)),gates=gateStatus(gateRequirements(jd),profileFacts,evidence),s=scores(criteria,matches,gates,arch,evidence),rec=recommendation(criteria,matches,gates,s,arch),conf=confidence(criteria,matches,evidence,gates),out=tailoredOutput(profile,criteria,matches,evidence,arch),clarifications=decisionChanging(criteria,matches,gates,s,arch);
  return {archetype:arch,meta,criteria,matches,gates,scores:s,recommendation:rec,evidenceConfidence:conf,hiringProblem:hiringProblem(criteria,arch,meta),primaryRisk:primaryRisk(criteria,matches,gates),whatWouldChange:decisionMoverItems(criteria,matches,gates,clarifications),clarifications,output:out,fullText:fullTextOutput(out),createdAt:new Date().toISOString()};
}


function periodCalendarSpan(period=""){
  const years=[...String(period).matchAll(/\b(19|20)\d{2}\b/g)].map(m=>Number(m[0]));
  if(!years.length)return null;
  const start=years[0],present=/present|current/i.test(period),end=present?new Date().getFullYear():(years[1]||start);
  if(end<start)return null;
  return {start,end,span:Math.max(0,end-start),present};
}
function deterministicProfileFacts(profile={},evidence=[]){
  const explicitProductRoles=(profile.roles||[]).filter(r=>/\b(product owner|product manager|product lead|head of product|director[^|]*product|product director)\b/i.test(r.title||"")).map(r=>{
    const p=periodCalendarSpan(r.dates||"");
    return {title:r.title||"",company:r.company||"",period:r.dates||"",start:p?.start||null,end:p?.end||null,calendarYearSpan:p?.span??null};
  });
  const spans=explicitProductRoles.filter(r=>Number.isFinite(r.calendarYearSpan));
  // Resume roles are normally sequential. Sum explicit titled product spans, but never invent months.
  const explicitProductCalendarYears=spans.reduce((n,r)=>n+r.calendarYearSpan,0);
  const explicitProductPeriodText=explicitProductRoles.map(r=>`${r.title}${r.company?` at ${r.company}`:""} (${r.period||"dates not stated"})`).join("; ");
  return {
    explicitProductCalendarYears,
    explicitProductRoles,
    explicitProductPeriodText,
    tenureMethod:"Calendar-year spans from resume role dates; months are not invented."
  };
}
function roleOnlyThesis(text=""){
  const parts=String(text).split(/(?<=[.!?])\s+/).map(cleanLine).filter(Boolean),out=[];
  for(const s of parts){
    if(/\b(the candidate|candidate brings|candidate has|your resume|the resume|your experience|candidate experience|fit\b|tenure\b|evidence\b|you have|you bring)\b/i.test(s))break;
    out.push(s);
  }
  return cleanLine(out.join(" ")) || cleanLine(parts[0]||"");
}
function gateCriterionOverlap(g,c){
  const gt=norm(`${g?.label||""} ${g?.requirement||""} ${g?.category||""}`),ct=norm(`${c?.label||""} ${c?.requirement||""} ${c?.category||""}`);
  if(/product management years|product management experience|product tenure/.test(gt) &&
     (/product tenure|product management experience/.test(ct)||(/\byears?\b/.test(ct)&&/\bproduct\b/.test(ct))))return true;
  if(/work authorization|sponsorship/.test(gt)&&/work authorization|sponsorship/.test(ct))return true;
  if(/\btravel\b/.test(gt)&&/\btravel\b/.test(ct))return true;
  if(/\beducation\b|\bdegree\b/.test(gt)&&/\beducation\b|\bdegree\b/.test(ct))return true;
  return false;
}
function deterministicTenureReason(facts={},requiredText=""){
  const yrs=facts.explicitProductCalendarYears||0,roles=facts.explicitProductRoles||[];
  if(!roles.length)return `The resume does not show an explicitly titled Product Owner/Product Manager role. Earlier work may qualify, but Pursuit will not count it toward this tenure requirement without confirmation.`;
  const roleText=roles.map(r=>`${r.title} (${r.period})`).join("; ");
  return `The resume explicitly shows ${roleText}, a ${yrs} calendar-year span from stated year ranges. Earlier differently titled work may qualify, but Pursuit will not count it toward ${cleanLine(requiredText)||"the stated tenure requirement"} until you confirm it was genuine product-management work.`;
}


function stripInternalEvidenceIds(text=""){
  return cleanLine(
    String(text||"")
      .replace(/\[(?:e|ev|evidence)[-_a-z0-9]+\]/gi,"")
      .replace(/\b(?:e|ev|evidence)[-_][a-z0-9]{6,}\b/gi,"")
      .replace(/\s+([,.;:!?])/g,"$1")
      .replace(/\s{2,}/g," ")
  );
}
function conciseHumanReason(text="", maxSentences=2, maxChars=360){
  const cleaned=stripInternalEvidenceIds(text);
  if(!cleaned)return"";
  const sentences=cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
  let out=sentences.slice(0,maxSentences).join(" ").trim();
  if(out.length>maxChars){
    out=out.slice(0,maxChars).replace(/\s+\S*$/,"").trim();
    if(out&&!/[.!?]$/.test(out))out+="…";
  }
  return out;
}


function semanticGapType(status){
  if(status==="Strong")return"None";
  if(status==="Partial")return"Resume gap";
  if(status==="Adjacent")return"Adjacent experience";
  return"Capability gap";
}
function modelEvidenceRecord(id,evidenceMap,{allowCredentials=false}={}){
  const e=evidenceMap.get(id);if(!e||e.usable===false)return null;
  if(!allowCredentials&&["education","certification"].includes(e.evidenceType))return null;
  return e;
}
function resolveSemanticCategory(driver={}){
  const raw=cleanLine(driver.memoryKey||"").toLowerCase().replace(/[\s-]+/g,"_");
  if(TAXONOMY[raw])return raw;
  const cls=classifyText(`${driver.label||""} ${driver.requirement||""} ${driver.whyItMatters||""}`);
  return cls.score>0?cls.category:"general";
}

function dimensionSourceWeight(e={}){
  if(!e||e.negative)return 0;
  const t=e.evidenceType||(e.sourceType==="validation"?"validation":"work");
  if(t==="validation")return e.direct===false?.72:1;
  if(t==="work")return 1;
  if(t==="capability")return .74;
  if(t==="scientific_background")return .68;
  if(t==="summary")return .56;
  if(t==="education"||t==="certification")return .86;
  return .58;
}
function dimensionRelationWeight(relation=""){
  return relation==="direct"?1:relation==="transferable"?.46:0;
}
function semanticDimensions(driver={}){
  const dims=Array.isArray(driver.dimensions)?driver.dimensions.filter(Boolean):[];
  if(dims.length)return dims.slice(0,4);
  return [{
    id:`${driver.id||"driver"}_dimension`,
    label:cleanLine(driver.label)||"Core requirement",
    kind:"capability",
    critical:true,
    requirement:cleanLine(driver.requirement),
    evidence:(driver.evidenceIds||[]).slice(0,3).map(id=>({id,relation:"transferable",basis:"Older analysis format; directness was not explicitly classified."}))
  }];
}
function dimensionJudgment(dim={},evidenceMap=new Map()){
  const rows=(dim.evidence||[]).map(x=>{
    const e=modelEvidenceRecord(x.id,evidenceMap,{allowCredentials:true});
    if(!e)return null;
    const relation=x.relation==="direct"?"direct":"transferable";
    const score=dimensionRelationWeight(relation)*dimensionSourceWeight(e);
    return {id:x.id,relation,basis:cleanLine(x.basis),score,evidence:e};
  }).filter(Boolean).sort((a,b)=>b.score-a.score);

  const best=rows[0]?.score||0;
  let state="missing";
  if(best>=.84)state="direct";
  else if(best>=.62)state="supported";
  else if(best>=.20)state="transferable";

  return {
    id:dim.id||"",label:cleanLine(dim.label)||"Required proof",kind:dim.kind||"other",
    critical:dim.critical!==false,requirement:cleanLine(dim.requirement),state,best,rows
  };
}
function semanticDriverJudgment(driver={},criterion={},evidenceMap=new Map()){
  const dimensions=semanticDimensions(driver).map(d=>dimensionJudgment(d,evidenceMap));
  const critical=dimensions.filter(d=>d.critical),core=critical.length?critical:dimensions;
  const allRows=dimensions.flatMap(d=>d.rows),hasAny=allRows.length>0;
  const stateScore={direct:1,supported:.72,transferable:.40,missing:0};

  let status="Gap",coreScore=0;
  if(hasAny&&core.length){
    coreScore=core.reduce((n,d)=>n+(stateScore[d.state]||0),0)/core.length;
    const directish=core.filter(d=>["direct","supported"].includes(d.state)).length;
    const missing=core.filter(d=>d.state==="missing").length;
    const transferable=core.filter(d=>d.state==="transferable").length;

    if(missing===0&&transferable===0&&coreScore>=.84){
      status="Strong";
    }else if(
      coreScore>=.67 &&
      directish>=Math.max(1,Math.ceil(core.length/2)) &&
      !(missing>0&&coreScore<.72)
    ){
      status="Partial";
    }else{
      status="Adjacent";
    }
  }

  const selectedIds=new Set(allRows.map(r=>r.id));
  const selected=[...selectedIds].map(id=>evidenceMap.get(id)).filter(Boolean);
  const negativeSelected=selected.some(e=>e.sourceType==="validation"&&e.negative===true);
  const positiveValidation=selected.some(e=>e.sourceType==="validation"&&e.negative!==true);
  const confirmedGap=negativeSelected&&!positiveValidation;
  if(confirmedGap)status="Gap";

  const weak=core.filter(d=>d.state!=="direct");
  let reason="";
  if(status==="Strong"){
    reason=`Direct evidence covers the driver's critical proof dimensions: ${core.map(d=>d.label.toLowerCase()).join("; ")}.`;
  }else if(status==="Partial"){
    const names=weak.map(d=>d.label.toLowerCase()).join("; ");
    reason=`Most of the critical proof is direct. ${names?`The weaker part is ${names}.`:"One supporting dimension is less explicit."}`;
  }else if(status==="Adjacent"){
    const directNames=core.filter(d=>d.state==="direct").map(d=>d.label.toLowerCase());
    const weakNames=core.filter(d=>["transferable","missing"].includes(d.state)).map(d=>d.label.toLowerCase());
    if(directNames.length)reason=`Some core proof is direct, but ${weakNames.slice(0,2).join("; ")||"material required context"} is not directly established.`;
    else if(weakNames.length)reason=`Relevant evidence exists, but ${weakNames.slice(0,2).join("; ")} is transferable or unproven rather than direct.`;
    else reason=`Relevant experience exists, but the role-specific proof is not direct enough.`;
  }else{
    reason=`A verified answer or the current evidence set does not establish the driver's critical proof.`;
  }

  return {status,reason,dimensions,confirmedGap,coreScore};
}
function atomicDimensionEvidence(judgment={}){
  const rows=judgment.dimensions.flatMap(d=>d.rows.map(r=>({...r,dimensionLabel:d.label}))).sort((a,b)=>b.score-a.score);
  const out=[],seen=new Set();
  for(const r of rows){
    const e=r.evidence,text=cleanLine(e.statement||"");if(!text)continue;
    const clipped=text.length>225?text.slice(0,222).replace(/\s+\S*$/,"")+"…":text;
    const key=norm(clipped);if(seen.has(key))continue;seen.add(key);
    out.push({id:e.id,text:clipped,company:e.company||"",role:e.role||"",period:e.period||"",sourceType:e.evidenceType||e.sourceType||"",relation:r.relation,dimension:r.dimensionLabel,basis:r.basis});
    if(out.length>=3)break;
  }
  return out;
}
function requiredYearsFrom(text=""){
  const s=cleanLine(text);
  const patterns=[
    /\b(\d{1,2})\s*\+\s*years?\b/i,
    /\b(?:minimum(?:\s+of)?|at\s+least|no\s+less\s+than)\s+(\d{1,2})\s*\+?\s*years?\b/i,
    /\b(\d{1,2})\s+years?['’]?\s+(?:of\s+)?experience\b/i,
    /\b(\d{1,2})\s+years?\s+of\s+experience\b/i
  ];
  for(const p of patterns){const m=s.match(p);if(m)return Number(m[1]);}
  return null;
}
function uniqueRoleYearSpan(valid=[]){
  const seen=new Set();let total=0;
  for(const e of valid){
    const key=`${e.company||""}|${e.role||""}|${e.period||""}`;if(seen.has(key))continue;seen.add(key);
    const p=periodCalendarSpan(e.period||"");if(p)total+=p.span;
  }
  return total;
}

function normalizeFactKey(x=""){
  return cleanLine(x).toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"");
}
function atomicDurationExperience(requirement="",years=0){
  let s=cleanLine(requirement);
  if(!s)return "";
  s=s
    .replace(/^\s*(?:candidate|applicant|individual|person)\s+(?:must|should|needs?\s+to)\s+(?:have|bring|possess)\s+/i,"")
    .replace(/^\s*(?:required|requirement|minimum qualification)\s*[:\-–—]?\s*/i,"")
    .replace(/^\s*(?:minimum\s+of\s+|minimum\s+|at\s+least\s+|no\s+less\s+than\s+)/i,"");
  if(years){
    s=s
      .replace(new RegExp(`^\\s*${years}\\s*\\+?\\s*years?(?:['’]?\\s+of\\s+experience|['’]?\\s+experience|\\s+of\\s+experience|\\s+experience)?\\s*`, "i"),"")
      .replace(/^\s*(?:of|in|as|with)\s+/i,m=>m.trim()+" ");
  }
  s=s.replace(/^\s*[-–—,:;]+\s*/,"").replace(/\s{2,}/g," ").trim();
  s=s
    .replace(/\s+and\s+(?=(?:presenting|communicating|influencing|articulating|demonstrating|mentoring|coaching|evangelizing)\b)[\s\S]*$/i,"")
    .replace(/,\s*with\s+(?=(?:an?\s+)?(?:expert|expert-level|deep|strong|demonstrated|proven)\b)[\s\S]*$/i,"")
    .replace(/,\s*and\s+(?=(?:the\s+)?(?:ability|experience|expertise)\b)[\s\S]*$/i,"")
    .replace(/\s{2,}/g," ")
    .replace(/[,:;–—-]+\s*$/,"")
    .trim();
  return s;
}
function durationGateLabel(requirement="",years=0){
  const req=cleanLine(requirement);
  if(!years)return req||"Experience duration requirement";
  const rest=atomicDurationExperience(req,years);
  if(!rest)return `${years}+ years of relevant experience`;
  const join=/^(of|in|as|with|owning|leading|managing|building|delivering|running|overseeing|developing|driving)\b/i.test(rest)?" ":" of ";
  return `${years}+ years${join}${rest}`.replace(/\s{2,}/g," ").trim();
}
function clarificationDimension(c={},m={}){
  const mq=c.clarification||{};
  const id=cleanLine(mq.dimensionId||"");
  if(!id)return null;
  return (m.dimensions||[]).find(d=>d.id===id)||null;
}
function actionableClarification(c={},m={}){
  const mq=c.clarification||{};
  if(mq.needed!==true||!cleanLine(mq.question))return null;
  const d=clarificationDimension(c,m);
  // RC2.2 invariant: never ask about a dimension already directly proven.
  if(!d||d.state==="direct")return null;
  return {
    dimensionId:d.id,
    dimensionLabel:d.label,
    factKey:normalizeFactKey(mq.factKey||`${c.factKey||"driver"}_${d.id}`),
    question:cleanLine(mq.question),
    options:Array.isArray(mq.options)?mq.options.slice(0,8):[],
    multiSelect:mq.multiSelect===true,
    freeTextPrompt:cleanLine(mq.freeTextPrompt||""),
    changesDecision:mq.changesDecision===true
  };
}
function deterministicSemanticGate(g,evidenceMap,profileFacts={},detFacts={}){
  const valid=(g.evidenceIds||[]).map(id=>modelEvidenceRecord(id,evidenceMap,{allowCredentials:true})).filter(Boolean),
        req=cleanLine(g.requirement||""),needed=requiredYearsFrom(req),
        gateType=g.gateType||(g.gateKey==="work_authorization"?"work_authorization":g.gateKey==="travel"?"travel":g.gateKey==="product_management_years"||g.gateKey==="domain_years"?"experience_duration":g.gateKey==="education"?"education":"other"),
        factKey=normalizeFactKey(g.factKey||g.gateKey||g.id||"gate"),
        saved=profileFacts?.gates?.[factKey]||"",
        category=gateType==="work_authorization"?"sponsorship":gateType;
  let status="uncertain",reason="";

  if(gateType==="work_authorization"){
    if(profileFacts.workAuth==="authorized"){status="clear";reason="Work authorization is already confirmed in your profile."}
    else if(profileFacts.workAuth==="sponsorship"){status="missing";reason="Your profile indicates that sponsorship is required."}
    else reason="Work authorization has not been confirmed yet.";
  }else if(gateType==="travel"){
    if(profileFacts.travel==="yes"){status="clear";reason="Your profile confirms that you can travel as required."}
    else if(profileFacts.travel==="no"){status="missing";reason="Your profile indicates that you cannot meet the stated travel requirement."}
    else reason="The stated travel requirement has not been confirmed yet.";
  }else if(gateType==="experience_duration"){
    const meet=String(saved).match(/^meets:(\d+)$/),under=String(saved).match(/^under:(\d+)$/);
    if(meet&&needed&&Number(meet[1])>=needed)status="clear";
    else if(under&&needed&&Number(under[1])===needed)status="missing";
    else{
      const productLike=/product manager|product management|product owner|product lead/i.test(req);
      const explicitYears=productLike?(detFacts.explicitProductCalendarYears||0):uniqueRoleYearSpan(valid);
      if(needed&&explicitYears>=needed)status="clear";
    }
    if(status==="clear")reason=`Pursuit can verify that the stated ${needed||""}+ year experience requirement is met.`;
    else if(status==="missing")reason=`Your saved answer indicates that the stated ${needed||""}+ year experience requirement is not met.`;
    else if(/product manager|product management|product owner|product lead/i.test(req))reason=deterministicTenureReason(detFacts,req);
    else reason=`The JD states ${needed||"a minimum number of"} years for this experience; the selected evidence does not establish that duration cleanly enough to auto-clear it.`;
  }else if(gateType==="education"){
    status=valid.some(e=>e.evidenceType==="education")?"clear":(saved==="yes"?"clear":saved==="no"?"missing":"uncertain");
    reason=status==="clear"?"The required education is explicitly present in the source profile.":status==="missing"?"Your saved answer indicates that this education requirement is not met.":"The education requirement is not yet matched to an explicit credential.";
  }else if(gateType==="certification"){
    status=valid.some(e=>e.evidenceType==="certification")?"clear":(saved==="yes"?"clear":saved==="no"?"missing":"uncertain");
    reason=status==="clear"?"The required certification is explicitly present in the source profile.":status==="missing"?"Your saved answer indicates that this certification requirement is not met.":"The required certification has not been confirmed yet.";
  }else{
    if(saved==="yes"){status="clear";reason="You previously confirmed this requirement."}
    else if(saved==="no"){status="missing";reason="You previously confirmed that this requirement is not met."}
    else if(valid.some(e=>e.sourceType==="validation"&&e.direct===true&&!e.negative)){status="clear";reason="Previously verified evidence directly supports this mandatory requirement."}
    else reason="This mandatory requirement still needs confirmation.";
  }

  const atomicReq=gateType==="experience_duration"?atomicDurationExperience(req,needed):req;
  const displayLabel=gateType==="experience_duration"?durationGateLabel(req,needed):(cleanLine(g.label)||req||"Mandatory qualification");
  return {id:g.id||`gate_${factKey}`,factKey,relatedDriverId:g.relatedDriverId||"",gateType,category,label:displayLabel,requirement:atomicReq||req,critical:g.critical!==false,status,reason,evidenceIds:valid.map(e=>e.id),requiredYears:needed};
}
function semanticFacts(identity={}){
  const facts=[],add=x=>{x=cleanLine(x);if(x&&!facts.includes(x))facts.push(x)};
  add(identity.industry);add(identity.level);add(identity.function);
  if(identity.yearsRequired)add(identity.yearsRequired);
  (identity.technologies||[]).slice(0,3).forEach(add);
  add(identity.workModel);
  if(identity.primaryUsers)add(identity.primaryUsers);
  return facts.slice(0,7);
}


function moverOverlap(a={},b={}){
  const factA=norm(a.factKey||""),factB=norm(b.factKey||"");
  if(factA&&factB&&factA===factB)return true;
  const A=norm(`${a.label||""} ${a.requirement||""}`),B=norm(`${b.label||""} ${b.requirement||""}`);
  if(!A||!B)return false;
  const tok=s=>new Set(s.split(/\s+/).filter(w=>w.length>3&&!STOP.has(w)));
  const ta=tok(A),tb=tok(B),inter=[...ta].filter(x=>tb.has(x)).length,uni=new Set([...ta,...tb]).size;
  return !!(uni&&inter/uni>=.68);
}
function decisionMoverItems(criteria=[],matches=[],gates=[],clarifications=[]){
  const items=[],seenFacts=new Set(),seenLabels=new Set();
  function add(item){
    const fk=norm(item.factKey||""),lk=norm(item.label||"");
    if(!item.label)return;
    if(fk&&seenFacts.has(fk))return;
    if(lk&&seenLabels.has(lk))return;
    if(fk)seenFacts.add(fk);if(lk)seenLabels.add(lk);
    items.push(item);
  }

  for(const g of gates.filter(g=>g.critical&&g.status==="uncertain")){
    add({
      label:g.label,requirement:g.requirement||"",category:g.category||"",factKey:g.factKey||"",
      relatedDriverId:g.relatedDriverId||"",
      kind:"gate",status:"uncertain",reason:conciseHumanReason(g.reason,1,220),
      changesDecision:true,tier:0
    });
  }

  for(const q of clarifications||[]){
    const c=criteria[q.index]||{};
    add({
      label:q.label||q.question||c.label,requirement:q.question||c.requirement||"",category:c.category||"",factKey:q.factKey||c.factKey||"",
      question:q.question||"",dimensionId:q.dimensionId||"",
      kind:"clarification",status:q.from||"Partial",reason:conciseHumanReason(q.reason,1,220),
      changesDecision:q.changesDecision===true,tier:q.tier||2,index:q.index
    });
  }

  return items.sort((a,b)=>{
    const pa=a.kind==="gate"?0:(a.changesDecision?1:2),pb=b.kind==="gate"?0:(b.changesDecision?1:2);
    return pa-pb||(a.tier||9)-(b.tier||9);
  }).slice(0,4);
}

function knownLimitations(criteria=[],matches=[],gates=[],clarifications=[]){
  const items=[],activeClarificationIndexes=new Set((clarifications||[]).map(x=>x.index));
  const unresolved=gates.filter(g=>g.critical&&g.status==="uncertain");

  criteria.forEach((c,i)=>{
    const m=matches[i];if(!m||m.status==="Strong"||activeClarificationIndexes.has(i))return;
    const material=c.tier===1||m.status==="Gap"||m.status==="Adjacent";
    if(!material)return;
    if(unresolved.some(g=>g.factKey&&c.factKey&&norm(g.factKey)===norm(c.factKey)))return;

    items.push({
      label:c.label,requirement:c.requirement||"",category:c.category||"",factKey:c.factKey||"",
      kind:"known_gap",status:m.status,reason:conciseHumanReason(m.reason,1,240),tier:c.tier||2
    });
  });

  return items.sort((a,b)=>(a.tier||9)-(b.tier||9)||({Gap:0,Adjacent:1,Partial:2}[a.status]??3)-({Gap:0,Adjacent:1,Partial:2}[b.status]??3)).slice(0,4);
}

function capabilityOnlyLabel(text=""){
  let s=cleanLine(text);
  s=s.replace(/\(([^)]*)\)/g,(all,inner)=>{
    let x=inner
      .replace(/\b(?:at least\s+)?\d{1,2}\s*\+?\s*years?(?:\s+of)?\b/gi,"")
      .replace(/\btenure\b|\bduration\b/gi,"")
      .replace(/^[\s,;:–—-]+|[\s,;:–—-]+$/g,"")
      .replace(/\s*,\s*/g,", ")
      .replace(/\s{2,}/g," ");
    return x?` (${x})`:"";
  });
  s=s
    .replace(/\b(?:at least\s+)?\d{1,2}\s*\+?\s*years?(?:\s+of)?\b/gi,"")
    .replace(/\btenure\b|\bduration\b/gi,"")
    .replace(/\s{2,}/g," ")
    .replace(/\s+([,;:])/g,"$1")
    .replace(/([:;,-])\s*([:;,-])/g,"$1")
    .replace(/\s*[–—-]\s*$/,"")
    .trim();
  return s||cleanLine(text);
}
function capabilityOnlyRequirement(text="",hasSeparateTenureGate=false){
  let s=cleanLine(text);
  if(!hasSeparateTenureGate)return s;
  // Remove only the duration phrase; keep the substantive capability requirement.
  s=s
    .replace(/\b(?:at least\s+)?\d{1,2}\s*\+?\s*years?(?:['’]?\s+experience)?(?:\s+(?:as|in|of))?\s*/gi,"")
    .replace(/\btarget\s+/gi,"")
    .replace(/\s{2,}/g," ")
    .replace(/^\s*[-–—,:;]+\s*/,"")
    .trim();
  return s||cleanLine(text);
}
function materialMoverSummary(rec,movers=[]){
  if(!rec||rec.label!=="SELECTIVE APPLY")return rec;
  const material=movers.filter(x=>x.kind==="gate"||x.changesDecision);
  if(!material.length)return rec;
  const n=material.length;
  const aside=n===1?"One answer could materially change where this lands.":`${n} answers could materially change where this lands.`;
  let reason=rec.reason;
  if(n===1)reason=`The underlying fit is credible, but the decision is not final until Pursuit resolves ${material[0].label}.`;
  else if(n===2)reason=`The underlying fit is credible, but the decision is not final until Pursuit resolves ${material[0].label} and ${material[1].label}.`;
  else reason=`The underlying fit is credible, but ${n} material checks still need resolution before the recommendation can be treated as final.`;
  return {...rec,reason,aside};
}


function fromSemanticModel(jd,profile,evidence,profileFacts={},url="",modelData={},detFacts=deterministicProfileFacts(profile,evidence)){
  const evidenceMap=new Map((evidence||[]).map(e=>[e.id,e])),identity=modelData.identity||{};
  const gates=(modelData.hardGates||[]).map(g=>deterministicSemanticGate(g,evidenceMap,profileFacts,detFacts));

  const criteria=(modelData.drivers||[]).slice(0,5).map((d,i)=>{
    const category=resolveSemanticCategory(d),
          factKey=cleanLine(d.factKey||d.memoryKey||`driver_${i+1}`).toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,""),
          matchingDurationGate=gates.find(g=>g.gateType==="experience_duration"&&(g.relatedDriverId===d.id||(g.factKey&&g.factKey===factKey))),
          durationInDriver=matchingDurationGate&&/\b(?:\d{1,2}\s*\+?\s*years?|tenure|duration)\b/i.test(`${d.label||""} ${d.requirement||""}`);
    return {
      id:d.id||`semantic_${i+1}`,factKey,
      label:durationInDriver?capabilityOnlyLabel(d.label):(cleanLine(d.label)||`Decision driver ${i+1}`),
      category,tier:d.tier==="hiring_gate"?1:2,
      requirement:durationInDriver?capabilityOnlyRequirement(d.requirement,true):cleanLine(d.requirement),
      why:cleanLine(d.whyItMatters),sourceBasis:cleanLine(d.sourceBasis),semantic:true,
      dimensions:semanticDimensions(d),clarification:d.clarification||null,tenureSeparated:!!durationInDriver
    };
  });

  const matches=(modelData.drivers||[]).slice(0,5).map((d,i)=>{
    const c=criteria[i],judged=semanticDriverJudgment(d,c,evidenceMap);
    const selected=judged.dimensions.flatMap(x=>x.rows.map(r=>r.evidence));
    return {
      status:judged.status,score:({Strong:.94,Partial:.68,Adjacent:.38,Gap:.04})[judged.status],
      reason:judged.reason,gapType:semanticGapType(judged.status),
      remembered:selected.some(e=>e.sourceType==="validation"&&!e.negative),
      confirmedGap:judged.confirmedGap,
      dimensions:judged.dimensions.map(x=>({id:x.id,label:x.label,kind:x.kind,critical:x.critical,requirement:x.requirement,state:x.state})),
      supportingEvidence:atomicDimensionEvidence(judged)
    };
  });

  criteria.forEach((c,i)=>{
    const q=actionableClarification(c,matches[i]);
    if(q)c.clarification={...c.clarification,...q,needed:true};
    else if(c.clarification)c.clarification={...c.clarification,needed:false};
  });

  const arch="semantic_model",s=scores(criteria,matches,gates,arch,evidence),
        baseRec=recommendation(criteria,matches,gates,s,arch),conf=confidence(criteria,matches,evidence,gates),
        out=tailoredOutput(profile,criteria,matches,evidence,"general"),
        unresolvedGates=gates.filter(g=>g.critical&&g.status==="uncertain"),
        clarifications=criteria.map((c,i)=>{
          const m=matches[i],q=actionableClarification(c,m);
          if(!q||m.status==="Strong"||m.confirmedGap)return null;
          if(unresolvedGates.some(g=>g.factKey&&q.factKey&&norm(g.factKey)===norm(q.factKey)))return null;
          return {
            index:i,
            label:q.dimensionLabel,
            question:q.question,
            dimensionId:q.dimensionId,
            factKey:q.factKey,
            from:m.status,to:"Strong",
            changesDecision:q.changesDecision===true,
            changesOutput:true,tier:c.tier,
            reason:`This check targets the under-proven dimension: ${q.dimensionLabel.toLowerCase()}.`
          };
        }).filter(Boolean).slice(0,3),
        movers=decisionMoverItems(criteria,matches,gates,clarifications),
        limitations=knownLimitations(criteria,matches,gates,clarifications),
        rec=materialMoverSummary(baseRec,movers);

  const meta={company:cleanLine(identity.company),title:cleanLine(identity.title),location:cleanLine(identity.location),facts:semanticFacts(identity),portfolioName:cleanLine(identity.portfolio),identityConfidence:identity.confidence||"medium",identitySource:cleanLine(identity.sourceBasis)};

  return {
    archetype:arch,meta,identityDetail:identity,criteria,matches,gates,scores:s,recommendation:rec,evidenceConfidence:conf,
    hiringProblem:conciseHumanReason(roleOnlyThesis(modelData.roleThesis),2,520)||"Pursuit identified the role's defining accountability and hiring decision.",
    primaryRisk:primaryRisk(criteria,matches,gates),whatWouldChange:movers,knownLimitations:limitations,clarifications,
    protectedClaims:(modelData.protectedClaims||[]).filter(x=>x&&x.claim).map(x=>({claim:stripInternalEvidenceIds(x.claim),reason:conciseHumanReason(x.reason,2,300),severity:x.severity||"important"})),
    output:out,fullText:fullTextOutput(out),createdAt:new Date().toISOString(),analysisMode:"universal_evidence_contract_v2_2"
  };
}
function evidenceRecordFromValidation(category,criterion,answers,freeText,rolePeriod,wording,negative=false){
  const parts=String(rolePeriod||"").split(",").map(x=>x.trim()).filter(Boolean);let company=parts[0]||"",role="",period="";for(const part of parts.slice(1)){if(/\b(19|20)\d{2}\b/.test(part))period=part;else role=role?role+", "+part:part}
  const memoryCategory=criterion?.factKey||category||"general";
  return {id:uid(),evidenceType:"validation",category:memoryCategory,capability:TAXONOMY[category]?.label||criterion.label,statement:wording,rawValidation:freeText||"",answers,company,role,period,scope:scopeFrom(wording),authority:authorityFrom(wording),metric:metricFrom(wording),direct:negative?false:directFromAnswers(category,answers),negative:!!negative,usable:true,sourceType:"validation",sourceLabel:negative?"Remembered honest gap":"Remembered from gap check",createdAt:new Date().toISOString()};
}
function negativeWording(category,answers={}){const flat=Object.values(answers).flat();if(category==="ai_production")return"Confirmed: AI work is currently pilot, evaluation, or exploration rather than sustained production deployment.";if(category==="product_tenure")return"Confirmed: less than 10 years of genuine product-management experience is currently established.";if(category==="crm_ownership")return"Confirmed: no direct CRM product-roadmap/backlog ownership is currently established.";if(category==="crm_field")return"Confirmed: no direct Veeva CRM or Commercial/Medical field-process experience is currently established.";if(category==="crm_ops")return"Confirmed: no direct CRM platform-operations or managed-services ownership is currently established.";if(category==="interoperability")return"Confirmed: no direct EHR/EMR, HL7/FHIR, or healthcare data-exchange experience is currently established.";if(category==="regulated")return"Confirmed: no direct Quality, Regulatory, or Clinical Affairs collaboration is currently established.";return`Confirmed: no direct evidence currently establishes ${TAXONOMY[category]?.label||"this requirement"}.`}
return {TAXONOMY,norm,tokens,hasPhrase,parseResume,evidenceFromProfile,metaFromJD,requirementCandidates,topFiveRequirements,gateRequirements,matchCriterion,gateStatus,scores,recommendation,hiringProblem,primaryRisk,validationQuestions,polishedEvidence,negativeWording,analyze,fromSemanticModel,deterministicProfileFacts,resolveSemanticCategory,semanticDimensions,dimensionJudgment,semanticDriverJudgment,atomicDimensionEvidence,normalizeFactKey,atomicDurationExperience,durationGateLabel,clarificationDimension,actionableClarification,moverOverlap,decisionMoverItems,knownLimitations,capabilityOnlyLabel,capabilityOnlyRequirement,materialMoverSummary,evidenceRecordFromValidation,fullTextOutput,classifyText,classifyTextExcept,detectArchetype,evidenceEligible};
});
