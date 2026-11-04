const $ = (id) => document.getElementById(id);

const provinces = [["آذربایجان شرقی","تبریز",38.0962,46.2738,"Asia/Tehran"],["آذربایجان غربی","ارومیه",37.5527,45.0761,"Asia/Tehran"],["اردبیل","اردبیل",38.2498,48.2933,"Asia/Tehran"],["اصفهان","اصفهان",32.6546,51.668,"Asia/Tehran"],["البرز","کرج",35.84,50.9391,"Asia/Tehran"],["ایلام","ایلام",33.6374,46.4227,"Asia/Tehran"],["بوشهر","بوشهر",28.9234,50.8203,"Asia/Tehran"],["تهران","تهران",35.6892,51.389,"Asia/Tehran"],["چهارمحال و بختیاری","شهرکرد",32.3256,50.8644,"Asia/Tehran"],["خراسان جنوبی","بیرجند",32.8663,59.2211,"Asia/Tehran"],["خراسان رضوی","مشهد",36.2972,59.6067,"Asia/Tehran"],["خراسان شمالی","بجنورد",37.475,57.329,"Asia/Tehran"],["خوزستان","اهواز",31.3183,48.6706,"Asia/Tehran"],["زنجان","زنجان",36.6736,48.4787,"Asia/Tehran"],["سمنان","سمنان",35.5769,53.3921,"Asia/Tehran"],["سیستان و بلوچستان","زاهدان",29.4963,60.8629,"Asia/Tehran"],["فارس","شیراز",29.5918,52.5837,"Asia/Tehran"],["قزوین","قزوین",36.2688,50.0041,"Asia/Tehran"],["قم","قم",34.6416,50.8746,"Asia/Tehran"],["کردستان","سنندج",35.3149,46.9988,"Asia/Tehran"],["کرمان","کرمان",30.2839,57.0834,"Asia/Tehran"],["کرمانشاه","کرمانشاه",34.3142,47.065,"Asia/Tehran"],["کهگیلویه و بویراحمد","یاسوج",30.6682,51.5879,"Asia/Tehran"],["گلستان","گرگان",36.8427,54.4439,"Asia/Tehran"],["گیلان","رشت",37.2808,49.5832,"Asia/Tehran"],["لرستان","خرم‌آباد",33.4878,48.3558,"Asia/Tehran"],["مازندران","ساری",36.5633,53.0601,"Asia/Tehran"],["مرکزی","اراک",34.0917,49.6892,"Asia/Tehran"],["هرمزگان","بندرعباس",27.1865,56.2808,"Asia/Tehran"],["همدان","همدان",34.7989,48.515,"Asia/Tehran"],["یزد","یزد",31.8974,54.3569,"Asia/Tehran"]];
const provinceSelect = document.getElementById("provinceSelect");
provinces.forEach((p, index) => {
  const option = document.createElement("option");
  option.value = String(index);
  option.textContent = p[1] + " — " + p[0];
  if (p[1] === "تهران") option.selected = true;
  provinceSelect.append(option);
});

const state = {
  city: { name: "تهران", country: "ایران", admin1: "استان تهران", latitude: 35.6892, longitude: 51.3890, timezone: "Asia/Tehran" },
  busy: false
};

const faDate = (iso, options = {}) => {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long", ...options }).format(d);
};
const faNumber = (n) => new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 }).format(Math.round(n));
const fmtHour = (iso) => new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", timeZone: state.city.timezone || "Asia/Tehran" }).format(new Date(iso));
const rangeLabel = (start, end) => {
  const a = new Date(start), b = new Date(end);
  if (faDate(start) === faDate(end)) return `${faDate(start)}، حدود ${fmtHour(start)} تا ${fmtHour(end)}`;
  return `${faDate(start)} تا ${faDate(end)}`;
};
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function setStatus(message, mode = "") {
  $("statusText").textContent = message;
  $("statusDot").className = `status-dot ${mode}`;
}

function renderCards(events) {
  const host = $("cards");
  host.innerHTML = "";
  const icons = { storm:"⛈️", rain:"🌧️", snow:"❄️", wind:"💨", heat:"🥵", cold:"🥶", swing:"🌡️", fog:"🌫️" };
  events.slice(0, 3).forEach((e, i) => {
    const card = document.createElement("article");
    card.className = "event-card";
    const icon = document.createElement("div");
    icon.className = "event-icon";
    icon.textContent = icons[e.icon] || "🌤️";
    const body = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = `${i + 1}. ${e.title}`;
    const time = document.createElement("div");
    time.className = "event-time";
    time.textContent = e.time;
    const desc = document.createElement("p");
    desc.className = "event-desc";
    desc.textContent = e.description;
    const meta = document.createElement("div");
    meta.className = "event-meta";
    const importance = document.createElement("span");
    importance.className = "meta-chip";
    importance.textContent = e.level;
    meta.append(importance);
    if (e.probability != null) {
      const p = document.createElement("span");
      p.className = "meta-chip";
      p.textContent = `احتمال بارش ${faNumber(e.probability)}٪`;
      meta.append(p);
    }
    body.append(title, time, desc, meta);
    card.append(icon, body);
    host.append(card);
  });
  for (let i = events.length; i < 3; i++) {
    const empty = document.createElement("div");
    empty.className = "empty-card";
    empty.textContent = "مورد مهم دیگری در پیش‌بینی این بازه شناسایی نشده است.";
    host.append(empty);
  }
}

