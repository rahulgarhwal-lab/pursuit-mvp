(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.PursuitEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const STOP=new Set('the and for with from this that you your our they their them are was were will would should could have has had into within across through about role position work working strong ability including using used use more than any all not but how what when where who why can may required preferred experience years team teams company candidate responsibilities tasks excellent good related support supports supporting responsible responsibilities highly desirable advantage member department growing environment'.split(' '));
  const norm=(s='')=>String(s).toLowerCase().replace(/[’‘]/g,"'").replace(/[–—]/g,'-').replace(/[^a-z0-9+#%$€£./&\-\s]/g,' ').replace(/\s+/g,' ').trim();
  const words=(s='')=>norm(s).split(' ').filter(w=>w.length>2&&!STOP.has(w));
  const uniq=a=>[...new Set(a.filter(Boolean))];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const uid=(p='id')=>`${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const countHits=(text,terms=[])=>{const n=norm(text);return terms.reduce((s,t)=>s+(n.includes(norm(t))?1:0),0)};
  const tokenSim=(a,b)=>{const A=new Set(words(a)),B=new Set(words(b));if(!A.size||!B.size)return 0;let n=0;for(const x of A)if(B.has(x))n++;return n/Math.sqrt(A.size*B.size)};

  const TAXONOMY={
    product_strategy:{label:'Product strategy, roadmaps & lifecycle ownership',group:'product_direction',direct:['product strategy','product vision','roadmap','roadmaps','product requirements','requirements','product lifecycle','business case','value proposition','backlog','user stories','product management'],adjacent:['prioritization','portfolio planning','release planning','product governance'],risk:'core'},
    portfolio:{label:'Portfolio management & prioritization',group:'product_direction',direct:['product portfolio','portfolio management','portfolio strategy','portfolio planning','investment priorities','capacity trade-offs','prioritize product initiatives'],adjacent:['roadmap decisions','business value','technical feasibility'],risk:'core'},
    product_delivery:{label:'Product development, Agile delivery & release execution',group:'delivery',direct:['agile','scrum','sprint','backlog','user stories','acceptance criteria','release planning','launch readiness','uat','go-live','software development','product development'],adjacent:['delivery','requirements','roadmap','technical feasibility'],risk:'core'},
    customer_commercial:{label:'Customer insight, commercialization & go-to-market',group:'customer_commercial',direct:['voice of the customer','customer insights','customer feedback','customer research','user research','market research','market needs','industry trends','go-to-market','go to market','product launch','commercialization','product positioning','sales and marketing','customer engagement','key account','customer satisfaction'],adjacent:['customer analytics','market intelligence','competitive intelligence','adoption','training','campaign','sales enablement','commercial'],risk:'core'},
    adoption_value:{label:'Adoption, success metrics & value realization',group:'adoption',direct:['product adoption','customer satisfaction','success metrics','business performance','continuous improvement','value realization','usage measurement','kpi','key performance indicator'],adjacent:['training','rollout','user growth','performance measurement'],risk:'core'},
    healthcare_domain:{label:'Healthcare / medical technology domain depth',group:'domain',direct:['medical device','medical devices','digital health','healthcare software','healthcare it','diagnostics','diagnostic','health technology','medtech'],adjacent:['life sciences','life science','biomedical','biotechnology','scientific','pharma'],risk:'core'},
    interoperability:{label:'Healthcare interoperability & digital integration',group:'interoperability',direct:['healthcare interoperability','ehr','emr','hl7','fhir','healthcare data exchange','healthcare it integration','digital health platform'],adjacent:['api','apis','data integration','data exchange','integration workflows','cloud integration','systems integration'],risk:'core'},
    regulated:{label:'Regulated cross-functional product development',group:'regulated',direct:['regulatory affairs','clinical affairs','quality assurance','quality','regulatory','clinical','r&d','research and development'],adjacent:['engineering','compliance','privacy','governance','validation'],risk:'core'},
    data_ai:{label:'Data, analytics & AI product leadership',group:'data_ai',direct:['data product','analytics product','ai product','artificial intelligence','machine learning','genai','generative ai','data platform','data strategy','predictive analytics'],adjacent:['analytics','data science','automation','decision support'],risk:'core'},
    platforms_integration:{label:'Platforms, APIs & systems integration',group:'platforms',direct:['api','apis','platform integration','systems integration','data integration','cloud platform','integration capability','erp integration','crm integration'],adjacent:['salesforce','erp','crm','data exchange','cloud'],risk:'core'},
    leadership:{label:'Cross-functional leadership & stakeholder alignment',group:'leadership',direct:['cross-functional','cross functional','stakeholder management','matrix leadership','executive stakeholder','influence','leadership','stakeholder alignment'],adjacent:['collaborate','partner closely','alignment','facilitate'],risk:'core'},
    people_management:{label:'Direct people management',group:'people',direct:['direct reports','people manager','people management','manage a team','managed a team','hiring decisions','performance reviews'],adjacent:['matrix team','cross-functional team','led a team','lead team','contractor resources'],risk:'gate'},
    budget:{label:'Budget / P&L ownership',group:'budget',direct:['budget ownership','budget management','p&l','profit and loss','managed budget','financial ownership'],adjacent:['business case','value realization','savings','revenue impact','commercial impact'],risk:'gate'},
    vendor:{label:'Vendor & partner management',group:'vendor',direct:['vendor management','supplier management','contract negotiation','external partner','outsourcing','vendor evaluation'],adjacent:['contractor','partner management','external partners'],risk:'support'},
    subscriptions:{label:'Digital services & recurring revenue growth',group:'revenue_model',direct:['subscription','subscriptions','recurring revenue','digital services','service offering','saas'],adjacent:['digital commerce','commercial growth'],risk:'support'},
    governance:{label:'Governance, privacy, security & compliance',group:'governance',direct:['security','secure','compliant','privacy','gdpr','pii','hipaa','soc 2','data governance','product governance'],adjacent:['access controls','validation','quality'],risk:'support'},
    crm:{label:'CRM & commercial workflow platforms',group:'crm',direct:['salesforce','crm','customer relationship management'],adjacent:['lead-to-cash','opportunity','account planning','forecasting'],risk:'support'},
    operations:{label:'Operational / supply-chain product intelligence',group:'operations',direct:['supply chain','operations','operational','inventory','backorder','order management','demand planning','forecast accuracy'],adjacent:['erp','commercial visibility'],risk:'support'},
    research_science:{label:'Scientific / R&D context',group:'science',direct:['r&d','research and development','scientific','biomedical','biotechnology','clinical research','drug discovery','molecular biology'],adjacent:['life sciences','pharma'],risk:'support'},
    ux:{label:'User experience, discovery & design',group:'ux',direct:['user experience','ux','ui','prototyping','usability testing','user interviews','product discovery'],adjacent:['workflow observation','customer feedback'],risk:'support'},
    transformation:{label:'Change management & digital transformation',group:'change',direct:['change management','digital transformation','organizational change','adoption strategy'],adjacent:['training','rollout','regional rollout'],risk:'support'},
    education:{label:'Education & credentials',group:'education',direct:['bachelor','master','mba','phd','degree','certification','biomedical engineering','computer science','healthcare informatics','life sciences'],adjacent:['capm','pmp','product management certification'],risk:'gate'},
    authorization:{label:'Work authorization / sponsorship',group:'authorization',direct:['visa sponsorship','work authorization','sponsorship','authorized to work'],adjacent:[],risk:'gate'},
    location_travel:{label:'Location, work model & travel',group:'logistics',direct:['location','hybrid','remote','on-site','onsite','travel','ability to travel'],adjacent:[],risk:'gate'}
  };

  const DANGER_RULES=[
    {id:'direct_reports',label:'Direct people management',trigger:/\b(direct reports?|managed\s+(?:a\s+)?\d+\s+(?:direct reports?|employees)|people manager)\b/i,source:/\b(direct reports?|people manager|people management)\b/i,message:'Matrix or cross-functional leadership cannot be rewritten as direct people management.'},
    {id:'budget',label:'Budget ownership',trigger:/\b(managed|owned|oversaw)\s+(?:a\s+)?[$€£]?\s?\d+[\d.,]*\s?(m|million|k|thousand)?\s*(budget|p&l)|budget ownership|p&l ownership/i,source:/\b(budget|p&l)\b/i,message:'Value delivered, revenue influenced, or savings cannot be rewritten as budget ownership.'},
    {id:'enterprise',label:'Enterprise scope',trigger:/\benterprise(-wide)?\b/i,source:/\benterprise(-wide)?\b/i,message:'Product, portfolio, or global scope cannot automatically become enterprise-wide ownership.'},
    {id:'production',label:'Production deployment',trigger:/\b(production deployment|deployed to production|productionized)\b/i,source:/\b(production deployment|deployed to production|productionized)\b/i,message:'Pilot or exploration work cannot be rewritten as production deployment.'},
    {id:'domain',label:'Exact domain',trigger:/\b(medical device product management|digital health product management|pharmaceutical commercialization)\b/i,source:/\b(medical device|digital health|pharmaceutical commercialization)\b/i,message:'Adjacent life-science experience cannot be rewritten as exact domain experience.'}
  ];

  function detectSection(line){
    const n=norm(line);
    const aliases=[
      ['professional summary','summary'],['selected impact snapshot','impact_snapshot'],['core capabilities','capabilities'],
      ['professional experience','experience'],['selected impact','selected_impact'],['scientific foundation & early career','early'],
      ['education & certifications','education'],['education','education'],['certifications','certifications']
    ];
    for(const [a,s] of aliases) if(n===a) return s;
    return null;
  }
  function isBullet(line){return /^[•\-*]/.test(String(line).trim())}
  function stripBullet(line){return String(line).trim().replace(/^[•\-*]\s*/,'')}
  function dateToken(line){return (String(line).match(/\b((?:19|20)\d{2})\s*[-–—]\s*(Present|Current|(?:19|20)\d{2})\b/i)||[])[0]||(String(line).match(/(?<=\|\s*)\b(?:19|20)\d{2}\b\s*$/i)||[])[0]||''}
  function looksCompany(line){return !isBullet(line) && !!dateToken(line) && (/[|]/.test(line)||/\b(inc\.?|llc|ltd|corp\.?|corporation|company|technologies|technology|scientific|pharma|university|institute|laboratories|labs?)\b/i.test(line))}
  function looksRole(line){const t=String(line).trim();return t.length<120&&!isBullet(t)&&!/\.$/.test(t)&&/\b(product owner|product manager|director|manager|specialist|scientist|intern|research|lead|consultant|analyst|engineer)\b/i.test(t)&&!looksCompany(t)}
  function mergeWrappedLines(text){
    const src=String(text).replace(/\f/g,'\n').replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean);const out=[];let bullet='';
    const flush=()=>{if(bullet){out.push('• '+bullet.trim());bullet=''}};
    for(const line of src){
      if(isBullet(line)){flush();bullet=stripBullet(line);continue}
      if(detectSection(line)||looksCompany(line)||looksRole(line)||/^Applied Research Experience$/i.test(line)){flush();out.push(line);continue}
      if(bullet){bullet+=' '+line;continue}
      out.push(line)
    }
    flush();return out;
  }
  function parseIdentity(lines){
    const head=lines.slice(0,20);const all=head.join(' | ');
    const name=head.find(l=>/^[A-Z][A-Z ,.'-]+(?:PhD|PHD|MBA|CAPM|PMP)?$/i.test(l)&&l.length<80&&!/LAB$/i.test(l))||head.find(l=>/\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/.test(l)&&l.length<70)||'';
    const nameIdx=head.indexOf(name),contactIdx=head.findIndex(l=>/@|linkedin\.com|\d{3}[ .-]\d{3}/i.test(l));
    const headline=head.slice(Math.max(0,nameIdx+1),contactIdx>=0?contactIdx:Math.min(head.length,nameIdx+5)).filter(l=>!/lab$/i.test(l)&&!/@|linkedin|\d{3}[ .-]\d{3}/i.test(l)).join(' ').replace(/\s+/g,' ').trim();
    return {name,email:(all.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)||[])[0]||'',phone:(all.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/)||[])[0]||'',linkedin:(all.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/i)||[])[0]||'',location:(all.match(/\b[A-Z][a-zA-Z .'-]+,\s*[A-Z]{2}\b/)||[])[0]||'',headline,portfolio:''};
  }
  function splitCompany(line){
    const dates=dateToken(line);let left=String(line).replace(dates,'').replace(/\|\s*$/,'').trim(),company=left,location='';
    const pipe=left.split('|').map(x=>x.trim());company=pipe[0]||left;if(pipe[1])location=pipe[1];
    if(!location){const p=company.split(',').map(x=>x.trim());if(p.length>=3&&/^[A-Z]{2}$/.test(p[p.length-1])){location=p.slice(-2).join(', ');company=p.slice(0,-2).join(', ')}}
    return {company,dates,location};
  }
  function splitSentences(s){return String(s).split(/(?<=[.!?])\s+(?=[A-Z])/).map(x=>x.trim()).filter(x=>x.length>20)}
  function parseResume(text,meta={}){
    const lines=mergeWrappedLines(text),identity=parseIdentity(lines),roles=[],misc={summary:[],capabilities:[],impact_snapshot:[],education:[],certifications:[],early:[]};
    let section='header',pendingRole='',current=null;
    const addRole=(company,title,dates,location='')=>{current={id:uid('role'),company,title,dates,location,kind:section==='early'?'early':'professional',bullets:[],impact:[],sourceLines:[]};roles.push(current);return current};
    for(const line of lines){
      const sec=detectSection(line);if(sec){section=sec;if(['summary','capabilities','impact_snapshot','education','certifications'].includes(sec))current=null;continue}
      if(section==='header')continue;
      if(['experience','selected_impact','early'].includes(section)){
        if(/^Applied Research Experience$/i.test(line)){pendingRole='';continue}
        if(isBullet(line)){
          if(!current) addRole(section==='early'?'Early Career':'Professional Experience',pendingRole,'');
          const b={id:uid('src'),text:stripBullet(line),sourceText:stripBullet(line),locked:true,sourceSection:section};
          if(section==='selected_impact') current.impact.push(b); else current.bullets.push(b);continue;
        }
        if(looksRole(line)){pendingRole=line;continue}
        if(looksCompany(line)){const c=splitCompany(line);const hadPending=!!pendingRole;addRole(c.company,pendingRole,c.dates,c.location);pendingRole='';if(section==='selected_impact'&&hadPending)section='experience';continue}
        if(false){
          if(!current) addRole(section==='early'?'Early Career':'Professional Experience',pendingRole,'');
          const b={id:uid('src'),text:stripBullet(line),sourceText:stripBullet(line),locked:true,sourceSection:section};
          if(section==='selected_impact') current.impact.push(b); else current.bullets.push(b);continue;
        }
        if(current) current.sourceLines.push(line); else misc[section]=(misc[section]||[]).concat(line);
        continue;
      }
      if(section==='summary') misc.summary.push(...splitSentences(line));
      else if(section==='capabilities') misc.capabilities.push(...String(line).split('•').map(x=>x.trim()).filter(Boolean));
      else if(section==='impact_snapshot') misc.impact_snapshot.push(line);
      else if(section==='education') misc.education.push(line);
      else if(section==='certifications') misc.certifications.push(line);
      else misc[section]=(misc[section]||[]).concat(line);
    }
    // PDF extraction sometimes repeats the early-career heading before education; recover obvious degree/cert lines.
    const all=lines.join('\n');
    if(!misc.education.length){const candidates=lines.filter(l=>/\b(ph\.?d\.?|m\.?s\.?|b\.?s\.?|bachelor|master|university of|college)\b/i.test(l)&&l.length<180);misc.education=uniq(candidates)}
    if(!misc.certifications.length){misc.certifications=uniq(lines.filter(l=>/\b(certified|certification|CAPM|PMP|Salesforce)\b/i.test(l)&&l.length<180))}
    return {id:uid('profile'),createdAt:new Date().toISOString(),identity,roles,misc,sourceMeta:meta,sourceText:String(text)};
  }

  function inferCategory(text){
    let best={key:'general',score:0};for(const [key,t] of Object.entries(TAXONOMY)){const s=countHits(text,t.direct)*2+countHits(text,t.adjacent);if(s>best.score)best={key,score:s}}return best.key;
  }
  function inferScope(text){const n=norm(text);if(n.includes('enterprise'))return'Enterprise';if(n.includes('global portfolio')||n.includes('portfolio'))return'Portfolio';if(n.includes('global'))return'Global';if(n.includes('program'))return'Program';if(n.includes('product'))return'Product';if(n.includes('feature'))return'Feature';return'Unspecified'}
  function inferAuthority(text){const n=norm(text);if(/\bown|owned\b/.test(n))return'Direct accountability';if(/\blead|led\b/.test(n))return'Leadership';if(/\bpartner|collaborat/.test(n))return'Shared / collaborative';if(/\bsupport|contribut/.test(n))return'Contributor';return'Unspecified'}
  function metrics(text){return uniq((String(text).match(/(?:[$€£]\s?\d[\d,.]*(?:\s?(?:M|K|B|million|thousand|billion))?|\b\d+(?:\.\d+)?%|\b\d+[KMB]\+?|\b\d{2,}\+\b)/gi)||[]).map(x=>x.trim()))}
  function restrictions(text){const n=norm(text),r=[];if(/cross-functional|matrix|contractor/.test(n))r.push('Do not represent this as direct people management unless direct reports are explicitly verified.');if(/revenue|commercial impact|savings|value/.test(n))r.push('Do not represent value delivered/influenced as budget or P&L ownership.');if(/pilot|explor|prototype/.test(n))r.push('Do not represent pilot/exploration as production deployment.');if(/life science/.test(n)&&!/medical device|digital health|healthcare it|diagnostic/.test(n))r.push('Do not represent life-science experience as exact medical-device/digital-health experience.');return r}
  function buildEvidence(profile,existing=[]){
    const keep=existing.filter(e=>e.sourceType!=='source');const out=[];
    for(const role of profile.roles){
      for(const b of [...role.bullets,...role.impact]){
        const cat=inferCategory(b.text);out.push({id:uid('ev'),capability:TAXONOMY[cat]?.label||'Career evidence',category:cat,statement:b.text,approvedLanguage:b.text,employer:role.company,role:role.title,period:role.dates,scope:inferScope(b.text),authority:inferAuthority(b.text),attribution:'As stated in source',metrics:metrics(b.text),sourceType:'source',sourceText:b.sourceText||b.text,sourceRef:b.id,status:'Verified',promoted:true,confidence:'High',restrictions:restrictions(b.text),validatedAt:profile.createdAt});
      }
    }
    for(const s of profile.misc.summary||[]){const cat=inferCategory(s);out.push({id:uid('ev'),capability:TAXONOMY[cat]?.label||'Career positioning',category:cat,statement:s,approvedLanguage:s,employer:'',role:'Professional summary',period:'',scope:inferScope(s),authority:inferAuthority(s),attribution:'Source summary',metrics:metrics(s),sourceType:'source',sourceText:s,status:'Verified',promoted:true,confidence:'Medium',restrictions:restrictions(s),validatedAt:profile.createdAt})}
    return [...out,...keep];
  }

  function splitJD(text){
    const raw=String(text).replace(/\r/g,'').split('\n').map(s=>s.trim()).filter(Boolean),out=[];let section='general';
    for(const line0 of raw){
      const n=norm(line0);
      if(/^(tasks|responsibilities|what you will do|what you'll do|key responsibilities)/.test(n))section='responsibilities';
      else if(/^(your profile|requirements|qualifications|what you bring|who you are|minimum qualifications)/.test(n))section='requirements';
      else if(/^(about the position|about the role|position summary)/.test(n))section='about';
      else if(/^(why us|benefits|about us|contact|equal opportunity)/.test(n))section='boilerplate';
      const pieces=line0.length>260?splitSentences(line0):[line0];for(const line of pieces)out.push({line,section});
    }
    return out;
  }
  function requirementClass(line,section){const n=norm(line);if(/must|required|minimum|\d+\+? years?|proven track record|bachelor|no visa|sponsorship.*not available/.test(n))return'Mandatory';if(/highly desirable|strongly preferred/.test(n))return'Strongly preferred';if(/preferred|advantage|nice to have|familiarity/.test(n))return'Preferred';if(section==='boilerplate')return'Boilerplate';if(section==='requirements')return'Strongly preferred';return'Contextual'}
  function extractCriteria(jd){
    const items=splitJD(jd),c=[];
    for(const [key,t] of Object.entries(TAXONOMY)){
      let score=0,best='',bestScore=-999,classification='Contextual',support=[],directTotal=0,adjacentTotal=0;
      for(const item of items){const d=countHits(item.line,t.direct),a=countHits(item.line,t.adjacent);if(!d&&!a)continue;directTotal+=d;adjacentTotal+=a;let s=d*6+a*1.6;if(item.section==='requirements')s+=8;if(item.section==='responsibilities')s+=4;if(item.section==='about')s-=2;if(item.section==='boilerplate')s-=15;const cls=requirementClass(item.line,item.section);if(cls==='Mandatory')s+=8;else if(cls==='Strongly preferred')s+=5;else if(cls==='Preferred')s+=2;if(t.risk==='gate'&&item.section==='requirements')s+=3;score+=Math.max(0,s);support.push(item.line);if(s>bestScore){bestScore=s;best=item.line;classification=cls}}
      if(score>0)c.push({id:uid('crit'),category:key,label:t.label,group:t.group,requirement:best||support[0],supportingJD:uniq(support).slice(0,5),classification,importance:score,directTotal,adjacentTotal,risk:t.risk,why:`${classification} language and role responsibilities emphasize ${t.label.toLowerCase()}.`});
    }
    c.sort((a,b)=>b.importance-a.importance);
    const selected=[];const used=new Set();
    const add=x=>{if(!x||selected.length>=5||x.classification==='Boilerplate'||used.has(x.group))return;selected.push(x);used.add(x.group)};
    const selectionCategory=x=>!['education','authorization','location_travel'].includes(x.category) && !(['budget','people_management'].includes(x.category)&&x.directTotal===0);
    // Mandatory role-selection criteria first; logistics/education remain knockout checks rather than consuming top-five slots.
    c.filter(x=>selectionCategory(x)&&x.classification==='Mandatory'&&x.risk==='core').forEach(add);
    // Preserve specialized domain gates when explicitly present; frequency alone must not bury them.
    ['interoperability','regulated','healthcare_domain','data_ai','people_management','budget'].forEach(k=>{const x=c.find(y=>y.category===k&&selectionCategory(y)&&y.importance>=10);add(x)});
    // Then select remaining highest-impact distinct role criteria.
    c.filter(x=>selectionCategory(x)&&x.risk==='core').forEach(add);
    c.filter(selectionCategory).forEach(add);
    return {criteria:selected.slice(0,5),candidates:c};
  }
  function extractJobMeta(text,source='manual'){
    const lines=String(text).split('\n').map(s=>s.trim()).filter(Boolean);const title=lines.find(l=>/\b(product manager|product owner|director|senior manager|associate director|lead|manager|head of|vice president)\b/i.test(l)&&l.length<140)||'';
    let company='';try{if(source&&source!=='manual')company=new URL(source).hostname.replace(/^www\./,'').split('.')[0].replace(/[-_]/g,' ')}catch{}
    const location=(lines.find(l=>/\b(location|united states|remote|hybrid|onsite|on-site|boston|cambridge|massachusetts|new york|california)\b/i.test(l)&&l.length<160)||'').replace(/^location\s*:?\s*/i,'');
    const workModel=(String(text).match(/\b(remote|hybrid|on-site|onsite)\b/i)||[])[0]||'';const compensation=(String(text).match(/[$€£]\s?\d{2,3}(?:[\d,]{0,7})?(?:\s?[-–—]\s?[$€£]?\s?\d{2,3}(?:[\d,]{0,7})?)?/i)||[])[0]||'';
    return {company:company.replace(/\b\w/g,c=>c.toUpperCase()),title,location,workModel,compensation};
  }
  function detectKnockouts(jd){
    const out=[];for(const it of splitJD(jd)){const n=norm(it.line),cls=requirementClass(it.line,it.section);if(/visa sponsorship.*not available|no visa sponsorship|must be authorized to work/.test(n))out.push({id:uid('ko'),type:'authorization',requirement:it.line,classification:'Mandatory',status:'Unknown'});if(/bachelor|master'?s degree|phd|degree/.test(n)&&cls==='Mandatory')out.push({id:uid('ko'),type:'education',requirement:it.line,classification:'Mandatory',status:'Unknown'});if(/\b\d+\+? years?\b/.test(n)&&/experience/.test(n)&&cls==='Mandatory')out.push({id:uid('ko'),type:'years',requirement:it.line,classification:'Mandatory',status:'Unknown'});if(/direct reports|people management|manage a team/.test(n)&&cls==='Mandatory')out.push({id:uid('ko'),type:'people_management',requirement:it.line,classification:'Mandatory',status:'Unknown'});if(/ability to travel|travel required|must travel|on-site|onsite/.test(n)&&cls==='Mandatory')out.push({id:uid('ko'),type:'location_travel',requirement:it.line,classification:'Mandatory',status:'Unknown'})}
    const seen=new Set();return out.filter(x=>{const k=norm(x.requirement);if(seen.has(k))return false;seen.add(k);return true});
  }
  function careerYears(profile){const spans=[];for(const r of profile?.roles||[]){const m=String(r.dates).match(/((?:19|20)\d{2})\s*[-–—]\s*(Present|Current|(?:19|20)\d{2})/i);if(m){const s=+m[1],e=/present|current/i.test(m[2])?new Date().getFullYear():+m[2];spans.push([s,e])}}if(!spans.length)return 0;return Math.max(...spans.map(x=>x[1]))-Math.min(...spans.map(x=>x[0]))}
  function verifyKnockouts(knockouts,profile,evidence,profileFacts={}){
    const all=norm([profile?.sourceText||'',...evidence.map(e=>e.statement)].join(' '));return knockouts.map(k=>{let status='Unknown',reason='Needs confirmation.';
      if(k.type==='education'){status=/phd|doctor of philosophy|master|m\.s\.|bachelor|b\.s\./.test(all)?'Clear':'Unknown';reason=status==='Clear'?'Degree evidence is present in the source profile.':'The required degree is not clearly verified.'}
      else if(k.type==='years'){const req=+(k.requirement.match(/\d+/)||[])[0]||0,yrs=careerYears(profile);status=yrs>=req?'Clear':'Unknown';reason=`Documented career span is approximately ${yrs} years versus a ${req}+ year requirement.`}
      else if(k.type==='people_management'){const direct=evidence.some(e=>e.category==='people_management'&&countHits(e.statement,TAXONOMY.people_management.direct)>0);status=direct?'Clear':'Missing';reason=direct?'Direct people-management evidence is verified.':'Direct-report responsibility is not currently verified.'}
      else if(k.type==='authorization'){if(profileFacts.workAuthorization){status=/authorized|citizen|permanent|green card/i.test(profileFacts.workAuthorization)?'Clear':'Missing';reason=profileFacts.workAuthorization}else{status='Unknown';reason='Work authorization has not been confirmed in Pursuit.'}}
      else if(k.type==='location_travel'){status=profileFacts.travelReady?'Clear':'Unknown';reason=profileFacts.travelReady?'Travel requirement confirmed by user.':'Travel compatibility has not been confirmed.'}
      return {...k,status,reason};
    })
  }

  function boundaryStatus(category,evidence,score){
    const txt=evidence?.statement||'',d=countHits(txt,TAXONOMY[category]?.direct||[]),a=countHits(txt,TAXONOMY[category]?.adjacent||[]),n=norm(txt);
    if(category==='interoperability'){const exact=countHits(txt,TAXONOMY.interoperability.direct);if(exact>0)return{status:'Strong',reason:'Direct healthcare-interoperability terminology is verified.'};if(a>0)return{status:'Adjacent',reason:'API/data-integration evidence exists, but EHR/EMR/HL7/FHIR or healthcare interoperability is not verified.'};return{status:'Unsupported',reason:'No verified healthcare interoperability evidence is currently available.'}}
    if(category==='healthcare_domain'){if(d>0)return{status:'Strong',reason:'Direct healthcare/medical-technology domain evidence is verified.'};if(a>0)return{status:'Adjacent',reason:'Life-science/biomedical experience is relevant but remains adjacent to the exact healthcare-technology environment.'};return{status:'Unsupported',reason:'The requested healthcare/medical-technology domain is not currently verified.'}}
    if(category==='regulated'){const exact=['quality','regulatory','clinical affairs'].filter(k=>n.includes(k)).length;if(exact>=2)return{status:'Strong',reason:'Direct collaboration with multiple regulated functions is verified.'};if(exact===1||/r&d|research and development|engineering|compliance|validation/.test(n))return{status:'Partial',reason:'Related product-development evidence exists, but Quality/Regulatory/Clinical coverage is incomplete.'};return{status:'Unsupported',reason:'Regulated cross-functional development is not clearly verified.'}}
    if(category==='people_management'){if(d>0)return{status:'Strong',reason:'Direct people-management evidence is verified.'};if(a>0)return{status:'Adjacent',reason:'Leadership is verified, but direct reports are not.'};return{status:'Unsupported',reason:'Direct people management is not verified.'}}
    if(category==='budget'){if(d>0)return{status:'Strong',reason:'Budget/P&L responsibility is directly verified.'};if(a>0)return{status:'Adjacent',reason:'Value/revenue evidence exists, but budget ownership is not verified.'};return{status:'Unsupported',reason:'Budget/P&L ownership is not verified.'}}
    if(d>=2||d>0&&score>=.20)return{status:'Strong',reason:'Direct terminology and supporting evidence align.'};if(score>=.46||d>0)return{status:'Partial',reason:'Relevant evidence exists but does not fully establish the requested scope/context.'};if(score>=.25||a>0)return{status:'Adjacent',reason:'Transferable evidence exists, but the requested context or scope is not directly demonstrated.'};return{status:'Unsupported',reason:'No sufficiently defensible evidence is currently verified.'};
  }
  function gapType(criterion,status,score){if(status==='Strong')return'None';if(status==='Partial')return score>.45?'Weakly expressed evidence':'Missing evidence';if(status==='Adjacent')return'Adjacent evidence';if(criterion.classification==='Mandatory')return'Mandatory / capability gap';return'Genuine capability gap'}
  function matchCriteria(criteria,evidence){
    const active=evidence.filter(e=>e.status!=='Retired');return criteria.map(c=>{
      const ranked=active.map(e=>{const direct=countHits(e.statement,TAXONOMY[c.category]?.direct||[]),adj=countHits(e.statement,TAXONOMY[c.category]?.adjacent||[]),lex=tokenSim(`${c.label} ${c.requirement}`,e.statement);let score=lex*.45+Math.min(.48,direct*.24)+Math.min(.20,adj*.10);if(e.sourceType==='validation')score+=.04;return{evidence:e,score,direct,adj,lex}}).sort((a,b)=>b.score-a.score);
      const best=ranked[0],guard=boundaryStatus(c.category,best?.evidence,best?.score||0);return{criterionId:c.id,status:guard.status,reason:guard.reason,bestEvidenceId:best?.evidence?.id||null,alternatives:ranked.slice(1,4).map(x=>x.evidence.id),score:best?.score||0,gapType:gapType(c,guard.status,best?.score||0)};
    })
  }

  const FIT={Strong:1,Partial:.68,Adjacent:.42,Unsupported:0,'Knockout Risk':0};
  function titleRank(t){const n=norm(t);if(/vice president|\bvp\b|head of/.test(n))return 5;if(/senior director/.test(n))return 4.7;if(/director/.test(n))return 4;if(/associate director/.test(n))return 3.5;if(/senior manager|lead/.test(n))return 3;if(/manager|product owner/.test(n))return 2.5;if(/senior/.test(n))return 2;return 1}
  function scoreAnalysis(criteria,matches,knockouts,profile,evidence,jobMeta={}){
    const w=c=>c.classification==='Mandatory'?1.45:c.classification==='Strongly preferred'?1.18:c.classification==='Preferred'?.95:.78;let denom=0,covered=0;criteria.forEach((c,i)=>{const ww=w(c);denom+=ww;covered+=(FIT[matches[i]?.status]||0)*ww});const coverage=denom?covered/denom:0;
    const terms=uniq(criteria.flatMap(c=>[...(TAXONOMY[c.category]?.direct||[]),...(TAXONOMY[c.category]?.adjacent||[])])).filter(x=>x.length>2);const source=norm(profile?.sourceText||'');const term=terms.length?terms.filter(t=>source.includes(norm(t))).length/terms.length:.5;
    const titleScore=clamp(1-Math.abs(titleRank(profile?.identity?.headline||profile?.roles?.[0]?.title||'')-titleRank(jobMeta.title||''))*.2,.2,1);const chrono=careerYears(profile)>0?1:.55;const education=knockouts.some(k=>k.type==='education'&&k.status!=='Clear')?.55:1;const logistics=knockouts.some(k=>k.status==='Missing')?.35:knockouts.some(k=>k.status==='Unknown')?.75:1;
    const breakdown={requirements:Math.round(coverage*40),terminology:Math.round(term*18),titleSeniority:Math.round(titleScore*12),parseability:10,chronology:Math.round(chrono*8),educationLogistics:Math.round(((education+logistics)/2)*12)};const ats=Object.values(breakdown).reduce((a,b)=>a+b,0);
    const missing=knockouts.filter(k=>k.status==='Missing').length,unknown=knockouts.filter(k=>k.status==='Unknown').length,metricsN=evidence.filter(e=>e.metrics?.length).length,lead=evidence.filter(e=>/Direct accountability|Leadership/.test(e.authority||'')).length;
    let rec=30+coverage*58+titleScore*7-missing*18-unknown*4;let mgr=26+coverage*54+Math.min(8,metricsN*.45)+Math.min(7,lead*.3)-missing*14-unknown*3;rec=clamp(Math.round(rec),8,93);mgr=clamp(Math.round(mgr),8,93);
    const unsupported=matches.filter(m=>m.status==='Unsupported').length;const confidence=(criteria.length===5&&unknown===0&&unsupported<2)?'High':(criteria.length===5&&unknown<=1)?'Medium':'Low';const spread=confidence==='High'?5:confidence==='Medium'?8:11;return{ats,breakdown,coverage,recruiter:{low:clamp(rec-spread,2,97),high:clamp(rec+spread,3,98)},manager:{low:clamp(mgr-spread,2,97),high:clamp(mgr+spread,3,98)},confidence};
  }
  function recommend(scores,criteria,matches,knockouts){
    const mandatoryUnsupported=criteria.some((c,i)=>c.classification==='Mandatory'&&matches[i]?.status==='Unsupported'),missingKO=knockouts.some(k=>k.status==='Missing'),unsupported=matches.filter(m=>m.status==='Unsupported').length,adjacent=matches.filter(m=>m.status==='Adjacent').length,strong=matches.filter(m=>m.status==='Strong').length;
    const risk=(()=>{const m=knockouts.find(k=>k.status==='Missing');if(m)return m.reason;const u=knockouts.find(k=>k.status==='Unknown');if(u)return u.reason;let i=matches.findIndex(x=>x.status==='Unsupported');if(i>=0)return`${criteria[i].label}: ${matches[i].reason}`;i=matches.findIndex(x=>x.status==='Adjacent');if(i>=0)return`${criteria[i].label}: ${matches[i].reason}`;return'No material qualification risk is currently identified.'})();
    if(missingKO||mandatoryUnsupported||scores.ats<48)return{label:'PASS',tone:'pass',reason:'A mandatory or high-impact gap currently outweighs the value of tailoring.',risk};
    if(unsupported>=1||scores.ats<62)return{label:'APPLY — STRETCH WITH RISK',tone:'stretch',reason:'There is enough relevant evidence to consider applying, but an important gap remains explicit.',risk};
    if(adjacent>=2||strong<3)return{label:'APPLY — STRONG ADJACENT FIT',tone:'adjacent',reason:'The profile is credible and transferable, but important parts of the role depend on adjacent rather than exact experience.',risk};
    return{label:'APPLY',tone:'apply',reason:'The role has enough evidence-backed alignment to justify a focused application.',risk};
  }
  function hiringProblem(criteria,jobMeta={}){const top=criteria.slice(0,3).map(c=>c.label.toLowerCase());return`Inference: ${jobMeta.title||'This role'} needs someone who can ${top.join(', while also ')} and convert that capability into measurable product and business outcomes.`}

  function evidenceRelevance(e,criteria,matches){let s=0;criteria.forEach((c,i)=>{if(matches[i]?.bestEvidenceId===e.id)s+=1.3;if(matches[i]?.alternatives?.includes(e.id))s+=.35;s+=countHits(e.statement,TAXONOMY[c.category]?.direct||[])*.16+s*0});s+=Math.min(.35,(e.metrics?.length||0)*.15);return s}
  function generateDraft(profile,evidence,criteria,matches,jobMeta={},hiring=''){
    const ranked=[...evidence].filter(e=>e.status!=='Retired').sort((a,b)=>evidenceRelevance(b,criteria,matches)-evidenceRelevance(a,criteria,matches));
    const summarySource=(profile.misc?.summary||[]).map(s=>({s,score:Math.max(...criteria.map(c=>tokenSim(`${c.label} ${c.requirement}`,s)+countHits(s,TAXONOMY[c.category]?.direct||[])*.2))})).sort((a,b)=>b.score-a.score).map(x=>x.s);
    let summary=summarySource.slice(0,3).join(' ');if(summary.split(/\s+/).length>105)summary=summary.split(/\s+/).slice(0,105).join(' ')+'…';
    if(!summary)summary=`${profile.identity?.headline||profile.roles?.[0]?.title||'Product leader'} with verified experience aligned to ${criteria.slice(0,3).map(c=>c.label.toLowerCase()).join(', ')}.`;
    const impact=ranked.filter(e=>e.metrics?.length&&e.sourceType!=='summary').slice(0,3).map(e=>({id:uid('impact'),text:e.approvedLanguage||e.statement,metric:e.metrics[0],evidenceId:e.id,verified:true}));const impactIds=new Set(impact.map(x=>x.evidenceId));
    const existingCaps=profile.misc?.capabilities||[];const capRank=existingCaps.map(c=>({c,score:Math.max(...criteria.map(k=>tokenSim(k.label,c)+countHits(c,TAXONOMY[k.category]?.direct||[])*.2))})).sort((a,b)=>b.score-a.score).map(x=>x.c);const backedLabels=criteria.filter((c,i)=>matches[i]?.status==='Strong'||matches[i]?.status==='Partial').map(c=>c.label);const capabilities=uniq([...capRank,...backedLabels]).slice(0,16);
    const roles=[];for(const role of (profile.roles||[]).filter(r=>r.kind!=='early')){const roleEv=evidence.filter(e=>e.status!=='Retired'&&e.employer===role.company&&e.role===role.title&&!impactIds.has(e.id));const count=role===(profile.roles||[]).find(r=>r.kind!=='early')?5:3;const selected=[...roleEv].sort((a,b)=>evidenceRelevance(b,criteria,matches)-evidenceRelevance(a,criteria,matches)).slice(0,count);roles.push({id:role.id,company:role.company,title:role.title,dates:role.dates,location:role.location,bullets:selected.map(e=>({id:uid('bullet'),text:e.approvedLanguage||e.statement,originalText:e.statement,evidenceId:e.id,verified:true,reason:'Selected because it best supports the target role.'}))})}
    const selectedImpact=ranked.filter(e=>e.metrics?.length&&!impactIds.has(e.id)&&!((profile.roles||[]).find(r=>r.kind==='early'&&r.company===e.employer))).slice(0,4).map(e=>({id:uid('bullet'),text:e.approvedLanguage||e.statement,evidenceId:e.id,verified:true,reason:'Quantified role-relevant outcome.'}));
    const early=(profile.roles||[]).filter(r=>r.kind==='early').flatMap(r=>{const head=[r.title,r.company,r.dates].filter(Boolean).join(' | ');return [head,...[...r.bullets,...r.impact].map(b=>b.text)]}).filter(Boolean);
    return{id:uid('draft'),jobMeta,identity:{...profile.identity},summary,impact,capabilities,roles,selectedImpact,early,education:uniq([...(profile.misc?.education||[]),...(profile.misc?.certifications||[])]).slice(0,12),hiringProblem:hiring,createdAt:new Date().toISOString()};
  }
  function truthCheck(proposed,sourceTexts=[]){
    const joined=sourceTexts.join(' '),issues=[];for(const r of DANGER_RULES){if(r.trigger.test(proposed)&&!r.source.test(joined))issues.push({rule:r.id,label:r.label,message:r.message})}
    const pm=metrics(proposed),sm=metrics(joined);for(const m of pm){if(!sm.includes(m))issues.push({rule:'metric',label:'New metric',message:`Metric ${m} is not present in the supporting evidence.`})}
    // A manual rewrite cannot introduce a new capability category that has no direct or adjacent basis in its evidence.
    for(const [key,t] of Object.entries(TAXONOMY)){const pd=countHits(proposed,t.direct),sd=countHits(joined,t.direct)+countHits(joined,t.adjacent);if(pd>0&&sd===0&&!["education","location_travel","authorization"].includes(key))issues.push({rule:`new_${key}`,label:'New unsupported capability',message:`The edit introduces ${t.label.toLowerCase()} without supporting source evidence.`})}
    if(words(proposed).length>=7&&words(joined).length>=7&&tokenSim(proposed,joined)<.18)issues.push({rule:'material_rewrite',label:'Material rewrite',message:'The proposed wording is too far from the supporting evidence to approve as a simple edit. Validate it as new evidence instead.'});
    const unique=[];const seen=new Set();for(const x of issues){const k=x.rule+':'+x.message;if(!seen.has(k)){seen.add(k);unique.push(x)}}
    return{ok:unique.length===0,issues:unique};
  }
  function makeValidatedEvidence({criterion,text,employer='',role='',period='',scope='Unspecified',authority='Unspecified',attribution='As described by user',destination='bank'}){
    const clean=String(text).trim();return{id:uid('ev'),capability:criterion.label,category:criterion.category,statement:clean,approvedLanguage:clean,employer,role,period,scope,authority,attribution,metrics:metrics(clean),sourceType:'validation',sourceText:clean,status:'Verified',promoted:destination==='profile',confidence:'User validated',restrictions:restrictions(clean),validatedAt:new Date().toISOString()};
  }

  function analyze({jd,profile,evidence,jobMeta={},profileFacts={}}){
    const parsed=extractCriteria(jd),criteria=parsed.criteria,matches=matchCriteria(criteria,evidence),knockouts=verifyKnockouts(detectKnockouts(jd),profile,evidence,profileFacts),scores=scoreAnalysis(criteria,matches,knockouts,profile,evidence,jobMeta),recommendation=recommend(scores,criteria,matches,knockouts),problem=hiringProblem(criteria,jobMeta),draft=generateDraft(profile,evidence,criteria,matches,jobMeta,problem);return{criteria,matches,knockouts,scores,recommendation,hiringProblem:problem,draft,jobMeta,createdAt:new Date().toISOString()};
  }

  return {TAXONOMY,DANGER_RULES,norm,words,countHits,tokenSim,parseResume,buildEvidence,extractCriteria,extractJobMeta,detectKnockouts,verifyKnockouts,matchCriteria,scoreAnalysis,recommend,hiringProblem,generateDraft,truthCheck,makeValidatedEvidence,analyze,careerYears,uid,metrics,restrictions};
});
