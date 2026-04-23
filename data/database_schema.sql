-- =====================================================
-- 副业发现平台 - 数据库设计
-- 创建时间：2026年4月23日
-- 数据库类型：PostgreSQL (Supabase)
-- =====================================================

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 用户表 (users)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255), -- 如果用Supabase Auth，这个可以不要
    nickname VARCHAR(50),
    avatar_url VARCHAR(500),
    city VARCHAR(50),
    
    -- 用户画像
    user_type VARCHAR(20) DEFAULT 'normal', -- normal/verified/contributor/admin
    points INTEGER DEFAULT 0,
    
    -- 统计数据
    cases_submitted INTEGER DEFAULT 0,
    cases_verified INTEGER DEFAULT 0,
    complaints_submitted INTEGER DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active' -- active/banned/deleted
);

-- 用户索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);

-- =====================================================
-- 2. 平台表 (platforms)
-- =====================================================
CREATE TABLE platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) UNIQUE, -- URL友好名称
    type VARCHAR(50), -- 任务型/配送型/设计类/技术类/写作类/视频类/电商类
    
    -- 基本信息
    website VARCHAR(255),
    operator VARCHAR(255), -- 运营主体
    description TEXT,
    logo_url VARCHAR(500),
    
    -- 收入信息
    income_newbie VARCHAR(50), -- 新手收入范围
    income_skilled VARCHAR(50), -- 熟练收入范围
    income_expert VARCHAR(50), -- 资深收入范围
    
    -- 平台状态
    status VARCHAR(20) DEFAULT 'active', -- active/warning/stopped/danger
    status_reason TEXT, -- 状态原因说明
    
    -- 评价统计
    rating_avg DECIMAL(2,1) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- 投诉统计
    complaint_count INTEGER DEFAULT 0,
    complaint_resolved INTEGER DEFAULT 0,
    
    -- 标签
    tags TEXT[], -- ['免费', '手机可做', '零门槛']
    pros TEXT[], -- 优点列表
    cons TEXT[], -- 缺点列表
    
    -- 新手指南（引用 getting_started 表）
    getting_started_id UUID,
    
    -- 时间戳
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 平台索引
CREATE INDEX idx_platforms_type ON platforms(type);
CREATE INDEX idx_platforms_status ON platforms(status);
CREATE INDEX idx_platforms_rating ON platforms(rating_avg DESC);

-- =====================================================
-- 3. 案例表 (cases)
-- =====================================================
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 用户信息
    user_nickname VARCHAR(50) NOT NULL,
    city VARCHAR(50),
    user_profile TEXT, -- 用户画像描述
    
    -- 平台关联
    platform_id UUID REFERENCES platforms(id),
    platform_name VARCHAR(100), -- 冗余存储，方便查询
    
    -- 分类
    category VARCHAR(50), -- 任务型/配送型/设计类等
    sub_category VARCHAR(50), -- 细分类型
    
    -- 收入数据
    monthly_income INTEGER, -- 月收入（整数，单位：元）
    income_range VARCHAR(50), -- 收入范围描述
    income_curve JSONB, -- 收入变化曲线 [{"month": 1, "income": 800}, ...]
    
    -- 时间投入
    daily_hours VARCHAR(50), -- 每天投入时间
    total_duration VARCHAR(50), -- 总共做了多久
    
    -- 经历详情
    experience TEXT NOT NULL, -- 经历详情（100字以上）
    difficulties TEXT, -- 遇到的困难
    solutions TEXT, -- 解决方法
    suggestions TEXT, -- 给新人的建议
    
    -- 评价
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    recommend_level INTEGER DEFAULT 3, -- 推荐指数 1-5
    
    -- 数据来源
    source_type VARCHAR(50), -- 网络收集/用户投稿/平台提供
    source_url VARCHAR(500),
    source_screenshot VARCHAR(500),
    
    -- 审核状态
    verify_status VARCHAR(20) DEFAULT 'pending', -- pending/verified/rejected
    verify_notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- 数据可信度
    credibility_level VARCHAR(5) DEFAULT 'C', -- A/B/C/D/E
    
    -- 投稿用户（如果是用户投稿）
    submitted_by UUID REFERENCES users(id),
    
    -- 统计
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    
    -- 时间戳
    happened_date DATE, -- 案例发生时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 案例索引
CREATE INDEX idx_cases_platform ON cases(platform_id);
CREATE INDEX idx_cases_category ON cases(category);
CREATE INDEX idx_cases_income ON cases(monthly_income);
CREATE INDEX idx_cases_verify_status ON cases(verify_status);
CREATE INDEX idx_cases_created ON cases(created_at DESC);

-- =====================================================
-- 4. 平台评价表 (platform_reviews)
-- =====================================================
CREATE TABLE platform_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 关联
    user_id UUID REFERENCES users(id),
    platform_id UUID REFERENCES platforms(id) NOT NULL,
    
    -- 评价内容
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(100),
    content TEXT,
    
    -- 标签
    pros TEXT[], -- 优点标签
    cons TEXT[], -- 缺点标签
    
    -- 统计
    helpful_count INTEGER DEFAULT 0, -- 有帮助数量
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active', -- active/hidden/deleted
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评价索引
CREATE INDEX idx_reviews_platform ON platform_reviews(platform_id);
CREATE INDEX idx_reviews_user ON platform_reviews(user_id);
CREATE INDEX idx_reviews_rating ON platform_reviews(rating);

