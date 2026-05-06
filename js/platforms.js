// 副业避坑导航 - 平台列表页JavaScript
// 获取基础路径（兼容GitHub Pages子目录部署）
const basePath = window.location.pathname.includes('/fuye/') ? '/fuye' : '';

// ==================== 全局变量 ====================
let platformsData = [];
let currentCategory = '全部';
let currentDifficulty = '全部';
let currentStatus = '全部';  // 新增：平台状态筛选
let currentIncome = '全部';  // 新增：收入区间筛选
let currentTime = '全部';    // 新增：时间投入筛选
let currentPersona = '全部'; // 新增：人群筛选
let currentSkill = '全部';   // 新增：技能要求筛选

// ==================== 平台状态判断函数 ====================
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

function getStatusLabel(status) {
  switch(status) {
    case 'stopped': return '<span class="status-tag status-stopped">❌ 已停运</span>';
    case 'danger': return '<span class="status-tag status-danger">🚫 极度危险</span>';
    case 'warning': return '<span class="status-tag status-warning">⚠️ 问题较多</span>';
    default: return '<span class="status-tag status-normal">✅ 正常运营</span>';
  }
}

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
    const res = await fetch(`${basePath}/data/platforms.json`);
    const data = await res.json();
    
    // 将分类数据合并为平台数组
    platformsData = [];
    const categories = ['大厂平台', '技能平台', '内容平台'];
    categories.forEach(cat => {
      if (data[cat] && Array.isArray(data[cat])) {
        data[cat].forEach(p => {
          // 添加分类标签
          if (!p.平台类型) {
            if (cat === '大厂平台') p.平台类型 = '大厂平台';
            else if (cat === '技能平台') p.平台类型 = '技能变现';
            else if (cat === '内容平台') p.平台类型 = '内容创作';
          }
          platformsData.push(p);
        });
      }
    });
    
    console.log('加载平台数据成功，共', platformsData.length, '个平台');
    
    // 获取URL参数中的分类
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');
    if (category) {
      currentCategory = category;
    }
    
    // 支持人群参数
    const persona = params.get('persona');
    if (persona) {
      currentPersona = persona === 'mom' ? '宝妈' : 
                      persona === 'student' ? '学生' :
                      persona === 'office' ? '上班族' :
                      persona === 'freelancer' ? '自由职业' :
                      persona === 'retiree' ? '退休人员' : '全部';
    }
    
    renderFilters();
    renderPlatforms();
  } catch (error) {
    console.error('加载平台数据失败:', error);
    document.getElementById('platforms-list').innerHTML = '<p class="text-muted text-center">数据加载失败</p>';
  }
}

