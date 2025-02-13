require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
    console.error("❌ TOKEN mavjud emas! .env faylni tekshiring.");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
    bot.sendMessage(msg.chat.id, "✅ Bot ishlayapti! 🚀");
});

console.log("✅ Bot ishga tushdi...");
