// 副业避坑导航 - 副业匹配页JavaScript (优化版)
// 获取基础路径（兼容GitHub Pages子目录部署）
const basePath = window.location.pathname.includes('/fuye/') ? '/fuye' : '';

// ==================== 全局变量 ====================
let matchingRules = null;
let platformsData = [];
let currentQuestion = 0;
let userAnswers = {};
let alternativePlatforms = []; // 备选平台列表
let recommendedPlatformsList = []; // 当前推荐列表

// 当前Tab状态（供外部修改）
window.currentMatchTab = 'fuye';

// ==================== 初始化 ====================
async function initMatch() {
  try {
    const [rulesRes, platformsRes] = await Promise.all([
      fetch(`${basePath}/data/matching_rules.json`),
      fetch(`${basePath}/data/platforms.json`)
    ]);
    
    matchingRules = await rulesRes.json();
    
    // 解析平台数据（字典结构转数组）
    const platformsDict = await platformsRes.json();
    platformsData = [];
    const categories = ['大厂平台', '技能平台', '内容平台'];
    categories.forEach(cat => {
      if (platformsDict[cat] && Array.isArray(platformsDict[cat])) {
        platformsData = platformsData.concat(platformsDict[cat]);
      }
    });
    
    console.log('匹配数据加载成功: 平台', platformsData.length, '个');
    
    // 只有在副业Tab时才渲染问卷
    if (window.currentMatchTab === 'fuye') {
      renderQuestion();
    }
  } catch (error) {
    console.error('加载匹配规则失败:', error);
    document.getElementById('quiz-container').innerHTML = '<p class="text-muted text-center">数据加载失败</p>';
  }
}

// 重新初始化副业匹配（供外部调用）
function reinitMatch() {
  currentQuestion = 0;
  userAnswers = {};
  renderQuestion();
}

