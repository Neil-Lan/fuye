// 副业避坑导航 - 骗局列表页JavaScript
// 获取基础路径（兼容GitHub Pages子目录部署）
const basePath = window.location.pathname.includes('/fuye/') ? '/fuye' : '';

// ==================== 全局变量 ====================
let scamsData = {};
let scamsList = [];
let currentScamType = '全部';

// ==================== 初始化 ====================
async function initScams() {
  try {
    const res = await fetch(`${basePath}/data/scams.json`);
    const data = await res.json();
    scamsData = data;
    scamsList = data.骗局案例 || [];
    
    // 获取URL参数中的分类
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    if (type) {
      currentScamType = type;
    }
    
    renderFilters();
    renderScams();
  } catch (error) {
    console.error('加载骗局数据失败:', error);
    document.getElementById('scams-list').innerHTML = '<p class="text-muted text-center">数据加载失败</p>';
  }
}

// 渲染筛选器
function renderFilters() {
  const typeSelect = document.getElementById('type-filter');
  if (typeSelect && scamsData.骗局分类) {
    const types = ['全部', ...Object.keys(scamsData.骗局分类)];
    typeSelect.innerHTML = types
      .map(t => `<option value="${t}" ${t === currentScamType ? 'selected' : ''}>${t}</option>`)
      .join('');
  }
}

// 渲染骗局列表
function renderScams() {
  const container = document.getElementById('scams-list');
  if (!container || !scamsList || scamsList.length === 0) return;
  
  let filtered = scamsList;
  
  // 分类筛选
  if (currentScamType !== '全部') {
    filtered = filtered.filter(s => s.骗局类型 === currentScamType);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>暂无符合条件的骗局</h3>
        <p class="text-muted">试试调整筛选条件</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map(s => {
    const dangerClass = s.危险等级 === '高危' ? 'danger-high' : 
                        s.危险等级 === '中危' ? 'danger-medium' : 'danger-low';
    
    return `
    <div class="card scam-card fade-in" onclick="location.href='scam-detail.html?id=${encodeURIComponent(s.骗局名称)}'" style="cursor:pointer;">
      <div class="scam-header">
        <span class="scam-name">${s.骗局名称}</span>
        <span class="danger-level ${dangerClass}">${s.危险等级 || '中危'}</span>
      </div>
      <div class="scam-stats">
        <span class="scam-stat">涉案金额：<strong>${s.涉案金额 || '不等'}</strong></span>
        <span class="scam-stat">受害人数：<strong>${s.受害人数 || '不详'}</strong></span>
      </div>
      <div class="scam-tags">
        <span class="tag">${s.骗局类型 || '其他'}</span>
        ${(s.别名 || []).slice(0, 2).map(a => `<span class="tag">${a}</span>`).join('')}
      </div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border-color);">
        <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.5;">
          ${s.作案手法?.[0]?.replace(/^第一步：/, '') || '详情点击查看'}
        </p>
      </div>
      ${s.案例核实 ? `
      <div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">
        ✅ 数据来源：${s.信息来源 || '官方通报/媒体报道'}
      </div>
      ` : ''}
    </div>
  `}).join('');
  
  // 更新统计
  document.getElementById('scam-count').textContent = filtered.length;
}

// 绑定筛选事件
function bindFilterEvents() {
  document.getElementById('type-filter')?.addEventListener('change', (e) => {
    currentScamType = e.target.value;
    renderScams();
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initScams();
  bindFilterEvents();
});
