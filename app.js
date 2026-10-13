/* Devis IA V1 — application locale sans requête serveur ni dépendance JS externe. */
'use strict';
const STORAGE_KEY='devis-ia-v1-data';
const FAMILIES=['Vidéosurveillance','Contrôle d’accès','Intrusion','Sécurité incendie','Réseau / accessoires','Prestations'];
const DEMO=[
 ['DEMO-CAM-GEN','Vidéosurveillance','Caméra IP — type à préciser','u',180,305,2],
 ['DEMO-CAM-EXT','Vidéosurveillance','Caméra IP extérieure','u',245,415,2.5],
 ['DEMO-CAM-INT','Vidéosurveillance','Caméra IP intérieure','u',165,285,1.5],
 ['DEMO-NVR','Vidéosurveillance','Enregistreur vidéo IP (NVR)','u',760,1100,1.5],
 ['DEMO-STOCK','Vidéosurveillance','Stockage vidéo — capacité à définir','u',220,340,.5],
 ['DEMO-SW-POE','Réseau / accessoires','Switch PoE — capacité à confirmer','u',320,495,1.2],
 ['DEMO-ECRAN','Vidéosurveillance','Écran de supervision','u',160,270,.6],
 ['DEMO-POSTE','Vidéosurveillance','Poste de visualisation — configuration à préciser','u',520,790,2],
 ['DEMO-CABLE','Réseau / accessoires','Câble réseau cuivre — métrage à confirmer','m',1.4,3.2,.04],
 ['DEMO-LECTEUR','Contrôle d’accès','Lecteur de contrôle d’accès','u',130,250,1.8],
 ['DEMO-CA-CENT','Contrôle d’accès','Contrôleur de portes','u',670,900,2],
 ['DEMO-VENT','Contrôle d’accès','Ventouse électromagnétique','u',155,300,1.8],
 ['DEMO-INTR-CENT','Intrusion','Centrale intrusion','u',520,810,3],
 ['DEMO-INTR-PIR','Intrusion','Détecteur de mouvement','u',75,145,1.2],
 ['DEMO-INTR-CONTACT','Intrusion','Contact magnétique','u',35,75,.8],
 ['DEMO-INTR-SIRENE','Intrusion','Sirène intrusion','u',115,210,1.4],
 ['DEMO-SSI-ECS','Sécurité incendie','Équipement de contrôle et signalisation — à étudier','u',800,1350,4],
 ['DEMO-SSI-DET','Sécurité incendie','Détecteur automatique incendie — type à préciser','u',85,156,1.5],
 ['DEMO-SSI-DM','Sécurité incendie','Déclencheur manuel incendie','u',70,138,1.5]
].map(([code,famille,designation,unite,achat,vente,poseH])=>({code,famille,designation,unite,achat,vente,poseH,demo:true}));
const DEFAULTS={entreprise:'Entreprise à compléter',tva:20,coutHoraire:28,venteHoraire:65,automo:true};
const EXAMPLE='Pour un entrepôt de 2 000 m², prévoir 12 caméras, dont quatre à l’extérieur, un enregistrement de 30 jours et deux postes de visualisation. Inclure l’installation et la mise en service.';
const byId=id=>document.getElementById(id);
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money=v=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(v)||0);
const num=v=>{const n=Number(String(v??'').trim().replace(/\s/g,'').replace(',','.'));return Number.isFinite(n)?n:0};
const fixed=(x,p=2)=>Math.round((num(x)+Number.EPSILON)*10**p)/10**p;
const dateFr=v=>new Date(v).toLocaleDateString('fr-FR');
const uid=()=>`D-${new Date().getFullYear()}-${String(Date.now()).slice(-8)}`;
function emptyDraft(){return{id:uid(),created:new Date().toISOString(),title:'Nouvelle installation',client:'',description:'',lines:[],questions:[],notes:[],demo:false};}
function initialState(){return{catalog:DEMO.map(c=>({...c})),settings:{...DEFAULTS},draft:emptyDraft(),history:[],view:'nouveau'};}
function loadState(){try{const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return initialState();const v=JSON.parse(raw);if(!v||!Array.isArray(v.catalog)||!v.draft)return initialState();return{catalog:v.catalog,settings:{...DEFAULTS,...v.settings},draft:v.draft,history:Array.isArray(v.history)?v.history:[],view:'nouveau'};}catch(e){return initialState();}}
let state=loadState();let catalogFilter='';let toastTimer;
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){toast('Stockage indisponible : exporte une sauvegarde JSON.');}}
function toast(s){const node=byId('toast');node.textContent=s;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3500);}
function lookup(code){return state.catalog.find(a=>a.code===code);}
function hasDemo(){return state.catalog.some(a=>a.demo)||state.draft.lines.some(l=>l.demo);}
function validVal(x,limit=10000000){return Number.isFinite(x)&&x>=0&&x<=limit;}
function lineOf(a,q,source='analyse'){return{code:a.code,designation:a.designation,unite:a.unite,qty:q,achat:num(a.achat),vente:num(a.vente),poseH:num(a.poseH),demo:!!a.demo,source};}
function quoteCalc(){const s=state.settings,d=state.draft;
 const lines=d.lines.map(l=>({...l,total:fixed(num(l.qty)*num(l.vente)),cout:fixed(num(l.qty)*num(l.achat)),hours:fixed(num(l.qty)*num(l.poseH))}));
 const produitsHT=fixed(lines.reduce((a,l)=>a+l.total,0));const achatsHT=fixed(lines.reduce((a,l)=>a+l.cout,0));const heures=fixed(lines.reduce((a,l)=>a+l.hours,0));
 const moVente=s.automo?fixed(heures*num(s.venteHoraire)):0;const moCout=s.automo?fixed(heures*num(s.coutHoraire)):0;
 const ht=fixed(produitsHT+moVente), cout=fixed(achatsHT+moCout), tva=fixed(ht*num(s.tva)/100),ttc=fixed(ht+tva);
 const marge=ht>0?fixed((ht-cout)/ht*100):0;return{lines,produitsHT,achatsHT,heures,moVente,moCout,ht,cout,tva,ttc,marge};}
