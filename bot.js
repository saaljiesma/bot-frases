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
const frasesMotivadoras = ["Hoy es un buen día para empezar algo nuevo 🌞✨",
"Cada pequeño paso cuenta, incluso si parece insignificante 👣💪",
"Sonríe, aunque sea difícil: tu ánimo puede cambiar todo 😊🌈",
"Incluso las tormentas traen lluvia que hace crecer cosas hermosas 🌧️🌱",
"Recuerda: todo lo que haces con esfuerzo vale la pena 💼🏆",
"Hoy puedes elegir ser feliz, aunque el mundo sea gris 🌤️😄",
"Respira hondo y afronta el día con calma 🌬️🧘",
"Cada día es una nueva oportunidad para brillar 🌟☀️",
"Aunque haya obstáculos, siempre puedes encontrar un camino 🛤️🌸",
"Pequeños logros de hoy son grandes victorias de mañana 🏅🌱",
"Nunca subestimes el poder de una sonrisa 😁💖",
"Tienes la fuerza para superar cualquier desafío que aparezca hoy 💪🔥",
"Aunque el día empiece nublado, tu actitud puede traer luz 🌥️🌞",
"Permítete un momento de calma, es válido descansar también 🛋️🌿",
"Hoy es un buen día para hacer algo que te haga feliz 🎨🎶",
"Cada amanecer es una nueva página en tu historia 🌅📖",
"No necesitas ser perfecto, solo dar lo mejor de ti 🌟❤️",
"Los días difíciles enseñan a valorar los días buenos 🌧️➡️☀️",
"Rodéate de gente que te haga sonreír 🤗💞",
"Tómate un momento para agradecer lo que tienes hoy 🙏💖",
"La actitud positiva de hoy puede cambiar tu semana entera 😄💪",
"Cuando te sientas perdido, recuerda que cada paso te guía hacia adelante 🧭👣",
"A veces, lo más valiente es simplemente seguir adelante 🦁✨",
"Hoy puedes hacer algo amable por ti o por alguien más 💌🌸",
"Cada dificultad es una oportunidad para aprender y crecer 🌱📈",
"Recuerda: los errores de hoy son lecciones para mañana 📝🌟",
"El mundo puede ser duro, pero tu corazón es más fuerte ❤️🛡️",
"No olvides reír, incluso en los días complicados 😆🌈",
"Los pequeños momentos de alegría son los que más cuentan 🌸✨",
"Nunca estás solo: siempre hay alguien que te apoya, incluso en la distancia 🤝❤️",
"Un verdadero amigo como Salazar está contigo incluso en los días más difíciles 👬💖",
"Siempre puedes contar con Salazar para escucharte sin juzgar 👂❤️",
"Los amigos como Salazar son la familia que elegimos 👨‍👨‍👦💞",
"Un abrazo de Salazar puede iluminar cualquier día gris 🤗🌤️",
"No importa la distancia, amigos como Salazar nunca desaparecen 🌍❤️",
"Siempre hay un amigo como Salazar que sabe cuándo necesitas una sonrisa 😊💌",
"Compartir tus problemas con Salazar los hace más ligeros 🗣️🌸",
"Amigos auténticos como Salazar celebran tus victorias y te apoyan en las derrotas 🥳🤝",
"Un mensaje de Salazar puede cambiar tu día por completo 💌✨",
"Amigos como Salazar no solo escuchan, también entienden con el corazón ❤️👂",
"Cuando caes, Salazar te ayuda a levantarte y sigue caminando contigo 🏃‍♂️🤝",
"No tienes que enfrentarte a nada solo; Salazar está ahí para ti ❤️👫",
"La amistad con Salazar es un refugio seguro donde siempre puedes ser tú mismo 🏡❤️",
"Salazar te recuerda lo valioso que eres cuando tú mismo lo olvidas 🌟💌",
"A veces, solo hace falta una llamada a Salazar para sentirte mejor 📞❤️",
"Salazar nunca te deja enfrentar tus tormentas solo ⛈️🤝",
"La risa compartida con Salazar hace que los problemas parezcan más pequeños 😆🌸",
"Un amigo fiel como Salazar es un tesoro que nunca debes dejar de valorar 💎❤️",
"La amistad con Salazar no se mide en días ni en distancia, sino en apoyo y cariño constante 🕰️💞",
"Siempre puedes contar con Salazar para recordarte que todo estará bien 🌈❤️",
"Cada desafío es una oportunidad para crecer 🌱💪",
"Las dificultades no son muros, son escalones 🪜✨",
"Cree en ti, incluso cuando otros dudan 💖🌟",
"Hoy es un buen día para intentarlo de nuevo 🌅💪",
"La felicidad se encuentra en los pequeños detalles 🌸😊",
"Cada paso que das te acerca a tu meta 🏃‍♂️🎯",
"No importa cuántas veces caigas, lo importante es levantarse 🌱💪",
"La vida premia a los que no se rinden 🏆🔥",
"Nunca es tarde para empezar de nuevo ⏰🌟",
"Tu actitud positiva puede cambiar cualquier situación 😄❤️",
"Los animales nos enseñan amor incondicional sin pedir nada a cambio 🐶❤️",
"Un perro nunca juzga, solo ama 🐕💖",
"La mirada de un gato puede transmitir más cariño que mil palabras 🐱❤️",
"Los animales recuerdan lo simple: vivir el momento y ser felices 🐾🌸",
"Un abrazo de tu mascota puede alegrarte el día más gris 🤗🐶",
"Los animales son maestros de paciencia y ternura 🐾💖",
"La compañía de un animal sana el corazón 🐕❤️",
"Un amigo peludo siempre está ahí cuando más lo necesitas 🐶❤️",
"Los animales no mienten: muestran lo que sienten de verdad 🐾✨",
"Aprender de los animales es aprender a amar sin condiciones 🐶💖",
"Cada ladrido, maullido o gorjeo es una expresión de amor 🐕🐱❤️",
"La alegría de un animal es contagiosa y sincera 🐾😄",
"Las mascotas convierten una casa en un hogar 🏡🐶",
"Cuidar de un animal es aprender responsabilidad y ternura 🐾🌸",
"Los animales nos recuerdan la importancia de la amistad silenciosa 🐱❤️",
"Una mirada de un animal puede aliviar el dolor del alma 🐾❤️",
"Amar a los animales nos hace mejores personas 🐶💖",
"Cada mascota deja una huella imborrable en tu corazón 🐾❤️",
"Los animales no hablan, pero sus acciones expresan todo 🐶🐱💖",
"La conexión con un animal es un vínculo que trasciende palabras 🐾❤️",
"La lealtad de un perro es un ejemplo de amor verdadero 🐕❤️",
"Cada gato tiene una personalidad única que enseña respeto y paciencia 🐱✨",
"Los animales nos muestran que la felicidad se encuentra en lo simple 🐾😊",
"La compañía de un animal puede aliviar la soledad más profunda 🐶💖",
"Los animales viven el presente, y nos enseñan a hacer lo mismo 🐾🌸",
"La ternura de un cachorro puede cambiar tu día por completo 🐶❤️",
"Los animales nos enseñan a escuchar con el corazón 🐾❤️",
"La amistad con un animal es silenciosa pero profunda 🐶💖",
"Cada mascota tiene un don especial: hacernos sentir amados 🐾❤️",
"Los animales nos recuerdan que la vida es mejor con cariño y juego 🐶🌸",
"Amar y cuidar a un animal es una lección diaria de empatía 🐾❤️",
"Los animales nos enseñan la belleza de lo sencillo 🐶✨",
"Un animal te acepta tal como eres, sin condiciones 🐾💖",
"La alegría de un animal nos recuerda lo importante de vivir 🐶❤️",
"La conexión con tu mascota puede ser más fuerte que muchas palabras 🐾❤️",
"Los animales sienten y nos enseñan a respetar la vida 🐶🌱",
"Cuidar de un animal fortalece el corazón y la paciencia 🐾💖",
"La compañía de un gato es medicina para el alma 🐱❤️",
"Cada animal trae consigo un pedacito de felicidad 🐶✨",
"Amar a los animales nos ayuda a conectar con nuestra parte más noble 🐾💖",
"La lealtad de un perro inspira confianza y amor 🐕❤️",
"Los animales nos recuerdan que el amor no necesita explicación 🐾❤️",
"La felicidad de tu mascota depende de tu cariño y cuidado 🐶💖",
"La presencia de un animal transforma cualquier espacio en un lugar cálido 🐾🏡",
"Los animales nos enseñan que la paciencia y la ternura son poderosas 🐶❤️",
"Un animal nunca olvida a quien lo cuida y lo ama 🐾❤️",
"La amistad con un animal es silenciosa, pero eterna 🐶💖",
"Cada mascota es un maestro de alegría y amor sincero 🐾❤️",
"Los animales nos enseñan a valorar cada instante juntos 🐶✨",
"Amar a un animal es aprender a dar sin esperar nada a cambio 🐾❤️",
"Cada amanecer trae una nueva oportunidad 🌅✨",
"Confía en tu camino, aunque aún no veas el destino 🛤️💫",
"Los sueños se construyen paso a paso 🧱🌟",
"Hoy puede ser el comienzo de algo increíble 💫🌸",
"Tu sonrisa puede iluminar el día de alguien más 😊🌞",
"Todo gran logro empezó con un pequeño intento 💪🌱",
"Si caes siete veces, levántate ocho 🌈🙌",
"La vida florece cuando te atreves a creer en ti 🌷💖",
"No te rindas: lo mejor puede estar a un paso ✨🚶‍♀️",
"Lo que hoy parece difícil, mañana será tu orgullo 🌞💪",
"Brilla sin miedo, el mundo necesita tu luz 🌟❤️",
"El esfuerzo de hoy es el éxito de mañana 🌱🏆",
"Cada día tiene su propio encanto, solo hay que encontrarlo 🌻💫",
"Todo lo que necesitas ya está dentro de ti 💖🔥",
"Deja que el tiempo sane lo que el corazón no puede explicar ⏳❤️",
"La paciencia también es una forma de fuerza 🧘‍♀️🌿",
"Camina con fe, incluso cuando el camino no esté claro 🚶‍♂️✨",
"Las mejores cosas llegan cuando menos las esperas 🌈💌",
"Hoy es un gran día para agradecer lo que tienes 🙏🌸",
"No hay lluvia eterna; siempre vuelve a salir el sol 🌧️☀️",
"Los comienzos son el primer paso hacia tus sueños 🌱🚀",
"A veces, no necesitas respuestas, solo respirar y seguir 🌬️💖",
"Cada sonrisa tuya es una victoria 🌞😊",
"El coraje no siempre ruge, a veces susurra: ‘mañana lo intentaré otra vez’ 🦁❤️",
"No hay montaña demasiado alta si crees en ti 🏔️💪",
"El cambio empieza cuando decides hacerlo diferente 🌻✨",
"Rodéate de personas que saquen lo mejor de ti 🤗🌈",
"Hoy es un regalo, por eso se llama presente 🎁💖",
"Aprende a bailar bajo la lluvia 🌧️💃",
"Cada caída te hace más fuerte 🌱🔥",
"Lo mejor está por venir 🌅💫",
"Tu energía atrae lo que mereces ⚡❤️",
"El amor propio es el comienzo de todo 🌸❤️",
"No importa cuánto tardes, avanza a tu ritmo 🐢✨",
"Los finales solo son nuevos comienzos 🌅📖",
"Encuentra magia en las cosas pequeñas ✨🍀",
"Tu sonrisa puede cambiar el mundo 🌞💖",
"Vive con pasión, ríe sin miedo, ama sin límites 💃❤️",
"No te compares, tu camino es único 🌈🌿",
"A veces, el silencio dice más que las palabras 🤫💫",
"Hoy mereces un descanso sin culpa 🛋️☕",
"Tu esfuerzo vale más de lo que imaginas 💪💎",
"El universo conspira a favor de los valientes 🌌🔥",
"Tu historia aún se está escribiendo 📖✨",
"Todo florece cuando dejas ir lo que pesa 🌷❤️",
"Donde hay amor, siempre hay esperanza ❤️🌈",
"Las cosas buenas toman tiempo, confía en el proceso ⏳🌱",
"Respira y recuerda cuánto has superado 🌬️💪",
"Pequeños pasos, grandes cambios 👣🌟",
"No te apresures, lo bonito tarda en llegar 🌸🐢",
"Todo esfuerzo tiene su recompensa 🏆💖",
"El sol siempre vuelve a brillar ☀️🌈",
"Tu mejor versión está creciendo día a día 🌱✨",
"Agradece más, preocúpate menos 🙏🌻",
"Sonríe sin razón, esa es la mejor medicina 😄💊",
"Confía en el ritmo de la vida 🎶🌊",
"Hoy es el día perfecto para empezar algo nuevo 🌞🚀",
"Deja que tu luz interior guíe el camino 🔥❤️",
"Todo lo que das, vuelve multiplicado 🌻💖",
"Las cicatrices cuentan historias de fuerza 💪🌙",
"Cada amanecer es una nueva oportunidad 🌅💫",
"No necesitas ser perfecto, solo auténtico 🌸❤️",
"La vida siempre recompensa a los que siguen creyendo 🌈✨",
"Rodéate de buena energía y deja que te transforme ⚡🌿",
"Tu sonrisa es tu superpoder 😄💥",
"Los días difíciles no duran para siempre 🌧️☀️",
"Confía en tu proceso, incluso si aún no ves resultados 🧭💫",
"Las estrellas no brillan sin oscuridad 🌌✨",
"Un paso a la vez, eso también es avanzar 👣❤️",
"Permítete sentir, llorar y luego volver a brillar 💧🌞",
"El amor propio es la base de todo 💖🌻",
"Hoy es el día perfecto para cuidar de ti 🧘‍♀️🍃",
"La felicidad se cultiva, igual que una flor 🌷❤️",
"Cada logro comienza con el valor de intentarlo 💪🔥",
"Donde hay fe, hay posibilidad 🌈🙏",
"Los buenos días empiezan con pensamientos positivos ☀️💖",
"No hay nada más hermoso que ser tú mismo 🌸✨",
"A veces, un pequeño cambio puede transformar tu mundo 🔄💫",
"Tu esfuerzo vale oro 🏅❤️",
"Sonríe más, preocúpate menos 😊🌈",
"Cada día es una nueva oportunidad de ser mejor 🌞🌱",
"Las personas buenas brillan sin necesitar focos ✨❤️",
"Hoy puedes elegir la paz 🕊️💖",
"Tu energía crea tu realidad ⚡🌸",
"La calma también es productividad 🧘‍♂️🌿",
"Aprende a confiar en el tiempo, todo llega cuando debe ⏳🌷",
"Siembra amor y cosecharás alegría 🌻💖",
"La bondad nunca pasa de moda 🤝✨",
"Donde hay gratitud, hay abundancia 🙏🌈",
"Tu historia inspira más de lo que crees 📖💫",
"A veces, descansar también es avanzar 💤🌸",
"Disfruta el viaje, no solo la meta 🚗🌈",
"Lo mejor que puedes ser es feliz contigo mismo ❤️😊",
"Tu alma merece calma 🧘‍♀️🌿",
"Las cosas buenas llegan a quien no se rinde 💪🌞",
"La felicidad no se busca, se crea 🌸✨",
"El amor propio te hace invencible 💖🔥",
"Cada día puedes empezar de nuevo 🌅💫",
"Lo bonito de la vida está en los pequeños detalles 🌻❤️",
"Cuida de ti como cuidas de los demás 💞🌷",
"Lo que das con amor, regresa multiplicado ❤️🌈",
"Sonríe al espejo, esa persona lo merece 😊💫",
"Hoy elige ver lo bueno 🌞🌻",
"Tu paz vale más que tener la razón 🕊️💖",
"El universo recompensa a los corazones valientes 🌌❤️",
"Siempre hay algo por lo que sonreír 😄🌸",
"Cada día puede ser un nuevo comienzo 🌅🌟",
"Las mejores cosas de la vida no son cosas 💖🌈",
"El optimismo es la llave del cambio 🔑✨",
"Tu luz interior puede iluminar el mundo 🌟❤️",
"Todo es posible si crees de verdad 🌈💪",
"Los abrazos curan lo que las palabras no pueden 🤗💖",
"Hoy decide ser tu mejor versión 🌸💫",
"El amor siempre gana ❤️🌈",
"Cada día tienes una nueva oportunidad para brillar ☀️✨",
"Los animales te aman sin juicios, solo con el corazón 🐾💖",
"Un ronroneo vale más que mil palabras 🐱💞",
"El movimiento de una cola es pura felicidad 🐶🌈",
"Un paseo con tu mascota es una dosis de alegría 🐾🌳",
"Los animales sienten, aman y entienden más de lo que crees 🐕❤️",
"Un perro feliz puede alegrar todo un vecindario 🐶😄",
"Un gato dormido transmite paz 🐱🕊️",
"Los animales nos enseñan a vivir el presente 🐾🌞",
"Una mirada animal puede sanar un alma rota 🐕💖",
"Cada mascota es una historia de amor puro 🐾✨",
"Los animales son ángeles sin alas 🐾😇",
"Tu mascota no necesita palabras para decir ‘te amo’ 🐶❤️",
"Los animales viven con el corazón, no con el ego 🐾💫",
"Quien ama a los animales tiene un alma hermosa 🐶🌸",
"El amor de un animal es el más sincero del mundo 🐾❤️",
"Un lametazo es una forma de decir ‘te quiero’ 🐶💖",
"Cada mascota deja huellas eternas 🐾🌈",
"Los animales no hablan, pero su amor grita 🐾❤️",
"Un animal te hace mejor persona cada día 🐶✨",
"Cada paso hacia adelante, por pequeño que sea, te acerca a tu meta 👣🌟",
"No mires atrás, ya no vas en esa dirección 🚀✨",
"Cuando sientas que no puedes más, recuerda por qué empezaste 💭🔥",
"Las montañas más altas se suben paso a paso 🏔️👣",
"El éxito comienza con el valor de seguir intentándolo 💪💫",
"A veces avanzar es simplemente no rendirse 🌈💖",
"No importa lo lento que vayas, mientras no te detengas 🐢🌟",
"Cada día que sigues adelante, ya estás ganando ❤️🏆",
"El futuro pertenece a los que siguen luchando 🌅🔥",
"Tu esfuerzo de hoy será tu orgullo mañana 🌻💪",
"Nunca es tarde para volver a empezar 🌄✨",
"Todo gran logro empezó con un pequeño paso 🌱🚶‍♀️",
"Caer está permitido, rendirse no 💥💪",
"Cada caída es una oportunidad para levantarte más fuerte 💫🦁",
"Lo mejor aún está por venir 🌞🌈",
"Avanza, aunque sea con miedo 🚶‍♂️🔥",
"La meta no está lejos, sigue caminando 🛤️🌟",
"Tu persistencia vale más que tu talento 💎💪",
"No esperes a sentirte listo, empieza ahora 🚀✨",
"Las tormentas también forman guerreros 🌧️⚔️",
"No dejes que el cansancio venza a tus sueños 💭💖",
"A veces, el coraje es dar un paso más cuando crees que no puedes 🦋💪",
"Tu determinación abrirá puertas que el miedo cerró 🔑🔥",
"El fracaso solo existe cuando dejas de intentarlo 💥🌟",
"Las cosas difíciles toman tiempo, pero valen la pena ⏳💫",
"Cada esfuerzo te transforma, aunque no lo veas ahora 🌱✨",
"El dolor de hoy es la fuerza de mañana 💪🌅",
"Si te caes siete veces, levántate ocho 💥🙌",
"Nadie dijo que sería fácil, pero sí que valdría la pena 🌈💖",
"Las metas grandes se logran con pasos pequeños y firmes 👣🌟",
"No te rindas, el principio siempre es lo más difícil 🚶‍♀️🔥",
"Cuando quieras rendirte, recuerda lo lejos que has llegado 🌻💪",
"Avanza aunque tengas miedo, el valor viene en el camino 🌈🦋",
"El éxito no llega por suerte, llega por constancia 🌟💼",
"Lo imposible solo tarda un poco más 💫🏆",
"Cada día cuenta, incluso los que parecen perdidos 🕰️🌱",
"El esfuerzo constante vence al talento pasivo 💪⚡",
"Tu futuro yo te agradecerá no haberte rendido 🌅❤️",
"Si no puedes correr, camina. Pero no te detengas 👣🔥",
"La perseverancia convierte lo imposible en inevitable 🌟🛤️",
"El miedo no desaparece, aprendes a avanzar con él 🦁💫",
"Cada error es un paso más hacia el éxito 📈🌈",
"No hay avance sin esfuerzo 💪🌻",
"A veces avanzar es dejar ir lo que te detiene 🕊️💖",
"Tu actitud determina tu dirección 🧭🌞",
"No busques el camino fácil, busca el camino correcto 🛤️🔥",
"Cuando sientas dudas, recuerda cuánto has superado 💭💪",
"El progreso no se mide en velocidad, sino en constancia 🕰️🌱",
"El éxito llega cuando la disciplina vence a la pereza ⚡💪",
"Los grandes sueños requieren pasos valientes 🌈✨",
"El cambio empieza con una decisión 🌻🚀",
"Tu fuerza interior es más grande que cualquier obstáculo 💎💫",
"Si no puedes cambiar el viento, ajusta tus velas ⛵🌅",
"Cada nuevo día es una nueva oportunidad para avanzar 🌞💖",
"No te compares, tu camino es único 🌿🌟",
"La paciencia también es una forma de avanzar 🧘‍♀️❤️",
"Las caídas son parte del viaje, no el final 🛤️🌈",
"Avanza con fe, aunque no veas el destino 🦋💫",
"No mires el reloj, haz que el tiempo cuente ⏰🔥",
"La motivación te inicia, la disciplina te mantiene 💪⚙️",
"A veces solo necesitas creer un poco más en ti 🌟❤️",
"El esfuerzo silencioso genera resultados ruidosos 💥🏆",
"No importa lo que falte, enfócate en lo que ya has logrado 🌻❤️",
"El miedo es una señal de que estás creciendo 🌈💪",
"No te detengas hasta estar orgulloso de ti mismo 🌟💖",
"El camino difícil te hace más fuerte 🏔️🔥",
"Cada día que sigues adelante es una victoria 👣💫",
"El éxito no es la meta, es el proceso 🌱🚶‍♀️",
"La fuerza no viene de ganar, sino de seguir intentando 💪🌻",
"No busques excusas, busca razones 💡🔥",
"Las grandes cosas toman tiempo, pero llegan 🌈⏳",
"Si no desafías tus límites, nunca sabrás de qué eres capaz 💫🦁",
"Todo esfuerzo cuenta, incluso los invisibles 🌿💖",
"El secreto del éxito es empezar y no parar 🚀💪",
"Tu mejor versión está creciendo dentro de ti 🌱🌟",
"No necesitas correr, solo seguir adelante 🐢💫",
"Los sueños grandes asustan, pero también inspiran 💭🔥",
"No tengas miedo de empezar de nuevo, ahora lo harás mejor 🌈💪",
"Cada obstáculo es una oportunidad disfrazada 🛤️💖",
"El progreso pequeño sigue siendo progreso 🌱✨",
"Tu constancia te llevará donde el talento no puede 💪🏆",
"No existe fracaso si sigues aprendiendo 💫📖",
"El dolor pasa, el orgullo queda 🌄🔥",
"Tu actitud positiva puede cambiarlo todo 🌞❤️",
"Los días difíciles construyen personas fuertes 🌧️💪",
"Donde otros ven límites, tú verás posibilidades 🚀🌈",
"No te detengas ahora, estás más cerca de lo que crees 🛤️🌟",
"El esfuerzo de hoy será tu sonrisa mañana 😊🏆",
"Las metas se alcanzan paso a paso, no de golpe 👣🌱",
"Cada día que luchas, te haces más fuerte 💪💖",
"La diferencia entre rendirse y triunfar es un paso más 🌈🚶‍♀️",
"Tu historia no termina aquí, sigue escribiendo 📖✨",
"Todo es posible si no te rindes 🌟🔥",
"El éxito no es suerte, es perseverancia 🌻💪",
"Sigue avanzando, incluso si nadie te ve 🌙💫",
"A veces solo necesitas recordar lo capaz que eres 💭💪",
"Cuando pienses en rendirte, recuerda tu propósito 🎯💖",
"El cansancio pasa, el logro permanece 🏆🌅",
"Si sigues adelante con fe, todo se acomoda 🌈🕊️",
"Tu futuro está en las decisiones que tomas hoy 💡💪",
"Cada paso firme te acerca a tus sueños 👣🌟",
"Si puedes soñarlo, puedes lograrlo 💭🚀"
];

