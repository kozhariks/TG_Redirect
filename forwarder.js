// forwarder.js
import { Telegraf } from 'telegraf';

// ENV
const BOT_TOKEN = process.env.BOT_TOKEN;                         // токен бота-пересыльщика
const BUSINESS_CHAT_ID = Number(process.env.BUSINESS_CHAT_ID);   // id чата Бизнес-аккаунта (твоего пользователя)
const SOURCE_SENDER_ID = Number(process.env.SOURCE_SENDER_ID);   // id отправителя (бот-источник заявок)
const DEST_CHAT_ID = Number(process.env.DEST_CHAT_ID);           // id группы админов (куда копируем)

if (!BOT_TOKEN) throw new Error("BOT_TOKEN is required");
if (!BUSINESS_CHAT_ID) throw new Error("BUSINESS_CHAT_ID is required");
if (!SOURCE_SENDER_ID) throw new Error("SOURCE_SENDER_ID is required");
if (!DEST_CHAT_ID) throw new Error("DEST_CHAT_ID is required");

const bot = new Telegraf(BOT_TOKEN);

// два паттерна
const reOrder  = /^\s*✅\s*Подтвержд[ёе]н новый заказ\s*🛍/i;
const reRecord = /^\s*У вас новая запись!✏️/i;

function matches(text) {
  if (!text) return false;
  return reOrder.test(text) || reRecord.test(text);
}

// утилита: команда /id — вернуть текущий chat.id (поможет узнать id группы админов)
bot.command('id', async (ctx) => {
  await ctx.reply(`chat.id = ${ctx.chat?.id}\nfrom.id = ${ctx.from?.id}`);
});

bot.on('message', async (ctx) => {
  try {
    const msg = ctx.message;

    // слушаем только ЛС бизнес-аккаунта
    if (msg.chat?.id !== BUSINESS_CHAT_ID) return;

    // сообщения должны быть от бота-источника
    if (msg.from?.id !== SOURCE_SENDER_ID) return;

    const text = 'text' in msg ? msg.text : ('caption' in msg ? msg.caption : '');
    if (!matches(text)) return;

    // защита от петли (если DEST вдруг совпадёт)
    if (msg.chat.id === DEST_CHAT_ID) return;

    await ctx.telegram.copyMessage(DEST_CHAT_ID, msg.chat.id, msg.message_id);
  } catch (e) {
    console.error('Forward error:', e);
  }
});

export default bot;