const normalize=x=>String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’]/g,"'");
const NUMWORDS={un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10,onze:11,douze:12,treize:13,quatorze:14,quinze:15,seize:16,'dix-sept':17,'dix-huit':18,'dix-neuf':19,vingt:20};
const N='(\\d+|une?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix(?:-sept|-huit|-neuf)?|onze|douze|treize|quatorze|quinze|seize|vingt)';
function qtyMatch(s,regexp){const re=new RegExp(`${N}\\s+(?:\\w+\\s+){0,2}(?:${regexp})`,'i');const m=normalize(s).match(re);return m?Number(NUMWORDS[m[1]]||m[1]):0;}
const ROLES={
 'CAM-GEN':a=>/camera|camera ip|videosurveillance/.test(a)&&!/exterieur|interieur/.test(a),
 'CAM-EXT':a=>/camera/.test(a)&&/exterieur|outdoor/.test(a),
 'CAM-INT':a=>/camera/.test(a)&&/interieur|indoor/.test(a),
 'NVR':a=>/nvr|enregistreur video/.test(a),
 'STOCK':a=>/stockage|disque dur|hdd/.test(a),
 'SW-POE':a=>/switch poe|commutateur poe/.test(a),
 'ECRAN':a=>/ecran|moniteur/.test(a),
 'POSTE':a=>/poste de visualisation|station de supervision/.test(a),
 'CABLE':a=>/cable.*reseau|cable.*cuivre|cable.*rj45/.test(a),
 'LECTEUR':a=>/lecteur.*acces|lecteur.*badge/.test(a),
 'CA-CENT':a=>/controleur.*porte|centrale.*acces/.test(a),
 'VENT':a=>/ventouse/.test(a),
 'INTR-CENT':a=>/centrale.*intrusion|centrale.*alarme/.test(a),
 'INTR-PIR':a=>/detecteur.*mouvement|detecteur.*presence|\bpir\b/.test(a),
 'INTR-CONTACT':a=>/contact.*magnet|contact.*ouverture/.test(a),
 'INTR-SIRENE':a=>/sirene/.test(a),
 'SSI-ECS':a=>/equipement.*controle.*signal|centrale.*incendie|\becs\b/.test(a),
 'SSI-DET':a=>/detecteur.*incendie|detecteur.*fumee/.test(a),
 'SSI-DM':a=>/declencheur.*manuel/.test(a)
};
function findRole(code){const direct=lookup(code);if(direct)return{item:direct};const role=String(code).replace(/^DEMO-/,'');const test=ROLES[role];if(!test)return{};
 const matching=state.catalog.filter(a=>test(normalize(a.designation+' '+a.code)));
 if(matching.length===1)return{item:matching[0]};return{ambiguous:matching.length>1};}
