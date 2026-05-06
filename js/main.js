// 副业避坑导航 - 主页JavaScript
// 获取基础路径（兼容GitHub Pages子目录部署）
const basePath = window.location.pathname.includes('/fuye/') ? '/fuye' : '';

// ==================== 全局变量 ====================
let platformsData = [];
let scamsData = [];
let matchingRules = null;

// ==================== 数据加载 ====================
async function loadData() {
  try {
    const [platformsRes, scamsRes, rulesRes] = await Promise.all([
      fetch(`${basePath}/data/platforms.json`),
      fetch(`${basePath}/data/scams.json`),
      fetch(`${basePath}/data/matching_rules.json`)
    ]);
    
    // 解析平台数据（字典结构转数组）
    const platformsDict = await platformsRes.json();
    platformsData = [];
    const categories = ['大厂平台', '技能平台', '内容平台'];
    categories.forEach(cat => {
      if (platformsDict[cat] && Array.isArray(platformsDict[cat])) {
        platformsData = platformsData.concat(platformsDict[cat]);
      }
    });
    
    // 解析骗局数据
    const scamsDict = await scamsRes.json();
    scamsData = scamsDict.骗局案例 || [];
    
    matchingRules = await rulesRes.json();
    
    console.log('数据加载成功: 平台', platformsData.length, '个, 骗局', scamsData.length, '个');
    return true;
  } catch (error) {
    console.error('数据加载失败:', error);
    return false;
  }
}

// ==================== 数据修正（按用户要求） ====================
function getCorrectedPlatformData(platform) {
  const name = platform.平台名称;
  
  // 阿里众包数据修正
  if (name === '阿里众包') {
    return {
      ...platform,
      收入范围: '时薪10-15元，新手日均10-30元，熟练后月入300-1000元',
      数据可信度: {
        整体等级: 'C',
        收入数据等级: 'C',
        核查备注: '收入数据经用户实测验证，原数据"日入500元"存在夸大'
      }
    };
  }
  
  // 小红书数据修正
  if (name === '小红书') {
    return {
      ...platform,
      收入范围: '万粉博主月入1-3万（头部效应明显，普通博主变现周期长）',
      风险提示: platform.风险提示 + ' | ⚠️万粉博主仅占少数，大多数博主收入为零或极低'
    };
  }
  
  // 抖音数据修正
  if (name === '抖音' || name === '抖音（字节跳动）') {
    return {
      ...platform,
      收入范围: '差异巨大，头部月入数十万，普通创作者可能为零',
      风险提示: platform.风险提示 + ' | ⚠️两极分化严重，需长期内容积累才能变现'
    };
  }
  
  return platform;
}

// ==================== 平台分类 ====================
function getPlatformCategories() {
  return {
    '大厂平台': '🏢',
    '技能变现': '💡',
    '内容创作': '📝',
    '配送众包': '🚴',
    '问卷调研': '📋',
    '设计创意': '🎨',
    '翻译语言': '🌐',
    '技术开发': '💻'
  };
}

// ==================== 首页初始化 ====================
async function initHome() {
  const loaded = await loadData();
  if (!loaded) {
    document.getElementById('hot-platforms').innerHTML = '<p class="text-muted">数据加载失败</p>';
    return;
  }
  
  // 渲染热门平台
  renderHotPlatforms();
  
  // 渲染最新骗局预警
  renderLatestScams();
  
  // 渲染分类导航
  renderCategoryNav();
  
  // 绑定搜索事件
  bindSearchEvents();
}

// 渲染热门平台
function renderHotPlatforms() {
  const container = document.getElementById('hot-platforms');
  if (!container) return;
  
  // 优先显示正常运营、数据可信度高的平台，最多显示12个
  const hotPlatforms = platformsData
    .filter(p => {
      const status = getPlatformStatus(p);
      return status === 'normal';
    })
    .sort((a, b) => {
      // 按数据可信度排序：A > B > C
      const trustA = a.数据可信度?.整体等级 || 'C';
      const trustB = b.数据可信度?.整体等级 || 'C';
      const order = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
      return (order[trustA] || 2) - (order[trustB] || 2);
    })
    .slice(0, 12)
    .map(p => getCorrectedPlatformData(p));
  
  if (hotPlatforms.length === 0) {
    container.innerHTML = '<p class="text-muted">暂无推荐平台</p>';
    return;
  }
  
  container.innerHTML = hotPlatforms.map(p => {
    const trustLevel = p.数据可信度?.整体等级 || 'C';
    const needWarning = trustLevel === 'C' || trustLevel === 'D';
    
    return `
    <div class="card fade-in" onclick="location.href='${basePath}/platform-detail.html?id=${encodeURIComponent(p.平台名称)}'" style="cursor:pointer;">
      <div class="platform-header">
        <span class="platform-name">${p.平台名称}</span>
        <span class="platform-type">${p.平台类型 || '任务型'}</span>
      </div>
      <div class="platform-tags">
        ${(p.人群标签 ? Object.entries(p.人群标签).filter(([k,v]) => v && v.includes('✅')).map(([k]) => `<span class="tag">${k}</span>`) : []).slice(0, 3).join('')}
      </div>
      <div class="platform-stats">
        <div class="stat-item">
          <div class="stat-value">${p.时薪范围 || '5-20元'}</div>
          <div class="stat-label">时薪</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${p.入门难度 || '⭐'}</div>
          <div class="stat-label">入门难度</div>
        </div>
        <div class="stat-item">
          <span class="trust-badge trust-${trustLevel.charAt(0).toLowerCase()}">可信度${trustLevel}</span>
        </div>
      </div>
      ${needWarning ? '<div style="color:#f59e0b;font-size:0.75rem;margin-top:8px;">⚠️ 数据仅供参考，建议核实</div>' : ''}
    </div>
  `}).join('');
}

