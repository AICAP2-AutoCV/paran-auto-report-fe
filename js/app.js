/* ================================================================
   진입점: init, 이벤트 바인딩, 메시지 전송, 날짜 파싱
================================================================ */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('apiUrlInput').value = API_BASE;
  document.getElementById('apiLabel').textContent = API_BASE.replace(/^https?:\/\//, '').slice(0, 28);
  appendWelcome();
  checkHealth();
  bindEvents();
  loadUserInfo();
});

function bindEvents() {
  // API badge
  document.getElementById('apiBadge').addEventListener('click', e => {
    e.stopPropagation();
    document.getElementById('apiPopover').classList.toggle('open');
  });
  document.addEventListener('click', () => {
    document.getElementById('apiPopover').classList.remove('open');
  });
  document.getElementById('apiPopover').addEventListener('click', e => e.stopPropagation());

  document.getElementById('apiUrlInput').addEventListener('change', function () {
    API_BASE = this.value.replace(/\/$/, '');
    document.getElementById('apiLabel').textContent = API_BASE.replace(/^https?:\/\//, '').slice(0, 28);
    checkHealth();
  });

  // 전송
  document.getElementById('sendBtn').addEventListener('click', sendMessage);
  document.getElementById('chatInput').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.isComposing) sendMessage();
  });

  // 칩
  document.getElementById('chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (chip) {
      document.getElementById('chatInput').value = chip.textContent;
      document.getElementById('chatInput').focus();
    }
  });

  // 프로필
  document.getElementById('profileBtn').addEventListener('click', () => openProfileModal(false));
  document.getElementById('profileClose').addEventListener('click', closeProfileModal);
  document.getElementById('profileSkip').addEventListener('click', closeProfileModal);
  document.getElementById('profileSave').addEventListener('click', saveUserInfo);
  document.getElementById('profileOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('profileOverlay')) closeProfileModal();
  });

  // 미리보기 모달
  const closePreview = () => document.getElementById('previewOverlay').classList.remove('open');
  document.getElementById('previewClose').addEventListener('click', closePreview);
  document.getElementById('previewCloseBtn').addEventListener('click', closePreview);
  document.getElementById('previewOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('previewOverlay')) closePreview();
  });
  document.getElementById('previewDlBtn').addEventListener('click', async () => {
    const btn = document.getElementById('previewDlBtn');
    const fmt = document.getElementById('previewFmt').value;
    await withLoading(btn, () => exportDoc(previewMd, fmt, '보고서', '', previewImages));
  });
}

/* ── 메시지 전송 ──────────────────────────────────────────────── */

async function sendMessage() {
  if (isStreaming) return;
  const input = document.getElementById('chatInput');
  const topic = input.value.trim();
  if (!topic) return;

  input.value = '';
  document.getElementById('chips').style.display = 'none';
  setUI(false);
  appendUserMsg(topic);

  const dateParams = extractDateParams(topic);
  const req = { topic, k: 10, session_id: `web-${Date.now()}`, ...dateParams, role: userInfo.role || undefined };

  const loadRow = appendLoadingMsg();
  try {
    const payload = await generateFullReport(req);
    loadRow.remove();
    appendReportCard(payload.report || '', topic, dateParams, payload.trace_id || '', payload.images || []);
  } catch (err) {
    loadRow.remove();
    appendErrorMsg(err.message || String(err));
  } finally {
    setUI(true);
  }
}

/* ── 한국어 날짜 파싱 ─────────────────────────────────────────── */

function extractDateParams(text) {
  const explicitRange = text.match(/(\d{4}-\d{2}-\d{2})\s*(?:~|부터|에서|-|—|–|to)\s*(\d{4}-\d{2}-\d{2})/i);
  if (explicitRange) return { since: explicitRange[1], until: explicitRange[2] };

  const explicitDates = [...text.matchAll(/\d{4}-\d{2}-\d{2}/g)].map(m => m[0]);
  if (explicitDates.length >= 2) return { since: explicitDates[0], until: explicitDates[1] };
  if (explicitDates.length === 1) return { since: explicitDates[0], until: explicitDates[0] };

  if (/이번\s*주|이번주/.test(text))                   return { use_this_week: true };
  if (/지난\s*주|저번\s*주|지난주|저번주/.test(text)) {
    const n = new Date(), dow = n.getDay() || 7;
    const mon = new Date(n); mon.setDate(n.getDate() - dow - 6);
    const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
    return { since: iso(mon), until: iso(sun) };
  }
  const dm = text.match(/최근\s*(\d+)\s*일/);
  if (dm) return { last_days: parseInt(dm[1]) };
  const wm = text.match(/최근\s*(\d+)\s*주/);
  if (wm) return { last_days: parseInt(wm[1]) * 7 };
  if (/이번\s*달|이번달/.test(text)) return { last_days: 30 };
  if (/지난\s*달|저번\s*달|지난달|저번달/.test(text)) {
    const n = new Date();
    return {
      since: iso(new Date(n.getFullYear(), n.getMonth() - 1, 1)),
      until: iso(new Date(n.getFullYear(), n.getMonth(), 0)),
    };
  }
  if (/오늘/.test(text)) { const t = iso(new Date()); return { since: t, until: t }; }
  return { use_this_week: true };
}
