// SPDX-License-Identifier: AGPL-3.0-or-later
"use strict";

const groups = [
  ["required_information", "Angabenfragen", "#e8f2ff", "#4b77a7"],
  ["documents", "Dokumenttypen", "#eef8ee", "#4d8a55"],
  ["decisions", "Entscheidungen", "#fff4df", "#ac7a21"],
  ["gates", "Prüfgates", "#fdebec", "#b45c64"],
  ["evidence", "Nachweistypen", "#f3edff", "#8060aa"]
];
const relations = {
  erfordert: "erfordert",
  informiert: "informiert",
  blockiertBisVollstaendig: "blockiert bis vollständig",
  blockiertBisGeprueft: "blockiert bis geprüft",
  erfordertEntscheidung: "erfordert Entscheidung",
  belegtDurch: "belegt durch",
  fuellt: "füllt",
  bestimmt: "bestimmt"
};
const $ = id => document.getElementById(id);
const svgNS = "http://www.w3.org/2000/svg";
let state = { token: "", branch: "", current: null, selected: null, dirty: false, graphFocused: false };

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
}
async function loadCase(slug) {
  if (state.dirty && !window.confirm("Ungespeicherte Änderungen verwerfen und anderen Fall öffnen?")) {
    $("case-select").value = state.current.slug;
    return;
  }
  state.current = await api("/api/cases/" + encodeURIComponent(slug));
  state.selected = null;
  state.dirty = false;
  $("review-link").hidden=true;
  $("case-title").textContent = state.current.title;
  $("summary").value = state.current.summary;
  $("sources").value = state.current.sources.join("\n");
  $("nac-source").href = state.current.nac_source;
  renderAll();
  notice("Fall geladen. Wähle einen Baustein oder eine Beziehung zur Bearbeitung.");
}
function renderAll() {
  renderGraph();
  renderNodes();
  renderNodeForm();
  renderEdges();
  fillNodeSelects();
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
  renderNodes(); renderNodeForm(); renderGraph();
}
function field(root, label, value, onChange, multiline = false, hint = "") {
  const wrap = element("div");
  const caption = element("label",label + (hint ? " · " + hint : ""));
  const control = element(multiline ? "textarea" : "input");
  control.value = value ?? "";
  if (multiline) control.rows = 3;
  control.addEventListener("input",() => {onChange(control.value);dirty();});
  caption.append(control); wrap.append(caption); root.append(wrap);
  return control;
}
function renderNodeForm() {
  const root = $("node-form"); root.replaceChildren();
  const node = state.current.nodes.find(item => item.id === state.selected);
  $("delete-node").hidden = !node;
  $("detail-title").textContent = node ? node.label : "Baustein auswählen";
  if (!node) {root.append(element("p","Wähle links einen Baustein oder klicke im Fachgraphen darauf.","empty"));return;}
  const id = field(root,"Kennung",node.id,()=>{});
  id.readOnly = true;
  const label = field(root,"Bezeichnung",node.label,value => {
    node.label=value; $("detail-title").textContent=value;renderNodes();renderGraph();renderEdges();fillNodeSelects();
  });
  label.maxLength=2000;
  const categoryWrap=element("div");
  const categoryLabel=element("label","Bausteintyp");
  const categorySelect=element("select");
  groups.forEach(([key,title])=>{const option=element("option",title);option.value=key;categorySelect.append(option);});
  categorySelect.value=node.category;
  categorySelect.addEventListener("change",()=>{node.category=categorySelect.value;dirty();renderNodes();renderGraph();});
  categoryLabel.append(categorySelect);categoryWrap.append(categoryLabel);root.append(categoryWrap);
  const status=field(root,node.id.startsWith("local.") ? "Pflegestatus des lokalen Entwurfs" : "Status der NaC-Vorlage",node.status,value=>node.status=value);
  if (!node.id.startsWith("local.")) status.readOnly=true;
  field(root,"Offene Fachfrage",node.question,value=>node.question=value,true);
  const grid=element("div",undefined,"grid");root.append(grid);
  field(grid,"Verantwortliche Rolle",node.owner_role,value=>node.owner_role=value);
  field(grid,"Datenschutzklasse",node.privacy_class,value=>node.privacy_class=value);
  field(root,"Benötigt für",node.required_for.join("\n"),value=>node.required_for=value.split("\n").map(v=>v.trim()).filter(Boolean),true,"eine Angabe pro Zeile");
  field(root,"Entscheidungsoptionen",node.options.join("\n"),value=>node.options=value.split("\n").map(v=>v.trim()).filter(Boolean),true,"eine Option pro Zeile");
  field(root,"Dokumentquelle",node.document_source,value=>node.document_source=value);
  const privacy=element("label","Kann Personendaten enthalten?");
  const select=element("select");
  [["","Keine Angabe"],["true","Ja"],["false","Nein"]].forEach(([value,text])=>{const option=element("option",text);option.value=value;select.append(option);});
  select.value=node.contains_personal_data === null ? "" : String(node.contains_personal_data);
  select.addEventListener("change",()=>{node.contains_personal_data=select.value === "" ? null : select.value === "true";dirty();});
  privacy.append(select);root.append(privacy);
}
function fillNodeSelects() {
  for (const id of ["edge-from","edge-to"]) {
    const select=$(id), prior=select.value; select.replaceChildren();
    state.current.nodes.forEach(node=>{const option=element("option",node.label);option.value=node.id;select.append(option);});
    if (state.current.nodes.some(node=>node.id===prior)) select.value=prior;
  }
}
function renderEdges() {
  const root=$("edge-list");root.replaceChildren();
  state.current.edges.forEach((edge,index)=>{
    const row=element("div",undefined,"edge-row");
    row.append(element("span",nodeLabel(edge.from)));
    row.append(element("span",relations[edge.type],"edge-type"));
    row.append(element("span",nodeLabel(edge.to)));
    const remove=element("button","Entfernen","danger");remove.type="button";
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
    const status=await api("/api/status");state.token=status.token;state.branch=status.branch;refreshBranch();
    const cases=await api("/api/cases");
    cases.forEach(item=>{const option=element("option",item.title);option.value=item.slug;$("case-select").append(option);});
    for(const [key,label] of Object.entries(relations)){const option=element("option",label);option.value=key;$("edge-type").append(option);}
    $("case-select").addEventListener("change",event=>loadCase(event.target.value).catch(error=>notice(error.message,"error")));
    $("node-search").addEventListener("input",renderNodes);
    $("node-category").addEventListener("change",renderNodes);
    $("graph-scope").addEventListener("click",()=>{
      state.graphFocused=!state.graphFocused;
      $("graph-scope").setAttribute("aria-pressed",String(state.graphFocused));
      $("graph-scope").textContent=state.graphFocused ? "Alle Bausteine zeigen" : "Auswahl und Nachbarn zeigen";
      renderGraph();
    });
    $("summary").addEventListener("input",event=>{state.current.summary=event.target.value;dirty();});
    $("sources").addEventListener("input",event=>{state.current.sources=event.target.value.split("\n").map(v=>v.trim()).filter(Boolean);dirty();});
    $("add-node").addEventListener("click",()=>{
      let counter=1;while(state.current.nodes.some(node=>node.id===`local.${counter}`)) counter++;
      const node={id:`local.${counter}`,category:"required_information",label:"Neuer Baustein",status:"local-draft",question:"",section:"",detail:"",owner_role:"",privacy_class:"",document_source:"",contains_personal_data:null,required_for:[],options:[]};
      state.current.nodes.push(node);dirty();renderAll();selectNode(node.id);
    });
    $("delete-node").addEventListener("click",()=>{
      const node=state.current.nodes.find(item=>item.id===state.selected);
      if (!node || !window.confirm(`„${node.label}“ und seine Beziehungen entfernen?`)) return;
      state.current.nodes=state.current.nodes.filter(item=>item.id!==node.id);
      state.current.edges=state.current.edges.filter(edge=>edge.from!==node.id && edge.to!==node.id);
      state.selected=null;dirty();renderAll();
    });
    $("add-edge").addEventListener("click",()=>{
      const edge={from:$("edge-from").value,type:$("edge-type").value,to:$("edge-to").value};
      if(state.current.edges.some(item=>item.from===edge.from && item.type===edge.type && item.to===edge.to)){notice("Diese Beziehung besteht bereits.","error");return;}
      state.current.edges.push(edge);dirty();renderEdges();renderGraph();
    });
    $("start-branch").addEventListener("click",async()=>{
      try{
        if(state.dirty) throw new Error("Bitte ungespeicherte Änderungen vor einem neuen Arbeitszweig prüfen.");
        const result=await api("/api/start-branch",{});state.branch=result.branch;refreshBranch();
        await loadCase(state.current.slug);
        notice("Arbeitszweig angelegt: " + state.branch,"success");
      }
      catch(error){notice(error.message,"error");}
    });
    $("save").addEventListener("click",save);
    $("confirm-save").addEventListener("click",confirmSave);
    $("submit-review").addEventListener("click",submitReview);
    for(const id of ["close-preview","cancel-preview"]) $(id).addEventListener("click",()=>$("change-preview").close());
    window.addEventListener("beforeunload",event=>{if(state.dirty){event.preventDefault();event.returnValue="";}});
    await loadCase(cases[0].slug);
  } catch(error){notice(error.message,"error");}
}
init();
