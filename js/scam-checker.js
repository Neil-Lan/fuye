/**
 * AI骗局识别工具 - JavaScript逻辑
 * 智能检测项目描述中的风险关键词，给出风险等级和避坑建议
 */

// 获取基础路径（兼容GitHub Pages子目录部署）
const basePath = window.location.pathname.includes('/fuye/') ? '/fuye' : '';

// ==================== 风险关键词库 ====================
const RISK_KEYWORDS = {
  // 高危关键词 - 典型骗局特征
  high: [
    '先交钱', '保证金', '押金', '培训费', '加盟费', '入门费', '会员费',
    '日赚', '日入', '日挣', '日赚500', '日赚1000', '日赚300',
    '躺赚', '躺平赚钱', '睡觉赚钱', '躺着赚钱',
    '保本', '保本保息', '稳赚', '稳赚不赔', '百分百赚钱', '包赔',
    '投资返利', '高息理财', '年化收益', '本金翻倍',
    '内部消息', '内幕消息', '庄家带单', '老师带单',
    '刷单', '刷信誉', '做任务', '点赞', '关注',
    '零投资', '无需投资', '无本万利', '一本万利',
    '快速致富', '一夜暴富', '暴富机会', '翻身机会',
    '限时优惠', '名额有限', '最后机会', '错过后悔',
    '返本金', '退押金', '退培训费', '退会费',
    '官方授权', '正品保障', '授权代理', '独家授权',
    '区块链', '虚拟货币', '数字货币', '炒币',
    '原始股', '上市股票', '股票配资',
    '网络赌博', '博彩', '时时彩', '赛车',
    '返现', '高返', '刷返利', '购物返现'
  ],
  
  // 中危关键词 - 需要警惕
  medium: [
    '高回报', '高收益', '回报丰厚', '收益可观',
    '零风险', '几乎无风险', '风险极低',
    '快速回本', '短期回本', '快速回款',
    '独家渠道', '一手渠道', '特殊渠道',
    '内部名额', '限量名额', 'VIP名额', '优先名额',
    '轻松赚钱', '简单操作', '容易上手', '门槛低',
    '在家做', '兼职', '副业', '自由职业',
    '时间自由', '时间灵活', '弹性时间',
    '收入可观', '月入过万', '月入几千',
    '创业项目', '创富机会', '商机',
    '合伙人', '招募合作', '共同创业',
    '分销', '代理', '推广', '裂变',
    '团队扩张', '招募团队', '组建团队',
    '平台补贴', '平台奖励', '新人奖励',
    '佣金高', '提成高', '返佣比例',
    '自动化', '躺赢', '自动赚钱'
  ],
  
  // 可疑关键词 - 需要留意
  suspicious: [
    '兼职', '副业', '在家', '自由',
    '收入不错', '额外收入', '兼职收入',
    '补贴家用', '零花钱', '赚点外快',
    '第二职业', '斜杠青年', '副业刚需',
    '技能变现', '知识付费', '副业赚钱',
    '空闲时间', '利用时间', '碎片时间',
    '新人可做', '新手友好', '适合小白',
    '导师指导', '专业培训', '全程带教',
    '一件代发', '无货源', '低成本创业',
    '社交电商', '内容电商', '直播带货'
  ]
};

// ==================== 骗局案例库 ====================
const SCAM_CASES = {
  high: [
    {
      name: '刷单兼职骗局',
      desc: '以高额佣金为诱饵，先让受害人刷小单返利，获取信任后诱导大额刷单，最后以各种理由拒绝返款。',
      features: ['先交保证金', '刷单返利', '任务连环套']
    },
    {
      name: '配音培训骗局',
      desc: '声称配音行业火热，学完即可接单月入过万，诱导贷款缴纳高额培训费，课程质量差且无法接单。',
      features: ['高额培训费', '贷款分期', '承诺包就业']
    },
    {
      name: '投资理财骗局',
      desc: '通过社交平台建立信任，诱导受害人加入"投资群"，初期小赚后诱导加大投入，最后平台跑路。',
      features: ['高息诱惑', '老师带单', '群内托']
    },
    {
      name: '代理加盟骗局',
      desc: '夸大产品销路，收取高额加盟费或首批货款，提供的货物质次价高或根本卖不出去。',
      features: ['收取加盟费', '夸大收益', '货物积压']
    }
  ],
  medium: [
    {
      name: '无货源电商培训',
      desc: '声称零库存零风险，月入过万很轻松，实际上需要购买昂贵的课程，且平台规则变化快难以盈利。',
      features: ['高额课程费', '夸大宣传', '赚取学费']
    },
    {
      name: '拉新地推团队',
      desc: '招募地推人员做任务，承诺高单价高日结，实际上任务单价低、审核严格、佣金拖延。',
      features: ['任务量大', '审核严格', '结算拖延']
    },
    {
      name: '境外打工骗局',
      desc: '以高薪招聘境外工作人员为由，收取报名费、体检费、签证费等，最后不了了之或送去做非法工作。',
      features: ['高额收费', '证件押金', '境外风险']
    },
    {
      name: '直播带货培训',
      desc: '声称普通人也能直播带货月入过万，诱导购买培训课程，实际上直播带货竞争激烈，新人很难出头。',
      features: ['夸大收益', '课程费用', '淘汰率高']
    }
  ],
  suspicious: [
    {
      name: '问卷调查赚钱',
      desc: '一些平台声称做问卷调查轻松赚钱，实际上问卷数量少、单价低、审核严格，收益远低于宣传。',
      features: ['收益偏低', '审核严格', '问卷有限']
    },
    {
      name: '打字录入兼职',
      desc: '声称打字录入就能赚钱，实际上多为骗局，要么要求交押金，要么单子少得可怜。',
      features: ['押金陷阱', '单量稀少', '难以提现']
    }
  ]
};

