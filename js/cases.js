// 副业发现平台 - 案例数据整合加载 v2.0
// 支持多维度筛选：收入区间、投入成本、时间投入、技能门槛

let allCases = [];
let casesByType = {};

// 获取基础路径（兼容GitHub Pages子目录部署）
const basePath = window.location.pathname.includes('/fuye/') ? '/fuye' : '';

const caseFiles = {
  'task': { file: `${basePath}/data/cases_task.json`, name: '任务型', icon: '📋' },
  'delivery': { file: `${basePath}/data/cases_delivery.json`, name: '配送型', icon: '🛵' },
  'design': { file: `${basePath}/data/cases_design.json`, name: '设计类', icon: '🎨' },
  'tech': { file: `${basePath}/data/cases_tech.json`, name: '技术类', icon: '💻' },
  'writing': { file: `${basePath}/data/cases_writing.json`, name: '写作类', icon: '✍️' },
  'video': { file: `${basePath}/data/cases_video.json`, name: '视频/直播', icon: '🎬' },
  'ecommerce': { file: `${basePath}/data/cases_ecommerce.json`, name: '电商类', icon: '🛒' },
  'failed': { file: `${basePath}/data/cases_failed.json`, name: '失败被骗', icon: '⚠️' },
  'complaint': { file: `${basePath}/data/cases_complaint.json`, name: '投诉维权', icon: '📢' },
  'startup': { file: `${basePath}/data/cases_startup.json`, name: '创业成功', icon: '🚀' },
  'startup_failed': { file: `${basePath}/data/cases_startup_failed.json`, name: '创业失败', icon: '💔' }
};

// 筛选条件定义
const FILTER_CONFIGS = {
  income: [
    { label: '全部收入', value: 'all', min: 0, max: Infinity },
    { label: '<1000元/月', value: 'income_0_1000', min: 0, max: 1000 },
    { label: '1000-3000元/月', value: 'income_1000_3000', min: 1000, max: 3000 },
    { label: '3000-5000元/月', value: 'income_3000_5000', min: 3000, max: 5000 },
    { label: '5000-10000元/月', value: 'income_5000_10000', min: 5000, max: 10000 },
    { label: '10000+元/月', value: 'income_10000_plus', min: 10000, max: Infinity }
  ],
  cost: [
    { label: '全部投入', value: 'all', min: 0, max: Infinity },
    { label: '<1000元', value: 'cost_0_1000', min: 0, max: 1000 },
    { label: '1000-5000元', value: 'cost_1000_5000', min: 1000, max: 5000 },
    { label: '5000-10000元', value: 'cost_5000_10000', min: 5000, max: 10000 },
    { label: '10000-50000元', value: 'cost_10000_50000', min: 10000, max: 50000 },
    { label: '50000+元', value: 'cost_50000_plus', min: 50000, max: Infinity }
  ],
  time: [
    { label: '全部时间', value: 'all' },
    { label: '兼职(<4小时/天)', value: 'parttime', hours: { min: 0, max: 4 } },
    { label: '半职(4-8小时/天)', value: 'halftime', hours: { min: 4, max: 8 } },
    { label: '全职(>8小时/天)', value: 'fulltime', hours: { min: 8, max: 24 } }
  ],
  skill: [
    { label: '全部门槛', value: 'all' },
    { label: '无门槛', value: 'none' },
    { label: '入门级', value: 'basic' },
    { label: '专业级', value: 'professional' }
  ]
};

// 当前筛选状态
let currentFilters = {
  type: 'all',
  income: 'all',
  cost: 'all',
  time: 'all',
  skill: 'all',
  search: ''
};

