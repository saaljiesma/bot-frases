require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fs = require('fs');

// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const unsplashKey = process.env.UNSPLASH_KEY;
const bot = new TelegramBot(token, { polling: true });

// ========== FUNCIONES PRINCIPALES ==========

// Obtener curiosidad
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

// Obtener imagen aleatoria desde Unsplash
async function getImage(keyword) {
  try {
    const randomSeed = Math.floor(Math.random() * 100000);
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&orientation=landscape&client_id=${unsplashKey}&sig=${randomSeed}`);
    const data = await res.json();
    return data.urls?.regular || "https://picsum.photos/800/400";
  } catch (err) {
    console.error("❌ Error obteniendo imagen:", err);
    return "https://picsum.photos/800/400";
  }
}

// Extraer palabra clave
function extractKeyword(fact) {
  const words = fact.split(" ").filter(w => w.length > 4);
  return words[Math.floor(Math.random() * words.length)] || "science";
}

// Traducir texto al español (MyMemory)
async function translateToSpanish(text) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
    const res = await fetch(url);
    const data = await res.json();
    return data.responseData.translatedText;
  } catch (error) {
    console.error("❌ Error traduciendo texto:", error);
    return "No se pudo traducir el texto.";
  }
}

// ========== COMANDOS ==========

// /curiosity manual con botón de traducción
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);

  await bot.sendPhoto(chat_id, imageUrl, {
    caption: `🧠 Curiosidad del día:\n${fact}`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇪🇸 Traducir al español", callback_data: `translate|${fact}` }]
      ]
    }
  });
});

// Manejar botones
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;

  if (action.startsWith("translate|")) {
    const originalText = action.split("|")[1];
    const translated = await translateToSpanish(originalText);
    bot.sendMessage(chatId, `🇪🇸 Traducción:\n${translated}`);
  }

  bot.answerCallbackQuery(query.id);
});

// Curiosidad diaria automática (12:00)
cron.schedule('0 12 * * *', async () => {
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);

  await bot.sendPhoto(chatId, imageUrl, {
    caption: `🧠 Curiosidad del día:\n${fact}`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇪🇸 Traducir al español", callback_data: `translate|${fact}` }]
      ]
    }
  });

  console.log('Curiosidad diaria enviada.');
}, { timezone: "Europe/Dublin" });

// ========== TUS FUNCIONES EXTRAS (motivación, canciones, frases...) ==========
/* Todo tu código de frases, canciones, detección de ánimo, etc. 
   se mantiene igual aquí. No es necesario modificarlo. */

// ... (tu parte de cron para canciones, frases motivadoras, etc.)

console.log("🚀 Bot de curiosidades con imágenes y traducción en marcha...");
