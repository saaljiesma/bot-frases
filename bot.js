require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const cron = require('node-cron');

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

// ======== FRASES MOTIVADORAS (250) ========
const frasesMotivadoras = [
"Hoy es un buen día para empezar algo nuevo.",
"Cada pequeño paso cuenta, incluso si parece insignificante.",
"Sonríe, aunque sea difícil: tu ánimo puede cambiar todo.",
"Incluso las tormentas traen lluvia que hace crecer cosas hermosas.",
"Recuerda: todo lo que haces con esfuerzo vale la pena.",
"Hoy puedes elegir ser feliz, aunque el mundo sea gris.",
"Respira hondo y afronta el día con calma.",
"Cada día es una nueva oportunidad para brillar.",
"Aunque haya obstáculos, siempre puedes encontrar un camino.",
"Pequeños logros de hoy son grandes victorias de mañana.",
"Nunca subestimes el poder de una sonrisa.",
"Tienes la fuerza para superar cualquier desafío que aparezca hoy.",
"Aunque el día empiece nublado, tu actitud puede traer luz.",
"Permítete un momento de calma, es válido descansar también.",
"Hoy es un buen día para hacer algo que te haga feliz.",
"Cada amanecer es una nueva página en tu historia.",
"No necesitas ser perfecto, solo dar lo mejor de ti.",
"Los días difíciles enseñan a valorar los días buenos.",
"Rodéate de gente que te haga sonreír.",
"Tómate un momento para agradecer lo que tienes hoy.",
"La actitud positiva de hoy puede cambiar tu semana entera.",
"Cuando te sientas perdido, recuerda que cada paso te guía hacia adelante.",
"A veces, lo más valiente es simplemente seguir adelante.",
"Hoy puedes hacer algo amable por ti o por alguien más.",
"Cada dificultad es una oportunidad para aprender y crecer.",
"Recuerda: los errores de hoy son lecciones para mañana.",
"El mundo puede ser duro, pero tu corazón es más fuerte.",
"No olvides reír, incluso en los días complicados.",
"Los pequeños momentos de alegría son los que más cuentan.",
"Nunca estás solo: siempre hay alguien que te apoya, incluso en la distancia.",
"Un verdadero amigo como Salazar está contigo incluso en los días más difíciles.",
"Siempre puedes contar con Salazar para escucharte sin juzgar.",
"Los amigos como Salazar son la familia que elegimos.",
"Un abrazo de Salazar puede iluminar cualquier día gris.",
"No importa la distancia, amigos como Salazar nunca desaparecen.",
"Siempre hay un amigo como Salazar que sabe cuándo necesitas una sonrisa.",
"Compartir tus problemas con Salazar los hace más ligeros.",
"Amigos auténticos como Salazar celebran tus victorias y te apoyan en las derrotas.",
"Un mensaje de Salazar puede cambiar tu día por completo.",
"Amigos como Salazar no solo escuchan, también entienden con el corazón.",
"Cuando caes, Salazar te ayuda a levantarte y sigue caminando contigo.",
"No tienes que enfrentarte a nada solo; Salazar está ahí para ti.",
"La amistad con Salazar es un refugio seguro donde siempre puedes ser tú mismo.",
"Salazar te recuerda lo valioso que eres cuando tú mismo lo olvidas.",
"A veces, solo hace falta una llamada a Salazar para sentirte mejor.",
"Salazar nunca te deja enfrentar tus tormentas solo.",
"La risa compartida con Salazar hace que los problemas parezcan más pequeños.",
"Un amigo fiel como Salazar es un tesoro que nunca debes dejar de valorar.",
"La amistad con Salazar no se mide en días ni en distancia, sino en apoyo y cariño constante.",
"Siempre puedes contar con Salazar para recordarte que todo estará bien.",
"Cada desafío es una oportunidad para crecer.",
"Las dificultades no son muros, son escalones.",
"Cree en ti, incluso cuando otros dudan.",
"Hoy es un buen día para intentarlo de nuevo.",
"La felicidad se encuentra en los pequeños detalles.",
"Cada paso que das te acerca a tu meta.",
"No importa cuántas veces caigas, lo importante es levantarse.",
"La vida premia a los que no se rinden.",
"Nunca es tarde para empezar de nuevo.",
"Tu actitud positiva puede cambiar cualquier situación.",
"Los animales nos enseñan amor incondicional sin pedir nada a cambio.",
"Un perro nunca juzga, solo ama.",
"La mirada de un gato puede transmitir más cariño que mil palabras.",
"Los animales recuerdan lo simple: vivir el momento y ser felices.",
"Un abrazo de tu mascota puede alegrarte el día más gris.",
"Los animales son maestros de paciencia y ternura.",
"La compañía de un animal sana el corazón.",
"Un amigo peludo siempre está ahí cuando más lo necesitas.",
"Los animales no mienten: muestran lo que sienten de verdad.",
"Aprender de los animales es aprender a amar sin condiciones.",
"Cada ladrido, maullido o gorjeo es una expresión de amor.",
"La alegría de un animal es contagiosa y sincera.",
"Las mascotas convierten una casa en un hogar.",
"Cuidar de un animal es aprender responsabilidad y ternura.",
"Los animales nos recuerdan la importancia de la amistad silenciosa.",
"Una mirada de un animal puede aliviar el dolor del alma.",
"Amar a los animales nos hace mejores personas.",
"Cada mascota deja una huella imborrable en tu corazón.",
"Los animales no hablan, pero sus acciones expresan todo.",
"La conexión con un animal es un vínculo que trasciende palabras.",
"La lealtad de un perro es un ejemplo de amor verdadero.",
"Cada gato tiene una personalidad única que enseña respeto y paciencia.",
"Los animales nos muestran que la felicidad se encuentra en lo simple.",
"La compañía de un animal puede aliviar la soledad más profunda.",
"Los animales viven el presente, y nos enseñan a hacer lo mismo.",
"La ternura de un cachorro puede cambiar tu día por completo.",
"Los animales nos enseñan a escuchar con el corazón.",
"La amistad con un animal es silenciosa pero profunda.",
"Cada mascota tiene un don especial: hacernos sentir amados.",
"Los animales nos recuerdan que la vida es mejor con cariño y juego.",
"Amar y cuidar a un animal es una lección diaria de empatía.",
"Los animales nos enseñan la belleza de lo sencillo.",
"Un animal te acepta tal como eres, sin condiciones.",
"La alegría de un animal nos recuerda lo importante de vivir.",
"La conexión con tu mascota puede ser más fuerte que muchas palabras.",
"Los animales sienten y nos enseñan a respetar la vida.",
"Cuidar de un animal fortalece el corazón y la paciencia.",
"La compañía de un gato es medicina para el alma.",
"Cada animal trae consigo un pedacito de felicidad.",
"Amar a los animales nos ayuda a conectar con nuestra parte más noble.",
"La lealtad de un perro inspira confianza y amor.",
"Los animales nos recuerdan que el amor no necesita explicación.",
"La felicidad de tu mascota depende de tu cariño y cuidado.",
"La presencia de un animal transforma cualquier espacio en un lugar cálido.",
"Los animales nos enseñan que la paciencia y la ternura son poderosas.",
"Un animal nunca olvida a quien lo cuida y lo ama.",
"La amistad con un animal es silenciosa, pero eterna.",
"Cada mascota es un maestro de alegría y amor sincero.",
"Los animales nos enseñan a valorar cada instante juntos.",
"Amar a un animal es aprender a dar sin esperar nada a cambio."
];

