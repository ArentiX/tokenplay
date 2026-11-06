/* Anuncios propios de TokenPlay (~30 s). Edita los textos aquí. {p} = precio configurado. */
const PROMOS=[
 [['⚠️ ANUNCIO OBLIGATORIO',''],['Esto te pasa por no pagar Premium 😎','Disfrútalo, campeón'],['Mientras tú ves esto…','los Premium ya están en lo suyo'],['TOKENPLAY PREMIUM','{p}'],['Págale a Samuel','y adiós a los anuncios 👋'],['SIN ESPERAS · SIN VIDEOS','Háblale a Samuel']],
 [['¿Otra vez aquí? 👀',''],['Se te acabaron los tokens 🪙','Sí, ya sabemos'],['¿Sabes qué los salva?','TOKENPLAY PREMIUM'],['{p}','menos que un refresco grande 🥤'],['Págale a Samuel ✨','y olvídate de esperar'],['Esto no se acaba solo…','Premium sí lo acaba 😏']],
 [['Pregunta seria 🤔',''],['¿Cuánto vale tu tiempo?',''],['Esperar: gratis','Premium: {p}'],['Samuel sonríe 😄','cada vez que alguien se suscribe'],['PAGA PREMIUM 💛','y adiós a los anuncios'],['Tú decides…','el reloj sigue corriendo ⏳']]
];
let promoPaused=false,promoInt=null;
function runPromo(price,done){
 const box=document.getElementById('promo'),s=PROMOS[Math.floor(Math.random()*PROMOS.length)],per=30000/s.length;
 clearInterval(promoInt);box.hidden=false;let el=0,cur=-1;
 const scene=i=>{const [a,b]=s[i];box.style.setProperty('--h',i*55);box.innerHTML='';
  const h=document.createElement('div');h.className='pt';h.textContent=a.replace('{p}',price);
  const sub=document.createElement('div');sub.className='ps';sub.textContent=b.replace('{p}',price);
  const tag=document.createElement('div');tag.className='pg';tag.textContent='TOKENPLAY · '+(i+1)+'/'+s.length;
  box.append(tag,h,sub)};
 cur=0;scene(0);
 promoInt=setInterval(()=>{if(promoPaused)return;el+=250;const i=Math.min(s.length-1,Math.floor(el/per));
  if(i!==cur){cur=i;scene(i)}
  if(el>=30000){clearInterval(promoInt);box.hidden=true;box.innerHTML='';done()}},250)}
