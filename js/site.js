const DATA_URL='data/content.json';
const sections=['inicio','reglamento','mapa','soullink','movimientos','pokedex','combates','romhack','guias'];
const $=(selector,parent=document)=>parent.querySelector(selector);
const $$=(selector,parent=document)=>[...parent.querySelectorAll(selector)];
const escapeHtml=(value)=>String(value??'').replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=(value)=>String(value??'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const prettyText=(v)=>escapeHtml(v).replace(/\n/g,'<br>');
const sprite=(dex)=>`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${Number(dex)||1}.png`;
const categories=(list)=>[...new Set(list.map(x=>x.category))];
let data,section='inicio',ruleCategory='Todas',battleCategory='Todas',randCategory='Todas',moveCategory='Todos',activeRegion='Melemele',activeRound=0,scenario='capture';
const scenarios={
 capture:{label:'SITUACIÓN 01',heading:'Captura válida en ambos juegos',a:'CAPTURADO · RUTA 1',b:'CAPTURADO · RUTA 1',status:'VÍNCULO ACTIVO',body:'Los dos Pokémon de la misma ruta quedan vinculados. Si uno se debilita, el otro también se considera muerto. Mudkip y Salamence representan una pareja válida de ruta 1.'},
 death:{label:'SITUACIÓN 02',heading:'Pérdida de un Pokémon vinculado',a:'DEBILITADO',b:'DEBILITADO POR VÍNCULO',status:'AMBOS FUERA DE USO',body:'Si Mudkip muere, Salamence también queda fuera del desafío. No es posible volver a utilizarlos, salvo las excepciones a la regla de revivir.'},
 fail:{label:'SITUACIÓN 03',heading:'Uno de los jugadores falla su captura',a:'CAPTURA FALLIDA',b:'CAPTURA ILEGAL',status:'SIN PAREJA VÁLIDA',body:'Si el primer jugador no consigue su Pokémon de ruta, el Pokémon capturado por el segundo jugador también queda fuera de uso. Ambos pierden la oportunidad de esa ruta.'},
 shiny:{label:'SITUACIÓN 04',heading:'Captura de un Pokémon shiny',a:'ENCUENTRO SHINY (EJEMPLO)',b:'SIN VÍNCULO ESPECIAL',status:'EXCEPCIÓN SHINY',body:'Un shiny puede capturarse y utilizarse aunque ya se haya realizado el encuentro de esa ruta. Los Pokémon shiny no están vinculados al Pokémon del compañero. La búsqueda se permite tras completar el tramo antes de la fecha establecida, siempre en directo y sin límite de shinies.'},
 combat:{label:'SITUACIÓN 05',heading:'El vínculo muere durante un combate',a:'DEBILITADO',b:'AÚN EN COMBATE',status:'MUERTE APLAZADA',body:'Si un jugador pierde un Pokémon vinculado mientras el otro lo está utilizando en un combate, el Pokémon del segundo jugador se considera muerto una vez concluya ese combate, no durante él.'}
};
const soulVisuals={
 capture:{a:{},b:{}},
 death:{a:{gray:true},b:{gray:true}},
 fail:{a:{placeholder:'MISS',name:'Sin captura'},b:{gray:true}},
 shiny:{a:{shiny:true},b:{placeholder:'SIN VÍNCULO',name:'Sin vínculo'}},
 combat:{a:{gray:true},b:{}}
};
const rounds=[
 ['EQUIPO 1 O EQUIPO 2','Primera partida','Cada jugador elige entre su Equipo 1 o su Equipo 2. Ambos compañeros deben utilizar el mismo número de equipo y el Equipo 3 está prohibido en esta primera partida.'],
 ['EQUIPO NO UTILIZADO','Segunda partida','Ambos jugadores deben usar el equipo 1 o 2 que no usaron en la primera partida. Ningún Pokémon puede repetirse entre estas dos listas.'],
 ['EQUIPO 3','Partida de desempate','Si la serie queda 1-1, se usa siempre el Equipo 3. En este sí pueden incluirse Pokémon de los equipos anteriores o Pokémon aún no usados.']
];
async function boot(){
 const loading=$('#loading');
 try{
  const previewMode=new URLSearchParams(location.search).get('preview')==='1';
  let localPreview=null;try{if(previewMode)localPreview=JSON.parse(localStorage.getItem('eris.previewData')||'null')}catch{}
  if(localPreview?.meta&&Array.isArray(localPreview.rules)){data=localPreview;$('#preview-banner').hidden=false;}else{const res=await fetch(DATA_URL,{cache:'no-store'});if(!res.ok)throw new Error(`HTTP ${res.status}`);data=await res.json();}
  populateHome();initCategories();renderRules();renderStages();renderPhases();renderSoul();renderMoves();renderPokedex();renderBattles();renderRandomizer();renderGuides();
  setupTheme();document.addEventListener('click',handleClick);window.addEventListener('popstate',()=>route(new URLSearchParams(location.search).get('seccion')||'inicio',false));
  ['rules-search','moves-search','evo-search','battle-search','rand-search'].forEach(id=>{$('#'+id).addEventListener('input',()=>({ 'rules-search':renderRules,'moves-search':renderMoves,'evo-search':renderPokedex,'battle-search':renderBattles,'rand-search':renderRandomizer}[id])());});
  $('#video-close').addEventListener('click',()=>$('#video-dialog').close());$('#video-dialog').addEventListener('click',(e)=>{if(e.target===$('#video-dialog'))$('#video-dialog').close()});
  route(new URLSearchParams(location.search).get('seccion')||'inicio',false);
  $('#app').hidden=false;loading.hidden=true;
 }catch(err){$('#app').hidden=true;loading.hidden=false;loading.textContent='No se pudo cargar el contenido. Abre el sitio a través de un servidor local (por ejemplo, python -m http.server 8000) o desde GitHub Pages. Detalle: '+err.message;console.error(err)}
}
function populateHome(){const m=data.meta;
 $('#hero-title').textContent=m.heroTitle;$('#hero-subtitle').textContent=m.heroSubtitle;$('#hero-description').textContent=m.heroDescription;$('#announcement').textContent=m.announcement;
 const metrics=[['PREMIO PRINCIPAL',m.prize,'Equipo ganador'],['MENOS MUERTES',m.prizeFewestDeaths,'Premio adicional'],['EQUIPOS',m.teams,'Formato previsto'],['INSCRIPCIÓN','20 €','Por pareja'],['INICIO','6 NOV.','Fecha anunciada']];
 $('#metrics').innerHTML=metrics.map(([a,b,c])=>`<div class="metric"><small>${escapeHtml(a)}</small><strong>${escapeHtml(b)}</strong><span>${escapeHtml(c)}</span></div>`).join('');
 const cards=[['01','reglamento','Reglamento','Normas generales, capturas, restricciones, muertes y excepciones.','M12 4h9v16H6V4zM9 10h9M9 15h9'],['02','mapa','Mapa y level caps','Recorrido por las pruebas y niveles de cada etapa.','m3 6 7-3 7 3 6-3v17l-6 3-7-3-7 3V6zm7-3v17m7-14v17'],['03','movimientos','Modificaciones','Movimientos, estadísticas, evoluciones y randomizado.','m18 2-13 15h9l-2 13 14-17h-9z'],['04','combates','Combates PvP','Reglas BO3, fases, listas abiertas y composición de equipos.','M5 3 27 29M27 3 5 29M2 24l6 6M24 30l6-6']];
 $('#features').innerHTML=cards.map(([number,id,title,desc,path])=>`<a class="feature-card" data-route="${id}" href="?seccion=${id}"><div class="card-no">${number}<b>↗</b></div><div class="feature-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="${path}"/></svg></div><h3>${title}</h3><p>${desc}</p><strong>Consultar →</strong></a>`).join('');
 const links=[['Discord',m.socials.discord],['X / Twitter',m.socials.twitter],['Instagram',m.socials.instagram]];$('#social-home').innerHTML=links.map(([title,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${title} ↗</a>`).join('');$('#social-footer').innerHTML=links.map(([title,url])=>`<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${title}</a>`).join('');
}
function setupTheme(){let t='ultraluna';try{t=localStorage.getItem('eris.theme')||'ultraluna'}catch{}setTheme(t)}
function setTheme(theme){const t=theme==='ultraluna'?'ultraluna':'ultrasol';document.body.dataset.theme=t;$$('[data-set-theme]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.setTheme===t)));$('#hero-pokemon').src=sprite(t==='ultraluna'?792:791);$('#hero-pokemon').alt=t==='ultraluna'?'Lunala, Pokémon representativo de UltraLuna':'Solgaleo, Pokémon representativo de UltraSol';$('#hero-edition').textContent=t==='ultraluna'?'EDICIÓN ULTRALUNA':'EDICIÓN ULTRASOL';try{localStorage.setItem('eris.theme',t)}catch{}}
function route(name,history=true){section=sections.includes(name)?name:'inicio';$$('.page').forEach(p=>p.classList.toggle('active',p.id===`page-${section}`));$$('[data-route]', $('.main-nav')).forEach(a=>{a.classList.toggle('active',a.dataset.route===section);if(a.dataset.route===section)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});if(history)window.history.pushState({},'',`${location.pathname}?seccion=${encodeURIComponent(section)}`);window.scrollTo({top:0,behavior:'instant'});document.title=(section==='inicio'?'Inicio':({soullink:'SoulLink',pokedex:'Pokédex',mapa:'Mapa y niveles',romhack:'Romhack'}[section]||section[0].toUpperCase()+section.slice(1)))+' | Ultranova Eris';}
function initCategories(){filterButtons('#rules-filters',data.rules,'rule-category','Todas');filterButtons('#battle-filters',data.battles,'battle-category','Todas');filterButtons('#rand-filters',data.randomizer,'rand-category','Todas')}
function filterButtons(selector,list,attr,active){$(selector).innerHTML=['Todas',...categories(list)].map(c=>`<button type="button" data-${attr}="${escapeHtml(c)}" class="${c===active?'active':''}">${escapeHtml(c)}</button>`).join('')}
function renderList(items,selector){$(selector).innerHTML=items.length?items.map(x=>`<article class="info-card"><span class="card-type">${escapeHtml(x.category||'Nota')}</span><h3>${escapeHtml(x.title)}</h3><p>${prettyText(x.body)}</p><small class="card-source">${escapeHtml(x.source||'')}</small></article>`).join(''):'<div class="empty">Sin resultados para estos filtros.</div>'}
function renderRules(){const term=q($('#rules-search').value);const list=data.rules.filter(x=>(ruleCategory==='Todas'||ruleCategory===x.category)&&q(x.title+' '+x.body+' '+x.category).includes(term));$('#rules-count').textContent=`${list.length} de ${data.rules.length} reglas`;renderList(list,'#rules-list');renderList(data.notes,'#notes-list')}
function getProgress(){try{return JSON.parse(localStorage.getItem('eris.progress')||'[]')}catch{return []}}
function renderStages(){const regions=['Melemele','Akala','Ula-Ula','Poni y final'];$$('[data-region]').forEach(b=>b.classList.toggle('selected',b.dataset.region===activeRegion));$('#region-index').textContent=`REGIÓN ${String(regions.indexOf(activeRegion)+1).padStart(2,'0')}`;$('#region-name').textContent=activeRegion;$('#region-description').textContent=activeRegion==='Ula-Ula'?'La sexta prueba (Zarala) marca el cierre del primer tramo.':'Selecciona los hitos superados para registrar tu avance de forma local.';const progress=getProgress();$('#region-stages').innerHTML=data.stages.filter(x=>x.region===activeRegion).map(x=>`<label class="stage"><input type="checkbox" data-stage="${escapeHtml(x.id)}" ${progress.includes(x.id)?'checked':''} aria-label="Marcar ${escapeHtml(x.name)} como completado"><span class="name">${escapeHtml(x.name)}</span><span class="level">NV. ${x.level}</span></label>${x.id==='stage-08'?'<div class="phase-divider" role="separator" aria-label="Fin de la primera fase"><span>FIN DE LA PRIMERA FASE</span></div>':''}`).join('');$('#progress-value').textContent=`${progress.length} / ${data.stages.length} hitos completados`;$('#progress-fill').style.width=(100*progress.length/data.stages.length)+'%'}
function renderPhases(){$('#phase-cards').innerHTML=data.phases.map(x=>`<article class="info-card"><span class="card-type">FASE DEL TORNEO</span><h3>${escapeHtml(x.title)}</h3><p>${escapeHtml(x.body)}</p><small class="card-source">${escapeHtml(x.source)}</small></article>`).join('')}
function renderSoul(){
 const x=scenarios[scenario], visual=soulVisuals[scenario];
 $('#soul-case').textContent=x.label;$('#soul-heading').textContent=x.heading;
 $('#soul-state-a').textContent=x.a;$('#soul-state-b').textContent=x.b;
 $('#soul-status').textContent=x.status;$('#soul-explanation').textContent=x.body;
 for(const side of ['a','b']){
  const spec=visual[side],img=$(`#soul-sprite-${side}`),placeholder=$(`#soul-placeholder-${side}`);
  img.hidden=Boolean(spec.placeholder);img.classList.toggle('is-fainted',Boolean(spec.gray));
  img.src=side==='a'&&spec.shiny?'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/258.png':sprite(side==='a'?258:373);
  placeholder.hidden=!spec.placeholder;placeholder.textContent=spec.placeholder||'';
  placeholder.classList.toggle('is-miss',spec.placeholder==='MISS');
  $(`#soul-name-${side}`).textContent=spec.name||(side==='a'?'Mudkip':'Salamence');
 }
 $$('[data-scenario]').forEach(b=>b.classList.toggle('active',b.dataset.scenario===scenario));
 const terms=['vínculo','shiny','ruta','muerte','captura','fósiles','debilit'];
 renderList(data.rules.filter(x=>x.category==='Capturas y SoulLink'&&terms.some(term=>q(x.title).includes(term))).slice(0,8),'#soul-related');
}
function renderMoves(){const term=q($('#moves-search').value);const items=data.moves.filter(x=>(moveCategory==='Todos'||x.category===moveCategory)&&q([x.name,x.effect,x.category,x.type].join(' ')).includes(term));$('#moves-count').textContent=`${items.length} de ${data.moves.length} entradas`;$('#moves-list').innerHTML=items.length?items.map(x=>`<article class="info-card move-card"><div class="move-header"><span class="card-type">${escapeHtml(x.type||x.category)}</span><small>${escapeHtml(x.category)}</small></div><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.effect)}</p><div class="move-meta"><span>${x.power!=null?'POTENCIA '+escapeHtml(x.power):'EFECTO MODIFICADO'}</span>${validVideo(x.video)?`<button type="button" data-open-video="${escapeHtml(x.id)}">Ver clip →</button>`:''}</div><small class="card-source">${escapeHtml(x.source)}</small></article>`).join(''):'<div class="empty">No se encontraron movimientos.</div>'}
function validVideo(v){return typeof v==='string' && (/^assets\/media\/movimientos\/[a-zA-Z0-9._-]+\.(mp4|webm)$/i.test(v)||/^https:\/\/[a-zA-Z0-9.-]+(?:\/[a-zA-Z0-9_?&=.#%/+~-]*)?$/i.test(v))}
function openVideo(id){const move=data.moves.find(x=>x.id===id);if(!move||!validVideo(move.video))return;$('#video-name').textContent=move.name;$('#video-description').textContent=move.effect;const content=$('#video-content');content.replaceChildren();if(validVideo(move.video)){const video=document.createElement('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.src=move.video;content.append(video)}else{content.innerHTML='<div class="video-pending"><svg viewBox="0 0 56 56" aria-hidden="true"><rect x="5" y="8" width="46" height="40" rx="6"/><path d="m23 18 16 10-16 10z"/></svg><strong>CLIP PENDIENTE DE GRABACIÓN</strong><span>Se incorporará el vídeo capturado en el romhack de Ultranova.</span></div>'}$('#video-dialog').showModal()}
function renderPokedex(){const d=data.pokemonChanges[0];$('#dex-stats').innerHTML=`<div class="pokemon-panel"><div class="pokemon-art"><small>POKÉMON #${d.dex}</small><img alt="${escapeHtml(d.name)}" src="${sprite(d.dex)}" loading="lazy"></div><div class="pokemon-stats"><small>ESTADÍSTICAS BASE MODIFICADAS</small><h2>${escapeHtml(d.name)} <span>BST ${d.bst}</span></h2>${Object.entries(d.stats).map(([name,n])=>`<div class="stat-bar"><span class="stat-name">${escapeHtml(name)}</span><div class="track"><span style="width:${Math.min(100,n/160*100)}%"></span></div><b>${n}</b></div>`).join('')}<small class="card-source">${escapeHtml(d.source)}</small></div></div>`;
 const term=q($('#evo-search').value);const items=data.evolutions.filter(x=>q([x.from,x.to,x.method].join(' ')).includes(term));$('#evo-count').textContent=`${items.length} de ${data.evolutions.length} métodos de evolución`;
 $('#evo-list').innerHTML=items.length?items.map(x=>`<article class="evo-card"><div class="evo-mon"><img loading="lazy" src="${sprite(x.fromDex)}" alt=""><small>${escapeHtml(x.from)}</small></div><span class="evo-arrow" aria-hidden="true">→</span><div class="evo-mon"><img loading="lazy" src="${sprite(x.toDex)}" alt=""><small>${escapeHtml(x.to)}</small></div><div class="evo-method"><small>MÉTODO</small><strong>${escapeHtml(x.method)}</strong></div></article>`).join(''):'<div class="empty">Sin evoluciones coincidentes.</div>'}
function renderRounds(){$('#battle-round-label').textContent=rounds[activeRound][0];$('#battle-round-title').textContent=rounds[activeRound][1];$('#battle-round-description').textContent=rounds[activeRound][2];$$('[data-round]').forEach(b=>b.classList.toggle('active',Number(b.dataset.round)===activeRound))}
function renderBattles(){renderRounds();const term=q($('#battle-search').value);const items=data.battles.filter(x=>(battleCategory==='Todas'||x.category===battleCategory)&&q(x.title+' '+x.body+' '+x.category).includes(term));renderList(items,'#battle-list')}
function renderRandomizer(){const term=q($('#rand-search').value);const items=data.randomizer.filter(x=>(randCategory==='Todas'||x.category===randCategory)&&q(x.title+' '+x.body+' '+x.category).includes(term));$('#rand-count').textContent=`${items.length} de ${data.randomizer.length} especificaciones`;renderList(items,'#rand-list')}
function renderGuides(){$('#guide-list').innerHTML=data.guides.map((g,i)=>`<details class="guide" ${i===0?'open':''}><summary><strong>${escapeHtml(g.title)}</strong><span aria-hidden="true">+</span></summary><div class="guide-content"><p>${escapeHtml(g.intro)}</p><div class="guide-flex ${g.image?'':'no-image'}"><ol class="guide-steps">${g.steps.map(s=>`<li>${escapeHtml(s)}</li>`).join('')}</ol>${g.image?`<img class="guide-image" loading="lazy" alt="Captura del procedimiento en el documento de combates" src="${escapeHtml(g.image)}">`:''}</div><div class="guide-links">${g.links.map(l=>`<a href="${escapeHtml(l.url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(l.label)} ↗</a>`).join('')}</div><small class="card-source">${escapeHtml(g.source)}</small></div></details>`).join('')}
function handleClick(e){
 const a=e.target.closest('[data-route]');if(a&&a.tagName==='A'){e.preventDefault();route(a.dataset.route);return}
 const t=e.target.closest('[data-set-theme]');if(t){setTheme(t.dataset.setTheme);return}
 const r=e.target.closest('[data-rule-category]');if(r){ruleCategory=r.dataset.ruleCategory;$$('[data-rule-category]').forEach(b=>b.classList.toggle('active',b===r));renderRules();return}
 const b=e.target.closest('[data-battle-category]');if(b){battleCategory=b.dataset.battleCategory;$$('[data-battle-category]').forEach(n=>n.classList.toggle('active',n===b));renderBattles();return}
 const f=e.target.closest('[data-rand-category]');if(f){randCategory=f.dataset.randCategory;$$('[data-rand-category]').forEach(n=>n.classList.toggle('active',n===f));renderRandomizer();return}
 const m=e.target.closest('[data-move-filter]');if(m){moveCategory=m.dataset.moveFilter;$$('[data-move-filter]').forEach(b=>b.classList.toggle('active',b===m));renderMoves();return}
 const s=e.target.closest('[data-scenario]');if(s){scenario=s.dataset.scenario;renderSoul();return}
 const isl=e.target.closest('[data-region]');if(isl){activeRegion=isl.dataset.region;renderStages();return}
 const cb=e.target.closest('input[data-stage]');if(cb){const ids=new Set(getProgress());if(cb.checked)ids.add(cb.dataset.stage);else ids.delete(cb.dataset.stage);try{localStorage.setItem('eris.progress',JSON.stringify([...ids]))}catch{}renderStages();return}
 if(e.target.closest('#reset-progress')){if(confirm('¿Reiniciar el progreso guardado en este navegador?')){try{localStorage.removeItem('eris.progress')}catch{}renderStages()}return}
 const dex=e.target.closest('[data-dex-tab]');if(dex){$$('[data-dex-tab]').forEach(b=>b.classList.toggle('active',b===dex));$('#dex-stats').hidden=dex.dataset.dexTab!=='stats';$('#dex-evolutions').hidden=dex.dataset.dexTab!=='evolutions';return}
 const round=e.target.closest('[data-round]');if(round){activeRound=Number(round.dataset.round);renderRounds();return}
 const video=e.target.closest('[data-open-video]');if(video){openVideo(video.dataset.openVideo);return}
}
boot();
