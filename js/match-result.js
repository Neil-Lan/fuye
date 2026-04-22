/**
 * 匹配结果保存功能
 */

const MATCH_RESULT_KEY = 'fuye_match_result';
const MATCH_RESULT_EXPIRY_DAYS = 7;

function saveMatchResult(result) {
  try {
    const data = {
      result,
      savedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + MATCH_RESULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem(MATCH_RESULT_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('保存匹配结果失败:', e);
    return false;
  }
}

function getMatchResult() {
  try {
    const data = localStorage.getItem(MATCH_RESULT_KEY);
    if (!data) {
      // 尝试获取旧格式的HTML
      const htmlData = localStorage.getItem('fuye_match_result_html');
      if (htmlData) {
        const parsed = JSON.parse(htmlData);
        const expiresAt = new Date(parsed.savedAt);
        expiresAt.setDate(expiresAt.getDate() + MATCH_RESULT_EXPIRY_DAYS);
        if (expiresAt > new Date()) {
          return { html: parsed.html };
        }
      }
      return null;
    }
    
    const parsed = JSON.parse(data);
    const expiresAt = new Date(parsed.expiresAt);
    
    if (expiresAt < new Date()) {
      localStorage.removeItem(MATCH_RESULT_KEY);
      return null;
    }
    
    return parsed.result;
  } catch {
    return null;
  }
}

function clearMatchResult() {
  localStorage.removeItem(MATCH_RESULT_KEY);
  localStorage.removeItem('fuye_match_result_html');
}

function hasRecentMatchResult() {
  return getMatchResult() !== null;
}

function getMatchResultAge() {
  try {
    const data = localStorage.getItem(MATCH_RESULT_KEY);
    if (!data) {
      const htmlData = localStorage.getItem('fuye_match_result_html');
      if (htmlData) {
        const parsed = JSON.parse(htmlData);
        const savedAt = new Date(parsed.savedAt);
        const now = new Date();
        const diffDays = Math.floor((now - savedAt) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return '今天';
        if (diffDays === 1) return '昨天';
        return `${diffDays}天前`;
      }
      return null;
    }
    
    const parsed = JSON.parse(data);
    const savedAt = new Date(parsed.savedAt);
    const now = new Date();
    const diffDays = Math.floor((now - savedAt) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    return `${diffDays}天前`;
  } catch {
    return null;
  }
}
