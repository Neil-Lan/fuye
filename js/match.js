// 副业避坑导航 - 副业匹配页JavaScript
// ==================== 全局变量 ====================
let matchingRules = null;
let platformsData = [];
let currentQuestion = 0;
let userAnswers = {};

// ==================== 初始化 ====================
async function initMatch() {
  try {
    const [rulesRes, platformsRes] = await Promise.all([
      fetch('./data/matching_rules.json'),
      fetch('./data/platforms.json')
    ]);
    
    matchingRules = await rulesRes.json();
    platformsData = await platformsRes.json();
    
    renderQuestion();
  } catch (error) {
    console.error('加载匹配规则失败:', error);
    document.getElementById('quiz-container').innerHTML = '<p class="text-muted text-center">数据加载失败</p>';
  }
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
        下一题 →
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

// 计算匹配结果
function calculateMatch() {
  const rules = matchingRules?.匹配规则 || {};
  const profiles = matchingRules?.用户画像分类 || {};
  
  // 分析用户画像
  const tags = Object.values(userAnswers).filter(v => typeof v === 'string');
  const timeTag = userAnswers['Q1_label'] || '';
  const skillTag = userAnswers['Q2_label'] || '';
  const incomeTag = userAnswers['Q3_label'] || '';
  const outdoorTag = userAnswers['Q4_label'] || '';
  const deviceTag = userAnswers['Q5_label'] || '';
  const focusTag = userAnswers['Q6_label'] || '';
  const englishTag = userAnswers['Q7_label'] || '';
  
  let recommendedPlatforms = [];
  let reason = '';
  let expectedIncome = '';
  
  // 规则匹配
  if ((timeTag === '整块时间' || timeTag === '全职投入') && outdoorTag === '可户外' && (deviceTag === '手机用户' || deviceTag === '电脑用户')) {
    recommendedPlatforms = ['美团众包', '蜂鸟众包', '顺丰同城', '达达快送'];
    reason = '你有整块时间且愿意户外工作，外卖配送是收入最高的选择';
    expectedIncome = '3000-6000元/月';
  } else if ((timeTag === '碎片时间') && outdoorTag === '室内优先' && deviceTag === '手机用户') {
    recommendedPlatforms = ['腾讯搜活帮', '阿里众包', '京东微工', '高德淘金'];
    reason = '碎片时间、室内工作、手机即可操作，适合赚零花钱';
    expectedIncome = '500-1500元/月';
  } else if ((timeTag === '整块时间' || timeTag === '全职投入') && skillTag === '设计技能' && (incomeTag === '较高收入预期' || incomeTag === '高收入预期')) {
    recommendedPlatforms = ['猪八戒网', '稿定设计', '包图网'];
    reason = '你有设计技能，专业变现的最佳渠道';
    expectedIncome = '3000-10000元/月';
  } else if ((timeTag === '整块时间' || timeTag === '全职投入') && skillTag === '技术技能' && (incomeTag === '较高收入预期' || incomeTag === '高收入预期')) {
    recommendedPlatforms = ['程序员客栈', '码市', 'Upwork'];
    reason = '你有编程技能，技术外包收入高且稳定';
    expectedIncome = '5000-20000元/月';
  } else if ((timeTag === '整块时间' || timeTag === '全职投入') && skillTag === '写作技能' && (incomeTag === '较高收入预期' || incomeTag === '高收入预期') && focusTag === '长期发展') {
    recommendedPlatforms = ['小红书', '知乎', '公众号'];
    reason = '你有写作能力，内容创作可积累长期价值';
    expectedIncome = '需要3-12个月积累期';
  } else if ((timeTag === '整块时间' || timeTag === '全职投入') && skillTag === '视频技能' && (deviceTag === '电脑用户' || deviceTag === '专业设备用户')) {
    recommendedPlatforms = ['抖音', 'B站', '西瓜视频'];
    reason = '你有视频能力，视频平台变现潜力大';
    expectedIncome = '需要长期坚持';
  } else if (englishTag === '英语强' || englishTag === '英语精通') {
    recommendedPlatforms = ['Upwork', 'Fiverr', 'Toptal'];
    reason = '你英语好，国际平台收入更高';
    expectedIncome = '5000-30000元/月';
  } else {
    // 默认推荐
    recommendedPlatforms = ['腾讯搜活帮', '阿里众包', '猪八戒网'];
    reason = '根据你的情况，推荐从简单任务型平台开始，逐步积累经验';
    expectedIncome = '500-2000元/月';
  }
  
  return { recommendedPlatforms, reason, expectedIncome };
}

// 显示结果
function showResult() {
  const container = document.getElementById('quiz-container');
  const { recommendedPlatforms, reason, expectedIncome } = calculateMatch();
  
  // 查找推荐平台详情
  const platformDetails = recommendedPlatforms.map(name => {
    const p = platformsData.find(pl => pl.平台名称 === name);
    return p ? {
      name: p.平台名称,
      type: p.平台类型 || '任务型',
      income: p.时薪范围 || p.收入范围 || '-',
      difficulty: p.入门难度 || '⭐'
    } : { name, type: '未知', income: '-', difficulty: '未知' };
  });
  
  container.innerHTML = `
    <div class="result-container fade-in">
      <div class="result-icon">🎯</div>
      <h2 class="result-title">匹配完成！</h2>
      <p class="result-subtitle">根据你的情况，我们为你推荐以下副业平台</p>
      
      <div class="result-platforms">
        ${platformDetails.map(p => `
          <div class="result-platform" onclick="location.href='platform-detail.html?id=${encodeURIComponent(p.name)}'" style="cursor:pointer;">
            <h4>${p.name}</h4>
            <p>类型：${p.type}</p>
            <p>收入：${p.income}</p>
            <p>难度：${p.difficulty}</p>
          </div>
        `).join('')}
      </div>
      
      <div class="result-reason">
        <h4>💡 推荐理由</h4>
        <p>${reason}</p>
      </div>
      
      <div class="result-income">
        预期月收入：${expectedIncome}
      </div>
      
      <div style="margin-top:24px;padding:16px;background:#fef2f2;border-radius:8px;text-align:left;">
        <h4 style="color:var(--danger-color);font-size:0.9rem;margin-bottom:8px;">⚠️ 重要提醒</h4>
        <ul style="color:var(--text-secondary);font-size:0.85rem;line-height:1.8;padding-left:16px;list-style:disc;">
          <li>以上为参考收入，实际收入因人而异</li>
          <li>警惕任何收费培训，合法平台不会收取入门费</li>
          <li>建议先从小额任务开始，验证平台真实性</li>
          <li>不要轻信"包赚"、"日入过万"等承诺</li>
        </ul>
      </div>
      
      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <button class="btn btn-outline" onclick="resetQuiz()">重新测试</button>
        <button class="btn btn-primary" onclick="location.href='platforms.html'">查看全部平台</button>
      </div>
    </div>
  `;
  
  // 保存结果到localStorage
  saveMatchResult({
    recommendedPlatforms,
    reason,
    expectedIncome,
    platformDetails,
    answers: { ...userAnswers }
  });
  
  // 额外保存HTML用于直接显示
  try {
    const resultData = {
      html: container.innerHTML,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('fuye_match_result_html', JSON.stringify(resultData));
  } catch (e) {
    console.error('保存结果HTML失败:', e);
  }
}

// 重置测试
function resetQuiz() {
  currentQuestion = 0;
  userAnswers = {};
  renderQuestion();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  initMatch();
});