// 加载所有案例数据
async function loadAllCases() {
  const promises = Object.entries(caseFiles).map(async ([type, config]) => {
    try {
      const response = await fetch(config.file);
      if (!response.ok) return { type, cases: [], error: '加载失败' };
      
      const data = await response.json();
      
      // 处理不同的JSON结构
      let cases;
      if (Array.isArray(data)) {
        cases = data;
      } else if (data.案例列表 && Array.isArray(data.案例列表)) {
        cases = data.案例列表;
      } else if (data.投诉案例列表 && Array.isArray(data.投诉案例列表)) {
        cases = data.投诉案例列表;
      } else if (data.success_cases && Array.isArray(data.success_cases)) {
        cases = data.success_cases;
      } else if (data.cases && Array.isArray(data.cases)) {
        cases = data.cases;
      } else if (data.成功案例 && Array.isArray(data.成功案例)) {
        cases = data.成功案例;
      } else {
        console.warn(`[cases.js] 无法解析 ${config.file} 的数据结构`);
        cases = [];
      }
      
      // 确保是数组
      if (!Array.isArray(cases)) {
        cases = [cases];
      }
      
      // 为每个案例添加类型信息并标准化字段
      cases = cases.map((c, index) => {
        const normalized = normalizeCaseData(c);
        return {
          ...normalized,
          _type: type,
          _typeName: config.name,
          _typeIcon: config.icon,
          _id: normalized.id || `${type}_${index}`
        };
      });
      
      console.log(`[cases.js] 加载 ${config.name}: ${cases.length} 条`);
      
      return { type, cases, config };
    } catch (error) {
      console.error(`[cases.js] 加载 ${config.file} 失败:`, error);
      return { type, cases: [], error: error.message };
    }
  });
  
  const results = await Promise.all(promises);
  
  allCases = [];
  casesByType = {};
  
  results.forEach(result => {
    casesByType[result.type] = {
      cases: result.cases,
      config: result.config
    };
    allCases = allCases.concat(result.cases);
  });
  
  return { allCases, casesByType };
}

// 标准化案例数据字段
function normalizeCaseData(c) {
  // 处理startup的嵌套用户画像
  const profile = c.用户画像;
  const isStartupObj = profile && typeof profile === 'object';
  const profileStr = isStartupObj 
    ? `${profile.年龄 || ''}岁 ${profile.城市 || ''} ${profile.背景 || ''}` 
    : (c.用户画像 || '');
  
  // 处理startup_failed的user_profile
  const userProfile = c.user_profile || '';
  
  return {
    id: c.id || c.案例ID || c.案例编号 || c.f_id || '',
    nickname: c.用户昵称 || c.nickname || (isStartupObj ? (profile.背景 || '').substring(0,10) : '') || (userProfile ? userProfile.split('，')[0] : '') || '匿名用户',
    city: c.城市 || c.city || (isStartupObj ? profile.城市 : '') || (userProfile.match(/([\u4e00-\u9fa5]{2,4}(?:市|区|县|省))/)?.[1] || '') || '',
    platform: c.平台 || c.platform || c['平台/项目'] || c.创业类型 || c.entrepreneurship_type || '未知',
    type: c.副业类型 || c.类型 || c.创业类型 || c.entrepreneurship_type || '',
    monthlyIncome: c.月收入 || c.monthly_income || c.实际收入 || c.损失金额 || c.loss_amount || _parseIncomeRange(c.月收入范围) || _parseInvestment(c.investment_amount) || 0,
    incomeRange: c.收入范围 || c.月收入范围 || '',
    dailyHours: c.每天投入时间 || c.投入时间 || c.时间投入 || '',
    initialCost: c.初始投入 || c.投入成本 || c.投资金额 || _parseInvestment(c.investment_amount) || 0,
    skillLevel: c.技能要求 || c.难度 || '无门槛',
    experience: c.经历详情 || c.experience || c.内容 || c.case_details || '',
    difficulty: c.入门难度 || c.难度 || '',
    credibility: c.可信度 || c.credibility || c.数据可信度 || 'B',
    rating: c.推荐指数 || c.评分 || 0,
    date: c.开始时间 || c.日期 || c.date || c.failure_time || ''
  };
}

