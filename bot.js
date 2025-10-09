require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: true });

// Stopwords para extraer palabra clave
const stopwords = [
  "the","a","an","and","or","but","if","then","with","on","in","of","to","for","is","are",
  "was","were","by","from","at","as","it","this","that","these","those","be","has","have","had"
];

// Función para extraer palabra clave
function extractKeyword(fact) {
  const words = fact.replace(/[.,;:!?"']/g, "").toLowerCase().split(" ");
  const candidates = words.filter(w => !stopwords.includes(w));
  candidates.sort((a,b) => b.length - a.length); // La palabra más larga como keyword
  return candidates[0] || "science";
}

// Obtener curiosidad + imagen
async function getCuriosity() {
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();
    const fact = data.text;

    const keyword = extractKeyword(fact);
    const imageUrl = `https://source.unsplash.com/800x400/?${encodeURIComponent(keyword)}&sig=${Date.now()}`;

    return { fact, imageUrl };
  } catch (err) {
    console.error(err);
    return {
      fact: "⚠️ No se pudo obtener una curiosidad. ¡Intenta de nuevo!",
      imageUrl: "https://picsum.photos/800/400"
    };
  }
}

// Comando para obtener nueva curiosidad
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const { fact, imageUrl } = await getCuriosity();

  // Enviar imagen primero
  await bot.sendPhoto(chat_id, imageUrl, { caption: `🧠 Curiosidad del día` });

  // Luego enviar la curiosidad
  await bot.sendMessage(chat_id, fact);
});

// Curiosidad diaria automática a las 12:00
const cron = require('node-cron');
cron.schedule('0 12 * * *', async () => {
  const { fact, imageUrl } = await getCuriosity();

  await bot.sendPhoto(chatId, imageUrl, { caption: `🧠 Curiosidad del día` });
  await bot.sendMessage(chatId, fact);

  console.log('Curiosidad diaria enviada.');
}, { timezone: "Europe/Dublin" });

console.log("¡Bot de curiosidades de Telegram con imágenes en marcha!");
