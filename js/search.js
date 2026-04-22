// 副业避坑导航 - 搜索结果页JavaScript
// ==================== 初始化 ====================
function initSearch() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  
  if (!query) {
    document.getElementById('search-results').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>请输入搜索关键词</h3>
        <p class="text-muted">试试"配音"、"刷单"、"设计"等关键词</p>
      </div>
    `;
    return;
  }
  
  document.getElementById('search-query').textContent = query;
  
  // 从URL参数获取搜索结果
  let platforms = [];
  let scams = [];
  
  try {
    const platformsStr = params.get('platforms');
    const scamsStr = params.get('scams');
    
    if (platformsStr) {
      platforms = JSON.parse(platformsStr);
    }
    if (scamsStr) {
      scams = JSON.parse(scamsStr);
    }
  } catch (e) {
    console.error('解析搜索结果失败:', e);
  }
  
  renderResults(platforms, scams, query);
}

// 渲染搜索结果
function renderResults(platforms, scams, query) {
  const container = document.getElementById('search-results');
  
  if (platforms.length === 0 && scams.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😕</div>
        <h3>未找到相关结果</h3>
        <p class="text-muted">关于"${query}"没有找到匹配的平台或骗局</p>
        <div style="margin-top:20px;">
          <a href="platforms.html" class="btn btn-outline">浏览全部平台</a>
          <a href="scams.html" class="btn btn-outline" style="margin-left:8px;">浏览骗局列表</a>
        </div>
      </div>
    `;
    return;
  }
  
  let html = '';
  
  // 平台结果
  if (platforms.length > 0) {
    html += `
      <div class="section-header">
        <h2 class="section-title">🏢 平台结果 (${platforms.length})</h2>
      </div>
      <div class="card-grid mb-6">
        ${platforms.map(p => {
          const trustLevel = p.数据可信度?.整体等级 || 'C';
          return `
          <div class="card fade-in" onclick="location.href='platform-detail.html?id=${encodeURIComponent(p.平台名称)}'" style="cursor:pointer;">
            <div class="platform-header">
              <span class="platform-name">${p.平台名称}</span>
              <span class="platform-type">${p.平台类型 || '任务型'}</span>
            </div>
            <div class="platform-tags">
              ${(p.人群标签 ? Object.entries(p.人群标签).filter(([k,v]) => v && v.includes('✅')).map(([k]) => `<span class="tag">${k}</span>`) : []).slice(0, 3).join('')}
            </div>
            <div class="platform-stats">
              <div class="stat-item">
                <div class="stat-value">${p.时薪范围 || '-'}</div>
                <div class="stat-label">时薪</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">${p.入门难度 || '⭐'}</div>
                <div class="stat-label">难度</div>
              </div>
              <div class="stat-item">
                <span class="trust-badge trust-${trustLevel.charAt(0).toLowerCase()}">可信${trustLevel}</span>
              </div>
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  }
  
  // 骗局结果
  if (scams.length > 0) {
    html += `
      <div class="section-header">
        <h2 class="section-title">⚠️ 骗局预警 (${scams.length})</h2>
      </div>
      <div class="card-grid">
        ${scams.map(s => {
          const dangerClass = s.危险等级 === '高危' ? 'danger-high' : 
                              s.危险等级 === '中危' ? 'danger-medium' : 'danger-low';
          return `
          <div class="card scam-card fade-in" onclick="location.href='scam-detail.html?id=${encodeURIComponent(s.骗局名称)}'" style="cursor:pointer;">
            <div class="scam-header">
              <span class="scam-name">${s.骗局名称}</span>
              <span class="danger-level ${dangerClass}">${s.危险等级 || '中危'}</span>
            </div>
            <div class="scam-stats">
              <span class="scam-stat">涉案：<strong>${s.涉案金额 || '不等'}</strong></span>
              <span class="scam-stat">受害：<strong>${s.受害人数 || '不详'}</strong></span>
            </div>
            <div class="scam-tags">
              <span class="tag">${s.骗局类型 || '其他'}</span>
              ${(s.别名 || []).slice(0, 2).map(a => `<span class="tag">${a}</span>`).join('')}
            </div>
          </div>
        `}).join('')}
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSearch);