function addParsed(p,code,qty,source='analyse'){
 if(!qty||qty<0)return;const result=findRole(code),item=result.item;
 if(!item){p.questions.push(result.ambiguous?`Plusieurs références pourraient correspondre à ${code} : choisir manuellement le modèle dans le catalogue.`:`Aucune référence adaptée à ${code} : ajoute-la au catalogue ou sélectionne-la manuellement.`);return;}
 const existing=p.lines.find(l=>l.code===code);if(existing){existing.qty+=qty;return;}
 p.lines.push(lineOf(item,qty,source));
}
function parseNeed(description){
 const s=normalize(description),p={lines:[],questions:[],notes:[]};
 const totalCam=qtyMatch(s,'cameras?|cameras? ip|videosurveillance');
 let extCam=qtyMatch(s,'cameras?\\s+(?:ip\\s+)?exterieures?|cameras?\\s+de\\s+dehors');
 let intCam=qtyMatch(s,'cameras?\\s+(?:ip\\s+)?interieures?');
 if(totalCam){
   const extFromPart=s.match(new RegExp(`(?:dont|avec|comprenant)\\s+${N}\\s+(?:cameras?\\s+)?(?:a\\s+l[' ]exterieur|exterieures?|en\\s+exterieur)`,'i'));
   if(extFromPart)extCam=Math.max(extCam,Number(NUMWORDS[extFromPart[1]]||extFromPart[1]));
   const intFromPart=s.match(new RegExp(`(?:dont|avec|comprenant)\\s+${N}\\s+(?:cameras?\\s+)?(?:a\\s+l[' ]interieur|interieures?|en\\s+interieur)`,'i'));
   if(intFromPart)intCam=Math.max(intCam,Number(NUMWORDS[intFromPart[1]]||intFromPart[1]));
   // « 8 caméras intérieures et 4 caméras extérieures » : deux lots, et non un total de 8.
   const twoSeparateGroups=extCam>0&&intCam>0&&extCam+intCam>totalCam&&!/\bdont\b/.test(s);
   const declaredTotal=twoSeparateGroups?extCam+intCam:totalCam;
   if(extCam+intCam>declaredTotal){p.questions.push('La répartition des caméras dépasse le total indiqué : vérifie les quantités.');}
   addParsed(p,'DEMO-CAM-EXT',Math.min(declaredTotal,extCam));
   addParsed(p,'DEMO-CAM-INT',Math.min(Math.max(0,declaredTotal-extCam),intCam));
   const unspecified=Math.max(0,declaredTotal-extCam-intCam);
   addParsed(p,'DEMO-CAM-GEN',unspecified);
   if(unspecified)p.questions.push(`${unspecified} caméra(s) restent à qualifier : intérieur/extérieur, résolution, focale et performances attendues.`);
 }else{
  addParsed(p,'DEMO-CAM-EXT',extCam);
  addParsed(p,'DEMO-CAM-INT',intCam);
 }
 const nvr=qtyMatch(s,'nvr|enregistreurs?');
 if(nvr)addParsed(p,'DEMO-NVR',nvr);
 else if(totalCam){addParsed(p,'DEMO-NVR',1,'proposition');p.questions.push('Valider le nombre et les caractéristiques des enregistreurs NVR proposés.');}
 let poste=qtyMatch(s,'postes?\\s+(?:de\\s+)?visualisation|stations?\\s+(?:de\\s+)?supervision');
 let ecran=qtyMatch(s,'ecrans?|moniteurs?');
 addParsed(p,'DEMO-POSTE',poste);addParsed(p,'DEMO-ECRAN',ecran);
 if(totalCam){addParsed(p,'DEMO-SW-POE',1,'proposition');p.questions.push('Dimensionner le réseau, les ports PoE et le budget de puissance du switch proposé.');}
 if(/enregistr|stockag|conserv|retention/.test(s)){
   addParsed(p,'DEMO-STOCK',1,'proposition');p.questions.push('Calculer la capacité de stockage : résolution, images/s, compression, débit, nombre de jours et redondance.');
 }
 const cables=qtyMatch(s,'metres?\\s+de\\s+cab|m\\s+de\\s+cab|metres?\\s+de\\s+reseau');if(cables)addParsed(p,'DEMO-CABLE',cables);
 else if(totalCam)p.questions.push('Préciser longueurs et cheminements de câbles, connectique et travaux annexes.');
 const lecteurs=qtyMatch(s,'lecteurs?\\s+(?:de\\s+)?badges?|lecteurs?\\s+(?:de\\s+)?controle\\s+d.?acces|lecteurs?');
 const portes=qtyMatch(s,'portes?\\s+(?:en\\s+)?controlees?|portes?');
 addParsed(p,'DEMO-LECTEUR',lecteurs||portes);
 if(lecteurs||portes){addParsed(p,'DEMO-CA-CENT',1,'proposition');p.questions.push('Confirmer architecture, nombre de portes, droits d’accès, alimentation et serrurerie existante.');}
 const vent=qtyMatch(s,'ventouses?\\s+(?:electromagnetiques?)?');addParsed(p,'DEMO-VENT',vent);
 const pir=qtyMatch(s,'detecteurs?\\s+de\\s+(?:mouvement|presence)|pir');
 const contacts=qtyMatch(s,'contacts?\\s+(?:magnetiques?|d.?ouverture)');
 const sirenes=qtyMatch(s,'sirenes?');
 addParsed(p,'DEMO-INTR-PIR',pir);addParsed(p,'DEMO-INTR-CONTACT',contacts);addParsed(p,'DEMO-INTR-SIRENE',sirenes);
 if(pir||contacts||sirenes||/intrusion|alarme anti-intrusion/.test(s)){addParsed(p,'DEMO-INTR-CENT',1,'proposition');p.questions.push('Vérifier les zones, les exigences de certification et les transmissions d’alarme.');}
 const ssiDet=qtyMatch(s,'detecteurs?\\s+(?:de\\s+)?fumee|detecteurs?\\s+incendie');
 const ssiDm=qtyMatch(s,'declencheurs?\\s+manuels?');
 addParsed(p,'DEMO-SSI-DET',ssiDet);addParsed(p,'DEMO-SSI-DM',ssiDm);
 if(ssiDet||ssiDm||/\bssi\b|securite incendie/.test(s)){addParsed(p,'DEMO-SSI-ECS',1,'proposition');p.questions.push('SSI : catégorisation, zonage, prescriptions, compatibilités et validation par un spécialiste indispensables.');}
 if(!p.lines.length)p.questions.push('Aucun article reconnu automatiquement. Ajoute les références manuellement ou utilise l’analyse Apple Intelligence.');
 if(p.lines.length){p.questions.push('Confirmer les implantations, conditions d’accès, essais et périmètre de mise en service.');}
 if(/\b(?:30|trente)\s+jours?/.test(s))p.notes.push('Durée de conservation demandée : 30 jours (stockage non dimensionné automatiquement).');
 const area=s.match(/(\d[\d\s]*)\s*m\s*(?:2|²)/);if(area)p.notes.push(`Surface déclarée : ${area[1].trim()} m² (information indicative, non utilisée comme quantité de matériel).`);
 p.notes.push('Analyse locale déterministe : propositions à vérifier par le chiffreur, non générées par un modèle IA.');
 return p;
}
function render(){document.querySelectorAll('[data-tab]').forEach(b=>{b.classList.toggle('active',b.dataset.tab===state.view);b.setAttribute('aria-current',b.dataset.tab===state.view?'page':'false');});
 byId('mainContent').innerHTML=state.view==='nouveau'?newPage():state.view==='devis'?quotePage():state.view==='catalogue'?catalogPage():settingsPage();}
