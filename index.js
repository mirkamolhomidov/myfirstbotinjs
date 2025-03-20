import TelegramBot from 'node-telegram-bot-api';
import express from 'express';
import youtubedl from 'youtube-dl-exec';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import cron from 'node-cron';

const TOKEN = process.env.TELEGRAM_TOKEN;
const URL = process.env.BASE_URL;
const PORT = process.env.PORT || 3000;

const app = express();
const bot = new TelegramBot(TOKEN, { polling: false });

app.use(express.json());

app.post('/bot', (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

bot.setWebHook(`${URL}/bot`);

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        bot.sendMessage(chatId, "Salom! YouTube'dan video yoki mp3 yuklab olish uchun video havolasini yuboring.");
    } else if (isValidYouTubeUrl(text)) {
        const loadingMessage = await bot.sendMessage(chatId, "🔄 Yuklanmoqda, iltimos kuting...");
        try {
            const videoInfo = await youtubedl(text, { dumpSingleJson: true });
            const videoTitle = videoInfo.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20);
            const videoId = videoInfo.id;
            const formats = videoInfo.formats.filter(f => f.ext === 'mp4' && f.vcodec !== 'none');
            const audioFormats = videoInfo.formats.filter(f => f.ext === 'm4a' && f.acodec !== 'none');

            const inlineKeyboard = [];

            if (formats.length > 0) {
                inlineKeyboard.push([{ text: '🎥 Video yuklab olish', callback_data: `video_${videoId}` }]);
            }

            if (audioFormats.length > 0) {
                inlineKeyboard.push([{ text: '🎵 MP3 yuklab olish', callback_data: `mp3_${videoId}` }]);
            }

            await bot.sendMessage(chatId, `*${videoTitle}* faylini yuklab olish uchun variantni tanlang:`, {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: inlineKeyboard
                }
            });
        } catch (error) {
            console.error("Xatolik:", error);
            bot.sendMessage(chatId, "Xatolik yuz berdi: " + error.message);
        } finally {
            bot.deleteMessage(chatId, loadingMessage.message_id);
        }
    } else {
        bot.sendMessage(chatId, "Iltimos, to'g'ri YouTube video havolasini yuboring.");
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const videoId = data.split('_')[1];
    const action = data.split('_')[0];
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const loadingMessage = await bot.sendMessage(chatId, "🔄 Yuklanmoqda, iltimos kuting...");

    try {
        const videoInfo = await youtubedl(videoUrl, { dumpSingleJson: true });
        const videoTitle = videoInfo.title.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20);
        const tempDir = os.tmpdir();

        if (action === 'video') {
            const videoPath = path.join(tempDir, `${videoTitle}.mp4`);
            await youtubedl(videoUrl, {
                output: videoPath,
                format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
                cookies: './cookies.txt'
            });
            if (fs.existsSync(videoPath)) {
                const videoStream = fs.createReadStream(videoPath);
                await bot.sendVideo(chatId, videoStream, { title: videoTitle });
                fs.unlinkSync(videoPath);
            } else {
                await bot.sendMessage(chatId, "❌ Video yuklashda muammo yuz berdi.");
            }
        } else if (action === 'mp3') {
            const audioPath = path.join(tempDir, `${videoTitle}.mp3`);
            await youtubedl(videoUrl, {
                output: audioPath,
                extractAudio: true,
                audioFormat: 'mp3',
                cookies: './cookies.txt'
            });
            if (fs.existsSync(audioPath)) {
                const audioStream = fs.createReadStream(audioPath);
                await bot.sendAudio(chatId, audioStream, { title: videoTitle });
                fs.unlinkSync(audioPath);
            } else {
                await bot.sendMessage(chatId, "❌ MP3 yuklashda muammo yuz berdi.");
            }
        }
    } catch (error) {
        console.error("Yuklashda xatolik:", error);
        await bot.sendMessage(chatId, "Xatolik yuz berdi: " + error.message);
    } finally {
        bot.deleteMessage(chatId, loadingMessage.message_id);
    }
});

function isValidYouTubeUrl(url) {
    const regex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return regex.test(url);
}

// Vaqtinchalik fayllarni avtomatik tozalash
cron.schedule(
    '0 0 * * *',
    () => {
        const tempDir = os.tmpdir();
        fs.readdir(tempDir, (err, files) => {
            if (err) {
                console.error("Vaqtinchalik fayllarni o'qishda xatolik:", err);
                return;
            }
            files.forEach((file) => {
                const filePath = path.join(tempDir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        console.error("Fayl ma'lumotlarini olishda xatolik:", err);
                        return;
                    }
                    const now = Date.now();
                    const endTime = new Date(stats.mtime).getTime() + 24 * 60 * 60 * 1000;
                    if (now > endTime) {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("Faylni o'chirishda xatolik:", err);
                            else console.log(`Fayl o'chirildi: ${filePath}`);
                        });
                    }
                });
            });
        });
    },
    {
        scheduled: true,
        timezone: "Asia/Tashkent",
    }
);

app.listen(PORT, () => {
    console.log(`Server portda: ${PORT}`);
});
