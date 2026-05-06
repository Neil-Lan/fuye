/**
 * 创业匹配功能
 */

// 创业匹配题目配置
const startupQuestions = [
  {
    id: 'S1',
    question: '你的启动资金预算是多少？',
    options: [
      { label: '1万以下', value: 'under1' },
      { label: '1-5万', value: '1-5' },
      { label: '5-10万', value: '5-10' },
      { label: '10-20万', value: '10-20' },
      { label: '20万以上', value: 'above20' }
    ]
  },
  {
    id: 'S2',
    question: '你所在的城市级别是？',
    options: [
      { label: '一线城市', value: 'tier1' },
      { label: '二线城市', value: 'tier2' },
      { label: '三四线城市', value: 'tier3' },
      { label: '县城/乡镇', value: 'county' }
    ]
  },
  {
    id: 'S3',
    question: '你可投入的时间是？',
    options: [
      { label: '兼职（每天2-4小时）', value: 'parttime' },
      { label: '半职（每天4-6小时）', value: 'halftime' },
      { label: '全职（每天8小时以上）', value: 'fulltime' }
    ]
  },
  {
    id: 'S4',
    question: '你目前的技能/经验背景？',
    options: [
      { label: '无特殊技能', value: 'none' },
      { label: '销售/营销', value: 'sales' },
      { label: '技术/编程', value: 'tech' },
      { label: '餐饮/烹饪', value: 'catering' },
      { label: '零售/管理', value: 'retail' },
      { label: '教育/培训', value: 'education' },
      { label: '其他', value: 'other' }
    ]
  },
  {
    id: 'S5',
    question: '你的风险承受能力？',
    options: [
      { label: '低风险（求稳）', value: 'low' },
      { label: '中等风险（可控）', value: 'medium' },
      { label: '高风险（可承受亏损）', value: 'high' }
    ]
  },
  {
    id: 'S6',
    question: '你创业的主要目的是？',
    options: [
      { label: '赚钱盈利', value: 'profit' },
      { label: '追求自由', value: 'freedom' },
      { label: '实现梦想', value: 'dream' },
      { label: '其他原因', value: 'other' }
    ]
  },
  {
    id: 'S7',
    question: '你偏好哪种创业形式？',
    options: [
      { label: '线上互联网（电商、自媒体等）', value: 'online' },
      { label: '线下实体（店铺、服务业等）', value: 'offline' },
      { label: '都可以，看机会', value: 'both' }
    ]
  },
  {
    id: 'S8',
    question: '你是否已有团队或合伙人？',
    options: [
      { label: '独自创业', value: 'alone' },
      { label: '有1-2个合伙人', value: 'partner_small' },
      { label: '已有3人以上团队', value: 'partner_big' },
      { label: '正在寻找合伙人', value: 'partner_looking' }
    ]
  },
  {
    id: 'S9',
    question: '你是否有实体店或销售经验？',
    options: [
      { label: '完全无经验', value: 'no_exp' },
      { label: '有相关行业打工经验', value: 'work_exp' },
      { label: '有开店或创业经验', value: 'business_exp' }
    ]
  },
  {
    id: 'S10',
    question: '你的营销推广能力如何？',
    options: [
      { label: '较弱，需要学习', value: 'weak' },
      { label: '一般，能做基础推广', value: 'normal' },
      { label: '较强，有自媒体运营经验', value: 'strong' }
    ]
  },
  {
    id: 'S11',
    question: '你对行业的了解程度？',
    options: [
      { label: '不了解，需要从头学习', value: 'unknown' },
      { label: '有些了解，看过相关资料', value: 'basic' },
      { label: '比较了解，有深入研究', value: 'familiar' },
      { label: '非常了解，从业多年', value: 'expert' }
    ]
  },
  {
    id: 'S12',
    question: '你希望多久开始有收入？',
    options: [
      { label: '越快越好（1-3个月）', value: 'fast' },
      { label: '可以等一段时间（3-6个月）', value: 'medium' },
      { label: '愿意长期投入（6个月以上）', value: 'slow' }
    ]
  }
];

