require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const cron = require('node-cron');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: true });

const stopwords = [
  "the","a","an","and","or","but","if","then","with","on","in","of","to","for","is","are",
  "was","were","by","from","at","as","it","this","that","these","those","be","has","have","had"
];

// Emojis de transición para animación
const fadeEmojis = ["✨","🌟","🌸","🌞","🌈","💫","🔥","🌻","🌊","🍀"];

function extractKeyword(fact) {
  const words = fact.replace(/[.,;:!?"']/g, "").toLowerCase().split(" ");
  const candidates = words.filter(w => !stopwords.includes(w));
  candidates.sort((a,b) => b.length - a.length);
  return candidates[0] || "science";
}

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

// Función para simular fade de imagen con emojis
async function sendImageWithFade(chat_id, imageUrl, keyword) {
  // Enviar emojis de transición antes de la imagen
  for (let i = 0; i < 3; i++) {
    const emoji = fadeEmojis[Math.floor(Math.random()*fadeEmojis.length)];
    await bot.sendMessage(chat_id, emoji.repeat(5));
    await new Promise(r => setTimeout(r, 400));
  }
  await bot.sendPhoto(chat_id, imageUrl, { caption: `🧠 Curiosity related to: "${keyword}"` });
}

// Función para enviar la curiosidad con fade palabra por palabra
async function sendFactWithFade(chat_id, fact) {
  const words = fact.split(" ");
  let message = "";
  for (let i = 0; i < words.length; i++) {
    message += words[i] + " ";
    // Cada 3 palabras añadimos un emoji de transición
    if ((i+1) % 3 === 0 || i === words.length -1) {
      const emoji = fadeEmojis[Math.floor(Math.random()*fadeEmojis.length)];
      await bot.sendMessage(chat_id, message + emoji);
      message = "";
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

// Comando manual /curiosity
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const { fact, keyword, imageUrl } = await getCuriosity();
  await sendImageWithFade(chat_id, imageUrl, keyword);
  await sendFactWithFade(chat_id, fact);
});

// Curiosidad diaria automática a las 12:00
cron.schedule('0 12 * * *', async () => {
  const { fact, keyword, imageUrl } = await getCuriosity();
  await sendImageWithFade(chatId, imageUrl, keyword);
  await sendFactWithFade(chatId, fact);
  console.log("Curiosity of the day sent with advanced fade animation.");
}, { timezone: "Europe/Dublin" });

console.log("Telegram Curiosity Bot running with advanced fade animation...");
