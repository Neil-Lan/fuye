/**
 * 新手引导弹窗功能
 */

const GUIDE_KEY = 'fuye_guide_shown';
const GUIDE_VERSION = '1.0';

function shouldShowGuide() {
  try {
    const shown = localStorage.getItem(GUIDE_KEY);
    if (!shown) return true;
    const data = JSON.parse(shown);
    return data.version !== GUIDE_VERSION;
  } catch {
    return true;
  }
}

function markGuideShown() {
  try {
    localStorage.setItem(GUIDE_KEY, JSON.stringify({
      version: GUIDE_VERSION,
      shownAt: new Date().toISOString()
    }));
  } catch (e) {
    console.error('保存引导状态失败:', e);
  }
}

function showGuideModal() {
  if (!shouldShowGuide()) return;
  
  const modal = document.createElement('div');
  modal.id = 'guide-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  `;
  
  modal.innerHTML = `
    <div style="background: white; border-radius: 16px; max-width: 400px; width: 100%; overflow: hidden; animation: slideUp 0.3s ease;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 24px; text-align: center; color: white;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🎯</div>
        <h2 style="margin: 0 0 8px; font-size: 1.5rem;">欢迎来到副业发现</h2>
        <p style="margin: 0; opacity: 0.9; font-size: 0.95rem;">找到靠谱副业，远离诈骗陷阱</p>
      </div>
      <div style="padding: 24px;">
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🎯</div>
            <div>
              <h4 style="margin: 0 0 2px; font-size: 0.95rem;">智能匹配</h4>
              <p style="margin: 0; font-size: 0.85rem; color: #64748b;">3分钟测试，找到最适合你的副业</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: #fef2f2; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">🛡️</div>
            <div>
              <h4 style="margin: 0 0 2px; font-size: 0.95rem;">防骗预警</h4>
              <p style="margin: 0; font-size: 0.85rem; color: #64748b;">识别49种常见骗局套路</p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 40px; height: 40px; background: #f0fdf4; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">📊</div>
            <div>
              <h4 style="margin: 0 0 2px; font-size: 0.95rem;">真实数据</h4>
              <p style="margin: 0; font-size: 0.85rem; color: #64748b;">用户实测收入，告别虚假宣传</p>
            </div>
          </div>
        </div>
        <a href="match.html" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; display: block; text-align: center; text-decoration: none;">
          🎯 开始免费测试
        </a>
        <button onclick="closeGuideModal()" style="width: 100%; margin-top: 12px; padding: 12px; background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 0.9rem;">
          稍后再说
        </button>
      </div>
    </div>
    <style>
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }
    </style>
  `;
  
  document.body.appendChild(modal);
  markGuideShown();
}

function closeGuideModal() {
  const modal = document.getElementById('guide-modal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => modal.remove(), 300);
  }
}
