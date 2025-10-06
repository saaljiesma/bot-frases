import TelegramBot from 'node-telegram-bot-api';
import schedule from 'node-schedule';
import frases from './frases.js';
import frasesNoches from './frases_noches.js';

const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

// 👉 Función para obtener una frase aleatoria
function getRandomPhrase(lista) {
  const randomIndex = Math.floor(Math.random() * lista.length);
  return lista[randomIndex];
}

// 👉 Comando /start
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "👋 ¡Hola! Soy tu bot motivacional.\n\nUsa /frase para una frase del día 🌞 o /buenasnoches para cerrar el día 🌙");
});

// 👉 Comando /frase
bot.onText(/\/frase/, (msg) => {
  const frase = getRandomPhrase(frases);
  bot.sendMessage(msg.chat.id, `${frase}\n\n💛 Recuerda que hay gente que te quiere.`);
});

// 👉 Comando /buenasnoches
bot.onText(/\/buenasnoches/, (msg) => {
  const frase = getRandomPhrase(frasesNoches);
  bot.sendMessage(msg.chat.id, `${frase}\n\n🌙 Que descanses bien 💛`);
});

// 👉 Respuesta automática a palabras clave
bot.on('message', (msg) => {
  const texto = msg.text?.toLowerCase();
  if (!texto) return;

  if (texto.includes('triste') || texto.includes('estresado') || texto.includes('mal')) {
    bot.sendMessage(msg.chat.id, "😔 No estás solo, respira profundo.\nRecuerda que hay gente que te quiere 💛");
    bot.sendMessage(msg.chat.id, "Si necesitas hablar, escribe a este WhatsApp 💬👇\nhttps://wa.me/34600111222");
  }
});

// 👉 Envío automático diario a las 15:55 hora Irlanda
schedule.scheduleJob('55 15 * * *', () => {
  const frase = getRandomPhrase(frases);
  bot.sendMessage(chatId, `🌞 Frase del día:\n\n${frase}\n\n💛 Recuerda que hay gente que te quiere.`);
});

// 👉 Envío automático de buenas noches a las 22:30 hora Irlanda
schedule.scheduleJob('30 22 * * *', () => {
  const frase = getRandomPhrase(frasesNoches);
  bot.sendMessage(chatId, `🌙 Mensaje de buenas noches:\n\n${frase}\n\n💛 Duerme bien y sueña bonito.`);
});

console.log('🤖 Bot motivacional activo en Railway 🚀');
