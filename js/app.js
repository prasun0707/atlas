const KINDS={river:['Rivers','--river'],peak:['Peaks','--peak'],pass:['Passes','--pass'],valley:['Valleys','--valley'],coast:['Coasts','--coast'],park:['National parks','--park']};
let sec='India',on=new Set(Object.keys(KINDS)),sel=null;
const $=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
function el(t,a,p){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e}
const col=k=>'var('+KINDS[k][1]+')';
function root(d,n){let r=d.rivers.find(x=>x[0]==n);while(r&&r[1])r=d.rivers.find(x=>x[0]==r[1]);return r&&r[0]}
function setInfo(t,b){$('info').innerHTML='<b></b><div></div>';$('info').firstChild.textContent=t;$('info').lastChild.textContent=b}
function draw(){
 const d=DATA[sec],s=600/(d.x[1]-d.x[0]),H=(d.y[1]-d.y[0])*s,svg=$('svg');
 const P=(o,a)=>[(o-d.x[0])*s,(d.y[1]-a)*s];
 svg.setAttribute('viewBox','0 0 600 '+H.toFixed(0));svg.innerHTML='';
 const w=d.x[1]-d.x[0],step=w<=12?2:w<=40?5:w<=100?10:30;
 for(let g=Math.ceil(d.x[0]/step)*step;g<=d.x[1];g+=step){const x=P(g,0)[0];el('line',{x1:x,x2:x,y1:0,y2:H,stroke:'var(--line)','stroke-width':.6},svg)}
 for(let g=Math.ceil(d.y[0]/step)*step;g<=d.y[1];g+=step){const y=P(0,g)[1];el('line',{x1:0,x2:600,y1:y,y2:y,stroke:'var(--line)','stroke-width':.6},svg)}
 if(d.out)el('path',{d:'M'+d.out.map(p=>P(...p).join(',')).join('L')+'Z',fill:'var(--land)',stroke:'var(--mute)','stroke-width':1},svg);
 const rt=sel&&root(d,sel);
 if(on.has('river'))d.rivers.forEach(r=>{
  const pts=r[2].map(p=>P(...p)),str='M'+pts.map(p=>p.join(',')).join('L'),hot=!rt||root(d,r[0])==rt;
  const g=el('g',{opacity:hot?1:.25},svg);
  el('path',{d:str,class:'rv',stroke:col('river'),'stroke-width':(r[1]?1.6:2.6)*(sec=='India'?1:.8)},g);
  const h=el('path',{d:str,class:'rv',stroke:'transparent','stroke-width':14,tabindex:0,role:'button','aria-label':r[0]},g);
  const go=()=>{sel=r[0];const names=d.rivers.filter(x=>root(d,x[0])==root(d,r[0])).map(x=>x[0]);setInfo(r[0],r[3]+(names.length>1?' Network: '+names.join(', ')+'.':''));draw()};
  h.onclick=go;h.onkeydown=e=>{if(e.key=='Enter')go()};
  const m=pts[Math.floor(pts.length/2)];
  const t=el('text',{x:m[0]+5,y:m[1]-4,'font-size':d.fs,fill:'var(--ink)','font-style':'italic'},g);t.textContent=r[0];t.style.pointerEvents='none';
 });
 d.pts.filter(p=>on.has(p[0])).forEach(p=>{
  const [x,y]=P(p[2],p[3]),k=p[0],r=sec=='India'?5:4.5,g=el('g',{class:'pt',tabindex:0,role:'button','aria-label':p[1]},svg);
  el('circle',{cx:x,cy:y,r:14,fill:'transparent'},g);
  if(k=='peak')el('path',{d:`M${x},${y-r-1}L${x+r+1},${y+r}L${x-r-1},${y+r}Z`,fill:col(k)},g);
  else if(k=='pass')el('rect',{x:x-r+1,y:y-r+1,width:2*r-2,height:2*r-2,transform:`rotate(45 ${x} ${y})`,fill:col(k)},g);
  else if(k=='valley')el('circle',{cx:x,cy:y,r:r-.5,fill:'none',stroke:col(k),'stroke-width':2.2},g);
  else if(k=='coast')el('path',{d:`M${x-r-1},${y}q${r/2},-${r} ${r+1},0t${r+1},0`,fill:'none',stroke:col(k),'stroke-width':2.2},g);
  else el('rect',{x:x-r+.5,y:y-r+.5,width:2*r-1,height:2*r-1,rx:2,fill:col(k)},g);
  const t=el('text',{x:x+r+3,y:y+3,'font-size':d.fs,fill:'var(--ink)'},g);t.textContent=p[1];
  const go=()=>{setInfo(p[1],SING[k]+'. '+p[4])};
  g.onclick=go;g.onkeydown=e=>{if(e.key=='Enter')go()};
 });
}
function ui(){
 $('tabs').innerHTML='';
 ['World','India'].concat(sec!='World'&&sec!='India'?[sec]:[]).forEach(n=>{const b=document.createElement('button');b.textContent=n;b.setAttribute('aria-pressed',n==sec);b.onclick=()=>{sec=n;sel=null;draft=[];fillParents();setInfo(n,msg(n));ui();draw()};$('tabs').appendChild(b)});
 $('chips').innerHTML='';
 Object.keys(KINDS).forEach(k=>{const b=document.createElement('button');b.setAttribute('aria-pressed',on.has(k));b.innerHTML='<span class="dot" style="background:'+col(k)+';border-radius:'+(k=='valley'?'50%':k=='peak'?'0':'2px')+'"></span>'+KINDS[k][0];b.onclick=()=>{on.has(k)?on.delete(k):on.add(k);ui();draw()};$('chips').appendChild(b)});
}
const SING={river:'River',peak:'Peak',pass:'Pass',valley:'Valley',coast:'Coast',park:'National park'};
const KEY='atlas-custom';let CUS={},draft=[],adding=false;
try{CUS=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){CUS={}}
function applyCus(){for(const n in DATA){DATA[n].rivers=DATA[n].rivers.filter(r=>!r[4]);DATA[n].pts=DATA[n].pts.filter(p=>!p[5]);const c=CUS[n]=CUS[n]||{};c.rivers=c.rivers||[];c.pts=c.pts||[];c.rivers.forEach(r=>DATA[n].rivers.push(r));c.pts.forEach(p=>DATA[n].pts.push(p))}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(CUS))}catch(e){}}
applyCus();
function opt(s,v,t){const o=document.createElement('option');o.value=v;o.textContent=t;s.appendChild(o)}
function fillParents(){const s=$('fp');if(!s)return;s.innerHTML='';opt(s,'','Nothing (sea or lake)');DATA[sec].rivers.forEach(r=>opt(s,r[0],r[0]))}
const hint=t=>{$('fh').textContent=t};
function addUI(){
 const a=$('add');a.innerHTML='';
 const tb=document.createElement('button');tb.textContent=adding?'Close add mode':'Add data';tb.setAttribute('aria-pressed',adding);
 tb.onclick=()=>{adding=!adding;draft=[];$('svg').classList.toggle('adding',adding);addUI();draw()};a.appendChild(tb);
 if(!adding)return;
 const f=document.createElement('div');f.className='form';
 f.innerHTML=`<label>Type <select id="fk">${Object.keys(SING).map(k=>`<option value="${k}">${SING[k]}</option>`).join('')}</select></label><label>Name <input id="fn" autocomplete="off"></label><label>Note (optional) <input id="fi" autocomplete="off"></label><label id="fpl">Flows into <select id="fp"></select></label><div id="fh" class="note"></div><div class="tabs"><button id="fu">Undo point</button><button id="fs">Save</button></div><details><summary>Back up or restore my data</summary><textarea id="fj" rows="4"></textarea><div class="tabs"><button id="fc">Show my data</button><button id="fl">Load pasted data</button></div></details>`;
 a.appendChild(f);fillParents();
 const upd=()=>{const r=$('fk').value=='river';$('fpl').style.display=r?'':'none';$('fu').style.display=r?'':'none';hint(r?'Tap the map along the course, from source to mouth (2 points or more).':'Tap the map to place it.')};
 $('fk').onchange=()=>{draft=[];upd();draw()};upd();
 $('fu').onclick=()=>{draft.pop();draw()};
 $('fs').onclick=()=>{
  const k=$('fk').value,n=$('fn').value.trim(),i=$('fi').value.trim()||'Added by you.';
  if(!n)return hint('Enter a name first.');
  if(k=='river'){if(draft.length<2)return hint('Tap at least 2 points on the map.');const r=[n,$('fp').value||null,draft.slice(),i,1];CUS[sec].rivers.push(r);DATA[sec].rivers.push(r)}
  else{if(!draft.length)return hint('Tap the map to place it.');const p=[k,n,draft[0][0],draft[0][1],i,1];CUS[sec].pts.push(p);DATA[sec].pts.push(p)}
  save();draft=[];$('fn').value='';$('fi').value='';fillParents();draw();hint('Saved in this browser. Add another, or close add mode.');
 };
 $('fc').onclick=()=>{$('fj').value=JSON.stringify(CUS)};
 $('fl').onclick=()=>{try{const j=JSON.parse($('fj').value);if(!j||typeof j!='object')throw 0;CUS=j;applyCus();save();fillParents();draw();hint('Data loaded.')}catch(e){hint('That data could not be read.')}};
}
function drawDraft(){
 if(!adding||!draft.length)return;
 const d=DATA[sec],s=600/(d.x[1]-d.x[0]),svg=$('svg'),pts=draft.map(p=>[(p[0]-d.x[0])*s,(d.y[1]-p[1])*s]);
 if(pts.length>1)el('path',{d:'M'+pts.map(p=>p.join(',')).join('L'),fill:'none',stroke:'var(--ink)','stroke-width':2,'stroke-dasharray':'5 4'},svg);
 pts.forEach(p=>el('circle',{cx:p[0],cy:p[1],r:3.5,fill:'var(--panel)',stroke:'var(--ink)','stroke-width':2},svg));
}
const _draw=draw;draw=function(){_draw();drawDraft()};
$('svg').addEventListener('click',e=>{
 if(!adding)return;
 const d=DATA[sec],s=600/(d.x[1]-d.x[0]),sv=$('svg'),pt=sv.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
 const q=pt.matrixTransform(sv.getScreenCTM().inverse()),c=[+(d.x[0]+q.x/s).toFixed(2),+(d.y[1]-q.y/s).toFixed(2)];
 if($('fk').value=='river')draft.push(c);else draft=[c];
 draw();
});
const _si=setInfo;setInfo=function(t,b){
 _si(t,b);const c=CUS[sec];
 if(c&&(c.rivers.some(r=>r[0]==t)||c.pts.some(p=>p[1]==t))){
  const x=document.createElement('button');x.textContent='Remove';x.style.marginTop='8px';
  x.onclick=()=>{c.rivers=c.rivers.filter(r=>r[0]!=t);c.pts=c.pts.filter(p=>p[1]!=t);applyCus();save();sel=null;setInfo(t,'Removed.');fillParents();draw()};
  $('info').appendChild(x);
 }
};
const COUNTRIES={'Nepal':[79.5,88.5,26,30.8],'Pakistan':[60.5,77.5,23.5,37.2],'Bangladesh':[88,93,20.5,26.8],'Sri Lanka':[79.4,82,5.8,10],'Bhutan':[88.6,92.3,26.6,28.4],'Afghanistan':[60.5,75,29.3,38.5],'China':[73,135,18,54],'Japan':[128,146,30,46],'Indonesia':[95,141,-11,6],'Philippines':[116.8,127,4.5,21.2],'Thailand':[97,106,5.5,20.5],'Vietnam':[102,110,8.3,23.5],'Myanmar':[92,101.2,9.5,28.5],'Mongolia':[87.5,120,41.5,52.2],'Kazakhstan':[46.5,87.5,40.5,55.5],'Russia':[27,180,41,70],'Iran':[44,63.5,25,40],'Turkey':[26,45,36,42.2],'Saudi Arabia':[34.5,56,16,32.2],'Egypt':[24.5,37,21.7,31.8],'Morocco':[-13.5,-1,27.5,36],'Algeria':[-8.7,12,19,37.2],'Nigeria':[2.6,15,4.2,14],'Ethiopia':[33,48,3.4,15],'Kenya':[33.8,42,-4.8,5.2],'Tanzania':[29,41,-11.8,-1],'DR Congo':[12,31.5,-13.5,5.5],'Madagascar':[43,50.6,-25.7,-12],'South Africa':[16.3,33,-35,-22],'France':[-5.5,10,41.3,51.2],'Spain':[-9.5,3.5,35.9,43.9],'Italy':[6.5,18.7,36.5,47.2],'Germany':[5.8,15.2,47.2,55.1],'United Kingdom':[-8.7,2,49.8,60.9],'Switzerland':[5.9,10.6,45.7,47.9],'Norway':[4.5,31.5,57.9,71.3],'Iceland':[-24.6,-13.4,63.3,66.6],'Poland':[14,24.3,48.9,55],'Ukraine':[22,40.5,44.3,52.5],'Greece':[19.3,28.3,34.7,41.8],'United States':[-125,-66.5,24.5,49.5],'Canada':[-141,-52,41.7,70],'Mexico':[-118.5,-86.5,14.5,32.8],'Colombia':[-79.1,-66.8,-4.3,12.6],'Peru':[-81.4,-68.6,-18.4,-0.1],'Brazil':[-74,-34.5,-34,5.3],'Chile':[-76,-66.4,-56,-17.5],'Argentina':[-73.6,-53.5,-55.1,-21.7],'Australia':[112.8,154,-44,-10.5],'New Zealand':[166,179,-47.4,-34.3]};
function ensure(n){if(!DATA[n]&&COUNTRIES[n]){const b=COUNTRIES[n];DATA[n]={x:[b[0],b[1]],y:[b[2],b[3]],fs:9,out:null,rivers:[],pts:[]}}}
function msg(n){return n=='World'?'The common section: major features from every continent.':n=='India'?'Full detail for one country. Tap a river to highlight its network.':n+' has no built-in data yet. Use Add data to place its rivers, passes, peaks and more.'}
function go(n){ensure(n);applyCus();sec=n;sel=null;draft=[];setInfo(n,msg(n));ui();fillParents();draw()}
for(const n in CUS)ensure(n);
applyCus();
Object.keys(COUNTRIES).sort().forEach(n=>{const o=document.createElement('option');o.value=n;$('ctys').appendChild(o)});
$('cty').addEventListener('change',e=>{const v=e.target.value.trim(),n=Object.keys(COUNTRIES).find(k=>k.toLowerCase()==v.toLowerCase());if(n){go(n);e.target.value=''}});
addUI();ui();draw();
