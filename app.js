// 当前激活的标签
let currentTab = 'knowledge';

// 对话历史（每个标签独立）
let conversationHistory = {
    knowledge: [],
    analysis: []
};

// 最大保留轮数
const MAX_HISTORY_TURNS = 20;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // 退出登录按钮
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = 'login.html';
            }
        });
    }

    // 标签切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // 切换标签按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 切换内容区域
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            currentTab = tabName;
        });
    });
    
    // 制度知识库输入
    const knowledgeInput = document.getElementById('knowledge-input');
    const knowledgeSendBtn = document.getElementById('knowledge-send-btn');
    
    knowledgeSendBtn.addEventListener('click', () => sendMessage('knowledge'));
    knowledgeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage('knowledge');
    });
    
    // 财务智能分析输入
    const analysisInput = document.getElementById('analysis-input');
    const analysisSendBtn = document.getElementById('analysis-send-btn');
    
    analysisSendBtn.addEventListener('click', () => sendMessage('analysis'));
    analysisInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage('analysis');
    });
});

// 发送消息
async function sendMessage(tab) {
    const inputId = `${tab}-input`;
    const messagesId = `${tab}-messages`;
    const sendBtnId = `${tab}-send-btn`;
    
    const userInput = document.getElementById(inputId);
    const sendBtn = document.getElementById(sendBtnId);
    const question = userInput.value.trim();
    
    if (!question) return;
    
    // 获取 token
    const token = localStorage.getItem('token');
    if (!token) {
        addMessage(tab, 'bot', '⚠️ 请先登录');
        setTimeout(() => window.location.href = 'login.html', 1000);
        return;
    }
    
    // 添加用户消息
    addMessage(tab, 'user', question);
    userInput.value = '';
    
    // 添加"正在思考"状态
    const thinkingId = addThinkingMessage(tab);
    
    // 禁用发送按钮
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="loading"></span>';
    
    try {
        // 创建超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);
        
        // 调用后端 API
        const response = await fetch(`${CONFIG.apiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                question: question,
                mode: tab,  // 'knowledge' 或 'analysis'
                history: conversationHistory[tab]  // 发送历史记录
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        // 移除"正在思考"
        removeThinkingMessage(thinkingId);
        
        if (!response.ok) {
            if (response.status === 401) {
                addMessage(tab, 'bot', '⚠️ 登录已过期，请重新登录');
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        const answer = data.answer || '抱歉，我无法回答这个问题。';
        const downloadUrl = data.downloadUrl;
        
        console.log('[前端] 收到回复:', { answer: answer.substring(0, 50), downloadUrl });
        
        // 添加 AI 回复
        addMessage(tab, 'bot', answer, downloadUrl);
        
        // 保存到历史记录
        conversationHistory[tab].push(
            { role: 'user', content: question },
            { role: 'assistant', content: answer }
        );
        
        // 保留最近 MAX_HISTORY_TURNS 轮对话（每轮 = 1 问 + 1 答）
        if (conversationHistory[tab].length > MAX_HISTORY_TURNS * 2) {
            conversationHistory[tab] = conversationHistory[tab].slice(-MAX_HISTORY_TURNS * 2);
        }
        
    } catch (error) {
        console.error('发送失败:', error);
        // 移除"正在思考"
        removeThinkingMessage(thinkingId);
        
        let errorMsg = '⚠️ 抱歉，服务暂时不可用，请稍后重试。';
        if (error.name === 'AbortError') {
            errorMsg = '⚠️ 请求超时（90秒），请尝试简化问题或稍后重试。';
        } else if (error.message) {
            errorMsg = `⚠️ 错误：${error.message}`;
        }
        
        addMessage(tab, 'bot', errorMsg);
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '发送';
    }
}

// 添加"正在思考"消息
function addThinkingMessage(tab) {
    const messagesContainer = document.getElementById(`${tab}-messages`);
    
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot-message';
    thinkingDiv.id = `thinking-${Date.now()}`;
    
    thinkingDiv.innerHTML = `
        <div class="thinking-message">
            <span>正在思考</span>
            <div class="thinking-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(thinkingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return thinkingDiv.id;
}

// 移除"正在思考"消息
function removeThinkingMessage(thinkingId) {
    const thinkingDiv = document.getElementById(thinkingId);
    if (thinkingDiv) {
        thinkingDiv.remove();
    }
}

// 添加消息到聊天区域
function addMessage(tab, role, content, downloadUrl = null) {
    const messagesContainer = document.getElementById(`${tab}-messages`);
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (role === 'bot') {
        // 支持 Markdown 渲染（简化版）
        content = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }
    
    contentDiv.innerHTML = content;
    messageDiv.appendChild(contentDiv);
    
    // 如果有下载链接，添加下载按钮
    if (downloadUrl) {
        const downloadBtn = document.createElement('a');
        downloadBtn.href = `${CONFIG.apiUrl}${downloadUrl}`;
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '📥 下载文件';
        downloadBtn.download = '';
        downloadBtn.target = '_blank';
        messageDiv.appendChild(downloadBtn);
    }
    
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
