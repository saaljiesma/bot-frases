require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch'); // ← ¡Así para Node 16!

// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;
const bot = new TelegramBot(token, { polling: true });

// Obtener curiosidad
async function getCuriosity() {
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();
    return data.text;
  } catch (err) {
    console.error(err);
    return "⚠️ No se pudo obtener una curiosidad. ¡Intenta de nuevo!";
  }
}

// Comando para obtener nueva curiosidad
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const fact = await getCuriosity();
  await bot.sendMessage(chat_id, `🧠 Curiosidad del día:\n${fact}`);
});

// Curiosidad diaria automática a las 12:00
const cron = require('node-cron');
cron.schedule('0 12 * * *', async () => {
  const fact = await getCuriosity();
  await bot.sendMessage(chatId, `🧠 Curiosidad del día:\n${fact}`);
  console.log('Curiosidad diaria enviada.');
}, { timezone: "Europe/Dublin" });

console.log("¡Bot de curiosidades de Telegram en marcha!");
