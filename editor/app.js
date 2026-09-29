// SPDX-License-Identifier: AGPL-3.0-or-later
"use strict";

const groups = [
  ["required_information", "Fragen", "#e8f2ff", "#4b77a7"],
  ["documents", "Dokumenttypen", "#eef8ee", "#4d8a55"],
  ["decisions", "Entscheidungen", "#fff4df", "#ac7a21"],
  ["gates", "Prüfschritte", "#fdebec", "#b45c64"],
  ["evidence", "Nachweistypen", "#f3edff", "#8060aa"]
];
const relations = {
  erfordert: "erfordert",
  informiert: "informiert",
  blockiertBisVollstaendig: "wartet auf vollständige Angaben",
  blockiertBisGeprueft: "wartet auf Prüfung",
  erfordertEntscheidung: "erfordert Entscheidung",
  belegtDurch: "belegt durch",
  fuellt: "füllt",
  bestimmt: "bestimmt"
};
const $ = id => document.getElementById(id);
const svgNS = "http://www.w3.org/2000/svg";
let state = { token: "", branch: "", purpose: "case", activeCase: "", hosted: false, user: "", notaryReviewer: false, ontologyMaintainer: false, reviewDetail: null, current: null, cases: [], selected: null, nodeEditing: false, dirty: false, graphFocused: true, view: "fall", vocabulary: null, vocabSelected: null, vocabEditing: false, vocabNew: false, vocabularyImpact: null, impactLoading: false, impactError: "", caseIndex: null, caseIndexPromise: null, caseHistory: null, historyTarget: "", drafts: [] };

