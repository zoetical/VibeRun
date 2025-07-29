const express = require('express');
const multer = require('multer');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const app = express();
const port = 3000;

// 提供静态文件服务
app.use(express.static(path.join(__dirname)));

// 配置 Multer 用于文件上传
const upload = multer({ dest: 'uploads/' });

// 初始化 Azure OpenAI 客户端
const openai = new OpenAI({
    apiKey: config.openai.apiKey,
    baseURL: config.openai.baseURL,
    defaultQuery: { 'api-version': config.openai.apiVersion },
    defaultHeaders: { 'api-key': config.openai.apiKey },
});

// 添加一个简单的API密钥检查
if (!process.env.OPENAI_API_KEY && config.openai.apiKey === 'YOUR_OPENAI_API_KEY') {
    console.warn('警告: 未设置OpenAI API密钥，语音转文字功能可能无法正常工作');
}

// 允许 CORS，以便前端可以访问
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// 转录音频的 API 端点
app.post('/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('没有上传文件');
    }

    const audioFilePath = req.file.path;
    // 添加.webm扩展名
    const webmFilePath = audioFilePath + '.webm';

    try {
        // 重命名文件以确保正确的扩展名
        fs.renameSync(audioFilePath, webmFilePath);
        
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(webmFilePath),
            model: "whisper-1", // 使用 whisper-1 模型
            response_format: "json",
            language: req.body.language || "zh"
        });
        res.json({ transcript: transcription.text });
    } catch (error) {
        console.error('转录错误:', error);
        res.status(500).json({ error: '转录失败' });
    } finally {
        // 删除临时文件
        fs.unlink(webmFilePath, (err) => {
            if (err) console.error('删除临时文件失败:', err);
        });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});
