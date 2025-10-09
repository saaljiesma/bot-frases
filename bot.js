require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;

// Crear bot en polling
const bot = new TelegramBot(token, { polling: true });

// Función para extraer palabra clave
function extractKeyword(fact) {
  const stopwords = ["the","a","an","and","or","but","if","then","with","on","in","of","to","for","is","are",
                     "was","were","by","from","at","as","it","this","that","these","those","be","has","have","had"];
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
    const imageUrl = `https://source.unsplash.com/800x400/?${encodeURIComponent(keyword)}&sig=${Date.now()}`;
    return { fact, keyword, imageUrl };
  } catch (err) {
    console.error(err);
    return {
      fact: "⚠️ Could not fetch a curiosity. Try again later!",
      keyword: "error",
      imageUrl: "https://picsum.photos/800/400"
    };
  }
}

// Enviar curiosidad al chat
async function sendCuriosity(chat_id) {
  const { fact, keyword, imageUrl } = await getCuriosity();
  await bot.sendPhoto(chat_id, imageUrl, { caption: `🧠 Curiosity related to: "${keyword}"` });
  await bot.sendMessage(chat_id, fact);
}

// Comando manual /curiosity
bot.onText(/\/curiosity/, async (msg) => {
  console.log("Command received: /curiosity");
  await sendCuriosity(msg.chat.id);
});

// Escuchar mensajes que digan "curiosity" sin /
bot.on('message', async (msg) => {
  if (msg.text && msg.text.toLowerCase() === "curiosity") {
    console.log("Message received: curiosity");
    await sendCuriosity(msg.chat.id);
  }
});

// Curiosidad diaria automática a las 12:00
cron.schedule('0 12 * * *', async () => {
  console.log("Sending daily curiosity...");
  await sendCuriosity(chatId);
}, { timezone: "Europe/Dublin" });

console.log("✅ Telegram Curiosity Bot running!");
