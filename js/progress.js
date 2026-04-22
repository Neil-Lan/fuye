/**
 * 入门进度追踪功能
 */

const PROGRESS_KEY = 'fuye_guide_progress';

function getProgress() {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}

function isStepCompleted(platformId, stepIndex) {
  const progress = getProgress();
  return progress[platformId]?.[stepIndex] === true;
}

function markStepCompleted(platformId, stepIndex, completed) {
  const progress = getProgress();
  if (!progress[platformId]) {
    progress[platformId] = {};
  }
  progress[platformId][stepIndex] = completed;
  saveProgress(progress);
  updateProgressUI(platformId);
}

function getPlatformProgress(platformId) {
  const progress = getProgress();
  const steps = progress[platformId] || {};
  const completedCount = Object.values(steps).filter(v => v === true).length;
  return {
    completed: completedCount,
    total: 0, // 将在渲染时设置
    percentage: 0
  };
}

function updateProgressUI(platformId) {
  const progressEl = document.getElementById('guide-progress');
  const listEl = document.getElementById('guide-steps-list');
  if (!progressEl || !listEl) return;
  
  const progress = getProgress();
  const platformSteps = progress[platformId] || {};
  const totalSteps = listEl.querySelectorAll('.guide-step-item').length;
  const completedSteps = Object.values(platformSteps).filter(v => v === true).length;
  const percentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  progressEl.style.width = percentage + '%';
  progressEl.parentElement.querySelector('.progress-text').textContent = `${completedSteps}/${totalSteps} 步完成`;
}

function initProgressTracker(platformId, steps) {
  const progress = getProgress();
  const platformSteps = progress[platformId] || {};
  
  const listEl = document.getElementById('guide-steps-list');
  if (!listEl) return;
  
  listEl.innerHTML = steps.map((step, index) => {
    const isCompleted = platformSteps[index] === true;
    return `
      <div class="guide-step-item ${isCompleted ? 'completed' : ''}" data-step="${index}">
        <label class="guide-step-checkbox">
          <input type="checkbox" ${isCompleted ? 'checked' : ''} 
                 onchange="handleStepChange('${platformId}', ${index}, this.checked)">
          <span class="checkmark"></span>
        </label>
        <div class="guide-step-content">
          <div class="guide-step-header">
            <span class="guide-step-num">${index + 1}</span>
            <span class="guide-step-title">${step.标题}</span>
            ${isCompleted ? '<span class="guide-step-done">✓ 已完成</span>' : ''}
          </div>
          <p class="guide-step-desc">${step.操作}</p>
          ${step.注意事项?.length ? `
            <div class="guide-step-tips">
              <strong>⚠️ 注意：</strong>${step.注意事项.join('；')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  updateProgressUI(platformId);
}

function handleStepChange(platformId, stepIndex, checked) {
  markStepCompleted(platformId, stepIndex, checked);
  
  const item = document.querySelector(`.guide-step-item[data-step="${stepIndex}"]`);
  if (item) {
    item.classList.toggle('completed', checked);
    const doneSpan = item.querySelector('.guide-step-done');
    if (checked && !doneSpan) {
      item.querySelector('.guide-step-title').insertAdjacentHTML('afterend', '<span class="guide-step-done">✓ 已完成</span>');
    } else if (!checked && doneSpan) {
      doneSpan.remove();
    }
  }
  
  // 检查是否全部完成
  checkAllComplete(platformId);
}

function checkAllComplete(platformId) {
  const progress = getProgress();
  const platformSteps = progress[platformId] || {};
  const totalSteps = document.querySelectorAll('.guide-step-item').length;
  const completedSteps = Object.values(platformSteps).filter(v => v === true).length;
  
  if (completedSteps === totalSteps && totalSteps > 0) {
    showAllCompleteCelebration();
  }
}

function showAllCompleteCelebration() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.6);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
  `;
  
  modal.innerHTML = `
    <div style="background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 360px;">
      <div style="font-size: 4rem; margin-bottom: 16px;">🎉</div>
      <h2 style="color: #10b981; margin-bottom: 12px;">太棒了！</h2>
      <p style="color: #64748b; margin-bottom: 24px;">你已经完成了所有入门步骤！<br>现在可以开始在平台赚钱了。</p>
      <button onclick="this.closest('div').parentElement.remove()" class="btn btn-primary">
        开始赚钱 💰
      </button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  setTimeout(() => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }, 100);
}

function resetPlatformProgress(platformId) {
  if (confirm('确定要重置这个平台的入门进度吗？')) {
    const progress = getProgress();
    delete progress[platformId];
    saveProgress(progress);
    location.reload();
  }
}
