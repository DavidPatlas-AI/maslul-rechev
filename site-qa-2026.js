(function(){
  const ready=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{
    document.documentElement.dir=document.documentElement.dir||'rtl';
    document.documentElement.lang=document.documentElement.lang||'he';
    const toast=document.createElement('div'); toast.className='qa-toast'; document.body.appendChild(toast);
    const say=(msg)=>{toast.textContent=msg;toast.classList.add('show');clearTimeout(window.__qaToastTimer);window.__qaToastTimer=setTimeout(()=>toast.classList.remove('show'),1500)};
    document.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href')||'';
      if(/^https?:\/\//.test(href)){a.target=a.target||'_blank';a.rel='noopener noreferrer'}
      if(!href || href==='#'){a.addEventListener('click',e=>{e.preventDefault();say('הכפתור הזה עדיין בבדיקה')})}
    });
    document.querySelectorAll('button').forEach(b=>{
      if(!b.getAttribute('type')) b.setAttribute('type','button');
      b.addEventListener('pointerdown',()=>b.classList.add('is-pressing'));
      b.addEventListener('pointerup',()=>b.classList.remove('is-pressing'));
      b.addEventListener('pointerleave',()=>b.classList.remove('is-pressing'));
    });
    document.querySelectorAll('img').forEach(img=>{img.loading=img.loading||'lazy'; img.decoding='async'});
    const markCurrent=()=>{try{const file=decodeURIComponent(location.pathname.split('/').pop()||'index.html');document.querySelectorAll(`a[href$="${CSS.escape(file)}"]`).forEach(a=>a.setAttribute('aria-current','page'))}catch(e){}}; markCurrent();
    const fixWide=()=>{document.querySelectorAll('body *').forEach(el=>{const r=el.getBoundingClientRect(); if(r.width>window.innerWidth+2){el.style.maxWidth='100%';el.style.boxSizing='border-box'}})};
        const enhanceTables=()=>{
      document.querySelectorAll('.fault-table').forEach(table=>{
        table.style.opacity='1'; table.style.filter='none'; table.style.background='#fff';
        table.querySelectorAll('td').forEach(td=>{td.style.setProperty('color','#1f2937','important');td.style.setProperty('opacity','1','important');td.style.setProperty('font-weight','800','important');td.style.background='#fff';});
        table.querySelectorAll('th').forEach(th=>{th.style.setProperty('color','#334155','important');th.style.setProperty('opacity','1','important');th.style.setProperty('font-weight','950','important');th.style.background='#eef6ff';});
        table.querySelectorAll('b,span').forEach(el=>{el.style.setProperty('opacity','1','important'); if(!el.className.includes('sev-')) el.style.setProperty('color','#111827','important');});
      });
    };
    enhanceTables(); setTimeout(enhanceTables,350); setTimeout(enhanceTables,1200);
    setTimeout(fixWide,300); window.addEventListener('resize',()=>setTimeout(fixWide,120));
  });
})();
(function(){
  const ready=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{
    const isHome=/(^|\/)index\.html$/.test(location.pathname)||location.pathname==='/'||document.title.includes('מסלול רכב');
    if(isHome && !document.querySelector('.premium-journey')){
      const hero=document.querySelector('.hero')||document.querySelector('.hero-panel');
      const section=document.createElement('section');
      section.className='premium-journey';
      section.innerHTML=`
        <article class="premium-card feature"><span class="tag">AUTO UX 2026</span><h3>מתחילים ממסלול קצר, לא מערימת חומר</h3><p>הדף מחלק את הלמידה למנות: תרחיש, סימולטור, בדיקה, ורק אז ספריית הפרקים.</p><a href="#library">לספריית הפרקים</a></article>
        <article class="premium-card"><span class="tag">וידאו</span><h3>שיעור פתיחה קצר</h3><p>מקום מוכן לסרטון 90 שניות שמכניס את הלומד לסיפור של תקלה אמיתית.</p><a href="chapter-01-intro.html">פתח</a></article>
        <article class="premium-card"><span class="tag">סימולטור</span><h3>מעבדה במקום קריאה</h3><p>תרגול חי: חשמל, אבחון, תקלות, ומדידה לפני שעוברים לתאוריה.</p><a href="deepseek_html_20260607_c11815.html">תרגל</a></article>
        <article class="premium-card"><span class="tag">תיק מוסך</span><h3>לומדים כמו עבודה אמיתית</h3><p>כל פרק יכול להיפתח בסיפור לקוח, נתונים, החלטה ותוצאה.</p><a href="deepseek_html_20260607_407842.html">ראה דוגמה</a></article>`;
      if(hero && hero.parentNode) hero.parentNode.insertBefore(section, hero.nextSibling);
    }
    if(!document.querySelector('.auto-dock')){
      const dock=document.createElement('nav'); dock.className='auto-dock'; dock.setAttribute('aria-label','ניווט מהיר');
      dock.innerHTML='<a href="index.html">בית</a><a href="index.html#library">פרקים</a><a href="deepseek_html_20260607_c11815.html">מעבדה</a><a href="car-logos.html">סמלים</a><a href="idf-vehicles.html">צה״ל</a>';
      document.body.appendChild(dock);
      const path=decodeURIComponent(location.pathname.split('/').pop()||'index.html');
      dock.querySelectorAll('a').forEach(a=>{if((a.getAttribute('href')||'').split('#')[0]===path)a.classList.add('active')});
    }
    document.querySelectorAll('.lesson').forEach((card,i)=>{card.style.setProperty('--delay',(i%12)*35+'ms');card.classList.add('premium-ready')});
  });
})();
(function(){
  const ready=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{
    const title=(document.title||'');
    const isChapter=/פרק\s*\d+/.test(title) || /chapter-\d+/i.test(location.pathname);
    if(!isChapter || document.querySelector('.chapter-learning-strip')) return;
    document.body.classList.add('chapter-page-ux');
    const chapterMatch=title.match(/פרק\s*(\d+)/);
    const chapterNum=chapterMatch?chapterMatch[1]:'';
    const cleanTitle=title.replace('· מאפס לרכב','').replace(/פרק\s*\d+[:：]?\s*/,'').trim();
    const kind=/סימולטור|מעבדת|מבחן|אבחון|תקלות/.test(title)?'תרגול פעיל':'למידה מודרכת';

    // ── הסברים ספציפיים לפי נושא ──
    const TOPIC_EXPLAIN = [
      [/מנוע/,     'המנוע הוא לב הרכב. לומדים איך בלוק, ראש ומכלולי הזנקה עובדים יחד. כל תקלת מנוע מתחילה בקריאת קוד DTC, מדידת לחץ ובדיקת חיישנים — לא בהחלפה.'],
      [/הזרקת דלק|Injector|מזרק/,'מערכת ההזרקה מחשבת כמות דלק בכל מחזור. מדידה: התנגודת מזרק (12–16Ω), לחץ דלק, LTFT. תוצאה שגויה = P01xx.'],
      [/הצתה|מצת|בוגי/,         'מערכת ההצתה מייצרת ניצוץ בזמן המדויק. P0300/P030x = תפרות. בדוק קודם: מצתים, חוטי בוזי, קויל. אח"כ: דחיסה.'],
      [/טורבו|Turbo|Supercharger/,'הטורבו מגביר לחץ אוויר ע"י גזי פליטה. בדוק: Boost leaks (20 PSI), משחק ציר (max 0.05mm), Wastegate. P0299 = Underboost.'],
      [/קירור|coolant|thermostat/,'מערכת הקירור מונעת התחממות יתר. בדוק: רמת נוזל, טמפ\' תקינה (88–105°C), תרמוסטט, משאבת מים, וentilatot. P0128 = תרמוסטט קר.'],
      [/שמן|לוב|oil/,            'שמן מנוע מגן, מצנן ומנקה. לחץ תקין: 30–60 PSI בריצה, 10+ PSI ב-idle. P0520 = חיישן לחץ שמן. החלפה: כל 10,000–15,000 ק"מ.'],
      [/פליטה|Exhaust|קטליזטור/, 'מערכת הפליטה מנקה גזים ומפחיתה רעש. P0420 = קטליזטור. P0300+עשן שחור = בעיה עשירה. P0171+עשן לבן = Head gasket.'],
      [/בלמים|ABS|דיסק|בלם/,     'מערכת הבלמים: דיסק/תוף, רפידות, קליפר, ABS. C-codes = תקלות שלדה. בדיקה: עובי רפידה min 3mm, דיסק min 10mm, ∆טמפ\' בין גלגלים.'],
      [/מתלה|suspension|ספרינג|זרוע/, 'מתלים מחזיקים את הרכב ומבטיחים נגיעת גלגל. רעש רוחש = bush קרוע. הליכה לצד = alignment. C-code = חיישן גובה.'],
      [/היגוי|Steering|power steering/, 'מערכת ההיגוי. EPS = חשמלי, EPAS = חצי-חשמלי. רעש בהיגוי = משאבה. C-code על זווית הגה = חיישן SAS. כיול אחרי alignment.'],
      [/גיר|transmission|DSG|CVT|ATF/, 'תיבת הגיר מעבירה כוח מהמנוע לגלגלים. חריקות בהחלפה = clutch or solenoid. P07xx = תקלות גיר. שמן מיוחד לפי יצרן.'],
      [/חשמל|בטריה|אלטרנטור|מצבר/, 'מערכת החשמל: מצבר (12–12.6V מנוחה), אלטרנטור (13.5–14.8V בריצה), פיוזים, ממסרים, חיישנים. B-codes = תקלות גוף חשמלי.'],
      [/CAN|bus|תקשורת|פרוטוקול/, 'CAN Bus = רשת בין מחשבי הרכב. מתח: CAN-H 2.5–3.5V, CAN-L 1.5–2.5V. U-codes = תקלות תקשורת. בדוק עמידות קצה: 60Ω.'],
      [/ADAS|מצלמה|רדאר|חיישן חנייה/, 'מערכות ADAS: AEB בלימה עצמאית, LKA שמירת נתיב, BSD זיהוי עיוורה. כיול חיישנים חובה אחרי תיקון פח. טמפ\' קיצוניות משפיעות.'],
      [/חשמלי|EV|טסלה|סוללה|BMS/, 'רכב חשמלי: מנוע AC/DC + ממיר + סוללת ליתיום + BMS. לא נוגעים בחבילת הסוללה בלי ניתוק HV. SOH < 80% = שקול החלפה.'],
      [/מיזוג|AC|Refrigerant|קומפרסור/, 'מערכת מיזוג: קומפרסור, condenser, evaporator, שסתום הרחבה. לחץ תקין: 30–35 PSI צד נמוך, 200–250 PSI גבוה. חובת רישיון קירור.'],
      [/אבחון|OBD|סורק|סריקה/, 'אבחון מסודר: 1) קרא קוד DTC, 2) תעד freeze frame, 3) בדוק פרמטרים חיים, 4) תכנן בדיקות, 5) בצע, 6) אפס. לא מחליפים לפני בדיקה.'],
      [/צה"ל|אט"ל|ממ"ר|IDF|מבצעי/, 'רכבי צה"ל: ג\'יפ פזגז, M113 נגמ"ש, HMMWV האמר, D9 דחפור. אבחון בשטח: minimal tools, maximum impact. TSB ממשלתי לכל כלי.'],
      [/מבחן|quiz|סיום|test/, 'מבחן המסכם 100 השאלות. לכל שאלה יש הסבר. כלל: קודם קרא שאלה, אח"כ תשובות. אם לא בטוח — שלל את הלא-הגיוניות קודם.'],
      [/מולטימדיה|audio|sound/, 'מולטימדיה: Head unit, Amplifier, Speakers. אבחון: בדוק אדמה, בדוק מתח, בדוק אות. U-codes = תקשורת. CAN-connected ברכבים מודרניים.'],
    ];
    let missionText = 'להבין את הרעיון המרכזי, לראות אותו בהקשר של מוסך אמיתי, ואז לבדוק שהידע נקלט.';
    for(const [re,ex] of TOPIC_EXPLAIN){ if(re.test(cleanTitle+title)){ missionText=ex; break; } }

    const strip=document.createElement('section');
    strip.className='chapter-learning-strip';
    strip.innerHTML=`
      <article class="chapter-learning-card primary"><span>MISSION ${chapterNum||''}</span><b>${cleanTitle||'משימת הפרק'}</b><p>${missionText}</p><div class="mini-meter"><i></i></div></article>
      <article class="chapter-learning-card"><span>SCENARIO</span><b>תיק מוסך קצר</b><p>פתח את הפרק כמו תקלה אמיתית: מה הלקוח אומר, מה בודקים קודם, ומה לא מחליפים סתם.</p></article>
      <article class="chapter-learning-card"><span>PRACTICE</span><b>${kind}</b><p>חפש בפרק פעולה אחת לבצע: מדידה, בחירה, השוואה, סימון או החלטת אבחון.</p></article>
      <article class="chapter-learning-card"><span>CHECK</span><b>בדיקת הבנה</b><p>בסיום הפרק נסה להגיד במשפט אחד: מה התקלה, מה הסימן, ומה הפתרון הסביר.</p></article>`;
    const anchor=document.querySelector('.section-header')||document.querySelector('header')||document.querySelector('.hero')||document.querySelector('.container')||document.body.firstElementChild;
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(strip, anchor.nextSibling);
    const note=document.createElement('div');
    note.className='chapter-focus-note';
    note.innerHTML='<i class="dot"></i><div><strong>טיפ לימוד:</strong> <span>אל תקרא ברצף. עצור אחרי כל כרטיס ושאל: איך הייתי בודק את זה ברכב אמיתי?</span></div>';
    strip.parentNode.insertBefore(note, strip.nextSibling);
  });
})();

