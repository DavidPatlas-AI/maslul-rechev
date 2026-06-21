(function(){
  'use strict';

  const pages=Array.isArray(window.AUTOBRO_PAGES)?window.AUTOBRO_PAGES:[];
  const lessonContent=window.AUTOBRO_LESSONS||{};
  const chapterPages=pages.filter(p=>Number.isFinite(p.chapter));
  const $=id=>document.getElementById(id);
  const els={
    list:$('lessonList'),search:$('lessonSearch'),resultCount:$('resultCount'),showMore:$('showMoreBtn'),
    continueBtn:$('continueBtn'),progressText:$('progressText'),progressPercent:$('progressPercent'),progressBar:$('progressBar'),
    messages:$('messages'),chatTitle:$('chatTitle'),chatStatus:$('chatStatus'),openLesson:$('openLessonLink'),doneBtn:$('doneBtn'),
    backBtn:$('backBtn'),composer:$('composer'),input:$('messageInput'),toast:$('toast'),statusList:$('statusList'),
    statusModal:$('statusModal'),statusViewer:$('statusViewer'),statusBars:$('statusBars'),statusIcon:$('statusIcon'),statusPhoto:$('statusPhoto'),
    statusTitle:$('statusModalTitle'),statusText:$('statusModalText'),statusTime:$('statusTime'),statusClose:$('statusClose'),statusPrev:$('statusPrev'),statusNext:$('statusNext')
  };

  const STORAGE={done:'autobro-done',current:'autobro-current-v2',level:'autobro-level-v2',learning:'autobro-learning-v3'};
  function readDone(){try{return new Set(JSON.parse(localStorage.getItem(STORAGE.done)||'[]'))}catch(e){return new Set()}}
  function readLearning(){try{return JSON.parse(localStorage.getItem(STORAGE.learning)||'{}')}catch(e){return {}}}
  const state={
    done:readDone(),current:null,messages:[],busy:false,filter:'all',query:'',showAll:false,level:localStorage.getItem(STORAGE.level)||'new',statusIndex:0,
    learning:readLearning(),currentQuiz:null
  };

  function save(){
    localStorage.setItem(STORAGE.done,JSON.stringify([...state.done]));
    if(state.current)localStorage.setItem(STORAGE.current,state.current.file);
    localStorage.setItem(STORAGE.level,state.level);
    localStorage.setItem(STORAGE.learning,JSON.stringify(state.learning));
  }

  function memoryFor(file){
    if(!state.learning[file])state.learning[file]={asked:[],correct:0,wrong:0,stage:'start',example:0};
    return state.learning[file];
  }
  function setStage(stage){if(!state.current)return;memoryFor(state.current.file).stage=stage;save()}

  function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
  function cleanTitle(p){
    return String(p&&p.title||'נושא חדש')
      .replace(/\s*·\s*מאפס לרכב.*$/,'')
      .replace(/\s*-\s*גרסת משחקים.*$/,'')
      .replace(/^פרק\s*\d+[:：]?\s*/,'')
      .trim();
  }
  function pageLabel(p){return p.chapter?`פרק ${p.chapter}`:'כלי'}
  function pageText(p){return `${p.title||''} ${p.group||''} ${p.level||''}`.toLowerCase()}
  function categoryFor(p){
    const t=pageText(p);
    if(/obd|סורק|קוד|אבחון|דיאגנוסט|תקלה/.test(t))return 'obd';
    if(/קירור|רדיאטור|תרמוסטט|ניהול תרמי|התחממות/.test(t))return 'cooling';
    if(/מצבר|חשמל|אלטרנטור|התנעה|טעינה/.test(t)&&!/רכב חשמלי|סוללה|bms/.test(t))return 'electrical';
    if(/רכב חשמלי|סוללה|bms|הנעה חשמלית|מימן/.test(t))return 'ev';
    if(/בלמים|abs/.test(t))return 'brakes';
    if(/צמיג|tpms|חישוק/.test(t))return 'tires';
    if(/גיר|תיבת הילוכים|dsg|cvt/.test(t))return 'gearbox';
    if(/לקוח|שיחת טלפון|מנהל מוסך|חלפים|מכרז/.test(t))return 'customer';
    if(/קנייה|תעודת זהות|מספרי רכב|יצרנים|רכבים בישראל|סמלי/.test(t))return 'buying';
    if(/צה|ביטחון|בטחון|אט״ל|קרב|צבא/.test(t))return 'security';
    if(/adas|can bus|אוטונומית|v2x|בטיחות|בקרת שיוט|חיישן/.test(t))return 'smart';
    if(/מנוע|הזרקת דלק|הצתה|פליטה|דיזל/.test(t))return 'engine';
    return 'basic';
  }

  const knowledge={
    basic:{
      simple:'המטרה היא לא לשנן שמות. לומדים מה הרכיב עושה, איזה סימן מופיע כשהוא נכשל ואיזו בדיקה מאשרת את זה.',
      location:'מתחילים ממפת הרכב: תא מנוע, תא נוסעים, תחתית הרכב ומערכת החשמל. בפרק המלא תראה בדיוק איפה כל רכיב נמצא.',
      case:'לקוח מתאר בעיה במילה אחת. במקום לנחש חלק, שואלים מתי זה קורה, מה השתנה לאחרונה ואיזה סימן אפשר למדוד.',
      checks:['זהה את הרכיב או המערכת','הגדר את התפקיד שלו','חפש סימן תקלה ברור','אשר בבדיקה לפני החלפה'],
      warning:'לא מפרקים מערכת שלא מכירים ולא מתעלמים מנורה אדומה. כשיש ספק בטיחותי, עוצרים ופונים לבדיקה מקצועית.',
      terms:['תפקיד','סימפטום','בדיקה','אבחון'],
      quiz:{q:'מה הצעד הנכון לפני שמחליפים חלק?',options:['מנחשים לפי הרעש','בודקים סימן ומדידה','מוחקים תקלות','מחליפים את החלק הזול'],correct:1,why:'אבחון טוב מתחיל בסימן שאפשר לאמת, לא בניחוש.'}
    },
    obd:{
      simple:'OBD-II הוא שקע אבחון שמאפשר לסורק לדבר עם מחשבי הרכב. קוד תקלה הוא רמז לכיוון בדיקה, לא הוראה להחליף חלק.',
      location:'ברוב הרכבים השקע נמצא מתחת ללוח המחוונים באזור הנהג. המיקום המדויק משתנה בין דגמים.',
      case:'נורת מנוע נדלקה אחרי תדלוק. שומרים את הקוד ואת Freeze Frame, בודקים מכסה דלק, חיווט ונתונים חיים, ורק אז מחליטים.',
      checks:['שמור קוד DTC ו-Freeze Frame','בדוק נתונים חיים','בדוק מתח, חיווט וחיבורים','אמת את התיקון בנסיעת מבחן'],
      warning:'מחיקת קוד לפני שמירת הנתונים יכולה למחוק את הרמז הכי חשוב. קוד שמזכיר חיישן לא מוכיח שהחיישן תקול.',
      terms:['OBD-II','DTC','Freeze Frame','Live Data'],
      quiz:{q:'מה עושים לפני שמוחקים קוד תקלה?',options:['מחליפים חיישן','שומרים נתונים','מנתקים מצבר','מוסיפים שמן'],correct:1,why:'הנתונים מראים באילו תנאים התקלה הופיעה ועוזרים לאבחן נכון.'}
    },
    cooling:{
      simple:'מערכת הקירור שומרת את המנוע בטמפרטורת עבודה. היא כוללת נוזל קירור, משאבה, תרמוסטט, רדיאטור ומאוורר.',
      location:'הרדיאטור בחזית, מיכל העיבוי בתא המנוע והתרמוסטט נמצא בדרך כלל על מסלול נוזל הקירור ליד המנוע.',
      case:'הרכב מתחמם בעיקר בעמידה. זה מכוון קודם למאוורר, לפיקוד שלו או לזרימת אוויר, ולא מיד להחלפת מנוע.',
      checks:['בדוק מפלס כשהמנוע קר','חפש נזילה חיצונית','בדוק פעולת מאוורר','השווה נתון חום אמיתי למד בלוח'],
      warning:'לא פותחים מכסה מערכת קירור כשהמנוע חם. אדים ונוזל בלחץ עלולים לגרום לכוויה קשה.',
      terms:['תרמוסטט','רדיאטור','מאוורר','נוזל קירור'],
      quiz:{q:'מה אסור לעשות כשהמנוע רותח?',options:['לעצור בבטחה','לכבות מזגן','לפתוח מיד מכסה קירור','להמתין לקירור'],correct:2,why:'מערכת חמה נמצאת בלחץ ופתיחה עלולה לשחרר נוזל רותח.'}
    },
    electrical:{
      simple:'ברוב תקלות החשמל מתחילים מהבסיס: מתח מצבר, חיבורים, הארקות, פיוזים וטעינת אלטרנטור.',
      location:'המצבר נמצא בדרך כלל בתא המנוע, אבל בחלק מהרכבים הוא בתא המטען או מתחת למושב. קופסאות פיוזים יכולות להיות בכמה מקומות.',
      case:'הרכב לא מניע ויש הרבה נורות מוזרות. לפני שמאשימים מחשבים, מודדים מתח מצבר ובודקים קוטבים והארקה.',
      checks:['מדוד מתח מצבר','בדוק קוטבים והארקות','בדוק פיוז מתאים','בדוק טעינת אלטרנטור תחת עומס'],
      warning:'קצר חשמלי או חיבור הפוך עלולים לגרום לנזק. לא עוקפים פיוז ולא עובדים ליד כריות אוויר בלי נוהל מתאים.',
      terms:['12V','הארקה','פיוז','אלטרנטור'],
      quiz:{q:'מה בודקים ראשון כשיש כמה תקלות חשמל יחד?',options:['צבע הרכב','מתח מצבר וחיבורים','לחץ צמיגים','מסנן אוויר'],correct:1,why:'מתח לא יציב יכול ליצור תקלות מדומות בכמה מערכות במקביל.'}
    },
    ev:{
      simple:'ברכב חשמלי מפרידים בין סוללת המתח הגבוה, מערכת הטעינה וסוללת 12V. לכל אחת תפקיד אחר.',
      location:'סוללת ההנעה מותקנת בדרך כלל ברצפת הרכב. שקע הטעינה נמצא בכנף או בחזית, ומחשב BMS נמצא כחלק ממערכת הסוללה.',
      case:'הטווח ירד בחורף. לפני שמאשימים סוללה, בודקים טמפרטורה, חימום תא נוסעים, לחץ צמיגים וסגנון נהיגה.',
      checks:['בדוק SOC ו-SOH','בדוק טמפרטורת סוללה','בדוק היסטוריית טעינה','בדוק צריכת אנרגיה ולחצי אוויר'],
      warning:'מערכת מתח גבוה מיועדת לעבודה של בעלי הכשרה וציוד מגן. כבלים כתומים אינם מקום לניסוי.',
      terms:['BMS','SOC','SOH','רגנרציה'],
      quiz:{q:'איזה נתון מתאר כמה אנרגיה זמינה עכשיו?',options:['SOH','SOC','VIN','RPM'],correct:1,why:'SOC הוא מצב הטעינה הנוכחי. SOH מתאר את בריאות הסוללה לאורך זמן.'}
    },
    brakes:{
      simple:'מערכת הבלמים הופכת לחץ על הדוושה לכוח עצירה. רפידות, דיסקים, נוזל בלמים ו-ABS עובדים יחד.',
      location:'הדיסקים והרפידות נמצאים בגלגלים. מיכל נוזל הבלמים נמצא בדרך כלל בתא המנוע ליד הדופן האחורית.',
      case:'הגה רועד בזמן בלימה. בודקים דיסקים, רפידות, חופש במתלה והידוק גלגלים לפני שמחליטים.',
      checks:['בדוק עובי רפידות','בדוק דיסקים ורעידות','בדוק מפלס ואיכות נוזל','סרוק תקלות ABS'],
      warning:'דוושה רכה, נורת בלמים אדומה או ירידה בכוח העצירה דורשות עצירה ובדיקה. לא ממשיכים כרגיל.',
      terms:['ABS','רפידה','דיסק','נוזל בלמים'],
      quiz:{q:'איזה סימן מחייב בדיקה דחופה?',options:['אבק על הגלגל','דוושה רכה','רדיו חלש','שריטה בפגוש'],correct:1,why:'דוושה רכה עלולה להעיד על אוויר, נזילה או בעיה הידראולית.'}
    },
    tires:{
      simple:'הצמיג הוא נקודת המגע היחידה עם הכביש. לחץ, גיל, סדקים ושחיקה משפיעים על בלימה, היגוי וצריכת דלק.',
      location:'מדבקת לחץ האוויר נמצאת בדרך כלל במשקוף דלת הנהג. שנת הייצור מופיעה בקוד DOT על דופן הצמיג.',
      case:'הרכב מושך צד. מתחילים מלחצי אוויר ושחיקה לא אחידה לפני כיוון פרונט או החלפת חלקי מתלה.',
      checks:['מדוד לחץ כשהצמיג קר','בדוק סדקים וגיל','בדוק עומק ושחיקה','בדוק התאמת מידה ועומס'],
      warning:'בליטה בדופן, קרע או חשיפת חוטים הם סימן להחלפה מיידית. לא מתקנים דופן פגועה.',
      terms:['DOT','TPMS','עומק חריץ','כיוון פרונט'],
      quiz:{q:'איפה מוצאים בדרך כלל את לחץ האוויר המומלץ?',options:['על הרדיו','במשקוף דלת הנהג','על המצבר','על המראה'],correct:1,why:'מדבקת היצרן במשקוף מציגה את הלחץ המתאים לרכב ולעומס.'}
    },
    gearbox:{
      simple:'תיבת ההילוכים מתאימה בין מהירות המנוע למהירות הרכב. אוטומט, CVT ו-DSG פועלים בצורה שונה ודורשים שמן מתאים.',
      location:'הגיר מחובר למנוע ומעביר כוח לציריות או לגל ההינע. מיקום פקקי בדיקה משתנה מאוד בין דגמים.',
      case:'יש מכה בהעברה כשהרכב קר. בודקים קודי תקלה, מפלס ואיכות שמן, תושבות והתנהגות לאחר התחממות.',
      checks:['סרוק מחשב גיר','בדוק נזילות ושמן מתאים','בדוק תושבות','בצע נסיעת מבחן מתועדת'],
      warning:'שמן לא מתאים או מילוי בגובה שגוי עלולים להזיק. בחלק מהגירים הבדיקה נעשית בטמפרטורה מוגדרת.',
      terms:['ממיר מומנט','CVT','DSG','מצמד'],
      quiz:{q:'מה חשוב לפני החלפת שמן גיר?',options:['לבחור לפי צבע','לבדוק מפרט יצרן','למלא עד הסוף בכל מצב','לנתק מצבר'],correct:1,why:'סוג השמן ושיטת המילוי נקבעים לפי הגיר והוראות היצרן.'}
    },
    customer:{
      simple:'שיחה טובה עם לקוח היא חלק מהאבחון. צריך להפוך תיאור כללי כמו “יש רעש” לתנאים שאפשר לשחזר.',
      location:'המידע נמצא אצל הלקוח: מתי זה קורה, באיזו מהירות, כשהרכב קר או חם ומה השתנה לאחרונה.',
      case:'לקוח אומר “האוטו חלש”. שואלים אם זה בהאצה, בעלייה, עם מזגן, כשהמנוע חם והאם נדלקה נורה.',
      checks:['מתי התקלה מופיעה','מה השתנה לאחרונה','האם יש נורה או הודעה','האם אפשר לצרף צילום או הקלטה'],
      warning:'לא נותנים מחיר סופי או מבטיחים החלפת חלק לפני בדיקה. מסבירים מה תהליך האבחון ומה ידוע כרגע.',
      terms:['סימפטום','שחזור','תיעוד','אבחון ראשוני'],
      quiz:{q:'מה השאלה הכי חשובה כשלקוח אומר “יש רעש”?',options:['מה צבע הרכב','מתי ובאיזה מצב זה קורה','כמה עלה הרכב','מי היצרן'],correct:1,why:'תנאי ההופעה עוזרים לשחזר את הבעיה ולצמצם אפשרויות.'}
    },
    buying:{
      simple:'בדיקת קנייה נועדה להפחית סיכון: מסמכים, היסטוריה, קילומטרים, נורות, שלדה, מחשבים ונסיעת מבחן.',
      location:'מתחילים ברישיון הרכב ובמספר השלדה, ממשיכים סביב הרכב, תא מנוע, תחתית, תא נוסעים ולבסוף נסיעה וסריקה.',
      case:'הרכב נוצץ והמחיר נמוך. בודקים התאמת רישיון, בעלויות קודמות, קילומטרים, נורות אזהרה ותיעוד טיפולים.',
      checks:['התאם רישיון ומספר שלדה','בדוק קילומטרים והיסטוריה','בדוק נורות וסריקת מחשב','בצע בדיקה מקצועית ונסיעה'],
      warning:'לחץ “לסגור עכשיו” הוא סיבה להאט. לא מעבירים כסף לפני אימות זהות, בעלות והסכמות כתובות.',
      terms:['VIN','בעלות','שעבוד','בדיקת קנייה'],
      quiz:{q:'מה בודקים לפני שמתלהבים מהרכב?',options:['רק צבע וג׳נטים','מסמכים ונורות אזהרה','רק מהירות','מערכת שמע'],correct:1,why:'מסמכים ונתוני בסיס יכולים לחשוף סיכון לפני שמוציאים כסף על בדיקה.'}
    },
    security:{
      simple:'רכבי ביטחון ושטח עובדים בעומס, אבק, חום וזעזועים. האבחון חייב להתחשב במשימה ובתנאי העבודה.',
      location:'בודקים גם מיגון, תחתית, צמות חשמל נוספות, מערכות קשר, נקודות עיגון וקירור שנפגע מזרימת אוויר מוגבלת.',
      case:'רכב חוזר ממשימה עם התחממות. בודקים עומס, אבק ברדיאטור, מאוורר, מיגון שחוסם אוויר ופגיעות תחתית.',
      checks:['תעד תנאי משימה ועומס','בדוק קירור וזרימת אוויר','בדוק צמות ותוספות חשמל','בדוק פגיעות שטח ושלדה'],
      warning:'אין לבצע שינוי במיגון, חיווט מבצעי או מערכת בטיחות בלי אישור ונוהל של הגורם המוסמך.',
      terms:['מיגון','עומס','שלדה','צמה'],
      quiz:{q:'מה שונה באבחון רכב שטח או ביטחון?',options:['בודקים רק קילומטרים','מתחשבים במשימה ובעומס','מתעלמים מחשמל נוסף','לא בודקים תחתית'],correct:1,why:'תנאי העבודה משנים את העומס, הקירור והסיכוי לפגיעות.'}
    },
    smart:{
      simple:'מערכות חכמות משלבות חיישנים, מצלמות, רדארים ומחשבים. תקלה יכולה להיות בחיישן, בכיול, בחיווט או בתקשורת.',
      location:'מצלמה קדמית נמצאת לרוב ליד המראה, רדאר בחזית וחיישנים נוספים בפגושים ובגלגלים.',
      case:'אחרי החלפת שמשה מופיעה שגיאת ADAS. בודקים התקנה, קודי תקלה ודרישת כיול לפני החלפת מצלמה.',
      checks:['סרוק את כל המחשבים','בדוק מתח ותקשורת CAN','בדוק מיקום וניקיון חיישן','בצע כיול לפי הוראות יצרן'],
      warning:'מערכת בטיחות שלא כוילה עלולה לפעול מאוחר או בצורה שגויה. לא מסתפקים בכך שנורת האזהרה כבתה.',
      terms:['ADAS','CAN Bus','כיול','רדאר'],
      quiz:{q:'מתי ייתכן שנדרש כיול מצלמה קדמית?',options:['אחרי החלפת שמשה','אחרי תדלוק','אחרי שטיפה','אחרי החלפת רדיו'],correct:0,why:'שינוי במיקום המצלמה או בשמשה יכול לשנות את זווית הראייה שלה.'}
    },
    engine:{
      simple:'המנוע צריך אוויר, דלק, הצתה או דחיסה ותזמון נכון. אבחון מחפש איזה תנאי חסר במקום להחליף חלקים באקראי.',
      location:'מערכות היניקה, הדלק וההצתה מסודרות סביב המנוע. חיישנים מודדים אוויר, טמפרטורה, לחץ וסיבוב.',
      case:'המנוע רועד בסרק. בודקים קודי החטאה, הצתה, כניסת אוויר, דלק ודחיסה לפני החלטה.',
      checks:['סרוק קודים ונתונים חיים','בדוק אוויר ווואקום','בדוק הצתה ודלק','אמת דחיסה ותזמון לפי הצורך'],
      warning:'מנוע עם לחץ שמן נמוך, התחממות או רעש מתכתי חריג דורש עצירה. המשך נסיעה יכול להחמיר נזק.',
      terms:['יניקה','הצתה','דחיסה','תזמון'],
      quiz:{q:'מה צריך מנוע בנזין כדי לעבוד?',options:['רק דלק','אוויר, דלק, הצתה ודחיסה','רק מצבר','רק שמן'],correct:1,why:'המנוע תלוי בכמה תנאים שפועלים יחד ובתזמון הנכון.'}
    }
  };

  function packFor(p){
    const fallback=knowledge[categoryFor(p)]||knowledge.basic;
    const lesson=lessonContent[p&&p.file];
    if(!lesson)return {...fallback,beginner:fallback.simple,advanced:fallback.simple,examples:[fallback.case],questions:[fallback.quiz],diagram:fallback.terms,challenge:`הסבר במילים שלך את ${cleanTitle(p)} ומה בודקים קודם.`};
    return {...fallback,...lesson,simple:state.level==='some'?lesson.advanced:lesson.beginner,case:lesson.case||lesson.examples[0],quiz:lesson.questions[0]};
  }
  function actionsHtml(actions){
    if(!actions||!actions.length)return '';
    return `<div class="bubble-actions">${actions.map((a,i)=>`<button type="button" class="${i===0?'primary ':''}${a.wide?'wide':''}" data-action="${escapeHtml(a.action)}">${escapeHtml(a.label)}</button>`).join('')}</div>`;
  }
  function listHtml(items){return `<ul class="message-list">${items.map((x,i)=>`<li><b>${i+1}.</b><span>${escapeHtml(x)}</span></li>`).join('')}</ul>`}
  function termsHtml(items){return `<div class="term-row">${items.map(x=>`<span>${escapeHtml(x)}</span>`).join('')}</div>`}
  function diagramHtml(items){return `<div class="flow-diagram">${items.map((x,i)=>`<span class="flow-step"><i>${i+1}</i>${escapeHtml(x)}</span>`).join('<b aria-hidden="true">←</b>')}</div>`}
  function messageHtml(message){
    return `<article class="bubble ${message.who}">${message.html}${actionsHtml(message.actions)}<time>${message.who==='user'?'נקרא ✓✓':'איתי מהמוסך'} · עכשיו</time></article>`;
  }
  function renderMessages(){
    const typing=state.busy?'<div class="typing-bubble" aria-label="איתי מכין תשובה"><i></i><i></i><i></i></div>':'';
    els.messages.innerHTML='<div class="day-label">היום · מסלול ווצאפ</div>'+state.messages.map(messageHtml).join('')+typing;
    requestAnimationFrame(()=>{els.messages.scrollTop=els.messages.scrollHeight});
    setTimeout(()=>{els.messages.scrollTop=els.messages.scrollHeight},90);
  }
  function pushUser(text){state.messages.push({who:'user',html:`<p>${escapeHtml(text)}</p>`});renderMessages()}
  async function pushBot(html,actions=[],delay=420){
    if(state.busy)return;
    state.busy=true;renderMessages();
    await new Promise(resolve=>setTimeout(resolve,delay));
    state.busy=false;state.messages.push({who:'bot',html,actions});renderMessages();
  }

  function openingFor(p){
    const topic=cleanTitle(p),pack=packFor(p),n=p.chapter||'כלי';
    return `<span class="message-tag">${escapeHtml(pageLabel(p))} · ${escapeHtml(p.group||'מסלול')}</span><h3>${escapeHtml(topic)}</h3><p>אני איתי מהמוסך. נלמד את הנושא דרך מצב אמיתי ברכב, בקצב שלך.</p><p><b>מה רמת הידע שלך בנושא?</b></p>${termsHtml(pack.terms)}`;
  }
  function startConversation(){
    const p=state.current,memory=memoryFor(p.file),hasProgress=memory.stage!=='start';
    state.currentQuiz=null;
    const progressNote=hasProgress?`<div class="return-note"><b>זוכר אותך.</b> עצרת בשלב ${stageLabel(memory.stage)} ויש לך ${memory.correct} תשובות נכונות בפרק.</div>`:'';
    state.messages=[{who:'bot',html:openingFor(p)+progressNote,actions:hasProgress?[
      {label:'המשך מאיפה שעצרתי',action:'continue'},
      {label:'התחל מחדש',action:'restart'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ]:[
      {label:'אני מתחיל מאפס',action:'start-new'},
      {label:'אני מכיר קצת',action:'start-some'},
      {label:'בחן אותי קודם',action:'quiz',wide:true}
    ]}];
    renderMessages();
  }

  function stageLabel(stage){return ({explain:'הסבר',example:'דוגמה',diagram:'מפת התהליך',checks:'בדיקה',challenge:'אתגר',quiz:'שאלה',summary:'סיכום',complete:'סיום'})[stage]||'התחלה'}

  function setHeader(){
    const p=state.current;if(!p)return;
    els.chatTitle.textContent=p.chapter?`פרק ${p.chapter}: ${cleanTitle(p)}`:cleanTitle(p);
    els.chatStatus.textContent=`מחובר · ${p.group||'מסלול לימוד'}`;
    els.openLesson.href=p.file;
    els.doneBtn.classList.toggle('is-done',state.done.has(p.file));
    els.doneBtn.textContent=state.done.has(p.file)?'✓':'○';
  }
  function selectLesson(p,openChat=true){
    if(!p)return;
    state.current=p;save();setHeader();startConversation();renderLessonList();
    if(openChat&&matchMedia('(max-width:760px)').matches)document.body.classList.add('chat-open');
  }
  function nextLesson(){
    if(!chapterPages.length)return pages[0];
    const currentIndex=chapterPages.findIndex(p=>state.current&&p.file===state.current.file);
    for(let offset=1;offset<=chapterPages.length;offset++){
      const candidate=chapterPages[(Math.max(currentIndex,0)+offset)%chapterPages.length];
      if(!state.done.has(candidate.file))return candidate;
    }
    return chapterPages[(Math.max(currentIndex,0)+1)%chapterPages.length];
  }

  async function explain(level){
    const pack=packFor(state.current),topic=cleanTitle(state.current);
    state.level=level;setStage('explain');
    const intro=level==='new'?'תסביר לי מאפס':'אני מכיר קצת, תן לי את העיקר';
    const explanation=level==='new'?pack.beginner:pack.advanced;
    pushUser(intro);
    await pushBot(`<span class="message-tag">${level==='new'?'בגובה העיניים':'עולים רמה'}</span><p><b>${escapeHtml(topic)}:</b> ${escapeHtml(explanation)}</p>`,[
      {label:'תן דוגמה מהשטח',action:'example'},
      {label:'הראה לי את התהליך',action:'diagram'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ]);
  }
  async function showExample(){
    const pack=packFor(state.current),memory=memoryFor(state.current.file),examples=pack.examples||[pack.case];
    const example=examples[memory.example%examples.length];memory.example+=1;setStage('example');pushUser('תן לי דוגמה מהשטח');
    await pushBot(`<span class="message-tag">מקרה מהשטח · ${((memory.example-1)%examples.length)+1}/${examples.length}</span><p>${escapeHtml(example)}</p>`,[
      {label:'מה בודקים עכשיו?',action:'checks'},
      {label:'עוד דוגמה',action:'example'},
      {label:'אתגר קצר',action:'challenge',wide:true}
    ]);
  }
  async function showDiagram(){
    const pack=packFor(state.current);setStage('diagram');pushUser('תראה לי איך זה עובד');
    await pushBot(`<span class="message-tag">מפת התהליך</span>${diagramHtml(pack.diagram||pack.terms)}<p class="micro-copy">עקוב אחרי השלבים מימין לשמאל. בכל תקלה מחפשים באיזה שלב הזרימה נשברה.</p>`,[
      {label:'מקרה אמיתי',action:'example'},
      {label:'איך בודקים?',action:'checks'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ]);
  }
  async function showChallenge(){
    const pack=packFor(state.current);setStage('challenge');pushUser('תן לי אתגר קצר');
    await pushBot(`<span class="message-tag">דקה לחשוב כמו טכנאי</span><div class="challenge-box"><b>המשימה שלך</b><p>${escapeHtml(pack.challenge)}</p></div>`,[
      {label:'כתבתי תשובה',action:'checks'},
      {label:'תן לי כיוון',action:'example'},
      {label:'עבור לשאלה',action:'quiz',wide:true}
    ]);
  }
  async function showChecks(){
    const pack=packFor(state.current);setStage('checks');pushUser('איך בודקים את זה?');
    await pushBot(`<span class="message-tag">סדר בדיקה</span>${listHtml(pack.checks)}<div class="safety-note"><b>חשוב:</b> ${escapeHtml(pack.warning)}</div>`,[
      {label:'בחן אותי',action:'quiz'},
      {label:'סיכום קצר',action:'summary'},
      {label:'מפת התהליך',action:'diagram',wide:true}
    ]);
  }
  async function showLocation(){
    const pack=packFor(state.current);setStage('location');pushUser('איפה זה נמצא ברכב?');
    await pushBot(`<span class="message-tag">מיקום ברכב</span><p>${escapeHtml(pack.location)}</p>`,[
      {label:'איך בודקים?',action:'checks'},
      {label:'זה מסוכן?',action:'safety'},
      {label:'בחן אותי',action:'quiz',wide:true}
    ]);
  }
  async function showSafety(){
    const pack=packFor(state.current);setStage('safety');pushUser('יש פה משהו מסוכן?');
    await pushBot(`<span class="message-tag">בטיחות לפני הכול</span><div class="safety-note">${escapeHtml(pack.warning)}</div>`,[
      {label:'הבנתי, תמשיך',action:'checks'},
      {label:'סיכום קצר',action:'summary'}
    ]);
  }
  function quizForCurrent(){
    const pack=packFor(state.current),questions=pack.questions||[pack.quiz],memory=memoryFor(state.current.file);
    let available=questions.map((_,i)=>i).filter(i=>!memory.asked.includes(i));
    if(!available.length){memory.asked=[];available=questions.map((_,i)=>i)}
    const index=available[0];
    state.currentQuiz={file:state.current.file,index};
    save();
    return {quiz:questions[index],index,total:questions.length};
  }
  async function showQuiz(){
    const {quiz,index,total}=quizForCurrent();setStage('quiz');
    if(!state.messages.some(m=>m.html&&m.html.includes('בדיקת הבנה')))pushUser('בחן אותי');
    const options=`<div class="quiz-options">${quiz.options.map((option,i)=>`<button type="button" data-quiz="${i}">${escapeHtml(option)}</button>`).join('')}</div>`;
    await pushBot(`<span class="message-tag">בדיקת הבנה · שאלה ${index+1}/${total}</span><p><b>${escapeHtml(quiz.q)}</b></p>${options}`,[],320);
  }
  async function answerQuiz(index){
    if(!state.currentQuiz||state.currentQuiz.file!==state.current.file)return;
    const pack=packFor(state.current),questions=pack.questions||[pack.quiz],quizIndex=state.currentQuiz.index,quiz=questions[quizIndex],choice=quiz.options[index];
    state.currentQuiz=null;
    pushUser(choice);
    const correct=index===quiz.correct,memory=memoryFor(state.current.file);
    if(!memory.asked.includes(quizIndex))memory.asked.push(quizIndex);
    if(correct)memory.correct+=1;else memory.wrong+=1;
    save();
    await pushBot(`<div class="feedback ${correct?'good':'try'}"><b>${correct?'בדיוק.':'כמעט.'}</b> ${escapeHtml(quiz.why)}</div>`,[
      {label:correct?'עוד שאלה':'הסבר ממוקד',action:correct?'quiz':'remediate'},
      {label:correct?'סיכום המשימה':'נסה שאלה אחרת',action:correct?'summary':'quiz'}
    ],300);
  }
  async function showRemediation(){
    const pack=packFor(state.current);pushUser('תסביר לי איפה טעיתי');
    await pushBot(`<span class="message-tag">מחזקים את הנקודה</span><p>${escapeHtml(pack.beginner)}</p>${diagramHtml(pack.diagram||pack.terms)}<p><b>כלל עבודה:</b> ${escapeHtml(pack.checks[0])}, ורק אחר כך ממשיכים למסקנה.</p>`,[
      {label:'נסה אותי שוב',action:'quiz'},
      {label:'מקרה מהשטח',action:'example'}
    ]);
  }
  async function showSummary(){
    const p=state.current,pack=packFor(p),memory=memoryFor(p.file);setStage('summary');pushUser('תן לי סיכום קצר');
    await pushBot(`<span class="message-tag">מה לקחת מהמשימה</span><p><b>${escapeHtml(cleanTitle(p))}</b></p>${listHtml([
      pack.simple,
      `סדר העבודה: ${pack.checks.slice(0,3).join(' → ')}`,
      'לא מנחשים. מזהים סימן, בודקים ורק אז מחליטים.'
    ])}<div class="mastery-card"><b>${memory.correct} תשובות נכונות</b><span>${memory.wrong?`${memory.wrong} טעויות שכדאי לחזור עליהן`:'בלי טעויות שנרשמו'}</span></div>`,[
      {label:'סמן שהשלמתי',action:'complete'},
      {label:'המשך לפרק המלא',action:'open'},
      {label:'עבור למשימה הבאה',action:'next',wide:true}
    ]);
  }
  async function completeLesson(){
    state.done.add(state.current.file);setStage('complete');renderProgress();renderLessonList();setHeader();
    pushUser('סיימתי את המשימה');
    await pushBot(`<span class="message-tag">התקדמות נשמרה</span><h3>יפה. הפרק הושלם.</h3><p>אפשר להמשיך למשימה הבאה או לפתוח את החומר המלא לחזרה.</p>`,[
      {label:'המשימה הבאה',action:'next'},
      {label:'פתח פרק מלא',action:'open'},
      {label:'חזרה למסלול',action:'home',wide:true}
    ]);
  }

  async function answerFreeText(raw){
    const text=raw.trim();if(!text||state.busy)return;
    pushUser(text);
    const pack=packFor(state.current),q=text.toLowerCase();
    let html='',actions=[];
    if(/לא הבנתי|לא ברור|פשוט יותר|מסובך/.test(q)){
      html=`<span class="message-tag">הסבר פשוט יותר</span><p>${escapeHtml(pack.beginner)}</p><p>תחשוב על זה ככה: קודם מבינים מה המערכת אמורה לעשות, אחר כך מחפשים מה השתנה.</p>`;
      actions=[{label:'תן דוגמה',action:'example'},{label:'בחן אותי',action:'quiz'}];
    }else if(/דוגמה|מקרה|מהשטח/.test(q)){
      html=`<span class="message-tag">דוגמה מהשטח</span><p>${escapeHtml(pack.case)}</p>`;
      actions=[{label:'איך בודקים?',action:'checks'},{label:'בחן אותי',action:'quiz'}];
    }else if(/איפה|מיקום|נמצא/.test(q)){
      html=`<span class="message-tag">מיקום</span><p>${escapeHtml(pack.location)}</p>`;
      actions=[{label:'איך בודקים?',action:'checks'},{label:'זה מסוכן?',action:'safety'}];
    }else if(/איך בודקים|מה בודקים|בדיקה|אבחון|מה עושים/.test(q)){
      html=`<span class="message-tag">בדיקה מסודרת</span>${listHtml(pack.checks)}<div class="safety-note">${escapeHtml(pack.warning)}</div>`;
      actions=[{label:'בחן אותי',action:'quiz'},{label:'סיכום',action:'summary'}];
    }else if(/מסוכן|סכנה|לנסוע|לעצור|בטיחות/.test(q)){
      html=`<span class="message-tag">בטיחות</span><div class="safety-note">${escapeHtml(pack.warning)}</div>`;
      actions=[{label:'הבנתי',action:'checks'},{label:'אתגר קצר',action:'challenge'}];
    }else if(/בחן|שאלה|מבחן/.test(q)){
      state.messages.pop();renderMessages();return showQuiz();
    }else if(/כמה עולה|מחיר|עלות/.test(q)){
      html='<span class="message-tag">מחיר ותיקון</span><p>אי אפשר לתת מחיר אמין בלי דגם, שנתון ואבחון. מחיר נכון מתחיל בהגדרת התקלה, החלק המדויק והעבודה הנדרשת.</p>';
      actions=[{label:'מה בודקים קודם?',action:'checks'},{label:'תן מקרה מהשטח',action:'example'}];
    }else if(/המשך|הבא|סיכום/.test(q)){
      state.messages.pop();renderMessages();return showSummary();
    }else{
      html=`<span class="message-tag">לפי הפרק הנוכחי</span><p>${escapeHtml(pack.simple)}</p><p>לשאלה שלך הייתי מתחיל מהבדיקות האלה:</p>${listHtml(pack.checks.slice(0,3))}<p><small>אם מדובר ברכב אמיתי עם אזהרה אדומה או שינוי בבלימה/היגוי, עוצרים ופונים לבדיקה מקצועית.</small></p>`;
      actions=[{label:'תסביר פשוט',action:'start-new'},{label:'תן דוגמה',action:'example'},{label:'בחן אותי',action:'quiz',wide:true}];
    }
    await pushBot(html,actions,420);
  }

  async function handleAction(action){
    if(state.busy)return;
    if(action==='restart'){state.learning[state.current.file]={asked:[],correct:0,wrong:0,stage:'start',example:0};save();return startConversation()}
    if(action==='continue'){
      const stage=memoryFor(state.current.file).stage;
      if(['explain','location','safety'].includes(stage))return showExample();
      if(['example','diagram'].includes(stage))return showChecks();
      if(['checks','challenge','quiz'].includes(stage))return showQuiz();
      if(stage==='summary')return showSummary();
      if(stage==='complete')return selectLesson(nextLesson(),true);
      return explain(state.level);
    }
    if(action==='start-new')return explain('new');
    if(action==='start-some')return explain('some');
    if(action==='example')return showExample();
    if(action==='diagram')return showDiagram();
    if(action==='challenge')return showChallenge();
    if(action==='checks')return showChecks();
    if(action==='location')return showLocation();
    if(action==='safety')return showSafety();
    if(action==='quiz')return showQuiz();
    if(action==='remediate')return showRemediation();
    if(action==='summary')return showSummary();
    if(action==='complete')return completeLesson();
    if(action==='next')return selectLesson(nextLesson(),true);
    if(action==='open')return location.href=state.current.file;
    if(action==='home'){document.body.classList.remove('chat-open');return}
  }

  const statusData=[
    {icon:'!',title:'נורת מנוע נדלקה?',text:'לא מוחקים מיד. שומרים קוד ונתונים, בודקים מתי התקלה הופיעה ורק אז מתחילים לאבחן.',image:'assets/status-engine.webp',route:'fault'},
    {icon:'✓',title:'לפני שקונים רכב',text:'לא מתאהבים בצבע. מאמתים מסמכים, סורקים מחשב ובודקים בלמים, צמיגים והיסטוריית טיפולים.',image:'assets/status-buying.webp',route:'buy'},
    {icon:'12V',title:'שלוש נורות ביחד',text:'לפני שמאשימים שלושה מחשבים, מודדים מתח מצבר ובודקים חיבורים והארקות תחת עומס.',image:'assets/status-battery.webp',route:'electrical'},
    {icon:'⚡',title:'הטווח החשמלי ירד',text:'קור, חימום, לחץ צמיגים ומהירות משפיעים על הטווח. ירידה זמנית אינה הוכחה לסוללה פגומה.',image:'assets/status-electric.webp',route:'electric'},
    {icon:'°C',title:'המחוג מטפס',text:'עוצרים במקום בטוח, מכבים מזגן ולא פותחים מכסה קירור חם. לחץ ואדים עלולים לגרום לכוויה.',image:'assets/status-cooling.webp',route:'cooling'},
    {icon:'4X4',title:'מה השטח מספר?',text:'אבק, מים ועומס משאירים סימנים. בודקים מתלים, חיבורים, מסננים ומיגון תחתון אחרי נסיעת שטח.',image:'assets/status-offroad.webp',route:'security'}
  ];
  const STATUS_DURATION=5200;
  function readSeenStatuses(){try{return new Set(JSON.parse(localStorage.getItem('autobro-status-seen')||'[]'))}catch(e){return new Set()}}
  const seenStatuses=readSeenStatuses();
  let statusTimer=null,statusStartedAt=0,statusRemaining=STATUS_DURATION,statusPointerAt=0,statusPointerX=0,suppressStatusClick=false;
  function renderStatuses(){
    els.statusList.innerHTML=statusData.map((s,i)=>`<button class="status-card ${seenStatuses.has(i)?'seen':''}" data-status="${i}" type="button" aria-label="פתח סטטוס: ${escapeHtml(s.title)}"><div class="status-ring"><div class="status-face"><img src="${escapeHtml(s.image)}" alt=""></div></div><span>${escapeHtml(s.title)}</span></button>`).join('');
  }
  function scheduleStatus(ms=STATUS_DURATION){
    clearTimeout(statusTimer);statusRemaining=ms;statusStartedAt=Date.now();
    statusTimer=setTimeout(()=>moveStatus(1,true),ms);
  }
  function openStatus(index){
    state.statusIndex=Math.max(0,Math.min(index,statusData.length-1));const s=statusData[state.statusIndex];
    seenStatuses.add(state.statusIndex);localStorage.setItem('autobro-status-seen',JSON.stringify([...seenStatuses]));renderStatuses();
    els.statusBars.innerHTML=statusData.map((_,i)=>`<i class="${i<state.statusIndex?'done':i===state.statusIndex?'current':''}"><span></span></i>`).join('');
    els.statusIcon.textContent=s.icon;els.statusPhoto.src=s.image;els.statusPhoto.alt=s.title;els.statusTitle.textContent=s.title;els.statusText.textContent=s.text;
    els.statusTime.textContent=state.statusIndex===0?'עכשיו':`לפני ${state.statusIndex+1} דקות`;
    els.statusModal.hidden=false;els.statusViewer.classList.remove('paused');scheduleStatus();
  }
  function moveStatus(direction,automatic=false){
    if(els.statusModal.hidden)return;
    const target=state.statusIndex+direction;
    if(target>=statusData.length){closeStatus();return}
    if(target<0){openStatus(0);return}
    openStatus(target);
    if(!automatic)navigator.vibrate?.(8);
  }
  function pauseStatus(){
    if(els.statusModal.hidden)return;
    clearTimeout(statusTimer);statusRemaining=Math.max(100, statusRemaining-(Date.now()-statusStartedAt));els.statusViewer.classList.add('paused');
  }
  function resumeStatus(){if(els.statusModal.hidden)return;els.statusViewer.classList.remove('paused');scheduleStatus(statusRemaining)}
  function closeStatus(){clearTimeout(statusTimer);els.statusModal.hidden=true;els.statusViewer.classList.remove('paused')}
  statusData.forEach(s=>{const image=new Image();image.src=s.image});
  function routePage(route){
    const matchers={
      zero:p=>p.chapter===1,
      fault:p=>/תקלה|אבחון|obd|סורק/i.test(pageText(p)),
      buy:p=>/קנייה|תעודת זהות|מספרי רכב|רכבים בישראל/i.test(pageText(p)),
      electric:p=>/חשמלי|סוללה|bms|טעינה/i.test(pageText(p)),
      electrical:p=>/חשמל|מצבר|אלטרנטור|התנעה/i.test(pageText(p)),
      cooling:p=>/קירור|תרמי|התחממות/i.test(pageText(p)),
      security:p=>/צה|ביטחון|בטחון|אט״ל|צבא/i.test(pageText(p))
    };
    return pages.find(matchers[route]||matchers.zero)||pages[0];
  }

  function filteredPages(){
    const q=state.query.toLowerCase();
    return pages.filter(p=>{
      const typeOk=state.filter==='all'||(state.filter==='chapters'&&p.chapter)||(state.filter==='tools'&&!p.chapter)||(state.filter==='done'&&state.done.has(p.file));
      const qOk=!q||pageText(p).includes(q)||cleanTitle(p).toLowerCase().includes(q);
      return typeOk&&qOk;
    });
  }
  function lessonStat(p){
    const memory=state.learning[p.file];
    if(!memory||(!memory.correct&&!memory.wrong))return '';
    return `<em class="lesson-score">${memory.correct} נכון${memory.wrong?` · ${memory.wrong} לחזרה`:''}</em>`;
  }
  function renderLessonList(){
    const list=filteredPages(),limit=state.showAll?list.length:12,visible=list.slice(0,limit);
    els.resultCount.textContent=`${list.length} תוצאות`;
    els.list.innerHTML=visible.length?visible.map(p=>`<button class="lesson-item ${state.current&&state.current.file===p.file?'active':''} ${state.done.has(p.file)?'done':''}" data-file="${escapeHtml(p.file)}" type="button"><span class="lesson-number">${p.chapter||'+'}</span><span class="lesson-copy"><b>${escapeHtml(cleanTitle(p))}</b><small>${escapeHtml(pageLabel(p))} · ${escapeHtml(p.group||'כלי')} · ${escapeHtml(p.level||'')}</small>${lessonStat(p)}</span></button>`).join(''):'<div class="empty-list">לא מצאתי פרק מתאים. נסה מילה אחרת.</div>';
    els.showMore.hidden=list.length<=12;els.showMore.textContent=state.showAll?'הצג פחות':'הצג עוד פרקים';
  }
  function renderProgress(){
    const completed=chapterPages.filter(p=>state.done.has(p.file)).length,total=chapterPages.length||80,percent=Math.round(completed/total*100);
    els.progressText.textContent=`${completed} מתוך ${total} פרקים`;els.progressPercent.textContent=`${percent}%`;els.progressBar.style.width=`${percent}%`;
  }
  function toast(text){els.toast.textContent=text;els.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>els.toast.classList.remove('show'),1600)}

  els.list.addEventListener('click',e=>{const b=e.target.closest('[data-file]');if(!b)return;selectLesson(pages.find(p=>p.file===b.dataset.file),true)});
  els.search.addEventListener('input',e=>{state.query=e.target.value;state.showAll=false;renderLessonList()});
  document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.filter=b.dataset.filter;state.showAll=false;renderLessonList()}));
  els.showMore.addEventListener('click',()=>{state.showAll=!state.showAll;renderLessonList()});
  els.continueBtn.addEventListener('click',()=>selectLesson(nextLesson(),true));
  document.querySelectorAll('[data-route]').forEach(b=>b.addEventListener('click',()=>selectLesson(routePage(b.dataset.route),true)));
  els.statusList.addEventListener('click',e=>{const b=e.target.closest('[data-status]');if(b)openStatus(Number(b.dataset.status))});
  els.statusClose.addEventListener('click',e=>{e.stopPropagation();closeStatus()});
  els.statusPrev.addEventListener('click',()=>{if(suppressStatusClick){suppressStatusClick=false;return}moveStatus(-1)});
  els.statusNext.addEventListener('click',()=>{if(suppressStatusClick){suppressStatusClick=false;return}moveStatus(1)});
  els.statusViewer.addEventListener('pointerdown',e=>{if(e.target.closest('.status-close'))return;statusPointerAt=Date.now();statusPointerX=e.clientX;pauseStatus()});
  els.statusViewer.addEventListener('pointerup',e=>{
    if(e.target.closest('.status-close'))return;
    const held=Date.now()-statusPointerAt,swipe=e.clientX-statusPointerX;
    if(Math.abs(swipe)>48){suppressStatusClick=true;moveStatus(swipe>0?-1:1);return}
    if(held>300){suppressStatusClick=true;resumeStatus();return}
    resumeStatus();
  });
  els.statusViewer.addEventListener('pointercancel',resumeStatus);
  els.backBtn.addEventListener('click',()=>document.body.classList.remove('chat-open'));
  els.doneBtn.addEventListener('click',()=>{if(!state.current)return;if(state.done.has(state.current.file)){state.done.delete(state.current.file);toast('הפרק הוחזר למסלול')}else{state.done.add(state.current.file);toast('הפרק סומן כהושלם')}save();renderProgress();renderLessonList();setHeader()});
  els.messages.addEventListener('click',e=>{const quiz=e.target.closest('[data-quiz]');if(quiz)return answerQuiz(Number(quiz.dataset.quiz));const action=e.target.closest('[data-action]');if(action)handleAction(action.dataset.action)});
  els.composer.addEventListener('submit',e=>{e.preventDefault();const text=els.input.value;els.input.value='';answerFreeText(text)});
  document.addEventListener('keydown',e=>{if(els.statusModal.hidden)return;if(e.key==='Escape')closeStatus();if(e.key==='ArrowLeft')moveStatus(-1);if(e.key==='ArrowRight')moveStatus(1)});
  document.addEventListener('visibilitychange',()=>{if(els.statusModal.hidden)return;document.hidden?pauseStatus():resumeStatus()});

  function init(){
    renderStatuses();renderProgress();renderLessonList();
    const saved=pages.find(p=>p.file===localStorage.getItem(STORAGE.current));
    state.current=saved||chapterPages[0]||pages[0];setHeader();startConversation();
    const params=new URLSearchParams(location.search);
    const chapter=Number(params.get('lesson'));
    if(chapter){const p=chapterPages.find(x=>x.chapter===chapter);if(p)selectLesson(p,params.get('demo-home')!=='1')}
    if(params.get('demo-chat')==='1'){document.body.classList.add('chat-open')}
    if(params.get('demo-status')==='1')setTimeout(()=>openStatus(0),200);
    if(params.get('demo-quiz')==='1')setTimeout(()=>showQuiz(),200);
    if(params.get('demo-answer')==='1')setTimeout(async()=>{await showQuiz();setTimeout(()=>{const pack=packFor(state.current),quiz=(pack.questions||[pack.quiz])[state.currentQuiz.index];answerQuiz(quiz.correct)},550)},220);
    if(params.get('demo-text'))setTimeout(()=>answerFreeText(params.get('demo-text')),260);
    if(params.get('demo-complete')==='1')setTimeout(()=>completeLesson(),260);
  }
  init();
})();
