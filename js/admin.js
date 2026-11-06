const $=s=>document.querySelector(s);let cfg;
const hash=async t=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode('tp:'+t)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const H=ld('tp_admin');$('#lMsg').textContent=H?'Ingresa tu contraseña de administrador.':'Primera vez: crea tu contraseña de administrador (mínimo 8 caracteres).';
$('#lGo').onclick=async()=>{const p=$('#pw').value;
 if(!H){if(p.length<8)return alert('Mínimo 8 caracteres.');sv('tp_admin',await hash(p));sessionStorage.tp=1;return start()}
 if(await hash(p)===H){sessionStorage.tp=1;start()}else alert('Contraseña incorrecta.')};
$('#out').onclick=()=>{sessionStorage.clear();location.reload()};
if(sessionStorage.tp&&H)start();
async function start(){cfg=await loadCfg();$('#login').hidden=true;$('#panel').hidden=false;
 $('#fm').value=cfg.freeMinutes;$('#ws').value=cfg.waitSeconds;$('#pr').value=cfg.price;$('#cl').value=cfg.contactLabel;$('#cu').value=cfg.contactUrl;
 const L={expiredTitle:'Título del mensaje de tokens',expiredText:'Texto del mensaje de tokens',restoreText:'Texto de restablecimiento'};
 $('#mg').innerHTML='';for(const k in L){const l=document.createElement('label');l.textContent=L[k];const t=document.createElement('textarea');t.rows=2;t.id='m_'+k;t.value=cfg.msgs[k];$('#mg').append(l,t)}
 draw()}
function row(parent,text,cls,btns){const d=document.createElement('div');d.className='item '+(cls||'');const s=document.createElement('span');s.textContent=text;d.append(s);
 btns.forEach(([n,f])=>{const b=document.createElement('button');b.textContent=n;b.onclick=f;d.append(b)});parent.append(d)}
function draw(){const vl=$('#vl');vl.innerHTML='';
 cfg.videos.forEach((v,i)=>row(vl,`[${v.cat}] ${v.title||v.id}`,v.on===false?'off':'',[
  ['↑',()=>mv(i,-1)],['↓',()=>mv(i,1)],[v.on===false?'Activar':'Desactivar',()=>{v.on=v.on===false;draw()}],
  ['Categoría',()=>{v.cat=v.cat==='AUTOMOTRIZ'?'CRISTIANO':'AUTOMOTRIZ';draw()}],['Eliminar',()=>{cfg.videos.splice(i,1);draw()}]]));
 const sl=$('#sl');sl.innerHTML='';
 cfg.subs.forEach((s,i)=>row(sl,`${s.name} · código ${s.code} · ${s.until?'vence '+s.until:'sin vencimiento'}`,'',[['Eliminar',()=>{cfg.subs.splice(i,1);draw()}]]))}
function mv(i,d){const j=i+d;if(j<0||j>=cfg.videos.length)return;[cfg.videos[i],cfg.videos[j]]=[cfg.videos[j],cfg.videos[i]];draw()}
$('#vAdd').onclick=async()=>{const id=ytId($('#vu').value);const m=$('#vMsg');
 if(!id)return m.textContent='Enlace no válido.';if(cfg.videos.some(v=>v.id===id))return m.textContent='Ya está en la lista.';
 m.textContent='Comprobando…';let title='';
 try{const r=await fetch('https://www.youtube.com/oembed?format=json&url='+encodeURIComponent('https://www.youtube.com/watch?v='+id));
  if(!r.ok)return m.textContent='El video no existe o no permite incrustarse.';title=(await r.json()).title}
 catch(e){m.textContent='No se pudo verificar; agregado sin título.'}
 cfg.videos.push({id,cat:$('#vc').value,title,on:true});$('#vu').value='';if(title)m.textContent='Agregado ✓';draw()};
$('#sAdd').onclick=()=>{const n=$('#sn').value.trim();if(!n)return;
 const code=Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[b%31]).join('');
 cfg.subs.push({name:n,code,until:$('#su').value||''});$('#sn').value='';draw()};
function collect(){cfg.freeMinutes=Math.max(1,+$('#fm').value||5);cfg.waitSeconds=Math.max(10,+$('#ws').value||120);
 cfg.price=$('#pr').value;cfg.contactLabel=$('#cl').value;cfg.contactUrl=$('#cu').value;
 for(const k in cfg.msgs)if($('#m_'+k))cfg.msgs[k]=$('#m_'+k).value}
$('#sv').onclick=()=>{collect();sv('tp_cfg',cfg);$('#sMsg').textContent='Guardado en este navegador ✓'};
$('#ex').onclick=()=>{collect();const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(cfg,null,2)],{type:'application/json'}));a.download='config.json';a.click()};
$('#im').onclick=()=>$('#fi').click();
$('#fi').onchange=async e=>{try{const c=JSON.parse(await e.target.files[0].text());sv('tp_cfg',c);start()}catch(x){alert('Archivo no válido.')}};