// 解析收入范围字符串（如"3-5万"）为数字
function _parseIncomeRange(str) {
  if (!str || typeof str !== 'string') return 0;
  const match = str.match(/(\d+)\s*[-~]\s*(\d+)\s*万/);
  if (match) return (parseFloat(match[1]) + parseFloat(match[2])) / 2 * 10000;
  const match2 = str.match(/(\d+)\s*[-~]\s*(\d+)\s*千/);
  if (match2) return (parseFloat(match2[1]) + parseFloat(match2[2])) / 2 * 1000;
  const match3 = str.match(/(\d+)\s*万/);
  if (match3) return parseFloat(match3[1]) * 10000;
  return 0;
}

// 解析投资金额（可能是字符串如"12万元"）
function _parseInvestment(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  const match = val.toString().match(/([\d.]+)\s*万/);
  if (match) return parseFloat(match[1]) * 10000;
  const match2 = val.toString().match(/([\d.]+)/);
  if (match2) return parseFloat(match2[1]);
  return 0;
}

// 按类型获取案例
function getCasesByType(type) {
  return casesByType[type]?.cases || [];
}

// 获取随机案例
function getRandomCases(count = 10, type = null) {
  let pool = type ? (casesByType[type]?.cases || []) : allCases;
  if (pool.length <= count) return pool;
  
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// 按平台筛选案例
function getCasesByPlatform(platformName) {
  return allCases.filter(c => 
    c.platform === platformName || 
    c.platform === platformName
  );
}

// 解析时间字符串为小时数
function parseHoursToNumber(timeStr) {
  if (!timeStr) return 0;
  
  // 匹配"每天X小时"格式
  const dailyMatch = timeStr.match(/每天(\d+\.?\d*)小时?/);
  if (dailyMatch) return parseFloat(dailyMatch[1]);
  
  // 匹配"每周X小时"格式
  const weeklyMatch = timeStr.match(/每周(\d+\.?\d*)小时?/);
  if (weeklyMatch) return parseFloat(weeklyMatch[1]) / 7;
  
  // 匹配小时数字
  const hourMatch = timeStr.match(/(\d+\.?\d*)\s*小时/);
  if (hourMatch) return parseFloat(hourMatch[1]);
  
  // 匹配"X-Y小时"格式
  const rangeMatch = timeStr.match(/(\d+\.?\d*)-(\d+\.?\d*)\s*小时/);
  if (rangeMatch) return (parseFloat(rangeMatch[1]) + parseFloat(rangeMatch[2])) / 2;
  
  return 0;
}

// 解析技能门槛
function parseSkillLevel(skillStr) {
  if (!skillStr) return 'none';
  const s = skillStr.toLowerCase();
  
  if (s.includes('无') || s.includes('零') || s.includes('简单') || s.includes('⭐') || s === 'none') {
    return 'none';
  }
  if (s.includes('入门') || s.includes('基础') || s.includes('初级') || s.includes('简单')) {
    return 'basic';
  }
  if (s.includes('专业') || s.includes('高级') || s.includes('资深') || s.includes('熟练')) {
    return 'professional';
  }
  
  return 'basic';
}

// 应用所有筛选条件
function applyFilters(cases, filters) {
  return cases.filter(c => {
    // 类型筛选
    if (filters.type !== 'all' && c._type !== filters.type) {
      return false;
    }
    
    // 收入筛选
    if (filters.income !== 'all') {
      const incomeConfig = FILTER_CONFIGS.income.find(i => i.value === filters.income);
      if (incomeConfig) {
        const income = c.monthlyIncome || 0;
        if (income < incomeConfig.min || income >= incomeConfig.max) {
          return false;
        }
      }
    }
    
    // 成本筛选
    if (filters.cost !== 'all') {
      const costConfig = FILTER_CONFIGS.cost.find(i => i.value === filters.cost);
      if (costConfig) {
        const cost = c.initialCost || 0;
        if (cost < costConfig.min || cost >= costConfig.max) {
          return false;
        }
      }
    }
    
    // 时间投入筛选
    if (filters.time !== 'all') {
      const timeConfig = FILTER_CONFIGS.time.find(t => t.value === filters.time);
      if (timeConfig && timeConfig.hours) {
        const hours = parseHoursToNumber(c.dailyHours);
        if (hours < timeConfig.hours.min || hours >= timeConfig.hours.max) {
          return false;
        }
      }
    }
    
    // 技能门槛筛选
    if (filters.skill !== 'all') {
      const caseSkill = parseSkillLevel(c.skillLevel || c.difficulty);
      if (caseSkill !== filters.skill) {
        return false;
      }
    }
    
    // 搜索筛选
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchableText = [
        c.platform,
        c.nickname,
        c.city,
        c.experience,
        c.type,
        c._typeName
      ].filter(Boolean).join(' ').toLowerCase();
      
      if (!searchableText.includes(searchLower)) {
        return false;
      }
    }
    
    return true;
  });
}