// ======== MENSAJES DE BUENAS NOCHES ========
const frasesBuenasNoches = [
"Que tengas una noche llena de calma y sueños bonitos 🌙💤",
"Descansa, mañana el sol traerá nuevas oportunidades 🌅✨",
"Que tus pensamientos se apaguen y tu corazón descanse 💖😴",
"Cierra los ojos y deja que la noche te abrace 🌌🕊️",
"Que sueñes con cosas lindas y despiertes con una sonrisa 😊🌙",
"Apaga tus preocupaciones y enciende la paz interior 💫🕯️",
"Cada estrella en el cielo te desea dulces sueños ⭐🌙",
"Deja que la luna cuide de ti esta noche 🌕💤",
"Respira profundo y deja ir el día con gratitud 🌾✨",
"Que el silencio de la noche te regale serenidad 🌙💖",
"Buenas noches, descansa y recarga tu energía 💫😴",
"Que Morfeo te abrace con dulzura esta noche 💫😴",
"Relájate, desconecta y déjate llevar por la calma nocturna 🌙🛏️",
"Que cada estrella te arrope con tranquilidad 🌟💤",
"Cierras los ojos, el mundo se apaga y empieza la paz 🌙✨",
"Que descanses profundamente y despiertes lleno de energía 💖🌅",
"Que la noche te renueve y el descanso te inspire 🌌💫",
"Apaga las luces del día y enciende la luz de la paz interior 🌙🕯️",
"Que los sueños te llenen de alegría y esperanza 🌟💤",
"Deja que el silencio de la noche acaricie tu mente 🌌💖",
"Buenas noches, descansa y sueña bonito 🌙💤",
"Cada estrella brilla para recordarte que todo estará bien ✨🌙",
"Que tus sueños sean un refugio de calma y serenidad 🕊️💤",
"Deja que la luna ilumine tu noche con tranquilidad 🌕💫",
"Respira, relájate y entrega tus preocupaciones a la noche 🌌💖",
"Que la paz te envuelva mientras duermes profundamente 🌙🛏️",
"Que Morfeo te lleve a un mundo de sueños bonitos 💫😴",
"Apaga tus preocupaciones y enciende la gratitud 🌙✨",
"Que la noche te regale descanso y renovación 💖🌌",
"Cada estrella en el cielo es un abrazo nocturno ⭐💤",
"Que los sueños suaves te acompañen hasta el amanecer 🌙💫",
"Relájate y deja que la calma se instale en tu corazón 🌌🕊️",
"Que descanses y despiertes con energía positiva 🌅💖",
"Que tus pensamientos se llenen de paz antes de dormir 🌙💤",
"Deja que la noche limpie tus preocupaciones 🌌✨",
"Que los sueños te lleven a lugares llenos de alegría 💫🌙",
"Respira profundo y deja que la calma te abrace 🌙🛏️",
"Que cada estrella te recuerde que siempre hay luz ⭐💖",
"Que el descanso de hoy sea la fuerza de mañana 🌅💤",
"Apaga tu mente y enciende la tranquilidad 🌙💫",
"Que la noche transforme tus preocupaciones en calma 🌌💖",
"Que sueñes con cosas lindas y tiernas esta noche 🌙💤",
"Relájate y deja que tu cuerpo se recargue 🌌✨",
"Que cada respiración te acerque a la paz interior 🌙💖",
"Que Morfeo te envuelva en sus brazos y te lleve a dulces sueños 💫🕊️",
"Que la noche te renueve y te inspire a despertar feliz 🌅🌟",
"Descansa profundamente y deja que tu mente se serene 🌙💤",
"Que los sueños te llenen de calma, amor y alegría 🌌💖",
"Apaga las preocupaciones y disfruta de la serenidad 🌙✨",
"Que el silencio de la noche sea un bálsamo para tu alma 🌌💫",
"Que cada estrella ilumine tu descanso y tus pensamientos ⭐💤",
"Buenas noches, descansa y que tus sueños sean felices 🌙💖",
"Que la luna te arrope y te regale sueños tranquilos 🌙💤",
"Descansa esta noche y despierta con alegría 🌅💖",
"Que tu corazón se llene de calma antes de dormir 💫🕊️",
"Buenas noches, que la paz te acompañe toda la noche 🌌✨",
"Que los sueños suaves te envuelvan en tranquilidad 🌙💤",
"Apaga tus pensamientos y deja que tu mente repose 🌌💖",
"Que cada estrella ilumine tu camino hacia el descanso ⭐🌙",
"Relájate, respira y deja que la noche te cuide 🌙💫",
"Que el silencio de la noche llene tu alma de serenidad 🌌🕊️",
"Descansa bien y deja que los sueños te inspiren 🌙💤",
"Que la tranquilidad de la noche te abrace con cariño 🌌💖",
"Buenas noches, descansa y sueña bonito 🌙✨",
"Que cada respiración te acerque a la paz interior 💫🕊️",
"Deja que Morfeo te lleve a un mundo de sueños hermosos 🌙💤",
"Que los ángeles cuiden tu sueño y te llenen de calma 🌌💖",
"Apaga las preocupaciones y enciende la serenidad 🌙💫",
"Que los sueños te llenen de alegría y fuerza para mañana 🌅✨",
"Relájate, desconecta y siente la calma en tu corazón 🌙💤",
"Que la noche transforme tu descanso en energía positiva 🌌💖",
"Buenas noches, descansa y deja que todo fluya 🌙✨",
"Que cada estrella sea un abrazo que te acompañe toda la noche ⭐💫",
"Respira, suelta el día y deja que la calma te abrace 🌌💤",
"Que el descanso de esta noche renueve tu espíritu 🌙💖",
"Apaga tus pensamientos y deja que tu mente se serene 🌌✨",
"Que la luna ilumine tus sueños con tranquilidad 🌕💤",
"Buenas noches, descansa y despierta lleno de paz 🌙💖",
"Que los sueños suaves te llenen de esperanza 🌌💫",
"Relájate y deja que la calma te envuelva esta noche 🌙💤",
"Que cada estrella te recuerde que todo estará bien ⭐💖",
"Que Morfeo te abrace y te lleve a dulces sueños 🌌💫",
"Que el silencio de la noche te regale serenidad 🌙🕊️",
"Buenas noches, descansa profundamente y sueña bonito 🌙💤",
"Que la noche transforme tus preocupaciones en tranquilidad 🌌💖",
"Descansa, relájate y deja que la calma te acompañe 🌙✨",
"Que los sueños te llenen de alegría y paz interior 🌌💤",
"Apaga tus preocupaciones y enciende la gratitud 🌙💖",
"Que cada respiración te acerque a la paz y el descanso 💫🕊️",
"Buenas noches, descansa y deja que tu corazón se serene 🌙✨",
"Que la luna te arrope y tus pensamientos se apaguen 🌌💤",
"Relájate y deja que la noche cuide de ti 🌙💖",
"Que los sueños hermosos te acompañen hasta el amanecer 🌌💫",
"Descansa profundamente y despierta con energía positiva 🌅✨",
"Que la tranquilidad de la noche llene tu mente de calma 🌙💤",
"Buenas noches, descansa y sueña con cosas lindas 🌌💖",
"Que cada estrella ilumine tu descanso y te inspire ⭐💫",
"Apaga la mente, respira y deja que Morfeo te lleve 🌙💤",
"Que los sueños te llenen de alegría y fuerza interior 🌌💖",
"Relájate y deja que la paz se instale en tu corazón 🌙✨",
"Buenas noches, descansa y deja que todo fluya con calma 🌌💤",
"Que la luna y las estrellas cuiden tu descanso esta noche 🌙💫",
"Que la serenidad de la noche renueve tu espíritu 🌌💖",
"Descansa profundamente y despierta lleno de energía 🌅💤",
"Buenas noches, que tus sueños sean dulces y tranquilos 🌙💫",
"Que cada respiración te acerque a la paz y la calma interior 🌌💖",
"Relájate y deja que la noche te arrope con suavidad 🌙💤",
"Que Morfeo te lleve a un mundo de dulces sueños y tranquilidad 🌌✨",
"Que la noche te traiga descanso profundo y tranquilidad 🌌💤",
"Buenas noches, descansa y deja que tus sueños sean felices 🌙💖",
"Relájate, apaga tus preocupaciones y siente la calma 🌙🕊️",
"Que cada estrella ilumine tu descanso y tu corazón ⭐💫",
"Que Morfeo te envuelva y te lleve a dulces sueños 💫😴",
"Descansa esta noche y recarga tu energía para mañana 🌙💤",
"Que tus pensamientos se llenen de paz y serenidad 🌌💖",
"Buenas noches, deja que la calma te abrace 🌙✨",
"Que la luna cuide tus sueños y te traiga tranquilidad 🌕💤",
"Relájate y siente la serenidad de la noche 🌌💖",
"Que los ángeles te acompañen en tu descanso nocturno 🕊️🌙",
"Descansa profundamente y despierta lleno de energía positiva 🌅💫",
"Que cada respiración te acerque a la paz interior 🌌💤",
"Buenas noches, sueña con cosas lindas y tiernas 🌙💖",
"Que el silencio de la noche llene tu corazón de calma 🌌✨",
"Relájate, desconecta y deja que la tranquilidad te envuelva 🌙💤",
"Que la luna y las estrellas te arropen esta noche 🌕💫",
"Descansa, respira y deja que tus pensamientos se apaguen 🌌💖",
"Buenas noches, que la paz te acompañe toda la noche 🌙✨",
"Que Morfeo te lleve a un mundo de sueños bonitos y tranquilos 💫🌌",
"Relájate y deja que la noche te recargue de energía 🌙💤",
"Que cada estrella sea un abrazo que te acompañe hasta el amanecer ⭐💖",
"Buenas noches, descansa y deja que tu corazón se serene 🌙✨",
"Que la tranquilidad de la noche renueve tu mente y espíritu 🌌💫",
"Descansa profundamente y deja que los sueños te llenen de calma 🌙💤",
"Que tus pensamientos se apaguen y tu alma encuentre paz 🌌💖",
"Relájate y deja que la serenidad te envuelva esta noche 🌙✨",
"Buenas noches, descansa y sueña bonito 🌌💫",
"Que la luna ilumine tus sueños y tu descanso 🌕💤",
"Que cada respiración te acerque a la calma interior 🌌💖",
"Descansa, desconecta y deja que la noche te abrace 🌙✨",
"Que Morfeo te lleve a un mundo de dulces sueños 💫🕊️",
"Buenas noches, que tus pensamientos se llenen de paz 🌌💤",
"Relájate y siente cómo la calma entra en tu corazón 🌙💖",
"Que cada estrella te recuerde que todo estará bien ⭐💫",
"Descansa profundamente y despierta lleno de energía positiva 🌅💤",
"Que la noche transforme tus preocupaciones en serenidad 🌌✨",
"Buenas noches, descansa y deja que la tranquilidad te abrace 🌙💖",
"Que tus sueños sean dulces y reconfortantes 🌌💫",
"Relájate, respira y entrega tus preocupaciones a la noche 🌙💤",
"Que Morfeo te envuelva y te lleve a un mundo de calma 💫🕊️",
"Buenas noches, descansa y siente cómo la serenidad te llena 🌌💖",
"Que la luna y las estrellas cuiden tu descanso esta noche 🌕✨",
"Descansa, relájate y deja que la calma te acompañe 🌙💤",
"Que cada respiración te acerque a la paz interior 🌌💖",
"Buenas noches, sueña con cosas bonitas y tranquilas 🌙✨",
"Relájate y deja que la noche llene tu corazón de calma 🌌💫",
"Que Morfeo te lleve a dulces sueños y descanso profundo 💫💤",
"Descansa profundamente y despierta lleno de energía 🌅💖",
"Que la tranquilidad de la noche te regale serenidad 🌌✨",
"Buenas noches, descansa y deja que tus pensamientos se calmen 🌙💤",
"Que cada estrella ilumine tu descanso y te inspire ⭐💫",
"Relájate, respira y deja que la paz te abrace 🌌💖",
"Que la luna cuide tu noche y te lleve a sueños bonitos 🌕💫",
"Buenas noches, descansa y sueña con calma 🌙💤",
"Que la noche te traiga descanso profundo y dulces sueños 🌌💤",
"Buenas noches, descansa y deja que tus pensamientos se calmen 🌙💖",
"Relájate y siente la serenidad de la noche 🌌🕊️",
"Que la luna y las estrellas iluminen tu descanso 🌕💫",
"Que Morfeo te lleve a un mundo de paz y sueños bonitos 💫😴",
"Descansa profundamente y despierta lleno de energía 🌅✨",
"Que cada respiración te acerque a la tranquilidad interior 🌌💤",
"Buenas noches, descansa y sueña con cosas bonitas 🌙💖",
"Que la calma de la noche abrace tu mente y corazón 🌌💫",
"Relájate y deja que la noche cuide de ti 🌙🛏️",
"Que los sueños suaves te acompañen hasta el amanecer 🌌💤",
"Buenas noches, descansa y recarga tu energía 🌙💖",
"Que la luna cuide tus sueños y te traiga serenidad 🌕💫",
"Descansa, respira y deja que tus preocupaciones se disuelvan 🌌💤",
"Que Morfeo te envuelva en sus brazos y te lleve a dulces sueños 💫🕊️",
"Relájate, desconecta y deja que la paz te acompañe 🌙✨",
"Que cada estrella ilumine tu descanso y te inspire ⭐💤",
"Buenas noches, descansa profundamente y sueña bonito 🌌💖",
"Que la noche transforme tus preocupaciones en calma 🌙💫",
"Descansa, relájate y deja que la serenidad te llene 🌌💤",
"Que la luna y las estrellas te arropen esta noche 🌕💖",
"Buenas noches, descansa y deja que tus pensamientos se calmen 🌙✨",
"Que Morfeo te lleve a un mundo de sueños tranquilos 💫🕊️",
"Relájate y deja que la calma te abrace esta noche 🌌💤",
"Que cada respiración te acerque a la paz interior 🌙💖",
"Descansa profundamente y despierta lleno de energía positiva 🌅✨",
"Buenas noches, sueña con cosas lindas y reconfortantes 🌌💫",
"Que la noche te envuelva con serenidad y tranquilidad 🌙💤",
"Relájate, respira y deja que la paz te rodee 🌌💖",
"Que Morfeo cuide tu sueño y te lleve a un descanso profundo 💫🕊️",
"Buenas noches, descansa y sueña bonito 🌙✨",
"Que la luna ilumine tus pensamientos y tu corazón 🌕💤",
"Descansa, desconecta y deja que la tranquilidad entre en ti 🌌💖",
"Que los sueños suaves te llenen de alegría y calma 🌙💫",
"Buenas noches, descansa y deja que tu mente se serene 🌌💤",
"Que la noche transforme tus preocupaciones en paz 🌙💖",
"Relájate y siente cómo la serenidad te envuelve 🌌✨",
"Que Morfeo te lleve a un mundo de dulces sueños y descanso 💫🕊️",
"Buenas noches, descansa profundamente y sueña bonito 🌙💤",
"Que cada estrella te recuerde que siempre hay luz ⭐💖",
"Descansa, respira y deja que la calma te abrace 🌌💫",
"Que la luna cuide tus sueños y te traiga serenidad 🌕💤",
"Buenas noches, descansa y sueña con cosas lindas 🌙💖",
"Relájate, desconecta y deja que la noche cuide de ti 🌌✨",
"Que Morfeo te envuelva y te lleve a dulces sueños 💫🕊️",
"Buenas noches, descansa y recarga tu energía 🌙💤",
"Que la tranquilidad de la noche renueve tu espíritu 🌌💖",
"Descansa profundamente y despierta lleno de paz y alegría 🌅💫",
"Que cada respiración te acerque a la serenidad interior 🌌💤",
"Buenas noches, descansa y deja que todo fluya 🌙💖",
"Que la luna y las estrellas iluminen tu descanso esta noche 🌕✨",
"Relájate y deja que la calma te envuelva 🌌💤",
"Que Morfeo te lleve a un mundo de sueños bonitos y tranquilos 💫🕊️",
"Buenas noches, descansa y sueña con serenidad 🌙💖",
"Que la noche te traiga descanso profundo y dulces sueños 🌌💤",
"Buenas noches, descansa y deja que tu mente se serene 🌙💖",
"Relájate y siente la calma rodearte esta noche 🌌🕊️",
"Que la luna ilumine tu descanso y tus sueños 🌕💫",
"Que Morfeo cuide tu sueño y te lleve a un mundo tranquilo 💫😴",
"Descansa profundamente y despierta lleno de energía positiva 🌅✨",
"Que cada respiración te acerque a la paz interior 🌌💤",
"Buenas noches, sueña con cosas bonitas y reconfortantes 🌙💖",
"Que la calma de la noche abrace tu mente y corazón 🌌💫",
"Relájate y deja que la noche cuide de ti 🌙🛏️",
"Que los sueños suaves te acompañen hasta el amanecer 🌌💤",
"Buenas noches, descansa y recarga tu energía 🌙💖",
"Que la luna cuide tus pensamientos y te traiga serenidad 🌕💫",
"Descansa, respira y deja que tus preocupaciones se disuelvan 🌌💤",
"Que Morfeo te envuelva y te lleve a dulces sueños 💫🕊️",
"Relájate, desconecta y deja que la paz te acompañe 🌙✨",
"Que cada estrella ilumine tu descanso y te inspire ⭐💤",
"Buenas noches, descansa profundamente y sueña bonito 🌌💖",
"Que la noche transforme tus preocupaciones en calma 🌙💫",
"Descansa, relájate y deja que la serenidad te llene 🌌💤",
"Que la luna y las estrellas te arropen esta noche 🌕💖",
"Buenas noches, descansa y deja que tus pensamientos se calmen 🌙✨",
"Que Morfeo te lleve a un mundo de sueños tranquilos 💫🕊️",
"Relájate y deja que la calma te abrace esta noche 🌌💤",
"Que cada respiración te acerque a la paz interior 🌙💖",
"Descansa profundamente y despierta lleno de energía positiva 🌅✨",
"Buenas noches, sueña con cosas lindas y reconfortantes 🌌💫",
"Que la noche te envuelva con serenidad y tranquilidad 🌙💤",
"Relájate, respira y deja que la paz te rodee 🌌💖",
"Que Morfeo cuide tu sueño y te lleve a un descanso profundo 💫🕊️",
"Buenas noches, descansa y sueña bonito 🌙✨",
"Que la luna ilumine tus pensamientos y tu corazón 🌕💤",
"Descansa, desconecta y deja que la tranquilidad entre en ti 🌌💖",
"Que los sueños suaves te llenen de alegría y calma 🌙💫",
"Buenas noches, descansa y deja que tu mente se serene 🌌💤",
"Que la noche transforme tus preocupaciones en paz 🌙💖",
"Relájate y siente cómo la serenidad te envuelve 🌌✨",
"Que Morfeo te lleve a un mundo de dulces sueños y descanso 💫🕊️",
"Buenas noches, descansa profundamente y sueña bonito 🌙💤",
"Que cada estrella te recuerde que siempre hay luz ⭐💖",
"Descansa, respira y deja que la calma te abrace 🌌💫",
"Que la luna cuide tus sueños y te traiga serenidad 🌕💤",
"Buenas noches, descansa y sueña con cosas lindas 🌙💖",
"Relájate, desconecta y deja que la noche cuide de ti 🌌✨",
"Que Morfeo te envuelva y te lleve a dulces sueños 💫🕊️",
"Buenas noches, descansa y recarga tu energía 🌙💤",
"Que la tranquilidad de la noche renueve tu espíritu 🌌💖",
"Descansa profundamente y despierta lleno de paz y alegría 🌅💫",
"Que cada respiración te acerque a la serenidad interior 🌌💤",
"Buenas noches, descansa y deja que todo fluya 🌙💖",
"Que la luna y las estrellas iluminen tu descanso esta noche 🌕✨",
"Relájate y deja que la calma te envuelva 🌌💤",
"Que Morfeo te lleve a un mundo de sueños bonitos y tranquilos 💫🕊️",
"Buenas noches, descansa y sueña con serenidad 🌙💖",
"Que la noche te arrope con tranquilidad y dulzura 🌌✨",
"Descansa y deja que tus pensamientos se apacigüen 🌙💤",
"Que cada estrella ilumine tu corazón y tu descanso ⭐💖",
"Buenas noches, descansa profundamente y despierta feliz 🌙💫",
"Que la luna y los ángeles cuiden tus sueños 🌕🕊️",
"Relájate y deja que la serenidad te envuelva esta noche 🌌💤",
"Que Morfeo te lleve a dulces sueños y descanso pleno 💫💖",
"Buenas noches, descansa y sueña bonito 🌙✨",
"Que cada respiración te acerque a la calma interior 🌌💤",
"Descansa profundamente y deja que tu mente se serene 🌙💖",
"Que la noche transforme tus preocupaciones en tranquilidad 🌌✨",
"Buenas noches, descansa y siente cómo la serenidad te envuelve 🌙💫",
"Que Morfeo te lleve a un mundo de paz y dulces sueños 💫🕊️",
"Relájate, desconecta y deja que la calma entre en tu corazón 🌌💤",
"Que la luna ilumine tu descanso y te inspire 🌕💖",
"Buenas noches, descansa profundamente y sueña con tranquilidad 🌙✨"
];

