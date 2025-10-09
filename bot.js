require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');

// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN; // Tu token
const chatId = process.env.CHAT_ID;           // Tu chat o grupo
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

// Obtener curiosidad
async function getCuriosity() {
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();
    const fact = data.text;
    const keyword = extractKeyword(fact);

    // Imagen de Unsplash con palabra clave y &sig para variar
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

// Comando para obtener nueva curiosidad
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const { fact, keyword, imageUrl } = await getCuriosity();

  // Enviar la imagen primero
  await bot.sendPhoto(chat_id, imageUrl, { caption: `🧠 Curiosity related to: "${keyword}"` });

  // Luego enviar el texto de la curiosidad
  await bot.sendMessage(chat_id, fact);
});

// Opcional: enviar curiosidad diaria automáticamente a las 12:00
const cron = require('node-cron');
cron.schedule('0 12 * * *', async () => {
  const { fact, keyword, imageUrl } = await getCuriosity();
  await bot.sendPhoto(chatId, imageUrl, { caption: `🧠 Curiosity related to: "${keyword}"` });
  await bot.sendMessage(chatId, fact);
  console.log('Curiosity of the day sent.');
}, { timezone: "Europe/Dublin" });

console.log("Telegram Curiosity Bot is running...");
