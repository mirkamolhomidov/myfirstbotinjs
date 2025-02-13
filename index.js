require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

const app = express();
app.use(express.json());

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token);

const WEBHOOK_URL = "https://myfirstbotinjs-production.up.railway.app/";

bot.setWebHook(`${WEBHOOK_URL}/bot${token}`);

app.post(`/bot${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

console.log("✅ Bot webhook orqali ishlayapti...");
app.listen(3000, () => {
    console.log("🚀 Server 3000-portda ishga tushdi");
});
