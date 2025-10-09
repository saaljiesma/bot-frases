require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // compatible con Node 18+

// Configuración del bot
const token = process.env.TELEGRAM_BOT_TOKEN; // Tu token
const chatId = process.env.CHAT_ID;           // Tu chat o grupo
const bot = new TelegramBot(token, { polling: true });

// Obtener curiosidad
async function getCuriosity() {
  try {
    const res = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
    const data = await res.json();
    return data.text; // Solo el texto de la curiosidad
  } catch (err) {
    console.error(err);
    return "⚠️ Could not fetch a curiosity. Try again!";
  }
}

// Comando para obtener nueva curiosidad
bot.onText(/\/curiosity/, async (msg) => {
  const chat_id = msg.chat.id;
  const fact = await getCuriosity();
  await bot.sendMessage(chat_id, `🧠 Curiosity of the Day:\n${fact}`);
});

// Curiosidad diaria automática a las 12:00
const cron = require('node-cron');
cron.schedule('0 12 * * *', async () => {
  const fact = await getCuriosity();
  await bot.sendMessage(chatId, `🧠 Curiosity of the Day:\n${fact}`);
  console.log('Curiosity of the day sent.');
}, { timezone: "Europe/Dublin" });

console.log("Telegram Curiosity Bot is running...");
