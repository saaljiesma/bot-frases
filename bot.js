require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;

if (!token || !chatId) {
  console.error("❌ ERROR: Faltan variables de entorno TELEGRAM_BOT_TOKEN o CHAT_ID.");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

/* =====================================================
   📝 FRASES MOTIVADORAS Y BUENAS NOCHES
   ===================================================== */
const frasesMotivadoras = [
  "Hoy es un buen día para empezar algo nuevo 🌞✨",
  "Cada pequeño paso cuenta, incluso si parece insignificante 👣💪",
  "Si puedes soñarlo, puedes lograrlo 💭🚀",
  "No importa cuántas veces caigas, lo importante es levantarte 💪🔥",
  "Recuerda: cada día es una nueva oportunidad 🌈☀️",
  "Cree en ti, incluso cuando nadie más lo haga 💫",
  "El esfuerzo de hoy será tu orgullo mañana 🏆✨"
];

const frasesBuenasNoches = [
  "Que tengas una noche llena de calma y sueños bonitos 🌙💤",
  "Buenas noches, descansa profundamente y sueña con tranquilidad 🌙✨",
  "Cierra los ojos, relaja tu mente y deja que los sueños te lleven lejos 🌌💫",
  "Buenas noches 🌙, que la luna cuide de tus pensamientos y el viento te arrulle 🍃💤",
  "Descansa, mañana será un día mejor 🌅💛",
  "Duerme bien, porque el mañana está lleno de nuevas oportunidades 🌟🛏️",
  "Buenas noches 😴✨ Que tus sueños sean tan lindos como tu sonrisa 💛"
];

/* =====================================================
   🎲 FUNCIÓN PARA OBTENER FRASE ALEATORIA
   ===================================================== */
function generarFrase(lista) {
  const index = Math.floor(Math.random() * lista.length);
  return lista[index];
}

/* =====================================================
   ⏰ TAREAS PROGRAMADAS
   ===================================================== */

// ✅ FRASE MOTIVADORA DIARIA (15:55 Irlanda)
cron.schedule(
  '55 15 * * *',
  () => {
    const frase = generarFrase(frasesMotivadoras);
    bot.sendMessage(chatId, `🌞 Frase del día:\n\n${frase}\n\n💛 Recuerda que hay gente que te quiere.`);
    console.log('✅ Frase motivadora enviada:', frase);
  },
  { timezone: 'Europe/Dublin' }
);

// ✅ MENSAJE DE BUENAS NOCHES (22:00 Irlanda)
cron.schedule(
  '0 22 * * *',
  () => {
    const frase = generarFrase(frasesBuenasNoches);
    bot.sendMessage(chatId, `🌙 Buenas noches:\n\n${frase}\n\n💛 Duerme bien y sueña bonito.`);
    console.log('🌙 Mensaje de buenas noches enviado:', frase);
  },
  { timezone: 'Europe/Dublin' }
);

/* =====================================================
   💬 COMANDOS MANUALES
   ===================================================== */

// /start → Mensaje de bienvenida
bot.onText(/\/start/, (msg) => {
  const bienvenida = `👋 ¡Hola, ${msg.from.first_name || 'amigo'}!  
Soy tu bot motivacional.  
Usa estos comandos:

🌞 /frase → Te envío una frase motivadora  
🌙 /buenasnoches → Te deseo dulces sueños  

Y recuerda: siempre hay alguien que te quiere 💛`;
  bot.sendMessage(msg.chat.id, bienvenida);
});

// /frase → Envía frase motivadora
bot.onText(/\/frase/, (msg) => {
  const frase = generarFrase(frasesMotivadoras);
  bot.sendMessage(msg.chat.id, `${frase}\n\n💛 Recuerda que hay gente que te quiere.`);
  console.log(`Frase enviada a ${msg.chat.username || msg.chat.id}: ${frase}`);
});

// /buenasnoches → Envía frase nocturna
bot.onText(/\/buenasnoches/, (msg) => {
  const frase = generarFrase(frasesBuenasNoches);
  bot.sendMessage(msg.chat.id, `${frase}\n\n🌙 Que descanses bien 💛`);
  console.log(`Frase de buenas noches enviada a ${msg.chat.username || msg.chat.id}: ${frase}`);
});

/* =====================================================
   💬 RESPUESTA AUTOMÁTICA A PALABRAS CLAVE
   ===================================================== */
bot.on('message', (msg) => {
  const texto = msg.text?.toLowerCase() || '';
  if (texto.includes('triste') || texto.includes('estresada') || texto.includes('mal')|| texto.includes('bajona')) {
    bot.sendMessage(
      msg.chat.id,
      "😔 No estás solo, respira profundo.\nRecuerda que hay gente que te quiere 💛"
    );
    bot.sendMessage(
      msg.chat.id,
      "Si necesitas hablar, puedes hacerlo aquí 💬👇\nhttps://wa.me/34600111222"
    );
  }
});

console.log('🤖 Bot motivacional activo en Railway 🚀');

