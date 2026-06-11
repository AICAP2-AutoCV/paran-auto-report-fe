/* ================================================================
   UI 헬퍼 & 메시지/카드 빌더
================================================================ */

const msgs        = () => document.getElementById('messages');
const scrollBottom = () => { const el = msgs(); el.scrollTop = el.scrollHeight; };
const iso         = d  => d.toISOString().slice(0, 10);
const esc         = s  => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const now         = () => new Date().toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', hour12:false });

function setUI(enabled) {
  isStreaming = !enabled;
  document.getElementById('chatInput').disabled = !enabled;
  document.getElementById('sendBtn').disabled   = !enabled;
}

async function withLoading(btn, fn) {
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<div class="spin"></div>';
  try { await fn(); } finally { btn.disabled = false; btn.innerHTML = orig; }
}

/* ── 메시지 빌더 ──────────────────────────────────────────────── */

function appendWelcome() {
  const hero = document.createElement('div');
  hero.className = 'welcome-hero';
  hero.innerHTML = `
    <div class="hero-icon-wrap">
      <svg fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M8 12h8M8 8h8M8 16h4"/>
      </svg>
    </div>
    <div>
      <div class="hero-title">파RAG학기에 오신 것을 환영합니다</div>
      <div class="hero-desc" style="margin-top:8px">Notion 데이터를 기반으로 AI가 자동으로 보고서를 작성합니다. 아래 버튼을 클릭하거나 직접 입력해 보세요.</div>
    </div>
    <div class="hero-features">
      <div class="hero-feat">
        <div class="hero-feat-icon blue">🔍</div>
        <div class="hero-feat-name">RAG 검색</div>
        <div class="hero-feat-desc">Notion 데이터를 의미 기반으로 검색</div>
      </div>
      <div class="hero-feat">
        <div class="hero-feat-icon green">📄</div>
        <div class="hero-feat-name">자동 보고서</div>
        <div class="hero-feat-desc">주제와 기간을 입력하면 즉시 생성</div>
      </div>
      <div class="hero-feat">
        <div class="hero-feat-icon purple">🎓</div>
        <div class="hero-feat-name">맞춤 재생성</div>
        <div class="hero-feat-desc">학과별 스타일로 재구성</div>
      </div>
    </div>`;
  msgs().appendChild(hero);
}

function appendUserMsg(text) {
  const row = document.createElement('div');
  row.className = 'msg-row user';
  row.innerHTML = `
    <div class="avatar">나</div>
    <div class="msg-body">
      <span class="msg-name" style="text-align:right">사용자</span>
      <div class="bubble">${esc(text)}</div>
      <span class="msg-time" style="text-align:right">${now()}</span>
    </div>`;
  msgs().appendChild(row);
  scrollBottom();
}

function appendLoadingMsg() {
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.innerHTML = `
    <div class="avatar">AI</div>
    <div class="msg-body">
      <span class="msg-name">AI 어시스턴트</span>
      <div class="bubble">보고서를 생성하고 있습니다<span class="dots"><span>.</span><span>.</span><span>.</span></span></div>
    </div>`;
  msgs().appendChild(row);
  scrollBottom();
  return row;
}

function appendStreamingMsg() {
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  const el = document.createElement('div');
  el.className = 'stream-bubble';
  row.innerHTML = `<div class="avatar">AI</div><div class="msg-body wide"><span class="msg-name">AI 어시스턴트</span></div>`;
  row.querySelector('.msg-body').appendChild(el);
  return { row, el };
}

function appendErrorMsg(msg) {
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.innerHTML = `
    <div class="avatar">AI</div>
    <div class="msg-body">
      <span class="msg-name">AI 어시스턴트</span>
      <div class="bubble error">${esc(msg)}</div>
    </div>`;
  msgs().appendChild(row);
  scrollBottom();
}

/* ── 보고서 카드 ──────────────────────────────────────────────── */

