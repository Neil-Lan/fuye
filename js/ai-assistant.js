/**
 * 副业避坑平台 - AI助手集成
 * 使用扣子 Chat SDK
 */

// AI助手配置
const AI_ASSISTANT_CONFIG = {
  botId: '7631841031897890842',
  title: '副业避坑助手',
  subtitle: '帮你避坑、找方向、做决策',
  icon: 'https://lf-coze-web-cdn.coze.cn/obj/coze-web-cn/obric/coze/favicon.1970.png',
};

// 加载扣子 Chat SDK
function loadCozeSDK() {
  if (window.CozeWebSDK) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // 使用带版本号的SDK URL（国内版）
    script.src = 'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.20/libs/cn/index.js';
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 初始化AI助手
async function initAIAssistant() {
  try {
    await loadCozeSDK();
    
    const cozeWebSDK = new CozeWebSDK.WebChatClient({
      config: {
        botId: AI_ASSISTANT_CONFIG.botId,
        isIframe: false,
      },
      userInfo: {
        id: 'user_' + Date.now(),
        nickname: '访客',
        url: AI_ASSISTANT_CONFIG.icon,
      },
      ui: {
        base: {
          icon: AI_ASSISTANT_CONFIG.icon,
          layout: 'pc',
          lang: 'zh-CN',
          zIndex: 9999,
        },
        asstBtn: {
          isNeed: true,
        },
        chatBot: {
          title: AI_ASSISTANT_CONFIG.title,
          width: 420,
          height: 600,
          uploadable: false,
        },
        footer: {
          isShow: true,
          expressionText: 'Powered by 副业发现',
        },
      },
    });
    
    // 保存实例供全局使用
    window.cozeWebSDK = cozeWebSDK;
    
    console.log('AI助手初始化成功');
  } catch (error) {
    console.error('AI助手初始化失败:', error);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAIAssistant);
} else {
  initAIAssistant();
}
