require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

console.log("TOKEN:", process.env.TELEGRAM_BOT_TOKEN); // Tokenni tekshirish uchun

if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error("❌ TOKEN mavjud emas! .env ni tekshiring.");
    process.exit(1);
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", (msg) => {
    bot.sendMessage(msg.chat.id, "✅ Bot ishlayapti! 🚀");
});

console.log("✅ Bot ishga tushdi...");
