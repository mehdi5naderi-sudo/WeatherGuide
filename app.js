const $=id=>document.getElementById(id);
const TZ="Asia/Tehran";
const LOCATIONS={
 tajrish:{name:"تجریش",lat:35.8047,lon:51.4280},
 poonak:{name:"پونک",lat:35.7545,lon:51.3310},
 rey:{name:"شهرری",lat:35.5938,lon:51.4390},
 resalat:{name:"میدان رسالت",lat:35.7388,lon:51.4945}
};
let selectedLocation=LOCATIONS.tajrish;
const fa=n=>new Intl.NumberFormat("fa-IR",{maximumFractionDigits:0}).format(n);
const time=s=>new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit",timeZone:TZ}).format(new Date(s));
const date=s=>new Intl.DateTimeFormat("fa-IR",{weekday:"long",day:"numeric",month:"long",timeZone:TZ}).format(new Date(s));
function category(v){
 if(v==null)return {label:"بدون داده",tone:"muted"};
 if(v<=50)return {label:"خوب",tone:"good"};
 if(v<=100)return {label:"متوسط",tone:"moderate"};
 if(v<=150)return {label:"ناسالم برای گروه‌های حساس",tone:"sensitive"};
 if(v<=200)return {label:"ناسالم",tone:"unhealthy"};
 if(v<=300)return {label:"بسیار ناسالم",tone:"very"};
 return {label:"خطرناک",tone:"hazard"};
}
function url(){
 const p=new URLSearchParams({latitude:selectedLocation.lat,longitude:selectedLocation.lon,current:"us_aqi",hourly:"us_aqi",timezone:TZ,forecast_days:3});
 return "https://air-quality-api.open-meteo.com/v1/air-quality?"+p.toString();
}
async function load(){
 const button=$("refresh");button.disabled=true;$("status").textContent="در حال دریافت…";
 try{
  const response=await fetch(url());if(!response.ok)throw new Error("HTTP "+response.status);
  const data=await response.json();
  const value=data.current?.us_aqi;
  const state=category(value);
  $("place").textContent="📍 "+selectedLocation.name;
  $("currentValue").textContent=value==null?"—":fa(value);
  $("currentLabel").textContent=state.label;
  $("currentCard").className="current-card "+state.tone;
  $("updated").textContent=data.current?.time?"آخرین داده: "+time(data.current.time):"";
  const times=data.hourly?.time||[],values=data.hourly?.us_aqi||[];
  const now=new Date(data.current?.time||Date.now()).getTime();
  const entries=times.map((t,i)=>({t,v:values[i]})).filter(x=>new Date(x.t).getTime()>now&&x.v!=null).slice(0,18);
  $("forecast").innerHTML=entries.length?entries.map((x,i)=>{
   const c=category(x.v);
   return '<div class="forecast-item '+c.tone+'"><span class="forecast-time">'+(i===0?"ساعت بعد":time(x.t))+'</span><b>'+fa(x.v)+'</b><small>'+c.label+'</small></div>';
  }).join(""):'<p class="empty">پیش‌بینی ساعتی در دسترس نیست.</p>';
  $("forecastNote").textContent=entries.length?"پیش‌بینی ساعتی شاخص US AQI · به وقت تهران":"";
  $("status").textContent="● به‌روز شد";
  $("status").className="status ok";
  $("received").textContent="دریافت: "+new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:TZ}).format(new Date());
 }catch(error){
  $("status").textContent="خطا در دریافت داده";
  $("status").className="status error";
  $("forecast").innerHTML='<p class="empty">ارتباط با سرویس برقرار نشد. دوباره تلاش کنید.</p>';
  $("currentValue").textContent="—";$("currentLabel").textContent="نامشخص";
 }finally{button.disabled=false;}
}
$("locationSelect").addEventListener("change",e=>{selectedLocation=LOCATIONS[e.target.value]||LOCATIONS.tajrish;load()});
$("refresh").addEventListener("click",load);
load();
