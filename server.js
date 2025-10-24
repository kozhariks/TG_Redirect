// server.js
import express from 'express';
import bot from './forwarder.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const WEBHOOK_PATH = `/${process.env.BOT_TOKEN}`;
const BASE_URL = process.env.BASE_URL; // заполним после первого деплоя

app.use(WEBHOOK_PATH, bot.webhookCallback(WEBHOOK_PATH));
app.get('/health', (_req, res) => res.status(200).send('ok'));

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
    console.log('BASE_URL is empty. Set it in Render env and redeploy.');
  }
});
