/**
 * 副业发现平台 - 数据统计分析模块
 * 无后端方案：支持百度统计、51.la、友盟+
 * 使用方法：
 * 1. 注册百度统计/51.la获取代码
 * 2. 将对应的代码复制到下方配置区域
 * 3. 在页面底部引入本文件
 */

(function() {
  'use strict';

  // ============================================
  // 配置区域 - 请在此处填入你的统计代码
  // ============================================

  const CONFIG = {
    // 百度统计 - 请将这里的hm.js?开头的链接替换为你的
    // 获取地址: https://tongji.baidu.com
    baiduTongji: {
      enabled: true,
      // 示例: //hm.baidu.com/hm.js?xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      src: '//hm.baidu.com/hm.js?3a4082b243b9831b69d28bdf0b173c10'
    },

    // 51.la统计 - 请将这里的链接替换为你的
    // 获取地址: https://www.51.la
    la51: {
      enabled: false,
      // 示例: //js.users.51.la/xxxxxxx.js
      src: ''
    },

    // 友盟+统计
    // 获取地址: https://www.umeng.com
    umeng: {
      enabled: false,
      // 示例: cpro_id为你的友盟应用ID
      cpro_id: ''
    },

    // 是否开启调试模式
    debug: false
  };

  // ============================================
  // 统计代码加载
  // ============================================

  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.onload = function() {
      if (CONFIG.debug) console.log('统计代码加载成功:', src);
      if (callback) callback();
    };
    script.onerror = function() {
      if (CONFIG.debug) console.error('统计代码加载失败:', src);
    };
    document.head.appendChild(script);
  }

  function initAnalytics() {
    // 百度统计
    if (CONFIG.baiduTongji.enabled && CONFIG.baiduTongji.src) {
      loadScript(CONFIG.baiduTongji.src);
    }

    // 51.la统计
    if (CONFIG.la51.enabled && CONFIG.la51.src) {
      loadScript(CONFIG.la51.src);
    }

    // 友盟+统计
    if (CONFIG.umeng.enabled && CONFIG.umeng.cpro_id) {
      var umengSrc = 'https://s4.cnzz.com/z_stat.php?id=' + CONFIG.umeng.cpro_id + '&web_id=' + CONFIG.umeng.cpro_id;
      loadScript(umengSrc);
    }
  }

  // ============================================
  // 自定义事件追踪
  // ============================================

  var Analytics = {
    // 追踪点击事件
    trackClick: function(category, action, label) {
      var data = {
        category: category || 'unknown',
        action: action || 'click',
        label: label || '',
        url: window.location.pathname,
        time: new Date().toISOString()
      };

      if (CONFIG.debug) {
        console.log('[Analytics Track]', data);
      }

      // 存储到 localStorage (可被 stats.html 读取展示)
      try {
        var events = JSON.parse(localStorage.getItem('fuye_events') || '[]');
        events.push(data);
        // 保留最近100条事件
        if (events.length > 100) events = events.slice(-100);
        localStorage.setItem('fuye_events', JSON.stringify(events));
      } catch (e) {
        if (CONFIG.debug) console.error('存储事件失败:', e);
      }

      // 百度统计自定义事件
      if (CONFIG.baiduTongji.enabled && window._hmt) {
        window._hmt.push(['_trackEvent', category, action, label]);
      }
    },

    // 追踪页面访问
    trackPage: function(pageName, pageTitle) {
      var data = {
        type: 'pageview',
        page: pageName || window.location.pathname,
        title: pageTitle || document.title,
        referrer: document.referrer,
        time: new Date().toISOString()
      };

      if (CONFIG.debug) {
        console.log('[Analytics Page]', data);
      }

      // 存储页面访问记录
      try {
        var views = JSON.parse(localStorage.getItem('fuye_pageviews') || '{}');
        var key = data.page;
        views[key] = views[key] || { count: 0, lastVisit: null };
        views[key].count++;
        views[key].lastVisit = data.time;
        views[key].title = data.title;
        localStorage.setItem('fuye_pageviews', JSON.stringify(views));
      } catch (e) {
        if (CONFIG.debug) console.error('存储页面访问失败:', e);
      }

      // 百度统计
      if (CONFIG.baiduTongji.enabled && window._hmt) {
        window._hmt.push(['_trackPageview', pageName]);
      }
    },

    // 追踪投稿成功
    trackSubmission: function(platform, success) {
      this.trackClick('投稿', success ? '投稿成功' : '投稿失败', platform);
      
      try {
        var submissions = JSON.parse(localStorage.getItem('fuye_submissions') || '[]');
        submissions.push({
          platform: platform,
          success: success,
          time: new Date().toISOString()
        });
        if (submissions.length > 100) submissions = submissions.slice(-100);
        localStorage.setItem('fuye_submissions', JSON.stringify(submissions));
      } catch (e) {}
    },

    // 追踪匹配测试
    trackMatch: function(resultType, questionCount) {
      this.trackClick('匹配测试', '完成测试', resultType + ' (问题数:' + questionCount + ')');
    }
  };

  // ============================================
  // 便捷追踪函数 (可全局调用)
  // ============================================

  // 追踪导航点击
  window.trackNavClick = function(linkName) {
    Analytics.trackClick('导航', '点击', linkName);
  };

  // 追踪按钮点击
  window.trackBtnClick = function(btnName, pageName) {
    Analytics.trackClick('按钮', '点击', btnName + (pageName ? ' @' + pageName : ''));
  };

  // 追踪外链点击
  window.trackOutLink = function(linkUrl) {
    Analytics.trackClick('外链', '点击', linkUrl);
    // 延迟跳转，确保统计发送
    return true;
  };

  // ============================================
  // 自动绑定事件
  // ============================================

  function bindEvents() {
    // 追踪所有导航链接
    document.addEventListener('click', function(e) {
      var target = e.target;
      while (target && target !== document) {
        if (target.tagName === 'A') {
          var href = target.href;
          var text = target.textContent.trim().substring(0, 30);
          
          // 外链
          if (href && href.indexOf(window.location.hostname) === -1 && href.indexOf('http') === 0) {
            Analytics.trackClick('外链', '点击', href.substring(0, 100));
          }
          break;
        }
        target = target.parentElement;
      }
    }, true);

    // 页面离开时追踪
    window.addEventListener('beforeunload', function() {
      Analytics.trackPage(window.location.pathname, document.title);
    });
  }

  // ============================================
  // 初始化
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initAnalytics();
      bindEvents();
      // 首次访问追踪
      Analytics.trackPage();
    });
  } else {
    initAnalytics();
    bindEvents();
    Analytics.trackPage();
  }

  // 暴露全局接口
  window.FuyeAnalytics = Analytics;

})();

