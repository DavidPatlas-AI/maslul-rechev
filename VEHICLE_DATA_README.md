# AutoBro Vehicle Data

הסנכרון מוריד נתונים רק ממקורות שמוגדרים ב-`vehicle-data-sources.json`, בודק ומנקה רשומות כפולות, ומייצר קובץ מצומצם לאתר.

## הפעלה

```powershell
node tools/sync-vehicle-data.mjs --refresh
```

שימוש במטמון ללא רשת:

```powershell
node tools/sync-vehicle-data.mjs --offline
```

אם GitHub מגביל את מספר הבקשות, ניתן להגדיר `GITHUB_TOKEN` במשתני הסביבה. אין לשמור אסימון בתוך הקוד.

## קבצים שנוצרים

- `data/vehicle-index.json` לשימוש של מערכות וכלי עיבוד.
- `data/vehicle-index.js` לטעינה ישירה בדפדפן, כולל בפתיחה מקומית.
- `data/.cache` הוא מטמון זמני ואינו נדרש לפריסה.

## מקורות

- Vehicle Make Model Data, רישיון MIT.
- NHTSA vPIC, מידע ממשלתי אמריקאי.
- comma.ai openDBC, רישיון MIT.
- Awesome Automotive, רישיון CC0-1.0.
- data.gov.il, מאגר פתוח של משרד התחבורה.

## פרטיות

הסנכרון הישראלי מבקש רק יצרן, כינוי מסחרי, שנת ייצור וסוג דלק. מספר רישוי, מספר שלדה ורשומות רכב בודדות אינם נשמרים באתר.

מאגרי טלמטריה וצילום גדולים אינם נמשכים כברירת מחדל. הם מיועדים למחקר מקומי ולא לפריסה סטטית ב-Netlify.
