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
let state = { token: "", branch: "", current: null, cases: [], selected: null, nodeEditing: false, dirty: false, graphFocused: true, view: "fall" };

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
function refreshBranch() {
  $("branch").textContent = "Arbeitszweig: " + (state.branch || "kein Branch");
  $("start-branch").hidden = state.branch !== "main";
  $("save").disabled = state.branch === "main";
  for(const id of ["add-node","add-edge","submit-review"]) $(id).disabled=state.branch==="main";
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
async function beginBranch() {
  if(state.dirty) throw new Error("Bitte ungespeicherte Änderungen vor einem neuen Arbeitszweig prüfen.");
  const result=await api("/api/start-branch",{});state.branch=result.branch;refreshBranch();
  await loadCase(state.current.slug);
  notice("Änderung begonnen. Du bearbeitest jetzt deinen eigenen Arbeitszweig.","success");
}
function setView(view) {
  state.view=view;
  if(view==="verbindungen" && state.current){renderRelationContext();fillNodeSelects();renderGraph();}
  if(state.current) window.history.replaceState(null,"",`?case=${encodeURIComponent(state.current.slug)}#${view}`);
  document.querySelectorAll("[data-view]").forEach(panel=>{panel.hidden=panel.dataset.view!==view;});
  document.querySelectorAll("[data-view-button]").forEach(button=>{
    if(button.dataset.viewButton===view) button.setAttribute("aria-current","page");
    else button.removeAttribute("aria-current");
  });
}
async function loadCase(slug) {
  if (state.dirty && !window.confirm("Ungespeicherte Änderungen verwerfen und anderen Fall öffnen?")) {
    $("case-select").value = state.current.slug;
    return;
  }
  state.current = await api("/api/cases/" + encodeURIComponent(slug));
  const degree=new Map(state.current.nodes.map(node=>[node.id,0]));
  state.current.edges.forEach(edge=>{degree.set(edge.from,(degree.get(edge.from)||0)+1);degree.set(edge.to,(degree.get(edge.to)||0)+1);});
  state.selected = [...state.current.nodes].sort((a,b)=>(degree.get(b.id)||0)-(degree.get(a.id)||0))[0]?.id || null;
  state.nodeEditing = false;
  state.dirty = false;
  $("overview-editor").hidden=true;
  $("edit-overview").textContent="Beschreibung und Quellen bearbeiten";
  $("review-link").hidden=true;
  $("turtle-details").open=false;
  $("turtle-content").textContent="Beim Öffnen wird der aktuelle Stand geladen.";
  setView("fall");
  $("case-title").textContent = state.current.title;
  $("summary").value = state.current.summary;
  $("sources").value = state.current.sources.join("\n");
  $("nac-source").href = state.current.nac_source;
  $("case-select").value=slug;
  renderCaseList();renderOverview();
  renderAll();
  notice("Fall geladen. Inhalte, Verbindungen und Quellen sind in den Arbeitsbereichen sichtbar.","quiet");
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
      button.append(element("small",node.id));
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
  control.disabled=state.branch==="main";
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
    ["Verantwortliche Rolle",node.owner_role],
    ["Datenschutzklasse",node.privacy_class],
    ["Benötigt für",node.required_for.join(", ")],
    ["Entscheidungsoptionen",node.options.join(", ")],
    ["Dokumentquelle",node.document_source]
  ];
  let shown=0;
  for(const [label,value] of facts){if(!value) continue; const block=element("div",undefined,"node-fact");block.append(element("strong",label),element("p",value));read.append(block);shown++;}
  if(!shown) read.append(element("p","Zu diesem Baustein sind noch keine weiteren fachlichen Angaben erfasst.","empty"));
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
  categorySelect.disabled=state.branch==="main";
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
  select.disabled=state.branch==="main";
  [["","Keine Angabe"],["true","Ja"],["false","Nein"]].forEach(([value,text])=>{const option=element("option",text);option.value=value;select.append(option);});
  select.value=node.contains_personal_data === null ? "" : String(node.contains_personal_data);
  select.addEventListener("change",()=>{node.contains_personal_data=select.value === "" ? null : select.value === "true";dirty();});
  privacy.append(select);advanced.append(privacy);
  $("delete-node").disabled=state.branch==="main";
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
    remove.disabled=state.branch==="main";
    remove.addEventListener("click",()=>{state.current.edges.splice(index,1);dirty();renderEdges();renderGraph();});
    row.append(remove);root.append(row);
  });
}
async function save() {
  try {
    if (state.branch === "main") throw new Error("Bitte zuerst „Änderung beginnen“ wählen.");
    const result=await api("/api/cases/" + state.current.slug + "/preview",state.current);
    const list=$("preview-list");list.replaceChildren();
    result.changes.forEach(change=>list.append(element("li",change)));
    if(!result.changed) list.append(element("li","Keine fachliche Änderung erkannt."));
    $("confirm-save").disabled=!result.changed;
    $("change-preview").showModal();
  } catch (error) {notice(error.message,"error");}
}
async function confirmSave() {
  try {
    const result=await api("/api/cases/" + state.current.slug + "/save",state.current);
    state.current.revision=result.revision;state.dirty=false;
    if(result.expected_ref) state.current.expected_ref=result.expected_ref;
    $("change-preview").close();
    notice(result.changed ? "Turtle und Mermaid-Seite gespeichert. Als Nächstes die Änderung im Pull Request fachlich prüfen lassen." : "Keine Änderungen zu speichern.","success");
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
    if(result.branch){state.branch=result.branch;refreshBranch();}
    notice("Entwurfs-Pull-Request erstellt. Jetzt folgt die notarielle Fachprüfung.","success");
  } catch(error){notice(error.message,"error");window.scrollTo({top:0,behavior:"smooth"});}
}
async function init() {
  try {
    const initialView=window.location.hash.slice(1);
    const requestedCase=new URLSearchParams(window.location.search).get("case");
    const status=await api("/api/status");state.token=status.token;state.branch=status.branch;refreshBranch();
    if(status.user){$("session-user").textContent=status.user;$("logout").hidden=false;}
    $("logout").addEventListener("click",async()=>{try{await api("/api/logout",{});window.location.assign("/login");}catch(error){notice(error.message,"error");}});
    const cases=await api("/api/cases");state.cases=cases;
    cases.forEach(item=>{const option=element("option",item.title);option.value=item.slug;$("case-select").append(option);});
    for(const [key,label] of Object.entries(relations)){const option=element("option",label);option.value=key;$("edge-type").append(option);}
    $("case-select").addEventListener("change",event=>loadCase(event.target.value).catch(error=>notice(error.message,"error")));
    $("case-search").addEventListener("input",renderCaseList);
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
        $("overview-editor").hidden=!$("overview-editor").hidden;
        $("edit-overview").textContent=$("overview-editor").hidden ? "Beschreibung und Quellen bearbeiten" : "Bearbeitungsfelder schließen";
      }catch(error){notice(error.message,"error");}
    });
    $("edit-node").addEventListener("click",async()=>{
      try{
        const selected=state.selected;
        if(!state.nodeEditing && state.branch==="main") await beginBranch();
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
      try{await beginBranch();}
      catch(error){notice(error.message,"error");}
    });
    $("save").addEventListener("click",save);
    $("confirm-save").addEventListener("click",confirmSave);
    $("submit-review").addEventListener("click",submitReview);
    $("turtle-details").addEventListener("toggle",async()=>{
      if(!$("turtle-details").open || !state.current) return;
      try{const result=await api("/api/cases/" + state.current.slug + "/turtle");$("turtle-content").textContent=result.turtle;}
      catch(error){$("turtle-content").textContent=error.message;}
    });
    for(const id of ["close-preview","cancel-preview"]) $(id).addEventListener("click",()=>$("change-preview").close());
    window.addEventListener("beforeunload",event=>{if(state.dirty){event.preventDefault();event.returnValue="";}});
    await loadCase(cases.some(item=>item.slug===requestedCase) ? requestedCase : cases[0].slug);
    if(["fall","bausteine","verbindungen","pruefung"].includes(initialView)) setView(initialView);
  } catch(error){notice(error.message,"error");}
}
init();