function analyzeWeather(data) {
  const h = data.hourly, d = data.daily;
  const events = [];
  const now = Date.now();
  const valid = h.time.map((t, i) => ({ t, i })).filter(x => new Date(x.t).getTime() >= now - 3600000);
  const at = (key, i) => h[key]?.[i] ?? null;
  const windows = (predicate) => {
    const groups = [];
    let current = [];
    for (const item of valid) {
      if (predicate(item.i)) current.push(item);
      else if (current.length) { groups.push(current); current = []; }
    }
    if (current.length) groups.push(current);
    return groups;
  };
  const bestWindow = (groups) => groups.sort((a,b) => b.length-a.length)[0] || [];

  const wetGroups = windows(i => (at("precipitation_probability",i) ?? 0) >= 45 ||
    (at("precipitation",i) ?? 0) >= 0.8 || [51,53,55,61,63,65,80,81,82,95,96,99].includes(at("weather_code",i)));
  if (wetGroups.length) {
    const g = bestWindow(wetGroups), ids = g.map(x=>x.i);
    const maxP = Math.max(...ids.map(i=>at("precipitation_probability",i) ?? 0));
    const maxMm = Math.max(...ids.map(i=>at("precipitation",i) ?? 0));
    const thunder = ids.some(i => [95,96,99].includes(at("weather_code",i)));
    const snow = ids.some(i => (at("snowfall",i) ?? 0) > 0 || [71,73,75,77,85,86].includes(at("weather_code",i)));
    if (snow) {
      events.push({icon:"snow",title:"بارش برف و احتمال لغزندگی",time:rangeLabel(g[0].t,g[g.length-1].t),
        description:"در بخشی از این بازه احتمال بارش برف وجود دارد. برای رفت‌وآمد، افت دما و لغزندگی مسیرها را در نظر بگیرید.",
        score: 58 + Math.min(20,maxP*.2) + Math.min(15,g.length*2),level:"توجه" });
    } else {
      events.push({icon:thunder?"storm":"rain",title:thunder?"بارندگی همراه با احتمال رعدوبرق":"بارندگی قابل‌توجه",
        time:rangeLabel(g[0].t,g[g.length-1].t),
        description:thunder?"نشانه‌های رعدوبرق در پیش‌بینی دیده می‌شود؛ در زمان فعالیت طوفان از فضای باز و نقاط مرتفع دوری کنید.":`احتمال بارش تا ${faNumber(maxP)}٪ و بیشینه بارش ساعتی پیش‌بینی‌شده حدود ${maxMm.toFixed(1)} میلی‌متر است.`,
        probability:maxP,score: (thunder?76:48)+Math.min(18,maxP*.18)+Math.min(12,g.length*1.5),level:thunder?"اهمیت بالا":"قابل توجه" });
    }
  }

  const windGroups = windows(i => (at("wind_gusts_10m",i) ?? 0) >= 55 || (at("wind_speed_10m",i) ?? 0) >= 40);
  if (windGroups.length) {
    const g=bestWindow(windGroups), ids=g.map(x=>x.i);
    const gust=Math.max(...ids.map(i=>at("wind_gusts_10m",i) ?? 0));
    const speed=Math.max(...ids.map(i=>at("wind_speed_10m",i) ?? 0));
    events.push({icon:"wind",title:"وزش باد شدید و تندباد",time:rangeLabel(g[0].t,g[g.length-1].t),
      description:`سرعت باد تا حدود ${faNumber(speed)} و تندباد لحظه‌ای تا ${faNumber(gust)} کیلومتر بر ساعت می‌رسد. اشیای سبک در فضای باز را ایمن کنید.`,
      score:52+clamp((gust-55)*.65,0,28)+Math.min(10,g.length),level:gust>=75?"اهمیت بالا":"قابل توجه"});
  }

  const maxT=Math.max(...(d.temperature_2m_max||[]).filter(Number.isFinite));
  const minT=Math.min(...(d.temperature_2m_min||[]).filter(Number.isFinite));
  const maxIndex=(d.temperature_2m_max||[]).indexOf(maxT);
  const minIndex=(d.temperature_2m_min||[]).indexOf(minT);
  if (maxT>=36) events.push({icon:"heat",title:"هوای بسیار گرم",time:faDate(d.time[maxIndex]),
    description:`بیشینه دمای پیش‌بینی‌شده حدود ${faNumber(maxT)} درجه است. در ساعات گرم روز فعالیت طولانی در فضای باز را محدود کنید.`,
    score:55+clamp((maxT-36)*3,0,28),level:maxT>=40?"اهمیت بالا":"قابل توجه"});
  if (minT<=0) events.push({icon:"cold",title:"سرما و احتمال یخبندان",time:faDate(d.time[minIndex]),
    description:`کمینه دما ممکن است به حدود ${faNumber(minT)} درجه برسد؛ از گیاهان حساس و لوله‌های در معرض سرما محافظت کنید.`,
    score:58+clamp(Math.abs(minT)*2,0,25),level:minT<=-5?"اهمیت بالا":"قابل توجه"});

  const dailyMax=d.temperature_2m_max||[];
  let biggest={delta:0,index:1};
  for(let i=1;i<dailyMax.length;i++){
    const delta=Math.abs((dailyMax[i]??0)-(dailyMax[i-1]??0));
    if(delta>biggest.delta) biggest={delta,index:i};
  }
  if(biggest.delta>=7){
    const direction=(dailyMax[biggest.index]??0)<(dailyMax[biggest.index-1]??0)?"کاهش":"افزایش";
    events.push({icon:"swing",title:`${direction} محسوس دما`,time:faDate(d.time[biggest.index]),
      description:`بیشینه دما نسبت به روز قبل حدود ${faNumber(biggest.delta)} درجه ${direction==="کاهش"?"کمتر":"بیشتر"} می‌شود. لباس متناسب با تغییر هوا همراه داشته باشید.`,
      score:42+clamp((biggest.delta-7)*3,0,22),level:"قابل توجه"});
  }

  const fogGroups=windows(i => (at("visibility",i) != null && at("visibility",i)<1000) || [45,48].includes(at("weather_code",i)));
  if(fogGroups.length){
    const g=bestWindow(fogGroups), minVis=Math.min(...g.map(x=>at("visibility",x.i)??1000));
    events.push({icon:"fog",title:"کاهش دید و احتمال مه",time:rangeLabel(g[0].t,g[g.length-1].t),
      description:`دید افقی ممکن است تا حدود ${faNumber(minVis)} متر کاهش یابد؛ هنگام رانندگی با احتیاط بیشتری حرکت کنید.`,
      score:50+clamp((1000-minVis)/35,0,25),level:"قابل توجه"});
  }

  events.sort((a,b)=>b.score-a.score);
  return events.slice(0,3);
}