// ============================================
// 增强统计功能 - 2026年4月24日
// ============================================

(function() {
  'use strict';

  // 用户会话管理
  var UserSession = {
    SESSION_KEY: 'fuye_session',
    SESSION_TIMEOUT: 30 * 60 * 1000,

    getOrCreateSession: function() {
      try {
        var session = JSON.parse(localStorage.getItem(this.SESSION_KEY) || '{}');
        var now = Date.now();
        
        if (!session.id || (now - session.lastActivity > this.SESSION_TIMEOUT)) {
          session = {
            id: 'sess_' + now + '_' + Math.random().toString(36).substr(2, 9),
            created: now,
            lastActivity: now,
            pageViews: 0,
            events: [],
            device: this.getDeviceInfo()
          };
        } else {
          session.lastActivity = now;
          session.pageViews = (session.pageViews || 0) + 1;
        }
        
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        return session;
      } catch (e) {
        return { id: 'error_' + Date.now(), pageViews: 1, events: [] };
      }
    },

    getDeviceInfo: function() {
      var ua = navigator.userAgent;
      return {
        isMobile: /mobile|android|iphone|ipad/i.test(ua),
        isTablet: /tablet|ipad/i.test(ua),
        browser: this.getBrowser(),
        os: this.getOS()
      };
    },

    getBrowser: function() {
      var ua = navigator.userAgent;
      if (ua.indexOf('Firefox') > -1) return 'Firefox';
      if (ua.indexOf('Chrome') > -1) return 'Chrome';
      if (ua.indexOf('Safari') > -1) return 'Safari';
      if (ua.indexOf('Edge') > -1) return 'Edge';
      return 'Other';
    },

    getOS: function() {
      var ua = navigator.userAgent;
      if (ua.indexOf('Windows') > -1) return 'Windows';
      if (ua.indexOf('Mac') > -1) return 'macOS';
      if (ua.indexOf('Linux') > -1) return 'Linux';
      if (ua.indexOf('Android') > -1) return 'Android';
      if (ua.indexOf('iOS') > -1) return 'iOS';
      return 'Other';
    }
  };

  var EnhancedAnalytics = {
    trackSession: function() {
      var session = UserSession.getOrCreateSession();
      try {
        var sessions = JSON.parse(localStorage.getItem('fuye_sessions') || '[]');
        var today = new Date().toDateString();
        var todaySessions = sessions.filter(function(s) {
          return new Date(s.created).toDateString() === today;
        });
        if (!todaySessions.some(function(s) { return s.id === session.id; })) {
          sessions.push(session);
        }
        var thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        sessions = sessions.filter(function(s) { return s.created > thirtyDaysAgo; });
        localStorage.setItem('fuye_sessions', JSON.stringify(sessions));
      } catch (e) {}
      return session;
    },

    trackUserPath: function(to) {
      try {
        var paths = JSON.parse(localStorage.getItem('fuye_user_paths') || '{}');
        var session = JSON.parse(localStorage.getItem(UserSession.SESSION_KEY) || '{}');
        var sessionId = session.id || 'unknown';
        if (!paths[sessionId]) paths[sessionId] = [];
        paths[sessionId].push({
          from: window.location.pathname,
          to: to,
          time: new Date().toISOString()
        });
        localStorage.setItem('fuye_user_paths', JSON.stringify(paths));
      } catch (e) {}
    },

    getSummaryStats: function() {
      try {
        var sessions = JSON.parse(localStorage.getItem('fuye_sessions') || '[]');
        var today = new Date().toDateString();
        var todaySessions = sessions.filter(function(s) {
          return new Date(s.created).toDateString() === today;
        });
        var uniqueTodaySessions = [...new Set(todaySessions.map(function(s) { return s.id; }))];
        var sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        var weekSessions = sessions.filter(function(s) { return s.created > sevenDaysAgo; });
        var uniqueWeekSessions = [...new Set(weekSessions.map(function(s) { return s.id; }))];
        var pageviews = JSON.parse(localStorage.getItem('fuye_pageviews') || '{}');
        var totalPV = Object.values(pageviews).reduce(function(sum, p) { return sum + (p.count || 0); }, 0);
        var deviceStats = { mobile: 0, tablet: 0, desktop: 0 };
        todaySessions.forEach(function(s) {
          if (s.device) {
            if (s.device.isMobile) deviceStats.mobile++;
            else if (s.device.isTablet) deviceStats.tablet++;
            else deviceStats.desktop++;
          }
        });
        var hotPages = Object.entries(pageviews)
          .map(function(entry) { return { path: entry[0], count: entry[1].count || 0 }; })
          .sort(function(a, b) { return b.count - a.count; })
          .slice(0, 10);
        return {
          todayUV: uniqueTodaySessions.length,
          weekUV: uniqueWeekSessions.length,
          totalPV: totalPV,
          deviceStats: deviceStats,
          hotPages: hotPages,
          sessionCount: sessions.length
        };
      } catch (e) {
        return {
          todayUV: 0, weekUV: 0, totalPV: 0,
          deviceStats: { mobile: 0, tablet: 0, desktop: 0 },
          hotPages: [], sessionCount: 0
        };
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      EnhancedAnalytics.trackSession();
    });
  } else {
    EnhancedAnalytics.trackSession();
  }

  window.FuyeEnhancedAnalytics = EnhancedAnalytics;
  window.FuyeUserSession = UserSession;

})();
