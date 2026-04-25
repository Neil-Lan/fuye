/**
 * 副业发现平台 - 用户账户系统
 * 基于localStorage的用户认证和数据存储
 * 支持：注册、登录、收藏、浏览历史、用户偏好设置
 * 
 * 使用说明：
 * 1. 本系统基于localStorage存储，适用于静态网站
 * 2. 如需真正用户认证，建议集成 Supabase/Firebase/Auth.js
 * 3. 当前实现适合演示和小规模使用，数据存储在浏览器本地
 */

// ============================================
// 用户账户配置
// ============================================

var UserAccount = (function() {
  'use strict';

  var CONFIG = {
    STORAGE_PREFIX: 'fuye_user_',
    MAX_HISTORY: 100,
    MAX_FAVORITES: 200,
    SESSION_TIMEOUT: 7 * 24 * 60 * 60 * 1000 // 7天
  };

  // 加密密码（简单的base64，仅用于演示，生产环境请使用bcrypt或后端验证）
  function hashPassword(password) {
    return btoa(encodeURIComponent(password + '_fuye_salt_2024'));
  }

  function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
  }

  // 生成用户ID
  function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 获取当前用户
  function getCurrentUser() {
    try {
      var session = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'session') || 'null');
      if (!session) return null;
      
      // 检查会话是否过期
      if (Date.now() - session.loginTime > CONFIG.SESSION_TIMEOUT) {
        logout();
        return null;
      }
      
      var users = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'users') || '{}');
      return users[session.userId] || null;
    } catch (e) {
      return null;
    }
  }

  // 检查是否已登录
  function isLoggedIn() {
    return getCurrentUser() !== null;
  }

  // 注册
  function register(email, password, nickname) {
    try {
      // 验证邮箱格式
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { success: false, message: '请输入有效的邮箱地址' };
      }
      
      // 验证密码长度
      if (!password || password.length < 6) {
        return { success: false, message: '密码至少需要6个字符' };
      }
      
      // 验证昵称
      if (!nickname || nickname.length < 2) {
        return { success: false, message: '昵称至少需要2个字符' };
      }
      
      var users = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'users') || '{}');
      
      // 检查邮箱是否已注册
      for (var id in users) {
        if (users[id].email === email) {
          return { success: false, message: '该邮箱已被注册' };
        }
      }
      
      // 创建用户
      var userId = generateUserId();
      var user = {
        id: userId,
        email: email,
        nickname: nickname || email.split('@')[0],
        password: hashPassword(password),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        profile: {
          avatar: '',
          bio: '',
          city: '',
          interests: []
        },
        settings: {
          notifications: true,
          theme: 'auto',
          language: 'zh-CN'
        },
        stats: {
          loginCount: 1,
          lastLogin: new Date().toISOString(),
          totalVisits: 1
        }
      };
      
      users[userId] = user;
      localStorage.setItem(CONFIG.STORAGE_PREFIX + 'users', JSON.stringify(users));
      
      // 创建会话
      createSession(userId);
      
      return { success: true, message: '注册成功', user: sanitizeUser(user) };
    } catch (e) {
      console.error('注册失败:', e);
      return { success: false, message: '注册失败，请重试' };
    }
  }

  // 登录
  function login(email, password) {
    try {
      if (!email || !password) {
        return { success: false, message: '请输入邮箱和密码' };
      }
      
      var users = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'users') || '{}');
      var foundUser = null;
      var foundId = null;
      
      for (var id in users) {
        if (users[id].email === email) {
          foundUser = users[id];
          foundId = id;
          break;
        }
      }
      
      if (!foundUser) {
        return { success: false, message: '邮箱或密码错误' };
      }
      
      if (!verifyPassword(password, foundUser.password)) {
        return { success: false, message: '邮箱或密码错误' };
      }
      
      // 更新登录统计
      foundUser.stats.loginCount = (foundUser.stats.loginCount || 0) + 1;
      foundUser.stats.lastLogin = new Date().toISOString();
      foundUser.stats.totalVisits = (foundUser.stats.totalVisits || 0) + 1;
      foundUser.updatedAt = new Date().toISOString();
      users[foundId] = foundUser;
      localStorage.setItem(CONFIG.STORAGE_PREFIX + 'users', JSON.stringify(users));
      
      // 创建会话
      createSession(foundId);
      
      return { success: true, message: '登录成功', user: sanitizeUser(foundUser) };
    } catch (e) {
      console.error('登录失败:', e);
      return { success: false, message: '登录失败，请重试' };
    }
  }

  // 登出
  function logout() {
    localStorage.removeItem(CONFIG.STORAGE_PREFIX + 'session');
    localStorage.removeItem(CONFIG.STORAGE_PREFIX + 'history');
    return { success: true, message: '已退出登录' };
  }

  // 创建会话
  function createSession(userId) {
    var session = {
      userId: userId,
      loginTime: Date.now(),
      device: getDeviceInfo()
    };
    localStorage.setItem(CONFIG.STORAGE_PREFIX + 'session', JSON.stringify(session));
  }

  // 获取设备信息
  function getDeviceInfo() {
    var ua = navigator.userAgent;
    return {
      isMobile: /mobile|android|iphone|ipad/i.test(ua),
      browser: getBrowser(),
      os: getOS()
    };
  }

  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    return 'Other';
  }

  function getOS() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Windows') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1) return 'iOS';
    return 'Other';
  }

  // 更新用户资料
  function updateProfile(data) {
    var user = getCurrentUser();
    if (!user) {
      return { success: false, message: '请先登录' };
    }
    
    try {
      var users = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'users') || '{}');
      var userId = user.id;
      
      if (data.nickname) user.profile.nickname = data.nickname;
      if (data.bio !== undefined) user.profile.bio = data.bio;
      if (data.city !== undefined) user.profile.city = data.city;
      if (data.avatar !== undefined) user.profile.avatar = data.avatar;
      if (data.interests !== undefined) user.profile.interests = data.interests;
      
      user.updatedAt = new Date().toISOString();
      users[userId] = user;
      localStorage.setItem(CONFIG.STORAGE_PREFIX + 'users', JSON.stringify(users));
      
      return { success: true, message: '资料更新成功', user: sanitizeUser(user) };
    } catch (e) {
      return { success: false, message: '更新失败' };
    }
  }

  // 修改密码
  function changePassword(oldPassword, newPassword) {
    var user = getCurrentUser();
    if (!user) {
      return { success: false, message: '请先登录' };
    }
    
    if (!verifyPassword(oldPassword, user.password)) {
      return { success: false, message: '原密码错误' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, message: '新密码至少需要6个字符' };
    }
    
    try {
      var users = JSON.parse(localStorage.getItem(CONFIG.STORAGE_PREFIX + 'users') || '{}');
      user.password = hashPassword(newPassword);
      user.updatedAt = new Date().toISOString();
      users[user.id] = user;
      localStorage.setItem(CONFIG.STORAGE_PREFIX + 'users', JSON.stringify(users));
      
      return { success: true, message: '密码修改成功' };
    } catch (e) {
      return { success: false, message: '修改失败' };
    }
  }

  // 清除敏感信息
  function sanitizeUser(user) {
    var cleanUser = JSON.parse(JSON.stringify(user));
    delete cleanUser.password;
    return cleanUser;
  }

  // 返回公开API
  return {
    register: register,
    login: login,
    logout: logout,
    isLoggedIn: isLoggedIn,
    getCurrentUser: getCurrentUser,
    updateProfile: updateProfile,
    changePassword: changePassword,
    CONFIG: CONFIG
  };

})();

