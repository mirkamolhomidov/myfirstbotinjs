const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const app = express();
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { webHook: { port: process.env.PORT } });

const webHookUrl = 'https://myfirstbotinjs.onrender.com/webhook';
bot.setWebHook(webHookUrl);

app.use(express.json());

app.post('/webhook', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

const gameOptions = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: "1", callback_data: "button value" },
                { text: "2", callback_data: "button value" },
                { text: "3", callback_data: "button value" },
                { text: "4", callback_data: "button value" }
            ],
            [
                { text: "5", callback_data: "button value" },
                { text: "6", callback_data: "button value" },
                { text: "7", callback_data: "button value" },
                { text: "8", callback_data: "button value" }
            ]
        ]
    }
}

bot.setMyCommands([
    { command: '/start', description: 'Botni yangilash♻️' },
    { command: '/info', description: 'Bot haqida to\'liqroq ma\'lumot olish 🗯️' }
]);

bot.on('message', async msg => {
    const text = msg.text;
    const chatId = msg.chat.id;

    if (text === "/start") {
        return bot.sendMessage(chatId, `Assalomun Alaykum ${msg.from?.first_name} sizni botimizda ko'rganimizdan xursandmiz!`);
    } else if (text === "/info") {
        return bot.sendMessage(chatId, 'Bu bot birinchi marta @homidovmirkamol tomonidan yaratildi!', gameOptions);
    } else {
        return bot.sendMessage(chatId, 'Noto\'g\'ri buyruq kiritildi!');
    }
});

app.listen(process.env.PORT, () => {
    console.log('Bot is running...');
});
