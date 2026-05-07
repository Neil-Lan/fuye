// 副业发现平台 - 搜索功能增强版
// 支持高级筛选、搜索历史、热门搜索、结果排序

// 搜索历史存储
const SEARCH_HISTORY_KEY = 'fuye_search_history';
const MAX_HISTORY_COUNT = 5;

// 热门搜索关键词
const HOT_SEARCHES = [
  { keyword: '配音兼职', count: 126 },
  { keyword: '短视频带货', count: 98 },
  { keyword: '数据标注', count: 87 },
  { keyword: '闲鱼卖货', count: 76 },
  { keyword: '外卖骑手', count: 65 },
  { keyword: '设计兼职', count: 54 },
  { keyword: '写作赚钱', count: 48 },
  { keyword: '程序员兼职', count: 43 },
  { keyword: '问卷调查', count: 38 },
  { keyword: '直播带货', count: 35 }
];

// 高级筛选配置
const ADVANCED_FILTERS = {
  type: [
    { label: '全部', value: 'all' },
    { label: '平台', value: 'platform' },
    { label: '骗局', value: 'scam' },
    { label: '案例', value: 'case' }
  ],
  income: [
    { label: '全部', value: 'all' },
    { label: '0-1000元', value: '0_1000' },
    { label: '1000-3000元', value: '1000_3000' },
    { label: '3000-5000元', value: '3000_5000' },
    { label: '5000-10000元', value: '5000_10000' },
    { label: '10000+元', value: '10000_plus' }
  ],
  difficulty: [
    { label: '全部', value: 'all' },
    { label: '零基础', value: 'easy' },
    { label: '入门级', value: 'medium' },
    { label: '专业级', value: 'hard' }
  ]
};

// 当前筛选状态
let currentSearchFilters = {
  type: 'all',
  income: 'all',
  difficulty: 'all',
  sortBy: 'relevance'
};