// ============================================
// 用户浏览历史管理
// ============================================

var UserHistory = (function() {
  'use strict';

  var HISTORY_KEY = 'fuye_user_history';
  var MAX_HISTORY = 100;

  // 添加浏览历史
  function addHistory(page, title, url) {
    try {
      var history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      
      // 移除相同URL的记录
      history = history.filter(function(item) {
        return item.url !== url;
      });
      
      // 添加新记录
      history.unshift({
        page: page,
        title: title,
        url: url,
        timestamp: Date.now(),
        date: new Date().toISOString()
      });
      
      // 限制数量
      if (history.length > MAX_HISTORY) {
        history = history.slice(0, MAX_HISTORY);
      }
      
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 获取浏览历史
  function getHistory(limit) {
    try {
      var history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      if (limit) {
        return history.slice(0, limit);
      }
      return history;
    } catch (e) {
      return [];
    }
  }

  // 清除浏览历史
  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    return true;
  }

  // 删除单条历史
  function removeHistory(url) {
    try {
      var history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      history = history.filter(function(item) {
        return item.url !== url;
      });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      return true;
    } catch (e) {
      return false;
    }
  }

  return {
    add: addHistory,
    get: getHistory,
    clear: clearHistory,
    remove: removeHistory
  };

})();

// ============================================
// 用户收藏管理（扩展版）
// ============================================

var UserFavorites = (function() {
  'use strict';

  var FAVORITES_KEY = 'fuye_user_favorites';
  var MAX_FAVORITES = 200;

  // 获取收藏
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  // 添加收藏
  function addFavorite(type, id, name, data) {
    try {
      var favorites = getFavorites();
      
      // 检查是否已收藏
      if (favorites.some(function(f) { return f.type === type && f.id === id; })) {
        return { success: false, message: '已经收藏过了' };
      }
      
      var favorite = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        type: type,
        refId: id,
        name: name,
        data: data || {},
        addedAt: new Date().toISOString(),
        tags: []
      };
      
      favorites.unshift(favorite);
      
      if (favorites.length > MAX_FAVORITES) {
        favorites = favorites.slice(0, MAX_FAVORITES);
      }
      
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return { success: true, message: '收藏成功', favorite: favorite };
    } catch (e) {
      return { success: false, message: '收藏失败' };
    }
  }

  // 移除收藏
  function removeFavorite(type, id) {
    try {
      var favorites = getFavorites();
      favorites = favorites.filter(function(f) {
        return !(f.type === type && f.refId === id);
      });
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      return { success: true, message: '已取消收藏' };
    } catch (e) {
      return { success: false, message: '取消收藏失败' };
    }
  }

  // 检查是否已收藏
  function isFavorited(type, id) {
    var favorites = getFavorites();
    return favorites.some(function(f) { return f.type === type && f.refId === id; });
  }

  // 获取收藏数量
  function getCount() {
    return getFavorites().length;
  }

  // 清空收藏
  function clearAll() {
    localStorage.removeItem(FAVORITES_KEY);
    return { success: true, message: '已清空所有收藏' };
  }

  // 添加标签
  function addTag(favoriteId, tag) {
    try {
      var favorites = getFavorites();
      var favorite = favorites.find(function(f) { return f.id === favoriteId; });
      if (favorite) {
        if (!favorite.tags) favorite.tags = [];
        if (!favorite.tags.includes(tag)) {
          favorite.tags.push(tag);
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        }
      }
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }

  return {
    get: getFavorites,
    add: addFavorite,
    remove: removeFavorite,
    isFavorited: isFavorited,
    count: getCount,
    clear: clearAll,
    addTag: addTag
  };

})();

// ============================================
// 用户偏好设置
// ============================================

var UserPreferences = (function() {
  'use strict';

  var PREF_KEY = 'fuye_user_preferences';

  var defaults = {
    theme: 'auto',
    fontSize: 'medium',
    language: 'zh-CN',
    notifications: {
      email: false,
      browser: true,
      scams: true,
      updates: true
    },
    privacy: {
      showProfile: true,
      shareHistory: false
    },
    recentlyViewed: true,
    autoMatch: true
  };

  function getPreferences() {
    try {
      var stored = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      return Object.assign({}, defaults, stored);
    } catch (e) {
      return defaults;
    }
  }

  function setPreferences(prefs) {
    try {
      var current = getPreferences();
      var updated = Object.assign({}, current, prefs);
      localStorage.setItem(PREF_KEY, JSON.stringify(updated));
      return { success: true, preferences: updated };
    } catch (e) {
      return { success: false };
    }
  }

  function resetPreferences() {
    localStorage.removeItem(PREF_KEY);
    return { success: true, preferences: defaults };
  }

  return {
    get: getPreferences,
    set: setPreferences,
    reset: resetPreferences
  };

})();

// ============================================
// 全局函数绑定
// ============================================

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    initUserSystem();
  });
} else {
  initUserSystem();
}

function initUserSystem() {
  // 添加浏览历史（如果存在历史记录功能）
  var pageName = document.querySelector('h1') ? document.querySelector('h1').textContent.trim() : document.title;
  var pageUrl = window.location.pathname;
  
  if (pageName && pageUrl) {
    UserHistory.add(pageName, pageName, pageUrl);
  }
}

// 导出到全局
window.UserAccount = UserAccount;
window.UserHistory = UserHistory;
window.UserFavorites = UserFavorites;
window.UserPreferences = UserPreferences;