// 创业方向数据
const startupDirections = {
  // 小本创业：资金少、风险低、门槛低
  small_budget: {
    name: '小本创业',
    icon: '🛒',
    directions: [
      {
        name: '地摊/集市摆摊',
        invest: '2000-5000元',
        income: '2000-8000元/月',
        risk: '低',
        difficulty: '入门容易',
        description: '适合资金少、想快速试水的创业者。可经营小吃、饰品、日用品等。',
        caseUrl: 'cases.html?type=stall'
      },
      {
        name: '社区团购团长',
        invest: '1000-3000元',
        income: '2000-5000元/月',
        risk: '低',
        difficulty: '入门容易',
        description: '利用社区资源，无需店面，负责配送和售后。',
        caseUrl: 'cases.html?type=community'
      },
      {
        name: '代购/代运营',
        invest: '1000-2000元',
        income: '1500-4000元/月',
        risk: '低',
        difficulty: '入门容易',
        warning: '⚠️ 法律提示：海外代购需依法申报海关、缴纳关税，代运营需确保授权合法',
        description: '国内代运营为主，帮助商家运营店铺赚取服务费。海外代购需遵守海关法规。',
        caseUrl: 'cases.html?type=agent'
      }
    ]
  },
  // 加盟创业：资金中等、需要经验
  franchise: {
    name: '加盟创业',
    icon: '🏪',
    directions: [
      {
        name: '奶茶饮品店加盟',
        invest: '10-20万',
        income: '5000-2万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '中',
        difficulty: '需要经验',
        description: '选择成熟品牌加盟，利用品牌效应和标准化运营。',
        caseUrl: 'cases.html?type=bubble'
      },
      {
        name: '便利店/超市加盟',
        invest: '15-30万',
        income: '1-3万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '中',
        difficulty: '需要经验',
        description: '社区便利店、连锁超市加盟，稳定但竞争激烈。',
        caseUrl: 'cases.html?type=convenience'
      },
      {
        name: '餐饮小吃加盟',
        invest: '5-15万',
        income: '8000-3万/月',
        risk: '中',
        difficulty: '需要经验',
        description: '快餐、卤味、炸鸡等餐饮加盟，配方和选址很关键。',
        caseUrl: 'cases.html?type=restaurant'
      }
    ]
  },
  // 电商创业：资金灵活、需要学习
  ecommerce: {
    name: '电商创业',
    icon: '🛍️',
    directions: [
      {
        name: '淘宝/拼多多店铺',
        invest: '5000-3万',
        income: '3000-2万/月',
        risk: '中',
        difficulty: '需要学习',
        description: '选择细分品类，利用平台流量，需学习运营技巧。',
        caseUrl: 'cases.html?type=taobao'
      },
      {
        name: '抖音/快手带货',
        invest: '3000-2万',
        income: '3000-1.5万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '中',
        difficulty: '需要学习',
        description: '短视频+直播带货，适合有表达能力和选品眼光的人。',
        caseUrl: 'cases.html?type=live'
      },
      {
        name: '跨境电商',
        invest: '3-10万',
        income: '5000-2万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '中高',
        difficulty: '需要学习',
        description: '亚马逊、速卖通等平台出口，需要英语基础和选品能力。',
        caseUrl: 'cases.html?type=crossborder'
      }
    ]
  },
  // 实体店创业：资金高、风险高、需要经验
  physical_store: {
    name: '实体店创业',
    icon: '🏠',
    directions: [
      {
        name: '餐饮实体店',
        invest: '20-50万',
        income: '1-5万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '高',
        difficulty: '需要经验',
        warning: '⚠️ 证照要求：需办理营业执照、食品经营许可证、健康证等，选址需符合环保要求',
        description: '选址、装修、厨师、运营都需要专业能力，风险较高。',
        caseUrl: 'cases.html?type=food'
      },
      {
        name: '教育培训实体',
        invest: '10-30万',
        income: '8000-3万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '中高',
        difficulty: '需要经验',
        description: '学科辅导、兴趣培训、托育等，市场需求稳定。',
        caseUrl: 'cases.html?type=education'
      },
      {
        name: '美容美发工作室',
        invest: '5-20万',
        income: '8000-2万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '中',
        difficulty: '需要技术',
        description: '美容、美甲、美发等，靠手艺和服务质量积累客户。',
        caseUrl: 'cases.html?type=beauty'
      }
    ]
  },
  // 自由职业创业：技能驱动、资金少
  freelance: {
    name: '自由职业创业',
    icon: '💻',
    directions: [
      {
        name: '设计工作室',
        invest: '5000-2万',
        income: '5000-1.5万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '低',
        difficulty: '需要技能',
        description: 'logo设计、包装设计、UI设计等，靠作品和服务质量。',
        caseUrl: 'cases.html?type=design'
      },
      {
        name: '自媒体工作室',
        invest: '1-3万',
        income: '3000-1.5万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '中',
        difficulty: '需要持续输出',
        description: '短视频、图文、直播等，打造个人IP，长期价值高。',
        caseUrl: 'cases.html?type=media'
      },
      {
        name: '咨询/培训服务',
        invest: '5000-1万',
        income: '5000-2万/月',
        incomeNote: '⚠️ 以上为成熟期收入，新手期通常为上述范围的30%-50%',
        risk: '低',
        difficulty: '需要专业背景',
        description: '商业咨询、职业规划、技能培训等，靠专业能力变现。',
        caseUrl: 'cases.html?type=consult'
      },
      {
        name: '摄影/摄像服务',
        invest: '2-10万',
        income: '8000-3万/月',
        risk: '中',
        difficulty: '需要技术',
        description: '婚纱摄影、活动跟拍、商业拍摄等，技术+资源缺一不可。',
        caseUrl: 'cases.html?type=photo'
      }
    ]
  }
};