// 获取筛选后的案例
function getFilteredCases() {
  return applyFilters(allCases, currentFilters);
}

// 获取案例统计
function getCasesStats() {
  const filteredCases = getFilteredCases();
  
  const stats = {
    total: allCases.length,
    filtered: filteredCases.length,
    byType: {}
  };
  
  Object.entries(casesByType).forEach(([type, data]) => {
    stats.byType[type] = {
      name: data.config?.name || type,
      icon: data.config?.icon || '',
      count: data.cases.length
    };
  });
  
  // 收入分布统计
  stats.incomeDistribution = {
    '0-1000': filteredCases.filter(c => c.monthlyIncome < 1000).length,
    '1000-3000': filteredCases.filter(c => c.monthlyIncome >= 1000 && c.monthlyIncome < 3000).length,
    '3000-5000': filteredCases.filter(c => c.monthlyIncome >= 3000 && c.monthlyIncome < 5000).length,
    '5000-10000': filteredCases.filter(c => c.monthlyIncome >= 5000 && c.monthlyIncome < 10000).length,
    '10000+': filteredCases.filter(c => c.monthlyIncome >= 10000).length
  };
  
  return stats;
}

// 渲染案例卡片
function renderCaseCard(caseData, container) {
  const isFailed = caseData._type === 'failed' || caseData._type === 'startup_failed';
  const isComplaint = caseData._type === 'complaint';
  const isLoss = isFailed || isComplaint;
  
  const card = document.createElement('div');
  card.className = 'case-card' + (isFailed ? ' case-card-warning' : '');
  
  const income = caseData.monthlyIncome || 0;
  const incomeLabel = isLoss ? '损失金额' : '月收入';
  const incomeClass = isLoss ? 'case-income-loss' : 'case-income';
  
  // 解析技能门槛显示
  const skillLevel = parseSkillLevel(caseData.skillLevel || caseData.difficulty);
  const skillBadge = skillLevel === 'none' ? '🏅无门槛' : 
                    skillLevel === 'basic' ? '📚入门级' : '💎专业级';
  
  // 解析时间显示
  const hours = parseHoursToNumber(caseData.dailyHours);
  const timeBadge = hours === 0 ? '' :
                   hours < 4 ? '⏰兼职' :
                   hours < 8 ? '⏰半职' : '⏰全职';
  
  card.innerHTML = `
    <div class="case-header">
      <span class="case-type-badge">${caseData._typeIcon || '📋'} ${caseData._typeName || caseData.type || '案例'}</span>
      <span class="case-platform">${caseData.platform || '未知平台'}</span>
    </div>
    <div class="case-user">
      <span class="case-avatar">${(caseData.nickname || '匿名').charAt(0)}</span>
      <div class="case-user-info">
        <div class="case-nickname">${caseData.nickname || '匿名用户'}</div>
        <div class="case-profile">${caseData.city || ''} ${timeBadge} ${skillBadge}</div>
      </div>
    </div>
    <p class="case-experience">${(caseData.experience || '').substring(0, 150)}${(caseData.experience || '').length > 150 ? '...' : ''}</p>
    <div class="case-footer">
      <span class="${incomeClass}">${incomeLabel}: <strong>${isLoss ? '-' : '+'}${income > 0 ? income : '-'}元</strong></span>
      <span class="case-credibility">可信度: ${caseData.credibility || 'B'}</span>
    </div>
  `;
  
  // 点击查看详情
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    showCaseDetail(caseData);
  });
  
  container.appendChild(card);
}