async function loadForecast() {
  if(state.busy) return;
  state.busy=true;
  $("refreshBtn").disabled=true;
  setStatus("در حال دریافت پیش‌بینی از Open-Meteo…");
  $("cards").innerHTML='<div class="loading-card">در حال تحلیل داده‌های هفت روز آینده…</div>';
  try {
    const params=new URLSearchParams({
      latitude:state.city.latitude,longitude:state.city.longitude,
      timezone:state.city.timezone||"auto",forecast_days:"7",
      hourly:["temperature_2m","apparent_temperature","precipitation_probability","precipitation","snowfall","weather_code","wind_speed_10m","wind_gusts_10m","visibility"].join(","),
      daily:["weather_code","temperature_2m_max","temperature_2m_min","precipitation_sum","precipitation_probability_max","wind_speed_10m_max","wind_gusts_10m_max"].join(","),
      wind_speed_unit:"kmh"
    });
    const response=await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if(!response.ok) throw new Error(`خطای سرویس هواشناسی (${response.status})`);
    const data=await response.json();
    const events=analyzeWeather(data);
    renderCards(events);
    $("selectedCity").textContent=`${state.city.name}، استان ${state.city.admin1}`;
    $("updatedAt").textContent=`به‌روزرسانی: ${new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit"}).format(new Date())}`;
    setStatus("پیش‌بینی با موفقیت دریافت شد","ok");
  } catch(err) {
    setStatus(err.message || "دریافت اطلاعات ناموفق بود","error");
    $("cards").innerHTML='<div class="empty-card">اتصال به سرویس هواشناسی برقرار نشد. اتصال اینترنت را بررسی کنید و دوباره به‌روزرسانی را بزنید.</div>';
  } finally {
    state.busy=false;
    $("refreshBtn").disabled=false;
  }
}

provinceSelect.addEventListener("change", () => {
  const p = provinces[Number(provinceSelect.value)];
  state.city = { name:p[1], admin1:p[0], country:"ایران", latitude:p[2], longitude:p[3], timezone:p[4] };
  $("selectedCity").textContent = `${p[1]}، استان ${p[0]}`;
  loadForecast();
});
$("refreshBtn").addEventListener("click",loadForecast);
loadForecast();
