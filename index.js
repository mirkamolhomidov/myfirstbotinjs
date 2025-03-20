import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import dotenv from 'dotenv';
import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import ffmpegPath from 'ffmpeg-static';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { webHook: { port: 3000 } });
const app = express();

bot.setWebHook(`${process.env.BASE_URL}/bot${process.env.TELEGRAM_TOKEN}`);
app.use(express.json());

app.post(`/bot${process.env.TELEGRAM_TOKEN}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.onText(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/, async (msg) => {
    const chatId = msg.chat.id;
    const url = msg.text;

    const loadingMsg = await bot.sendMessage(chatId, '🎥 Video yuklanmoqda...');

    const output = `video-${Date.now()}.mp4`;

    try {
        await youtubedl(url, {
            output,
            format: 'best[ext=mp4]',
            ffmpegLocation: ffmpegPath,
        });

        await bot.sendVideo(chatId, output, {
            caption: '✅ Video yuklandi!',
        });

        fs.unlinkSync(output); // vaqtinchalik faylni o'chirish
        bot.deleteMessage(chatId, loadingMsg.message_id); // Yuklanmoqda xabarini o'chirish

    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, '❌ Video yuklab bo‘lmadi.');
    }
});

app.get('/', (req, res) => {
    res.send('Server ishlayapti...');
});

app.listen(10000, () => {
    console.log('Server portda: 10000');
});