// 渲染当前题目
function renderQuestion() {
  const container = document.getElementById('quiz-container');
  const questions = matchingRules?.问卷题目 || [];
  
  if (currentQuestion >= questions.length) {
    showResult();
    return;
  }
  
  const q = questions[currentQuestion];
  const progress = Math.round((currentQuestion / questions.length) * 100);
  
  container.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width: ${progress}%"></div>
      </div>
      <span class="quiz-progress-text">${currentQuestion + 1}/${questions.length}</span>
    </div>
    
    <div class="quiz-question">
      <h3>${q.题目编号}. ${q.题目}</h3>
      <div class="quiz-options">
        ${q.选项.map((opt, idx) => `
          <label class="quiz-option ${userAnswers[q.题目编号] === idx ? 'selected' : ''}" data-index="${idx}">
            <input type="radio" name="question_${q.题目编号}" value="${idx}" ${userAnswers[q.题目编号] === idx ? 'checked' : ''}>
            <span>${opt.选项}</span>
          </label>
        `).join('')}
      </div>
    </div>
    
    <div class="quiz-nav">
      ${currentQuestion > 0 ? `
        <button class="btn btn-outline" onclick="prevQuestion()">← 上一题</button>
      ` : '<div></div>'}
      <button class="btn btn-primary" onclick="nextQuestion()" ${userAnswers[q.题目编号] === undefined ? 'disabled style="opacity:0.5"' : ''}>
        ${currentQuestion === questions.length - 1 ? '查看结果 →' : '下一题 →'}
      </button>
    </div>
  `;
  
  // 绑定选项点击事件
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const idx = parseInt(opt.dataset.index);
      const q = questions[currentQuestion];
      userAnswers[q.题目编号] = idx;
      userAnswers[q.题目编号 + '_label'] = q.选项[idx].标签;
      renderQuestion();
    });
  });
}

// 上一题
function prevQuestion() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
  }
}

// 下一题
function nextQuestion() {
  const questions = matchingRules?.问卷题目 || [];
  const q = questions[currentQuestion];
  
  if (userAnswers[q.题目编号] === undefined) {
    alert('请选择一个选项');
    return;
  }
  
  currentQuestion++;
  renderQuestion();
}

// 获取所有平台数据
function getAllPlatforms() {
  const allPlatforms = [];
  if (platformsData && typeof platformsData === 'object') {
    Object.values(platformsData).forEach(category => {
      if (Array.isArray(category)) {
        allPlatforms.push(...category);
      }
    });
  }
  return allPlatforms;
}

// 获取平台状态标签
function getPlatformStatus(platform) {
  // 根据平台名称判断状态
  const statusMap = {
    '腾讯搜活帮': { status: 'normal', label: '正常运营' },
    '美团众包': { status: 'normal', label: '正常运营' },
    '蜂鸟众包（饿了么）': { status: 'normal', label: '正常运营' },
    '顺丰同城': { status: 'warning', label: '抽佣较高' },
    '达达快送（京东秒送）': { status: 'warning', label: '需保证金' },
    '斗米兼职': { status: 'normal', label: '正常运营' },
    '兼职猫': { status: 'normal', label: '正常运营' },
    '阿里众包': { status: 'closed', label: '已停运' },
    '字节Xpert': { status: 'warning', label: '门槛极高' },
    '京东微工': { status: 'warning', label: '问题较多' },
    '猪八戒网': { status: 'warning', label: '争议较多' },
    '程序员客栈': { status: 'normal', label: '正常运营' },
    '码市': { status: 'normal', label: '正常运营' },
    'Upwork（国际自由职业平台）': { status: 'normal', label: '正常运营' },
    'Fiverr（国际微任务平台）': { status: 'normal', label: '正常运营' },
    'Toptal（高端自由职业平台）': { status: 'normal', label: '正常运营' },
    '小红书': { status: 'normal', label: '正常运营' },
    '知乎': { status: 'normal', label: '正常运营' },
    '公众号': { status: 'normal', label: '正常运营' },
    '抖音': { status: 'normal', label: '正常运营' },
    'B站（哔哩哔哩）': { status: 'normal', label: '正常运营' },
    '西瓜视频': { status: 'normal', label: '正常运营' },
    '稿定设计': { status: 'normal', label: '正常运营' },
    '包图网': { status: 'normal', label: '正常运营' },
    '喜马拉雅': { status: 'normal', label: '正常运营' },
    'Keep': { status: 'normal', label: '正常运营' },
    '闲鱼副业': { status: 'normal', label: '正常运营' },
    '拼多多': { status: 'normal', label: '正常运营' },
    '一品威客': { status: 'warning', label: '整体没落' }
  };
  return statusMap[platform.平台名称] || { status: 'normal', label: '正常运营' };
}

// 计算匹配度
function calculateMatchScore(platform, profile) {
  let score = 0;
  let reasons = [];
  
  const platformTags = platform.人群标签 || {};
  const timeMatch = platform.时间匹配 || '';
  const skillMatch = platform.技能匹配 || '';
  
  // 时间匹配
  if (profile.timeTag === '碎片时间' && (timeMatch.includes('碎片') || timeMatch.includes('灵活'))) {
    score += 30;
    reasons.push('时间投入灵活，适合碎片化操作');
  } else if (profile.timeTag === '整块时间' && (timeMatch.includes('整块') || timeMatch.includes('固定'))) {
    score += 30;
    reasons.push('适合整块时间投入');
  } else if (profile.timeTag === '全职投入' && timeMatch.includes('全职')) {
    score += 30;
    reasons.push('支持全职/长期投入');
  }
  
  // 技能匹配
  if (profile.skillTag === '无技能' && (skillMatch.includes('无要求') || skillMatch.includes('零基础'))) {
    score += 30;
    reasons.push('零基础可做');
  } else if (profile.skillTag === '设计技能' && (skillMatch.includes('设计') || skillMatch.includes('美工'))) {
    score += 35;
    reasons.push('设计技能可以发挥');
  } else if (profile.skillTag === '技术技能' && (skillMatch.includes('技术') || skillMatch.includes('编程'))) {
    score += 35;
    reasons.push('技术能力是核心竞争力');
  } else if (profile.skillTag === '写作技能' && (skillMatch.includes('写作') || skillMatch.includes('文案'))) {
    score += 35;
    reasons.push('写作能力是优势');
  } else if (profile.skillTag === '视频技能' && (skillMatch.includes('视频') || skillMatch.includes('剪辑'))) {
    score += 35;
    reasons.push('视频制作能力匹配');
  }
  
  // 设备匹配
  if (profile.deviceTag === '手机用户' && (platform.设备匹配 || '').includes('手机')) {
    score += 20;
  } else if (profile.deviceTag === '电脑用户' && (platform.设备匹配 || '').includes('电脑')) {
    score += 20;
  } else if (profile.deviceTag === '专业设备用户') {
    score += 10;
  }
  
  // 英语加成
  if ((profile.englishTag === '英语强' || profile.englishTag === '英语精通') && platform.官网地址?.includes('http')) {
    if (platform.平台名称?.includes('Upwork') || platform.平台名称?.includes('Fiverr') || platform.平台名称?.includes('Toptal')) {
      score += 20;
      reasons.push('英语优势可获得更高收入');
    }
  }
  
  // 收入预期匹配
  const incomeStr = platform.收入范围 || platform.月薪_新手 || '';
  if (profile.incomeTag === '低收入预期' && incomeStr) {
    score += 10;
  } else if ((profile.incomeTag === '较高收入预期' || profile.incomeTag === '高收入预期') && incomeStr.includes('5000')) {
    score += 10;
  }
  
  // 户外偏好匹配
  if (profile.outdoorTag === '可户外' && platform.平台类型?.includes('配送')) {
    score += 15;
    reasons.push('户外工作类型匹配');
  }
  
  // 发展倾向匹配
  if (profile.focusTag === '长期发展') {
    if (['小红书', '知乎', '微信公众号', 'B站（哔哩哔哩）', '抖音'].includes(platform.平台名称)) {
      score += 15;
      reasons.push('内容创作适合长期积累');
    }
  }
  
  // 限制最高分
  score = Math.min(score, 100);
  
  return { score, reasons };
}

// 过滤正常运营的平台
function filterActivePlatforms(platforms) {
  const inactivePlatforms = ['阿里众包', '京东微工', '字节Xpert', '甜薪工场'];
  return platforms.filter(p => !inactivePlatforms.includes(p.平台名称));
}

// 计算匹配结果（增强版）
function calculateMatch() {
  const rules = matchingRules?.匹配规则 || {};
  const profiles = matchingRules?.用户画像分类 || {};
  const allPlatforms = getAllPlatforms();
  const activePlatforms = filterActivePlatforms(allPlatforms);
  
  // 分析用户画像
  const timeTag = userAnswers['Q1_label'] || '';
  const skillTag = userAnswers['Q2_label'] || '';
  const incomeTag = userAnswers['Q3_label'] || '';
  const outdoorTag = userAnswers['Q4_label'] || '';
  const deviceTag = userAnswers['Q5_label'] || '';
  const focusTag = userAnswers['Q6_label'] || '';
  const englishTag = userAnswers['Q7_label'] || '';
  
  const profile = {
    timeTag, skillTag, incomeTag, outdoorTag, deviceTag, focusTag, englishTag
  };
  
  let recommendedPlatforms = [];
  let reason = '';
  let expectedIncome = '';
  let warnings = [];
  let matchDetails = [];
  
  // ===== 预期收入校验 =====
  if ((timeTag === '碎片时间') && (incomeTag === '较高收入预期' || incomeTag === '高收入预期')) {
    warnings.push('⚠️ 每天投入1-3小时很难达到月入3000+，建议调整预期或增加时间投入');
  }
  if (skillTag === '无技能' && (incomeTag === '较高收入预期' || incomeTag === '高收入预期')) {
    warnings.push('⚠️ 无特殊技能很难达到高收入，建议先学习一项技能或降低预期');
  }
  
  // ===== 增强版匹配规则 =====
  
  // 1. 外卖配送场景（整块时间+户外+高收入期望）
  if ((timeTag === '整块时间' || timeTag === '全职投入') && outdoorTag === '可户外' && (deviceTag === '手机用户' || deviceTag === '电脑用户')) {
    recommendedPlatforms = ['美团众包', '蜂鸟众包（饿了么）', '顺丰同城', '达达快送（京东秒送）'];
    reason = '你有整块时间且愿意户外工作，外卖配送是收入最高的选择，高峰期月入可达5000-8000元';
    expectedIncome = '3000-6000元/月（熟练后可达8000+）';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: '时间灵活+户外工作完美匹配'
    }));
  }
  // 2. 零基础碎片时间场景
  else if ((timeTag === '碎片时间') && outdoorTag === '室内优先' && (deviceTag === '手机用户' || deviceTag === '电脑用户') && skillTag === '无技能') {
    recommendedPlatforms = ['腾讯搜活帮', '斗米兼职'];
    reason = '碎片时间+室内工作+零基础，推荐从简单的任务型平台开始，逐步积累经验。注意：2026年众包平台任务量下降，预期收入可能较低。';
    expectedIncome = '300-800元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name === '腾讯搜活帮' ? '腾讯官方平台，结算有保障，适合新手入门（但任务稀少）' : '任务类型丰富，可灵活选择'
    }));
  }
  // 3. 设计技能场景
  else if ((timeTag === '整块时间' || timeTag === '全职投入') && skillTag === '设计技能' && (incomeTag === '较高收入预期' || incomeTag === '高收入预期')) {
    recommendedPlatforms = ['稿定设计', '包图网', '小红书'];
    reason = '你有设计技能，专业变现渠道。注意：威客平台整体没落，建议优先考虑入驻设计平台或自己做IP。';
    expectedIncome = '2000-8000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name === '稿定设计' ? '模板设计变现，需求稳定' : name === '包图网' ? '素材模板销售，边际成本低' : '设计博主IP打造，长期价值高'
    }));
  }
  // 4. 技术编程场景
  else if ((timeTag === '整块时间' || timeTag === '全职投入') && skillTag === '技术技能' && (incomeTag === '较高收入预期' || incomeTag === '高收入预期')) {
    recommendedPlatforms = ['程序员客栈', '码市', 'Upwork（国际自由职业平台）'];
    reason = '你有编程技能，技术外包收入高且稳定。国内外包平台竞争激烈，有英语能力建议优先考虑Upwork国际平台。';
    expectedIncome = '5000-20000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name === '程序员客栈' ? '国内领先程序媛/猿外包平台' : name === '码市' ? '专注技术外包，订单质量高' : '国际平台，单价高，结算是美元'
    }));
  }
  // 5. 写作技能+长期发展
  else if ((timeTag === '整块时间' || timeTag === '全职投入') && skillTag === '写作技能' && (incomeTag === '较高收入预期' || incomeTag === '高收入预期') && (focusTag === '长期发展' || focusTag === '平衡')) {
    recommendedPlatforms = ['小红书', '知乎', '公众号', '喜马拉雅'];
    reason = '你有写作能力，内容创作可积累长期价值。选择一个平台深耕，3-6个月后收入会稳定增长。';
    expectedIncome = '前期积累期，3-12个月后可达3000-10000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name === '小红书' ? '流量大，新人友好，适合图文笔记' : name === '知乎' ? '专业内容变现，知识付费潜力大' : name === '公众号' ? '私域积累，长期价值高' : '音频内容变现，竞争相对较小'
    }));
  }
  // 6. 视频技能场景
  else if ((timeTag === '整块时间' || timeTag === '全职投入') && skillTag === '视频技能' && (deviceTag === '电脑用户' || deviceTag === '专业设备用户')) {
    recommendedPlatforms = ['抖音', 'B站（哔哩哔哩）', '西瓜视频'];
    reason = '你有视频能力，视频平台变现潜力大。需要持续输出高质量内容，前期收入不稳定，做好长期坚持的准备。';
    expectedIncome = '需要3-6个月积累期，后期可达5000-50000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name === '抖音' ? '流量最大，变现渠道最多（带货/广告/直播）' : name === 'B站（哔哩哔哩）' ? '用户粘性高，创作激励计划收益好' : '中视频计划收益可观'
    }));
  }
  // 7. 英语优势国际平台
  else if (englishTag === '英语强' || englishTag === '英语精通') {
    recommendedPlatforms = ['Upwork（国际自由职业平台）', 'Fiverr（国际微任务平台）', 'Toptal（高端自由职业平台）'];
    reason = '你英语好，国际平台收入更高。同样技能在国际平台报酬是国内3-10倍。';
    expectedIncome = '5000-30000元/月（美元结算更高）';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name.includes('Upwork') ? '全球最大自由职业平台，订单量大' : name.includes('Fiverr') ? '适合新手，技能变现门槛低' : '高端技术人才平台，单价最高'
    }));
  }
  // 8. 短期收益+无技能
  else if (focusTag === '短期收益' && skillTag === '无技能') {
    recommendedPlatforms = ['腾讯搜活帮', '美团众包', '闲鱼副业'];
    reason = '想快速看到收益，推荐任务型和交易型平台。闲鱼卖闲置或代购也不错。';
    expectedIncome = '500-2000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name === '腾讯搜活帮' ? '任务简单，当日可见收益' : name === '美团众包' ? '多劳多得，次日结算' : '卖闲置物品，零成本启动'
    }));
  }
  // 9. 全职投入+高收入期望
  else if ((timeTag === '整块时间' || timeTag === '全职投入') && (incomeTag === '较高收入预期' || incomeTag === '高收入预期')) {
    recommendedPlatforms = ['程序员客栈', '小红书', '抖音', '美团众包'];
    reason = '全职投入追求高收入，推荐技能型和流量型平台。根据你的技能选择合适的赛道。';
    expectedIncome = '3000-15000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: '全职投入可获得更高收益'
    }));
  }
  // 10. 专业设备用户
  else if (deviceTag === '专业设备用户') {
    if (skillTag === '视频技能' || skillTag === '其他技能') {
      recommendedPlatforms = ['抖音', 'B站（哔哩哔哩）', '小红书'];
      reason = '你有专业设备，可以制作更高质量的内容。建议做视频或摄影类账号。';
      expectedIncome = '5000-30000元/月';
      matchDetails = recommendedPlatforms.map(name => ({
        name,
        matchReason: '专业设备能制作更高质量内容，获得更多流量'
      }));
    } else {
      recommendedPlatforms = ['闲鱼副业', '小红书'];
      reason = '专业设备可用于出租或制作教程内容变现。';
      expectedIncome = '1000-5000元/月';
      matchDetails = recommendedPlatforms.map(name => ({
        name,
        matchReason: '设备可变现'
      }));
    }
  }
  // 11. 平衡型用户
  else if (focusTag === '平衡') {
    recommendedPlatforms = ['小红书', '腾讯搜活帮', '闲鱼副业'];
    reason = '兼顾短期收益和长期发展，推荐「主业+副业」双轨模式。';
    expectedIncome = '短期1000-2000元/月，长期可达5000+';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: '兼顾收益稳定性'
    }));
  }
  // 12. 其他技能
  else if (skillTag === '其他技能') {
    recommendedPlatforms = ['斗米兼职', '小红书', '闲鱼副业'];
    reason = '你有特殊技能，可以在内容平台展示或到兼职平台接单。';
    expectedIncome = '2000-5000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: '技能变现渠道'
    }));
  }
  // 13. 大学生场景
  else if (skillTag === '无技能' && incomeTag === '低收入预期' && timeTag === '碎片时间') {
    recommendedPlatforms = ['腾讯搜活帮', '闲鱼副业'];
    reason = '学生党推荐，从简单的任务型平台开始，赚零花钱的同时可以学习新技能。';
    expectedIncome = '300-1000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name === '腾讯搜活帮' ? '碎片时间操作，赚零花钱' : '卖闲置/代购，练手电商'
    }));
  }
  // 14. 宝妈场景
  else if (skillTag === '无技能' && timeTag === '碎片时间' && deviceTag === '手机用户') {
    recommendedPlatforms = ['腾讯搜活帮', '小红书', '闲鱼副业'];
    reason = '碎片时间+手机操作，推荐适合宝妈的灵活副业。可以做内容分享或简单任务。';
    expectedIncome = '500-2000元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: name === '腾讯搜活帮' ? '任务简单，时间灵活' : name === '小红书' ? '分享育儿/生活，吸引同频粉丝' : '卖母婴用品/闲置'
    }));
  }
  // ===== 默认兜底推荐 =====
  else {
    recommendedPlatforms = ['腾讯搜活帮', '小红书', '美团众包'];
    reason = '根据你的情况，推荐从简单任务型平台开始，逐步积累经验。注意：2026年众包行业整体下滑，预期收入可能较低。';
    expectedIncome = '300-1500元/月';
    matchDetails = recommendedPlatforms.map(name => ({
      name,
      matchReason: '适合入门的平台'
    }));
  }
  
  // 计算每个推荐平台的详细信息
  const platformDetails = recommendedPlatforms.map(name => {
    const p = allPlatforms.find(pl => pl.平台名称 === name);
    const status = getPlatformStatus({ 平台名称: name });
    const matchInfo = matchDetails.find(m => m.name === name) || { matchReason: '' };
    const matchScore = p ? calculateMatchScore(p, profile) : { score: 70, reasons: [] };
    
    // 获取平台的优点和缺点摘要
    const pros = p?.优点?.slice(0, 2) || [];
    const cons = p?.缺点?.slice(0, 2) || [];
    
    return p ? {
      name: p.平台名称,
      type: p.平台类型 || '任务型',
      income: p.收入范围 || p.时薪范围 || '-',
      difficulty: p.入门难度 || '⭐',
      status: status.status,
      statusLabel: status.label,
      matchReason: matchInfo.matchReason || matchScore.reasons[0] || '',
      matchScore: matchScore.score,
      pros: pros,
      cons: cons,
      url: p.官网地址 || `platform-detail.html?id=${encodeURIComponent(name)}`,
      howToStart: getHowToStart(p),
      dataCredibility: p.数据可信度?.整体等级 || 'B'
    } : { 
      name, 
      type: '未知', 
      income: '-', 
      difficulty: '未知',
      status: 'normal',
      statusLabel: '正常运营',
      matchReason: '',
      matchScore: 60,
      pros: [],
      cons: [],
      url: '#',
      howToStart: '请前往平台官网注册',
      dataCredibility: 'B'
    };
  });
  
  // 保存推荐列表供"换一个推荐"使用
  recommendedPlatformsList = platformDetails;
  
  // 生成备选平台列表（不在推荐列表中的活跃平台）
  const recommendedNames = recommendedPlatforms.map(n => n.toLowerCase());
  alternativePlatforms = activePlatforms
    .filter(p => !recommendedNames.includes(p.平台名称.toLowerCase()) && p.平台名称)
    .map(p => {
      const status = getPlatformStatus(p);
      const matchScore = calculateMatchScore(p, profile);
      return {
        name: p.平台名称,
        type: p.平台类型 || '任务型',
        income: p.收入范围 || p.时薪范围 || '-',
        matchScore: matchScore.score,
        status: status.status,
        statusLabel: status.label,
        matchReason: matchScore.reasons[0] || '',
        url: p.官网地址 || `platform-detail.html?id=${encodeURIComponent(p.平台名称)}`
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10); // 最多10个备选
  
  return { platformDetails, reason, expectedIncome, warnings };
}

// 获取"怎么开始"指南
function getHowToStart(platform) {
  if (!platform) return '请前往平台官网注册了解';
  
  const steps = [];
  
  // 注册步骤
  if (platform.官网地址 && platform.官网地址 !== '暂无') {
    steps.push('1. 访问官网完成注册');
  } else if (platform.官方链接) {
    steps.push('1. 关注官方公众号进行注册');
  }
  
  // 实名认证
  if (platform.新手门槛 === '零基础可做') {
    steps.push('2. 完成实名认证');
  }
  
  // 接单建议
  if (platform.新手常见困难?.length > 0) {
    steps.push('3. 从简单任务开始，注意避开常见坑点');
  }
  
  // 提现说明
  if (platform.最低提现金额) {
    steps.push(`4. 达到${platform.最低提现金额}后即可提现`);
  }
  
  return steps.length > 0 ? steps.join('<br>') : '请前往平台官网了解具体流程';
}

// 显示结果（增强版）
function showResult() {
  const container = document.getElementById('quiz-container');
  const { platformDetails, reason, expectedIncome, warnings, directionConfidence } = calculateMatch();
  
  // 构建警告HTML
  const warningsHtml = warnings && warnings.length > 0 ? `
    <div class="warnings-box">
      <h4>⚠️ 预期收入调整建议</h4>
      ${warnings.map(w => `<p>${w}</p>`).join('')}
    </div>
  ` : '';
  
  // 构建匹配置信度展示
  const confidenceHtml = directionConfidence ? `
    <div class="confidence-section">
      <div class="confidence-header">
        <h3>📊 综合匹配置信度</h3>
        <div class="confidence-badge confidence-${directionConfidence.level}">
          ${directionConfidence.confidence}%
        </div>
      </div>
      <div class="confidence-bar">
        <div class="confidence-fill confidence-fill-${directionConfidence.level}" style="width: ${directionConfidence.confidence}%"></div>
      </div>
      <div class="confidence-desc">
        <span class="confidence-level-text">${getConfidenceText(directionConfidence.level)}</span>
      </div>
    </div>
  ` : '';
  
  // 构建适合/不适合原因
  const reasonsHtml = directionConfidence && (directionConfidence.fitReasons.length > 0 || directionConfidence.unfitReasons.length > 0) ? `
    <div class="match-reasons-section">
      ${directionConfidence.fitReasons.length > 0 ? `
        <div class="fit-reasons">
          <h4>✅ 适合你的原因</h4>
          <ul>
            ${directionConfidence.fitReasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${directionConfidence.unfitReasons.length > 0 ? `
        <div class="unfit-reasons">
          <h4>⚠️ 需要注意</h4>
          <ul>
            ${directionConfidence.unfitReasons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  ` : '';
  
  // 构建主推荐平台HTML
  const mainPlatform = platformDetails[0];
  const mainPlatformHtml = mainPlatform ? `
    <div class="main-recommendation">
      <div class="main-rec-header">
        <div class="main-rec-badge">
          <span class="badge-icon">🎯</span>
          <span class="badge-text">主推荐</span>
        </div>
        <div class="main-rec-confidence">
          <span class="conf-label">匹配度</span>
          <span class="conf-value">${mainPlatform.matchScore}%</span>
        </div>
      </div>
      <div class="main-rec-platform">
        <h3>${mainPlatform.name}</h3>
        <div class="platform-tags">
          <span class="tag type-tag">${mainPlatform.type}</span>
          <span class="tag difficulty-tag">${mainPlatform.difficulty}</span>
          <span class="tag status-${mainPlatform.status}">${mainPlatform.statusLabel}</span>
        </div>
      </div>
      <div class="main-rec-income">
        <span class="income-label">预期月收入</span>
        <span class="income-value">${mainPlatform.income}</span>
      </div>
      ${mainPlatform.matchReason ? `
      <div class="main-rec-reason">
        <span class="reason-icon">💡</span>
        <span>${mainPlatform.matchReason}</span>
      </div>
      ` : ''}
    </div>
  ` : '';
  
  // 构建其他推荐平台
  const otherPlatforms = platformDetails.slice(1);
  const otherPlatformsHtml = otherPlatforms.length > 0 ? `
    <div class="other-recommendations">
      <h4>📋 其他推荐</h4>
      <div class="other-platforms-grid">
        ${otherPlatforms.map(p => `
          <div class="other-platform-card">
            <div class="other-platform-header">
              <span class="other-platform-name">${p.name}</span>
              <span class="other-platform-score">${p.matchScore}%</span>
            </div>
            <div class="other-platform-meta">
              <span>${p.type}</span>
              <span>${p.income}</span>
            </div>
            ${p.matchReason ? `<div class="other-platform-reason">${p.matchReason}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';
  
  container.innerHTML = `
    <div class="result-container fade-in">
      <div class="result-icon">🎯</div>
      <h2 class="result-title">匹配完成！</h2>
      <p class="result-subtitle">根据你的情况，我们为你推荐以下副业平台</p>
      
      ${warningsHtml}
      
      <div class="result-platforms-grid">
        ${mainPlatformHtml}
        ${otherPlatformsHtml}
      </div>
      
      <div class="result-reason">
        <h4>💡 推荐理由</h4>
        <p>${reason}</p>
      </div>
      
      <div class="result-income">
        预期月收入：<span class="income-highlight">${expectedIncome}</span>
      </div>
      
      <div class="alternative-section" id="alternative-section" style="display:none;">
        <h3>🔄 备选平台推荐</h3>
        <p class="alternative-desc">以下平台也适合你的情况，可以作为备选参考：</p>
        <div class="alternative-grid" id="alternative-grid"></div>
      </div>
      
      <div style="margin-top:24px;padding:16px;background:#fef2f2;border-radius:8px;text-align:left;">
        <h4 style="color:var(--danger-color);font-size:0.9rem;margin-bottom:8px;">⚠️ 重要提醒</h4>
        <ul class="warning-list">
          <li>以上为参考收入，实际收入因人而异</li>
          <li>警惕任何收费培训，合法平台不会收取入门费</li>
          <li>建议先从小额任务开始，验证平台真实性</li>
          <li>不要轻信"包赚"、"日入过万"等承诺</li>
        </ul>
      </div>
      
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-outline" onclick="resetQuiz()">重新测试</button>
        <button class="btn btn-secondary" onclick="showAlternative()">换一个推荐</button>
        <button class="btn btn-primary" onclick="location.href='platforms.html'">查看全部平台</button>
      </div>
      
      <div class="income-calculator">
        <h3>🧮 收入计算器</h3>
        <p class="calc-desc">根据你选择的副业类型，计算预估收入</p>
        <div class="calc-controls">
          <div class="form-group">
            <label class="form-label">每天投入时间</label>
            <select id="calc-hours" class="form-select">
              <option value="1">1小时</option>
              <option value="2" selected>2小时</option>
              <option value="3">3小时</option>
              <option value="5">5小时以上</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">选择平台</label>
            <select id="calc-platform" class="form-select">
              ${platformDetails.map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">预计周期</label>
            <select id="calc-period" class="form-select">
              <option value="newbie">新手期（1-3月）</option>
              <option value="skilled" selected>熟练期（3-6月）</option>
              <option value="senior">资深期（6月+）</option>
            </select>
          </div>
        </div>
        <div class="calc-result" id="calc-result">
          <div class="calc-result-item">
            <span class="calc-result-label">每日</span>
            <span class="calc-result-value" id="calc-daily">-</span>
          </div>
          <div class="calc-result-item">
            <span class="calc-result-label">每周</span>
            <span class="calc-result-value" id="calc-weekly">-</span>
          </div>
          <div class="calc-result-item">
            <span class="calc-result-label">每月</span>
            <span class="calc-result-value" id="calc-monthly">-</span>
          </div>
        </div>
        <p class="calc-note">⚠️ 此为参考值，实际收入因人而异</p>
      </div>
    </div>
  `;
  
  // 绑定收入计算器事件
  document.getElementById('calc-hours')?.addEventListener('change', updateCalcResult);
  document.getElementById('calc-platform')?.addEventListener('change', updateCalcResult);
  document.getElementById('calc-period')?.addEventListener('change', updateCalcResult);
  
  // 初始化计算结果
  setTimeout(() => updateCalcResult(), 100);
  
  // 保存结果
  saveMatchResult({
    recommendedPlatforms: platformDetails.map(p => p.name),
    reason,
    expectedIncome,
    platformDetails,
    answers: { ...userAnswers }
  });
}

// 切换"怎么开始"展开/收起
function toggleHowTo(element) {
  const content = element.nextElementSibling;
  const arrow = element.querySelector('.howto-arrow');
  if (content.classList.contains('show')) {
    content.classList.remove('show');
    arrow.textContent = '▼';
  } else {
    content.classList.add('show');
    arrow.textContent = '▲';
  }
}

// 显示备选平台
function showAlternative() {
  const section = document.getElementById('alternative-section');
  const grid = document.getElementById('alternative-grid');
  
  if (section.style.display === 'none') {
    // 生成备选平台卡片
    grid.innerHTML = alternativePlatforms.map(p => `
      <div class="alternative-card">
        <div class="alt-header">
          <span class="alt-name">${p.name}</span>
          <span class="status-badge status-${p.status}">${p.statusLabel}</span>
        </div>
        <div class="alt-meta">
          <span>${p.type}</span>
          <span>匹配度 ${p.matchScore}%</span>
        </div>
        <div class="alt-income">${p.income}</div>
        ${p.matchReason ? `<div class="alt-reason">${p.matchReason}</div>` : ''}
        <a href="${p.url}" target="_blank" class="btn btn-sm btn-primary">查看详情</a>
      </div>
    `).join('');
    
    section.style.display = 'block';
    section.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    section.style.display = 'none';
  }
}

// 更新收入计算结果
function updateCalcResult() {
  const hours = parseInt(document.getElementById('calc-hours')?.value || 2);
  const platformName = document.getElementById('calc-platform')?.value || '';
  const period = document.getElementById('calc-period')?.value || 'skilled';
  
  // 找到选中的平台数据
  const platform = recommendedPlatformsList.find(p => p.name === platformName);
  if (!platform) return;
  
  // 从收入范围中提取基础数值
  const incomeStr = platform.income;
  const rangeMatch = incomeStr.match(/(\d+)-(\d+)/);
  
  let baseMin, baseMax;
  if (rangeMatch) {
    baseMin = parseInt(rangeMatch[1]);
    baseMax = parseInt(rangeMatch[2]);
  } else {
    // 默认值
    baseMin = 500;
    baseMax = 1500;
  }
  
  // 根据周期调整基础收入
  const periodMultiplier = {
    'newbie': 0.4,
    'skilled': 0.7,
    'senior': 1.0
  };
  
  const multiplier = periodMultiplier[period] || 0.7;
  
  // 根据每天投入时间调整（假设2小时是基准）
  const hoursMultiplier = hours / 2;
  
  // 计算范围
  const dailyMin = Math.round(baseMin * multiplier * hoursMultiplier / 30);
  const dailyMax = Math.round(baseMax * multiplier * hoursMultiplier / 30);
  const weeklyMin = Math.round(baseMin * multiplier * hoursMultiplier / 4);
  const weeklyMax = Math.round(baseMax * multiplier * hoursMultiplier / 4);
  const monthlyMin = Math.round(baseMin * multiplier * hoursMultiplier);
  const monthlyMax = Math.round(baseMax * multiplier * hoursMultiplier);
  
  // 更新显示
  document.getElementById('calc-daily').textContent = `${dailyMin}-${dailyMax}元`;
  document.getElementById('calc-weekly').textContent = `${weeklyMin}-${weeklyMax}元`;
  document.getElementById('calc-monthly').textContent = `${monthlyMin}-${monthlyMax}元`;
}

// ==================== 匹配置信度计算（增强版） ====================

/**
 * 计算综合匹配置信度
 */
function calculateMatchConfidence(profile, direction) {
  let confidence = 0;
  let fitReasons = [];
  let unfitReasons = [];
  
  // 时间匹配度 (0-25分)
  const timeScores = {
    '碎片时间': { '灵活/碎片': 25, '整块': 10, '全职': 5 },
    '整块时间': { '整块/固定': 25, '灵活/碎片': 15, '全职': 20 },
    '全职投入': { '全职': 25, '整块': 20, '灵活/碎片': 10 }
  };
  
  const timeMatch = timeScores[profile.timeTag]?.[direction.timeMatch] || 10;
  confidence += timeMatch;
  if (timeMatch >= 20) {
    fitReasons.push(`✅ 时间投入匹配度高（${profile.timeTag} + ${direction.timeMatch}）`);
  } else if (timeMatch < 10) {
    unfitReasons.push(`❌ 时间投入不匹配：你有时间${profile.timeTag}，但该方向需要${direction.timeMatch}`);
  }
  
  // 技能匹配度 (0-30分)
  const skillScores = {
    '无技能': { '无要求': 30, '技能型': 5 },
    '写作技能': { '写作/文案': 30, '技能型': 15, '无要求': 10 },
    '设计技能': { '设计/美工': 30, '技能型': 20, '无要求': 10 },
    '技术技能': { '技术/编程': 30, '技能型': 25, '无要求': 10 },
    '视频技能': { '视频/剪辑': 30, '技能型': 20, '无要求': 10 },
    '其他技能': { '技能型': 25, '无要求': 15 }
  };
  
  const skillMatch = skillScores[profile.skillTag]?.[direction.skillMatch] || 10;
  confidence += skillMatch;
  if (skillMatch >= 25) {
    fitReasons.push(`✅ 技能完美匹配：${profile.skillTag} + ${direction.skillMatch}`);
  } else if (skillMatch < 15 && profile.skillTag !== '无技能') {
    unfitReasons.push(`❌ 技能不匹配：你有${profile.skillTag}，但该方向需要${direction.skillMatch}`);
  }
  
  // 收入预期匹配 (0-15分)
  const incomeScores = {
    '低收入预期': { '低': 15, '中': 12, '高': 5 },
    '中等收入预期': { '中': 15, '低': 10, '高': 10 },
    '较高收入预期': { '高': 15, '中': 12, '需要积累': 10 },
    '高收入预期': { '高': 15, '需要积累': 12, '中': 8 }
  };
  
  const incomeMatch = incomeScores[profile.incomeTag]?.[direction.incomeLevel] || 8;
  confidence += incomeMatch;
  if (incomeMatch >= 12) {
    fitReasons.push(`✅ 收入预期匹配：${profile.incomeTag}`);
  } else if (incomeMatch < 8) {
    unfitReasons.push(`⚠️ 收入预期可能不符：该方向${direction.incomeNote || '收入增长需要时间'}`);
  }
  
  // 发展倾向匹配 (0-15分)
  const focusScores = {
    '短期收益': { '短期变现': 15, '灵活': 12, '长期积累': 5 },
    '长期发展': { '长期积累': 15, '灵活': 10, '短期变现': 5 },
    '平衡': { '灵活': 15, '短期变现': 10, '长期积累': 10 }
  };
  
  const focusMatch = focusScores[profile.focusTag]?.[direction.developModel] || 10;
  confidence += focusMatch;
  if (focusMatch >= 12) {
    fitReasons.push(`✅ 发展模式契合：${profile.focusTag}`);
  }
  
  // 设备匹配 (0-15分)
  const deviceScores = {
    '手机用户': { '手机': 15, '通用': 12, '电脑': 5 },
    '电脑用户': { '电脑': 15, '通用': 12, '手机': 8 },
    '专业设备用户': { '专业设备': 15, '电脑': 12, '手机': 8 }
  };
  
  const deviceMatch = deviceScores[profile.deviceTag]?.[direction.deviceReq] || 8;
  confidence += deviceMatch;
  if (deviceMatch >= 12) {
    fitReasons.push(`✅ 设备条件满足：${profile.deviceTag}`);
  } else if (deviceMatch < 8) {
    unfitReasons.push(`❌ 设备不足：你只有${profile.deviceTag}，该方向需要${direction.deviceReq}`);
  }
  
  // 限制分数范围
  confidence = Math.min(100, Math.max(0, confidence));
  
  // 添加特殊条件分析
  if (profile.outdoorTag === '室内优先' && direction.outdoor) {
    unfitReasons.push(`❌ 不适合室内用户：该方向需要${direction.outdoor}`);
  }
  
  if ((profile.englishTag === '英语弱' || profile.englishTag === '英语一般') && direction.englishRequired) {
    unfitReasons.push(`⚠️ 英语要求较高：你英语水平${profile.englishTag}，可能影响收入`);
  }
  
  return {
    confidence,
    level: confidence >= 85 ? 'excellent' : confidence >= 70 ? 'good' : confidence >= 50 ? 'fair' : 'poor',
    fitReasons,
    unfitReasons
  };
}

// 重置测试
function resetQuiz() {
  currentQuestion = 0;
  userAnswers = {};
  alternativePlatforms = [];
  recommendedPlatformsList = [];
  renderQuestion();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initMatch();
});
