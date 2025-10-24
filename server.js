// server.js
import express from 'express';
import bot from './forwarder.js';

const app = express();
app.use(express.json());

// Render предоставит PORT
const PORT = process.env.PORT || 10000;

// Путь вебхука — просто токен (не палим в логах)
const WEBHOOK_PATH = `/${process.env.BOT_TOKEN}`;
const BASE_URL = process.env.BASE_URL; // https://your-service.onrender.com

if (!BASE_URL) {
  console.warn('BASE_URL is not set yet. You must set it after first deploy and redeploy.');
}

// Вешаем обработчик вебхука
app.use(WEBHOOK_PATH, bot.webhookCallback(WEBHOOK_PATH));

// Health-check (для UptimeRobot/проверок)
app.get('/health', (_req, res) => res.status(200).send('ok'));

// Стартуем HTTP и выставляем вебхук
app.listen(PORT, async () => {
  console.log(`Listening on ${PORT}`);
  if (BASE_URL) {
    try {
      await bot.telegram.setWebhook(`${BASE_URL}${WEBHOOK_PATH}`);
      console.log('Webhook set:', `${BASE_URL}${WEBHOOK_PATH}`);
    } catch (e) {
      console.error('Failed to set webhook:', e.message);
    }
  } else {
    console.log('Skip setWebhook: BASE_URL is empty. Set it in Render env and redeploy.');
  }
});
