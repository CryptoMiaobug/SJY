// 当前激活的标签
let currentTab = 'knowledge';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
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
    
    // 添加用户消息
    addMessage(tab, 'user', question);
    userInput.value = '';
    
    // 禁用发送按钮
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<span class="loading"></span>';
    
    try {
        // 调用后端 API
        const response = await fetch(`${CONFIG.apiUrl}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: question,
                mode: tab  // 'knowledge' 或 'analysis'
            })
        });
        
        if (!response.ok) {
            throw new Error(`API 请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 添加 AI 回复
        addMessage(tab, 'bot', data.answer || '抱歉，我无法回答这个问题。');
        
    } catch (error) {
        console.error('发送失败:', error);
        addMessage(tab, 'bot', '⚠️ 抱歉，服务暂时不可用，请稍后重试。');
    } finally {
        sendBtn.disabled = false;
        sendBtn.textContent = '发送';
    }
}

// 添加消息到聊天区域
function addMessage(tab, role, content) {
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
    messagesContainer.appendChild(messageDiv);
    
    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
