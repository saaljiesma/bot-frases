require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const unsplashKey = process.env.UNSPLASH_KEY;
const bot = new TelegramBot(token, { polling: true });

// Función para obtener curiosidad
async function getCuriosity() {
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();
    return data.text;
  } catch (err) {
    console.error("❌ Error obteniendo curiosidad:", err);
    return "⚠️ No se pudo obtener una curiosidad. ¡Intenta de nuevo!";
  }
}

// Función para obtener imagen relacionada desde Unsplash
async function getImage(keyword) {
  try {
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${unsplashKey}`);
    const data = await res.json();
    return data.urls?.regular || "https://picsum.photos/800/400";
  } catch (err) {
    console.error("❌ Error obteniendo imagen:", err);
    return "https://picsum.photos/800/400";
  }
}

// Extrae una palabra clave sencilla de la curiosidad
function extractKeyword(fact) {
  const words = fact.split(" ").filter(w => w.length > 4);
  return words[Math.floor(Math.random() * words.length)] || "science";
}

// Comando para obtener curiosidad manualmente
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);

  await bot.sendPhoto(chat_id, imageUrl, { caption: `🧠 Curiosidad del día:\n${fact}` });
});

// Curiosidad automática diaria (a las 12:00)
cron.schedule('0 12 * * *', async () => {
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);

  await bot.sendPhoto(chatId, imageUrl, { caption: `🧠 Curiosidad del día:\n${fact}` });
  console.log('Curiosidad diaria enviada.');
}, { timezone: "Europe/Dublin" });

console.log("🚀 Bot de curiosidades con imágenes (Unsplash) en marcha...");
