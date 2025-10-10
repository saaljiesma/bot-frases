require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');
const fs = require('fs');

// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const unsplashKey = process.env.UNSPLASH_KEY;
const bot = new TelegramBot(token, { polling: true });

// ======== FRASES MOTIVADORAS ========
const frasesMotivadoras = [
  "Hoy es un buen día para empezar algo nuevo 🌞✨",
  "Si puedes soñarlo, puedes lograrlo 💭🚀"
];

// ======== FRASES DE BUENOS DÍAS ========
const frasesBuenosDias = [
  "¡Buenos días! Que tengas un día lleno de energía y alegría 🌞✨",
  "Que cada instante de hoy te acerque a tus sueños 🌈💖"
];

// ======== CANCIONES PARA BUENOS DÍAS ========
const cancionesBuenosDias = [
  "https://www.youtube.com/watch?v=wEXavSbny6w",
  "https://www.youtube.com/watch?v=2Vv-BfVoq4g"
];

// ======== ARCHIVO PARA GUARDAR ESTADO DE CANCIONES ========
const estadoArchivo = './estado.json';
let estado = { cancionesEnviadas: [] };
if (fs.existsSync(estadoArchivo)) {
  estado = JSON.parse(fs.readFileSync(estadoArchivo));
}
function guardarEstado() {
  fs.writeFileSync(estadoArchivo, JSON.stringify(estado, null, 2));
}

// ======== FUNCIONES AUXILIARES ========
function generarFrase(arreglo) {
  return arreglo[Math.floor(Math.random() * arreglo.length)];
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
  bot.sendMessage(chatId, `¡Buenos días! Empieza el día con energía. Disfruta esta canción: ${cancion}`).then(() => {
    const frase = generarFrase(frasesBuenosDias);
    bot.sendMessage(chatId, `🌞 ${frase}`);
  });
}

// ======== ENVÍO DIARIO ========
cron.schedule('0 8 * * *', () => { enviarCancionYFrase(chatId); console.log('Canción y frase de buenos días enviadas'); }, { timezone: "Europe/Dublin" });
cron.schedule('55 15 * * *', () => { 
  const frase = generarFrase(frasesMotivadoras);
  bot.sendMessage(chatId, frase + "\n ¡Ánimo! 💪"); 
  console.log('Frase motivadora enviada:', frase);
}, { timezone: "Europe/Dublin" });
cron.schedule('0 22 * * *', () => { 
  const mensaje = generarFrase(frasesBuenosDias); 
  bot.sendMessage(chatId, mensaje + "\nDescansa 😴"); 
  console.log('Mensaje de buenas noches enviado:', mensaje);
}, { timezone: "Europe/Dublin" });

// ======== DETECCIÓN DE ESTADO DE ÁNIMO ========
const palabrasNegativas = ["mal", "estresada", "bajón", "bajona", "triste", "agotada", "cansada"];
const frasesAnimar = [
  "¡Ánimo! Todo pasa y siempre hay un motivo para sonreír 😊✨",
  "Respira hondo, relájate y recuerda que eres fuerte 💪🌸"
];

bot.on('message', (msg) => {
  if (msg.from.is_bot) return; // ❌ Ignorar otros bots
  const texto = msg.text?.toLowerCase() || '';
  if (palabrasNegativas.some(palabra => texto.includes(palabra))) {
    const mensajeAnimador = generarFrase(frasesAnimar);
    bot.sendMessage(msg.chat.id, mensajeAnimador, { disable_web_page_preview: true });
    console.log('Mensaje animador enviado:', mensajeAnimador);
  }
});

// ======== FUNCIONES PARA CURIOSIDADES ========
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

async function translateToSpanish(text) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|es`;
    const res = await fetch(url);
    const data = await res.json();
    return data.responseData.translatedText;
  } catch (err) {
    console.error("❌ Error traduciendo:", err);
    return "⚠️ No se pudo traducir.";
  }
}

// ======== COMANDO /curiosity CON BOTÓN ========
bot.onText(/\/curiosity/, async (msg) => {
  if (msg.from.is_bot) return;
  const chat_id = msg.chat.id;
  const fact = await getCuriosity();
  bot.sendMessage(chat_id, `🧠 Curiosity of the Day:\n${fact}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇪🇸 Traducir al español", callback_data: `translate|${fact}` }]
      ]
    }
  });
});

// ======== ACCIONES DE BOTONES ========
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

// ======== ENVÍO AUTOMÁTICO DE CURIOSIDADES DIARIAS 12:00 ========
cron.schedule('0 12 * * *', async () => {
  const fact = await getCuriosity();
  bot.sendMessage(chatId, `🧠 Curiosity of the Day:\n${fact}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇪🇸 Traducir al español", callback_data: `translate|${fact}` }]
      ]
    }
  });
  console.log('Curiosidad diaria enviada:', fact);
}, { timezone: "Europe/Dublin" });

console.log('Bot avanzado iniciado y listo. 🌞🎵');