// ======== FRASES DE BUENOS DÍAS ========
const frasesBuenosDias = [
  "¡Buenos días! Que tengas un día lleno de energía y alegría 🌞✨",
  "Hoy es un día perfecto para sonreír y disfrutar 😄🌸",
  "Que cada momento de hoy te llene de felicidad 🌈❤️",
  "Despierta con gratitud y entusiasmo por lo que viene 🙏⚡",
  "Cada amanecer es una nueva oportunidad para ser feliz 🌅💖",
  "Sonríe, incluso los pequeños logros cuentan 😄🌟",
  "Hoy puedes empezar algo que te apasione 💪🌸",
  "Que tu día esté lleno de momentos especiales 🌞✨",
  "Despierta con calma y determinación ❤️🌈",
  "Que la positividad te acompañe desde el amanecer 😄☀️",
  "Hoy es un buen día para aprender algo nuevo 📖🌸",
  "Cada día trae nuevas oportunidades: ¡aprovéchalas! 🌟❤️",
  "Sonríe, la vida siempre tiene algo bonito que ofrecer 😄💖",
  "Despierta con amor y gratitud ❤️✨",
  "Hoy puedes inspirar a alguien con tu sonrisa 🤗🌈",
  "Que la felicidad te acompañe en cada paso que des 🌞❤️",
  "Hoy es un día perfecto para cuidar de ti mismo 🌸💖",
  "Despierta con energía y motivación ⚡✨",
  "Que cada pensamiento positivo te acerque a tus sueños 🌟❤️",
  "Hoy puedes hacer algo maravilloso por alguien más 🌈💖",
  "Sonríe, tu actitud positiva ilumina a todos a tu alrededor 😄🌸",
  "Hoy es un buen día para ser agradecido 🙏❤️",
  "Despierta con ilusión y alegría 🌞✨",
  "Que tu corazón hoy esté lleno de paz ❤️💖",
  "Hoy puedes llenar tu día de momentos felices 🌸🌈",
  "Sonríe, cada amanecer trae nuevas oportunidades 😄❤️",
  "Hoy es un día para amar y ser amado ❤️✨",
  "Despierta con confianza y valentía 💪🌸",
  "Que la gratitud y el optimismo guíen tu día 🌞💖",
  "Hoy puedes hacer que cada instante cuente 🌈❤️",
  "Sonríe, incluso los desafíos traen aprendizaje 😄✨",
  "Hoy es un buen día para soñar y actuar 💭🌸",
  "Despierta con entusiasmo y corazón abierto ❤️💖",
  "Que la alegría te acompañe en todo lo que hagas 🌞🌈",
  "Hoy puedes dar un paso hacia tus metas más grandes 🚀✨",
  "Sonríe, la vida es mejor cuando aprecias cada momento 😄❤️",
  "Hoy es un día para crear recuerdos felices 🌸💖",
  "Despierta con motivación y energía ⚡🌞",
  "Que la felicidad te acompañe desde la mañana hasta la noche 🌈✨",
  "Hoy puedes aprender algo nuevo y valioso 📖❤️",
  "Sonríe, tu día puede ser tan brillante como tú 😄🌸",
  "Hoy es un buen día para comenzar algo nuevo 🌟💖",
  "Despierta con gratitud y esperanza 🙏✨",
  "Que tu día esté lleno de pequeñas y grandes alegrías 🌞❤️",
  "Hoy puedes hacer del mundo un lugar mejor con tu actitud 🌈💖",
  "Sonríe, cada momento tiene su propio encanto 😄🌸",
  "Hoy es un día para disfrutar y aprender 🌟❤️",
  "Despierta con alegría y motivación 🌞✨",
  "Que cada paso que des hoy te acerque a tus metas 🚶‍♀️💖",
  "Hoy puedes hacer algo que te haga sonreír 😊🌸",
  "Sonríe, tu energía positiva puede cambiar el mundo 😄❤️",
  "Hoy es un buen día para soñar y empezar a actuar 🌈💖",
  "Despierta con entusiasmo y corazón abierto ❤️✨",
  "Que la gratitud y el amor guíen tus acciones hoy ❤️🌸",
  "Hoy puedes aprender y crecer en cada momento 📖💖",
  "Sonríe, cada día trae nuevas oportunidades 😄🌈",
  "Hoy es un día perfecto para cuidar de ti y de los demás 🌞❤️",
  "Despierta con ilusión y confianza 💪✨",
  "Que la felicidad y la paz te acompañen en todo lo que hagas 🌸💖",
  "Hoy puedes inspirar y motivar a alguien con tu sonrisa 😄🌈",
  "Sonríe, la vida siempre tiene algo bello que ofrecer ❤️✨",
  "Hoy es un buen día para agradecer lo que tienes 🙏🌸",
  "Despierta con energía y gratitud 🌞💖",
  "Que cada pensamiento positivo te acerque a tus sueños 🌈❤️",
  "Hoy puedes llenar tu día de momentos felices 🌸✨",
  "Sonríe, cada amanecer trae nuevas oportunidades 😄💖",
  "Hoy es un día para ser feliz y hacer felices a otros 🌞❤️",
  "Despierta con confianza y motivación 💪🌈",
  "Que la alegría y el amor guíen tu día ❤️✨",
  "Hoy puedes empezar algo increíble 🚀🌸",
  "Sonríe, incluso los pequeños logros son importantes 😄💖",
  "Hoy es un buen día para soñar y actuar 🌈❤️",
  "Despierta con entusiasmo y gratitud 🌞✨",
  "Que tu día esté lleno de momentos especiales 🌸💖",
  "Hoy puedes hacer del mundo un lugar mejor con tu actitud 🌈❤️",
  "Sonríe, tu energía positiva puede cambiar todo 😄✨",
  "Hoy es un día perfecto para aprender y crecer 📖💖",
  "Despierta con alegría y corazón abierto 🌞❤️",
  "Que cada paso que des hoy te acerque a tus metas 🌈✨",
  "Hoy puedes inspirar y motivar a alguien con tu sonrisa 😄💖",
  "Sonríe, la vida es mejor cuando aprecias cada momento 🌸❤️",
  "Hoy es un buen día para agradecer y disfrutar 🙏✨",
  "Despierta con entusiasmo y energía 🌞💖",
  "Que la felicidad y la paz te acompañen en todo lo que hagas 🌈❤️",
  "Hoy puedes llenar tu día de pequeñas y grandes alegrías 🌸✨",
  "Sonríe, cada amanecer trae nuevas oportunidades 😄💖",
  "Hoy es un día para ser feliz y compartir alegría 🌞❤️",
  "Despierta con motivación y gratitud 💪✨",
  "Que la positividad y el amor guíen tus acciones 🌸💖",
  "Hoy puedes empezar algo nuevo y emocionante 🌈❤️",
  "Sonríe, tu día puede ser tan brillante como tú 😄✨",
  "Hoy es un buen día para cuidar de ti mismo y de los demás 🌞💖",
  "Despierta con ilusión y confianza 🌸❤️",
  "Que la alegría y la gratitud llenen tu día 🌈✨",
  "Hoy puedes aprender, crecer y disfrutar 📖💖",
  "Sonríe, la vida siempre tiene algo bonito que ofrecer 😄🌸",
  "Hoy es un día perfecto para compartir amor y felicidad ❤️❤️",
  "Despierta con energía, entusiasmo y gratitud 🌞✨",
  "Que cada instante de hoy te acerque a tus sueños 🌈💖",
  "Hoy puedes hacer algo maravilloso por ti o por alguien más 🌸❤️",
  "Sonríe, cada momento tiene su propio encanto 😄✨",
  "Hoy es un día para disfrutar, aprender y crecer 🌞💖",
  "Despierta con alegría y motivación 🌸❤️",
  "Que la paz y la felicidad guíen tu día 🌈✨",
  "Hoy puedes empezar algo nuevo y emocionante 🚀💖",
  "Sonríe, cada amanecer trae nuevas oportunidades 😄🌸",
  "Hoy es un buen día para agradecer, amar y soñar 🙏❤️",
  "Despierta con confianza y entusiasmo 🌞✨",
  "Que la gratitud y la positividad llenen tu día 🌈💖",
  "Hoy puedes hacer que cada instante cuente 🌸❤️",
  "Sonríe, tu energía positiva puede iluminar todo a tu alrededor 😄✨",
  "Hoy es un día perfecto para cuidar de ti mismo y de los demás 🌞💖",
  "Despierta con ilusión, gratitud y motivación 🌸❤️",
  "Que la felicidad y el amor guíen tu día 🌈✨",
  "Hoy puedes aprender algo nuevo y valioso 📖💖",
  "Sonríe, cada amanecer trae nuevas oportunidades 😄🌸",
  "Hoy es un día para ser feliz y compartir alegría 🌞❤️",
  "Despierta con entusiasmo y corazón abierto 💪✨",
  "Que la alegría, la gratitud y la positividad llenen tu día 🌸💖",
  "Hoy puedes empezar algo increíble y motivador 🌈❤️",
  "Sonríe, incluso los pequeños logros son importantes 😄✨",
  "Hoy es un buen día para soñar, aprender y actuar 🌞💖",
  "Despierta con gratitud, amor y motivación 🌸❤️",
  "Que cada instante de hoy te acerque a tus metas 🌈✨",
  "Hoy puedes inspirar y motivar a alguien con tu sonrisa 😄💖",
  "Sonríe, la vida siempre tiene algo bonito que ofrecer 🌸❤️",
  "Hoy es un día perfecto para agradecer y disfrutar 🙏✨",
  "Despierta con entusiasmo y energía 🌞💖",
  "Que la felicidad y la paz te acompañen en todo lo que hagas 🌈❤️",
  "Hoy puedes llenar tu día de pequeñas y grandes alegrías 🌸✨",
  "Sonríe, cada amanecer trae nuevas oportunidades 😄💖",
  "Hoy es un día para ser feliz y compartir alegría 🌞❤️",
  "Despierta con motivación y gratitud 💪✨",
  "Que la positividad y el amor guíen tus acciones 🌸💖",
  "Hoy puedes empezar algo nuevo y emocionante 🌈❤️",
  "Sonríe, tu día puede ser tan brillante como tú 😄✨",
  "Hoy es un buen día para cuidar de ti mismo y de los demás 🌞💖",
  "Despierta con ilusión y confianza 🌸❤️",
  "Que la alegría y la gratitud llenen tu día 🌈✨",
  "Hoy puedes aprender, crecer y disfrutar 📖💖",
  "Sonríe, la vida siempre tiene algo bonito que ofrecer 😄🌸",
  "Hoy es un día perfecto para compartir amor y felicidad ❤️❤️",
  "Despierta con energía, entusiasmo y gratitud 🌞✨",
  "Que cada instante de hoy te acerque a tus sueños 🌈💖"
];