// 显示案例详情弹窗
function showCaseDetail(caseData) {
  const modal = document.createElement('div');
  modal.className = 'case-detail-modal';
  modal.innerHTML = `
    <div class="case-detail-overlay" onclick="this.parentElement.remove()"></div>
    <div class="case-detail-content">
      <button class="case-detail-close" onclick="this.closest('.case-detail-modal').remove()">×</button>
      <div class="case-detail-header">
        <span class="case-type-badge">${caseData._typeIcon || ''} ${caseData._typeName || ''}</span>
        <span class="case-platform">${caseData.platform || ''}</span>
      </div>
      <h3>${caseData.nickname || '匿名用户'}</h3>
      <p class="case-profile-detail">${caseData.city || ''}</p>
      <div class="case-stats-row">
        <div class="case-stat-item">
          <span class="stat-label">月收入</span>
          <span class="stat-value">${caseData.monthlyIncome || 0}元</span>
        </div>
        <div class="case-stat-item">
          <span class="stat-label">时间投入</span>
          <span class="stat-value">${caseData.dailyHours || '-'}</span>
        </div>
        <div class="case-stat-item">
          <span class="stat-label">初始投入</span>
          <span class="stat-value">${caseData.initialCost || 0}元</span>
        </div>
      </div>
      <div class="case-experience-full">
        <h4>详细经历</h4>
        <p>${caseData.experience || '暂无详情'}</p>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// 初始化案例展示
async function initCasesDisplay(containerId, type = null, count = 10) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = '<div class="loading">加载案例数据...</div>';
  
  await loadAllCases();
  
  const cases = getRandomCases(count, type);
  container.innerHTML = '';
  
  if (cases.length === 0) {
    container.innerHTML = '<p class="text-muted">暂无案例数据</p>';
    return;
  }
  
  cases.forEach(c => renderCaseCard(c, container));
  
  // 显示统计
  const stats = getCasesStats();
  console.log('案例统计:', stats);
}

// 更新筛选器UI
function updateFilterUI() {
  // 更新筛选按钮状态
  Object.keys(currentFilters).forEach(filterType => {
    const buttons = document.querySelectorAll(`[data-filter-${filterType}]`);
    buttons.forEach(btn => {
      if (btn.dataset[`filter${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`] === currentFilters[filterType]) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  });
}

// 设置筛选条件
function setFilter(filterType, value) {
  currentFilters[filterType] = value;
  updateFilterUI();
  
  // 触发结果更新
  if (typeof onFilterChange === 'function') {
    onFilterChange(currentFilters);
  }
}

// 导出函数
window.CasesManager = {
  loadAllCases,
  getCasesByType,
  getRandomCases,
  getCasesByPlatform,
  getCasesByIncomeRange: (min, max) => allCases.filter(c => {
    const income = c.monthlyIncome || 0;
    return income >= min && income < max;
  }),
  getFilteredCases,
  getCasesStats,
  renderCaseCard,
  initCasesDisplay,
  setFilter,
  currentFilters,
  FILTER_CONFIGS,
  getAllCases: () => allCases,
  getCasesByTypeData: () => casesByType,
  parseHoursToNumber,
  parseSkillLevel
};