function header(tag,title,subtitle){return`<div class="eyebrow">${esc(tag)}</div><h1 class="page-title">${esc(title)}</h1><p class="subheading">${esc(subtitle)}</p>`;}
function newPage(){const d=state.draft;
 return `${header('ÉTAPE 01 — BESOIN','Décris ton installation','Dicte ton besoin avec le micro du clavier iPhone, ou écris-le librement.')}
 <section class="card"><div class="row between"><h3>Quel est le besoin ?</h3><span class="pill green">100 % local</span></div>
 <textarea id="needText" class="field-control" placeholder="Ex. Je dois équiper un bâtiment avec 8 caméras, un enregistreur, un switch PoE...">${esc(d.description)}</textarea>
 <div class="row between wrap" style="margin-top:10px"><span class="hint">Pour parler : toucher la zone puis le 🎙 du clavier iOS.</span><button class="btn ghost inline" data-action="example">Utiliser un exemple</button></div>
 <div class="spacer14"></div><button class="btn primary full" data-action="analyze">✦ Analyser le besoin et créer le devis</button></section>
 <section class="card tint"><h3>Analyse automatique sans frais</h3><p>Cette première analyse identifie des quantités et suggère des matériels à partir de règles métier. <b>Ce n’est pas une IA générative</b> : les postes restent à confirmer.</p></section>
 <section class="card"><h3>Option Apple Intelligence — sur l’iPhone</h3><p>Pour les demandes complexes, un raccourci Apple peut transformer ta description en lignes du catalogue et en questions de clarification.</p>
 <div class="stack"><button class="btn secondary full" data-action="copy-ai">1 · Copier la demande pour Apple Intelligence</button><button class="btn ghost full" data-action="launch-ai">2 · Lancer « Devis IA - Analyse » dans Raccourcis ↗</button>
 <label class="field" for="aiJson">3 · Coller la réponse JSON ici</label><textarea class="field-control" id="aiJson" style="min-height:90px" placeholder='{"lines":[{"code":"DEMO-CAM-GEN","quantity":8}],"questions":[],"notes":[]}'></textarea>
 <div class="row wrap"><button class="btn secondary" data-action="paste-ai">Coller le presse-papiers</button><button class="btn primary" data-action="import-ai">Importer les lignes IA</button></div></div>
 <p class="hint">Le raccourci est à créer une seule fois. Sa configuration figure dans le guide. Aucune API ni facture par requête.</p></section>`;
}
function lineEditor(l,i){return`<div class="line-card"><div class="line-top"><div><div class="line-title">${esc(l.designation)}</div><div class="line-meta">${esc(l.code)} · ${esc(l.unite)}${l.source==='proposition'?' · Proposition à confirmer':''}${l.demo?' · Démo fictive':''}</div></div>
 <button class="remove-btn" aria-label="Supprimer ${esc(l.designation)}" data-action="remove-line" data-index="${i}">×</button></div>
 <div class="line-edit">
 <div><label for="qty-${i}">Quantité</label><input class="field-control input-short" id="qty-${i}" type="number" inputmode="decimal" min="0" step="any" value="${esc(l.qty)}" data-line="${i}" data-property="qty"></div>
 <div><label for="purchase-${i}">Achat HT / u</label><input class="field-control input-short" id="purchase-${i}" type="number" inputmode="decimal" min="0" step="any" value="${esc(l.achat)}" data-line="${i}" data-property="achat"></div>
 <div><label for="sale-${i}">Vente HT / u</label><input class="field-control input-short" id="sale-${i}" type="number" inputmode="decimal" min="0" step="any" value="${esc(l.vente)}" data-line="${i}" data-property="vente"></div>
 </div><div class="row between" style="margin-top:9px"><span class="hint">Pose : <input class="input-short" style="width:53px;height:27px;border:1px solid #dfe6f1;border-radius:6px;text-align:center" aria-label="Temps de pose par unité" type="number" step="0.1" min="0" value="${esc(l.poseH)}" data-line="${i}" data-property="poseH"> h/u</span><span class="line-right">${money(num(l.vente)*num(l.qty))}</span></div></div>`;}