/* ── מילון מונחים אוטומוטיבי · Hebrew Automotive Glossary ── */
(function(){
  const GLOSSARY=[
    {t:'OBD / OBD-II',e:'שקע אבחון סטנדרטי מתחת לדשבורד. מחברים סורק ← מקבלים קודי תקלה (DTC). חובה בכל רכב מ-1996 ואילך.'},
    {t:'DTC',e:'Diagnostic Trouble Code — קוד תקלה כמו P0171 או C0035. P=מנוע, C=שלדה, B=גוף, U=תקשורת. ארבע ספרות אחרי האות.'},
    {t:'ECU / ECM',e:'מחשב המנוע. מנהל הזרקת דלק, זמן הצתה, VVT ומאות פרמטרים בשנייה. ניתן לתכנות מחדש (Reflash).'},
    {t:'MAF',e:'Mass Air Flow — חיישן זרימת אוויר. מודד גרם/שנייה. P0101/0102 = חיישן MAF. נקי עם MAF Cleaner, לא עם ממס.'},
    {t:'MAP',e:'Manifold Absolute Pressure — חיישן לחץ במניפולד. חלופה ל-MAF במנועים מסוימים. מודד kPa.'},
    {t:'Lambda / O2',e:'חיישן חמצן לפני ואחרי קטליזטור. תנודות 0.1–0.9V = תקין. קבוע 0.45V = בעיה. לאחר קטליזטור: ייצוב ב-0.6V בערך.'},
    {t:'CAN Bus',e:'רשת תקשורת בין מחשבי הרכב. CAN High ≈ 2.5–3.5V, CAN Low ≈ 1.5–2.5V. עמידות קצה: 120Ω. שיבוש = כשל מרובה-מחשבים.'},
    {t:'ABS',e:'Anti-lock Braking System — בלמים אנטי-נעילה. חיישן מהירות גלגל שולח אות ל-ABS Module. בדיקה: 1–3 Ω בחיישן.'},
    {t:'ESP / ESC',e:'Electronic Stability Program — יציבות ברצועה. משתמש ב-ABS + חיישן יצה (Yaw Rate) + זווית הגה. אם נדלק = חיישן או מעגל לחץ.'},
    {t:'VVT',e:'Variable Valve Timing — שינוי עיתוי שסתומים לפי עומס ומהירות. P0011/0021 = תקלת VVT. בדוק שמן ולחץ שמן קודם.'},
    {t:'EGR',e:'Exhaust Gas Recirculation — מחזור גזי פליטה להפחתת NOx. P0400-P0409. נסתם לעתים קרובות בדיזל. פתרון: ניקוי או החלפה.'},
    {t:'DPF',e:'Diesel Particulate Filter — מסנן חלקיקי דיזל. דורש Regen (שריפה) כל 600–1000 ק"מ. לחץ גב גבוה = סתום. נסיעה בכביש מהיר מסייעת.'},
    {t:'DSG',e:'Direct Shift Gearbox — גיר כפולת-מצמד של VAG (פולקסווגן/אאודי). DQ200 = 7 מהירויות, DQ250 = 6 מהירויות. שמן מיוחד בלבד: G052182A2.'},
    {t:'CVT',e:'Continuously Variable Transmission — גיר ורידי. חגורת פלדה + פולי משתנה. אסור ב-ATF רגיל — רק CVT fluid ייעודי.'},
    {t:'BMS',e:'Battery Management System — ברכב חשמלי: מנהל טעינה, פריקה ואיזון תאים. SOH = State of Health. איזון תאים מגן על חיי הסוללה.'},
    {t:'SOH',e:'State of Health — מצב בריאות סוללה. 100% = חדשה. מתחת ל-80% = ירידה מורגשת בטווח. מדוד עם כלי OEM בלבד.'},
    {t:'ADAS',e:'Advanced Driver Assistance Systems — סיוע לנהג: AEB בלימת חירום, LKA שמירת נתיב, ACC שמירת מרחק. לאחר תיקון פח — כייל חיישנים בהכרח.'},
    {t:'TPMS',e:'Tire Pressure Monitoring System — ניטור לחץ צמיגים. Direct = חיישן בגלגל (315/433MHz). Indirect = חישוב ABS. אפס לאחר ניפוח.'},
    {t:'VIN',e:'Vehicle Identification Number — 17 תווים. WMI (3 תווים) + VDS (6) + VIS (8). נמצא בחלון קדמי, עמוד B ובמסמכי הרכב.'},
    {t:'אט"ל',e:'אגף טכנולוגיה ולוגיסטיקה בצה"ל. אחראי על כלי רכב צבאיים: ג\'יפים, M113, HMMWV, D9, טנקים. טכנאי = ממ"ר + מחשמ"ר.'},
    {t:'Fuel Trim / LTFT',e:'STFT = תיקון דלק קצר טווח. LTFT = ארוך טווח. ±10% = נורמלי. >+15% LTFT = מצב דליל (P0171). <−15% = עשיר.'},
    {t:'P0171',e:'System Too Lean Bank 1 — מנוע מקבל מעט דלק. גורמים: זליגת אוויר, MAF מלוכלך, משאבת דלק חלשה, O2 בעייתי. בדוק בסדר הזה.'},
    {t:'P0420',e:'Catalyst Efficiency Below Threshold — קטליזטור לא מתפקד. בדוק קודם: O2 sensors, עיתוי, שמן בדלק. לא ממהרים להחליף קטליזטור.'},
    {t:'Compression Test',e:'בדיקת דחיסה בצילינדר. ערך תקין: 150–200 PSI. פחות מ-120 PSI = בעיה. הבדל >15% בין צילינדרים = חשד ל-Head Gasket.'},
    {t:'Head Gasket',e:'אטם ראש — מפריד בין כנסת הצינורות לבלוק. נשרף → קירור בצנין, עשן לבן, לחץ בכנסת. HG test: כימי + compression + cooling pressure.'},
    {t:'AFR',e:'Air-Fuel Ratio — יחס אוויר-דלק. בנזין: 14.7:1 (stoichiometric). עשיר < 14.7. דליל > 14.7. משפיע ישירות על פליטות וכוח.'},
    {t:'Wideband O2',e:'חיישן Lambda רחב-טווח. מודד AFR מ-10 עד 20. Stoichiometric = 14.7:1 לבנזין. נותן מידע עשיר יותר מחיישן O2 רגיל.'},
    {t:'לחץ דלק',e:'Fuel Pressure. בנזין הזרקה ישירה: 100–200 bar. Multi-point: 3–5 bar. ירידה בעצר = רגולטור לחוץ או משאבה חלשה.'},
    {t:'Relay',e:'ממסר — מפסק חשמלי הנשלט ע"י זרם קטן. בדיקה: מצמד שמיעה + מולטימטר. כשל נפוץ: ראשי דלק, מאוורר, אוויר מזגן.'},
    {t:'Injector',e:'מזרק דלק. מודדים: התנגדות (12–16Ω MPI, 1–5Ω GDI) + ספיקה. תיקון: ניקוי אולטרסאוניק לפני החלפה.'},
  ];

  const ready=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{
    if(document.getElementById('auto-glossary-btn')) return;
    const style=document.createElement('style');
    style.textContent=`
    #auto-glossary-btn{position:fixed;left:16px;bottom:82px;z-index:90;width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#111827,#263244);color:#fff;border:0;font-size:18px;cursor:pointer;box-shadow:0 10px 28px rgba(17,24,39,.22);display:flex;align-items:center;justify-content:center;transition:.18s}
    #auto-glossary-btn:hover{transform:scale(1.1);box-shadow:0 14px 36px rgba(17,24,39,.3)}
    #auto-glossary-panel{position:fixed;left:16px;bottom:136px;z-index:91;width:360px;max-width:calc(100vw - 32px);background:#fff;border:1px solid #d8e5f2;border-radius:24px;box-shadow:0 24px 70px rgba(17,24,39,.18);display:none;flex-direction:column;max-height:72vh;overflow:hidden;direction:rtl}
    #auto-glossary-panel.open{display:flex}
    .ag-head{padding:14px 16px;border-bottom:1px solid #e8eef5;display:flex;align-items:center;gap:10px;flex-shrink:0}
    .ag-head h3{margin:0;font-size:1rem;font-weight:900;color:#111827;white-space:nowrap}
    .ag-search{flex:1;border:1px solid #d8e5f2;border-radius:10px;padding:6px 10px;font-size:13px;background:#f8fbff;color:#111827;outline:none}
    .ag-search:focus{border-color:#2563eb}
    .ag-list{overflow-y:auto;padding:10px;flex:1}
    .ag-item{padding:10px 12px;border-radius:14px;margin-bottom:6px;border:1px solid transparent;transition:.15s}
    .ag-item:hover{background:#f1f7ff;border-color:#d0e4ff}
    .ag-term{font-size:14px;font-weight:900;color:#111827;margin-bottom:3px}
    .ag-expl{font-size:12.5px;color:#475467;line-height:1.55}
    .ag-close{background:transparent;border:0;font-size:22px;cursor:pointer;color:#667085;line-height:1;padding:0;flex-shrink:0}
    `;
    document.head.appendChild(style);

    const btn=document.createElement('button');
    btn.id='auto-glossary-btn';
    btn.title='מילון מונחים אוטומוטיבי';
    btn.textContent='📖';

    const panel=document.createElement('div');
    panel.id='auto-glossary-panel';
    panel.innerHTML='<div class="ag-head"><h3>📖 מילון מונחים</h3><input class="ag-search" id="agSearch" placeholder="חפש מונח..." autocomplete="off"><button class="ag-close" id="agClose" type="button">×</button></div><div class="ag-list" id="agList"></div>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    function renderGlossary(q){
      const list=document.getElementById('agList');
      const term=(q||'').trim().toLowerCase();
      const filtered=term?GLOSSARY.filter(x=>x.t.toLowerCase().includes(term)||x.e.toLowerCase().includes(term)):GLOSSARY;
      list.innerHTML=filtered.length?filtered.map(x=>`<div class="ag-item"><div class="ag-term">${x.t}</div><div class="ag-expl">${x.e}</div></div>`).join(''):'<div style="padding:20px;text-align:center;color:#667085;font-size:14px">לא נמצא מונח</div>';
    }
    renderGlossary('');

    btn.onclick=()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))document.getElementById('agSearch').focus();};
    document.getElementById('agClose').onclick=()=>panel.classList.remove('open');
    document.getElementById('agSearch').addEventListener('input',function(){renderGlossary(this.value);});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')panel.classList.remove('open');});
  });
})();