// ==================== 示例描述 ====================
const EXAMPLE_DESCRIPTIONS = {
  1: `【急招】在家兼职刷单员，日薪300-800元
工作内容：帮商家刷销量、刷好评
薪资待遇：每单5-50元，日结
要求：时间自由，会用手机即可
先交200元保证金，做满20单退还
名额有限，抓紧报名！`,
  
  2: `🎙️ 配音兼职火热招募中！零基础可学！
某平台联合各大有声平台推出配音培训项目
承诺学完即可接单，月入5000-20000元
现在报名享受限时优惠，原价9980元，现价3980元
名额有限，扫码报名！`,
  
  3: `💰 【内部消息】高回报理财项目来了！
年化收益率24%-36%，保本保息
资金安全有保障，签订正式合同
老师带单操作，稳定盈利
限时加入，名额有限，先到先得！
首次投资满10万，额外返现5%`,
  
  4: `🔥 2026创业好项目，XX品牌全国招募代理！
无需经验，总部全程扶持
投资小、回报快、风险低
首批货款只需3万元，保证金5000元
厂家直供货源，一件代发
预期月入3-10万，轻松当老板！
现在加盟还送万元装修补贴`
};

// ==================== 核心分析函数 ====================

/**
 * 分析项目描述
 */
function analyzeProject() {
  const input = document.getElementById('project-input').value.trim();
  
  if (!input) {
    alert('请先输入项目描述');
    return;
  }
  
  if (input.length < 20) {
    alert('描述内容太短，请提供更详细的项目信息');
    return;
  }
  
  // 显示加载动画
  document.getElementById('loading-overlay').classList.add('show');
  document.getElementById('analyze-btn-text').textContent = '分析中...';
  
  // 模拟AI分析延迟
  setTimeout(() => {
    const result = performAnalysis(input);
    displayResult(result);
    
    // 隐藏加载动画
    document.getElementById('loading-overlay').classList.remove('show');
    document.getElementById('analyze-btn-text').textContent = '重新分析';
  }, 1500);
}

/**
 * 执行分析
 */