// 获取平台状态
function getPlatformStatus(platform) {
  const name = platform.平台名称;
  const dataLevel = platform.数据可信度?.整体等级 || 'C';
  const status = platform.运营状态 || '';
  
  // 已停运平台
  if (status.includes('停运') || name === '阿里众包' || name === '字节众包' || name === '甜薪工场') {
    return 'stopped';
  }
  
  // 高风险平台
  if (status.includes('危险') || name === '甜薪工场') {
    return 'danger';
  }
  
  // 问题平台
  if (name === '猪八戒网' || name === '百度众测' || name === '京东微工' || dataLevel === 'D') {
    return 'warning';
  }
  
  // 正常运营
  return 'normal';
}

// 渲染最新骗局预警
function renderLatestScams() {
  const container = document.getElementById('latest-scams');
  if (!container || !scamsData || scamsData.length === 0) return;
  
  const latestScams = scamsData.slice(0, 6);
  
  container.innerHTML = latestScams.map(s => `
    <div class="alert-box fade-in" onclick="location.href='${basePath}/scam-detail.html?id=${encodeURIComponent(s.骗局名称)}'" style="cursor:pointer;">
      <span class="alert-icon">⚠️</span>
      <div class="alert-content">
        <h4>${s.骗局名称}</h4>
        <p>${s.作案手法?.[0]?.replace(/^第一步：/, '') || '高危骗局，请谨慎'}</p>
        <span class="tag" style="margin-top:8px;background:#fef2f2;color:#ef4444;">涉案${s.涉案金额 || '金额不等'}</span>
      </div>
    </div>
  `).join('');
}

// 渲染分类导航
function renderCategoryNav() {
  const container = document.getElementById('category-nav');
  if (!container) return;
  
  const categories = getPlatformCategories();
  
  container.innerHTML = Object.entries(categories).map(([name, icon]) => `
    <a href="${basePath}/platforms.html?category=${encodeURIComponent(name)}" class="category-item">
      <span class="category-icon">${icon}</span>
      <span class="category-name">${name}</span>
    </a>
  `).join('');
}

// 绑定搜索事件
function bindSearchEvents() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
}

// 执行搜索
function performSearch() {
  const query = document.getElementById('search-input')?.value?.trim();
  if (!query) return;
  
  // 同时搜索平台和骗局
  const matchedPlatforms = searchPlatforms(query);
  const matchedScams = searchScams(query);
  
  // 跳转到搜索结果页
  const params = new URLSearchParams({
    q: query,
    platforms: JSON.stringify(matchedPlatforms.slice(0, 10)),
    scams: JSON.stringify(matchedScams.slice(0, 10))
  });
  
  location.href = `search.html?${params.toString()}`;
}

// 搜索平台
function searchPlatforms(query) {
  const q = query.toLowerCase();
  return platformsData.filter(p => 
    p.平台名称?.toLowerCase().includes(q) ||
    p.平台类型?.toLowerCase().includes(q) ||
    p.适合人群?.toLowerCase().includes(q) ||
    p.技能要求?.toLowerCase().includes(q)
  );
}

// 搜索骗局
function searchScams(query) {
  if (!scamsData || scamsData.length === 0) return [];
  const q = query.toLowerCase();
  return scamsData.filter(s => 
    s.骗局名称?.toLowerCase().includes(q) ||
    s.骗局类型?.toLowerCase().includes(q) ||
    s.别名?.some(a => a.toLowerCase().includes(q)) ||
    s.作案手法?.some(p => p.toLowerCase().includes(q))
  );
}

// ==================== 通用工具 ====================

// 格式化金额
function formatMoney(amount) {
  if (!amount) return '面议';
  return amount;
}

// 获取危险等级样式
function getDangerLevelClass(level) {
  switch(level) {
    case '高危': return 'danger-high';
    case '中危': return 'danger-medium';
    case '低危': return 'danger-low';
    default: return 'danger-medium';
  }
}

// 获取可信度等级样式
function getTrustClass(level) {
  if (!level) return 'trust-c';
  return `trust-${level.charAt(0).toLowerCase()}`;
}

// 导出函数供其他模块使用
window.App = {
  loadData,
  searchPlatforms,
  searchScams,
  getDangerLevelClass,
  getTrustClass,
  formatMoney,
  getCorrectedPlatformData,
  platformsData,
  scamsData,
  matchingRules
};