function appendReportCard(md, topic, dateParams, traceId = '', images = []) {
  const cid = 'rc_' + Date.now();
  const dateLabel = dateParams.use_this_week ? '이번 주'
    : dateParams.last_days ? `최근 ${dateParams.last_days}일`
    : dateParams.since ? `${dateParams.since}${dateParams.until ? ' ~ ' + dateParams.until : ''}` : '전체';

  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.id = cid;
  row.dataset.md = md;
  row.dataset.traceId = traceId;
  row.dataset.images = JSON.stringify(images || []);
  row.dataset.topic = topic;
  row.innerHTML = `
    <div class="avatar">AI</div>
    <div class="msg-body wide">
      <span class="msg-name">AI 어시스턴트</span>
      <div class="card">
        <div class="card-accent"></div>
        <div class="card-inner">
          <div class="card-title">
            <span>📄 보고서 생성 완료</span>
            <span class="date-badge">${esc(dateLabel)}</span>
          </div>
          <div class="card-meta-grid">
            <div class="card-row">
              <span class="card-lbl">주제</span>
              <span class="card-val">${esc(topic.slice(0, 60))}</span>
            </div>
            <div class="card-row">
              <span class="card-lbl">생성 시각</span>
              <span class="card-val">${new Date().toLocaleString('ko-KR',{hour12:false})}</span>
            </div>
            <div class="card-row">
              <span class="card-lbl">관련 이미지</span>
              <span class="card-val">${images?.length ? `${images.length}개 포함` : '없음'}</span>
            </div>
          </div>
          <label class="glossary-toggle">
            <input type="checkbox" id="${cid}_glossary" />
            용어 해설 추가
            <span id="${cid}_glossarySpin" style="display:none"><div class="spin" style="width:12px;height:12px;border-width:2px;"></div></span>
          </label>
          <div class="icon-bar">
            <button class="icon-btn" data-action="preview">
              <svg fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              미리보기
            </button>
            <button class="icon-btn" data-action="download">
              <svg fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              다운로드
            </button>
            <button class="icon-btn" data-action="feedback">
              <svg fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              피드백
            </button>
          </div>
          <button class="regen-btn" data-action="regen">
            <svg fill="none" stroke-width="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            학과별 맞춤 재생성
          </button>
        </div>
      </div>
      <span class="msg-time">${now()}</span>
    </div>`;

  row.querySelector('.card').addEventListener('click', e => {
    const actionBtn = e.target.closest('[data-action]');
    const action = actionBtn?.dataset.action;
    if (!action) return;
    const cardMd = row.dataset.md;
    const cardImages = parseImages(row.dataset.images);
    if (action === 'preview')  openPreview(cardMd, cardImages, row.dataset.topic || '');
    if (action === 'download') appendDownloadCard(cid);
    if (action === 'feedback') appendFeedbackCard(cid);
    if (action === 'regen')    appendRegenCard(cid);
  });

  const glossaryCheckbox = row.querySelector(`#${cid}_glossary`);
  const glossarySpin     = row.querySelector(`#${cid}_glossarySpin`);
  glossaryCheckbox.addEventListener('change', async () => {
    if (glossaryCheckbox.checked) {
      if (!row.dataset.originalMd) row.dataset.originalMd = row.dataset.md;
      glossaryCheckbox.disabled = true;
      glossarySpin.style.display = 'inline-flex';
      try {
        const payload = await addGlossary(row.dataset.md);
        row.dataset.md = payload.markdown || row.dataset.md;
        row.dataset.glossaryTerms = JSON.stringify(payload.glossary_terms || []);
      } catch (err) {
        appendErrorMsg(err.message || String(err));
        glossaryCheckbox.checked = false;
        if (row.dataset.originalMd) row.dataset.md = row.dataset.originalMd;
      } finally {
        glossaryCheckbox.disabled = false;
        glossarySpin.style.display = 'none';
      }
    } else {
      if (row.dataset.originalMd) row.dataset.md = row.dataset.originalMd;
    }
  });

  msgs().appendChild(row);
  scrollBottom();
}

async function generateGlossaryForCard(row, btn) {
  const md = row.dataset.md || '';
  if (!md.trim()) return;

  try {
    await withLoading(btn, async () => {
      const payload = await addGlossary(md);
      row.dataset.md = payload.markdown || md;
      row.dataset.glossaryTerms = JSON.stringify(payload.glossary_terms || []);
      openPreview(row.dataset.md, parseImages(row.dataset.images));
    });
  } catch (err) {
    appendErrorMsg(err.message || String(err));
  }
}

/* ── 미리보기 모달 ────────────────────────────────────────────── */

function parseImages(raw) {
  try {
    const images = JSON.parse(raw || '[]');
    return Array.isArray(images) ? images : [];
  } catch {
    return [];
  }
}

