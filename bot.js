require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

// ✅ Asegúrate de tener tu token y chat ID en .env
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

// Manejar errores de polling
bot.on('polling_error', (err) => console.error('Polling error:', err));

// Palabras clave frecuentes para curiosidades
const keywordsList = [
  "cat","dog","bird","fish","planet","moon","sun","star","tree","flower",
  "ocean","mountain","river","animal","science","space","human","brain","eye",
  "bee","crocodile","shrimp","honey","koala","flamingo","elephant","tiger",
  "snake","mouse","monkey","bear","horse","color","music","language","food"
];

// Función para extraer keyword de una curiosidad
function extractKeyword(fact) {
  const words = fact.replace(/[.,;:!?"']/g, "").toLowerCase().split(" ");
  for (const word of words) {
    if (keywordsList.includes(word)) return word;
  }
  const longWord = words.find(w => w.length > 6) || "science";
  return longWord;
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