// 匹配规则：定义不同用户画像适合的创业方向
const matchRules = [
  {
    // 资金<1万 + 低风险 + 无技能 → 小本创业
    condition: (ans) => 
      (ans.S1 === 'under1' || ans.S1 === '1-5') && 
      ans.S5 === 'low' && 
      (ans.S4 === 'none' || ans.S4 === 'other'),
    directions: ['small_budget']
  },
  {
    // 资金1-5万 + 二三线城市 + 兼职 → 小本创业/电商
    condition: (ans) => 
      ans.S1 === '1-5' && 
      (ans.S2 === 'tier3' || ans.S2 === 'county') && 
      ans.S3 === 'parttime',
    directions: ['small_budget', 'ecommerce']
  },
  {
    // 资金5-20万 + 有经验 + 中风险 → 加盟创业
    condition: (ans) => 
      (ans.S1 === '5-10' || ans.S1 === '10-20') && 
      (ans.S4 !== 'none' && ans.S4 !== 'other') && 
      ans.S5 === 'medium',
    directions: ['franchise', 'ecommerce']
  },
  {
    // 资金>10万 + 一二线 + 全职 + 高风险 → 实体店
    condition: (ans) => 
      (ans.S1 === '10-20' || ans.S1 === 'above20') && 
      (ans.S2 === 'tier1' || ans.S2 === 'tier2') && 
      ans.S3 === 'fulltime' && 
      ans.S5 === 'high',
    directions: ['physical_store', 'franchise']
  },
  {
    // 资金>20万 + 任何城市 → 实体店/加盟
    condition: (ans) => ans.S1 === 'above20',
    directions: ['physical_store', 'franchise']
  },
  {
    // 技术背景 + 低风险 + 追求自由 → 自由职业
    condition: (ans) => 
      (ans.S4 === 'tech' || ans.S4 === 'sales') && 
      ans.S5 === 'low' && 
      ans.S6 === 'freedom',
    directions: ['freelance']
  },
  {
    // 资金<5万 + 技术背景 → 电商/自由职业
    condition: (ans) => 
      (ans.S1 === 'under1' || ans.S1 === '1-5') && 
      (ans.S4 === 'tech' || ans.S4 === 'sales' || ans.S4 === 'other'),
    directions: ['ecommerce', 'freelance']
  },
  {
    // 兼职创业 + 低风险 → 小本/自由职业
    condition: (ans) => 
      ans.S3 === 'parttime' && 
      ans.S5 === 'low',
    directions: ['small_budget', 'freelance']
  },
  {
    // 追求梦想 + 高风险 → 实体/电商
    condition: (ans) => 
      ans.S6 === 'dream' && 
      ans.S5 === 'high',
    directions: ['ecommerce', 'physical_store']
  },
  {
    // 纯追求盈利 + 低资金 → 小本/电商
    condition: (ans) => 
      ans.S6 === 'profit' && 
      (ans.S1 === 'under1' || ans.S1 === '1-5'),
    directions: ['small_budget', 'ecommerce']
  },
  {
    // 餐饮背景 + 资金中等 → 餐饮加盟/实体
    condition: (ans) => ans.S4 === 'catering' && (ans.S1 === '5-10' || ans.S1 === '10-20'),
    directions: ['franchise', 'physical_store']
  },
  {
    // 教育背景 → 教育培训实体/自由职业
    condition: (ans) => ans.S4 === 'education',
    directions: ['freelance', 'physical_store']
  },
  {
    // 默认推荐：电商起步
    default: true,
    directions: ['ecommerce', 'freelance', 'small_budget']
  }
];

