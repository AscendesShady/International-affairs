'use strict';
(async function startAtlas(){
try {
 const bundled=window.ATLAS_BUNDLE;
 const readLocal=async(name)=>{const res=await fetch(new URL('data/'+name,document.baseURI));if(!res.ok)throw new Error(name+' returned HTTP '+res.status);return res.json()};
 const [atlasData,worldData,topicData,nobelData]=bundled?[bundled.atlas,bundled.world,bundled.topics,bundled.nobel]:await Promise.all(['atlas.json','world.geojson','topics.json','nobel.json'].map(readLocal));
 if(!atlasData.countries||!worldData.features||!Array.isArray(topicData.records)||!Array.isArray(nobelData.records))throw new Error('A local dataset has an invalid structure.');
 const KNOWLEDGE={metadata:topicData.metadata,records:[...topicData.records,...nobelData.records]};

'use strict';
const ATLAS=atlasData; ATLAS.geometry=worldData;
const records=ATLAS.countries, allCountries=Object.values(records).sort((a,b)=>a.name.localeCompare(b.name));
const svg=d3.select('#world-map'), stage=document.getElementById('map-stage');
const projection=d3.geoEqualEarth(), path=d3.geoPath(projection);
let width=1000,height=680,selected=null,currentTab='atlas',transform=d3.zoomIdentity,lastLayout=0;
let activeMapPoint=null;
const baseAreas=new Map();
const colours=['#d7dfc6','#e3dcc5','#cfddcd','#cbdedc','#d8d8e7','#e6d7cc','#d0dce6'];
const root=svg.append('g'), grat=root.append('path').attr('class','graticule');
const countryGroup=root.append('g'), refsGroup=root.append('g'), waterGroup=root.append('g'), featureGroup=root.append('g'), capitalGroup=root.append('g'), countryLabelGroup=root.append('g');
const polygons=ATLAS.geometry.features, polygonMap=new Map(polygons.map(f=>[f.properties.code,f]));
const countries=countryGroup.selectAll('path').data(polygons).join('path').attr('class','country').attr('data-country',d=>d.properties.code).attr('fill',d=>colours[((d.properties.color||1)-1)%7]).on('click',(e,d)=>{e.stopPropagation();selectCountry(d.properties.code)}).on('pointerenter',(e,d)=>showTooltip(e,d.properties.name)).on('pointerleave',hideTooltip);
const dots=countryGroup.selectAll('circle').data(allCountries.filter(c=>!polygonMap.has(c.code))).join('circle').attr('class','country-dot').attr('data-country',d=>d.code).on('click',(e,d)=>{e.stopPropagation();selectCountry(d.code)}).on('pointerenter',(e,d)=>showTooltip(e,d.name)).on('pointerleave',hideTooltip);
const labels=countryLabelGroup.selectAll('text').data(allCountries).join('text').attr('class','country-label').attr('data-country',d=>d.code).attr('role','button').attr('aria-label',d=>'Open '+d.name+' details').attr('tabindex',0).text(d=>d.name).on('click',(e,d)=>{e.stopPropagation();selectCountry(d.code)}).on('keydown',(e,d)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();selectCountry(d.code)}});
const oceanConnections={
'Pacific Ocean':'USA CAN MEX GTM SLV HND NIC CRI PAN COL ECU PER CHL RUS CHN TWN JPN KOR PRK PHL IDN MYS BRN SGP TLS AUS NZL PNG SLB VUT FJI TON WSM KIR NRU MHL FSM PLW TUV NCL PYF COK NIU GUM ASM MNP PCN WLF TKL',
'Atlantic Ocean':'USA CAN MEX CUB HTI DOM JAM BHS PRI TTO BRB GRD DMA ATG KNA LCA VCT BLZ GTM HND NIC CRI PAN COL VEN GUY SUR GUF BRA URY ARG GBR IRL ISL GRL NOR DNK SWE FIN EST LVA LTU POL DEU NLD BEL FRA ESP PRT MAR MRT SEN GMB GNB GIN SLE LBR CIV GHA TGO BEN NGA CMR GNQ GAB COG COD AGO NAM ZAF STP CPV TUR BGR ROU UKR RUS GEO ITA SVN HRV BIH MNE ALB GRC CYP SYR LBN ISR PSE EGY LBY TUN DZA MLT MCO FRO ALA IMN JEY GGY GIB BMU ABW CUW BES SXM MAF GLP MTQ BLM CYM TCA AIA MSR VIR VGB FLK SHN',
'Indian Ocean':'BGD IND PAK IRN OMN YEM SAU EGY SDN ERI DJI SOM KEN TZA MOZ ZAF MDG MUS COM SYC MDV LKA MMR THA MYS IDN TLS AUS ARE QAT BHR KWT IRQ IOT REU MYT CCK CXR ATF HMD',
'Arctic Ocean':'CAN USA RUS NOR GRL SJM','Southern Ocean':'ATA'};
const oceanFeatures=ATLAS.features.filter(f=>f.kind==='ocean');
const waterFeatures=ATLAS.features.filter(f=>f.kind==='ocean'||f.kind==='sea');
const waterLabels=waterGroup.selectAll('text').data(waterFeatures).join('text').attr('class','water-label').text(d=>d.name);
const mainFeatures=ATLAS.features.filter(f=>!['ocean','sea'].includes(f.kind)&&f.name!=='Suez / Panama comparison');
const featureNodes=featureGroup.selectAll('g').data(mainFeatures).join('g');
featureNodes.append('path').attr('class','point').attr('fill',d=>({strait:'#087d85',canal:'#4964af',line:'#bf6b30',study:'#8562a5'}[d.kind]));
featureNodes.append('text').attr('class','feature-label').text(d=>d.name);
const parallelLats=[49,38,31,22,17];
const references=refsGroup.selectAll('path').data(parallelLats).join('path').attr('class','reference');
const zoom=d3.zoom().scaleExtent([1,2048]).on('zoom',e=>{transform=e.transform;root.attr('transform',transform);document.getElementById('zoom-status').textContent=(transform.k<10?transform.k.toFixed(1):Math.round(transform.k))+'× · vector';hideTooltip();layoutLabels()});
svg.call(zoom).on('dblclick.zoom',null);
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function link(url,label='Read source'){return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`}
function showTooltip(e,name){const r=stage.getBoundingClientRect(),t=document.getElementById('tooltip');t.textContent=name;t.style.display='block';t.style.left=Math.min(width-190,Math.max(5,e.clientX-r.left+13))+'px';t.style.top=Math.max(5,e.clientY-r.top-35)+'px'}
function hideTooltip(){document.getElementById('tooltip').style.display='none'}
function layer(id){return document.getElementById('layer-'+id).checked}
function related(f){return selected&&(f.countries.includes(selected)||(f.contextCountries||[]).includes(selected))}
function inView(pt,pad=20){let [x,y]=transform.apply(pt);return x>=-pad&&x<=width+pad&&y>=-pad&&y<=height+pad}
function makeBox(pt,text,size=13,anchor='middle',offset=0){const q=transform.apply(pt),w=text.length*size*.53;return {x:q[0]+offset-(anchor==='middle'?w/2:0),y:q[1]-size/2,w:w+7,h:size+5}}
function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function layoutLabels(){
 const k=transform.k,boxes=[];
 labels.attr('font-size',13/k).style('font-size',(13/k)+'px').style('stroke-width',2.5/k).attr('x',d=>projection(d.xy)[0]).attr('y',d=>projection(d.xy)[1]).attr('dy','.35em');
 const candidates=allCountries.filter(c=>inView(projection(c.xy))).sort((a,b)=>(a.code===selected?-1:b.code===selected?1:0)||(a.rank-b.rank)||(b.area||0)-(a.area||0));
 const visible=new Set();
 for(const c of candidates){const area=baseAreas.get(c.code)||0; if(c.code!==selected&&area*k*k<Math.max(1400,c.name.length*100))continue;
  const b=makeBox(projection(c.xy),c.name);if(c.code!==selected&&boxes.some(x=>overlap(x,b)))continue;boxes.push(b);visible.add(c.code);}
 labels.style('display',d=>visible.has(d.code)?null:'none').attr('tabindex',d=>visible.has(d.code)?0:-1).classed('selected',d=>d.code===selected);
 dots.attr('cx',d=>projection(d.xy)[0]).attr('cy',d=>projection(d.xy)[1]).attr('r',d=>(d.code===selected?5:3)/k).style('display',d=>(k>=2||d.code===selected)?null:'none');
 const capitals=capitalGroup.selectAll('g');
 capitals.attr('transform',d=>`translate(${projection(d.xy)}) scale(${1/k})`);
 capitals.each(function(d){const pt=projection(d.xy),b=makeBox(pt,d.name,13,'start',10);boxes.push(b)});
 waterLabels.style('font-size',d=>((d.kind==='ocean'?19:13)/k)+'px').style('stroke-width',3/k).attr('x',d=>projection(d.xy)[0]).attr('y',d=>projection(d.xy)[1]).style('display',function(d){if(!layer('oceans')||!inView(projection(d.xy),100))return 'none';if(d.kind!=='ocean'&&k<1.6&&!related(d))return 'none';let b=makeBox(projection(d.xy),d.name,d.kind==='ocean'?19:13);if(boxes.some(x=>overlap(x,b)))return 'none';boxes.push(b);return null});
 featureNodes.attr('transform',d=>`translate(${projection(d.xy)}) scale(${1/k})`).style('display',d=>{const active=layer(d.kind==='study'?'study':d.kind==='line'?'lines':'passages');return active&&inView(projection(d.xy))&&(related(d)||k>=(d.kind==='study'?5:d.kind==='line'?4:2.4))?null:'none'});
 featureNodes.select('path').attr('d',d=>d3.symbol().type(d.kind==='strait'?d3.symbolDiamond:d.kind==='canal'?d3.symbolSquare:d.kind==='line'?d3.symbolCross:d3.symbolCircle).size(40)());
 featureNodes.select('text').attr('x',10).attr('y',4).style('display',function(d){if(d3.select(this.parentNode).style('display')==='none')return 'none';const b=makeBox(projection(d.xy),d.name,12,'start',10);if(boxes.some(x=>overlap(x,b)))return 'none';boxes.push(b);return null});
 // Reference latitudes appear only for the selected country's related named line.
 references.style('display',lat=>layer('lines')&&selected&&ATLAS.features.some(f=>f.kind==='line'&&related(f)&&f.name.startsWith(lat+'th parallel')||f.kind==='line'&&related(f)&&f.name.startsWith(lat+'nd parallel')||f.kind==='line'&&related(f)&&f.name.startsWith(lat+'st parallel'))?null:'none');
}
function resize(){const r=stage.getBoundingClientRect();if(Math.abs(width-r.width)<1&&Math.abs(height-r.height)<1&&lastLayout)return;width=r.width;height=r.height;lastLayout++;svg.attr('viewBox',`0 0 ${width} ${height}`);projection.fitExtent([[18,28],[width-18,height-105]],{type:'Sphere'});baseAreas.clear();for(const f of polygons)baseAreas.set(f.properties.code,path.area(f));countries.attr('d',path);grat.attr('d',path(d3.geoGraticule().step([30,30])()));references.attr('d',lat=>path({type:'LineString',coordinates:d3.range(-179,180,2).map(x=>[x,lat])}));zoom.extent([[0,0],[width,height]]).translateExtent([[-80,-80],[width+80,height+80]]);svg.call(zoom.transform,d3.zoomIdentity);document.getElementById('loading').style.display='none';if(selected)focusCountry(selected,false);else if(activeMapPoint)locateTopic(activeMapPoint,false)}
function countryPart(code){const f=polygonMap.get(code);if(!f)return null;const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];const anchor=records[code].xy;let best=polys[0],bestScore=Infinity;for(const p of polys){const poly={type:'Polygon',coordinates:p};const center=d3.geoCentroid(poly);let dx=Math.abs(center[0]-anchor[0]);dx=Math.min(dx,360-dx);const score=dx*dx+(center[1]-anchor[1])**2;if(score<bestScore){bestScore=score;best=p}}return {type:'Feature',geometry:{type:'Polygon',coordinates:best},properties:{}}}
function focusCountry(code,animate=true){const c=records[code],part=countryPart(code);let t;if(part){const b=path.bounds(part),dx=b[1][0]-b[0][0],dy=b[1][1]-b[0][1];const k=Math.max(1.8,Math.min(85,.65/Math.max(dx/width,dy/height)));const p=projection(c.xy);t=d3.zoomIdentity.translate(width*.5-k*p[0],height*.44-k*p[1]).scale(k)}else{const p=projection(c.xy),k=25;t=d3.zoomIdentity.translate(width*.5-k*p[0],height*.44-k*p[1]).scale(k)}
 const motion=animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches;svg.interrupt();(motion?svg.transition().duration(550):svg).call(zoom.transform,t);}
function selectCountry(code){if(!records[code])return;activeMapPoint=null;root.selectAll('.topic-locator').remove();countryTopicShown=12;selected=code;currentTab='atlas';countries.classed('selected',d=>d.properties.code===code).classed('neighbour',d=>records[code].borders.includes(d.properties.code));drawCapitals();renderPane();closeSearch();document.getElementById('country-search').value='';focusCountry(code);document.getElementById('country-pane').scrollTop=0;layoutLabels();if(window.innerWidth<=760)document.getElementById('country-pane').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});}
function drawCapitals(){const g=capitalGroup.selectAll('g').data(selected?records[selected].capitalPoints:[],d=>d.name).join('g');g.selectAll('*').remove();g.append('path').attr('d',d3.symbol().type(d3.symbolStar).size(85)()).attr('fill','#ba4d23').attr('stroke','white').attr('stroke-width',1.2);g.append('text').attr('x',11).attr('y',4).text(d=>d.name).attr('font-size',13).attr('fill','#963c19').attr('font-weight',700).attr('paint-order','stroke').attr('stroke','#fff').attr('stroke-width',3).style('pointer-events','none');}
function closePane(){selected=null;document.getElementById('details-pane').hidden=true;document.getElementById('empty-pane').hidden=false;countries.classed('selected',false).classed('neighbour',false);drawCapitals();layoutLabels()}
function cards(items,empty){return items.length?items.map(f=>`<div class="feature-card"><b>${esc(f.name)}</b><p>${esc(f.detail)}</p>${(f.contextCountries||[]).includes(selected)?'<p class="note">Indirect maritime-trade context for Bangladesh. This strait is outside Bangladesh.</p>':''}${link(f.source,'Reference / further reading')}</div>`).join(''):`<p class="note">${esc(empty)}</p>`}
function section(title,content){return `<section class="section"><h2>${title}</h2>${content}</section>`}
function renderPane(){const c=records[selected],details=document.getElementById('details-pane');details.hidden=false;document.getElementById('empty-pane').hidden=true;
 const cs=ATLAS.features.filter(f=>related(f)),coast=c.landlocked?'Landlocked':c.landlocked===false?'Coastal / island':'Special unit';
 const oceans=c.landlocked?[]:oceanFeatures.filter(f=>(oceanConnections[f.name]||'').split(' ').includes(selected));
 const capText=c.capital.length?c.capital.map(esc).join('<br>'):'No separate national capital in this dataset';
 const cur=Object.entries(c.currencies).map(([k,v])=>`${esc(v.name)} <span class="note">(${esc(k)})</span>`).join('<br>')||'No separate national currency asserted';
 const neighbours=c.borders.map(k=>records[k]).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
 const boundary=`<p class="note">Border shapes follow Natural Earth’s generalised, de facto cartographic snapshot. They do not adjudicate sovereignty and may not reflect recent territorial control. Control / named lines below use location markers rather than surveyed routes.</p>${c.boundaryNote?`<div class="notice">${esc(c.boundaryNote)}</div>`:''}`;
 const people=c.peoples?`<p><b>Historical peoples / societies</b><br>${esc(c.peoples.historical)}</p><p><b>Present-day Indigenous / heritage communities</b><br>${esc(c.peoples.contemporary)}</p><p class="note"><b>Classification:</b> ${esc(c.peoples.classification)}</p><p class="note">${esc(c.peoples.note)}</p><p class="note">Editorial examples for review; the entire worldwide list has not been individually source-verified.</p>${link(c.peoples.historyReading,'History reading')} · ${link(c.peoples.currentReading,'Indigenous / minority reading')}`:`<p class="note">No distinct entry has been curated for this special cartographic unit. It would be misleading to assign a national tribe or ancient people automatically.</p>`;
 let atlas=section('Capital city',`<p>${capText}</p>${c.capitalNote?`<p class="note">${esc(c.capitalNote)}</p>`:''}${c.capitalSource?link(c.capitalSource):''}`)+section('Currency',`<p>${cur}</p>${c.currencyNote?`<p class="note">${esc(c.currencyNote)}</p>`:''}${c.currencySource?link(c.currencySource):''}`)+section('Land borders & neighbours',`<div class="chips">${neighbours.map(n=>`<button data-country-select="${esc(n.code)}">${esc(n.name)}</button>`).join('')}</div>${!neighbours.length?`<p class="note">${c.type.includes('Special')||!c.unMember?'No land-neighbour entry in the country-facts dataset.':'No land neighbours listed.'}</p>`:''}${boundary}`)+section('Seas, gulfs & bays',cards(cs.filter(f=>f.kind==='sea'),c.landlocked?'No ocean-connected coastal sea. Inland lakes, if relevant, appear under geography.':'No named adjacent sea is curated here; consult the ocean-basin context below.'))+section('Ocean-basin context',oceans.length?`<p>${oceans.map(f=>esc(f.name)).join(' · ')}</p><p class="note">Selected coastal and sea-connected basins. This does not imply a direct open-ocean shoreline or an EEZ claim.</p>`:`<p class="note">${c.landlocked?'No ocean coastline: this country is landlocked.':'No ocean-basin assignment curated for this special unit.'}</p>`)+section('Important straits & passages',cards(cs.filter(f=>f.kind==='strait'),'No selected major strait is associated with this country in this atlas.'))+section('Important canals',cards(cs.filter(f=>f.kind==='canal'),'No selected major international-shipping canal is associated with this country.'))+section('Control lines, named boundaries & historical lines',cards(cs.filter(f=>f.kind==='line'),'No named line is curated for this country. Ordinary land boundaries remain visible on the map.'))+section('Historical & Indigenous peoples',people);
 let bcs=section('Country facts to revise',`<p><b>Region:</b> ${esc(c.region)} · ${esc(c.subregion)}</p><p><b>Geographic status:</b> ${esc(coast)}</p>${c.area?`<p><b>Area in source:</b> ${c.area.toLocaleString()} km²</p>`:''}<p><b>Languages in source:</b> ${esc(c.languages.join(', ')||'Not specified for this unit')}</p><p><b>UN membership:</b> ${c.unMember?'Member state':'Not listed as a UN member state in the source'}</p><p class="note">These are source-dataset facts, not a uniform current statistical census. Area definitions and political status require context.</p>`);
 const orgs=ATLAS.organisations.filter(o=>o.members.includes(selected));
 bcs+=section('Selected organisation memberships',orgs.length?orgs.map(o=>`<div class="org"><b>${esc(o.name)}</b><p>${esc(o.full)}</p><p>${o.members.length} members · established ${o.year}<br>Secretariat / institutions: ${esc(o.hq)}</p>${o.note?`<p class="note">${esc(o.note)}</p>`:''}${link(o.source,'Organisation source')}</div>`).join(''):'<p class="note">No membership among the twelve organisations covered here. This is not a statement about membership of all international organisations.</p>');
 const hq=ATLAS.headquarters.filter(o=>o.host===selected),horg=ATLAS.organisations.filter(o=>o.host===selected);
 bcs+=section('Headquarters & institutions',hq.length||horg.length?[...horg.map(o=>`<div class="org"><b>${esc(o.name)}</b><p>${esc(o.hq)} · established ${o.year}</p>${link(o.source)}</div>`),...hq.map(o=>`<div class="org"><b>${esc(o.name)}</b><p>${esc(o.city)} · established ${o.year}</p>${link(o.source)}</div>`)].join(''):'<p class="note">No selected major headquarters is curated here.</p>');
 bcs+=section('Physical geography, ports & ancient places',cards(cs.filter(f=>f.kind==='study'),'Use the capital, neighbours, region and landlocked/coastal distinction as the core revision facts.'));
 bcs+=section('Study cues',c.bcsNotes?`<ul>${c.bcsNotes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul>`:`<ul><li>Locate ${esc(c.name)} and its capital${c.capital.length>1?' / administrative seats':''}.</li><li>Match the currency name with its code.</li><li>Check neighbouring countries, region and landlocked/coastal status.</li><li>Distinguish historical peoples from modern Indigenous and heritage communities.</li></ul>`);
 bcs+=section('Explore more study topics',`<button id="country-topics-shortcut" class="primary">Open topics for ${esc(c.name)}</button>`);if(c.unNote)bcs+=section('UN status clarification',`<p>${esc(c.unNote)}</p>`);if(c.bcsSources)bcs+=section('Country-specific sources',`<div class="sources-small">${c.bcsSources.map(([n,s])=>link(s,n)).join('')}</div>`);
 bcs+=section('Revision context','<p class="note">Use the Topic coverage button for the source-backed topic selection. Old question keys are dated evidence of topics, not proof that their answers remain current. This atlas covers map-related general knowledge, not the whole BCS syllabus.</p>');
 details.innerHTML=`<div class="pane-head"><span class="eyebrow">${esc(c.region)} · ${esc(c.code)}</span><button class="close-pane" id="close-pane" aria-label="Close country details">×</button><h1>${esc(c.name)}</h1><p>${esc(c.official)}</p><div class="pane-tabs" role="tablist" aria-label="Country detail sections"><button role="tab" id="atlas-tab" data-tab="atlas" aria-controls="tab-atlas" aria-selected="true">Country atlas</button><button role="tab" id="bcs-tab" data-tab="bcs" aria-controls="tab-bcs" aria-selected="false">Study</button><button role="tab" id="topics-tab" data-tab="topics" aria-controls="tab-topics" aria-selected="false">Topics</button></div></div><div class="pane-body"><div class="summary"><div><label>Geographic status</label><strong>${esc(coast)}</strong></div><div><label>Map entity</label><strong>${esc(c.type)}</strong></div></div><button class="focus-button" id="focus-country">Focus on ${esc(c.name)}</button>${c.dataNote?`<p class="note">${esc(c.dataNote)}</p>`:''}<div id="tab-atlas" class="panel-tab" role="tabpanel" aria-labelledby="atlas-tab">${atlas}</div><div id="tab-bcs" class="panel-tab" role="tabpanel" aria-labelledby="bcs-tab" hidden>${bcs}</div><div id="tab-topics" class="panel-tab" role="tabpanel" aria-labelledby="topics-tab" hidden></div></div>`;
 document.getElementById('close-pane').onclick=closePane;document.getElementById('focus-country').onclick=()=>focusCountry(selected);
 details.querySelectorAll('[data-tab]').forEach(b=>{b.onclick=()=>{currentTab=b.dataset.tab;details.querySelectorAll('[data-tab]').forEach(t=>t.setAttribute('aria-selected',t.dataset.tab===currentTab));document.getElementById('tab-atlas').hidden=currentTab!=='atlas';document.getElementById('tab-bcs').hidden=currentTab!=='bcs';document.getElementById('tab-topics').hidden=currentTab!=='topics';if(currentTab==='topics')renderCountryTopics()}});
 document.getElementById('country-topics-shortcut').onclick=()=>document.getElementById('topics-tab').click();details.querySelectorAll('[data-country-select]').forEach(b=>b.onclick=()=>selectCountry(b.dataset.countrySelect));
}
const search=document.getElementById('country-search'),results=document.getElementById('search-results');
function closeSearch(){results.classList.remove('open');search.setAttribute('aria-expanded','false')}
function searchCountries(){const q=search.value.trim().toLocaleLowerCase();if(!q){closeSearch();return}const matches=allCountries.filter(c=>[c.name,c.official,c.code,...c.aliases].some(n=>n.toLocaleLowerCase().includes(q))).sort((a,b)=>(a.name.toLowerCase().startsWith(q)?-1:0)-(b.name.toLowerCase().startsWith(q)?-1:0)).slice(0,14);results.innerHTML=matches.length?matches.map(c=>`<button data-match="${esc(c.code)}">${esc(c.name)}<small>${esc(c.region)} · ${esc(c.code)}</small></button>`).join(''):'<p style="padding:12px">No matching country. Try its common name or ISO code.</p>';results.classList.add('open');search.setAttribute('aria-expanded','true');results.querySelectorAll('button').forEach(b=>b.onclick=()=>selectCountry(b.dataset.match))}
search.addEventListener('input',searchCountries);search.addEventListener('focus',()=>{if(search.value)searchCountries()});search.addEventListener('keydown',e=>{if(e.key==='Escape')closeSearch();if(e.key==='Enter'){const b=results.querySelector('button');if(b){e.preventDefault();selectCountry(b.dataset.match)}}if(e.key==='ArrowDown'){const b=results.querySelector('button');if(b){e.preventDefault();b.focus()}}});
document.addEventListener('click',e=>{if(!e.target.closest('.searchbox'))closeSearch()});
document.getElementById('zoom-in').onclick=()=>svg.transition().duration(200).call(zoom.scaleBy,1.6);document.getElementById('zoom-out').onclick=()=>svg.transition().duration(200).call(zoom.scaleBy,1/1.6);document.getElementById('fit-world').onclick=()=>svg.transition().duration(400).call(zoom.transform,d3.zoomIdentity);
for(const id of ['oceans','passages','lines','study'])document.getElementById('layer-'+id).onchange=layoutLabels;
const dialog=document.getElementById('info-dialog');document.getElementById('close-dialog').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
function openDialog(title,body){document.getElementById('dialog-title').textContent=title;document.getElementById('dialog-body').innerHTML=body;dialog.showModal()}
document.getElementById('country-index-btn').onclick=()=>{openDialog('Country index',`<p>Select a country name to open its details. Includes countries, territories and special map units; this list is not a count of sovereign states.</p><label class="country-index-label" for="country-picker">Country or territory</label><select class="country-picker" id="country-picker"><option value="">Choose a country…</option>${allCountries.map(c=>`<option value="${esc(c.code)}">${esc(c.name)}</option>`).join('')}</select><div class="country-index">${allCountries.map(c=>`<button data-index="${esc(c.code)}">${esc(c.name)}</button>`).join('')}</div>`);document.getElementById('country-picker').onchange=e=>{if(e.target.value){dialog.close();selectCountry(e.target.value)}};document.querySelectorAll('[data-index]').forEach(b=>b.onclick=()=>{dialog.close();selectCountry(b.dataset.index)})};
const syllabusUrl='https://bpsc.gov.bd/pages/psc-exams/৫০তম-বি-সি-এস-পরীক্ষা-২০২৫-এর-প্রিলিমিনারি-টেস্টের-mcq-type-সিলেবাস-299ca4-69568a5d35ce18e1c05ad0af';
document.getElementById('study-btn').onclick=()=>openDialog('Topic coverage & question patterns',`
<span class="eyebrow">Research snapshot · 8 October 2026</span><p>This atlas focuses on the map-related parts of Bangladesh Affairs, International Affairs, and Geography, Environment & Disaster Management. It is a geography companion, not a complete BCS course.</p>
<p>The exam-specific <b>50th BCS preliminary syllabus</b> assigns <b>25 marks to Bangladesh Affairs, 25 to International Affairs, and 10 to Geography / Environment / Disaster Management</b>. The generic BPSC overview still displays the older 30 / 20 / 10 allocation. Follow the syllabus for your particular examination. ${link(syllabusUrl,'BPSC exam-specific syllabus')}</p>
<h3>What the sampled questions support</h3><table><thead><tr><th>Observed topic</th><th>Added to the atlas</th></tr></thead><tbody>
<tr><td>45th: landlocked-country identification</td><td>Landlocked status and neighbouring countries for every country with source data.</td></tr>
<tr><td>45th: ancient Troy location; IRRI location</td><td>Ancient cities / archaeological places and major organisation / institute locations.</td></tr>
<tr><td>44th: organisation membership and WEF meeting venue</td><td>Selected complete membership lists; headquarters versus meeting-venue distinctions.</td></tr>
<tr><td>47th, Q123: Bangladesh and the Hormuz–Malacca corridor</td><td>Straits, adjoining waters, separating landmasses and Bangladesh maritime context.</td></tr>
<tr><td>47th: longitude/time and OPEC founding context</td><td>Greenwich, ideal solar-time rule, institutional founding years and headquarters.</td></tr>
<tr><td>Syllabus: national and global geography, environment, regional relationships</td><td>Rivers, lakes, mountains, deserts, ports, border lines and Bangladesh conservation / disaster topics.</td></tr>
</tbody></table><p class="note">This is a qualitative review of accessible syllabus and question reproductions. It is not a full-paper frequency analysis or a prediction of future questions. Publisher solutions are used to identify topics; selected time-sensitive facts are checked against official sources.</p>
<h3>Current-answer traps addressed</h3><ul><li>ASEAN has 11 members after Timor-Leste’s 2025 accession; a 2022 answer key may still say 10.</li><li>D-8 now includes Azerbaijan as its ninth member despite its unchanged name.</li><li>Sweden and Finland are NATO members.</li><li>Bulgaria uses the euro from January 2026; Zimbabwe’s domestic currency is ZiG (ZWG).</li><li>Kotte versus Colombo, Amsterdam versus The Hague, and Sucre versus La Paz require capital / government-seat distinctions.</li><li>The Korean DMZ does not simply follow the 38th parallel; a historical division line is not automatically a current boundary.</li></ul>
<h3>Read the evidence</h3><div class="sources-small">${link(syllabusUrl,'BPSC: 50th preliminary syllabus')}${link('https://bpsc.gov.bd/pages/static-pages/691997b3933eb65569dde2bf','BPSC: generic examination overview')}${link('https://somadhan.app/job-question-bank/bcs-preliminary/past-papers/44th','44th: question reproduction (partial paper)')}${link('https://bcsanalysis.com/45th-bcs-preliminary-question/','45th: question reproduction')}${link('https://web.livemcq.com/core/uploads/2025/09/47th-BCS-Preliminary-Question-Solution-PDF.pdf','47th: publisher paper / solutions')}${link('https://asean.org/about-asean/','ASEAN: current membership')}${link(ATLAS.organisations.find(o=>o.name==='D-8').source,'D-8: Azerbaijan accession')}${link(ATLAS.organisations.find(o=>o.name==='NATO').source,'NATO: members')}</div>
<h3>Revision beyond this map</h3><p>Bangladesh’s constitution, liberation history, economy, national institutions, current affairs, international-law concepts, treaties, and disaster-management methods require separate study. Their entire syllabus is not silently compressed into this map. Leaders, recent appointments, GDP and population rankings are omitted unless backed by a specifically dated record.</p>`);
document.getElementById('sources-btn').onclick=()=>openDialog('Sources, licences & map notes',`
<p><b>Downloaded 8 October 2026.</b> The GitHub Pages edition loads local JSON and its bundled D3 library. It makes no third-party map-tile or live API requests. The reference links require internet access.</p>
<table><tr><th>Content</th><th>Source / licence</th></tr><tr><td>Country polygons and label positions</td><td>${link('https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/','Natural Earth 1:10 million')}. Public domain. Coordinates rounded to four decimal places for this file.</td></tr><tr><td>Capital-marker locations</td><td>Natural Earth populated places, with annotated location corrections. Public domain.</td></tr><tr><td>Capitals, currency, neighbours, language and area</td><td>${link('https://github.com/mledoze/countries','mledoze/countries')}. ODbL 1.0. See the accompanying dataset and licence for reuse.</td></tr><tr><td>Vector rendering and zoom</td><td>${link('https://github.com/d3/d3','D3 7.9.0')}. ISC licence.</td></tr><tr><td>Seas, straits, canals, lines and physical features</td><td>Editorial selection with individual reference / further-reading links. Marker positions are approximate educational locators, not traced navigation or legal boundaries.</td></tr><tr><td>Historical and Indigenous / heritage peoples</td><td>Representative editorial examples. General further reading: ${link('https://www.iwgia.org/en/paises','IWGIA country reports')} and ${link('https://minorityrights.org/','Minority Rights Group')}. The complete worldwide editorial table is not individually verified.</td></tr></table>
<h3>Political and historical context</h3><p>Natural Earth generally uses de facto cartographic boundaries. Disputed territories and special units remain labelled. The map is a generalised source snapshot, not a live statement of sovereignty or military control. Country-facts neighbours may use a different boundary convention from map polygons.</p><p>Orange cross markers locate named lines. Dashed line overlays for selected Korea, Cyprus, Golan and India–Pakistan contexts follow downloaded Natural Earth snapshot geometry, preserving source classifications including “please verify”. Other lines remain location markers. Dashed parallel overlays are latitude references, not automatically borders. Historical peoples are associated with a region in a period, not exclusively with a modern country or a guaranteed line of descent.</p>
<h3>Zoom and the later PDF</h3><p>Vector geometry stays crisp while zooming (up to 2048× here), but the 1:10-million source has finite geographic detail. After HTML review, the planned PDF will use internal country-name links to detail pages and return links to the map. Ordinary PDFs cannot reproduce the HTML’s dynamic panel or add infinite geographic detail.</p>
<h3>Expanded topic datasets</h3><p>NobelPrize.org supplies prize names, years, categories, reported birthplace and award affiliation. Country tags are not nationality counts. IPU Parline supplies parliamentary structures and chamber names under CC BY-NC-SA 4.0. Curated topic entries have source links and dated scope. BRICS and OPEC source discrepancies are retained in their records.</p><p><a href="https://data.nobelprize.org/specification/2.0/" target="_blank" rel="noopener">Nobel data attribution</a> · <a href="https://www.ipu.org/terms-use" target="_blank" rel="noopener">IPU terms</a></p><h3>Verified corrections & Bangladesh sources</h3><div class="sources-small">${link('https://www.gov.za/about-sa/south-africas-provinces','South Africa: capitals')}${link(records.LKA.capitalSource,'Sri Lanka: Kotte')}${link('https://www.six-group.com/en/products-services/financial-information/market-reference-data/data-standards.html','SIX: ISO currency updates')}${link(records.ZWE.currencySource,'Reserve Bank of Zimbabwe: ZWG')}${link('https://unmogip.unmissions.org/en/unmogip-factsheet','UNMOGIP: Line of Control')}${records.BGD.bcsSources.map(([n,s])=>link(s,n)).join('')}${link('https://www.naturalearthdata.com/about/terms-of-use/','Natural Earth terms')}</div>`);
new ResizeObserver(resize).observe(stage);resize();
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!dialog.open){closeSearch();closePane()}});

// Topic explorer shares country ids with the atlas. Associations are explicit study context.
let activeGroup=null,topicShown=24,countryTopicShown=12,countryTopicCategory='',activeControl='';
const categoryLabels=new Map(KNOWLEDGE.metadata.categories.map(x=>[x.id,x.label]));
const libraryState={category:'organisations',country:'',query:'',prize:'',year:'',structure:'',lineType:''};
function normaliseText(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase()}
const topicSearch=new Map(KNOWLEDGE.records.map(r=>[r.id,normaliseText([r.title,r.summary,r.period,...r.facts,...r.tags,...r.countries.map(c=>records[c]?.name||c)].join(' '))]));
const topicById=new Map(KNOWLEDGE.records.map(r=>[r.id,r]));
function setGroupHighlight(){
 const members=activeGroup?new Set(activeGroup.members):null;
 countries.classed('group-member',d=>members?.has(d.properties.code)||false).classed('group-outside',d=>members&&!members.has(d.properties.code));
 labels.classed('group-outside',d=>members&&!members.has(d.code));dots.classed('group-outside',d=>members&&!members.has(d.code));
}
function shortTopicCard(r){
 const countryLinks=r.countries.slice(0,6).map(c=>records[c]?`<button class="country-link" data-topic-country="${esc(c)}">${esc(records[c].name)}</button>`:'').join('');
 let awardBasis='';
 if(r.category==='nobel'){
   awardBasis=`<p class="association-note">Country association: ${r.organisationLocation?`organisation location in ${esc(r.organisationLocation)}`:r.birthCode?`birthplace in ${esc(records[r.birthCode]?.name||r.birthCode)}`:'no mapped personal birthplace'}${r.affiliationCodes.length?`; award affiliation in ${r.affiliationCodes.map(c=>esc(records[c]?.name||c)).join(', ')}`:''}. ${r.laureateType==='organisation'?'Organisation laureate.':''}</p>`;
 }
 return `<article class="topic-card" data-topic-id="${esc(r.id)}"><div class="topic-meta"><span>${esc(categoryLabels.get(r.category))}</span><span>${esc(r.period)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p>${awardBasis}<details><summary>Study details & sources</summary><ul>${r.facts.filter(Boolean).map(f=>`<li>${esc(f)}</li>`).join('')}</ul>${r.members?`<p><b>Members in the cited list</b></p><div class="topic-countries">${r.members.map(c=>`<button class="country-link" data-topic-country="${esc(c)}">${esc(records[c]?.name||c)}</button>`).join('')}</div>`:''}${r.partnerMembers?.length?`<p class="note">Partners, shown separately: ${r.partnerMembers.map(c=>esc(records[c]?.name||c)).join(', ')}. Partners are not included in the member highlight.</p>`:''}${r.formerMembers?.length?`<p class="note">Selected former members: ${r.formerMembers.map(c=>esc(records[c]?.name||c)).join(', ')}.</p>`:''}<div class="topic-sources">${r.sources.map(s=>link(s.url,s.title)).join('')}</div><p class="note">Source snapshot / reading date: ${esc(r.reviewed)}. Country tags identify the record’s stated context.</p></details><div class="topic-countries">${countryLinks}${r.countries.length>6?`<span class="note">+${r.countries.length-6} more in details</span>`:''}</div><div class="topic-actions">${r.xy?`<button data-locate-topic="${esc(r.id)}">Locate on map</button>`:''}${r.members?`<button data-members-topic="${esc(r.id)}">Highlight members</button>`:''}</div></article>`;
}
function wireTopicActions(container){
 container.querySelectorAll('[data-topic-country]').forEach(b=>b.onclick=()=>{if(dialog.open)dialog.close();dialog.classList.remove('topics-dialog');selectCountry(b.dataset.topicCountry)});
 container.querySelectorAll('[data-locate-topic]').forEach(b=>b.onclick=()=>{const r=topicById.get(b.dataset.locateTopic);if(dialog.open)dialog.close();dialog.classList.remove('topics-dialog');showLocatedTopic(r)});
 container.querySelectorAll('[data-members-topic]').forEach(b=>b.onclick=()=>{const r=topicById.get(b.dataset.membersTopic);if(dialog.open)dialog.close();dialog.classList.remove('topics-dialog');showMembershipSelection(r.title)});
}
function locateTopic(r,animate=true){
 activeMapPoint=r;
 const pt=projection(r.xy),k=10,t=d3.zoomIdentity.translate(width*.5-k*pt[0],height*.45-k*pt[1]).scale(k);
 svg.interrupt();(animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches?svg.transition().duration(400):svg).call(zoom.transform,t);
 const g=root.selectAll('.topic-locator').data([r]).join('g').attr('class','topic-locator').attr('transform',`translate(${pt}) scale(${1/transform.k})`);
 g.selectAll('*').remove();g.append('circle').attr('r',7).attr('fill','#c65d20').attr('stroke','white').attr('stroke-width',2);g.append('text').attr('x',10).attr('y',4).style('font-size','13px').attr('fill','#903d18').attr('paint-order','stroke').attr('stroke','white').attr('stroke-width',3).text(r.title);
}
function filterTopics(state){
 const q=normaliseText(state.query.trim());
 return KNOWLEDGE.records.filter(r=>
  (!state.category||r.category===state.category)&&(!state.country||r.countries.includes(state.country))&&
  (!q||topicSearch.get(r.id).includes(q))&&(!state.prize||r.prizeCategory===state.prize)&&
  (!state.year||r.year===Number(state.year))&&(!state.structure||r.structure===state.structure)&&(!state.lineType||r.lineType===state.lineType)
 ).sort((a,b)=>a.category==='nobel'&&b.category==='nobel'?(b.year-a.year)||a.title.localeCompare(b.title):a.title.localeCompare(b.title));
}
function renderCountryTopics(){
 const host=document.getElementById('tab-topics');if(!host||!selected)return;
 const state={category:countryTopicCategory,country:selected,query:'',prize:'',year:'',structure:''};
 const items=filterTopics(state),country=records[selected];
 host.innerHTML=`<section class="section"><h2>Topics linked to ${esc(country.name)}</h2><p class="note">Links mean study context. Nobel birthplace is not citizenship; treaty venues are not full party lists.</p><label class="topic-filter-label" for="country-topic-category">Topic category</label><select id="country-topic-category" class="topic-select"><option value="">All topics</option>${KNOWLEDGE.metadata.categories.map(c=>`<option value="${c.id}"${c.id===countryTopicCategory?' selected':''}>${esc(c.label)}</option>`).join('')}</select><p class="result-count">${items.length} linked records</p><div class="country-topic-list">${items.slice(0,countryTopicShown).map(shortTopicCard).join('')||'<p class="empty-topics">No curated record in this country/category combination. This does not imply the real-world topic is absent.</p>'}</div>${items.length>countryTopicShown?'<button class="load-more" id="more-country-topics">Show more</button>':''}<button class="load-more" id="open-country-library">Open full Topic Explorer</button></section>`;
 document.getElementById('country-topic-category').onchange=e=>{countryTopicCategory=e.target.value;countryTopicShown=12;renderCountryTopics()};
 if(document.getElementById('more-country-topics'))document.getElementById('more-country-topics').onclick=()=>{countryTopicShown+=12;renderCountryTopics()};
 document.getElementById('open-country-library').onclick=()=>openTopics({country:selected,category:countryTopicCategory});wireTopicActions(host);
}
function openTopics(preset={}){
 Object.assign(libraryState,preset);topicShown=24;dialog.classList.add('topics-dialog');
 openDialog('Topic Explorer',`<div class="library-intro"><span class="eyebrow">Study library</span><p>Explore institutions, history and general knowledge, or narrow the records to a country.</p></div><div class="library-layout"><nav class="topic-navigation" aria-label="Topic categories"><button data-library-category="">All topics <span>${KNOWLEDGE.records.length}</span></button>${KNOWLEDGE.metadata.categories.map(c=>`<button data-library-category="${c.id}">${esc(c.label)} <span>${KNOWLEDGE.records.filter(r=>r.category===c.id).length}</span></button>`).join('')}</nav><section class="library-content"><div class="library-filters"><label>Search topics<input id="topic-search" type="search" placeholder="Name, concept, book, author…" value="${esc(libraryState.query)}"></label><label>Country context<select id="topic-country"><option value="">All countries</option>${allCountries.map(c=>`<option value="${esc(c.code)}"${c.code===libraryState.country?' selected':''}>${esc(c.name)}</option>`).join('')}</select></label><label id="nobel-category-label" hidden>Nobel category<select id="nobel-category"><option value="">All prize categories</option><option value="peace">Peace</option><option value="literature">Literature</option><option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="medicine">Physiology or Medicine</option><option value="economics">Economic Sciences · memorial prize</option></select></label><label id="nobel-year-label" hidden>Award year<input id="nobel-year" type="number" min="1901" max="2026" placeholder="Any year" value="${esc(libraryState.year)}"></label><label id="chamber-structure-label" hidden>Parliament structure<select id="chamber-structure"><option value="">All structures</option><option>Unicameral</option><option>Bicameral</option></select></label></div><div class="library-status"><span id="topic-result-count" aria-live="polite"></span><button id="reset-topic-filters">Reset filters</button></div><p id="topic-context-note" class="association-note"></p><div id="topic-results" class="topic-results"></div><button id="more-topics" class="load-more" hidden>Show more records</button><p class="library-footnote">Curated coverage is selective. Source links and snapshot dates appear inside each record. Nobel and IPU data are downloaded snapshots; 2026 Nobel announcements may be incomplete.</p></section></div>`);
 document.querySelector('.library-filters').insertAdjacentHTML('beforeend',`<label id="control-type-label" hidden>Line classification<select id="control-type"><option value="">All classifications</option>${Object.entries(ATLAS.controlLineTypes).map(([k,v])=>`<option value="${esc(k)}">${esc(v)}</option>`).join('')}</select></label>`);
 document.getElementById('nobel-category').value=libraryState.prize;document.getElementById('chamber-structure').value=libraryState.structure;document.getElementById('control-type').value=libraryState.lineType;
 const update=()=>{libraryState.query=document.getElementById('topic-search').value;libraryState.country=document.getElementById('topic-country').value;libraryState.prize=document.getElementById('nobel-category').value;libraryState.year=document.getElementById('nobel-year').value;libraryState.structure=document.getElementById('chamber-structure').value;libraryState.lineType=document.getElementById('control-type').value;topicShown=24;renderLibraryResults()};
 document.getElementById('topic-search').oninput=update;document.getElementById('topic-country').onchange=update;document.getElementById('nobel-category').onchange=update;document.getElementById('nobel-year').oninput=update;document.getElementById('chamber-structure').onchange=update;
 document.getElementById('control-type').onchange=update;
 document.querySelectorAll('[data-library-category]').forEach(b=>b.onclick=()=>{libraryState.category=b.dataset.libraryCategory;libraryState.prize='';libraryState.year='';libraryState.structure='';document.getElementById('nobel-category').value='';document.getElementById('nobel-year').value='';document.getElementById('chamber-structure').value='';topicShown=24;renderLibraryResults()});
 document.querySelectorAll('[data-library-category]').forEach(b=>{const handler=b.onclick;b.onclick=()=>{libraryState.lineType='';document.getElementById('control-type').value='';handler()}});
 document.getElementById('reset-topic-filters').onclick=()=>{libraryState.country='';libraryState.query='';libraryState.prize='';libraryState.year='';libraryState.structure='';document.getElementById('topic-country').value='';document.getElementById('topic-search').value='';document.getElementById('nobel-category').value='';document.getElementById('nobel-year').value='';document.getElementById('chamber-structure').value='';topicShown=24;renderLibraryResults()};
 const resetHandler=document.getElementById('reset-topic-filters').onclick;document.getElementById('reset-topic-filters').onclick=()=>{libraryState.lineType='';document.getElementById('control-type').value='';resetHandler()};
 document.getElementById('more-topics').onclick=()=>{topicShown+=24;renderLibraryResults()};renderLibraryResults();
}
function renderLibraryResults(){
 const items=filterTopics(libraryState),host=document.getElementById('topic-results');
 host.innerHTML=items.slice(0,topicShown).map(shortTopicCard).join('')||'<div class="empty-topics">No matching curated records. Try another country, category, spelling or year.</div>';
 document.getElementById('topic-result-count').textContent=`${items.length} records · showing ${Math.min(items.length,topicShown)}`;
 document.getElementById('more-topics').hidden=items.length<=topicShown;
 document.getElementById('nobel-category-label').hidden=libraryState.category!=='nobel';document.getElementById('nobel-year-label').hidden=libraryState.category!=='nobel';document.getElementById('chamber-structure-label').hidden=libraryState.category!=='legislatures';
 document.getElementById('control-type-label').hidden=libraryState.category!=='control-lines';
 document.querySelectorAll('[data-library-category]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.libraryCategory===libraryState.category?'true':'false'));
 document.getElementById('topic-context-note').textContent=libraryState.category==='nobel'?'Nobel country filter = recorded birthplace or award-time affiliation, not nationality. An organisational laureate has no personal birthplace.':libraryState.category==='treaties'||libraryState.category==='protocols'?'Country tags indicate adoption/signature venues or selected context. They are not a list of states that signed or ratified the instrument.':libraryState.category==='legislatures'?'Inter-Parliamentary Union, Parline: source snapshot 8 October 2026. Suspended chambers and source discrepancies remain visible.':libraryState.category==='movements'?'Historical armed-movement entries. Later political parties, successor groups and present legal designations require separate sources.':'Modern country tags give study context; historical societies and wars did not follow today’s borders.';
 if(libraryState.category==='control-lines')document.getElementById('topic-context-note').textContent='Military control, armistice, withdrawal and buffer-zone lines are distinct from agreed borders and historical parallels. Dashed routes are generalised source snapshots; crosses are approximate locators.';
 wireTopicActions(host);
}
document.getElementById('topics-btn').onclick=()=>openTopics({country:'',query:''});
dialog.addEventListener('close',()=>dialog.classList.remove('topics-dialog'));
const previousClosePane=closePane;
closePane=function(){previousClosePane();root.selectAll('.topic-locator').remove()};
const previousLayoutLabels=layoutLabels;
layoutLabels=function(){previousLayoutLabels();root.selectAll('.topic-locator').attr('transform',d=>`translate(${projection(d.xy)}) scale(${1/transform.k})`);updateControlRoutes()};

// Source-drawn routes remain separate from approximate named-line marker positions.
const controlTopics=KNOWLEDGE.records.filter(r=>r.category==='control-lines');
const controlRouteGroup=root.insert('g',()=>refsGroup.node()).attr('class','control-route-group');
const controlPaths=controlRouteGroup.selectAll('path').data(ATLAS.controlRoutes?.features||[]).join('path').attr('class','control-route').attr('data-route-group',d=>d.properties.group).attr('fill','none').attr('stroke','#a34f24').attr('stroke-width',1.8).attr('stroke-dasharray','5 3').attr('vector-effect','non-scaling-stroke');
controlPaths.append('title').text(d=>`${d.properties.sourceName} · ${d.properties.sourceClass} · Natural Earth snapshot`);
function updateControlRoutes(){
 const t=controlTopics.find(x=>x.title===activeControl),route=t?.routeGroup;
 controlPaths.attr('d',path).style('display',d=>layer('lines')&&(!activeControl||route===d.properties.group)?null:'none');
 if(activeControl){featureNodes.filter(d=>d.kind==='line').style('display',d=>layer('lines')&&d.name===activeControl&&inView(projection(d.xy))?null:'none');references.style('display','none');}
}
function setControlSelection(name){activeControl=name;const t=controlTopics.find(r=>r.title===activeControl);document.getElementById('layer-lines').checked=true;if(t)locateTopic(t);else root.selectAll('.topic-locator').remove();layoutLabels()}
controlPaths.on('click',(e,d)=>{e.stopPropagation();openTopics({category:'control-lines',country:'',query:'',lineType:''})});
const previousSelectCountry=selectCountry;selectCountry=function(code){activeControl='';previousSelectCountry(code);setGroupHighlight()};
updateControlRoutes();

// Preserve ordinary dialog widths when moving from the library to another header action.
for(const id of ['sources-btn','study-btn','country-index-btn']){const b=document.getElementById(id),handler=b.onclick;b.onclick=()=>{dialog.classList.remove('topics-dialog');handler()};}


// One dependent category → item pair replaces the separate membership and line selectors.
const cityLocations={
 'New York':[-74,40.71],'Washington, DC':[-77.04,38.9],'London':[-.12,51.51],'Paris':[2.35,48.86],
 'Geneva':[6.14,46.2],'Rome':[12.49,41.9],'The Hague':[4.3,52.07],'Vienna':[16.37,48.21],
 'Manila':[120.98,14.6],'Beijing':[116.4,39.9],'Jeddah':[39.2,21.5],'Addis Ababa':[38.74,9.03],
 'Cairo':[31.24,30.04],'Lyon':[4.84,45.76],'Los Baños':[121.25,14.17],'Cologny':[6.19,46.215],
 'Kathmandu':[85.32,27.7],'Dhaka':[90.4,23.8],'Jakarta':[106.82,-6.18],'Istanbul':[28.98,41.01],
 'Brussels':[4.35,50.85],'Riyadh':[46.68,24.71]
};
function locateCity(label){return Object.entries(cityLocations).find(([n])=>label.includes(n))?.[1]}
const institutionChoices=[];
for(const o of ATLAS.organisations){
 const xy=locateCity(o.hq);
 institutionChoices.push({key:'institution-'+o.name,label:o.name,kind:'institution',record:{
  id:'institution-'+o.name,category:'organisations',title:o.name,summary:o.full,period:String(o.year),
  countries:o.host?[o.host]:[],facts:[`Headquarters / coordination: ${o.hq}`,`Established / coordination began: ${o.year}`,o.note||'',xy?'The map marker locates the headquarters city approximately, not the exact office building.':'No fixed headquarters-city locator is assigned.'],
  sources:o.sources||[{title:'Official institution reference',url:o.source}],tags:['institution','headquarters'],reviewed:o.reviewed,xy
 }});
}
for(const h of ATLAS.headquarters){
 let label=h.name==='Commonwealth Secretariat'?'Commonwealth':h.name==='United Nations'?'UN':h.name;
 if(institutionChoices.some(x=>x.label===label))continue;
 const xy=locateCity(h.city);
 institutionChoices.push({key:'institution-'+label,label,kind:'institution',record:{
  id:'institution-'+label,category:'organisations',title:label,summary:h.name,period:String(h.year),
  countries:[h.host],facts:[`Headquarters / venue: ${h.city}`,`Established: ${h.year}`,h.note||'',
  'Institutional location is shown here. This is not a complete member-country list.',xy?'The map marker locates the headquarters city approximately, not the exact office building.':''],
  sources:[{title:'Institution source',url:h.source}],tags:['institution','headquarters'],reviewed:'2026-10-09',xy
 }});
}
institutionChoices.sort((a,b)=>a.label.localeCompare(b.label));
function featureChoices(kind){return ATLAS.features.filter(f=>f.kind===kind&&f.name!=='Suez / Panama comparison').map((f,i)=>({key:`feature-${kind}-${i}`,label:f.name,kind:'feature',layer:kind==='study'?'study':kind==='strait'||kind==='canal'?'passages':'oceans',record:{
 id:`feature-${kind}-${i}`,category:'geography',title:f.name,summary:f.detail,period:'Geographic reference',countries:f.countries,
 facts:['The locator gives a general position, not a surveyed extent, navigation route or territorial claim.'],
 sources:[{title:'Reference / further reading',url:f.source}],tags:[kind],reviewed:'2026-10-08',xy:f.xy
 }})).sort((a,b)=>a.label.localeCompare(b.label))}
function studyChoices(category){return KNOWLEDGE.records.filter(r=>r.category===category).map(r=>({key:r.id,label:r.title,kind:category==='control-lines'?'control':'topic',record:r})).sort((a,b)=>a.label.localeCompare(b.label))}
const mountainNames=new Set(['Mount Everest','Himalayas','K2','Andes','Alps','Ural Mountains']);
const geographyChoices=featureChoices('study');
const hierarchyCategories=[
 {id:'institutions',label:'Institutions',itemLabel:'Institution',choices:institutionChoices},
 {id:'membership',label:'Membership',itemLabel:'Group / alliance',choices:ATLAS.organisations.map(o=>({key:o.name,label:o.name,kind:'membership',organisation:o,record:topicById.get('organisation-'+o.name.toLowerCase())})).sort((a,b)=>a.label.localeCompare(b.label))},
 {id:'straits',label:'Straits & passages',itemLabel:'Strait / passage',choices:featureChoices('strait')},
 {id:'canals',label:'Canals',itemLabel:'Canal',choices:featureChoices('canal')},
 {id:'control-lines',label:'Control lines & boundaries',itemLabel:'Line / boundary reference',choices:studyChoices('control-lines')},
 {id:'oceans',label:'Oceans',itemLabel:'Ocean',choices:featureChoices('ocean')},
 {id:'seas',label:'Seas, gulfs & bays',itemLabel:'Sea / gulf / bay',choices:featureChoices('sea')},
 {id:'mountains',label:'Mountains & ranges',itemLabel:'Mountain / range',choices:geographyChoices.filter(x=>mountainNames.has(x.label))},
 {id:'geography',label:'Rivers, lakes & places',itemLabel:'Geographic place',choices:geographyChoices.filter(x=>!mountainNames.has(x.label))},
 ...KNOWLEDGE.metadata.categories.filter(c=>!['organisations','geography','control-lines'].includes(c.id)).map(c=>({id:c.id,label:c.label,itemLabel:'Study item',choices:studyChoices(c.id)}))
];
const categorySelect=document.getElementById('map-category'),itemSelect=document.getElementById('map-item');
const selectionPane=document.getElementById('selection-pane'),selectionStatus=document.getElementById('selection-status');
let pickerCategory='',pickerItem='';
categorySelect.innerHTML='<option value="">Choose a category…</option>'+hierarchyCategories.map(c=>`<option value="${esc(c.id)}">${esc(c.label)}</option>`).join('');
function populateHierarchyItems(){
 const category=hierarchyCategories.find(c=>c.id===pickerCategory);
 itemSelect.disabled=!category;document.getElementById('map-item-label').textContent=category?.itemLabel||'Item';
 itemSelect.innerHTML=category?`<option value="">Choose ${esc(category.itemLabel.toLocaleLowerCase())}…</option>${category.choices.map(x=>`<option value="${esc(x.key)}">${esc(x.label)}</option>`).join('')}`:'<option value="">Choose a category first</option>';
 itemSelect.value=pickerItem;
}
function clearHierarchyEffects(){
 activeGroup=null;activeControl='';activeMapPoint=null;setGroupHighlight();root.selectAll('.topic-locator').remove();layoutLabels();
 selectionPane.hidden=true;selectionStatus.hidden=true;
}
function chooseHierarchyCategory(id){
 clearHierarchyEffects();closePane();pickerCategory=id;pickerItem='';categorySelect.value=id;populateHierarchyItems();
}
function showSelectionPanel(choice){
 const r=choice.record;selected=null;countries.classed('selected',false).classed('neighbour',false);drawCapitals();
 document.getElementById('empty-pane').hidden=true;document.getElementById('details-pane').hidden=true;selectionPane.hidden=false;
 const category=hierarchyCategories.find(c=>c.id===pickerCategory);
 const countryCodes=choice.kind==='membership'?choice.organisation.members:r.countries;
 selectionPane.innerHTML=`<div class="pane-head"><span class="eyebrow">${esc(category.label)}</span><button class="close-pane" id="close-selection" aria-label="Close selected item">×</button><h1>${esc(r.title)}</h1><p>${esc(r.summary)}</p></div><div class="pane-body">${section('Study details',`<p class="selection-period">${esc(r.period)}</p><ul>${r.facts.filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`)}${countryCodes.length?section(choice.kind==='membership'?'Countries in the cited membership list':'Country context',`<p class="note">${choice.kind==='institution'?'Headquarters / institutional-location context.':choice.kind==='membership'?'Select a country name to open its country panel.':'Country tags identify study context, not automatic membership or nationality.'}</p><div class="chips">${countryCodes.map(c=>`<button data-picker-country="${esc(c)}">${esc(records[c]?.name||c)}</button>`).join('')}</div>`):''}${section('Sources',`<div class="sources-small">${r.sources.map(s=>link(s.url,s.title)).join('')}</div>`)}<p class="note">Source snapshot / reading date: ${esc(r.reviewed)}</p>${topicById.has(r.id)?'<button class="load-more" id="picker-open-library">Open in Topic Explorer</button>':''}</div>`;
 document.getElementById('close-selection').onclick=()=>{clearHierarchyEffects();pickerItem='';itemSelect.value='';closePane()};
 selectionPane.querySelectorAll('[data-picker-country]').forEach(b=>b.onclick=()=>selectCountry(b.dataset.pickerCountry));
 if(document.getElementById('picker-open-library'))document.getElementById('picker-open-library').onclick=()=>openTopics({category:r.category,country:'',query:r.title,prize:'',year:'',structure:'',lineType:''});
 document.getElementById('country-pane').scrollTop=0;layoutLabels();
}
function applyHierarchyItem(key){
 const category=hierarchyCategories.find(c=>c.id===pickerCategory),choice=category?.choices.find(x=>x.key===key);
 clearHierarchyEffects();pickerItem=choice?key:'';itemSelect.value=pickerItem;
 if(!choice){closePane();return}
 if(choice.kind==='membership'){
  activeGroup=choice.organisation;setGroupHighlight();svg.interrupt().call(zoom.transform,d3.zoomIdentity);
  selectionStatus.textContent=`${choice.label} · ${activeGroup.members.length} countries in the cited membership list`;
 }else if(choice.kind==='control'){
  setControlSelection(choice.record.title);
  selectionStatus.textContent=`${choice.label} · ${ATLAS.controlLineTypes[choice.record.lineType]} · ${choice.record.routeGroup?'source route context':'location marker'}`;
 }else{
  if(choice.layer)document.getElementById('layer-'+choice.layer).checked=true;
  if(choice.record.xy)locateTopic(choice.record);
  selectionStatus.textContent=choice.label+(choice.kind==='institution'?' · institutional details':' · study reference');
 }
 selectionStatus.hidden=false;showSelectionPanel(choice);
}
function showMembershipSelection(name){chooseHierarchyCategory('membership');applyHierarchyItem(name)}
function showLocatedTopic(record){
 const id=record.category==='geography'?(mountainNames.has(record.title)?'mountains':'geography'):record.category;
 const category=hierarchyCategories.find(c=>c.id===id);
 if(!category)return;
 chooseHierarchyCategory(id);
 const choice=category.choices.find(c=>c.record.id===record.id||c.label===record.title);
 if(choice){
  applyHierarchyItem(choice.key);
  // Keep the library record's complete facts and sources in the side panel.
  showSelectionPanel({...choice,record});
 }else{
  if(record.xy)locateTopic(record);
  selectionStatus.textContent=record.title+' · study reference';selectionStatus.hidden=false;
  showSelectionPanel({key:record.id,label:record.title,kind:'topic',record});
 }
}
categorySelect.onchange=()=>chooseHierarchyCategory(categorySelect.value);
itemSelect.onchange=()=>applyHierarchyItem(itemSelect.value);
document.getElementById('reset-map-selection').onclick=()=>{chooseHierarchyCategory('');svg.interrupt().call(zoom.transform,d3.zoomIdentity)};
const hierarchySelectCountry=selectCountry;
selectCountry=function(code){
 selectionPane.hidden=true;
 if(pickerCategory!=='membership'){pickerItem='';itemSelect.value='';selectionStatus.hidden=true}
 hierarchySelectCountry(code);
};
const hierarchyClosePane=closePane;closePane=function(){activeMapPoint=null;hierarchyClosePane();selectionPane.hidden=true};
// Close the compact layer menu when the user clicks elsewhere; native details supports keyboards.
document.addEventListener('click',e=>{const menu=document.querySelector('.layers-menu');if(menu.open&&!menu.contains(e.target))menu.open=false});
populateHierarchyItems();

 window.ATLAS_READY=true;
}catch(error){const loading=document.getElementById('loading');loading.style.display='grid';loading.innerHTML='<span>Atlas could not load.<br><small id="load-error-detail"></small><br>For the Pages edition, use GitHub Pages or a local web server. For double-click review, open world-atlas-preview.html.</span>';document.getElementById('load-error-detail').textContent=error.message;console.error(error);window.ATLAS_LOAD_ERROR=error.message;}
})();
