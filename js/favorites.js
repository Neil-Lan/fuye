/**
 * 收藏功能管理 - 使用localStorage存储
 */

// 收藏数据键名
const FAVORITES_KEY = 'fuye_favorites';

/**
 * 获取所有收藏
 */
function getFavorites() {
  try {
    const data = localStorage.getItem(FAVORITES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('获取收藏失败:', e);
    return [];
  }
}

/**
 * 保存收藏列表
 */
function saveFavorites(favorites) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (e) {
    console.error('保存收藏失败:', e);
    return false;
  }
}

/**
 * 检查是否已收藏
 */
function isFavorited(type, id) {
  const favorites = getFavorites();
  return favorites.some(f => f.type === type && f.id === id);
}

/**
 * 添加收藏
 */
function addFavorite(type, id, name, data = {}) {
  if (isFavorited(type, id)) {
    return { success: false, message: '已经收藏过了' };
  }
  
  const favorites = getFavorites();
  const favorite = {
    type,
    id,
    name,
    data,
    addedAt: new Date().toISOString()
  };
  
  favorites.push(favorite);
  
  if (saveFavorites(favorites)) {
    updateFavoriteButton(type, id, true);
    return { success: true, message: '收藏成功' };
  }
  
  return { success: false, message: '收藏失败，请重试' };
}

/**
 * 移除收藏
 */
function removeFavorite(type, id) {
  const favorites = getFavorites();
  const index = favorites.findIndex(f => f.type === type && f.id === id);
  
  if (index === -1) {
    return { success: false, message: '未找到该收藏' };
  }
  
  favorites.splice(index, 1);
  
  if (saveFavorites(favorites)) {
    updateFavoriteButton(type, id, false);
    return { success: true, message: '已取消收藏' };
  }
  
  return { success: false, message: '取消收藏失败，请重试' };
}

/**
 * 切换收藏状态
 */
function toggleFavorite(type, id, name, data = {}) {
  if (isFavorited(type, id)) {
    return removeFavorite(type, id);
  } else {
    return addFavorite(type, id, name, data);
  }
}

/**
 * 更新收藏按钮状态
 */
function updateFavoriteButton(type, id, isFav) {
  const btn = document.querySelector(`[data-favorite-btn="${type}-${id}"]`);
  if (btn) {
    btn.innerHTML = isFav ? '❤️ 已收藏' : '🤍 收藏';
    btn.classList.toggle('favorited', isFav);
  }
}

/**
 * 初始化收藏按钮
 */
function initFavoriteButton(type, id) {
  const btn = document.querySelector(`[data-favorite-btn="${type}-${id}"]`);
  if (btn) {
    const isFav = isFavorited(type, id);
    btn.innerHTML = isFav ? '❤️ 已收藏' : '🤍 收藏';
    btn.classList.toggle('favorited', isFav);
    
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const name = btn.dataset.name || document.title.replace(' - 副业发现平台', '');
      const result = toggleFavorite(type, id, name);
      showToast(result.message);
    });
  }
}

/**
 * 显示提示消息
 */
function showToast(message, duration = 2000) {
  // 移除已有toast
  const existingToast = document.querySelector('.toast-message');
  if (existingToast) existingToast.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    z-index: 10000;
    font-size: 0.9rem;
    animation: fadeInUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// 添加动画样式
if (!document.querySelector('#toast-animation')) {
  const style = document.createElement('style');
  style.id = 'toast-animation';
  style.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

/**
 * 获取收藏数量
 */
function getFavoritesCount() {
  return getFavorites().length;
}

/**
 * 清空所有收藏
 */
function clearAllFavorites() {
  if (confirm('确定要清空所有收藏吗？')) {
    localStorage.removeItem(FAVORITES_KEY);
    return { success: true, message: '已清空所有收藏' };
  }
  return { success: false, message: '已取消操作' };
}
