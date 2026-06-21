const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const https  = require('https');
require('dotenv').config();

const API_URL    = process.env.API_URL    || 'https://maslul-rechev-2026.netlify.app/api/messages';
const BOT_SECRET = process.env.BOT_SECRET || '';
const GROUP_NAME = process.env.WHATSAPP_GROUP_NAME || 'מוסכניקים';

// ── Category detection ──────────────────────────────────────────────────
const CATEGORIES = {
  'מנוע':   ['מנוע','שמן','קירור','צילינדר','בוכנה','טורבו','דלק','הזרקה','מקונן','פלט'],
  'חשמל':   ['חשמל','בטריה','מצבר','אלטרנטור','ECU','חיישן','נורה','פיוז','שורת','CAN'],
  'שלדה':   ['שלדה','בלמים','צמיג','גלגל','מתלה','ספרינג','זרוע','היגוי','דיסק','ABS'],
  'גיר':    ['גיר','הילוכים','קלאץ','כלאץ','תיבה','אוטומט','CVT','DSG'],
  'מיזוג':  ['מזגן','מיזוג','קומפרסור','גז','מאוורר','קירור','חום'],
  'גוף':    ['פח','צבע','קורוזיה','חלון','דלת','מכסה','פגוש'],
};

function detectCategory(text) {
  for (const [cat, kws] of Object.entries(CATEGORIES)) {
    if (kws.some(k => text.includes(k))) return cat;
  }
  return 'כללי';
}

// ── HTTP POST to Netlify function ───────────────────────────────────────
function postMessage(payload) {
  const body = JSON.stringify(payload);
  const url  = new URL(API_URL);
  const opts = {
    hostname: url.hostname,
    path:     url.pathname,
    method:   'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
      'x-bot-secret':   BOT_SECRET,
    },
  };
  return new Promise((resolve, reject) => {
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── WhatsApp client ─────────────────────────────────────────────────────
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
  puppeteer: {
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
    headless: true,
  },
});

client.on('qr', qr => {
  console.log('\n📱 סרוק את ה-QR הזה ב-WhatsApp:\n');
  qrcode.generate(qr, { small: true });
});

client.on('auth_failure', () =>
  console.error('❌ אימות נכשל — מחק .wwebjs_auth ונסה שוב'));

client.on('ready', async () => {
  console.log('✅ הבוט מחובר!');
  const chats  = await client.getChats();
  const groups = chats.filter(c => c.isGroup).map(c => c.name);
  console.log('קבוצות:', groups.join(' | '));
  console.log(`🎯 מחפש קבוצה שמכילה: "${GROUP_NAME}"`);
});

client.on('message', async msg => {
  try {
    const chat = await msg.getChat();
    if (!chat.isGroup) return;
    if (!chat.name.includes(GROUP_NAME)) return;
    if (!msg.body || msg.body.trim().length < 5) return;

    const contact  = await msg.getContact();
    const text     = msg.body.trim();
    const category = detectCategory(text);

    const payload = {
      text,
      sender:      contact.pushname || contact.number || 'לא ידוע',
      senderPhone: contact.number,
      category,
      groupName:   chat.name,
      timestamp:   Date.now(),
    };

    await postMessage(payload);
    console.log(`💾 [${category}] ${payload.sender}: ${text.slice(0, 60)}`);
  } catch (err) {
    console.error('שגיאה:', err.message);
  }
});

client.initialize();
console.log('🚀 מאתחל בוט...');