/* ── ניווט פרק קודם / הבא ── */
(function(){
  const C=[
    [1,'chapter-01-intro.html','מבוא לעולם הרכב'],
    [2,'deepseek_html_20260607_29d6ac.html','מערכות הרכב'],
    [3,'deepseek_html_20260607_9b0ec2.html','מילון מונחים'],
    [4,'deepseek_html_20260607_48e604.html','רכבים בישראל'],
    [5,'deepseek_html_20260607_d56776.html','תקלות נפוצות'],
    [6,'deepseek_html_20260607_9c0487.html','סורקים וכלי אבחון'],
    [7,'deepseek_html_20260607_1cf0ad.html','מפת הקורס'],
    [8,'deepseek_html_20260607_f87e18.html','סימולטור אבחון'],
    [9,'deepseek_html_20260607_c11815.html','מעבדת חשמל'],
    [10,'deepseek_html_20260607_2f27c7.html','חדר מיון תקלות'],
    [11,'deepseek_html_20260607_b52c3e.html','האקתון אבחון'],
    [12,'deepseek_html_20260607_ea3104.html','שיחת לקוח'],
    [13,'deepseek_html_20260607_ec76ac.html','מנהל מוסך'],
    [14,'deepseek_html_20260607_c9ee51.html','פענוח קודים'],
    [15,'deepseek_html_20260607_0d81b4.html','מכרז חלפים'],
    [16,'deepseek_html_20260607_937a53.html','תעודת זהות לרכב'],
    [17,'deepseek_html_20260607_dc6608.html','כיול ADAS'],
    [18,'deepseek_html_20260607_c93159.html','מעבדת CAN Bus'],
    [19,'deepseek_html_20260607_407842.html','ספר תקלות ישראלי'],
    [20,'deepseek_html_20260607_69797b.html','הסמכה חיצונית'],
    [21,'deepseek_html_20260607_2c0008.html','אנטומיה של רכב'],
    [22,'deepseek_html_20260607_4b0405.html','ספר תקלות אינטראקטיבי'],
    [23,'deepseek_html_20260607_60d8f1.html','סימולטור מולטימטר'],
    [24,'deepseek_html_20260607_520f14.html','מעבדת אוסילוסקופ'],
    [25,'deepseek_html_20260607_1939f4.html','מדריך רכב חשמלי'],
    [26,'deepseek_html_20260607_4615d8.html','סימולטור אבחון חכם'],
    [27,'deepseek_html_20260607_903597.html','סימולטור גיר אוטומטי'],
    [28,'deepseek_html_20260607_cca263.html','רכבים צבאיים וסיניים'],
    [29,'deepseek_html_20260607_f07289.html','רכבי צה״ל המלא'],
    [30,'deepseek_html_20260607_10811f.html','אט״ל'],
    [31,'deepseek_html_20260607_37674b.html','מסלול קריירה'],
    [32,'deepseek_html_20260607_03b401.html','בקרת מנוע'],
    [33,'deepseek_html_20260607_d5a1c8.html','הזרקת דלק'],
    [34,'deepseek_html_20260607_544735.html','מערכת הצתה'],
    [35,'deepseek_html_20260607_9ec25c.html','מערכת פליטה'],
    [36,'deepseek_html_20260607_122cf0.html','מיזוג אוויר'],
    [37,'deepseek_html_20260607_ceba98.html','מערכת בלמים'],
    [38,'deepseek_html_20260607_fcfbf3.html','מערכת מתלים'],
    [39,'deepseek_html_20260607_f6100a.html','מערכת היגוי'],
    [40,'deepseek_html_20260607_970f86.html','מערכת קירור'],
    [41,'deepseek_html_20260607_304cdc.html','מערכת טעינה'],
    [42,'deepseek_html_20260607_d5ee4d.html','מערכת התנעה'],
    [43,'deepseek_html_20260607_c61e09.html','מערכת תאורה'],
    [44,'deepseek_html_20260607_d20f2a.html','בקרת שיוט'],
    [45,'deepseek_html_20260607_206bb1.html','מערכת בטיחות'],
    [46,'deepseek_html_20260607_3ab88a.html','מולטימדיה'],
    [47,'deepseek_html_20260607_1c3a90.html','נעילה ואבטחה'],
    [48,'deepseek_html_20260607_2bca17.html','צמיגים וחישוקים'],
    [49,'deepseek_html_20260607_115eb2.html','דיזל'],
    [50,'deepseek_html_20260607_4dac43.html','טעינת EV'],
    [51,'deepseek_html_20260607_f0256d.html','BMS'],
    [52,'deepseek_html_20260607_798b8f.html','הנעה חשמלית'],
    [53,'deepseek_html_20260607_fe8855.html','גיר ידני'],
    [54,'deepseek_html_20260607_5d0007.html','גיר DSG'],
    [55,'deepseek_html_20260607_f85c60.html','גיר CVT'],
    [56,'deepseek_html_20260607_8e3d10.html','הנעה כפולה'],
    [57,'deepseek_html_20260607_4b23c6.html','דיאגנוסטיקה מתקדמת'],
    [58,'deepseek_html_20260607_34ed0c.html','ניהול צי רכב'],
    [59,'deepseek_html_20260607_fbd661.html','בטיחות במוסך'],
    [60,'deepseek_html_20260607_d6a7b1.html','אנציקלופדיית יצרנים'],
    [61,'deepseek_html_20260607_559a28.html','ניהול מנוע מתקדם'],
    [62,'deepseek_html_20260607_b4e447.html','דיאגנוסטיקה מורכבת'],
    [63,'deepseek_html_20260607_e9ba18.html','אבחון רעשים'],
    [64,'deepseek_html_20260607_c2c5a7.html','שרטוטי חיווט'],
    [65,'deepseek_html_20260607_26fc7a.html','TPMS'],
    [66,'deepseek_html_20260607_99effe.html','מתלי אוויר'],
    [67,'deepseek_html_20260607_6ceb08.html','פליטה אקטיבית'],
    [68,'deepseek_html_20260607_bd1ffa.html','אווירודינמיקה אקטיבית'],
    [69,'deepseek_html_20260607_6711f9.html','ניהול תרמי'],
    [70,'deepseek_html_20260607_d40a8d.html','הגנה אקטיבית'],
    [71,'deepseek_html_20260607_389304.html','נהיגה אוטונומית'],
    [72,'deepseek_html_20260607_834bf2.html','תקשורת V2X'],
    [73,'deepseek_html_20260607_4ca928.html','פירוק סוללה'],
    [74,'deepseek_html_20260607_8f77fc.html','מימן FCEV'],
    [75,'deepseek_html_20260607_a4ca10.html','קירור סוללה'],
    [76,'deepseek_html_20260607_cfc775.html','הזרקת מים'],
    [77,'deepseek_html_20260607_e236db.html','מפות מנוע'],
    [78,'deepseek_html_20260607_2b85d9.html','J2534'],
    [79,'deepseek_html_20260607_fa2b6e.html','מערכת שמע'],
    [80,'deepseek_html_20260607_176157.html','מבחן סיום 100 שאלות']
  ];

  const ready=(fn)=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn):fn();
  ready(()=>{
    if(document.querySelector('.chap-nav-bar')) return;
    const m=document.title.match(/פרק\s*(\d+)/);
    if(!m) return;
    const n=+m[1];
    const idx=C.findIndex(c=>c[0]===n);
    if(idx<0) return;
    const prev=idx>0?C[idx-1]:null;
    const next=idx<C.length-1?C[idx+1]:null;

    const style=document.createElement('style');
    style.textContent=`
    .chap-nav-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 24px;margin:32px 12px 80px;background:#fff;border:1px solid #d9e3ef;border-radius:22px;box-shadow:0 12px 32px rgba(17,24,39,.08);direction:rtl}
    .chap-nav-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border:1px solid #d9e3ef;border-radius:14px;background:#f8fbff;color:#263244;font-weight:900;font-size:14px;text-decoration:none;transition:.18s ease;min-width:120px}
    .chap-nav-btn:hover{background:#eef6ff;border-color:#93c5fd;color:#1d4ed8;transform:translateY(-2px);box-shadow:0 8px 20px rgba(29,41,57,.1)}
    .chap-nav-btn.next-btn{background:#111827;color:#fff;border-color:#111827}
    .chap-nav-btn.next-btn:hover{background:#1e293b}
    .chap-nav-btn.disabled{opacity:.35;pointer-events:none}
    .chap-nav-center{text-align:center;flex:1}
    .chap-nav-center a{font-size:13px;color:#667085;font-weight:900;text-decoration:none;border:1px solid #e2e8f0;border-radius:999px;padding:7px 14px;display:inline-flex;align-items:center;gap:6px}
    .chap-nav-center a:hover{color:#1d4ed8;border-color:#93c5fd}
    .chap-nav-num{font-size:11px;opacity:.65;display:block;margin-top:2px}
    @media(max-width:600px){.chap-nav-bar{flex-wrap:wrap;gap:8px;padding:14px}.chap-nav-btn{font-size:12px;min-width:0;flex:1}.chap-nav-center{order:-1;width:100%}}`;
    document.head.appendChild(style);

    const bar=document.createElement('div');
    bar.className='chap-nav-bar';
    const prevHTML=prev
      ?`<a class="chap-nav-btn" href="${prev[1]}">→ פרק ${prev[0]}<span class="chap-nav-num">${prev[2]}</span></a>`
      :`<span class="chap-nav-btn disabled">← זה הפרק הראשון</span>`;
    const nextHTML=next
      ?`<a class="chap-nav-btn next-btn" href="${next[1]}">פרק ${next[0]} →<span class="chap-nav-num">${next[2]}</span></a>`
      :`<a class="chap-nav-btn next-btn" href="deepseek_html_20260607_176157.html">מבחן סיום →<span class="chap-nav-num">100 שאלות</span></a>`;
    bar.innerHTML=`${prevHTML}<div class="chap-nav-center"><a href="index.html">🏠 חזרה לאינדקס</a></div>${nextHTML}`;
    document.body.appendChild(bar);
  });
})();