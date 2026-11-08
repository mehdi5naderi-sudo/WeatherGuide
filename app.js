const $=id=>document.getElementById(id);
const TZ="Asia/Tehran";
const LOCATIONS={
tajrish:{name:"تجریش، شمال تهران",lat:35.8047,lon:51.4280},
poonak:{name:"پونک، غرب تهران",lat:35.7545,lon:51.3310},
rey:{name:"شهرری، جنوب تهران",lat:35.5938,lon:51.4390},
resalat:{name:"میدان رسالت، شرق تهران",lat:35.7388,lon:51.4945}
};
let selectedLocation=LOCATIONS.tajrish;
const fa=n=>new Intl.NumberFormat("fa-IR",{maximumFractionDigits:1}).format(n);
const clock=s=>s?new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit",timeZone:TZ}).format(new Date(s)):"—";
const date=s=>new Intl.DateTimeFormat("fa-IR",{weekday:"long",day:"numeric",month:"long",timeZone:TZ}).format(new Date(s));
const stamp=()=>new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:TZ}).format(new Date());
const val=(v,u="")=>v==null||!Number.isFinite(Number(v))?"—":fa(v)+u;
const weatherText=c=>({0:"آسمان صاف",1:"عمدتاً صاف",2:"نیمه‌ابری",3:"ابری",45:"مه",48:"مه یخ‌زده",51:"نم‌نم باران ضعیف",53:"نم‌نم باران",55:"نم‌نم باران شدید",56:"باران یخ‌زن ضعیف",57:"باران یخ‌زن",61:"باران ضعیف",63:"باران",65:"باران شدید",66:"باران یخ‌زن ضعیف",67:"باران یخ‌زن شدید",71:"برف ضعیف",73:"بارش برف",75:"برف شدید",77:"دانه‌های برف",80:"رگبار ضعیف",81:"رگبار",82:"رگبار شدید",85:"رگبار برف",86:"رگبار برف شدید",95:"رعدوبرق",96:"رعدوبرق و تگرگ",99:"رعدوبرق شدید"})[c]||"وضعیت متغیر";
const icon=c=>c===0?"☀️":c<=2?"🌤️":c===3?"☁️":c===45||c===48?"🌫️":[51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c)?"🌧️":[71,73,75,77,85,86].includes(c)?"❄️":[95,96,99].includes(c)?"⛈️":"🌥️";
const metric=(label,value,sub="")=>'<div class="metric"><div class="m-label">'+label+'</div><div class="m-value">'+value+'</div><div class="m-sub">'+sub+'</div></div>';
function buildUrl(base,params){const u=new URL(base);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,Array.isArray(v)?v.join(","):v));return u.toString()}
async function json(url){const r=await fetch(url);if(!r.ok)throw Error("HTTP "+r.status);return r.json()}
function renderWeather(d){
const c=d.current,h=d.hourly,dy=d.daily;
$("currentLocation").textContent="📍 "+selectedLocation.name;$("temp").textContent=fa(c.temperature_2m);$("weatherIcon").textContent=icon(c.weather_code);$("condition").textContent=weatherText(c.weather_code);$("feels").textContent="دمای احساسی: "+val(c.apparent_temperature,"°")+" · رطوبت "+val(c.relative_humidity_2m,"%");
$("todayMax").textContent=val(dy.temperature_2m_max[0],"°");$("todayMin").textContent=val(dy.temperature_2m_min[0],"°");$("dateNow").textContent=date(c.time);$("sunrise").textContent=clock(dy.sunrise[0]);$("sunset").textContent=clock(dy.sunset[0]);$("daylight").textContent="طول روز: "+fa((dy.daylight_duration[0]/3600).toFixed(1))+" ساعت";
$("weatherUpdated").textContent="زمان داده: "+clock(c.time);
const windDir=c.wind_direction_10m;
const dirs=["شمال","شمال‌شرق","شرق","جنوب‌شرق","جنوب","جنوب‌غرب","غرب","شمال‌غرب"];
const direction=dirs[Math.round(windDir/45)%8];
$("currentGrid").innerHTML=[
metric("رطوبت نسبی",val(c.relative_humidity_2m,"%"),"درصد رطوبت هوا"),
metric("نقطه شبنم",val(h.dew_point_2m?.[0],"°"),"دمای اشباع بخار آب"),
metric("سرعت باد",val(c.wind_speed_10m," km/h"),direction+" · "+val(windDir,"°")),
metric("تندباد",val(c.wind_gusts_10m," km/h"),"بیشینه لحظه‌ای باد"),
metric("فشار سطح دریا",val(c.pressure_msl," hPa"),"فشار تصحیح‌شده"),
metric("فشار ایستگاه",val(c.surface_pressure," hPa"),"فشار در ارتفاع تهران"),
metric("پوشش ابر",val(c.cloud_cover,"%"),"کل آسمان"),
metric("بارش فعلی",val(c.precipitation," mm"),"باران "+val(c.rain," mm")+" · رگبار "+val(c.showers," mm")),
metric("برف",val(c.snowfall," cm"),"بارش برف فعلی"),
metric("دمای تر",val(h.wet_bulb_temperature_2m?.[0],"°"),"شاخص ترکیبی گرما و رطوبت"),
metric("تابش فرابنفش",val(h.uv_index?.[0]),"شاخص UV ساعتی"),
metric("ارتفاع لایه مرزی",val(h.boundary_layer_height?.[0]," m"),"پراکندگی عمودی آلاینده‌ها")
].join("");
const now=Date.now(),start=h.time.findIndex(t=>new Date(t).getTime()>=now-3600000);
const hours=Array.from({length:24},(_,n)=>Math.max(0,start)+n).filter(i=>i<h.time.length);
$("hourly").innerHTML=hours.map(i=>'<div class="hour"><div class="time">'+(i===hours[0]?"اکنون":clock(h.time[i]))+'</div><div class="icon">'+icon(h.weather_code[i])+'</div><div class="ht">'+val(h.temperature_2m[i],"°")+'</div><div class="rain">💧 '+val(h.precipitation_probability[i],"%")+'</div><div class="wind">باد '+val(h.wind_speed_10m[i])+'</div></div>').join("");
const max=Math.max(...dy.temperature_2m_max);
$("daily").innerHTML=dy.time.map((t,i)=>'<div class="day"><div class="day-name">'+(i===0?"امروز":date(t))+'</div><div class="day-icon">'+icon(dy.weather_code[i])+' <span class="day-desc">'+weatherText(dy.weather_code[i])+'</span></div><div class="temps">'+val(dy.temperature_2m_max[i],"°")+'<span>'+val(dy.temperature_2m_min[i],"°")+'</span></div><div class="bar"><i style="width:'+Math.max(4,dy.temperature_2m_max[i]/Math.max(1,max)*100)+'%"></i></div><div class="rainchance">💧 '+val(dy.precipitation_probability_max[i],"%")+'</div></div>').join("");
$("uv").innerHTML='<div class="uv-head"><div><div class="m-label">بیشترین شاخص UV امروز</div><div class="uv-value">'+val(dy.uv_index_max[0])+'</div></div><div class="uv-caption">'+uvLabel(dy.uv_index_max[0])+'</div></div><div class="uv-scale">'+[0,1,2,3,4].map((x)=>'<i class="'+(dy.uv_index_max[0]>=x*3?"active":"")+'"></i>').join("")+'</div><div class="uv-caption">برای شاخص‌های بالا، سایه، پوشش مناسب و ضدآفتاب توصیه می‌شود.</div>';
$("extra").innerHTML=[
metric("طلوع ماه",clock(dy.moonrise?.[0]),"زمان محلی تهران"),
metric("غروب ماه",clock(dy.moonset?.[0]),"زمان محلی تهران"),
metric("مدت تابش آفتاب",fa((dy.sunshine_duration[0]/3600).toFixed(1))+" ساعت","تابش مستقیم مؤثر"),
metric("بارش کل امروز",val(dy.precipitation_sum[0]," mm"),"مجموع باران و برف"),
metric("ساعات بارندگی",val(dy.precipitation_hours[0]," ساعت"),"در طول روز"),
metric("بیشینه تندباد",val(dy.wind_gusts_10m_max[0]," km/h"),"پیش‌بینی روزانه"),
metric("تبخیر و تعرق",val(dy.et0_fao_evapotranspiration?.[0]," mm"),"ET₀ مرجع"),
metric("تابش خورشیدی",val(dy.shortwave_radiation_sum[0]," MJ/m²"),"انرژی روزانه")
].join("");
renderAlerts(d,h,dy);
}
function uvLabel(v){return v<3?"کم":v<6?"متوسط":v<8?"زیاد":v<11?"خیلی زیاد":"شدید"}
function renderAlerts(d,h,dy){
const a=[];
const max=dy.temperature_2m_max[0],min=dy.temperature_2m_min[0],gust=dy.wind_gusts_10m_max[0],rain=dy.precipitation_probability_max[0],uv=dy.uv_index_max[0];
if(max>=36)a.push(["گرمای قابل توجه","بیشینه دما "+fa(max)+" درجه؛ در ساعات گرم روز از فعالیت سنگین در فضای باز پرهیز کنید.","warn"]);
if(min<=2)a.push(["هوای سرد","کمینه دما "+fa(min)+" درجه؛ پوشش مناسب در ساعات شب و صبح لازم است.","warn"]);
if(gust>=50)a.push(["تندباد","سرعت تندباد ممکن است به "+fa(gust)+" کیلومتر بر ساعت برسد؛ اشیای سبک را ایمن کنید.","warn"]);
if(rain>=50)a.push(["احتمال بارندگی","بیشترین احتمال بارش امروز "+fa(rain)+" درصد است.","warn"]);
if(uv>=6)a.push(["تابش فرابنفش بالا","بیشینه UV برابر "+fa(uv)+" است؛ از ضدآفتاب و سایه استفاده کنید.","warn"]);
const vis=d.hourly.visibility?.[0];if(vis!=null&&vis<2000)a.push(["کاهش دید","دید افقی کمتر از ۲ کیلومتر گزارش شده است؛ رانندگی با احتیاط.","warn"]);
if(!a.length)a.push(["شرایط جوی نسبتاً آرام","در داده‌های امروز آستانه هشدار مهمی شناسایی نشد. تغییرات ساعتی را دنبال کنید.","good"]);
$("alerts").innerHTML=a.map(x=>'<div class="alert '+x[2]+'"><b>'+x[0]+'</b><p>'+x[1]+'</p></div>').join("");
}
function renderAir(a){
const c=a.current,h=a.hourly;
const aq=c.us_aqi??c.european_aqi;
const label=aq==null?"نامشخص":aq<=50?"خوب":aq<=100?"متوسط":aq<=150?"ناسالم برای گروه‌های حساس":aq<=200?"ناسالم":aq<=300?"بسیار ناسالم":"خطرناک";
$("airSummary").innerHTML='<span class="aqi-dot"></span><div><div class="aqi-label">شاخص کیفیت هوا · '+label+'</div><div class="aqi-sub">مبنای نمایش: '+(c.us_aqi!=null?"US AQI":"European AQI")+'</div></div><strong class="aqi-number">'+val(aq)+'</strong>';
$("airGrid").innerHTML=[
metric("PM₂.₅",val(c.pm2_5," µg/m³"),"ذرات ریز معلق"),
metric("PM₁₀",val(c.pm10," µg/m³"),"ذرات معلق درشت‌تر"),
metric("ازن سطح زمین",val(c.ozone," µg/m³"),"O₃"),
metric("دی‌اکسید نیتروژن",val(c.nitrogen_dioxide," µg/m³"),"NO₂"),
metric("دی‌اکسید گوگرد",val(c.sulphur_dioxide," µg/m³"),"SO₂"),
metric("مونوکسید کربن",val(c.carbon_monoxide," µg/m³"),"CO"),
metric("گردوغبار",val(c.aerosol_optical_depth),"عمق نوری آئروسل"),
metric("گرده توس",val(c.alder_pollen??c.birch_pollen," grains/m³"),"در صورت موجود بودن داده")
].join("");
$("airUpdated").textContent="زمان داده: "+clock(c.time);
}
async function load(){
$("refresh").disabled=true;$("connection").textContent="در حال دریافت داده‌ها…";
const weatherParams={latitude:selectedLocation.lat,longitude:selectedLocation.lon,timezone:TZ,forecast_days:7,wind_speed_unit:"kmh",temperature_unit:"celsius",
current:["temperature_2m","relative_humidity_2m","apparent_temperature","is_day","precipitation","rain","showers","snowfall","weather_code","cloud_cover","pressure_msl","surface_pressure","wind_speed_10m","wind_direction_10m","wind_gusts_10m",],
hourly:["temperature_2m","relative_humidity_2m","dew_point_2m","apparent_temperature","precipitation_probability","precipitation","rain","showers","snowfall","snow_depth","weather_code","pressure_msl","surface_pressure","cloud_cover","cloud_cover_low","cloud_cover_mid","cloud_cover_high","visibility","evapotranspiration","et0_fao_evapotranspiration","vapour_pressure_deficit","wind_speed_10m","wind_direction_10m","wind_gusts_10m","uv_index","uv_index_clear_sky","is_day","sunshine_duration","wet_bulb_temperature_2m","cape","freezing_level_height","boundary_layer_height","shortwave_radiation","direct_radiation","diffuse_radiation"],
daily:["weather_code","temperature_2m_max","temperature_2m_min","temperature_2m_mean","apparent_temperature_max","apparent_temperature_min","sunrise","sunset","daylight_duration","sunshine_duration","uv_index_max","uv_index_clear_sky_max","precipitation_sum","rain_sum","showers_sum","snowfall_sum","precipitation_hours","precipitation_probability_max","wind_speed_10m_max","wind_gusts_10m_max","wind_direction_10m_dominant","shortwave_radiation_sum","et0_fao_evapotranspiration","moonrise","moonset"]};
const airParams={latitude:selectedLocation.lat,longitude:selectedLocation.lon,timezone:TZ,forecast_days:5,domains:"auto",current:["us_aqi","european_aqi","pm10","pm2_5","carbon_monoxide","nitrogen_dioxide","sulphur_dioxide","ozone","aerosol_optical_depth","dust","uv_index","uv_index_clear_sky"],hourly:["us_aqi","european_aqi","pm10","pm2_5","carbon_monoxide","nitrogen_dioxide","sulphur_dioxide","ozone","aerosol_optical_depth","dust","uv_index","uv_index_clear_sky"]};
try{
const results=await Promise.allSettled([json(buildUrl("https://api.open-meteo.com/v1/forecast",weatherParams)),json(buildUrl("https://air-quality-api.open-meteo.com/v1/air-quality",airParams))]);
if(results[0].status!=="fulfilled")throw results[0].reason;
renderWeather(results[0].value);
$("lastUpdated").textContent="آخرین دریافت: "+stamp();
$("connection").textContent="● داده هواشناسی دریافت شد";$("connection").style.color="var(--green)";
if(results[1].status==="fulfilled")renderAir(results[1].value);
else{$("airSummary").innerHTML='<div class="aqi-sub">داده کیفیت هوا فعلاً در دسترس نیست؛ سایر بخش‌های هواشناسی به‌روز هستند.</div>';$("airGrid").innerHTML="";$("airUpdated").textContent="خطا در دریافت";}
}catch(e){$("connection").textContent="خطا در دریافت پیش‌بینی";$("connection").style.color="var(--red)";$("alerts").innerHTML='<div class="alert warn">ارتباط با Open-Meteo برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید. ('+String(e.message||e)+')</div>'}
finally{$("refresh").disabled=false}
}
$("refresh").addEventListener("click",load);
$("locationSelect").addEventListener("change",e=>{selectedLocation=LOCATIONS[e.target.value]||LOCATIONS.tajrish;load()});
$("dateNow").textContent=date(new Date().toISOString());
load();
