# VibeRun

VibeRun 是一个创新的跑步应用，专注于通过语音记录功能帮助跑者捕捉跑步过程中的想法和感受。

## 功能特性

- 🏃‍♂️ 跑步语音记录
- 🗣️ 实时语音转文字（集成OpenAI Whisper）
- 😊 情绪识别与标签
- 🗺️ 语音地图标记
- 🎧 音频回放与倍速控制
- 📊 跑步数据可视化

## 技术架构

- 前端：HTML5, CSS3, JavaScript (ES6+)
- 后端：Node.js + Express
- 语音识别：Web Speech API + OpenAI Whisper
- 音频处理：Web Audio API
- 数据存储：LocalStorage

## 安装与运行

1. 克隆项目：
   ```bash
   git clone https://github.com/zoetical/VibeRun.git
   cd VibeRun
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置OpenAI API密钥：
   - 方法一（推荐）：设置环境变量
     ```bash
     export OPENAI_API_KEY=your_actual_api_key_here
     ```
   - 方法二：在 `server.js` 文件中直接替换 `YOUR_OPENAI_API_KEY` 为您的实际API密钥

4. 启动服务器：
   ```bash
   node server.js
   ```

5. 打开 `index.html` 文件或通过服务器访问应用

## 使用说明

### 录音功能
1. 点击"开始录音"按钮或使用空格键开始录音
2. 说出您的跑步感受（最长5分钟）
3. 再次点击按钮或按空格键结束录音
4. 应用将自动进行语音转文字和情绪识别

### 语言设置
- 在"设置"页面可以选择识别语言
- 支持多种语言包括中文、英文等

### 时间轴查看
- 所有录音记录将显示在时间轴上
- 点击任意记录可播放音频和查看详情

## API 集成

### OpenAI Whisper
本应用集成了OpenAI的Whisper语音识别模型，以提供更准确的语音转文字功能。

## 开发计划

- [ ] GPS定位与跑步轨迹记录
- [ ] 月度回顾功能
- [ ] 快速分享功能
- [ ] 更智能的情绪识别
- [ ] 云端数据同步

## 贡献

欢迎提交Issue和Pull Request来帮助改进VibeRun。

## 许可证

[待定]
