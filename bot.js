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

// Función para obtener imagen desde Unsplash
async function getImage(keyword) {
  try {
    const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(keyword)}&orientation=landscape&per_page=30&client_id=${unsplashKey}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) return "https://picsum.photos/800/400";

    // Elegir una foto aleatoria de los resultados
    const randomIndex = Math.floor(Math.random() * data.results.length);
    return data.results[randomIndex].urls.regular;
  } catch (err) {
    console.error("❌ Error obteniendo imagen:", err);
    return "https://picsum.photos/800/400";
  }
}

// Función para extraer palabra clave de la curiosidad
function extractKeyword(fact) {
  const words = fact.split(" ").filter(w => w.length > 4);
  return words[Math.floor(Math.random() * words.length)] || "science";
}

// Comando manual /curiosity
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);

  await bot.sendPhoto(chat_id, imageUrl, { caption: `🧠 Curiosidad del día:\n${fact}` });
});

// Curiosidad automática diaria a las 12:00
cron.schedule('0 12 * * *', async () => {
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);

  await bot.sendPhoto(chatId, imageUrl, { caption: `🧠 Curiosidad del día:\n${fact}` });
  console.log('Curiosidad diaria enviada.');
}, { timezone: "Europe/Dublin" });

console.log("🚀 Bot de curiosidades con imágenes (Unsplash) en marcha...");