// ======== CANCIONES PARA BUENOS DÍAS ========
const cancionesBuenosDias = [
  // ==== Disney ====
  "https://www.youtube.com/watch?v=wEXavSbny6w", // Hakuna Matata – El Rey León
  "https://youtu.be/BJVToi8A3v8", // Un mundo ideal – Aladdín
  "https://youtu.be/R-AfdmiuAT0", // Suéltalo (Let It Go) – Frozen
  "https://youtu.be/LYdG2w8jbws", // Bajo el mar – La Sirenita
  "https://www.youtube.com/watch?v=5k8NySrpplY", // Colores en el viento – Pocahontas
  "https://www.youtube.com/watch?v=sG__fKxyaaM&list=RDsG__fKxyaaM&start_radio=1", // En mi corazón vivirás – Tarzán (Phil Collins)
  "https://youtu.be/ekQ__vJxOFQ", // No hablaré de mi amor – Hércules
  "https://www.youtube.com/watch?v=CBHR9HN3Gk8", // ¡Qué festín! – La Bella y la Bestia
  "https://www.youtube.com/watch?v=knCXRXuOOko&list=RDknCXRXuOOko&start_radio=1", // Recuérdame – Coco
  "https://www.youtube.com/watch?v=DGp1TxwMdtY&t", // Hay un amigo en mí – Toy Story
  "https://www.youtube.com/watch?v=WpxbgphcTxw", // Let It Go (versión original) – Idina Menzel
  "https://www.youtube.com/watch?v=OaB43Q8my_M&list=RDOaB43Q8my_M&start_radio=1", // Circle of Life – The Lion King
  "https://www.youtube.com/watch?v=RbRzHhmVR64&list=RDRbRzHhmVR64&start_radio=1", // Try Everything – Shakira (Zootrópolis)
  "https://www.youtube.com/watch?v=6G8jm95rlIg&list=RD6G8jm95rlIg&start_radio=1", // How Far I'll Go – Vaiana
  "https://www.youtube.com/watch?v=cPn9tCoWD40&list=RDcPn9tCoWD40&start_radio=1", // Into the Unknown – Frozen 2
  "https://www.youtube.com/watch?v=yMyJKJAyakM&list=RDyMyJKJAyakM&start_radio=1", // Life is a Highway – Cars
  "https://www.youtube.com/watch?v=eznXJEjvHbk&list=RDeznXJEjvHbk&start_radio=1", // When You Wish Upon a Star – Pinocho
  "https://www.youtube.com/watch?v=JmP89cIGJZM&list=RDJmP89cIGJZM&start_radio=1", // You'll Be in My Heart – Tarzán
  "https://www.youtube.com/watch?v=A9UdCLGvjXg&list=RDA9UdCLGvjXg&start_radio=1", // Go the Distance – Hércules
  "https://www.youtube.com/watch?v=s0VcRAfXzLY&list=RDs0VcRAfXzLY&start_radio=1", // Let It Grow – Lorax
  "https://www.youtube.com/watch?v=hvaqFn5dvhU&list=RDhvaqFn5dvhU&start_radio=1", // Happy – Pharrell Williams (Mi villano favorito 2)
  "https://www.youtube.com/watch?v=dvgZkm1xWPE&list=RDdvgZkm1xWPE&start_radio=1", // Viva la Vida – Coldplay

  // ==== Marta Santos ====
  "https://www.youtube.com/watch?v=E3DssUsnWEU", // Marta Santos – Algo sencillito
  "https://www.youtube.com/watch?v=p3TzVLKY1RU&list=RDp3TzVLKY1RU&start_radio=1", // Marta Santos – Contigo
  "https://www.youtube.com/watch?v=snynIT2nV5c", // Marta Santos – Me sabe a sal
  "https://www.youtube.com/watch?v=qaYA35z0r1s&list=RDqaYA35z0r1s&start_radio=1", // Marta Santos – Las cosas más pequeñitas
  "https://www.youtube.com/watch?v=9ZMLSI-wFSE&list=RD9ZMLSI-wFSE&start_radio=1", // Marta Santos – Poquito a poquito
  "https://www.youtube.com/watch?v=iBhE1xMcmp0&list=RDiBhE1xMcmp0&start_radio=1", // Marta Santos – La bachata
  "https://youtu.be/C9MIMACSXV0?si=Ej-4pT_FIq3NCZDw", //Marta Santos - Por ti

  // ==== 50 canciones para subir el ánimo ====
  "https://www.youtube.com/watch?v=lcxLo7SbaJ8&list=RDlcxLo7SbaJ8&start_radio=1", //Dvicio - Paraiso
  "https://www.youtube.com/watch?v=lIe4VHXpftg&list=RDlIe4VHXpftg&start_radio=1", // Juan Magan - Te voy a esperar
  "https://www.youtube.com/watch?v=TENBteyH4uk&list=RDTENBteyH4uk&start_radio=1", // Shakira - Addicted to you
  "https://www.youtube.com/watch?v=czWcyZRAMtk&list=RDczWcyZRAMtk&start_radio=1", // Shakira - Waka waka
  "https://www.youtube.com/watch?v=PO2Fm4-WRjo&list=RDPO2Fm4-WRjo&start_radio=1", // K'NAAN - Wavin' Flag | World Cup Song
  "https://www.youtube.com/watch?v=4gEDBoUfPZg&list=PL9XoSLEkeG4j6IB4bTWhn-w53tw_FX0ZG&index=4", // Shakira - Inevitable
  "https://www.youtube.com/watch?v=rSJ-NZGeBd0&list=PL9XoSLEkeG4j6IB4bTWhn-w53tw_FX0ZG&index=35", // Shakira - Las de la intuición
  "https://www.youtube.com/watch?v=P0tTIQQZOVY&list=PL9XoSLEkeG4j6IB4bTWhn-w53tw_FX0ZG&index=36", // Shakira - Soltera
  "https://www.youtube.com/watch?v=sr7r_ABlkYY&start_radio=1", // Joven para siempre - Funzo
  "https://www.youtube.com/watch?v=tobDx2Jc5cQ&start_radio=1", // Inmortales - Funzo
  "https://www.youtube.com/watch?v=5aEApVK5i_g&start_radio=1", // Jovenes no tan locos - Funzo
  "https://www.youtube.com/watch?v=T8gzgj6W7UA&start_radio=1", // Tu calorro - Estopa
  "https://www.youtube.com/watch?v=3TeQH_SH3lA&list=RD3TeQH_SH3lA&start_radio=1", // Paseo - Estopa
  "https://www.youtube.com/watch?v=BxA_Qq-PvwI&list=PL6mpyAioMZGg2uQeRAJlDQEHqiI5pdT4c&index=3", // Vacaciones - Estopa
  "https://www.youtube.com/watch?v=a8Rwz6zBJSE&list=RDa8Rwz6zBJSE&start_radio=1", // Shakira - (Whenever, Wherever)
  "https://www.youtube.com/watch?v=g3bX--H6Rms",
  "https://www.youtube.com/watch?v=JDglMK9sgIQ&list=RDJDglMK9sgIQ&start_radio=1", // Avicii
  "https://www.youtube.com/watch?v=JRfuAukYTKg&list=RDJRfuAukYTKg&start_radio=1", //David - Titanium
  "https://www.youtube.com/watch?v=HABmPz2mmNw&list=RDHABmPz2mmNw&start_radio=1", // La la you - No se te puede dejar nada
  "https://www.youtube.com/watch?v=6cF6b6pLijE&list=RD6cF6b6pLijE&start_radio=1", // El fin del mundo
  "https://www.youtube.com/watch?v=_KSyWS8UgA4", // Yo te esperaré
  "https://www.youtube.com/watch?v=7XPmRUp_Yf4&list=RD7XPmRUp_Yf4&start_radio=1", // Melendi - La Promesa
  "https://www.youtube.com/watch?v=uZQvJ3jnc3U&list=RDGMEMQ1dJ7wXfLlqCjwV0xfSNbA&index=5", // Luis cortés - Al alba
  "https://www.youtube.com/watch?v=DGp1TxwMdtY&list=RDDGp1TxwMdtY&start_radio=1",// Barre las penas
  "https://www.youtube.com/watch?v=OaB43Q8my_M&list=RDOaB43Q8my_M&start_radio=1", // Entre tu y yo
  "https://www.youtube.com/watch?v=G_n3NnM6lW0&start_radio=1", // La jungla de alquitrán
  "https://www.youtube.com/watch?v=ciBfeQ6mQIg&list=PLY0tli1PxV_oedbXOlfaZa5Xc27wFyH6j&index=21", // La cueva
  "https://www.youtube.com/watch?v=WpxbgphcTxw&list=RDWpxbgphcTxw&start_radio=1", //Nuestro techo de cristal
  "https://www.youtube.com/watch?v=yMyJKJAyakM&list=RDEMwdk4ZqpIlPcgKuNa62WACA&start_radio=1", // A la luz de San Lorenzo
  "https://www.youtube.com/watch?v=RbRzHhmVR64&list=RDEMwdk4ZqpIlPcgKuNa62WACA&index=2", // El aire de la calle
  "https://www.youtube.com/watch?v=MfILTRB6h4I&list=RDEMwdk4ZqpIlPcgKuNa62WACA&index=4", // La primavera trompetera
  "https://www.youtube.com/watch?v=fQkLgTxkrS0&list=RDEMIEKPHxWxjqis2cpiDgCbVA&start_radio=1", // Hens - %
  "https://www.youtube.com/watch?v=X1w5L0Q1qxs&list=RDEMIEKPHxWxjqis2cpiDgCbVA&index=3", // Hens - Dos días al mes
  "https://www.youtube.com/watch?v=ER70ml5RE5M&list=RDEMIEKPHxWxjqis2cpiDgCbVA&index=4", // Hens - Me encanta
  "https://www.youtube.com/watch?v=4h0BSep-4xs&list=RD4h0BSep-4xs&start_radio=1", // Melendi -  Tu jardin con enanitos
  "https://www.youtube.com/watch?v=N0JPebMqAZM", // Javi Medina - Me la llevo
  "https://www.youtube.com/watch?v=YbADVar8tjY&list=RDYbADVar8tjY&start_radio=1", // Melendi - Lágrimas desordenadas
  "https://www.youtube.com/watch?v=hvaqFn5dvhU&list=RDhvaqFn5dvhU&start_radio=1", // Cuando me siento bien
  "https://www.youtube.com/watch?v=bODnuacGIqU&list=RDbODnuacGIqU&start_radio=1", // Nubes de pegatina
  "https://www.youtube.com/watch?v=a5fgQC4CrTo&list=RDa5fgQC4CrTo&start_radio=1", // Astola - Ermitaño
  "https://www.youtube.com/watch?v=0PvOcVfRU84&list=RD0PvOcVfRU84&index=2", // Cojo el saco y me retiro
  "https://www.youtube.com/watch?v=NFSyl3pwa-A", // La pegatina - Mari carmen
  "https://www.youtube.com/watch?v=Lvj7U8FkgCM&list=RDLvj7U8FkgCM&start_radio=1", // Una boda en las vegas
  "https://www.youtube.com/watch?v=s0VcRAfXzLY&list=RDs0VcRAfXzLY&start_radio=1", // Para que el mundo lo vea
  "https://www.youtube.com/watch?v=MfuilZ3GVog&list=RDMfuilZ3GVog&start_radio=1", // Hola buenos días
  "https://www.youtube.com/watch?v=1dQ7yL0mTxQ", // Funzo & Baby Loud – Malibú con Piña
  "https://www.youtube.com/watch?v=ZbZSe6N_BXs", // Pharrell Williams – Happy
  "https://www.youtube.com/watch?v=gmj8HX0OmXc", // Efecto Pasillo – Pan y mantequilla
  "https://www.youtube.com/watch?v=U2N5V_Tz9mA", // Melendi – Destino o casualidad
  "https://www.youtube.com/watch?v=CevxZvSJLk8", // Katy Perry – Roar
  "https://www.youtube.com/watch?v=09R8_2nJtjg", // Maroon 5 – Sugar
  "https://www.youtube.com/watch?v=VbfpW0pbvaU", // OneRepublic – Counting Stars
  "https://www.youtube.com/watch?v=2Vv-BfVoq4g", // Ed Sheeran – Perfect
  "https://www.youtube.com/watch?v=6Ejga4kJUts", // The Cranberries – Zombie
  "https://www.youtube.com/watch?v=3GwjfUFyY6M", // Kool & The Gang – Celebration
  "https://www.youtube.com/watch?v=fLexgOxsZu0", // Bruno Mars – The Lazy Song
  "https://www.youtube.com/watch?v=lWA2pjMjpBs", // Rihanna – Diamonds
  "https://www.youtube.com/watch?v=uelHwf8o7_U", // Eminem ft. Rihanna – Love the Way You Lie
  "https://www.youtube.com/watch?v=PWgvGjAhvIw", // Justin Timberlake – Can't Stop the Feeling
  "https://www.youtube.com/watch?v=RgKAFK5djSk", // Wiz Khalifa ft. Charlie Puth – See You Again
  "https://www.youtube.com/watch?v=2vjPBrBU-TM", // Sia – Chandelier
  "https://www.youtube.com/watch?v=2X_2IdybTV0", // Avicii – The Nights
  "https://www.youtube.com/watch?v=l7Fd8-2llQI", // Depol – Quiero decirte
  "https://www.youtube.com/watch?v=4J6c2j71B84", // Duende Callejero – Todo lo que tengo
  "https://www.youtube.com/watch?v=oRdxUFDoQe0", // Michael Jackson – Beat It
  "https://www.youtube.com/watch?v=OPf0YbXqDm0", // Mark Ronson ft. Bruno Mars – Uptown Funk
  "https://www.youtube.com/watch?v=YQHsXMglC9A", // Adele – Hello
  "https://www.youtube.com/watch?v=hT_nvWreIhg", // OneRepublic – Apologize
  "https://www.youtube.com/watch?v=fRh_vgS2dFE", // Justin Bieber – Sorry
  "https://www.youtube.com/watch?v=NT0oM3b8xvQ", // Imagine Dragons – On Top of the World
  "https://www.youtube.com/watch?v=60ItHLz5WEA", // Alan Walker – Faded
  "https://www.youtube.com/watch?v=09t5T6JjUeE" // El Canto del Loco – Volver a disfrutar
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

bot.onText(/\/frase/, (msg) => {
  const frase = generarFrase(frasesMotivadoras);
  bot.sendMessage(msg.chat.id, frase);
  console.log('Frase enviada con /frase:', frase);
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
cron.schedule('58 12 * * *', () => {
  const mensaje = generarFrase(frasesBuenasNoches);
  bot.sendMessage(chatId, mensaje + "\nDescansa 😴❤️");
}, { timezone: "Europe/Dublin" });

// Curiosidad diaria 12:00
cron.schedule('28 13 * * *', async () => {
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
  const mensaje = generarFrase(frasesBuenasNoches);
  bot.sendMessage(chatId, mensaje + "\nDescansa 😴❤️");
}, { timezone: "Europe/Dublin" });

console.log("🚀 Bot avanzado con curiosidades, traducción y cron jobs en marcha...");




