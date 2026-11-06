
const ld=(k,d=null)=>{
 try{
  const v=localStorage.getItem(k);
  return v?JSON.parse(v):d;
 }catch(e){
  return d;
 }
};

const sv=(k,v)=>{
 try{
  localStorage.setItem(k,JSON.stringify(v));
 }catch(e){}
};

const DEF={
 freeMinutes:5,
 waitSeconds:120,
 price:'$50 MXN / MES',
 contactLabel:'',
 contactUrl:'',
 msgs:{
  expiredTitle:'¡Se te acabaron los tokens! 🪙',
  expiredText:'Estás en TokenPlay Free de Samuel, y lo gratis también se paga… con un ratito de anuncios. Aguanta tu ronda de entretenimiento y recuperas tu acceso. ¿O prefieres saltarte todo con Premium?',
  restoreText:'Tu periodo de espera ha finalizado. Tu acceso gratuito ha sido restablecido.'
 },
 promos:true,
 videos:[],
 subs:[]
};

async function loadCfg(){
 let c=ld('tp_cfg');

 if(!c){
  try{
   c=await(await fetch('config.json',{cache:'no-store'})).json();
  }catch(e){
   c={};
  }
 }

 return{
  ...DEF,
  ...c,
  msgs:{...DEF.msgs,...(c.msgs||{})}
 };
}

const fmt=s=>{
 s=Math.max(0,Math.ceil(s));
 return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
};

const ytId=u=>{
 u=String(u).trim();
 const m=u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/);
 return m?m[1]:/^[\w-]{11}$/.test(u)?u:null;
};
