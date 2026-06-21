# הגדרת הבוט — 4 פעולות בלבד

## פעולה 1 — Firebase (5 דקות)

1. כנס ל-console.firebase.google.com
2. "Add project" → תן שם → המשך
3. לחץ "Firestore Database" → "Create database" → Production mode → בחר אזור
4. לחץ "Project Settings" → "Service accounts" → "Generate new private key"
   → יורד קובץ JSON — שמור אותו
5. לחץ "General" → "Your apps" → "</>" (web) → תן שם → Register
   → תקבל את כל פרטי ה-apiKey, projectId, appId

## פעולה 2 — Firestore Rules (30 שניות)

ב-Firestore → Rules → העלה את זה:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{doc} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## פעולה 3 — Railway (5 דקות)

1. כנס ל-railway.app → Login with GitHub
2. "New Project" → "Deploy from GitHub repo"
   (תצטרך להעלות את תיקיית whatsapp-bot ל-GitHub קודם)
   ** לחלופין: "Empty project" → "Add service" → "GitHub Repo"
3. Variables → הוסף:
   - FIREBASE_PROJECT_ID = (מהקובץ JSON שהורדת)
   - FIREBASE_CLIENT_EMAIL = (מהקובץ JSON)
   - FIREBASE_PRIVATE_KEY = (מהקובץ JSON — כולל ה-BEGIN ו-END)
   - WHATSAPP_GROUP_NAME = (חלק מהשם של קבוצת המוסכניקים)
4. Deploy

## פעולה 4 — QR ו-WhatsApp (2 דקות)

1. אחרי ה-Deploy ב-Railway → לחץ "View Logs"
2. תראה QR code בלוגים
3. פתח WhatsApp בטלפון → שלוש נקודות → WhatsApp Web → "Link a Device"
4. סרוק את ה-QR
5. ✅ הבוט מחובר! הוא יתחיל לשמור הודעות מהקבוצה ל-Firebase

## מה לעשות אחרי

פתח את garage-live.html → כנס לחלק ה-FIREBASE_CONFIG → מלא את:
- apiKey
- projectId
- appId
- messagingSenderId

ואז upload ל-Netlify → האתר יציג הכל חי.
