const $=s=>document.querySelector(s),now=()=>Date.now();
let paused=false,wasPlaying=false,localMode=false,forcePromo=false,ytFail=false,fails=0,wd=null,promoOn=false,lastPromo=false,cfg,st,player,fsOk=false,seen=[],last=null,longs=new Set,cur=null,tickN=0;
const save=()=>sv('tp_state',st);
const show=id=>document.querySelectorAll('.screen').forEach(e=>e.hidden=e.id!==id);
function premium(){const c=ld('tp_prem');return !!c&&cfg.subs.some(s=>s.code===c&&(!s.until||new Date(s.until+'T23:59:59')>=now()))}
function modal(html){$('#mBox').innerHTML=html;$('#modal').hidden=false}
const close=()=>{$('#modal').hidden=true};
function info(){modal(`<h3>TOKENPLAY PREMIUM</h3><div class="price">${esc(cfg.price)}</div><ul style="text-align:left"><li>Sin anuncios</li><li>Sin videos de espera</li><li>Acceso ilimitado</li><li>Sin interrupciones</li><li>Sin límite de tiempo</li></ul><div class="row"><button class="btn gold" id="m1">CONTRATAR PREMIUM</button><button class="btn line" id="m2">CERRAR</button></div>`);
 $('#m1').onclick=buy;$('#m2').onclick=close}
function buy(){modal(`<h3>¡Gracias por tu interés en TokenPlay Premium!</h3><p>Para contratar tu suscripción, comunícate directamente con el administrador Samuel. Él te proporcionará el número de cuenta para realizar el depósito o te indicará cómo efectuar el pago en efectivo.</p>${cfg.contactLabel?`<p class="note">${esc(cfg.contactLabel)}</p>`:''}<div class="row"><button class="btn gold" id="m1">CONTACTAR AL ADMINISTRADOR</button><button class="btn line" id="m2">CERRAR</button></div>`);
 $('#m1').onclick=()=>{if(cfg.contactUrl)window.open(cfg.contactUrl,'_blank','noopener');else $('#m1').textContent='Contacto aún no configurado'};$('#m2').onclick=close}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function startFree(){st={phase:'free',end:now()+cfg.freeMinutes*60000,watched:0};save();show('main')}
function expire(){st.phase='gate';save();show('gate')}
function tick(){
 const pm=premium(),ph=st.phase;
 $('#adsBox').hidden=pm||ph==='free';$('#timer').hidden=!(pm||ph==='free');
 if(pm){$('#timer').textContent='PREMIUM ACTIVO';return}
 if(ph!=='free')return;
 const left=(st.end-now())/1000;$('#timer').textContent=fmt(left);if(left<=0)expire()}
