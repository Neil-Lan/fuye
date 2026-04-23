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
      enabled: false,
      // 示例: //hm.baidu.com/hm.js?xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
      src: ''
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