function quotePage(){const d=state.draft,c=quoteCalc();const selectOptions=state.catalog.map(a=>`<option value="${esc(a.code)}">${esc(a.code)} · ${esc(a.designation)}</option>`).join('');
 return`${header('ÉTAPE 02 — CHIFFRAGE','Construis ton devis','Modifie les quantités, les prix et les temps de pose avant validation.')}
 <section class="card"><div class="row between wrap"><h3>Devis ${esc(d.id)}</h3><span class="pill ${d.lines.some(x=>x.demo)?'amber':'neutral'}">${d.lines.some(x=>x.demo)?'Tarifs fictifs':'Brouillon'}</span></div>
 <div class="field-group"><label class="field" for="devisTitle">Objet du devis</label><input id="devisTitle" data-draft="title" class="field-control" value="${esc(d.title)}"></div>
 <div class="field-group"><label class="field" for="devisClient">Client / affaire</label><input id="devisClient" data-draft="client" class="field-control" value="${esc(d.client)}" placeholder="Nom facultatif"></div>
 <div class="row wrap"><button class="btn secondary inline" data-action="save-quote">Enregistrer dans l’historique</button><button class="btn ghost inline" data-action="new-quote">Nouveau brouillon</button></div></section>
 ${d.questions.length?`<section class="card amber"><h3>Questions à confirmer (${d.questions.length})</h3>${d.questions.map(q=>`<div class="question">${esc(q)}</div>`).join('')}</section>`:''}
 <section class="card"><div class="row between"><h3>Lignes du devis (${d.lines.length})</h3></div>
 ${d.lines.length?d.lines.map(lineEditor).join(''):'<p>Aucune ligne. Lance une analyse ou ajoute un article du catalogue.</p>'}
 <div class="spacer14"></div><label class="field" for="addCode">Ajouter un article du catalogue</label><select id="addCode" class="field-control">${selectOptions||'<option value="">Catalogue vide</option>'}</select>
 <div class="spacer8"></div><button class="btn secondary full" data-action="add-line" ${state.catalog.length?'':'disabled'}>＋ Ajouter cet article</button></section>
 <section class="card"><h3>Récapitulatif financier</h3>
 <div class="kpi-grid"><div class="kpi accent"><span>Vente totale HT</span><strong id="totalHT">${money(c.ht)}</strong></div><div class="kpi"><span>Marge brute estimée</span><strong id="marginPct">${c.marge} %</strong></div></div>
 <div class="breakdown"><div class="breakdown-line"><span>Matériel / prestations HT</span><b>${money(c.produitsHT)}</b></div>
 <div class="breakdown-line"><span>Main-d’œuvre ${state.settings.automo?'estimée':'non facturée'} (${c.heures} h)</span><b>${money(c.moVente)}</b></div>
 <div class="breakdown-line"><span>Déboursé total estimé</span><b>${money(c.cout)}</b></div>
 <div class="breakdown-line"><span>TVA (${num(state.settings.tva)} %)</span><b>${money(c.tva)}</b></div>
 <div class="breakdown-line total"><span>Total TTC</span><b>${money(c.ttc)}</b></div></div>
 ${d.lines.some(l=>l.demo)?'<div class="demo-flag">Attention : les prix de ce devis sont FICTIFS et uniquement destinés à tester l’application. Ne pas transmettre comme offre commerciale.</div>':''}
 <div class="spacer14"></div><button class="btn primary full" data-action="print-quote" ${d.lines.length?'':'disabled'}>▤ Exporter en PDF / Imprimer</button><p class="hint">Sur iPhone : dans l’aperçu d’impression, ouvre la feuille en PDF puis utilise Partager → Enregistrer dans Fichiers.</p></section>
 ${d.notes.length?`<section class="card"><h3>Hypothèses / observations</h3><ul class="help-list">${d.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></section>`:''}
 <section class="card"><div class="row between"><h3>Mes devis enregistrés</h3><span class="pill neutral">${state.history.length}</span></div>
 ${state.history.length?state.history.map((h,i)=>`<div class="history-entry"><div class="row between"><div><div class="history-title">${esc(h.title)}</div><div class="history-meta">${esc(h.id)} · ${dateFr(h.created)} · ${esc(h.client||'Sans client')}</div></div><b class="small">${money(h.savedHT??0)} HT</b></div><div class="row" style="margin-top:9px"><button class="btn secondary inline" data-action="load-quote" data-index="${i}">Ouvrir</button><button class="btn danger inline" data-action="delete-quote" data-index="${i}">Supprimer</button></div></div>`).join(''):'<p>Aucun devis enregistré pour le moment.</p>'}
 </section>`;
}
function catalogPage(){return`${header('RÉFÉRENTIEL','Catalogue de prix','Importe ton propre CSV ; les données restent enregistrées dans ce navigateur.')}
 <section class="card amber"><b class="small">${state.catalog.filter(a=>a.demo).length} articles de démonstration fictifs</b><p>Les références DEMO et leurs prix sont inventés pour tester l’interface. Supprime-les avant un usage réel.</p><button class="btn danger inline" data-action="remove-demo">Supprimer les articles démo</button></section>
 <section class="card"><h3>Importer / sauvegarder le catalogue</h3><div class="row wrap"><label class="btn secondary inline file-upload">Importer CSV <input id="csvFile" type="file" accept=".csv,text/csv"></label><button class="btn ghost inline" data-action="export-csv">Exporter CSV</button><button class="btn ghost inline" data-action="csv-template">Modèle CSV vide</button></div><p class="hint">Colonnes : code;famille;designation;unite;prix_achat_ht;prix_vente_ht;temps_pose_h. L’import ajoute ou met à jour les références portant le même code.</p></section>
 <section class="card"><h3>Ajouter ou modifier un article</h3>
 <div class="grid2"><div class="field-group"><label class="field">Code article</label><input id="articleCode" class="field-control" placeholder="CAM-001"></div>
 <div class="field-group"><label class="field">Famille</label><select id="articleFamily" class="field-control">${FAMILIES.map(f=>`<option>${esc(f)}</option>`).join('')}</select></div></div>
 <div class="field-group"><label class="field">Désignation</label><input id="articleLabel" class="field-control" placeholder="Caméra IP..." /></div>
 <div class="grid2"><div class="field-group"><label class="field">Unité</label><input id="articleUnit" class="field-control" value="u"></div><div class="field-group"><label class="field">Temps de pose h/u</label><input id="articleTime" class="field-control" type="number" inputmode="decimal" step="0.1" min="0" value="0"></div></div>
 <div class="grid2"><div class="field-group"><label class="field">Achat HT</label><input id="articleBuy" class="field-control" type="number" inputmode="decimal" step="0.01" min="0" value="0"></div><div class="field-group"><label class="field">Vente HT</label><input id="articleSell" class="field-control" type="number" inputmode="decimal" step="0.01" min="0" value="0"></div></div><button class="btn primary full" data-action="upsert-article">Enregistrer l’article</button></section>
 <section class="card"><div class="row between"><h3>Articles (${state.catalog.length})</h3></div>
 <input id="catalogFilter" class="field-control" placeholder="Rechercher référence ou désignation" value="${esc(catalogFilter)}"><div id="catalogList">${catalogList()}</div></section>`;}
function catalogList(){const f=normalize(catalogFilter);const list=state.catalog.filter(a=>normalize(`${a.code} ${a.designation} ${a.famille}`).includes(f));return list.length?list.slice(0,150).map(a=>`<div class="catalogue-item"><div class="row between"><div style="flex:1;min-width:0"><strong>${esc(a.designation)}</strong><small>${esc(a.code)} · ${esc(a.famille)} · ${esc(a.unite)}${a.demo?' · Démo':''}</small><small>${money(a.achat)} achat · ${money(a.vente)} vente · ${num(a.poseH)} h/u</small></div><div class="stack" style="gap:6px"><button class="btn secondary inline" data-action="edit-article" data-code="${esc(a.code)}">Éditer</button><button class="btn danger inline" data-action="delete-article" data-code="${esc(a.code)}">×</button></div></div></div>`).join(''):'<p class="muted">Aucune référence trouvée.</p>';}
function settingsPage(){const s=state.settings;return`${header('CONFIGURATION','Réglages et sauvegardes','Taux horaires, TVA et export des données personnelles.')}
 <section class="card"><h3>Paramètres du chiffrage</h3>
 <div class="field-group"><label class="field">Nom de l’entreprise / émetteur</label><input class="field-control" data-setting="entreprise" value="${esc(s.entreprise)}"></div>
 <div class="grid2"><div class="field-group"><label class="field">TVA (%)</label><input class="field-control" data-setting="tva" type="number" step="0.1" min="0" max="100" value="${esc(s.tva)}"></div>
 <div class="field-group"><label class="field">Coût interne MO (€/h)</label><input class="field-control" data-setting="coutHoraire" type="number" step="0.5" min="0" value="${esc(s.coutHoraire)}"></div>
 <div class="field-group"><label class="field">Vente MO (€/h)</label><input class="field-control" data-setting="venteHoraire" type="number" step="0.5" min="0" value="${esc(s.venteHoraire)}"></div></div>
 <label class="row small"><input type="checkbox" data-setting="automo" ${s.automo?'checked':''}> Facturer automatiquement les heures de pose estimées</label>
 <p class="hint">Les coûts et tarifs horaires initiaux sont fictifs. La marge brute correspond ici à (CA HT − déboursé estimé) / CA HT, et non à une marge nette.</p></section>
 <section class="card"><h3>Sauvegardes indispensables</h3><p>Les devis et le catalogue sont stockés localement. Une suppression des données de Safari ou de l’app installée peut les effacer. Exporter régulièrement une sauvegarde.</p>
 <div class="stack"><button class="btn primary full" data-action="backup">Télécharger la sauvegarde JSON</button><label class="btn secondary full file-upload">Restaurer une sauvegarde JSON<input id="backupFile" type="file" accept=".json,application/json"></label></div></section>
 <section class="card"><h3>Confidentialité et limites</h3><ul class="help-list">
 <li>Aucune requête serveur depuis cette application ; pas de compte ni de télémétrie.</li><li>Après installation et premier chargement, l’application peut fonctionner hors connexion.</li><li>Si tu publies le code sur GitHub Pages, le <b>code de l’application est public</b>, pas les devis stockés localement.</li><li>N’insère pas de catalogue ou donnée confidentiels dans le dépôt GitHub public.</li><li>La déduction automatique est indicative ; aucune validation réglementaire ou de dimensionnement n’est fournie.</li></ul></section>
 <section class="card"><h3>Activer Apple Intelligence</h3><ol class="help-list"><li>Sur l’iPhone, ouvre Raccourcis et crée « Devis IA - Analyse ».</li><li>Ajoute « Obtenir le presse-papiers ».</li><li>Ajoute « Utiliser le modèle », choisis « Sur l’appareil » et fournis le presse-papiers comme entrée.</li><li>Ajoute « Copier dans le presse-papiers » avec la réponse du modèle comme valeur.</li><li>Dans « Nouveau », copie le prompt, lance le raccourci, reviens et colle la réponse JSON.</li></ol><p class="hint">La disponibilité du modèle local dépend des paramètres Apple Intelligence de ton iPhone. Les réponses sont toujours à contrôler.</p></section>`;}
function changeTab(tab){if(!['nouveau','devis','catalogue','reglages'].includes(tab))return;state.view=tab;render();window.scrollTo(0,0);}
function analyze(){const text=byId('needText')?.value?.trim()||'';if(!text){toast('Décris d’abord ton besoin.');return;}
 if(state.draft.lines.length&&!confirm('Remplacer les lignes du brouillon actuel par une nouvelle analyse ?'))return;
 const a=parseNeed(text);state.draft={...state.draft,description:text,lines:a.lines,questions:a.questions,notes:a.notes};save();changeTab('devis');toast(`${a.lines.length} référence(s) proposées ; vérifie les hypothèses.`);
}
function addLine(){const code=byId('addCode')?.value;const a=lookup(code);if(!a)return;state.draft.lines.push(lineOf(a,1,'manuel'));save();render();toast('Article ajouté.');}
function saveQuote(){const d=state.draft;if(!d.lines.length){toast('Ajoute au moins une ligne avant de sauvegarder.');return;}const snapshot=JSON.parse(JSON.stringify({...d,savedHT:quoteCalc().ht}));const idx=state.history.findIndex(h=>h.id===d.id);if(idx>=0)state.history[idx]=snapshot;else state.history.unshift(snapshot);state.history=state.history.slice(0,60);save();render();toast('Devis enregistré localement.');}
function download(name,contents,mime){const blob=new Blob([contents],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
function csvCell(s){const x=String(s??'');return/[;\r\n"]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}
function csvExport(){const fields=['code','famille','designation','unite','prix_achat_ht','prix_vente_ht','temps_pose_h'];const lines=[fields.join(';')];for(const a of state.catalog){lines.push([a.code,a.famille,a.designation,a.unite,a.achat,a.vente,a.poseH].map(csvCell).join(';'));}return '\ufeff'+lines.join('\r\n');}
function parseCsv(str){const clean=str.replace(/^\ufeff/,'');const first=clean.split(/\r?\n/)[0];const delim=(first.match(/;/g)||[]).length>=(first.match(/,/g)||[]).length?';':',';
 const rows=[];let row=[],val='',q=false;for(let i=0;i<clean.length;i++){const c=clean[i];if(c==='"'){if(q&&clean[i+1]==='"'){val+='"';i++;}else q=!q;}else if(c===delim&&!q){row.push(val);val='';}else if((c==='\n'||c==='\r')&&!q){if(c==='\r'&&clean[i+1]==='\n')i++;row.push(val);if(row.some(x=>x.trim()))rows.push(row);row=[];val='';}else val+=c;}
 row.push(val);if(row.some(x=>x.trim()))rows.push(row);return rows;}
function importCatalogCsv(csv){const rows=parseCsv(csv);if(rows.length<2)throw new Error('CSV sans lignes de données.');const headers=rows[0].map(x=>normalize(x.trim()).replace(/\s+/g,'_'));
 const aliases={code:['code','reference','ref'],famille:['famille','categorie'],designation:['designation','libelle','article'],unite:['unite','unit'],achat:['prix_achat_ht','achat','prix_achat'],vente:['prix_vente_ht','vente','prix_vente'],poseH:['temps_pose_h','pose_h','temps_de_pose']};
 const positions={};for(const [k,opts]of Object.entries(aliases)){positions[k]=headers.findIndex(x=>opts.includes(x));if(positions[k]<0)throw new Error(`Colonne CSV manquante : ${opts[0]}`);}
 const imported=[];for(const [i,row] of rows.slice(1).entries()){const get=k=>(row[positions[k]]??'').trim();const code=get('code').toUpperCase();const designation=get('designation');if(!code||!designation)continue;const achat=num(get('achat')),vente=num(get('vente')),poseH=num(get('poseH'));
 if(![achat,vente,poseH].every(n=>validVal(n))||!validVal(poseH,10000))throw new Error(`Montant invalide ligne ${i+2}`);
 imported.push({code,famille:get('famille')||'Autres',designation,unite:get('unite')||'u',achat,vente,poseH,demo:false});}
 if(!imported.length)throw new Error('Aucun article importable.');let inserted=0;
 for(const a of imported){const idx=state.catalog.findIndex(x=>x.code===a.code);if(idx>=0)state.catalog[idx]=a;else{state.catalog.push(a);inserted++;}}save();return{total:imported.length,inserted};}
async function readFile(input){const file=input.files?.[0];if(!file)return null;return file.text();}
function upsertArticle(){const code=byId('articleCode').value.trim().toUpperCase(),designation=byId('articleLabel').value.trim();if(!code||!designation){toast('Code et désignation obligatoires.');return;}
 const achat=num(byId('articleBuy').value),vente=num(byId('articleSell').value),poseH=num(byId('articleTime').value);if(![achat,vente,poseH].every(n=>validVal(n))){toast('Prix et durée doivent être positifs.');return;}
 const item={code,famille:byId('articleFamily').value,designation,unite:byId('articleUnit').value||'u',achat,vente,poseH,demo:false};const idx=state.catalog.findIndex(a=>a.code===code);if(idx>=0)state.catalog[idx]=item;else state.catalog.push(item);save();render();toast('Article enregistré.');}
function editArticle(code){const a=lookup(code);if(!a)return;byId('articleCode').value=a.code;byId('articleFamily').value=FAMILIES.includes(a.famille)?a.famille:FAMILIES[0];byId('articleLabel').value=a.designation;byId('articleUnit').value=a.unite;byId('articleTime').value=a.poseH;byId('articleBuy').value=a.achat;byId('articleSell').value=a.vente;byId('articleCode').scrollIntoView({behavior:'smooth',block:'center'});toast('Modifie l’article puis enregistre.');}
function createAIPrompt(){const text=byId('needText')?.value?.trim()||state.draft.description||'';
 const c=state.catalog.map(a=>`${a.code}: ${a.designation} (${a.unite})`).join('\n');
 return `Tu es un assistant de pré-chiffrage en sécurité/sûreté électronique. À partir du besoin ci-dessous, identifie les équipements explicitement demandés, propose éventuellement des compléments techniques à valider et liste les questions qui empêchent un chiffrage fiable. Ne déduis aucune conformité réglementaire. Ne fabrique ni code article ni prix. Utilise UNIQUEMENT les codes de catalogue fournis. Lorsqu'une quantité ou caractéristique n'est pas précisée, demande confirmation. Ne considère pas automatiquement qu'une caméra est intérieure sauf indication explicite. Réponds UNIQUEMENT avec un objet JSON valide, SANS Markdown et sans commentaire, sous la forme exacte : {"lines":[{"code":"CODE_EXACT","quantity":1}],"questions":["question"],"notes":["hypothèse"]}. Les quantités sont numériques positives, pas de doublons.\n\nBESOIN :\n${text}\n\nCATALOGUE DISPONIBLE :\n${c}`;}
async function copyString(str){try{await navigator.clipboard.writeText(str);return true;}catch(e){const el=document.createElement('textarea');el.value=str;el.style.position='fixed';el.style.top='-1000px';document.body.appendChild(el);el.select();const ok=document.execCommand('copy');el.remove();return ok;}}
function parseAIJson(s){let raw=String(s||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');const p=JSON.parse(raw);if(!p||!Array.isArray(p.lines))throw new Error('Le JSON doit contenir « lines » (tableau).');const lines=[];const unknown=[];
 for(const item of p.lines.slice(0,300)){const code=String(item.code||'').trim().toUpperCase(),q=Number(item.quantity);if(!code||!Number.isFinite(q)||q<=0||q>10000){unknown.push(`Ligne ignorée : ${code||'sans code'}, quantité invalide`);continue;}
 const a=lookup(code);if(!a){unknown.push(`Référence inconnue ignorée : ${code}`);continue;}
 const same=lines.find(l=>l.code===code);if(same)same.qty+=q;else lines.push(lineOf(a,q,'apple-ia'));}
 const questions=[...new Set([...((Array.isArray(p.questions)?p.questions:[]).filter(x=>typeof x==='string').slice(0,30)),...unknown])];
 const notes=(Array.isArray(p.notes)?p.notes:[]).filter(x=>typeof x==='string').slice(0,30);
 if(!lines.length)throw new Error('Aucune ligne correspondant au catalogue.');return{lines,questions,notes};}
function renderPrint(){const d=state.draft,c=quoteCalc();const lineRows=c.lines.map(l=>`<tr><td>${esc(l.designation)}<small style="display:block;color:#69798c">${esc(l.code)}</small></td><td class="right">${esc(l.qty)}</td><td class="right">${esc(l.unite)}</td><td class="right">${money(l.vente)}</td><td class="right">${money(l.total)}</td></tr>`).join('');
 const labor=state.settings.automo&&c.heures?`<tr><td>Main-d’œuvre d’installation estimée</td><td class="right">${c.heures}</td><td class="right">h</td><td class="right">${money(state.settings.venteHoraire)}</td><td class="right">${money(c.moVente)}</td></tr>`:'';
 byId('printArea').innerHTML=`<div class="print-head"><div><h1>DEVIS</h1><div>${esc(d.id)}<br>${esc(dateFr(d.created))}</div></div><div class="company"><b>${esc(state.settings.entreprise)}</b><br>Document de travail à valider</div></div>
 <div class="print-meta"><b>Client :</b> ${esc(d.client||'À compléter')}<br><b>Objet :</b> ${esc(d.title)}<br><b>Besoin :</b> ${esc(d.description||'Non renseigné')}</div>
 ${d.lines.some(x=>x.demo)?'<div class="print-caution"><b>DEVIS DE DÉMONSTRATION : PRIX FICTIFS — NE PAS TRANSMETTRE COMME OFFRE COMMERCIALE</b></div>':''}
 <table class="print-table"><colgroup><col style="width:45%"><col style="width:10%"><col style="width:9%"><col style="width:18%"><col style="width:18%"></colgroup><thead><tr><th>Désignation</th><th class="right">Qté</th><th class="right">Unité</th><th class="right">PU HT</th><th class="right">Total HT</th></tr></thead><tbody>${lineRows}${labor}</tbody></table>
 <div class="print-totals"><p><span>Total HT</span><b>${money(c.ht)}</b></p><p><span>TVA (${num(state.settings.tva)} %)</span><b>${money(c.tva)}</b></p><p class="grand"><span>Total TTC</span><b>${money(c.ttc)}</b></p></div>
 ${d.questions.length?`<div class="print-notes"><b>Points à confirmer avant émission définitive :</b><ul>${d.questions.map(q=>`<li>${esc(q)}</li>`).join('')}</ul></div>`:''}
 ${d.notes.length?`<div class="print-notes"><b>Hypothèses :</b><ul>${d.notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div>`:''}
 <div class="print-footer">Devis de travail — vérification technique et commerciale obligatoire. Généré localement par Devis IA V1.</div>`;}
function doAction(e){const btn=e.target.closest('[data-action]');if(!btn)return;const action=btn.dataset.action;const i=Number(btn.dataset.index);const code=btn.dataset.code;
 switch(action){
  case'example':byId('needText').value=EXAMPLE;state.draft.description=EXAMPLE;save();toast('Exemple chargé.');break;
  case'analyze':analyze();break;
  case'add-line':addLine();break;
  case'remove-line':state.draft.lines.splice(i,1);save();render();break;
  case'save-quote':saveQuote();break;
  case'new-quote':if(state.draft.lines.length&&!confirm('Créer un nouveau brouillon ? Le devis en cours est conservé uniquement si tu l’as enregistré.'))break;state.draft=emptyDraft();save();changeTab('nouveau');break;
  case'load-quote':state.draft=JSON.parse(JSON.stringify(state.history[i]));save();render();toast('Devis ouvert.');break;
  case'delete-quote':if(confirm('Supprimer ce devis enregistré ?')){state.history.splice(i,1);save();render();}break;
  case'print-quote':renderPrint();window.print();break;
  case'remove-demo':if(confirm('Supprimer toutes les références de démonstration du catalogue ? Les brouillons existants conservent leurs lignes.')){state.catalog=state.catalog.filter(a=>!a.demo);save();render();toast('Catalogue de démonstration supprimé.');}break;
  case'export-csv':download('DevisIA-catalogue.csv',csvExport(),'text/csv;charset=utf-8');break;
  case'csv-template':download('DevisIA-modele-catalogue.csv','\ufeffcode;famille;designation;unite;prix_achat_ht;prix_vente_ht;temps_pose_h\r\n','text/csv;charset=utf-8');break;
  case'upsert-article':upsertArticle();break;
  case'edit-article':editArticle(code);break;
  case'delete-article':if(confirm(`Supprimer la référence ${code} ?`)){state.catalog=state.catalog.filter(a=>a.code!==code);save();render();}break;
  case'backup':download('DevisIA-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify({catalog:state.catalog,settings:state.settings,draft:state.draft,history:state.history,version:1},null,2),'application/json;charset=utf-8');toast('Sauvegarde exportée.');break;
  case'copy-ai':copyString(createAIPrompt()).then(ok=>toast(ok?'Consigne IA copiée. Lance maintenant ton raccourci.':'Copie impossible, vérifie les permissions du presse-papiers.'));break;
  case'launch-ai':window.location.href='shortcuts://run-shortcut?name=Devis%20IA%20-%20Analyse&input=clipboard';break;
  case'paste-ai':if(!navigator.clipboard?.readText){toast('Colle manuellement le JSON (appui long).');break;}navigator.clipboard.readText().then(s=>{byId('aiJson').value=s;toast('Réponse collée.');}).catch(()=>toast('Autorisation de lecture refusée : colle manuellement.'));break;
  case'import-ai':try{const v=parseAIJson(byId('aiJson').value);if(state.draft.lines.length&&!confirm('Remplacer les lignes actuelles par la proposition Apple Intelligence ?'))break;state.draft={...state.draft,description:byId('needText').value,lines:v.lines,questions:[...v.questions,'Proposition IA à vérifier : références, quantités, implantations, prix et conformité.'],notes:[...v.notes,'Analyse issue de Raccourcis Apple Intelligence ; validation humaine obligatoire.']};save();changeTab('devis');toast('Réponse IA importée.');}catch(err){toast('Import impossible : '+err.message);}break;
 }
}
function onInput(e){const t=e.target;if(t.id==='needText'){state.draft.description=t.value;save();}else if(t.id==='catalogFilter'){catalogFilter=t.value;byId('catalogList').innerHTML=catalogList();}else if(t.dataset.draft){state.draft[t.dataset.draft]=t.value;save();}}
function onChange(e){const t=e.target;
 if(t.dataset.line!==undefined){const l=state.draft.lines[Number(t.dataset.line)];if(!l)return;const prop=t.dataset.property,v=num(t.value);if(!validVal(v)) {toast('Valeur hors limites.');render();return;}l[prop]=v;save();render();}
 if(t.dataset.setting){const k=t.dataset.setting;if(k==='automo')state.settings[k]=t.checked;else if(k==='entreprise')state.settings[k]=t.value;else {const value=num(t.value);if(!validVal(value,k==='tva'?100:100000)){toast('Valeur invalide.');render();return;}state.settings[k]=value;}save();if(k==='automo')render();}
 if(t.id==='csvFile'){readFile(t).then(str=>{if(!str)return;try{const r=importCatalogCsv(str);toast(`${r.total} références importées (${r.inserted} nouvelles).`);render();}catch(err){toast('Import CSV : '+err.message);}});}
 if(t.id==='backupFile'){readFile(t).then(str=>{if(!str)return;try{const obj=JSON.parse(str);if(!Array.isArray(obj.catalog)||!obj.draft||!Array.isArray(obj.history))throw new Error('Structure invalide');if(!confirm('Restaurer cette sauvegarde et remplacer toutes les données locales ?'))return;state={...initialState(),catalog:obj.catalog.filter(a=>a&&typeof a.code==='string'&&typeof a.designation==='string').slice(0,20000),draft:obj.draft,history:obj.history.slice(0,60),settings:{...DEFAULTS,...obj.settings}};save();changeTab('reglages');toast('Sauvegarde restaurée.');}catch(err){toast('Fichier JSON incorrect : '+err.message);}});}
}
document.addEventListener('click',e=>{const tab=e.target.closest('[data-tab]');if(tab){changeTab(tab.dataset.tab);return;}doAction(e);});
document.addEventListener('input',onInput);
document.addEventListener('change',onChange);
render();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