// 全局状态
let startupCurrentQuestion = 0;
let startupUserAnswers = {};

// 初始化创业匹配
function initStartupMatch() {
  startupCurrentQuestion = 0;
  startupUserAnswers = {};
  renderStartupQuestion();
}

// 渲染当前题目
function renderStartupQuestion() {
  const container = document.getElementById('startup-quiz-container');
  const questions = startupQuestions;
  
  if (startupCurrentQuestion >= questions.length) {
    showStartupResult();
    return;
  }
  
  const q = questions[startupCurrentQuestion];
  const progress = Math.round((startupCurrentQuestion / questions.length) * 100);
  
  container.innerHTML = `
    <div class="quiz-progress">
      <div class="quiz-progress-bar">
        <div class="quiz-progress-fill" style="width: ${progress}%"></div>
      </div>
      <span class="quiz-progress-text">${startupCurrentQuestion + 1}/${questions.length}</span>
    </div>
    
    <div class="quiz-question">
      <h3>${startupCurrentQuestion + 1}. ${q.question}</h3>
      <div class="quiz-options">
        ${q.options.map((opt, idx) => `
          <label class="quiz-option ${startupUserAnswers[q.id] === opt.value ? 'selected' : ''}" data-value="${opt.value}">
            <input type="radio" name="startup_${q.id}" value="${opt.value}" ${startupUserAnswers[q.id] === opt.value ? 'checked' : ''}>
            <span>${opt.label}</span>
          </label>
        `).join('')}
      </div>
    </div>
    
    <div class="quiz-nav">
      ${startupCurrentQuestion > 0 ? `
        <button class="btn btn-outline" onclick="prevStartupQuestion()">← 上一题</button>
      ` : '<div></div>'}
      <button class="btn btn-primary" onclick="nextStartupQuestion()" ${startupUserAnswers[q.id] === undefined ? 'disabled style="opacity:0.5"' : ''}>
        ${startupCurrentQuestion === questions.length - 1 ? '查看结果 →' : '下一题 →'}
      </button>
    </div>
  `;
  
  // 绑定选项点击事件
  document.querySelectorAll('#startup-quiz-container .quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const value = opt.dataset.value;
      const q = questions[startupCurrentQuestion];
      startupUserAnswers[q.id] = value;
      renderStartupQuestion();
    });
  });
}

// 上一题
function prevStartupQuestion() {
  if (startupCurrentQuestion > 0) {
    startupCurrentQuestion--;
    renderStartupQuestion();
  }
}

// 下一题
function nextStartupQuestion() {
  const q = startupQuestions[startupCurrentQuestion];
  
  if (startupUserAnswers[q.id] === undefined) {
    alert('请选择一个选项');
    return;
  }
  
  startupCurrentQuestion++;
  renderStartupQuestion();
}

// 在结果页面底部添加资源链接标记
const startupResourceLink = '<div style="text-align:center;margin-top:24px;"><a href="startup-resources.html" class="btn btn-secondary">📋 查看创业资源 →</a></div>';

// 显示匹配结果
function showStartupResult() {
  const container = document.getElementById('startup-quiz-container');
  const matchedDirections = calculateStartupMatch();
  
  // 生成结果HTML
  let resultHTML = `
    <div class="result-container" style="text-align:left;">
      <div style="text-align:center;margin-bottom:24px;">
        <div class="result-icon">🎉</div>
        <h2 class="result-title">创业方向匹配完成！</h2>
        <p class="result-subtitle">根据你的情况，推荐以下创业方向</p>
      </div>
      
      <div class="startup-match-results">
  `;
  
  matchedDirections.forEach(dir => {
    resultHTML += `
      <div class="startup-result-card">
        <h3>${dir.icon} ${dir.categoryName}</h3>
        ${dir.directions.map(d => `
          <div style="padding:16px;background:#f8fafc;border-radius:8px;margin-bottom:12px;">
            <h4 style="color:var(--text-primary);margin-bottom:8px;">${d.name}</h4>
            ${d.warning ? `<div style="background:#fff3cd;color:#856404;padding:8px 12px;border-radius:6px;margin-bottom:12px;font-size:13px;">${d.warning}</div>` : ''}
            <div class="result-badges">
              <span class="badge badge-invest">💰 ${d.invest}</span>
              <span class="badge badge-income">📈 ${d.income}</span>
              <span class="badge badge-risk">⚠️ 风险${d.risk}</span>
              <span class="badge badge-difficulty">📚 ${d.difficulty}</span>
            </div>
            ${d.incomeNote ? `<div style="color:#f59e0b;font-size:12px;margin-top:6px;">${d.incomeNote}</div>` : ''}
            <p>${d.description}</p>
            <a href="${d.caseUrl}" class="case-link">📖 查看成功案例</a>
            <a href="startup-resources.html" class="case-link" style="margin-left:12px;">📋 查看创业资源</a>
          </div>
        `).join('')}
      </div>
    `;
  });
  
  // 添加提示和建议
  resultHTML += `
      </div>
      
      <div class="result-reason">
        <h4>💡 创业建议</h4>
        <p>${getStartupAdvice()}</p>
      </div>
      
      <div style="text-align:center;margin-top:24px;">
        <button class="btn btn-outline" onclick="restartStartupMatch()" style="margin-right:12px;">
          🔄 重新测试
        </button>
        <button class="btn btn-primary" onclick="switchMatchTab('fuye')">
          📈 去测试副业匹配
        </button>
      </div>
      ${startupResourceLink}
    </div>
  `;
  
  container.innerHTML = resultHTML;
  
  // 保存结果
  saveStartupResult(resultHTML);
}

