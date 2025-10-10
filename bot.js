require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fs = require('fs');

// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const unsplashKey = process.env.UNSPLASH_KEY;
const bot = new TelegramBot(token, { polling: true });

// Cache para almacenar curiosidades con ID
const factsCache = {};

// ======== FUNCIONES AUXILIARES ========
function generarFrase(arreglo) {
  return arreglo[Math.floor(Math.random() * arreglo.length)];
}

// ======== FRASES Y CANCIONES ========
const frasesMotivadoras = [
  "Hoy es un buen día para empezar algo nuevo 🌞✨",
  "Si puedes soñarlo, puedes lograrlo 💭🚀"
];

const frasesBuenasNoches = [
  "Que tengas una noche llena de calma y sueños bonitos 🌙💤",
  "Buenas noches, descansa profundamente y sueña con tranquilidad 🌙✨"
];

const frasesBuenosDias = [
  "¡Buenos días! Que tengas un día lleno de energía y alegría 🌞✨",
  "Que cada instante de hoy te acerque a tus sueños 🌈💖"
];

const cancionesBuenosDias = [
  "https://www.youtube.com/watch?v=wEXavSbny6w",
  "https://www.youtube.com/watch?v=2Vv-BfVoq4g"
];

const estadoArchivo = './estado.json';
let estado = { cancionesEnviadas: [] };
if (fs.existsSync(estadoArchivo)) {
  estado = JSON.parse(fs.readFileSync(estadoArchivo));
}

function guardarEstado() {
  fs.writeFileSync(estadoArchivo, JSON.stringify(estado, null, 2));
}

function generarCancionUnica() {
  const disponibles = cancionesBuenosDias.filter(c => !estado.cancionesEnviadas.includes(c));
  if (disponibles.length === 0) {
    estado.cancionesEnviadas = [];
    guardarEstado();
    return generarCancionUnica();
  }
  const cancion = disponibles[Math.floor(Math.random() * disponibles.length)];
  estado.cancionesEnviadas.push(cancion);
  guardarEstado();
  return cancion;
}

function enviarCancionYFrase(chatId) {
  const cancion = generarCancionUnica();
  bot.sendMessage(chatId, `¡Buenos días! Disfruta esta canción: ${cancion}`).then(() => {
    const frase = generarFrase(frasesBuenosDias);
    bot.sendMessage(chatId, `🌞 ${frase}`);
  });
}

// ======== CURIOSIDADES ========
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

function extractKeyword(fact) {
  const words = fact.split(" ").filter(w => w.length > 4);
  return words[Math.floor(Math.random() * words.length)] || "science";
}

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

// ======== BOT COMMANDS ========
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);

  const id = Date.now();
  factsCache[id] = fact;

  bot.sendPhoto(chat_id, imageUrl, {
    caption: `🧠 Curiosity of the Day:\n${fact}`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇪🇸 Traducir al español", callback_data: `translate|${id}` }]
      ]
    }
  });
});

// ======== TRADUCCIÓN ========
async function translateToSpanish(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
  const res = await fetch(url);
  const data = await res.json();
  return data.responseData.translatedText;
}

bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const action = query.data;

  if (action.startsWith("translate|")) {
    const id = action.split("|")[1];
    const originalText = factsCache[id];
    if (!originalText) return bot.answerCallbackQuery(query.id, { text: "⚠️ Curiosidad no disponible" });

    const translated = await translateToSpanish(originalText);
    bot.sendMessage(chatId, `🇪🇸 Traducción:\n${translated}`);
  }

  bot.answerCallbackQuery(query.id);
});

// ======== CRON JOBS ========
// Buenos días 08:00
cron.schedule('0 8 * * *', () => enviarCancionYFrase(chatId), { timezone: "Europe/Dublin" });

// Frase motivadora 15:55
cron.schedule('55 15 * * *', () => {
  const frase = generarFrase(frasesMotivadoras);
  bot.sendMessage(chatId, frase + "\nDescansa o anímate a seguir 💪");
}, { timezone: "Europe/Dublin" });

// Buenas noches 22:00
cron.schedule('0 22 * * *', () => {
  const mensaje = generarFrase(frasesBuenasNoches);
  bot.sendMessage(chatId, mensaje + "\nDescansa 😴❤️");
}, { timezone: "Europe/Dublin" });

// Curiosidad diaria 12:00
cron.schedule('0 12 * * *', async () => {
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);
  const id = Date.now();
  factsCache[id] = fact;

  bot.sendPhoto(chatId, imageUrl, {
    caption: `🧠 Curiosity of the Day:\n${fact}`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇪🇸 Traducir al español", callback_data: `translate|${id}` }]
      ]
    }
  });
}, { timezone: "Europe/Dublin" });

console.log("🚀 Bot avanzado con curiosidades, traducción y cron jobs en marcha...");
