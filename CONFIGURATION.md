# VibeRun 配置说明

## OpenAI API 密钥配置

为了使用VibeRun的语音转文字功能，您需要配置OpenAI API密钥。以下是几种配置方法：

### 方法一：环境变量（推荐）

在启动应用之前，设置环境变量：

```bash
export OPENAI_API_KEY=your_actual_api_key_here
```

然后启动应用：
```bash
cd /Users/tomin/Documents/VibeRun
./start.sh
```

### 方法二：修改 server.js 文件

1. 打开 `server.js` 文件
2. 找到以下代码：
   ```javascript
   const openai = new OpenAI({
       apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY' // 建议使用环境变量
   });
   ```
3. 将 `'YOUR_OPENAI_API_KEY'` 替换为您的实际API密钥：
   ```javascript
   const openai = new OpenAI({
       apiKey: process.env.OPENAI_API_KEY || 'sk-your-actual-api-key-here' // 建议使用环境变量
   });
   ```

### 方法三：修改 start.sh 脚本

1. 打开 `start.sh` 文件
2. 找到注释部分：
   ```bash
   # export OPENAI_API_KEY=your_actual_api_key_here
   ```
3. 取消注释并修改为您的实际API密钥：
   ```bash
   export OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

## 获取OpenAI API密钥

1. 访问 [OpenAI官网](https://platform.openai.com/)
2. 登录或注册账户
3. 进入API密钥页面
4. 点击"Create new secret key"
5. 复制生成的密钥并妥善保管

## 语言设置

VibeRun支持多种语言的语音识别：

- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- 英语 (en-US)
- 法语 (fr-FR)

在应用的"设置"页面可以更改识别语言。

## 故障排除

### 语音转文字功能不工作

1. 检查API密钥是否正确配置
2. 确保网络连接正常
3. 检查控制台是否有错误信息

### 麦克风权限问题

1. 确保浏览器有麦克风访问权限
2. 检查系统设置中的麦克风权限
3. 重启浏览器后重试

### 音频质量问题

1. 在安静的环境中录音
2. 靠近麦克风说话
3. 避免背景噪音干扰
