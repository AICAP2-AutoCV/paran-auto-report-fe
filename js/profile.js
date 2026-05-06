/* ================================================================
   사용자 정보 (localStorage)
================================================================ */

function loadUserInfo() {
  const saved = localStorage.getItem('user_info');
  if (saved) {
    try { userInfo = JSON.parse(saved); } catch { userInfo = {}; }
    updateProfileBtn();
  } else {
    openProfileModal(true);
  }
}

function openProfileModal(isOnboarding) {
  document.getElementById('profileModalTitle').textContent = isOnboarding ? '내 정보 입력' : '내 정보 수정';
  document.getElementById('profileHint').textContent = isOnboarding
    ? '보고서 상단 표에 자동으로 반영될 정보를 입력해 주세요.'
    : '저장된 정보를 수정하면 다음 다운로드부터 반영됩니다.';
  document.getElementById('profileSkip').style.display = isOnboarding ? '' : 'none';
  document.getElementById('pTeam').value      = userInfo.team_name  || '';
  document.getElementById('pDept').value      = userInfo.department || '';
  document.getElementById('pStudentId').value = userInfo.student_id || '';
  document.getElementById('pName').value      = userInfo.name       || '';
  document.getElementById('profileOverlay').classList.add('open');
}

function closeProfileModal() {
  document.getElementById('profileOverlay').classList.remove('open');
}

function saveUserInfo() {
  userInfo = {
    team_name:  document.getElementById('pTeam').value.trim(),
    department: document.getElementById('pDept').value.trim(),
    student_id: document.getElementById('pStudentId').value.trim(),
    name:       document.getElementById('pName').value.trim(),
  };
  localStorage.setItem('user_info', JSON.stringify(userInfo));
  updateProfileBtn();
  closeProfileModal();
}

function updateProfileBtn() {
  const btn = document.getElementById('profileBtn');
  const label = userInfo.name
    ? `${userInfo.name}${userInfo.student_id ? ' (' + userInfo.student_id + ')' : ''}`
    : '내 정보 설정';
  btn.setAttribute('title', label);
  btn.style.borderColor = userInfo.name ? 'var(--blue-400)' : '';
  btn.style.color       = userInfo.name ? 'var(--blue-600)' : '';
}
