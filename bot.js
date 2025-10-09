require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: true });

// Stopwords para extraer palabras clave
const stopwords = [
  "the","a","an","and","or","but","if","then","with","on","in","of","to","for","is","are",
  "was","were","by","from","at","as","it","this","that","these","those","be","has","have","had"
];

// Función para extraer palabra clave
function extractKeyword(fact) {
  const words = fact.replace(/[.,;:!?"']/g, "").toLowerCase().split(" ");
  const candidates = words.filter(w => !stopwords.includes(w));
  candidates.sort((a,b) => b.length - a.length);
  return candidates[0] || "science";
}

// Obtener curiosidad usando fetch nativo
async function getCuriosity() {
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();
    const fact = data.text;
    const keyword = extractKeyword(fact);
    const imageUrl = `https://source.unsplash.com/800x400/?${encodeURIComponent(keyword)}&sig=${Date.now()}`;
    return { fact, keyword, imageUrl };
  } catch (err) {
    console.error(err);
    return {
      fact: "⚠️ Could not fetch a curiosity. Try again!",
      keyword: "error",
      imageUrl: "https://picsum.photos/800/400"
    };
  }
}

// Función para enviar curiosidad con imagen
async function sendCuriosity(chat_id) {
  const { fact, keyword, imageUrl } = await getCuriosity();
  await bot.sendPhoto(chat_id, imageUrl, { caption: `🧠 Curiosity related to: "${keyword}"` });
  await bot.sendMessage(chat_id, fact);
}

// Comando manual /curiosity
bot.onText(/\/curiosity/, async (msg) => {
  await sendCuriosity(msg.chat.id);
});

// Curiosidad diaria automática a las 12:00
cron.schedule('0 12 * * *', async () => {
  await sendCuriosity(chatId);
  console.log("Curiosity of the day sent.");
}, { timezone: "Europe/Dublin" });

console.log("Telegram Curiosity Bot running without fade...");