/* reproducción */
function loadYT(cb){if(window.YT&&YT.Player)return cb();let ok=false;window.onYouTubeIframeAPIReady=()=>{if(ytFail)return;ok=true;cb()};const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';document.head.appendChild(s);setTimeout(()=>{if(!ok){ytFail=true;cb()}},7000)}
function pick(){const on=cfg.videos.filter(v=>v.on!==false);if(!on.length)return null;
 let pool=on.filter(v=>!seen.includes(v.id));if(!pool.length){seen=[];pool=on}
 const sh=pool.filter(v=>!longs.has(v.id));if(sh.length)pool=sh;
 const o=pool.filter(v=>v.cat!==last);if(o.length)pool=o;
 return pool[Math.floor(Math.random()*pool.length)]}
function next(){
 if(st.watched>=cfg.waitSeconds)return finish();
 const v=pick();
 if(!v||ytFail||forcePromo||!(window.YT&&YT.Player)||(!lastPromo&&Math.random()<.4)){forcePromo=false;lastPromo=true;promoOn=true;clearTimeout(wd);try{player&&player.pauseVideo()}catch(e){}
  $('#wCat').textContent='ANUNCIO TOKENPLAY';$('#wMsg').textContent=localMode?'Modo local: los videos de YouTube solo funcionan con la página publicada en internet.':'Etapa de entretenimiento en curso…';return runPromo(cfg.price,()=>{promoOn=false;next()})}
 lastPromo=false;
 cur=v;seen.push(v.id);last=v.cat;$('#wCat').textContent=v.cat;$('#wMsg').textContent='Etapa de entretenimiento en curso…';
 ld('tp_seen',[]);sv('tp_seen',seen.slice(-50));
 clearTimeout(wd);wd=setTimeout(onErr,10000);
 if(player&&player.loadVideoById)player.loadVideoById(v.id);
 else player=new YT.Player('yt',{width:'100%',height:'100%',videoId:v.id,playerVars:{autoplay:1,rel:0,modestbranding:1,playsinline:1},
  events:{onReady:e=>e.target.playVideo(),onStateChange:onState,onError:onErr}})}
function onState(e){if(e.data===1){clearTimeout(wd);fails=0;const d=player.getDuration();if(d>150)longs.add(cur.id)}if(e.data===0)next()}
function onErr(){if(promoOn)return;clearTimeout(wd);if(++fails>=3)ytFail=true;$('#wMsg').textContent='Este video no está disponible. Buscando otro…';setTimeout(next,2000)}
function startWatch(){
 st.phase='watch';save();show('watch');$('#wTimer').textContent=fmt(cfg.waitSeconds-st.watched);seen=ld('tp_seen',[]);
 const r=document.documentElement.requestFullscreen;
 if(r)r.call(document.documentElement).then(()=>fsOk=true).catch(()=>{});
 localMode=!/^https?:$/.test(location.protocol);if(localMode)ytFail=true;else loadYT(()=>{});forcePromo=true;next()}
setInterval(()=>{if(st&&st.phase==='watch'&&!paused&&(promoOn||(player&&player.getPlayerState&&player.getPlayerState()===1))){
 st.watched++;$('#wTimer').textContent=fmt(cfg.waitSeconds-st.watched);$('#wBar').style.width=Math.min(100,st.watched/cfg.waitSeconds*100)+'%';if(++tickN%5==0)save()}},1000);
function finish(){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});
 try{player&&player.stopVideo()}catch(e){};$('#fsback').hidden=true;st.phase='restore';save();$('#rX').textContent=cfg.msgs.restoreText;show('restore')}
document.addEventListener('fullscreenchange',()=>{if(st.phase==='watch'&&fsOk&&!document.fullscreenElement)$('#fsback').hidden=false});
/* pausa al salir de la pestaña o de la ventana */
const away=()=>document.visibilityState!=='visible'||!document.hasFocus();
function guard(){if(!st||st.phase!=='watch')return;const a=away();
 if(a&&!paused){paused=true;promoPaused=true;try{wasPlaying=!promoOn&&player.getPlayerState()===1;player.pauseVideo()}catch(e){}}
 else if(!a&&paused){paused=false;promoPaused=false;try{if(wasPlaying)player.playVideo()}catch(e){}}}
setInterval(guard,400);document.addEventListener('visibilitychange',guard);
/* arranque */
(async()=>{cfg=await loadCfg();st=ld('tp_state');
 $('#price').textContent=cfg.price;$('#fm').textContent=cfg.freeMinutes;
 $('#gT').textContent=cfg.msgs.expiredTitle;$('#gX').textContent=cfg.msgs.expiredText;
 $('#buy').onclick=buy;$('#gK').onclick=info;
 $('#adsGo').onclick=()=>{st.phase='gate';save();show('gate')};
 $('#gOk').onclick=startWatch;
 $('#fsGo').onclick=()=>{$('#fsback').hidden=true;document.documentElement.requestFullscreen().catch(()=>{})};
 $('#rGo').onclick=startFree;$('#modal').onclick=e=>{if(e.target.id==='modal')close()};
 $('#code').onclick=()=>{const c=(prompt('Escribe tu código Premium:')||'').trim();if(!c)return;
  if(cfg.subs.some(s=>s.code===c&&(!s.until||new Date(s.until+'T23:59:59')>=now()))){sv('tp_prem',c);show('main');tick()}else alert('Código inválido o vencido.')};
 if(!st||!st.phase){st={phase:'welcome',watched:0};save();show('main')}
 else if(['expired','gate','watch'].includes(st.phase)){st.phase='gate';show('gate')}
 else if(st.phase==='restore'){$('#rX').textContent=cfg.msgs.restoreText;show('restore')}
 else show('main');
 tick();setInterval(tick,500)})();