function cleanMdForPreview(md) {
  return md
    .replace(/\[TITLE\].*?\[\/TITLE\]\n?/gs, '')
    .replace(/\[REPORT_HEADER\].*?\[\/REPORT_HEADER\]\n?/gs, '')
    .replace(/<span\b[^>]*>(.*?)<\/span>/gis, '$1');
}

function openPreview(md, images = [], topic = '') {
  previewMd = md;
  previewImages = images;
  previewTopic = topic;
  document.getElementById('previewBody').innerHTML = marked.parse(cleanMdForPreview(md));
  document.getElementById('previewOverlay').classList.add('open');
}

/* ── 실제 파일 미리보기 모달 ─────────────────────────────────── */

async function openDocPreview(md, images = [], triggerBtn) {
  const overlay = document.getElementById('pdfOverlay');
  const frame   = document.getElementById('pdfFrame');
  const loading = document.getElementById('pdfLoading');

  frame.style.display = 'none';
  frame.src = 'about:blank';
  loading.style.display = 'flex';
  overlay.classList.add('open');

  try {
    await withLoading(triggerBtn, async () => {
      const r = await fetch(`${API_BASE}/document/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          markdown:   md,
          format:     'docx',
          title:      '보고서',
          author:     userInfo.name || 'Unknown',
          student_id: userInfo.student_id || undefined,
          department: userInfo.department || undefined,
          team_name:  userInfo.team_name  || undefined,
          role:       userInfo.role       || undefined,
          images,
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const html = await r.text();
      loading.style.display = 'none';
      frame.style.display = 'block';
      frame.srcdoc = html;
    });
  } catch (err) {
    loading.style.display = 'none';
    frame.style.display = 'block';
    frame.srcdoc = `<p style="color:red;padding:20px">미리보기 생성 실패: ${err.message}</p>`;
  }
}

document.getElementById('pdfClose').addEventListener('click', () => {
  document.getElementById('pdfOverlay').classList.remove('open');
});
document.getElementById('pdfCloseBtn').addEventListener('click', () => {
  document.getElementById('pdfOverlay').classList.remove('open');
});

/* ── 다운로드 동의 확인 ───────────────────────────────────────── */

let _consentCallback = null;

(function initConsent() {
  const overlay   = document.getElementById('consentOverlay');
  const okBtn     = document.getElementById('consentOk');
  const aiCb      = document.getElementById('consentAI');
  const useCb     = document.getElementById('consentUse');

  function updateOk() {
    okBtn.disabled = !(aiCb.checked && useCb.checked);
  }
  aiCb.addEventListener('change', updateOk);
  useCb.addEventListener('change', updateOk);

  function closeConsent() {
    overlay.classList.remove('open');
    aiCb.checked  = false;
    useCb.checked = false;
    okBtn.disabled = true;
    _consentCallback = null;
  }

  document.getElementById('consentClose').addEventListener('click', closeConsent);
  document.getElementById('consentCancel').addEventListener('click', closeConsent);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeConsent(); });

  okBtn.addEventListener('click', async function () {
    if (!_consentCallback) return;
    const cb = _consentCallback;
    closeConsent();
    await withLoading(this, cb);
  });
})();

function confirmDownload(callback) {
  _consentCallback = callback;
  document.getElementById('consentOverlay').classList.add('open');
}

/* ── 다운로드 카드 ────────────────────────────────────────────── */

function appendDownloadCard(refId) {
  const dlId = 'dl_' + Date.now();
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.innerHTML = `
    <div class="avatar">AI</div>
    <div class="msg-body">
      <span class="msg-name">AI 어시스턴트</span>
      <div class="card" id="${dlId}">
        <div class="card-accent"></div>
        <div class="card-inner">
          <div class="card-title">보고서 다운로드</div>
          <div class="card-row">
            <span class="card-lbl">파일 형식</span>
            <select class="f-select" id="${dlId}_fmt">
              <option value="docx">Word (.docx)</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div class="btn-row">
            <button class="btn primary" id="${dlId}_ok">다운로드</button>
            <button class="btn secondary">취소</button>
          </div>
        </div>
      </div>
    </div>`;

  row.querySelector('.btn.secondary').addEventListener('click', () => row.remove());
  row.querySelector(`#${dlId}_ok`).addEventListener('click', () => {
    const refRow = document.getElementById(refId);
    const md  = refRow?.dataset.md ?? '';
    const images = parseImages(refRow?.dataset.images);
    const fmt = document.getElementById(`${dlId}_fmt`).value;
    confirmDownload(async () => {
      await exportDoc(md, fmt, refRow?.dataset.topic || '보고서', '', images);
      row.remove();
    });
  });

  msgs().appendChild(row);
  scrollBottom();
}

/* ── 학과 재생성 카드 ─────────────────────────────────────────── */

async function appendRegenCard(refId) {
  const dcId = 'dc_' + Date.now();
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.innerHTML = `
    <div class="avatar">AI</div>
    <div class="msg-body wide">
      <span class="msg-name">AI 어시스턴트</span>
      <div class="card" id="${dcId}" style="width:440px;">
        <div class="card-accent"></div>
        <div class="card-inner">
          <div class="card-title">🎓 학과별 맞춤 재생성</div>
          <div class="card-row">
            <span class="card-lbl">소속 학과</span>
            <select class="f-select" id="${dcId}_dept"><option value="">학과 불러오는 중...</option></select>
          </div>
          <div class="card-row">
            <span class="card-lbl">보고서 날짜</span>
            <input class="f-input" type="date" id="${dcId}_date" value="${iso(new Date())}" />
          </div>
          <div id="${dcId}_progress" style="display:none;">
            <div class="progress-wrap"><div class="progress-bar" id="${dcId}_bar"></div></div>
          </div>
          <div id="${dcId}_result" style="display:none;"></div>
          <div id="${dcId}_actions">
            <div class="btn-row">
              <button class="btn primary" id="${dcId}_go">재생성하기</button>
              <button class="btn secondary" id="${dcId}_cancel">취소</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  row.querySelector(`#${dcId}_cancel`).addEventListener('click', () => row.remove());
  row.querySelector(`#${dcId}_go`).addEventListener('click', () => runRegen(refId, dcId));
  msgs().appendChild(row);
  scrollBottom();

  try {
    const r = await fetch(`${API_BASE}/departments`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error();
    const data  = await r.json();
    const depts = Array.isArray(data) ? data : (data.departments ?? data.result?.departments ?? []);
    const sel   = document.getElementById(`${dcId}_dept`);
    sel.innerHTML = '<option value="">학과를 선택하세요</option>';
    depts.forEach(d => {
      const id   = typeof d === 'string' ? d : (d.id ?? '');
      const name = typeof d === 'string' ? d : (d.name ?? id);
      const en   = d.name_en ? ` (${d.name_en})` : '';
      sel.appendChild(Object.assign(document.createElement('option'), { value: id, textContent: name + en }));
    });
  } catch {
    document.getElementById(`${dcId}_dept`).innerHTML = '<option value="">학과 로딩 실패 — API 확인 필요</option>';
  }
}

async function runRegen(refId, dcId) {
  const deptSel = document.getElementById(`${dcId}_dept`);
  const deptId  = deptSel.value;
  if (!deptId) { alert('학과를 선택해 주세요.'); return; }

  const refRow   = document.getElementById(refId);
  const original = refRow?.dataset.md ?? '';
  const date     = document.getElementById(`${dcId}_date`).value;
  const deptName = deptSel.selectedOptions[0].text;
  const deptLabel = deptName.split(' (')[0];
  const goBtn    = document.getElementById(`${dcId}_go`);

  goBtn.disabled = true;
  goBtn.innerHTML = '<div class="spin"></div> 재생성 중...';
  document.getElementById(`${dcId}_result`).style.display   = 'none';
  document.getElementById(`${dcId}_progress`).style.display = 'block';

  const bar = document.getElementById(`${dcId}_bar`);
  let pct = 0;
  const iv = setInterval(() => {
    pct = Math.min(pct + Math.random() * 9, 88);
    bar.style.width = pct + '%';
  }, 240);

  const req = {
    original_report: original,
    department_id:   deptId,
    report_date:     date || undefined,
    session_id:      `web-regen-${Date.now()}`,
  };

  let md = '';
  const resultDiv = document.getElementById(`${dcId}_result`);
  const streamEl  = document.createElement('div');
  streamEl.className = 'result-text streaming';
  resultDiv.appendChild(streamEl);
  resultDiv.style.display = 'block';

  await streamSSE(
    `${API_BASE}/report/regenerate`, req,
    chunk => {
      md += chunk;
      streamEl.textContent = md;
      streamEl.scrollTop = streamEl.scrollHeight;
    },
    () => {
      clearInterval(iv);
      bar.style.width = '100%';
      setTimeout(() => { document.getElementById(`${dcId}_progress`).style.display = 'none'; }, 350);

      streamEl.remove();
      const rendered = document.createElement('div');
      rendered.className = 'md';
      rendered.style.cssText = 'max-height:380px;overflow-y:auto;';
      rendered.innerHTML = marked.parse(md);
      resultDiv.innerHTML = '';

      const badge = document.createElement('div');
      badge.className = 'ok-badge';
      badge.style.marginBottom = '10px';
      badge.textContent = `✓ ${deptLabel} 용어로 변환 완료`;
      resultDiv.appendChild(badge);
      resultDiv.appendChild(rendered);

      const actDiv = document.getElementById(`${dcId}_actions`);
      actDiv.innerHTML = `
        <div class="btn-row download-row">
          <select class="f-select" id="${dcId}_fmt">
            <option value="docx">Word (.docx)</option>
            <option value="pdf">PDF</option>
          </select>
          <button class="btn dark" id="${dcId}_dl">다운로드</button>
        </div>`;
      document.getElementById(`${dcId}_dl`).addEventListener('click', () => {
        const fmt = document.getElementById(`${dcId}_fmt`).value;
        const refTopic = document.getElementById(refId)?.dataset.topic || '';
        confirmDownload(() => exportDoc(md, fmt, `${deptLabel} 용어 변환 보고서 ${refTopic}`, ''));
      });

      scrollBottom();
    },
    err => {
      clearInterval(iv);
      document.getElementById(`${dcId}_progress`).style.display = 'none';
      streamEl.remove();
      resultDiv.style.display = 'none';
      appendErrorMsg(err);
      goBtn.disabled = false;
      goBtn.textContent = '다시 시도';
    },
    meta => { void meta; }
  );
}

/* ── 피드백 카드 ──────────────────────────────────────────────── */

function appendFeedbackCard(refId) {
  const fId    = 'fb_' + Date.now();
  const refRow = document.getElementById(refId);
  const traceId = refRow?.dataset.traceId ?? '';
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.innerHTML = `
    <div class="avatar">AI</div>
    <div class="msg-body">
      <span class="msg-name">AI 어시스턴트</span>
      <div class="card" id="${fId}">
        <div class="card-accent"></div>
        <div class="card-inner">
          <div class="card-title">보고서 피드백</div>
          <div class="card-row">
            <div class="fb-lbl">평점 (1–10)</div>
            <div class="fb-slider-wrap">
              <input type="range" class="fb-slider" min="1" max="10" value="5"
                oninput="this.nextElementSibling.textContent = this.value" />
              <div class="fb-score">5</div>
            </div>
          </div>
          <div class="card-row">
            <div class="fb-lbl">의견</div>
            <textarea class="fb-textarea" placeholder="보고서에 대한 의견을 작성해 주세요..."></textarea>
          </div>
          <div class="btn-row">
            <button class="btn primary">제출</button>
            <button class="btn secondary">취소</button>
          </div>
        </div>
      </div>
    </div>`;

  row.querySelector('.btn.secondary').addEventListener('click', () => row.remove());
  row.querySelector('.btn.primary').addEventListener('click', async function () {
    const card  = document.getElementById(fId);
    const score = Number(card.querySelector('.fb-slider').value);
    const text  = card.querySelector('.fb-textarea').value.trim();
    if (!traceId) {
      appendErrorMsg('피드백을 연결할 Trace ID가 없습니다. 보고서를 다시 생성한 뒤 시도해 주세요.');
      return;
    }
    try {
      await withLoading(this, () => submitFeedback(traceId, score, text));
    } catch (e) {
      appendErrorMsg(`피드백 제출 실패: ${e.message}`);
      return;
    }
    card.innerHTML = `
      <div class="card-accent"></div>
      <div class="card-inner">
        <div class="card-title">피드백이 제출되었습니다 🙏</div>
        <div class="card-row">
          <div class="fb-lbl">평점</div>
          <div class="card-val" style="font-size:22px;font-weight:700;color:var(--blue-600)">
            ${score}<span style="font-size:13px;font-weight:400;color:var(--gray-400)"> / 10</span>
          </div>
        </div>
        ${text ? `<div class="card-row"><div class="fb-lbl">의견</div><div class="card-val">${esc(text)}</div></div>` : ''}
      </div>`;
    scrollBottom();
  });

  msgs().appendChild(row);
  scrollBottom();
}
