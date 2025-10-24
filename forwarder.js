// forwarder.js
import { Telegraf } from 'telegraf';

// ENV
const BOT_TOKEN     = process.env.BOT_TOKEN;           // токен бота-пересыльщика
const SOURCE_CHAT_ID = Number(process.env.SOURCE_CHAT_ID); // чат, где бот ловит заявки
const DEST_CHAT_ID   = Number(process.env.DEST_CHAT_ID);   // группа админов (куда копируем)

if (!BOT_TOKEN) throw new Error("BOT_TOKEN is required");
if (!SOURCE_CHAT_ID) throw new Error("SOURCE_CHAT_ID is required");
if (!DEST_CHAT_ID) throw new Error("DEST_CHAT_ID is required");

const bot = new Telegraf(BOT_TOKEN);

// регэкспы на два типа сообщений
const reOrder  = /^\s*✅\s*Подтвержд[ёе]н новый заказ\s*🛍/i;
const reRecord = /^\s*У вас новая запись!✏️/i;

// хелпер: проверка совпадений
function isTarget(text) {
  if (!text) return false;
  return reOrder.test(text) || reRecord.test(text);
}

bot.on('message', async (ctx) => {
  try {
    const msg = ctx.message;
    const chatId = msg.chat.id;

    // слушаем только «источник»
    if (chatId !== SOURCE_CHAT_ID) return;

    // текст или подпись к медиа
    const text =
      'text' in msg ? msg.text :
      ('caption' in msg ? msg.caption : '');

    if (!isTarget(text)) return;

    // защита от петель на всякий
    if (chatId === DEST_CHAT_ID) return;

    // копируем сообщение «как есть» (текст/медиа/форматирование)
    await ctx.telegram.copyMessage(DEST_CHAT_ID, chatId, msg.message_id);
  } catch (err) {
    console.error('Forward error:', err);
  }
});

// экспорт для server.js
export default bot;
