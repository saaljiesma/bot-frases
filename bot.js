require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fs = require('fs');

// ======== CONFIGURACIÓN ========
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const unsplashKey = process.env.UNSPLASH_KEY;
const bot = new TelegramBot(token, { polling: true });

// ======== ESTADO ========
const estadoArchivo = './estado.json';
let estado = {
  cancionesEnviadas: [],
  frasesBuenosDiasUsadas: [],
  frasesBuenasNochesUsadas: [],
  frasesMotivadorasUsadas: [],
  frasesAnimarUsadas: []
};

// Cargar estado guardado si existe
if (fs.existsSync(estadoArchivo)) {
  const datos = JSON.parse(fs.readFileSync(estadoArchivo));
  estado = { ...estado, ...datos };
}

// Guardar estado actualizado
function guardarEstado() {
  fs.writeFileSync(estadoArchivo, JSON.stringify(estado, null, 2));
}

// ======== FUNCIONES AUXILIARES ========
function generarFraseUnica(nombreCampo, arregloFrases) {
  const usadas = estado[nombreCampo] || [];

  if (usadas.length >= arregloFrases.length) {
    estado[nombreCampo] = [];
    guardarEstado();
    return generarFraseUnica(nombreCampo, arregloFrases);
  }

  const disponibles = arregloFrases.filter(f => !usadas.includes(f));
  const frase = disponibles[Math.floor(Math.random() * disponibles.length)];
  estado[nombreCampo].push(frase);
  guardarEstado();

  return frase;
}

function generarCancionUnica(canciones) {
  const disponibles = canciones.filter(c => !estado.cancionesEnviadas.includes(c));
  if (disponibles.length === 0) {
    estado.cancionesEnviadas = [];
    guardarEstado();
    return generarCancionUnica(canciones);
  }
  const cancion = disponibles[Math.floor(Math.random() * disponibles.length)];
  estado.cancionesEnviadas.push(cancion);
  guardarEstado();
  return cancion;
}

// ======== FRASES Y CANCIONES ========
const frasesMotivadoras = [
  "🌄 Las actitudes mueven montañas. Cuando crees en ti y das lo mejor, lo imposible empieza a suceder",
  "Cada paso firme te acerca a tus sueños 👣🌟",
  "Si puedes soñarlo, puedes lograrlo 💭🚀",
  "📣 ¡Pega un grito y vuelta al ruedo! 🔥"
];

const frasesBuenasNoches = [
  "Que tengas una noche llena de calma y sueños bonitos 🌙💤",
  "Buenas noches, descansa profundamente y sueña con tranquilidad 🌙✨"
];

const frasesBuenosDias = [
  "¡Buenos días! Que tengas un día lleno de energía y alegría 🌞✨",
  "Que cada instante de hoy te acerque a tus sueños 🌈💖"
];

const frasesAnimar = [
  "¡Ánimo! Todo pasa y siempre hay un motivo para sonreír 😊✨\nMás alegría con una sola llamada: 👇https://wa.me/34642297675 📞",
  "Solo recuerda que ya queda menos 🌻 \nMás alegría con una sola llamada: 👇https://wa.me/34642297675 📞"
];

const cancionesBuenosDias = [
  "https://www.youtube.com/watch?v=wEXavSbny6w",
  "https://youtu.be/BJVToi8A3v8",
  "https://youtu.be/R-AfdmiuAT0",
  "https://youtu.be/LYdG2w8jbws",
  "https://www.youtube.com/watch?v=5k8NySrpplY",
  "https://www.youtube.com/watch?v=sG__fKxyaaM&list=RDsG__fKxyaaM&start_radio=1",
  "https://www.youtube.com/watch?v=09t5T6JjUeE"
];

// ======== CURIOSIDADES ========
const factsCache = {};

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

// ======== COMANDOS DEL BOT ========
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

bot.onText(/\/frase/, (msg) => {
  const frase = generarFraseUnica("frasesMotivadorasUsadas", frasesMotivadoras);
  bot.sendMessage(msg.chat.id, frase);
  console.log('Frase enviada con /frase:', frase);
});

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
cron.schedule('0 8 * * *', () => {
  const cancion = generarCancionUnica(cancionesBuenosDias);
  bot.sendMessage(chatId, `¡Buenos días! Disfruta esta canción: ${cancion}`).then(() => {
    const frase = generarFraseUnica("frasesBuenosDiasUsadas", frasesBuenosDias);
    bot.sendMessage(chatId, `🌞 ${frase}`);
  });
}, { timezone: "Europe/Dublin" });

// Frase motivadora 15:55
cron.schedule('55 15 * * *', () => {
  const frase = generarFraseUnica("frasesMotivadorasUsadas", frasesMotivadoras);
  bot.sendMessage(chatId, frase + "\nDescansa o anímate a seguir 💪");
}, { timezone: "Europe/Dublin" });

// Buenas noches + curiosidad diaria 22:00
cron.schedule('0 22 * * *', async () => {
  const fact = await getCuriosity();
  const keyword = extractKeyword(fact);
  const imageUrl = await getImage(keyword);
  const id = Date.now();
  factsCache[id] = fact;

  await bot.sendPhoto(chatId, imageUrl, {
    caption: `🧠 Curiosity of the Day:\n${fact}`,
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇪🇸 Traducir al español", callback_data: `translate|${id}` }]
      ]
    }
  });

  const mensaje = generarFraseUnica("frasesBuenasNochesUsadas", frasesBuenasNoches);
  await bot.sendMessage(chatId, mensaje + "\nDescansa 😴❤️");
}, { timezone: "Europe/Dublin" });

// ======== DETECCIÓN DE PALABRAS NEGATIVAS ========
const palabrasNegativas = ["mal", "estresada", "bajón", "bajona", "triste", "agotada", "cansada"];

bot.on('message', (msg) => {
  const texto = msg.text?.toLowerCase() || "";
  
  if (palabrasNegativas.some(palabra => texto.includes(palabra))) {
    const mensajeAnimador = generarFraseUnica("frasesAnimarUsadas", frasesAnimar);
    bot.sendMessage(msg.chat.id, mensajeAnimador, { disable_web_page_preview: true });
    console.log('Mensaje animador enviado:', mensajeAnimador);
  }
});

console.log("🚀 Bot avanzado con curiosidades, traducción y cron jobs en marcha...");
