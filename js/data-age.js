/**
 * 副业发现平台 - 内容时效性管理模块
 * 用于标注和提醒内容的数据更新时间
 * 超过6个月的数据会显示"请核实最新情况"提示
 * 
 * 使用方法：
 * 1. 在HTML中使用 data-timestamp="2024-01-15" 标记更新时间
 * 2. 或使用 showDataAge(containerSelector) 自动处理容器内内容
 */

var DataAgeManager = (function() {
  'use strict';

  var CONFIG = {
    // 警告阈值（天）
    WARNING_THRESHOLD: 90,    // 3个月 - 显示"建议核实"
    EXPIRED_THRESHOLD: 180,   // 6个月 - 显示"请核实最新情况"
    CRITICAL_THRESHOLD: 365,  // 1年 - 显示"数据可能过时"
    
    // 提示文字
    LABELS: {
      fresh: '数据已更新',
      warning: '⚠️ 数据更新于 {date}，建议核实最新情况',
      expired: '⚠️ 数据更新于 {date}，请核实最新情况',
      critical: '❌ 数据更新于 {date}，可能已过时'
    },
    
    // 本地存储键名
    STORAGE_KEY: 'fuye_data_timestamps'
  };

  // 获取当前日期
  function getCurrentDate() {
    return new Date();
  }

  // 解析日期字符串
  function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // 支持多种日期格式
    var formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/,           // 2024-01-15
      /^(\d{4})\/(\d{2})\/(\d{2})$/,         // 2024/01/15
      /^(\d{4})(\d{2})(\d{2})$/,             // 20240115
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/  // ISO格式
    ];
    
    for (var i = 0; i < formats.length; i++) {
      var match = dateStr.match(formats[i]);
      if (match) {
        return new Date(dateStr);
      }
    }
    
    // 尝试直接解析
    var date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  }

  // 计算日期差异（天）
  function getDaysDiff(date) {
    var parsed = parseDate(date);
    if (!parsed) return 0;
    
    var now = getCurrentDate();
    var diff = now.getTime() - parsed.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // 格式化日期显示
  function formatDate(date) {
    var parsed = parseDate(date);
    if (!parsed) return '未知时间';
    
    var year = parsed.getFullYear();
    var month = ('0' + (parsed.getMonth() + 1)).slice(-2);
    var day = ('0' + parsed.getDate()).slice(-2);
    
    return year + '年' + month + '月' + day + '日';
  }

  // 获取数据新鲜度状态
  function getFreshnessStatus(dateStr) {
    var days = getDaysDiff(dateStr);
    
    if (days <= CONFIG.WARNING_THRESHOLD) {
      return {
        status: 'fresh',
        label: CONFIG.LABELS.fresh,
        className: 'data-fresh',
        days: days
      };
    } else if (days <= CONFIG.EXPIRED_THRESHOLD) {
      return {
        status: 'warning',
        label: CONFIG.LABELS.warning.replace('{date}', formatDate(dateStr)),
        className: 'data-warning',
        days: days
      };
    } else if (days <= CONFIG.CRITICAL_THRESHOLD) {
      return {
        status: 'expired',
        label: CONFIG.LABELS.expired.replace('{date}', formatDate(dateStr)),
        className: 'data-expired',
        days: days
      };
    } else {
      return {
        status: 'critical',
        label: CONFIG.LABELS.critical.replace('{date}', formatDate(dateStr)),
        className: 'data-critical',
        days: days
      };
    }
  }

  // 创建数据时效提示元素
  function createAgeBadge(dateStr, options) {
    var status = getFreshnessStatus(dateStr);
    var config = Object.assign({
      showDays: false,
      showDate: true,
      inline: false,
      clickable: false
    }, options || {});
    
    var badge = document.createElement('span');
    badge.className = 'data-age-badge ' + status.className;
    
    var text = status.label;
    if (config.showDays && status.days > 0) {
      text += ' (' + status.days + '天前)';
    }
    
    if (config.clickable) {
      var link = document.createElement('a');
      link.href = '#';
      link.textContent = text;
      link.title = '点击查看最新数据';
      badge.appendChild(link);
    } else {
      badge.textContent = text;
    }
    
    return badge;
  }

  // 自动处理容器内的数据时效标记
  function processContainer(containerSelector) {
    var container = document.querySelector(containerSelector);
    if (!container) return;
    
    // 查找所有带有 data-timestamp 属性的元素
    var elements = container.querySelectorAll('[data-timestamp]');
    
    elements.forEach(function(el) {
      var dateStr = el.getAttribute('data-timestamp');
      var status = getFreshnessStatus(dateStr);
      
      // 添加样式类
      el.classList.add('data-age-' + status.status);
      
      // 如果是过期数据，添加提示
      if (status.status !== 'fresh') {
        // 检查是否已有badge
        var existingBadge = el.querySelector('.data-age-badge');
        if (!existingBadge) {
          var badge = createAgeBadge(dateStr, { showDays: true });
          el.appendChild(badge);
        }
      }
    });
    
    // 处理 data-collect-time 属性（数据采集时间）
    var collectElements = container.querySelectorAll('[data-collect-time]');
    collectElements.forEach(function(el) {
      var dateStr = el.getAttribute('data-collect-time');
      var status = getFreshnessStatus(dateStr);
      
      el.classList.add('data-age-' + status.status);
      
      if (status.status !== 'fresh') {
        var existingTip = el.querySelector('.data-age-tip');
        if (!existingTip) {
          var tip = document.createElement('small');
          tip.className = 'data-age-tip ' + status.className;
          tip.textContent = status.label;
          el.appendChild(tip);
        }
      }
    });
  }

  // 保存数据时间戳到本地存储
  function saveTimestamp(key, dateStr) {
    try {
      var timestamps = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
      timestamps[key] = {
        date: dateStr,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(timestamps));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 获取保存的时间戳
  function getTimestamp(key) {
    try {
      var timestamps = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
      return timestamps[key] || null;
    } catch (e) {
      return null;
    }
  }

  // 获取所有保存的时间戳
  function getAllTimestamps() {
    try {
      return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  // 清理过期的时间戳记录
  function cleanupTimestamps() {
    try {
      var timestamps = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '{}');
      var keys = Object.keys(timestamps);
      var cleaned = {};
      
      keys.forEach(function(key) {
        var item = timestamps[key];
        var days = getDaysDiff(item.date);
        // 只保留90天内的记录
        if (days <= 90) {
          cleaned[key] = item;
        }
      });
      
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(cleaned));
      return true;
    } catch (e) {
      return false;
    }
  }

  // 添加CSS样式
  function injectStyles() {
    if (document.getElementById('data-age-styles')) return;
    
    var style = document.createElement('style');
    style.id = 'data-age-styles';
    style.textContent = `
      .data-age-badge, .data-age-tip {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 0.75rem;
        margin-left: 8px;
        vertical-align: middle;
      }
      
      .data-fresh {
        color: #22c55e;
      }
      
      .data-age-badge.data-fresh, .data-age-tip.data-fresh {
        background: #dcfce7;
        color: #16a34a;
      }
      
      .data-warning {
        color: #f59e0b;
      }
      
      .data-age-badge.data-warning, .data-age-tip.data-warning {
        background: #fef3c7;
        color: #d97706;
      }
      
      .data-expired {
        color: #ef4444;
      }
      
      .data-age-badge.data-expired, .data-age-tip.data-expired {
        background: #fee2e2;
        color: #dc2626;
      }
      
      .data-critical {
        color: #991b1b;
      }
      
      .data-age-badge.data-critical, .data-age-tip.data-critical {
        background: #fecaca;
        color: #991b1b;
      }
      
      .data-age-warning-box {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 12px 0;
        font-size: 0.875rem;
        color: #92400e;
      }
      
      .data-age-expired-box {
        background: #fee2e2;
        border: 1px solid #ef4444;
        border-radius: 8px;
        padding: 12px 16px;
        margin: 12px 0;
        font-size: 0.875rem;
        color: #991b1b;
      }
    `;
    
    document.head.appendChild(style);
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectStyles);
  } else {
    injectStyles();
  }

  // 定期清理过期数据
  cleanupTimestamps();

  // 返回API
  return {
    getFreshnessStatus: getFreshnessStatus,
    formatDate: formatDate,
    getDaysDiff: getDaysDiff,
    createAgeBadge: createAgeBadge,
    processContainer: processContainer,
    saveTimestamp: saveTimestamp,
    getTimestamp: getTimestamp,
    getAllTimestamps: getAllTimestamps,
    CONFIG: CONFIG
  };

})();

// ============================================
// 便捷使用函数
// ============================================

// 格式化相对时间
function formatRelativeTime(dateStr) {
  var days = DataAgeManager.getDaysDiff(dateStr);
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return days + '天前';
  if (days < 30) return Math.floor(days / 7) + '周前';
  if (days < 365) return Math.floor(days / 30) + '个月前';
  return Math.floor(days / 365) + '年前';
}

// 创建最后更新时间提示
function createLastUpdatedTip(dateStr) {
  var status = DataAgeManager.getFreshnessStatus(dateStr);
  var relativeTime = formatRelativeTime(dateStr);
  
  var tip = document.createElement('div');
  tip.className = 'data-age-' + status.status + '-box';
  
  if (status.status === 'fresh') {
    tip.innerHTML = '✅ 最后更新：' + relativeTime + '（' + DataAgeManager.formatDate(dateStr) + '）';
  } else {
    tip.innerHTML = status.label + '（' + relativeTime + '前）<br><small>副业市场变化快，建议在选择前核实最新情况</small>';
  }
  
  return tip;
}

// 导出到全局
window.DataAgeManager = DataAgeManager;
window.formatRelativeTime = formatRelativeTime;
window.createLastUpdatedTip = createLastUpdatedTip;