function performAnalysis(text) {
  const normalizedText = text.toLowerCase();
  let highRiskCount = 0;
  let mediumRiskCount = 0;
  let suspiciousCount = 0;
  let detectedHighKeywords = [];
  let detectedMediumKeywords = [];
  let detectedSuspiciousKeywords = [];
  
  // 检测高危关键词
  RISK_KEYWORDS.high.forEach(keyword => {
    if (normalizedText.includes(keyword.toLowerCase()) || text.includes(keyword)) {
      highRiskCount++;
      if (!detectedHighKeywords.includes(keyword)) {
        detectedHighKeywords.push(keyword);
      }
    }
  });
  
  // 检测中危关键词
  RISK_KEYWORDS.medium.forEach(keyword => {
    if (normalizedText.includes(keyword.toLowerCase()) || text.includes(keyword)) {
      mediumRiskCount++;
      if (!detectedMediumKeywords.includes(keyword)) {
        detectedMediumKeywords.push(keyword);
      }
    }
  });
  
  // 检测可疑关键词
  RISK_KEYWORDS.suspicious.forEach(keyword => {
    if (normalizedText.includes(keyword.toLowerCase()) || text.includes(keyword)) {
      suspiciousCount++;
      if (!detectedSuspiciousKeywords.includes(keyword)) {
        detectedSuspiciousKeywords.push(keyword);
      }
    }
  });
  
  // 计算风险评分 (0-100)
  let riskScore = 0;
  riskScore += highRiskCount * 25;
  riskScore += mediumRiskCount * 10;
  riskScore += suspiciousCount * 3;
  riskScore = Math.min(100, riskScore);
  
  // 确定风险等级
  let riskLevel, riskIcon, riskLabel;
  if (highRiskCount >= 3 || riskScore >= 70) {
    riskLevel = 'high';
    riskIcon = '🚨';
    riskLabel = '高危风险';
  } else if (highRiskCount >= 1 || mediumRiskCount >= 3 || riskScore >= 40) {
    riskLevel = 'medium';
    riskIcon = '⚠️';
    riskLabel = '中危风险';
  } else if (mediumRiskCount >= 1 || suspiciousCount >= 3 || riskScore >= 15) {
    riskLevel = 'suspicious';
    riskIcon = '🤔';
    riskLabel = '可疑项目';
  } else {
    riskLevel = 'safe';
    riskIcon = '✅';
    riskLabel = '暂未发现明显风险';
  }
  
  // 生成风险分析
  const analysis = generateAnalysis(text, {
    highRiskCount,
    mediumRiskCount,
    suspiciousCount,
    detectedHighKeywords,
    detectedMediumKeywords,
    detectedSuspiciousKeywords
  });
  
  // 生成建议
  const advice = generateAdvice(riskLevel, {
    detectedHighKeywords,
    detectedMediumKeywords,
    detectedSuspiciousKeywords
  });
  
  // 选择类似骗局案例
  const similarScams = getSimilarScams(riskLevel, text);
  
  return {
    riskLevel,
    riskIcon,
    riskLabel,
    riskScore,
    highRiskCount,
    mediumRiskCount,
    suspiciousCount,
    detectedHighKeywords,
    detectedMediumKeywords,
    detectedSuspiciousKeywords,
    analysis,
    advice,
    similarScams
  };
}

/**
 * 生成风险分析
 */
function generateAnalysis(text, detection) {
  const analysis = [];
  const { detectedHighKeywords, detectedMediumKeywords, detectedSuspiciousKeywords } = detection;
  
  // 高危分析
  if (detectedHighKeywords.length > 0) {
    analysis.push({
      level: 'high',
      text: `检测到 ${detectedHighKeywords.length} 个高危关键词：${detectedHighKeywords.slice(0, 5).join('、')}${detectedHighKeywords.length > 5 ? '...' : ''}。这些词汇是诈骗分子最常用的诱导手段。`
    });
    
    if (detectedHighKeywords.some(k => ['先交钱', '保证金', '押金', '培训费', '加盟费'].includes(k))) {
      analysis.push({
        level: 'high',
        text: '⚠️ 任何要求你先交钱的项目都应该高度警惕！正规平台不会收取任何保证金或入门费用。'
      });
    }
    
    if (detectedHighKeywords.some(k => ['日赚', '躺赚', '保本', '稳赚'].includes(k))) {
      analysis.push({
        level: 'high',
        text: '⚠️ "日赚XXX"、"躺赚"、"保本"等宣传严重违背商业规律。天上不会掉馅饼，高收益必然伴随高风险。'
      });
    }
    
    if (detectedHighKeywords.some(k => ['刷单', '刷信誉', '做任务'].includes(k))) {
      analysis.push({
        level: 'high',
        text: '⚠️ 刷单本身就是违法行为（违反《反不正当竞争法》），且绝大多数刷单都是诈骗。'
      });
    }
  }
  
  // 中危分析
  if (detectedMediumKeywords.length > 0) {
    analysis.push({
      level: 'medium',
      text: `检测到 ${detectedMediumKeywords.length} 个中危关键词：${detectedMediumKeywords.slice(0, 5).join('、')}${detectedMediumKeywords.length > 5 ? '...' : ''}。这些表述可能存在夸大或误导。`
    });
  }
  
  // 可疑分析
  if (detectedSuspiciousKeywords.length > 0 && detectedHighKeywords.length === 0 && detectedMediumKeywords.length === 0) {
    analysis.push({
      level: 'medium',
      text: `检测到 ${detectedSuspiciousKeywords.length} 个可疑表述，建议进一步核实项目真实性后再做决定。`
    });
  }
  
  // 综合判断
  if (detection.highRiskCount >= 2 && detection.mediumRiskCount >= 2) {
    analysis.push({
      level: 'high',
      text: '🚨 综合判断：该项目同时具备多个高危和中危特征，诈骗可能性极高，请务必远离！'
    });
  } else if (detection.highRiskCount >= 1 && detection.mediumRiskCount >= 1) {
    analysis.push({
      level: 'medium',
      text: '⚠️ 综合判断：该项目存在一定风险，请谨慎考虑，建议先了解更多细节再做决定。'
    });
  } else if (detection.highRiskCount === 0 && detection.mediumRiskCount === 0) {
    analysis.push({
      level: 'suspicious',
      text: '✅ 该项目描述中未发现明显的诈骗话术，但仍建议通过正规渠道核实项目真实性。'
    });
  }
  
  return analysis;
}