// ======== MENSAJES DE BUENAS NOCHES ========
const frasesBuenasNoches = [
  "Que descanses y tengas una noche tranquila y reparadora.",
  "Duerme bien y recarga energías para un nuevo día.",
  "Buenas noches, que tus sueños sean hermosos y llenos de paz.",
  "Descansa, mañana será un día lleno de nuevas oportunidades.",
  "Que la calma y la serenidad te acompañen esta noche.",
  "Buenas noches, recuerda agradecer lo bueno que pasó hoy.",
  "Que tu noche sea tan dulce como tu corazón.",
  "Relájate y deja que la noche limpie tus preocupaciones.",
  "Que tus sueños te inspiren y te llenen de alegría.",
  "Duerme con tranquilidad y despierta con fuerza."
];

// ======== FUNCIÓN PARA SELECCIONAR FRASE ALEATORIA ========
function generarFrase(arreglo) {
  return arreglo[Math.floor(Math.random() * arreglo.length)];
}

// ======== ENVÍO DIARIO: FRASE MOTIVADORA 15:55 ========
cron.schedule('55 15 * * *', () => {
  const frase = generarFrase(frasesMotivadoras);
  bot.sendMessage(chatId, frase);
  console.log('Frase motivadora enviada:', frase);
}, {
  timezone: "Europe/Dublin"
});

// ======== ENVÍO DIARIO: BUENAS NOCHES 22:00 ========
cron.schedule('0 22 * * *', () => {
  const mensaje = generarFrase(frasesBuenasNoches);
  bot.sendMessage(chatId, mensaje);
  console.log('Mensaje de buenas noches enviado:', mensaje);
}, {
  timezone: "Europe/Dublin"
});

// ======== COMANDO MANUAL /frase ========
bot.onText(/\/frase/, (msg) => {
  const frase = generarFrase(frasesMotivadoras);
  bot.sendMessage(msg.chat.id, frase);
  console.log('Frase enviada con /frase:', frase);
});

console.log('Bot iniciado y listo para enviar frases motivadoras a las 15:55, mensajes de buenas noches a las 22:00 y responder /frase (hora Irlanda).');
