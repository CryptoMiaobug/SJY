// API 配置
const CONFIG = {
    // 本地测试时使用 localhost
    // 部署后改成 Cloudflare Tunnel 的 URL
    apiUrl: 'http://localhost:3000',
    
    // 请求超时时间（毫秒）
    timeout: 30000,
    
    // 最大重试次数
    maxRetries: 3
};