-- =====================================================
-- 5. 投诉表 (complaints)
-- =====================================================
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 投诉人（可匿名）
    user_id UUID REFERENCES users(id),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- 投诉对象
    platform_id UUID REFERENCES platforms(id),
    platform_name VARCHAR(100),
    
    -- 投诉内容
    complaint_type VARCHAR(50), -- 提现困难/虚假宣传/恶意扣款/客服失联/其他
    title VARCHAR(100),
    content TEXT NOT NULL,
    evidence_urls TEXT[], -- 证据截图链接
    loss_amount DECIMAL(10,2), -- 损失金额
    
    -- 处理状态
    status VARCHAR(20) DEFAULT 'pending', -- pending/processing/resolved/rejected
    priority VARCHAR(20) DEFAULT 'normal', -- low/normal/high/urgent
    
    -- 处理记录
    assigned_to UUID REFERENCES users(id), -- 分配给哪个管理员
    admin_reply TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- 公示
    is_public BOOLEAN DEFAULT FALSE, -- 是否公示
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 投诉索引
CREATE INDEX idx_complaints_platform ON complaints(platform_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_type ON complaints(complaint_type);

-- =====================================================
-- 6. 骗局表 (scams)
-- =====================================================
CREATE TABLE scams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 基本信息
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50), -- 兼职诈骗/投资诈骗/刷单诈骗/传销/其他
    description TEXT,
    
    -- 骗局特征
    methods TEXT[], -- 常见手法
    warning_signs TEXT[], -- 警示信号
    scripts TEXT[], -- 常见话术
    
    -- 识别方法
    how_to_identify TEXT,
    how_to_avoid TEXT,
    
    -- 真实案例（JSON存储）
    real_cases JSONB,
    
    -- 相关新闻/报道
    related_news JSONB,
    
    -- 统计
    victim_count INTEGER DEFAULT 0, -- 受害人数估算
    total_loss DECIMAL(15,2), -- 总损失估算
    
    -- 标签
    tags TEXT[],
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 骗局索引
CREATE INDEX idx_scams_type ON scams(type);

-- =====================================================
-- 7. 新手指南表 (getting_started)
-- =====================================================
CREATE TABLE getting_started (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id UUID REFERENCES platforms(id),
    platform_name VARCHAR(100),
    
    -- 三步开始
    step1 JSONB, -- {"title": "注册账号", "content": "...", "tips": [...]}
    step2 JSONB,
    step3 JSONB,
    
    -- FAQ
    faq JSONB, -- [{"q": "问题", "a": "答案"}, ...]
    
    -- 避坑提示
    warnings TEXT[],
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. 收藏表 (favorites)
-- =====================================================
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- 收藏类型
    item_type VARCHAR(20), -- platform/case/scam
    item_id UUID,
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束
    UNIQUE(user_id, item_type, item_id)
);

-- =====================================================
-- 9. 数据更新记录表 (data_updates)
-- =====================================================
CREATE TABLE data_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- 更新对象
    table_name VARCHAR(50),
    record_id UUID,
    
    -- 更新内容
    update_type VARCHAR(20), -- create/update/delete/verify
    update_field VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    
    -- 更新人
    updated_by UUID REFERENCES users(id),
    
    -- 时间戳
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 10. 系统配置表 (settings)
-- =====================================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 触发器：自动更新 updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要的表创建触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON platforms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_complaints_updated_at BEFORE UPDATE ON complaints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 视图：平台统计视图
-- =====================================================
CREATE VIEW platform_stats AS
SELECT 
    p.id,
    p.name,
    p.type,
    p.status,
    p.rating_avg,
    p.rating_count,
    COUNT(DISTINCT c.id) as case_count,
    COUNT(DISTINCT pr.id) as review_count,
    COUNT(DISTINCT cm.id) as complaint_count
FROM platforms p
LEFT JOIN cases c ON p.id = c.platform_id
LEFT JOIN platform_reviews pr ON p.id = pr.platform_id
LEFT JOIN complaints cm ON p.id = cm.platform_id
GROUP BY p.id;

-- =====================================================
-- 初始数据：系统配置
-- =====================================================
INSERT INTO settings (key, value, description) VALUES
('site_name', '副业发现平台', '网站名称'),
('site_description', '帮你找到靠谱副业，远离诈骗陷阱', '网站描述'),
('case_min_length', '100', '案例详情最小字数'),
('review_min_length', '30', '评价内容最小字数');

-- =====================================================
-- 数据库设计说明
-- =====================================================
/*
使用方法：
1. 在 Supabase 创建新项目
2. 进入 SQL Editor
3. 复制粘贴本文件全部内容
4. 点击 Run 执行

表关系说明：
- users: 用户表，存储注册用户信息
- platforms: 平台表，存储副业平台信息
- cases: 案例表，存储用户案例，关联 platform
- platform_reviews: 评价表，用户对平台的评价
- complaints: 投诉表，用户对平台的投诉
- scams: 骗局表，存储骗局预警信息
- getting_started: 新手指南表
- favorites: 收藏表
- data_updates: 数据更新记录，用于审计
- settings: 系统配置

索引策略：
- 为常用查询字段创建索引
- 为外键创建索引
- 为排序字段创建索引

安全策略（需要在 Supabase 中配置）：
- 用户只能查看自己的数据
- 管理员可以查看和修改所有数据
- 公开数据（平台、案例）所有人可查看
*/