/**
 * 生成安全建议
 */
function generateAdvice(riskLevel, detection) {
  const advice = [];
  const { detectedHighKeywords, detectedMediumKeywords } = detection;
  
  // 通用建议
  advice.push({
    icon: '🔍',
    text: '多方核实项目信息，查看企业工商注册、相关资质和用户评价'
  });
  
  advice.push({
    icon: '📱',
    text: '通过官方渠道了解项目，不要轻信社交媒体上的陌生人推荐'
  });
  
  // 高危建议
  if (riskLevel === 'high') {
    advice.push({
      icon: '🚫',
      text: '立即停止进一步接触，不要签署任何合同或支付任何费用'
    });
    
    if (detectedHighKeywords.some(k => ['保证金', '押金', '培训费', '加盟费'].includes(k))) {
      advice.push({
        icon: '💰',
        text: '如已付款，请保留所有凭证（聊天记录、转账记录等），尽快报警'
      });
    }
    
    advice.push({
      icon: '📢',
      text: '可将此类信息举报至12315消费者投诉热线或国家反诈中心'
    });
    
    advice.push({
      icon: '🔗',
      text: '在我们平台查看正规平台推荐，寻找替代的合法副业机会'
    });
  }
  
  // 中危建议
  if (riskLevel === 'medium') {
    advice.push({
      icon: '⏳',
      text: '不要急于做决定，建议观望一段时间，关注项目方的动态'
    });
    
    advice.push({
      icon: '💬',
      text: '尝试联系已参与该项目的人，了解真实收益情况'
    });
    
    advice.push({
      icon: '📋',
      text: '如决定尝试，建议从小额开始，不要一次性投入大量资金'
    });
  }
  
  // 可疑建议
  if (riskLevel === 'suspicious') {
    advice.push({
      icon: '✅',
      text: '项目描述暂无明显异常，但仍建议保持警惕'
    });
    
    advice.push({
      icon: '🔎',
      text: '了解清楚收益来源和商业模式，合法的项目应该有清晰的盈利逻辑'
    });
  }
  
  return advice;
}

/**
 * 获取类似骗局案例
 */
function getSimilarScams(riskLevel, text) {
  let cases = [];
  const normalizedText = text.toLowerCase();
  
  // 根据关键词匹配套餐
  if (normalizedText.includes('配音') || normalizedText.includes('声音') || normalizedText.includes('主播')) {
    cases.push(SCAM_CASES.high.find(c => c.name === '配音培训骗局'));
  }
  
  if (normalizedText.includes('投资') || normalizedText.includes('理财') || normalizedText.includes('返利')) {
    cases.push(SCAM_CASES.high.find(c => c.name === '投资理财骗局'));
  }
  
  if (normalizedText.includes('刷单') || normalizedText.includes('刷信誉')) {
    cases.push(SCAM_CASES.high.find(c => c.name === '刷单兼职骗局'));
  }
  
  if (normalizedText.includes('加盟') || normalizedText.includes('代理')) {
    cases.push(SCAM_CASES.high.find(c => c.name === '代理加盟骗局'));
  }
  
  if (normalizedText.includes('电商') || normalizedText.includes('无货源')) {
    cases.push(SCAM_CASES.medium.find(c => c.name === '无货源电商培训'));
  }
  
  if (normalizedText.includes('直播') || normalizedText.includes('带货')) {
    cases.push(SCAM_CASES.medium.find(c => c.name === '直播带货培训'));
  }
  
  if (normalizedText.includes('问卷') || normalizedText.includes('调查')) {
    cases.push(SCAM_CASES.suspicious.find(c => c.name === '问卷调查赚钱'));
  }
  
  if (normalizedText.includes('打字') || normalizedText.includes('录入')) {
    cases.push(SCAM_CASES.suspicious.find(c => c.name === '打字录入兼职'));
  }
  
  // 去重
  cases = cases.filter(c => c !== undefined);
  
  // 如果没有匹配，添加默认案例
  if (cases.length === 0) {
    if (riskLevel === 'high') {
      cases = SCAM_CASES.high.slice(0, 2);
    } else if (riskLevel === 'medium') {
      cases = SCAM_CASES.medium.slice(0, 2);
    } else {
      cases = SCAM_CASES.suspicious.slice(0, 2);
    }
  }
  
  return cases.slice(0, 3);
}

