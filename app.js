// VibeRun 语音记录功能
class VibeRun {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordings = [];
        this.currentRecording = null;
        this.recognition = null;
        this.recordingTimer = null;
        this.recordingStartTime = null;
        this.currentAudio = null;
        this.currentTranscript = ''; // 保存转录结果
        
        this.init();
    }

    init() {
        this.setupTabs();
        this.setupRecording();
        this.setupPlayer();
        this.loadRecordings();
        this.checkSpeechRecognition();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // 更新标签状态
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容显示
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    checkSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            
            // 获取当前语言设置
            const languageSelect = document.getElementById('language-select');
            this.recognition.lang = languageSelect ? languageSelect.value : 'zh-CN';

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    // 转换为简体字
                    const simplifiedTranscript = this.toSimplified(transcript);
                    
                    if (event.results[i].isFinal) {
                        finalTranscript += simplifiedTranscript;
                    } else {
                        interimTranscript += simplifiedTranscript;
                    }
                }

                const preview = document.getElementById('transcript-preview');
                if (finalTranscript) {
                    preview.textContent = finalTranscript;
                    this.currentTranscript = finalTranscript; // 保存最终转录结果
                } else {
                    preview.textContent = interimTranscript || '正在聆听...';
                }
            };

            this.recognition.onerror = (event) => {
                console.error('语音识别错误:', event.error);
            };
        } else {
            console.warn('浏览器不支持语音识别');
            document.getElementById('auto-transcribe').disabled = true;
        }
    }

    toSimplified(text) {
        // 简化的繁简转换映射
        const traditionalToSimplified = {
            '開': '开', '心': '心', '高': '高', '興': '兴', '快': '快', '樂': '乐',
            '棒': '棒', '好': '好', '喜': '喜', '歡': '欢', '可': '可', '愛': '爱',
            '舒': '舒', '服': '服', '美': '美', '好': '好', '成': '成', '就': '就',
            '突': '突', '破': '破', '功': '功', '完': '完', '成': '成', '做': '做',
            '到': '到', '厲': '厉', '害': '害', '堅': '坚', '持': '持', '勝': '胜',
            '利': '利', '放': '放', '松': '松', '輕': '轻', '松': '松', '愜': '惬',
            '意': '意', '享': '享', '受': '受', '平': '平', '靜': '静', '安': '安',
            '靜': '静', '專': '专', '注': '注', '累': '累', '疲': '疲', '憊': '惫',
            '辛': '辛', '苦': '苦', '困': '困', '難': '难', '吃': '吃', '力': '力',
            '加': '加', '油': '油', '激': '激', '動': '动', '刺': '刺', '爽': '爽',
            '太': '太', '棒': '棒', '了': '了', '哇': '哇', '驚': '惊', '喜': '喜',
            '發': '发', '現': '现', '新': '新', '第': '第', '一': '一', '次': '次',
            '沒': '没', '想': '想', '到': '到', '居': '居', '然': '然'
        };
        
        return text.replace(/[\u4e00-\u9fa5]/g, char => traditionalToSimplified[char] || char);
    }

    setupRecording() {
        const recordButton = document.getElementById('record-button');
        recordButton.addEventListener('click', () => this.toggleRecording());
    }

    async toggleRecording() {
        if (!this.isRecording) {
            await this.startRecording();
        } else {
            this.stopRecording();
        }
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.saveRecording();
            };

            this.mediaRecorder.start();
            this.isRecording = true;

            // 开始语音识别
            if (this.recognition && document.getElementById('auto-transcribe').checked) {
                try {
                    this.recognition.start();
                } catch (e) {
                    console.log('语音识别已在运行');
                }
            }

            // 更新UI
            this.updateRecordingUI(true);
            this.startRecordingTimer();

            // 播放提示音
            this.playBeep();

        } catch (error) {
            alert('无法访问麦克风，请检查权限设置');
            console.error('录音错误:', error);
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;

            // 停止语音识别
            if (this.recognition) {
                this.recognition.stop();
            }

            // 更新UI
            this.updateRecordingUI(false);
            this.stopRecordingTimer();
            
            // 播放结束提示音
            this.playDoubleBeep();
        }
    }

    playBeep() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    playDoubleBeep() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        for (let i = 0; i < 2; i++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            const startTime = audioContext.currentTime + i * 0.3;
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        }
    }

    updateRecordingUI(isRecording) {
        const recordButton = document.getElementById('record-button');
        const recordIcon = document.getElementById('record-icon');
        const recordText = document.getElementById('record-text');
        const buttonText = recordButton.querySelector('.record-button-text');

        if (isRecording) {
            recordButton.classList.add('recording');
            recordIcon.style.animation = 'pulse 1s infinite';
            recordText.textContent = '正在录音...';
            buttonText.textContent = '停止录音';
        } else {
            recordButton.classList.remove('recording');
            recordIcon.style.animation = 'none';
            recordText.textContent = '准备录音';
            buttonText.textContent = '开始录音';
            document.getElementById('transcript-preview').textContent = '点击开始录音，说出你的跑步感受...';
            document.getElementById('progress-fill').style.width = '0%';
            document.getElementById('recording-time').textContent = '00:00';
        }
    }

    startRecordingTimer() {
        this.recordingStartTime = Date.now();
        this.recordingTimer = setInterval(() => {
            const elapsed = Date.now() - this.recordingStartTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            const displaySeconds = seconds % 60;
            
            document.getElementById('recording-time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
            
            const progress = (seconds / 300) * 100; // 5分钟 = 300秒
            document.getElementById('progress-fill').style.width = `${Math.min(progress, 100)}%`;
            
            // 5分钟后自动停止
            if (seconds >= 300) {
                this.stopRecording();
            }
        }, 100);
    }

    stopRecordingTimer() {
        if (this.recordingTimer) {
            clearInterval(this.recordingTimer);
            this.recordingTimer = null;
        }
    }

    saveRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        // 使用保存的转录结果，如果没有则使用预览文本
        const transcript = this.currentTranscript || document.getElementById('transcript-preview').textContent;
        const duration = Math.floor((Date.now() - this.recordingStartTime) / 1000);
        
        // 模拟距离（实际应用中应该从GPS获取）
        const distance = (2.5 + Math.random() * 3).toFixed(1);
        
        // 情绪识别（简化版）
        const emotions = this.analyzeEmotions(transcript);
        
        const recording = {
            id: Date.now(),
            distance: parseFloat(distance),
            transcript: transcript,
            emotions: emotions,
            duration: duration,
            timestamp: new Date().toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            audioUrl: URL.createObjectURL(audioBlob)
        };
        
        // 重置当前转录结果
        this.currentTranscript = '';

        this.recordings.unshift(recording);
        this.saveToStorage();
        this.updateTimeline();
        this.updateRecordingCount();
        
        // 震动反馈（如果支持）
        if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }

    analyzeEmotions(text) {
        const emotionMap = {
            '开心': ['开心', '高兴', '快乐', '棒', '好', '喜欢', '可爱', '舒服', '美好'],
            '成就感': ['成就', '突破', '成功', '完成', '做到', '厉害', '坚持', '胜利'],
            '放松': ['放松', '轻松', '惬意', '享受', '平静', '安静', '专注'],
            '疲惫': ['累', '疲惫', '辛苦', '困难', '吃力', '坚持', '加油'],
            '兴奋': ['兴奋', '激动', '刺激', '爽', '太棒了', '哇', 'amazing'],
            '惊喜': ['惊喜', '发现', '新', '第一次', '没想到', '居然']
        };

        const emotions = [];
        for (const [emotion, keywords] of Object.entries(emotionMap)) {
            if (keywords.some(keyword => text.includes(keyword))) {
                emotions.push(`#${emotion}`);
            }
        }

        // 如果没有识别到情绪，添加默认情绪
        if (emotions.length === 0) {
            emotions.push('#记录');
        }

        return emotions.slice(0, 3); // 最多3个标签
    }

    updateTimeline() {
        const timeline = document.getElementById('timeline');
        timeline.innerHTML = '';

        if (this.recordings.length === 0) {
            timeline.innerHTML = `
                <div style="text-align: center; color: #999; padding: 40px;">
                    还没有录音记录<br>
                    开始跑步并录音吧！
                </div>
            `;
            return;
        }

        this.recordings.forEach(recording => {
            const item = document.createElement('div');
            item.className = 'recording-item';
            item.innerHTML = `
                <div class="recording-header">
                    <span class="recording-distance">🎙 ${recording.distance}km处</span>
                    <span class="recording-duration">${recording.timestamp} · ${recording.duration}秒</span>
                </div>
                <div class="recording-transcript">"${recording.transcript}"</div>
                <div class="recording-emotions">
                    ${recording.emotions.map(emotion => 
                        `<span class="emotion-tag">${emotion}</span>`
                    ).join('')}
                </div>
            `;
            
            item.addEventListener('click', () => this.openPlayer(recording));
            timeline.appendChild(item);
        });
    }

    updateRecordingCount() {
        document.getElementById('recording-count').textContent = this.recordings.length;
    }

    setupPlayer() {
        const modal = document.getElementById('player-modal');
        const closeBtn = document.getElementById('close-player');
        const playBtn = document.getElementById('play-btn');
        const speedSelect = document.getElementById('playback-speed');
        const progressContainer = document.querySelector('.player-progress');

        closeBtn.addEventListener('click', () => this.closePlayer());
        playBtn.addEventListener('click', () => this.togglePlayPause());
        speedSelect.addEventListener('change', (e) => this.changeSpeed(e.target.value));
        progressContainer.addEventListener('click', (e) => this.seekTo(e));

        // 点击模态框外部关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closePlayer();
            }
        });
    }

    openPlayer(recording) {
        this.currentRecording = recording;
        const modal = document.getElementById('player-modal');
        
        document.getElementById('player-location').textContent = `${recording.distance}km处`;
        document.getElementById('player-transcript').textContent = recording.transcript;
        document.getElementById('player-emotions').innerHTML = recording.emotions.map(emotion => 
            `<span class="emotion-tag">${emotion}</span>`
        ).join('');
        
        document.getElementById('total-time').textContent = this.formatTime(recording.duration);
        document.getElementById('current-time').textContent = '0:00';
        document.getElementById('player-progress-fill').style.width = '0%';
        
        modal.style.display = 'block';
        
        // 创建音频对象
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        this.currentAudio = new Audio(recording.audioUrl);
        this.currentAudio.addEventListener('timeupdate', () => this.updateProgress());
        this.currentAudio.addEventListener('ended', () => this.onAudioEnded());
    }

    closePlayer() {
        const modal = document.getElementById('player-modal');
        modal.style.display = 'none';
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }

    togglePlayPause() {
        const playBtn = document.getElementById('play-btn');
        
        if (!this.currentAudio) return;
        
        if (this.currentAudio.paused) {
            this.currentAudio.play();
            playBtn.textContent = '❚❚';
        } else {
            this.currentAudio.pause();
            playBtn.textContent = '▶';
        }
    }

    changeSpeed(speed) {
        if (this.currentAudio) {
            this.currentAudio.playbackRate = parseFloat(speed);
        }
    }

    seekTo(event) {
        if (!this.currentAudio) return;
        
        const progressContainer = event.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const percentage = clickX / rect.width;
        
        this.currentAudio.currentTime = percentage * this.currentAudio.duration;
    }

    updateProgress() {
        if (!this.currentAudio) return;
        
        const currentTime = this.currentAudio.currentTime;
        const duration = this.currentAudio.duration;
        const percentage = (currentTime / duration) * 100;
        
        document.getElementById('player-progress-fill').style.width = `${percentage}%`;
        document.getElementById('current-time').textContent = this.formatTime(currentTime);
    }

    onAudioEnded() {
        const playBtn = document.getElementById('play-btn');
        playBtn.textContent = '▶';
        document.getElementById('player-progress-fill').style.width = '0%';
        document.getElementById('current-time').textContent = '0:00';
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    saveToStorage() {
        // 由于音频文件较大，只保存元数据
        const recordingsData = this.recordings.map(r => ({
            id: r.id,
            distance: r.distance,
            transcript: r.transcript,
            emotions: r.emotions,
            duration: r.duration,
            timestamp: r.timestamp
        }));
        
        localStorage.setItem('viberun_recordings', JSON.stringify(recordingsData));
    }

    loadRecordings() {
        const saved = localStorage.getItem('viberun_recordings');
        if (saved) {
            this.recordings = JSON.parse(saved);
            this.updateTimeline();
            this.updateRecordingCount();
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new VibeRun();
});

// 键盘快捷键支持
document.addEventListener('keydown', (e) => {
    // 空格键开始/停止录音
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        const recordButton = document.getElementById('record-button');
        if (recordButton) {
            recordButton.click();
        }
    }
});
