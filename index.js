const TelegramBot = require("node-telegram-bot-api")
const token = "7720557343:AAH8QpoNBFEHI-1fjHVuzs5j22wbpvPtQVo";
const bot = new TelegramBot(token, { polling: true });

const gameOptions = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "1", callback_data: "button value"
                },
                {
                    text: "2", callback_data: "button value"
                },
                {
                    text: "3", callback_data: "button value"
                },
                {
                    text: "4", callback_data: "button value"
                }
            ],
            [
                {
                    text: "5", callback_data: "button value"
                },
                {
                    text: "6", callback_data: "button value"
                },
                {
                    text: "7", callback_data: "button value"
                },
                {
                    text: "8", callback_data: "button value"
                }
            ]
        ]
    }
}

const mybotfunction = () => {
    bot.setMyCommands([
        {
            command: '/start',
            description: 'Botni yangilash♻️'
        },
        {
            command: '/info',
            description: 'Bot haqida to\'liqroq malumot olish 🗯️'
        }
    ])
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        if (text === "/start") {
            return bot.sendMessage(chatId, `Assalomun Alaykum ${msg.from?.first_name} sizni botimizda ko'rganimizdan xursandmiz !`);
        } else if (text === "/info") {
            // await bot.sendSticker(chatId, "https://tlgrm.eu/_/stickers/4dd/300/4dd300fd-0a89-3f3d-ac53-8ec93976495e/192/1.webp")
            return bot.sendMessage(chatId, 'Bu bot birinchi marta @homidovmirkamol tomonidan yaratildi !', gameOptions)
        } else {
            return bot.sendMessage(chatId, 'Noto\'g\'ri buyruq kiritildi !');
        }
    });
}

mybotfunction();