// 解析收入区间
function parseIncomeRange(incomeStr) {
  if (!incomeStr) return { min: 0, max: 1000 };
  const match = incomeStr.match(/(\d+)-?(\d+)?/);
  if (match) {
    const min = parseInt(match[1]) || 0;
    const max = parseInt(match[2]) || min * 2;
    return { min, max };
  }
  // 处理特殊格式
  const singleMatch = incomeStr.match(/(\d+)/);
  if (singleMatch) {
    const val = parseInt(singleMatch[1]);
    return { min: val, max: val * 2 };
  }
  return { min: 0, max: 1000 };
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
  
  // 状态筛选（新增）
  if (currentStatus !== '全部') {
    filtered = filtered.filter(p => {
      const status = getPlatformStatus(p);
      switch (currentStatus) {
        case '正常运营': return status === 'normal';
        case '问题较多': return status === 'warning';
        case '已停运': return status === 'stopped';
        default: return true;
      }
    });
  }
  
  // 收入区间筛选（新增）
  if (currentIncome !== '全部') {
    filtered = filtered.filter(p => {
      const incomeStr = p.时薪范围 || p.收入范围 || '';
      const range = parseIncomeRange(incomeStr);
      const avgIncome = (range.min + range.max) / 2;
      switch (currentIncome) {
        case '0-1000': return avgIncome <= 1000;
        case '1000-3000': return avgIncome > 1000 && avgIncome <= 3000;
        case '3000-5000': return avgIncome > 3000 && avgIncome <= 5000;
        case '5000-10000': return avgIncome > 5000 && avgIncome <= 10000;
        case '10000+': return avgIncome > 10000;
        default: return true;
      }
    });
  }
  
  // 时间投入筛选（新增）
  if (currentTime !== '全部') {
    filtered = filtered.filter(p => {
      const timeStr = p.时间投入 || p.时间匹配 || '';
      switch (currentTime) {
        case '碎片时间': return timeStr.includes('碎片') || timeStr.includes('灵活');
        case '1-2小时': return timeStr.includes('1') || timeStr.includes('2');
        case '3-4小时': return timeStr.includes('3') || timeStr.includes('4');
        case '全职': return timeStr.includes('全职') || timeStr.includes('8');
        default: return true;
      }
    });
  }
  
  // 人群筛选（新增）
  if (currentPersona !== '全部') {
    filtered = filtered.filter(p => {
      const labels = p.人群标签 || {};
      const personaMatch = Object.entries(labels).find(([k, v]) => 
        v && v.includes('✅') && k.includes(currentPersona)
      );
      return !!personaMatch;
    });
  }
  
  // 技能要求筛选（新增）
  if (currentSkill !== '全部') {
    filtered = filtered.filter(p => {
      const skillReq = p.新手门槛 || p.技能要求 || '';
      switch (currentSkill) {
        case '零基础': return skillReq.includes('零基础') || skillReq.includes('无需') || skillReq.includes('无要求');
        case '入门': return skillReq.includes('入门') || skillReq.includes('简单');
        case '专业': return skillReq.includes('专业') || skillReq.includes('需要经验');
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
    const platformStatus = getPlatformStatus(p);  // 获取平台状态
    const statusLabel = getStatusLabel(platformStatus);  // 获取状态标签
    
    return `
    <div class="card platform-card fade-in" onclick="location.href='platform-detail.html?id=${encodeURIComponent(p.平台名称)}'" style="cursor:pointer;${platformStatus === 'stopped' ? 'opacity:0.6;' : ''}">
      <div class="platform-header">
        <span class="platform-name">${p.平台名称}</span>
        <span class="platform-type">${p.平台类型 || '任务型'}</span>
      </div>
      <div style="margin-bottom:8px;">${statusLabel}</div>
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
  
  // 更新增强筛选器的结果计数
  const totalEl = document.getElementById('total-count');
  if (totalEl) {
    totalEl.textContent = filtered.length;
  }
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
  
  // 新增：状态筛选事件
  document.getElementById('status-filter')?.addEventListener('change', (e) => {
    currentStatus = e.target.value;
    renderPlatforms();
  });
  
  // 新增：收入区间筛选事件
  document.getElementById('income-filter')?.addEventListener('change', (e) => {
    currentIncome = e.target.value;
    renderPlatforms();
  });
  
  // 新增：时间投入筛选事件
  document.getElementById('time-filter')?.addEventListener('change', (e) => {
    currentTime = e.target.value;
    renderPlatforms();
  });
  
  // 新增：人群筛选事件
  document.getElementById('persona-filter')?.addEventListener('change', (e) => {
    currentPersona = e.target.value;
    renderPlatforms();
  });
  
  // 新增：技能要求筛选事件
  document.getElementById('skill-filter')?.addEventListener('change', (e) => {
    currentSkill = e.target.value;
    renderPlatforms();
  });
}

// 重置所有筛选
function resetAllFilters() {
  currentCategory = '全部';
  currentDifficulty = '全部';
  currentStatus = '全部';
  currentIncome = '全部';
  currentTime = '全部';
  currentPersona = '全部';
  currentSkill = '全部';
  
  // 重置所有select
  ['category-filter', 'difficulty-filter', 'status-filter', 'income-filter', 'time-filter', 'persona-filter', 'skill-filter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '全部';
  });
  
  renderPlatforms();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initPlatforms();
  bindFilterEvents();
});