function element(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}
function svg(tag, attrs = {}) {
  const el = document.createElementNS(svgNS, tag);
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value);
  return el;
}
function notice(message, type = "") {
  $("notice").textContent = message;
  $("notice").className = "notice " + type;
}
async function api(path, body) {
  const options = body === undefined ? {} : {
    method: "POST",
    headers: {"Content-Type": "application/json", "X-Editor-Token": state.token},
    body: JSON.stringify(body)
  };
  const response = await fetch(path, options);
  const result = await response.json();
  if (response.status === 401) {
    window.location.assign("/login");
    throw new Error("Anmeldung erforderlich");
  }
  if (!response.ok) throw new Error(result.error || "Anfrage fehlgeschlagen");
  return result;
}
function dirty() {
  state.dirty = true;
  notice("Änderungen sind noch nicht gespeichert.");
}
function nodeLabel(id) {
  return state.current.nodes.find(node => node.id === id)?.label || id;
}
function caseEditable() {
  return state.branch !== "main" && state.purpose === "case" && (!state.hosted || state.activeCase === state.current?.slug);
}
function refreshBranch() {
  $("branch").textContent = state.branch && state.branch!=="main" ? (state.hosted && state.purpose==="case" && !caseEditable() ? "Anderen Fall ansehen" : "Mein Entwurf") : "Lesemodus";
  const activeTitle=state.cases.find(item=>item.slug===state.activeCase)?.title || state.activeCase;
  $("branch").title = state.branch && state.branch!=="main" ? `GitHub-Zweig: ${state.branch}${activeTitle ? " · Entwurf für " + activeTitle : ""}` : "Aktueller Katalogstand";
  $("draft-panel").hidden = state.branch !== "main" || !state.drafts.length;
  $("start-branch").hidden = state.branch !== "main" || (state.view==="vokabular" && !state.ontologyMaintainer);
  $("leave-draft").hidden = !state.hosted || state.branch === "main";
  $("save").disabled = state.view==="vokabular" ? state.branch==="main" || state.purpose!=="vocabulary" : !caseEditable();
  for(const id of ["add-node","add-edge","submit-review"]) $(id).disabled=!caseEditable();
  $("edit-overview").disabled=state.branch!=="main" && !caseEditable();
  $("edit-node").disabled=state.branch!=="main" && !caseEditable();
  $("vocab-add").hidden=!state.ontologyMaintainer || (state.branch!=="main" && state.purpose!=="vocabulary");
  $("vocab-submit").disabled=state.branch==="main" || state.purpose!=="vocabulary";
}
function renderCaseList() {
  const root=$("case-list");root.replaceChildren();
  const query=$("case-search").value.trim().toLocaleLowerCase("de");
  let count=0;
  state.cases.forEach(item=>{
    if(query && !item.title.toLocaleLowerCase("de").includes(query)) return;
    count++;
    const button=element("button",item.title,"case-item"+(state.current?.slug===item.slug ? " active" : ""));
    button.type="button";
    button.addEventListener("click",()=>loadCase(item.slug).catch(error=>notice(error.message,"error")));
    root.append(button);
  });
  if(!count) root.append(element("p","Keine Vorgangsart gefunden.","empty"));
}
function renderCaseIndex() {
  const root=$("case-index-results");root.replaceChildren();
  const query=$("case-index-query").value.trim().toLocaleLowerCase("de");
  if(query.length<2){$("case-index-status").textContent="Mindestens zwei Zeichen eingeben. Die Suche zeigt fachliche Bausteine aus dem aktuellen Katalogstand.";return;}
  if(!state.caseIndex){$("case-index-status").textContent="Bausteine werden geladen …";return;}
  const words=query.split(/\s+/).filter(Boolean);
  const matches=state.caseIndex.entries.filter(item=>{
    const content=[item.case_title,item.label,item.question,item.detail,item.node_id].join(" ").toLocaleLowerCase("de");
    return words.every(word=>content.includes(word));
  });
  const source=state.caseIndex.source_ref;
  $("case-index-status").textContent=`${matches.length} Treffer in ${state.caseIndex.case_count} Fällen · Katalogstand ${/^[0-9a-f]{40}$/.test(source) ? source.slice(0,12) : source}`;
  matches.slice(0,40).forEach(item=>{
    const button=element("button",undefined,"case-index-result");button.type="button";
    button.append(element("strong",item.label),element("small",`${item.case_title} · ${groups.find(group=>group[0]===item.category)?.[1] || item.category}`));
    if(item.question)button.append(element("span",item.question));
    button.addEventListener("click",async()=>{
      try{
        await loadCase(item.slug);
        if(state.current.slug!==item.slug)return;
        $("node-search").value="";$("node-category").value="";
        selectNode(item.node_id);
      }catch(error){notice(error.message,"error");}
    });
    root.append(button);
  });
  if(matches.length>40)root.append(element("p","Die ersten 40 Treffer werden angezeigt. Suche bitte genauer.","context-help"));
  if(!matches.length)root.append(element("p","Kein passender Baustein gefunden.","empty"));
}
async function loadCaseIndex() {
  if(!state.caseIndexPromise){
    state.caseIndexPromise=api("/api/case-index").then(result=>{state.caseIndex=result;renderCaseIndex();return result;}).catch(error=>{state.caseIndexPromise=null;$("case-index-status").textContent="Suche konnte nicht geladen werden: "+error.message;throw error;});
  }
  return state.caseIndexPromise;
}
function renderOverview() {
  $("summary-read").textContent=state.current.summary;
  const sources=$("source-links");sources.replaceChildren();
  state.current.sources.forEach(source=>{
    try{
      const url=new URL(source);
      if(url.protocol!=="https:") throw new Error("Ungültige Quelle");
      const link=element("a",url.hostname + url.pathname,"source-link");link.href=url.href;link.target="_blank";link.rel="noopener noreferrer";
      sources.append(link);
    }catch{sources.append(element("span","Quelle benötigt eine HTTPS-Adresse","source-invalid"));}
  });
  const stats=$("overview-stats");stats.replaceChildren();
  groups.forEach(([key,label])=>{
    const count=state.current.nodes.filter(node=>node.category===key).length;
    const button=element("button",undefined,"stat-card");button.type="button";
    button.append(element("strong",String(count)),element("span",label));
    button.addEventListener("click",()=>{$("node-category").value=key;setView("bausteine");renderNodes();});
    stats.append(button);
  });
}
async function loadCaseHistory() {
  const slug=state.current.slug;
  const root=$("history-list");root.replaceChildren(element("p","Änderungen werden geladen …","empty"));
  const history=await api("/api/cases/"+encodeURIComponent(slug)+"/history");
  if(state.current.slug!==slug)return;
  state.caseHistory=history;root.replaceChildren();
  if(!history.entries.length){root.append(element("p","Noch keine gespeicherte Änderung gefunden.","empty"));return;}
  history.entries.forEach(item=>{
    const row=element("div",undefined,"history-item");
    const info=element("div");
    info.append(element("strong",item.message || "Änderung der Fallvorlage"));
    const date=item.date ? new Date(item.date).toLocaleDateString("de-DE") : "Datum unbekannt";
    info.append(element("small",`${date} · ${item.author} · ${item.sha.slice(0,10)}`));
    const actions=element("div",undefined,"history-actions");
    const link=element("a","Auf GitHub ansehen ↗");link.href=item.url;link.target="_blank";link.rel="noopener noreferrer";
    const button=element("button","Fassung prüfen");button.type="button";
    button.disabled=state.branch!=="main";
    button.addEventListener("click",()=>previewCaseHistory(item).catch(error=>notice(error.message,"error")));
    actions.append(link,button);row.append(info,actions);root.append(row);
  });
  if(state.branch!=="main")root.prepend(element("p","Eine frühere Fassung kann erst nach Abschluss des laufenden Arbeitszweigs übernommen werden.","context-help"));
}
async function previewCaseHistory(item) {
  if(!state.caseHistory || state.branch!=="main")throw new Error("Bitte Fall und Historie neu laden.");
  const result=await api("/api/cases/"+encodeURIComponent(state.current.slug)+"/restore-preview",{
    target_sha:item.sha,expected_main:state.caseHistory.main_ref
  });
  state.historyTarget=item.sha;
  $("history-preview").hidden=false;
  $("history-target").textContent=`Frühere Fassung ${item.sha.slice(0,10)} von ${item.author}. Der aktuelle Fall wird dadurch nicht direkt geändert.`;
  const list=$("history-changes");list.replaceChildren();
  result.changes.forEach(change=>list.append(element("li",change)));
  if(!result.changed)list.append(element("li","Diese Fassung entspricht bereits dem aktuellen Fall."));
  $("history-apply").disabled=!result.changed;
}
async function applyCaseHistory() {
  try{
    if(!state.caseHistory || !state.historyTarget || state.branch!=="main")throw new Error("Bitte die frühere Fassung erneut prüfen.");
    const slug=state.current.slug;
    const result=await api("/api/cases/"+encodeURIComponent(slug)+"/restore",{
      target_sha:state.historyTarget,expected_main:state.caseHistory.main_ref
    });
    state.branch=result.branch;state.purpose="case";refreshBranch();
    await loadCase(slug);setView("pruefung");
    notice("Frühere Fassung als neuer Arbeitsentwurf gespeichert. Bitte Grund und Quellenstand angeben und zur notariellen Prüfung einreichen.","success");
  }catch(error){notice(error.message,"error");}
}
async function loadReviewQueue() {
  const root=$("review-list");root.replaceChildren(element("p","Änderungen werden geladen …","empty"));
  const reviews=await api("/api/reviews");root.replaceChildren();
  if(!reviews.length){root.append(element("p","Derzeit liegt keine einzelne Änderung zur Prüfung vor.","empty"));notice("Prüfkorb geladen.","quiet");return;}
  reviews.forEach(item=>{
    const card=element("button",undefined,"review-item"+(state.reviewDetail?.number===item.number ? " active" : ""));card.type="button";
    const caseTitle=item.case==="vocabulary" ? "Gemeinsames Vokabular" : state.cases.find(entry=>entry.slug===item.case)?.title || item.case;
    card.append(element("strong",caseTitle),element("span",`#${item.number} · von ${item.author} · ${item.draft ? "noch in Arbeit" : "zur Prüfung"}`));
    card.addEventListener("click",()=>loadReview(item.number).catch(error=>notice(error.message,"error")));root.append(card);
  });
  notice("Prüfkorb geladen.","quiet");
}
async function loadReview(number) {
  const detail=await api("/api/reviews/"+number);state.reviewDetail=detail;
  $("review-detail").hidden=false;$("review-title").textContent=detail.title;
  $("review-meta").textContent=`${detail.case==="vocabulary" ? "Gemeinsames Vokabular" : "Fall: " + (state.cases.find(item=>item.slug===detail.case)?.title || detail.case)} · erstellt von ${detail.author} · ${detail.draft ? "noch in Arbeit" : "zur Prüfung bereit"}`;
  $("review-pr-link").href=detail.url;
  const body=$("review-body");body.replaceChildren();
  const sections=(detail.body || "").split(/^## /m);
  if(sections[0].trim())body.append(element("p",sections[0].trim()));
  sections.slice(1).forEach(section=>{
    const [title,...lines]=section.split("\n");
    body.append(element("h5",title.trim()),element("p",lines.join("\n").trim() || "Keine Angabe."));
  });
  if(!body.childNodes.length)body.append(element("p","Keine Begründung im Pull Request angegeben."));
  const list=$("review-changes");list.replaceChildren();
  detail.changes.forEach(change=>list.append(element("li",change)));
  if(!detail.changes.length)list.append(element("li","Keine erklärbare fachliche Änderung vorhanden."));
  $("review-problem").hidden=!detail.problem;$("review-problem").textContent=detail.problem;
  $("request-changes").disabled=!detail.can_review;
  $("approve-review").disabled=!detail.can_approve;
  $("review-checklist").hidden=!detail.can_approve;
  $("review-permission").textContent=detail.draft ? "Diese Änderung ist noch in Arbeit." :
    !detail.can_review ? "Eigene Änderungen können hier nicht selbst geprüft werden." :
    detail.problem ? "Eine Freigabe ist erst nach Klärung der angezeigten Abweichung möglich." :
    !detail.can_approve ? "Fachliche Freigaben sind nur für eingetragene Notarkonten möglich." :
    "Prüfe Begriffe, Quellen und Beziehungen. Deine Entscheidung wird deinem GitHub-Konto zugeordnet.";
  $("review-comment").value="";$("review-result").hidden=true;
  for(const id of ["review-terms","review-sources","review-relations"])$(id).checked=false;
  await loadReviewQueue();
}
async function submitCaseReview(event) {
  try{
    const detail=state.reviewDetail;
    if(!detail)throw new Error("Bitte zuerst eine Änderung auswählen.");
    const body=$("review-comment").value.trim();
    if(body.length<15)throw new Error("Bitte deine fachliche Begründung in mindestens 15 Zeichen festhalten.");
    const checks={terms:$("review-terms").checked,sources:$("review-sources").checked,relations:$("review-relations").checked};
    if(event==="APPROVE" && !Object.values(checks).every(Boolean))throw new Error("Bitte zuerst Begriffe, Quellen und Beziehungen als geprüft markieren.");
    const result=await api(`/api/reviews/${detail.number}/review`,{head_sha:detail.head_sha,event,body,checks});
    $("review-result").href=result.url;$("review-result").hidden=false;
    notice(event==="APPROVE" ? "Fachliche Freigabe in GitHub dokumentiert." : "Änderungswunsch in GitHub dokumentiert.","success");
  }catch(error){notice(error.message,"error");}
}
async function beginBranch(purpose="case") {
  if(state.dirty) throw new Error("Bitte ungespeicherte Änderungen vor einem neuen Arbeitszweig prüfen.");
  const result=await api("/api/start-branch",{purpose,case:purpose==="case" ? state.current.slug : ""});state.branch=result.branch;state.purpose=result.purpose || purpose;state.activeCase=result.case || "";refreshBranch();
  if(purpose==="vocabulary") await loadVocabulary(true);
  else await loadCase(state.current.slug);
  notice("Änderung begonnen. Du bearbeitest jetzt deinen eigenen Arbeitszweig.","success");
}
async function loadDrafts() {
  if(state.branch!=="main")return;
  const drafts=await api("/api/drafts");state.drafts=drafts;
  const root=$("draft-list");root.replaceChildren();
  drafts.forEach(draft=>{
    const title=draft.purpose==="vocabulary" ? "Gemeinsame Begriffe" : draft.case ? state.cases.find(item=>item.slug===draft.case)?.title || draft.case : "Begonnener Fallentwurf";
    const button=element("button",`${title} weiterbearbeiten`);button.type="button";
    if(!draft.case)button.title="Noch keine fachliche Änderung gespeichert";
    button.addEventListener("click",()=>resumeDraft(draft).catch(error=>notice(error.message,"error")));
    root.append(button);
  });
  refreshBranch();
}
async function resumeDraft(draft) {
  if(state.dirty || state.branch!=="main")throw new Error("Bitte die laufende Änderung zuerst abschließen.");
  const result=await api("/api/drafts/resume",{branch:draft.branch,case:state.current.slug});
  state.branch=result.branch;state.purpose=result.purpose;state.activeCase=result.case || "";refreshBranch();
  if(result.purpose==="vocabulary") {await loadVocabulary(true);setView("vokabular");}
  else {await loadCase(result.case);setView("bausteine");}
  notice("Gespeicherten Entwurf wieder geöffnet. Du kannst die Änderung weiterbearbeiten oder zur Prüfung geben.","success");
}
async function leaveDraft() {
  if(state.dirty && !window.confirm("Ungespeicherte Eingaben verwerfen? Bereits auf GitHub gespeicherte Änderungen bleiben erhalten."))return;
  const slug=state.current.slug;
  await api("/api/drafts/leave",{});
  state.branch="main";state.purpose="case";state.activeCase="";state.dirty=false;
  state.vocabulary=null;
  await loadCase(slug);
  await loadDrafts();
  notice("Entwurf abgelegt. Du kannst ihn unter „Meine Arbeitsentwürfe“ wieder öffnen.","success");
}
const vocabularyKinds={class:"Begriffsklasse",object_property:"Verbindung",datatype_property:"Merkmal"};
function selectedTerm(){return state.vocabulary?.terms.find(item=>item.id===state.vocabSelected);}
async function loadVocabulary(force=false){
  if(state.dirty && force)throw new Error("Bitte offene Änderungen zuerst speichern.");
  if(!state.vocabulary || force){state.vocabulary=await api("/api/vocabulary");state.vocabSelected=state.vocabulary.terms[0]?.id || null;state.vocabEditing=false;state.vocabNew=false;}
  renderVocabulary();
  if((force || !state.vocabularyImpact) && !state.impactLoading)loadVocabularyImpact().catch(error=>{state.impactError=error.message;state.impactLoading=false;renderVocabularyImpact();});
  if(state.view==="vokabular")notice("Gemeinsame Begriffe geladen. Wähle einen Begriff, um seine fachliche Bedeutung zu lesen.","quiet");
}
async function loadVocabularyImpact(){
  state.impactLoading=true;state.impactError="";renderVocabularyImpact();
  try{
    const result=await api("/api/vocabulary/impact");
    if(result.case_count!==20 || !result.terms)throw new Error("Der Fallabgleich ist unvollständig.");
    state.vocabularyImpact=result;
  }catch(error){state.impactError=error.message;throw error;}
  finally{state.impactLoading=false;renderVocabularyImpact();}
}
function renderVocabularyImpact(){
  const root=$("vocab-impact-content");if(!root)return;root.replaceChildren();
  const term=selectedTerm();
  if(!term){root.append(element("p","Wähle zuerst einen Begriff aus.","empty"));return;}
  if(state.impactLoading){root.append(element("p","Verwendung im aktuellen Katalogstand wird ermittelt …","empty"));return;}
  if(state.impactError){root.append(element("p","Die Verwendung konnte nicht geladen werden: "+state.impactError,"review-problem"));return;}
  if(!state.vocabularyImpact){root.append(element("p","Die Verwendung wurde noch nicht geladen.","empty"));return;}
  const records=state.vocabularyImpact.terms[term.id] || [];
  const total=records.reduce((sum,item)=>sum+item.count,0);
  root.append(element("strong",records.length===0 ? "Noch in keinem Fallmodul verwendet" : `${records.length} von 20 Fällen · ${total} technische Verwendungen`,"impact-summary"));
  const sha=state.vocabularyImpact.source_ref;
  root.append(element("p",/^[0-9a-f]{40}$/.test(sha) ? `Berechnet aus GitHub main, Commit ${sha.slice(0,8)}.` : "Berechnet aus den lokalen Turtle-Dateien.","impact-source"));
  root.append(element("p","Gezählt werden Klassen und Eigenschaften im Fachgraphen. Diese Übersicht ersetzt keine notarielle Bewertung der Folgen.","context-help"));
  if(records.length){
    const list=element("div",undefined,"impact-cases");
    records.sort((a,b)=>(state.cases.find(item=>item.slug===a.slug)?.title || a.slug).localeCompare(state.cases.find(item=>item.slug===b.slug)?.title || b.slug,"de"));
    records.forEach(item=>{
      const title=state.cases.find(entry=>entry.slug===item.slug)?.title || item.slug;
      const button=element("button",undefined,"impact-case");button.type="button";
      button.append(element("span",title),element("small",`${item.count} ${item.count===1 ? "Verwendung" : "Verwendungen"} · Fall öffnen →`));
      button.addEventListener("click",()=>loadCase(item.slug).catch(error=>notice(error.message,"error")));
      list.append(button);
    });
    root.append(list);
  }
}
function vocabularyReference(value){
  if(!value)return "";
  if(value==="skos:Concept")return "Allgemeiner Fachbegriff";
  const datatypes={"xsd:string":"Text","xsd:boolean":"Ja oder Nein","xsd:integer":"Ganze Zahl","xsd:date":"Datum","xsd:dateTime":"Datum und Uhrzeit","xsd:anyURI":"Webadresse"};
  if(datatypes[value])return datatypes[value];
  if(value.startsWith("n8:"))return state.vocabulary.terms.find(item=>item.id===value.slice(3))?.label || value;
  return value;
}
function renderVocabulary(updateForm=true){
  if(!state.vocabulary)return;
  const root=$("vocab-list");root.replaceChildren();
  const query=$("vocab-search").value.trim().toLocaleLowerCase("de");
  const terms=state.vocabulary.terms.filter(item=>!query || (item.label+" "+item.id+" "+item.comment).toLocaleLowerCase("de").includes(query));
  const headings={class:"Begriffsklassen",object_property:"Verbindungen",datatype_property:"Merkmale"};
  for(const kind of ["class","object_property","datatype_property"]){
    const matches=terms.filter(item=>item.kind===kind).sort((a,b)=>a.label.localeCompare(b.label,"de"));
    if(!matches.length)continue;
    root.append(element("h4",headings[kind]));
    matches.forEach(item=>{
      const button=element("button",item.label,"vocab-item"+(item.id===state.vocabSelected?" active":""));button.type="button";
      button.append(element("small",item.id));button.addEventListener("click",()=>{state.vocabSelected=item.id;state.vocabEditing=false;state.vocabNew=false;renderVocabulary();});root.append(button);
    });
  }
  if(!terms.length)root.append(element("p","Kein Begriff gefunden.","empty"));
  if(updateForm)renderVocabularyDetail();
}
function option(select,value,label){const item=element("option",label);item.value=value;select.append(item);}
function setVocabularyOptions(term){
  const classes=state.vocabulary.terms.filter(item=>item.kind==="class").sort((a,b)=>a.label.localeCompare(b.label,"de"));
  const choices=[["","Keine Angabe"],["skos:Concept","Allgemeiner Fachbegriff"],...classes.map(item=>["n8:"+item.id,item.label])];
  for(const id of ["vocab-parent","vocab-domain","vocab-range"]){
    const select=$(id);select.replaceChildren();
    const entries=id==="vocab-range" && term.kind==="datatype_property" ? [["","Keine Angabe"],...["string","boolean","integer","date","dateTime","anyURI"].map(name=>["xsd:"+name,name])] : choices;
    entries.forEach(([value,label])=>option(select,value,label));
    select.value=term[id.replace("vocab-","")] || "";
  }
  for(const [id,hidden] of [["vocab-parent",term.kind!=="class"],["vocab-domain",term.kind==="class"],["vocab-range",term.kind==="class"]]){
    $(id).hidden=hidden;$(id).previousElementSibling.hidden=hidden;
  }
}
function renderVocabularyDetail(){
  const term=selectedTerm(), read=$("vocab-read");read.replaceChildren();
  $("vocab-form").hidden=!state.vocabEditing;
  $("vocab-edit").hidden=!term || !state.ontologyMaintainer || state.vocabEditing || (state.branch!=="main" && state.purpose!=="vocabulary");
  if(!term){$("vocab-title").textContent="Begriff auswählen";renderVocabularyImpact();return;}
  $("vocab-title").textContent=term.label;
  if(!state.vocabEditing){
    read.append(element("span",vocabularyKinds[term.kind],"node-meta"));
    const facts=[["Erläuterung",term.comment],["Oberklasse",term.parent],["Gilt für",term.domain],["Ziel oder Datentyp",term.range]];
    facts.filter(([,value])=>value).forEach(([name,value])=>{const box=element("div",undefined,"node-fact");box.append(element("strong",name),element("p",name==="Erläuterung"?value:vocabularyReference(value)));read.append(box);});
    read.append(element("p","Kennung: "+term.id,"node-provenance"));
    renderVocabularyImpact();
    return;
  }
  $("vocab-id").value=term.id;$("vocab-id").readOnly=!state.vocabNew;
  $("vocab-kind").value=term.kind;$("vocab-kind").disabled=!state.vocabNew;
  $("vocab-label").value=term.label;$("vocab-comment").value=term.comment;
  setVocabularyOptions(term);
  renderVocabularyImpact();
}
async function editVocabulary(newTerm=false){
  if(!state.ontologyMaintainer)throw new Error("Vokabularpflege ist nur für eingetragene Ontologie-Maintainer möglich.");
  const selected=state.vocabSelected;
  if(state.branch==="main")await beginBranch("vocabulary");
  if(state.purpose!=="vocabulary")throw new Error("Bitte die laufende Falländerung zuerst zur Prüfung einreichen.");
  if(selected && state.vocabulary.terms.some(item=>item.id===selected))state.vocabSelected=selected;
  if(newTerm){
    let index=1;while(state.vocabulary.terms.some(item=>item.id===`NeuerBegriff${index}`))index++;
    const term={id:`NeuerBegriff${index}`,kind:"class",label:"Neuer Begriff",comment:"",parent:"",domain:"",range:""};
    state.vocabulary.terms.push(term);state.vocabSelected=term.id;state.vocabNew=true;dirty();
  }else state.vocabNew=false;
  state.vocabEditing=true;renderVocabulary();
}
async function submitVocabulary(){
  try{
    if(state.dirty)throw new Error("Bitte zuerst die Änderung speichern.");
    const result=await api("/api/vocabulary/review",{reason:$("vocab-reason").value,source:$("vocab-source").value});
    $("vocab-pr-link").href=result.url;$("vocab-pr-link").hidden=false;
    state.branch=result.branch;state.purpose=result.purpose;state.vocabulary=null;await loadVocabulary(true);refreshBranch();
    notice("Vokabularänderung zur notariellen Fachprüfung eingereicht.","success");
  }catch(error){notice(error.message,"error");}
}
function setView(view) {
  if(state.dirty && (view==="vokabular") !== (state.view==="vokabular")) {notice("Bitte zuerst die offenen Änderungen speichern.","error");return;}
  state.view=view;
  document.body.classList.toggle("review-mode",view==="fachpruefung" || view==="vokabular");
  if(view==="verbindungen" && state.current){renderRelationContext();fillNodeSelects();renderGraph();}
  if(view==="fachpruefung" && state.user)loadReviewQueue().catch(error=>notice(error.message,"error"));
  if(view==="vokabular" && !state.vocabulary)loadVocabulary().catch(error=>notice(error.message,"error"));
  if(state.current) window.history.replaceState(null,"",`?case=${encodeURIComponent(state.current.slug)}#${view}`);
  document.querySelectorAll("[data-view]").forEach(panel=>{panel.hidden=panel.dataset.view!==view;});
  document.querySelectorAll("[data-view-button]").forEach(button=>{
    if(button.dataset.viewButton===view) button.setAttribute("aria-current","page");
    else button.removeAttribute("aria-current");
  });
  refreshBranch();
}
async function loadCase(slug) {
  if (state.dirty && !window.confirm("Ungespeicherte Änderungen verwerfen und anderen Fall öffnen?")) {
    $("case-select").value = state.current.slug;
    return;
  }
  state.current = await api("/api/cases/" + encodeURIComponent(slug));
  const degree=new Map(state.current.nodes.map(node=>[node.id,0]));
  state.current.edges.forEach(edge=>{degree.set(edge.from,(degree.get(edge.from)||0)+1);degree.set(edge.to,(degree.get(edge.to)||0)+1);});
  const usefulness=node=>(node.question ? 20 : 0)+(node.detail ? 20 : 0)+(degree.get(node.id)||0);
  state.selected = [...state.current.nodes].sort((a,b)=>usefulness(b)-usefulness(a))[0]?.id || null;
  state.nodeEditing = false;
  state.dirty = false;
  $("overview-editor").hidden=true;
  $("edit-overview").textContent="Beschreibung und Quellen bearbeiten";
  $("review-link").hidden=true;
  $("turtle-details").open=false;
  $("case-history").open=false;state.caseHistory=null;state.historyTarget="";$("history-preview").hidden=true;
  $("turtle-content").textContent="Beim Öffnen wird der aktuelle Stand geladen.";
  setView("fall");
  $("case-title").textContent = state.current.title;
  $("summary").value = state.current.summary;
  $("sources").value = state.current.sources.join("\n");
  $("nac-source").href = state.current.nac_source;
  $("bpmn-source").href = state.current.bpmn_source;
  $("case-select").value=slug;
  renderCaseList();renderOverview();
  renderAll();
  notice(state.hosted && state.branch!=="main" && state.purpose==="case" && !caseEditable() ? "Dieser Fall ist im Lesemodus. Lege den geöffneten Entwurf ab, um hier eine Änderung zu beginnen." : "Fall geladen. Inhalte, Verbindungen und Quellen sind in den Arbeitsbereichen sichtbar.","quiet");
}
function renderAll() {
  renderGraph();
  renderNodes();
  renderNodeForm();
  renderEdges();
  renderRelationContext();
  fillNodeSelects();
}
function renderRelationContext() {
  const root=$("relation-context");root.replaceChildren();
  const node=state.current.nodes.find(item=>item.id===state.selected);
  if(!node){root.append(element("p","Bitte einen Baustein wählen.","empty"));return;}
  const panel=element("div",undefined,"relation-focus-card");
  panel.append(element("p","AUSGEWÄHLTER BAUSTEIN","eyebrow"),element("h3",node.label));
  const type=groups.find(([key])=>key===node.category)?.[1] || "Baustein";
  panel.append(element("p",type + (node.question ? " · " + node.question : ""),"relation-question"));
  root.append(panel);
  const relevant=state.current.edges.filter(edge=>edge.from===node.id || edge.to===node.id);
  const heading=element("h3",`Direkte Verbindungen · ${relevant.length}`);root.append(heading);
  if(!relevant.length){root.append(element("p","Für diesen Baustein sind noch keine direkten Verbindungen erfasst.","empty"));return;}
  relevant.forEach(edge=>{
    const other=edge.from===node.id ? edge.to : edge.from;
    const outgoing=edge.from===node.id;
    const row=element("div",undefined,"relation-card");
    row.append(element("span",outgoing ? "Geht von diesem Baustein aus" : "Führt zu diesem Baustein","relation-direction"));
    row.append(element("strong",relations[edge.type] || edge.type));
    const button=element("button",nodeLabel(other),"relation-target");button.type="button";
    button.addEventListener("click",()=>{state.selected=other;renderAll();});
    row.append(button);root.append(row);
  });
}
function renderGraph() {
  const canvas = $("graph");
  canvas.replaceChildren();
  const visible = new Set(state.current.nodes.map(node => node.id));
  if (state.graphFocused && state.selected) {
    visible.clear();visible.add(state.selected);
    state.current.edges.forEach(edge => {
      if (edge.from === state.selected) visible.add(edge.to);
      if (edge.to === state.selected) visible.add(edge.from);
    });
  }
  const ordered = groups.map(([key]) => state.current.nodes.filter(node => visible.has(node.id) && node.category === key).sort((a,b) => a.id.localeCompare(b.id)));
  const maxRows = Math.max(...ordered.map(group => group.length), 1);
  const width = 1330, height = Math.max(185, 105 + maxRows * 66);
  canvas.setAttribute("viewBox", `0 0 ${width} ${height}`);
  canvas.style.height = height + "px";
  const defs = svg("defs");
  const marker = svg("marker", {id:"arrow",markerWidth:"8",markerHeight:"8",refX:"7",refY:"4",orient:"auto"});
  marker.append(svg("path", {d:"M 0 0 L 8 4 L 0 8 z",fill:"#8daab3"}));
  defs.append(marker);
  canvas.append(defs);
  const positions = new Map();
  ordered.forEach((list, column) => {
    const x = 20 + column * 263;
    const heading = svg("text",{x, y:28, class:"graph-heading"});
    heading.textContent = groups[column][1] + " (" + list.length + ")";
    canvas.append(heading);
    list.forEach((node,row) => positions.set(node.id,{x,y:52 + row * 66,column}));
  });
  state.current.edges.filter(edge => visible.has(edge.from) && visible.has(edge.to)).forEach(edge => {
    const a = positions.get(edge.from), b = positions.get(edge.to);
    if (!a || !b) return;
    const x1 = a.x + 230, y1 = a.y + 19, x2 = b.x, y2 = b.y + 19;
    const bend = Math.max(35, Math.abs(x2-x1) / 2);
    const path = svg("path",{d:`M ${x1} ${y1} C ${x1+bend} ${y1}, ${x2-bend} ${y2}, ${x2} ${y2}`,class:"graph-edge","marker-end":"url(#arrow)"});
    const title = svg("title"); title.textContent = nodeLabel(edge.from) + " " + relations[edge.type] + " " + nodeLabel(edge.to);
    path.append(title); canvas.append(path);
  });
  ordered.forEach((list,column) => list.forEach(node => {
    const {x,y} = positions.get(node.id);
    const group = svg("g",{class:"graph-node" + (state.selected === node.id ? " selected" : ""),tabindex:"0",role:"button","aria-label":node.label});
    group.append(svg("rect",{x,y,width:230,height:39,rx:7,fill:groups[column][2],stroke:groups[column][3]}));
    const text = svg("text",{x:x+10,y:y+24});
    text.textContent = node.label.length > 32 ? node.label.slice(0,30) + "…" : node.label;
    group.append(text);
    const title = svg("title"); title.textContent = node.label; group.append(title);
    group.addEventListener("click",() => selectNode(node.id));
    group.addEventListener("keydown",event => {if(event.key === "Enter" || event.key === " "){event.preventDefault();selectNode(node.id);}});
    canvas.append(group);
  }));
}
function renderNodes() {
  const root = $("node-list"); root.replaceChildren();
  const query = $("node-search").value.trim().toLocaleLowerCase("de");
  const category = $("node-category").value;
  let count = 0;
  groups.forEach(([key,title]) => {
    const list = state.current.nodes.filter(node => node.category === key && (!category || category === key) && (!query || (node.label + " " + node.id + " " + node.question).toLocaleLowerCase("de").includes(query))).sort((a,b) => a.label.localeCompare(b.label,"de"));
    if (!list.length) return;
    count += list.length;
    const box = element("div",undefined,"node-group");
    box.append(element("h3",title + " · " + list.length));
    list.forEach(node => {
      const button = element("button",node.label,"node-row" + (state.selected === node.id ? " active" : ""));
      button.type = "button";
      button.addEventListener("click",() => selectNode(node.id));
      box.append(button);
    });
    root.append(box);
  });
  $("node-count").textContent = `${count} von ${state.current.nodes.length} Bausteinen`;
  if (!count) root.append(element("p","Keine Bausteine gefunden. Suche oder Art ändern.","empty"));
}
function selectNode(id) {
  state.selected = id;
  state.nodeEditing = false;
  setView("bausteine");
  renderNodes(); renderNodeForm(); renderGraph(); renderRelationContext(); fillNodeSelects();
}
function field(root, label, value, onChange, multiline = false, hint = "") {
  const wrap = element("div");
  const caption = element("label",label + (hint ? " · " + hint : ""));
  const control = element(multiline ? "textarea" : "input");
  control.value = value ?? "";
  control.disabled=!caseEditable();
  if (multiline) control.rows = 3;
  control.addEventListener("input",() => {onChange(control.value);dirty();});
  caption.append(control); wrap.append(caption); root.append(wrap);
  return control;
}
function renderNodeForm() {
  const root = $("node-form"); root.replaceChildren();
  const read = $("node-read"); read.replaceChildren();
  const node = state.current.nodes.find(item => item.id === state.selected);
  root.hidden = !node || !state.nodeEditing;
  read.hidden = !!node && state.nodeEditing;
  $("edit-node").hidden = !node;
  $("edit-node").textContent = state.nodeEditing ? "Lesen" : "Bearbeiten";
  $("delete-node").hidden = !node || !state.nodeEditing || !node.id.startsWith("local.");
  $("detail-title").textContent = node ? node.label : "Baustein auswählen";
  if (!node) {read.append(element("p","Wähle links einen Baustein oder klicke im Fachgraphen darauf.","empty"));return;}
  const type=groups.find(([key])=>key===node.category)?.[1] || "Baustein";
  read.append(element("p",type + " · " + (node.id.startsWith("local.") ? "Ergänzung in diesem Repository" : "Aus der NaC-Vorlage übernommen"),"node-meta"));
  const facts=[
    ["Fachfrage",node.question],
    ["Abschnitt der Vorlage",node.section],
    ["Erläuterung",node.detail],
    ["Dokumentquelle",node.document_source]
  ];
  let shown=0;
  for(const [label,value] of facts){if(!value) continue; const block=element("div",undefined,"node-fact");block.append(element("strong",label),element("p",value));read.append(block);shown++;}
  if(node.options.length){
    const block=element("div",undefined,"node-fact");block.append(element("strong","Auswahlwerte der NaC-Vorlage"));
    const details=element("details",undefined,"node-options");details.append(element("summary",`${node.options.length} technische Werte anzeigen`));
    details.append(element("p","Für diese Kennungen fehlen derzeit fachlich geprüfte, lesbare Bezeichnungen."));
    const list=element("ul");node.options.forEach(option=>list.append(element("li",option)));details.append(list);block.append(details);read.append(block);shown++;
  }
  if(node.contains_personal_data===true){const block=element("div",undefined,"node-fact");block.append(element("strong","Datenschutz"),element("p","Dieser Baustein kann Personendaten betreffen."));read.append(block);shown++;}
  if(!shown) read.append(element("p","Zu diesem Baustein sind noch keine weiteren fachlichen Angaben erfasst.","empty"));
  if(node.owner_role || node.privacy_class || node.required_for.length){
    const extra=element("details",undefined,"node-provenance");extra.append(element("summary","Weitere Angaben aus der NaC-Vorlage"));
    if(node.owner_role)extra.append(element("p","Rollenkennung: "+node.owner_role));
    if(node.privacy_class)extra.append(element("p","Datenschutzkennung: "+node.privacy_class));
    if(node.required_for.length)extra.append(element("p","Benötigt für: "+node.required_for.join(", ")));
    read.append(extra);
  }
  const provenance=element("details",undefined,"node-provenance");provenance.append(element("summary","Technische Herkunft und Kennung"));
  provenance.append(element("p","Kennung: " + node.id),element("p","Quellstatus: " + (node.status || "nicht angegeben")));
  read.append(provenance);
  const id=field(root,"Kennung",node.id,()=>{});id.readOnly=true;
  const label = field(root,"Bezeichnung",node.label,value => {
    node.label=value; $("detail-title").textContent=value;renderNodes();renderGraph();renderEdges();renderRelationContext();fillNodeSelects();
  });
  label.maxLength=2000;
  const categoryWrap=element("div");
  const categoryLabel=element("label","Bausteintyp");
  const categorySelect=element("select");
  groups.forEach(([key,title])=>{const option=element("option",title);option.value=key;categorySelect.append(option);});
  categorySelect.value=node.category;
  categorySelect.disabled=!caseEditable();
  categorySelect.addEventListener("change",()=>{node.category=categorySelect.value;dirty();renderNodes();renderGraph();});
  categoryLabel.append(categorySelect);categoryWrap.append(categoryLabel);root.append(categoryWrap);
  const status=field(root,node.id.startsWith("local.") ? "Pflegestatus des lokalen Entwurfs" : "Status der NaC-Vorlage",node.status,value=>node.status=value);
  if (!node.id.startsWith("local.")) status.readOnly=true;
  field(root,"Offene Fachfrage",node.question,value=>node.question=value,true);
  field(root,"Abschnitt der Vorlage",node.section,value=>node.section=value);
  field(root,"Fachliche Erläuterung",node.detail,value=>node.detail=value,true);
  const advanced=element("details",undefined,"advanced-fields");
  advanced.append(element("summary","Weitere Angaben für die Datenpflege"));
  root.append(advanced);
  const grid=element("div",undefined,"grid");advanced.append(grid);
  field(grid,"Verantwortliche Rolle",node.owner_role,value=>node.owner_role=value);
  field(grid,"Datenschutzklasse",node.privacy_class,value=>node.privacy_class=value);
  field(advanced,"Benötigt für",node.required_for.join("\n"),value=>node.required_for=value.split("\n").map(v=>v.trim()).filter(Boolean),true,"eine Angabe pro Zeile");
  field(advanced,"Entscheidungsoptionen",node.options.join("\n"),value=>node.options=value.split("\n").map(v=>v.trim()).filter(Boolean),true,"eine Option pro Zeile");
  field(advanced,"Dokumentquelle",node.document_source,value=>node.document_source=value);
  const privacy=element("label","Kann Personendaten enthalten?");
  const select=element("select");
  select.disabled=!caseEditable();
  [["","Keine Angabe"],["true","Ja"],["false","Nein"]].forEach(([value,text])=>{const option=element("option",text);option.value=value;select.append(option);});
  select.value=node.contains_personal_data === null ? "" : String(node.contains_personal_data);
  select.addEventListener("change",()=>{node.contains_personal_data=select.value === "" ? null : select.value === "true";dirty();});
  privacy.append(select);advanced.append(privacy);
  $("delete-node").disabled=!caseEditable();
}
function fillNodeSelects() {
  for (const id of ["edge-from","edge-to"]) {
    const select=$(id), prior=select.value; select.replaceChildren();
    state.current.nodes.forEach(node=>{const option=element("option",node.label);option.value=node.id;select.append(option);});
    if (state.current.nodes.some(node=>node.id===prior)) select.value=prior;
  }
  const focus=$("graph-focus");focus.replaceChildren();
  state.current.nodes.forEach(node=>{const option=element("option",node.label);option.value=node.id;focus.append(option);});
  focus.value=state.selected || "";
}
function renderEdges() {
  const root=$("edge-list");root.replaceChildren();
  state.current.edges.forEach((edge,index)=>{
    const row=element("div",undefined,"edge-row");
    row.append(element("span",nodeLabel(edge.from)));
    row.append(element("span",relations[edge.type],"edge-type"));
    row.append(element("span",nodeLabel(edge.to)));
    const remove=element("button","Entfernen","danger");remove.type="button";
    remove.disabled=!caseEditable();
    remove.addEventListener("click",()=>{state.current.edges.splice(index,1);dirty();renderEdges();renderGraph();});
    row.append(remove);root.append(row);
  });
}
async function save() {
  try {
    if (state.branch === "main") throw new Error("Bitte zuerst „Änderung beginnen“ wählen.");
    if(state.view!=="vokabular" && !caseEditable())throw new Error("Dieser Entwurf gehört zu einem anderen Fall. Lege ihn zuerst ab.");
    const vocabulary=state.view==="vokabular";
    if((vocabulary && state.purpose!=="vocabulary") || (!vocabulary && state.purpose!=="case"))throw new Error("Dieser Arbeitszweig gehört zu einem anderen Arbeitsbereich.");
    const result=await api(vocabulary ? "/api/vocabulary/preview" : "/api/cases/" + state.current.slug + "/preview",vocabulary ? state.vocabulary : state.current);
    $("preview-description").textContent=vocabulary ? "Diese Änderungen werden im gemeinsamen Turtle-Vokabular gespeichert. Die notarielle Freigabe erfolgt anschließend im Pull Request." : "Diese fachlichen Änderungen werden in Turtle und in der daraus erzeugten Leseseite gespeichert. Die notarielle Freigabe erfolgt anschließend im Pull Request.";
    const list=$("preview-list");list.replaceChildren();
    result.changes.forEach(change=>list.append(element("li",change)));
    if(!result.changed) list.append(element("li","Keine fachliche Änderung erkannt."));
    $("confirm-save").disabled=!result.changed;
    $("change-preview").showModal();
  } catch (error) {notice(error.message,"error");}
}
async function confirmSave() {
  try {
    const vocabulary=state.view==="vokabular";
    const result=await api(vocabulary ? "/api/vocabulary/save" : "/api/cases/" + state.current.slug + "/save",vocabulary ? state.vocabulary : state.current);
    const subject=vocabulary ? state.vocabulary : state.current;
    subject.revision=result.revision;state.dirty=false;
    if(result.expected_ref) subject.expected_ref=result.expected_ref;
    if(result.changed && !vocabulary){
      state.caseIndex=null;state.caseIndexPromise=null;
      if($("case-index-query").value.trim().length>=2)loadCaseIndex().catch(()=>{});
    }
    $("change-preview").close();
    notice(result.changed ? (vocabulary ? "Gemeinsames Turtle-Vokabular gespeichert. Reiche die Änderung nun zur Fachprüfung ein." : "Turtle und Mermaid-Seite gespeichert. Als Nächstes die Änderung im Pull Request fachlich prüfen lassen.") : "Keine Änderungen zu speichern.","success");
  } catch (error) {notice(error.message,"error");}
}
async function submitReview() {
  try {
    if (state.dirty) throw new Error("Bitte die Änderung zuerst speichern und prüfen.");
    const result=await api("/api/cases/" + state.current.slug + "/review",{
      reason:$("change-reason").value,source:$("change-source").value
    });
    $("review-link").href=result.url;
    $("review-link").hidden=false;
    if(result.branch){
      const slug=state.current.slug;
      state.branch=result.branch;state.activeCase="";refreshBranch();
      await loadCase(slug);
      setView("pruefung");
      $("review-link").href=result.url;$("review-link").hidden=false;
      loadDrafts().catch(error=>notice(error.message,"error"));
    }
    notice("Pull Request eingereicht. Jetzt folgt die notarielle Fachprüfung.","success");
  } catch(error){notice(error.message,"error");window.scrollTo({top:0,behavior:"smooth"});}
}
async function init() {
  try {
    const initialView=window.location.hash.slice(1);
    const requestedCase=new URLSearchParams(window.location.search).get("case");
    const status=await api("/api/status");state.token=status.token;state.branch=status.branch;state.purpose=status.purpose || "case";state.activeCase=status.case || "";state.hosted=!!status.hosted;state.ontologyMaintainer=!!status.ontology_maintainer;refreshBranch();
    if(status.user){state.user=status.user;state.notaryReviewer=!!status.notary_reviewer;$("session-user").textContent=status.user;$("logout").hidden=false;$("review-nav").hidden=false;}
    $("logout").addEventListener("click",async()=>{try{await api("/api/logout",{});window.location.assign("/login");}catch(error){notice(error.message,"error");}});
    $("leave-draft").addEventListener("click",()=>leaveDraft().catch(error=>notice(error.message,"error")));
    const cases=await api("/api/cases");state.cases=cases;
    cases.forEach(item=>{const option=element("option",item.title);option.value=item.slug;$("case-select").append(option);});
    for(const [key,label] of Object.entries(relations)){const option=element("option",label);option.value=key;$("edge-type").append(option);}
    $("case-select").addEventListener("change",event=>loadCase(event.target.value).catch(error=>notice(error.message,"error")));
    $("case-search").addEventListener("input",renderCaseList);
    $("case-history").addEventListener("toggle",()=>{if($("case-history").open)loadCaseHistory().catch(error=>notice(error.message,"error"));});
    $("history-apply").addEventListener("click",applyCaseHistory);
    $("case-index-query").addEventListener("input",()=>{renderCaseIndex();if($("case-index-query").value.trim().length>=2)loadCaseIndex().catch(()=>{});});
    $("vocab-search").addEventListener("input",renderVocabulary);
    $("vocab-impact-refresh").addEventListener("click",()=>loadVocabularyImpact().catch(error=>notice(error.message,"error")));
    $("vocab-edit").addEventListener("click",()=>editVocabulary().catch(error=>notice(error.message,"error")));
    $("vocab-add").addEventListener("click",()=>editVocabulary(true).catch(error=>notice(error.message,"error")));
    $("vocab-submit").addEventListener("click",submitVocabulary);
    for(const [id,key] of [["vocab-label","label"],["vocab-comment","comment"],["vocab-parent","parent"],["vocab-domain","domain"],["vocab-range","range"]]){
      $(id).addEventListener("input",event=>{const term=selectedTerm();if(!term)return;term[key]=event.target.value;dirty();if(key==="label"){$("vocab-title").textContent=term.label;renderVocabulary(false);}});
    }
    $("vocab-id").addEventListener("input",event=>{const term=selectedTerm();if(!term || !state.vocabNew)return;term.id=event.target.value;state.vocabSelected=term.id;dirty();renderVocabulary(false);});
    $("vocab-kind").addEventListener("change",event=>{const term=selectedTerm();if(!term || !state.vocabNew)return;term.kind=event.target.value;term.parent="";term.domain="";term.range="";dirty();renderVocabulary();});
    $("node-search").addEventListener("input",renderNodes);
    $("node-category").addEventListener("change",renderNodes);
    document.querySelectorAll("[data-view-button]").forEach(button=>button.addEventListener("click",()=>setView(button.dataset.viewButton)));
    document.querySelectorAll("[data-go-view]").forEach(button=>button.addEventListener("click",()=>setView(button.dataset.goView)));
    $("graph-scope").addEventListener("click",()=>{
      state.graphFocused=!state.graphFocused;
      $("graph-scope").setAttribute("aria-pressed",String(state.graphFocused));
      $("graph-scope").textContent=state.graphFocused ? "Alle Bausteine zeigen" : "Auswahl und Nachbarn zeigen";
      renderGraph();
    });
    $("graph-focus").addEventListener("change",event=>{state.selected=event.target.value;renderAll();});
    $("summary").addEventListener("input",event=>{state.current.summary=event.target.value;renderOverview();dirty();});
    $("sources").addEventListener("input",event=>{state.current.sources=event.target.value.split("\n").map(v=>v.trim()).filter(Boolean);renderOverview();dirty();});
    $("edit-overview").addEventListener("click",async()=>{
      try{
        if(state.branch==="main") await beginBranch();
        if(!caseEditable())throw new Error("Dieser Entwurf gehört zu einem anderen Fall. Lege ihn zuerst ab.");
        $("overview-editor").hidden=!$("overview-editor").hidden;
        $("edit-overview").textContent=$("overview-editor").hidden ? "Beschreibung und Quellen bearbeiten" : "Bearbeitungsfelder schließen";
      }catch(error){notice(error.message,"error");}
    });
    $("edit-node").addEventListener("click",async()=>{
      try{
        const selected=state.selected;
        if(!state.nodeEditing && state.branch==="main") await beginBranch();
        if(!caseEditable())throw new Error("Dieser Entwurf gehört zu einem anderen Fall. Lege ihn zuerst ab.");
        state.selected=selected;
        state.nodeEditing=!state.nodeEditing;
        setView("bausteine");
        renderNodes();renderNodeForm();renderGraph();
      }catch(error){notice(error.message,"error");}
    });
    $("add-node").addEventListener("click",()=>{
      let counter=1;while(state.current.nodes.some(node=>node.id===`local.${counter}`)) counter++;
      const node={id:`local.${counter}`,category:"required_information",label:"Neuer Baustein",status:"local-draft",question:"",section:"",detail:"",owner_role:"",privacy_class:"",document_source:"",contains_personal_data:null,required_for:[],options:[]};
      state.current.nodes.push(node);dirty();renderAll();selectNode(node.id);state.nodeEditing=true;renderNodeForm();
    });
    $("delete-node").addEventListener("click",()=>{
      const node=state.current.nodes.find(item=>item.id===state.selected);
      if (!node || !node.id.startsWith("local.") || !window.confirm(`„${node.label}“ und seine Beziehungen entfernen?`)) return;
      state.current.nodes=state.current.nodes.filter(item=>item.id!==node.id);
      state.current.edges=state.current.edges.filter(edge=>edge.from!==node.id && edge.to!==node.id);
      state.selected=null;state.nodeEditing=false;dirty();renderAll();
    });
    $("add-edge").addEventListener("click",()=>{
      const edge={from:$("edge-from").value,type:$("edge-type").value,to:$("edge-to").value};
      if(state.current.edges.some(item=>item.from===edge.from && item.type===edge.type && item.to===edge.to)){notice("Diese Beziehung besteht bereits.","error");return;}
      state.current.edges.push(edge);dirty();renderEdges();renderGraph();
    });
    $("start-branch").addEventListener("click",async()=>{
      try{await beginBranch(state.view==="vokabular" ? "vocabulary" : "case");}
      catch(error){notice(error.message,"error");}
    });
    $("save").addEventListener("click",save);
    $("confirm-save").addEventListener("click",confirmSave);
    $("submit-review").addEventListener("click",submitReview);
    $("refresh-reviews").addEventListener("click",()=>loadReviewQueue().catch(error=>notice(error.message,"error")));
    $("request-changes").addEventListener("click",()=>submitCaseReview("REQUEST_CHANGES"));
    $("approve-review").addEventListener("click",()=>submitCaseReview("APPROVE"));
    $("turtle-details").addEventListener("toggle",async()=>{
      if(!$("turtle-details").open || !state.current) return;
      try{const result=await api("/api/cases/" + state.current.slug + "/turtle");$("turtle-content").textContent=result.turtle;}
      catch(error){$("turtle-content").textContent=error.message;}
    });
    $("vocab-turtle-details").addEventListener("toggle",async()=>{
      if(!$("vocab-turtle-details").open)return;
      try{const result=await api("/api/vocabulary/turtle");$("vocab-turtle").textContent=result.turtle;}
      catch(error){$("vocab-turtle").textContent=error.message;}
    });
    for(const id of ["close-preview","cancel-preview"]) $(id).addEventListener("click",()=>$("change-preview").close());
    window.addEventListener("beforeunload",event=>{if(state.dirty){event.preventDefault();event.returnValue="";}});
    await loadCase(cases.some(item=>item.slug===requestedCase) ? requestedCase : cases[0].slug);
    if(["fall","bausteine","verbindungen","pruefung","vokabular"].includes(initialView) || (initialView==="fachpruefung" && state.user)) setView(initialView);
    if(state.user)loadDrafts().catch(error=>notice(error.message,"error"));
  } catch(error){notice(error.message,"error");}
}
init();
