# Supabase 配置指南

> 创建时间：2026年4月23日
> 目标：为副业发现平台搭建后端服务

---

## 一、Supabase 简介

Supabase 是一个开源的 Firebase 替代方案，提供：
- PostgreSQL 数据库
- 用户认证（Auth）
- RESTful API（自动生成）
- 实时订阅
- 存储服务
- 边缘函数

**免费额度**：
- 数据库：500MB
- 存储：1GB
- 带宽：5GB/月
- 并发连接：60个

对于副业平台初期完全够用，超出后可升级付费计划。

---

## 二、创建 Supabase 项目

### 步骤1：注册账号
1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 账号登录（推荐）

### 步骤2：创建组织
1. 登录后点击 "New Organization"
2. 填写组织名称：`fuye-platform`
3. 选择免费计划

### 步骤3：创建项目
1. 在组织中点击 "New Project"
2. 填写项目信息：
   - **项目名称**：`fuye-platform`
   - **数据库密码**：设置一个强密码（记住它！）
   - **区域**：选择离中国最近的区域（Singapore 或 Tokyo）
3. 点击 "Create new project"
4. 等待约2分钟，项目创建完成

### 步骤4：获取项目凭证
1. 进入项目后，点击左侧 "Settings" → "API"
2. 记录以下信息：
   - **Project URL**：`https://xxxxxx.supabase.co`
   - **anon public key**：用于前端访问
   - **service_role key**：用于管理操作（保密！）

---

## 三、配置数据库

### 步骤1：执行数据库脚本
1. 点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制 `database_schema.sql` 的全部内容
4. 粘贴到编辑器
5. 点击 "Run" 执行
6. 看到 "Success. No rows returned" 表示成功

### 步骤2：验证表创建
1. 点击左侧 "Table Editor"
2. 应该看到以下表：
   - users
   - platforms
   - cases
   - platform_reviews
   - complaints
   - scams
   - getting_started
   - favorites
   - data_updates
   - settings

---

## 四、配置用户认证

### 步骤1：启用邮箱认证
1. 点击左侧 "Authentication" → "Providers"
2. 确保 "Email" 已启用
3. 配置选项：
   - Enable email confirmations：**关闭**（简化注册流程，后续可开启）
   - Secure email change：开启

### 步骤2：配置密码策略
1. 点击 "Policies"
2. 设置密码要求：
   - 最小长度：8
   - 要求大写、小写、数字、符号

### 步骤3：添加社交登录（可选）
1. 点击 "Providers"
2. 启用 "Google" 或 "GitHub" 登录
3. 按提示配置 OAuth

---

## 五、配置 Row Level Security (RLS)

Supabase 默认启用 RLS，需要配置策略让用户可以访问数据。

### 公开数据策略（平台、案例、骗局）

```sql
-- 平台：所有人可查看
CREATE POLICY "平台公开可读" ON platforms
    FOR SELECT USING (true);

-- 案例：所有人可查看已验证的
CREATE POLICY "案例公开可读" ON cases
    FOR SELECT USING (verify_status = 'verified');

-- 骗局：所有人可查看
CREATE POLICY "骗局公开可读" ON scams
    FOR SELECT USING (true);

-- 评价：所有人可查看
CREATE POLICY "评价公开可读" ON platform_reviews
    FOR SELECT USING (status = 'active');
```

### 用户数据策略

```sql
-- 用户只能查看自己的数据
CREATE POLICY "用户查看自己" ON users
    FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的信息
CREATE POLICY "用户更新自己" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 用户可以创建自己的收藏
CREATE POLICY "创建收藏" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以查看自己的收藏
CREATE POLICY "查看收藏" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- 用户可以删除自己的收藏
CREATE POLICY "删除收藏" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 用户可以创建自己的评价
CREATE POLICY "创建评价" ON platform_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以创建投诉
CREATE POLICY "创建投诉" ON complaints
    FOR INSERT WITH CHECK (auth.uid() = user_id OR contact_email IS NOT NULL);
```

---

## 六、前端集成

### 安装 Supabase JS 客户端

```html
<!-- 在 HTML 中引入 -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### 初始化客户端

```javascript
// js/supabase.js
const SUPABASE_URL = 'https://xxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 常用操作示例

```javascript
// 查询平台列表
const { data, error } = await supabase
    .from('platforms')
    .select('*')
    .eq('status', 'active')
    .order('rating_avg', { ascending: false });

// 用户注册
const { data, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'password123'
});

// 用户登录
const { data, error } = await supabase.auth.signInWithPassword({
    email: 'user@example.com',
    password: 'password123'
});

// 添加收藏
const { data, error } = await supabase
    .from('favorites')
    .insert({
        user_id: user.id,
        item_type: 'platform',
        item_id: platformId
    });

// 提交案例
const { data, error } = await supabase
    .from('cases')
    .insert({
        user_nickname: '小王',
        city: '北京',
        platform_id: platformId,
        experience: '详细经历...',
        // ...其他字段
    });
```

---

## 七、管理后台

### 使用 Supabase Dashboard
1. Table Editor：直接编辑数据
2. SQL Editor：执行复杂查询
3. Authentication：管理用户

### 自定义管理后台（后续开发）
- 创建 admin.html 页面
- 使用 service_role key 进行管理员操作
- 配置管理员权限验证

---

## 八、备份与安全

### 数据备份
1. Supabase 自动每日备份（付费计划）
2. 手动备份：使用 pg_dump
   ```bash
   pg_dump -h db.xxxxxx.supabase.co -U postgres -d postgres > backup.sql
   ```

### 安全建议
1. **不要在前端暴露 service_role key**
2. **配置 RLS 策略**保护用户数据
3. **定期更新密码**
4. **启用两步验证**（管理账号）
5. **限制 API 访问域名**（Settings → API → Additional API URLs）

---

## 九、成本估算

### 免费计划（初期）
- 月活跃用户：约 1000 人
- 数据量：约 100MB
- API 调用：约 50万次/月

### 付费计划（增长期）
- Pro 计划：$25/月
- 数据库：8GB
- 存储：100GB
- 带宽：250GB/月

---

## 十、下一步

1. 创建 Supabase 项目
2. 执行数据库脚本
3. 配置 RLS 策略
4. 在前端集成 Supabase JS
5. 测试基本功能

完成后，你将获得：
- ✅ PostgreSQL 数据库
- ✅ 用户认证系统
- ✅ RESTful API
- ✅ 管理后台（Supabase Dashboard）