// 计算匹配结果
function calculateStartupMatch() {
  const matchedDirectionKeys = [];
  
  // 根据规则匹配
  for (const rule of matchRules) {
    if (rule.default) continue;
    if (rule.condition(startupUserAnswers)) {
      matchedDirectionKeys.push(...rule.directions);
      break;
    }
  }
  
  // 如果没有匹配到，使用默认
  if (matchedDirectionKeys.length === 0) {
    const defaultRule = matchRules.find(r => r.default);
    if (defaultRule) {
      matchedDirectionKeys.push(...defaultRule.directions);
    }
  }
  
  // 去重
  const uniqueKeys = [...new Set(matchedDirectionKeys)].slice(0, 3);
  
  // 返回匹配到的方向详情
  return uniqueKeys.map(key => {
    const dir = startupDirections[key];
    return {
      icon: dir.icon,
      categoryName: dir.name,
      directions: dir.directions
    };
  });
}

// 获取创业建议
function getStartupAdvice() {
  const budget = startupUserAnswers['S1'];
  const time = startupUserAnswers['S3'];
  const risk = startupUserAnswers['S5'];
  const purpose = startupUserAnswers['S6'];
  
  let advice = '';
  
  // 基于风险承受能力的建议
  if (risk === 'low') {
    advice = '你倾向于低风险投资，建议从小成本项目开始，如摆摊、社区团购等，先积累经验再逐步扩大。';
  } else if (risk === 'medium') {
    advice = '你愿意承担中等风险，建议选择成熟的加盟品牌或有稳定需求的实体项目。';
  } else {
    advice = '你接受高风险，追求高回报，但也做好亏损的心理准备。建议做好市场调研，控制好投入成本。';
  }
  
  // 基于资金和时间的建议
  if ((budget === 'under1' || budget === '1-5') && time === 'parttime') {
    advice += ' 资金有限且是兼职创业，建议优先考虑电商代发、自媒体等轻资产项目。';
  } else if (budget === 'above20') {
    advice += ' 资金充裕，建议优先考虑有成熟运营体系的加盟项目，降低失败风险。';
  }
  
  // 基于目的的建议
  if (purpose === 'freedom') {
    advice += ' 追求自由的创业者，建议考虑自由职业或线上创业项目。';
  } else if (purpose === 'dream') {
    advice += ' 为梦想创业很棒，但建议先小规模验证想法，再逐步投入。';
  }
  
  return advice;
}

// 保存结果到本地存储
function saveStartupResult(html) {
  try {
    const data = {
      answers: startupUserAnswers,
      html: html,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('startup_match_result', JSON.stringify(data));
  } catch (e) {
    console.error('保存创业匹配结果失败:', e);
  }
}

// 重新测试
function restartStartupMatch() {
  if (confirm('确定要重新测试吗？当前结果将被清除。')) {
    localStorage.removeItem('startup_match_result');
    initStartupMatch();
  }
}

// 检查是否有上次结果
function checkPreviousStartupResult() {
  try {
    const data = localStorage.getItem('startup_match_result');
    if (data) {
      const parsed = JSON.parse(data);
      const savedAt = new Date(parsed.savedAt);
      const now = new Date();
      const diffDays = Math.floor((now - savedAt) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 7) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('读取创业匹配结果失败:', e);
  }
  return null;
}
