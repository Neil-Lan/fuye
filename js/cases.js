// 副业发现平台 - 案例数据整合加载
// 支持从多个案例文件加载数据

let allCases = [];
let casesByType = {};

// 案例类型映射
const caseFiles = {
  'task': { file: './data/cases_task.json', name: '任务型', icon: '📋' },
  'delivery': { file: './data/cases_delivery.json', name: '配送型', icon: '🛵' },
  'design': { file: './data/cases_design.json', name: '设计类', icon: '🎨' },
  'tech': { file: './data/cases_tech.json', name: '技术类', icon: '💻' },
  'writing': { file: './data/cases_writing.json', name: '写作类', icon: '✍️' },
  'video': { file: './data/cases_video.json', name: '视频/直播', icon: '🎬' },
  'ecommerce': { file: './data/cases_ecommerce.json', name: '电商类', icon: '🛒' },
  'failed': { file: './data/cases_failed.json', name: '失败被骗', icon: '⚠️' },
  'complaint': { file: './data/cases_complaint.json', name: '投诉维权', icon: '📢' },
  'startup': { file: './data/cases_startup.json', name: '创业成功', icon: '🚀' },
  'startup_failed': { file: './data/cases_startup_failed.json', name: '创业失败', icon: '💔' }
};

// 加载所有案例数据
async function loadAllCases() {
  const promises = Object.entries(caseFiles).map(async ([type, config]) => {
    try {
      const response = await fetch(config.file);
      if (!response.ok) return { type, cases: [], error: '加载失败' };
      
      const data = await response.json();
      let cases = data.案例列表 || data.投诉案例列表 || data || [];
      
      // 确保是数组
      if (!Array.isArray(cases)) {
        cases = [cases];
      }
      
      // 为每个案例添加类型信息
      cases = cases.map(c => ({
        ...c,
        _type: type,
        _typeName: config.name,
        _typeIcon: config.icon
      }));
      
      return { type, cases, config };
    } catch (error) {
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
    c.平台 === platformName ||
    c['平台/项目'] === platformName
  );
}

// 按收入范围筛选
function getCasesByIncomeRange(min, max) {
  return allCases.filter(c => {
    const income = c.monthly_income || c.月收入 || c.损失金额 || 0;
    return income >= min && income <= max;
  });
}

// 获取案例统计
function getCasesStats() {
  const stats = {
    total: allCases.length,
    byType: {}
  };
  
  Object.entries(casesByType).forEach(([type, data]) => {
    stats.byType[type] = {
      name: data.config?.name || type,
      count: data.cases.length
    };
  });
  
  return stats;
}

// 渲染案例卡片
function renderCaseCard(caseData, container) {
  const isFailed = caseData._type === 'failed';
  const isComplaint = caseData._type === 'complaint';
  
  const card = document.createElement('div');
  card.className = 'case-card' + (isFailed ? ' case-card-warning' : '');
  
  const income = caseData.monthly_income || caseData.月收入 || caseData.损失金额 || 0;
  const incomeLabel = isFailed ? '损失金额' : (isComplaint ? '损失金额' : '月收入');
  const platform = caseData.platform || caseData.平台 || caseData['平台/项目'] || '未知';
  
  card.innerHTML = `
    <div class="case-header">
      <span class="case-type-badge">${caseData._typeIcon} ${caseData._typeName}</span>
      <span class="case-platform">${platform}</span>
    </div>
    <div class="case-user">
      <span class="case-avatar">${(caseData.用户昵称 || '匿名').charAt(0)}</span>
      <div class="case-user-info">
        <div class="case-nickname">${caseData.用户昵称 || '匿名用户'}</div>
        <div class="case-profile">${caseData.用户画像 || caseData.city || caseData.城市 || ''}</div>
      </div>
    </div>
    <p class="case-experience">${(caseData.experience || caseData.经历详情 || '').substring(0, 150)}...</p>
    <div class="case-footer">
      <span class="case-income ${isFailed ? 'case-income-loss' : ''}">${incomeLabel}: <strong>${isFailed ? '-' : '+'}${income}元</strong></span>
      <span class="case-credibility">可信度: ${caseData.可信度 || caseData.credibility || 'B'}</span>
    </div>
  `;
  
  container.appendChild(card);
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

// 导出函数
window.CasesManager = {
  loadAllCases,
  getCasesByType,
  getRandomCases,
  getCasesByPlatform,
  getCasesByIncomeRange,
  getCasesStats,
  renderCaseCard,
  initCasesDisplay,
  getAllCases: () => allCases,
  getCasesByTypeData: () => casesByType
};