// 获取搜索历史
function getSearchHistory() {
  try {
    return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

// 保存搜索历史
function saveSearchHistory(keyword) {
  if (!keyword.trim()) return;
  
  let history = getSearchHistory();
  
  // 移除重复项
  history = history.filter(k => k !== keyword);
  
  // 添加到开头
  history.unshift(keyword);
  
  // 限制数量
  history = history.slice(0, MAX_HISTORY_COUNT);
  
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
}

// 清除搜索历史
function clearSearchHistory() {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
  renderSearchHistory();
}

// 渲染搜索历史
function renderSearchHistory() {
  const container = document.getElementById('search-history');
  if (!container) return;
  
  const history = getSearchHistory();
  
  if (history.length === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'block';
  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
      <span style="font-size:0.85rem;color:#6b7280;font-weight:500;">最近搜索</span>
      <span style="font-size:0.8rem;color:#9ca3af;cursor:pointer;" onclick="clearSearchHistory()">清除</span>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${history.map(k => `
        <span style="background:#f3f4f6;padding:6px 12px;border-radius:16px;font-size:0.85rem;cursor:pointer;" onclick="doSearch('${k}')">
          <span style="color:#6b7280;">🕐</span> ${k}
        </span>
      `).join('')}
    </div>
  `;
}

// 渲染热门搜索
function renderHotSearches() {
  const container = document.getElementById('hot-searches');
  if (!container) return;
  
  container.innerHTML = `
    <div style="font-size:0.85rem;color:#6b7280;font-weight:500;margin-bottom:10px;">🔥 热门搜索</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${HOT_SEARCHES.slice(0, 10).map((item, index) => `
        <span style="background:${index < 3 ? '#fef3c7' : '#f3f4f6'};padding:6px 12px;border-radius:16px;font-size:0.85rem;cursor:pointer;color:${index < 3 ? '#d97706' : '#374151'};" onclick="doSearch('${item.keyword}')">
          <span style="font-weight:600;margin-right:4px;">${index + 1}</span>${item.keyword}
        </span>
      `).join('')}
    </div>
  `;
}

// 渲染高级筛选
function renderAdvancedFilters() {
  const container = document.getElementById('advanced-filters');
  if (!container) return;
  
  let html = '<div style="display:flex;flex-wrap:wrap;gap:16px;align-items:center;">';
  
  // 类型筛选
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  html += '<span style="font-size:0.85rem;color:#6b7280;">类型：</span>';
  html += '<select id="filter-type" class="filter-select" onchange="updateSearchFilters()">';
  ADVANCED_FILTERS.type.forEach(opt => {
    html += `<option value="${opt.value}">${opt.label}</option>`;
  });
  html += '</select></div>';
  
  // 收入筛选
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  html += '<span style="font-size:0.85rem;color:#6b7280;">收入：</span>';
  html += '<select id="filter-income" class="filter-select" onchange="updateSearchFilters()">';
  ADVANCED_FILTERS.income.forEach(opt => {
    html += `<option value="${opt.value}">${opt.label}</option>`;
  });
  html += '</select></div>';
  
  // 难度筛选
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  html += '<span style="font-size:0.85rem;color:#6b7280;">难度：</span>';
  html += '<select id="filter-difficulty" class="filter-select" onchange="updateSearchFilters()">';
  ADVANCED_FILTERS.difficulty.forEach(opt => {
    html += `<option value="${opt.value}">${opt.label}</option>`;
  });
  html += '</select></div>';
  
  // 排序
  html += '<div style="display:flex;align-items:center;gap:8px;">';
  html += '<span style="font-size:0.85rem;color:#6b7280;">排序：</span>';
  html += '<select id="filter-sort" class="filter-select" onchange="updateSearchFilters()">';
  html += '<option value="relevance">相关度</option>';
  html += '<option value="hot">热度</option>';
  html += '<option value="income_desc">收入（降序）</option>';
  html += '</select></div>';
  
  html += '</div>';
  container.innerHTML = html;
}

// 更新搜索筛选
function updateSearchFilters() {
  currentSearchFilters = {
    type: document.getElementById('filter-type')?.value || 'all',
    income: document.getElementById('filter-income')?.value || 'all',
    difficulty: document.getElementById('filter-difficulty')?.value || 'all',
    sortBy: document.getElementById('filter-sort')?.value || 'relevance'
  };
  
  // 如果已经有搜索结果，重新搜索
  const query = document.getElementById('search-input')?.value;
  if (query) {
    performSearch(query);
  }
}

// 执行搜索
function doSearch(keyword) {
  if (!keyword) {
    keyword = document.getElementById('search-input')?.value?.trim();
  }
  
  if (!keyword) {
    alert('请输入搜索关键词');
    return;
  }
  
  // 保存搜索历史
  saveSearchHistory(keyword);
  
  // 更新URL并搜索
  const params = new URLSearchParams(window.location.search);
  params.set('q', keyword);
  
  // 保留筛选条件
  if (currentSearchFilters.type !== 'all') params.set('type', currentSearchFilters.type);
  if (currentSearchFilters.income !== 'all') params.set('income', currentSearchFilters.income);
  
  location.href = 'search.html?' + params.toString();
}

// 执行实际搜索
async function performSearch(query) {
  const container = document.getElementById('search-results');
  container.innerHTML = '<div class="loading">搜索中...</div>';
  
  try {
    // 加载数据
    const basePath = window.location.pathname.includes('/fuye/') ? '/fuye' : '';
    
    const [platformsRes, scamsRes, casesRes] = await Promise.all([
      fetch(`${basePath}/data/platforms.json`).catch(() => null),
      fetch(`${basePath}/data/scams.json`).catch(() => null),
      fetch(`${basePath}/data/real_cases.json`).catch(() => null)
    ]);
    
    let platforms = [];
    let scams = [];
    let cases = [];
    
    if (platformsRes?.ok) {
      const data = await platformsRes.json();
      const categories = ['大厂平台', '技能平台', '内容平台'];
      categories.forEach(cat => {
        if (data[cat] && Array.isArray(data[cat])) {
          platforms = platforms.concat(data[cat]);
        }
      });
    }
    
    if (scamsRes?.ok) {
      const data = await scamsRes.json();
      scams = data.骗局案例 || [];
    }
    
    if (casesRes?.ok) {
      const data = await casesRes.json();
      cases = data.成功案例 || [];
    }
    
    // 搜索匹配
    const queryLower = query.toLowerCase();
    
    let matchedPlatforms = platforms.filter(p => 
      (p.平台名称 || '').toLowerCase().includes(queryLower) ||
      (p.平台类型 || '').toLowerCase().includes(queryLower) ||
      (p.收入范围 || '').toLowerCase().includes(queryLower)
    );
    
    let matchedScams = scams.filter(s => 
      (s.骗局名称 || '').toLowerCase().includes(queryLower) ||
      (s.骗局类型 || '').toLowerCase().includes(queryLower) ||
      ((s.别名 || []).join('')).toLowerCase().includes(queryLower)
    );
    
    let matchedCases = cases.filter(c => 
      (c.平台 || '').toLowerCase().includes(queryLower) ||
      (c.用户画像 || '').toLowerCase().includes(queryLower) ||
      (c.经历详情 || '').toLowerCase().includes(queryLower)
    );
    
    // 应用筛选
    if (currentSearchFilters.type !== 'all') {
      if (currentSearchFilters.type === 'platform') {
        matchedScams = [];
        matchedCases = [];
      } else if (currentSearchFilters.type === 'scam') {
        matchedPlatforms = [];
        matchedCases = [];
      } else if (currentSearchFilters.type === 'case') {
        matchedPlatforms = [];
        matchedScams = [];
      }
    }
    
    // 渲染结果
    renderSearchResults({
      platforms: matchedPlatforms,
      scams: matchedScams,
      cases: matchedCases,
      query: query
    });
    
  } catch (e) {
    console.error('搜索失败:', e);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">😕</div>
        <h3>搜索失败</h3>
        <p class="text-muted">请稍后重试</p>
      </div>
    `;
  }
}

// 渲染搜索结果
function renderSearchResults(results) {
  const container = document.getElementById('search-results');
  const { platforms, scams, cases, query } = results;
  
  const totalResults = platforms.length + scams.length + cases.length;
  
  if (totalResults === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>未找到"${query}"相关结果</h3>
        <p class="text-muted">试试其他关键词，或浏览全部内容</p>
        <div style="margin-top:20px;">
          <a href="platforms.html" class="btn btn-outline">浏览全部平台</a>
          <a href="scams.html" class="btn btn-outline" style="margin-left:8px;">浏览骗局预警</a>
        </div>
      </div>
    `;
    return;
  }
  
  let html = `
    <div style="margin-bottom:20px;padding:12px 16px;background:#f0fdf4;border-radius:8px;font-size:0.9rem;">
      找到 <strong style="color:#16a34a;">${totalResults}</strong> 个相关结果
    </div>
  `;
  
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
  
  // 案例结果
  if (cases.length > 0) {
    html += `
      <div class="section-header">
        <h2 class="section-title">📊 真实案例 (${cases.length})</h2>
      </div>
      <div class="card-grid">
        ${cases.slice(0, 6).map(c => `
          <div class="card fade-in" onclick="location.href='cases.html'" style="cursor:pointer;">
            <div style="font-weight:600;margin-bottom:8px;">${c.平台 || '案例'}</div>
            <div style="font-size:0.85rem;color:#666;margin-bottom:8px;">${c.用户画像 || ''}</div>
            <div style="font-size:0.85rem;color:#666;">月收入：<strong style="color:#16a34a;">${c.实际收入 || '-'}</strong></div>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// 初始化搜索页面
function initSearch() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  
  // 渲染组件
  renderSearchHistory();
  renderHotSearches();
  renderAdvancedFilters();
  
  if (!query) {
    document.getElementById('search-results').innerHTML = `
      <div class="empty-state" style="margin-top:40px;">
        <div class="empty-icon">🔍</div>
        <h3>开始搜索</h3>
        <p class="text-muted">输入关键词查找副业平台、骗局预警或真实案例</p>
      </div>
    `;
    return;
  }
  
  document.getElementById('search-input').value = query;
  const queryEl = document.getElementById('search-query');
  if (queryEl) queryEl.textContent = query;
  
  // 恢复筛选状态
  const typeParam = params.get('type');
  const incomeParam = params.get('income');
  if (typeParam) {
    currentSearchFilters.type = typeParam;
    const typeSelect = document.getElementById('filter-type');
    if (typeSelect) typeSelect.value = typeParam;
  }
  if (incomeParam) {
    currentSearchFilters.income = incomeParam;
    const incomeSelect = document.getElementById('filter-income');
    if (incomeSelect) incomeSelect.value = incomeParam;
  }
  
  performSearch(query);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSearch);

// 导出函数
window.SearchManager = {
  doSearch,
  clearSearchHistory,
  renderSearchHistory,
  renderHotSearches,
  performSearch,
  getSearchHistory,
  HOT_SEARCHES,
  ADVANCED_FILTERS
};
