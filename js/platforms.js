// 副业避坑导航 - 平台列表页JavaScript
// ==================== 全局变量 ====================
let platformsData = [];
let currentCategory = '全部';
let currentDifficulty = '全部';

// ==================== 数据修正函数 ====================
function getCorrectedPlatformData(platform) {
  const name = platform.平台名称;
  
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
  
  if (name === '小红书') {
    return {
      ...platform,
      收入范围: '万粉博主月入1-3万（头部效应明显，普通博主变现周期长）',
      风险提示: platform.风险提示 + ' | ⚠️万粉博主仅占少数，大多数博主收入为零或极低'
    };
  }
  
  if (name === '抖音' || name === '抖音（字节跳动）') {
    return {
      ...platform,
      收入范围: '差异巨大，头部月入数十万，普通创作者可能为零',
      风险提示: platform.风险提示 + ' | ⚠️两极分化严重，需长期内容积累才能变现'
    };
  }
  
  return platform;
}

// ==================== 初始化 ====================
async function initPlatforms() {
  try {
    const res = await fetch('./data/platforms.json');
    platformsData = await res.json();
    
    // 获取URL参数中的分类
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
      currentCategory = category;
    }
    
    renderFilters();
    renderPlatforms();
  } catch (error) {
    console.error('加载平台数据失败:', error);
    document.getElementById('platforms-list').innerHTML = '<p class="text-muted text-center">数据加载失败</p>';
  }
}

// 渲染筛选器
function renderFilters() {
  const categories = [
    '全部', '大厂平台', '技能变现', '内容创作', 
    '配送众包', '问卷调研', '设计创意', '翻译语言', '技术开发'
  ];
  
  // 动态获取已有分类
  const availableCategories = new Set(['全部']);
  platformsData.forEach(p => {
    const type = p.平台类型 || '';
    categories.forEach(c => {
      if (type.includes(c) || c.includes(type)) {
        availableCategories.add(c);
      }
    });
  });
  
  const categorySelect = document.getElementById('category-filter');
  if (categorySelect) {
    categorySelect.innerHTML = Array.from(availableCategories)
      .map(c => `<option value="${c}" ${c === currentCategory ? 'selected' : ''}>${c}</option>`)
      .join('');
  }
}

// 渲染平台列表
function renderPlatforms() {
  const container = document.getElementById('platforms-list');
  if (!container) return;
  
  let filtered = platformsData.map(p => getCorrectedPlatformData(p));
  
  // 分类筛选
  if (currentCategory !== '全部') {
    filtered = filtered.filter(p => {
      const type = p.平台类型 || '';
      return type.includes(currentCategory) || currentCategory.includes(type);
    });
  }
  
  // 难度筛选
  if (currentDifficulty !== '全部') {
    filtered = filtered.filter(p => {
      const diff = p.入门难度 || '⭐';
      switch (currentDifficulty) {
        case '简单': return diff === '⭐' || diff === '⭐（零基础）';
        case '中等': return diff === '⭐⭐';
        case '较难': return diff === '⭐⭐⭐' || diff === '⭐⭐⭐⭐';
        default: return true;
      }
    });
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>暂无符合条件的平台</h3>
        <p class="text-muted">试试调整筛选条件</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filtered.map(p => {
    const trustLevel = p.数据可信度?.整体等级 || 'C';
    const needWarning = trustLevel === 'C' || trustLevel === 'D';
    
    return `
    <div class="card platform-card fade-in" onclick="location.href='platform-detail.html?id=${encodeURIComponent(p.平台名称)}'" style="cursor:pointer;">
      <div class="platform-header">
        <span class="platform-name">${p.平台名称}</span>
        <span class="platform-type">${p.平台类型 || '任务型'}</span>
      </div>
      <div class="platform-tags">
        ${(p.人群标签 ? Object.entries(p.人群标签).filter(([k,v]) => v && v.includes('✅')).map(([k]) => `<span class="tag">${k}</span>`) : []).slice(0, 4).join('')}
      </div>
      <div class="platform-stats">
        <div class="stat-item">
          <div class="stat-value">${p.时薪范围 || '-'}</div>
          <div class="stat-label">时薪范围</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${p.收入稳定性 || '稳定'}</div>
          <div class="stat-label">收入稳定性</div>
        </div>
        <div class="stat-item">
          <span class="trust-badge trust-${trustLevel.charAt(0).toLowerCase()}">可信度${trustLevel}</span>
        </div>
      </div>
      <div class="platform-footer">
        <div class="difficulty">
          <span>入门难度：</span>
          <span class="difficulty-stars">${p.入门难度 || '⭐'}</span>
        </div>
        <span class="platform-name" style="font-size:0.8rem;color:var(--primary-color);">查看详情 →</span>
      </div>
      ${needWarning ? `<div style="background:#fef3c7;padding:8px 12px;border-radius:4px;font-size:0.75rem;color:#92400e;margin-top:8px;">⚠️ 数据可信度${trustLevel}级，建议多方核实</div>` : ''}
    </div>
  `}).join('');
  
  // 更新统计
  document.getElementById('platform-count').textContent = filtered.length;
}

// 绑定筛选事件
function bindFilterEvents() {
  document.getElementById('category-filter')?.addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderPlatforms();
  });
  
  document.getElementById('difficulty-filter')?.addEventListener('change', (e) => {
    currentDifficulty = e.target.value;
    renderPlatforms();
  });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initPlatforms();
  bindFilterEvents();
});