// ==================== 显示结果 ====================

/**
 * 显示分析结果
 */
function displayResult(result) {
  const resultSection = document.getElementById('result-section');
  resultSection.classList.add('show');
  
  // 滚动到结果区域
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
  // 风险等级卡片
  const riskCard = document.getElementById('risk-level-card');
  const riskIcon = document.getElementById('risk-icon');
  const riskLabel = document.getElementById('risk-label');
  const riskScore = document.getElementById('risk-score');
  
  riskIcon.textContent = result.riskIcon;
  riskIcon.className = `risk-level ${result.riskLevel}`;
  riskLabel.textContent = result.riskLabel;
  riskLabel.className = `risk-level-label`;
  
  let scoreIcon, scoreText;
  if (result.riskLevel === 'high') {
    scoreIcon = '🚨';
    scoreText = '风险评分';
  } else if (result.riskLevel === 'medium') {
    scoreIcon = '⚠️';
    scoreText = '风险评分';
  } else if (result.riskLevel === 'suspicious') {
    scoreIcon = '🤔';
    scoreText = '建议关注';
  } else {
    scoreIcon = '✅';
    scoreText = '暂无异常';
  }
  riskScore.innerHTML = `<span>${scoreIcon}</span><span>${scoreText}：${result.riskScore}分</span>`;
  
  // 关键词检测
  const keywordsContent = document.getElementById('keywords-content');
  let keywordsHTML = '';
  
  if (result.detectedHighKeywords.length > 0) {
    keywordsHTML += `
      <div class="keyword-group">
        <div class="keyword-group-title high">
          <span>🚨</span> 高危关键词（${result.detectedHighKeywords.length}个）
        </div>
        <div class="keyword-list">
          ${result.detectedHighKeywords.map(k => `<span class="keyword-tag high">${k}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (result.detectedMediumKeywords.length > 0) {
    keywordsHTML += `
      <div class="keyword-group">
        <div class="keyword-group-title medium">
          <span>⚠️</span> 中危关键词（${result.detectedMediumKeywords.length}个）
        </div>
        <div class="keyword-list">
          ${result.detectedMediumKeywords.map(k => `<span class="keyword-tag medium">${k}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (result.detectedSuspiciousKeywords.length > 0) {
    keywordsHTML += `
      <div class="keyword-group">
        <div class="keyword-group-title suspicious">
          <span>🤔</span> 可疑关键词（${result.detectedSuspiciousKeywords.length}个）
        </div>
        <div class="keyword-list">
          ${result.detectedSuspiciousKeywords.map(k => `<span class="keyword-tag suspicious">${k}</span>`).join('')}
        </div>
      </div>
    `;
  }
  
  if (result.detectedHighKeywords.length === 0 && 
      result.detectedMediumKeywords.length === 0 && 
      result.detectedSuspiciousKeywords.length === 0) {
    keywordsHTML = '<p style="color: var(--text-secondary);">未检测到明显的风险关键词</p>';
  }
  
  keywordsContent.innerHTML = keywordsHTML;
  
  // 风险分析
  const analysisList = document.getElementById('analysis-list');
  analysisList.innerHTML = result.analysis.map(item => `
    <li class="analysis-item ${item.level}">${item.text}</li>
  `).join('');
  
  // 安全建议
  const adviceList = document.getElementById('advice-list');
  adviceList.innerHTML = result.advice.map(item => `
    <li class="advice-item">
      <span class="icon">${item.icon}</span>
      <span>${item.text}</span>
    </li>
  `).join('');
  
  // 类似骗局
  const similarScamsList = document.getElementById('similar-scams-list');
  similarScamsList.innerHTML = result.similarScams.map(scam => `
    <div class="scam-card">
      <div class="scam-card-title">
        <span>⚠️</span>
        ${scam.name}
      </div>
      <div class="scam-card-desc">${scam.desc}</div>
    </div>
  `).join('');
}

// ==================== 辅助函数 ====================

/**
 * 填充示例
 */
function fillExample(num) {
  const exampleText = EXAMPLE_DESCRIPTIONS[num];
  if (exampleText) {
    document.getElementById('project-input').value = exampleText;
  }
}

/**
 * 重置
 */
function resetChecker() {
  document.getElementById('project-input').value = '';
  document.getElementById('result-section').classList.remove('show');
  document.getElementById('analyze-btn-text').textContent = '开始分析';
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
  console.log('AI骗局识别工具已加载');
});
