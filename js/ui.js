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
  const row = document.createElement('div');
  row.className = 'msg-row ai';
  row.innerHTML = `
    <div class="avatar">AI</div>
    <div class="msg-body">
      <span class="msg-name">AI 어시스턴트</span>
      <div class="bubble">
        안녕하세요! <strong>보고서 생성 AI</strong>입니다.<br/>
        Notion 데이터를 RAG로 검색해 보고서를 자동 작성합니다.<br/><br/>
        자유롭게 입력해 주세요:<br/>
        • <em>이번 주 업무 현황 요약해줘</em><br/>
        • <em>최근 2주 RAG 프로젝트 성과 보고서</em><br/>
        • <em>지난달 주요 활동 정리</em>
      </div>
      <span class="msg-time">${now()}</span>
    </div>`;
  msgs().appendChild(row);
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
  row.innerHTML = `
    <div class="avatar">AI</div>
    <div class="msg-body wide">
      <span class="msg-name">AI 어시스턴트</span>
      <div class="card">
        <div class="card-title">📄 보고서가 생성되었습니다</div>
        <div class="card-row">
          <span class="card-lbl">주제</span>
          <span class="card-val">${esc(topic.slice(0, 60))}</span>
        </div>
        <div class="card-row">
          <span class="card-lbl">날짜 범위</span>
          <span class="card-val">${esc(dateLabel)}</span>
        </div>
        <div class="card-row">
          <span class="card-lbl">생성 시각</span>
          <span class="card-val">${new Date().toLocaleString('ko-KR',{hour12:false})}</span>
        </div>
        <div class="card-row">
          <span class="card-lbl">관련 이미지</span>
          <span class="card-val">${images?.length ? `${images.length}개 포함` : '없음'}</span>
        </div>
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
        <button class="btn primary full" data-action="regen">학과 맞춤 재생성 →</button>
      </div>
      <span class="msg-time">${now()}</span>
    </div>`;

  row.querySelector('.card').addEventListener('click', e => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    const cardMd = row.dataset.md;
    const cardImages = parseImages(row.dataset.images);
    if (action === 'preview')  openPreview(cardMd, cardImages);
    if (action === 'download') appendDownloadCard(cid);
    if (action === 'feedback') appendFeedbackCard(cid);
    if (action === 'regen')    appendRegenCard(cid);
  });

  msgs().appendChild(row);
  scrollBottom();
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

function openPreview(md, images = []) {
  previewMd = md;
  previewImages = images;
  document.getElementById('previewBody').innerHTML = marked.parse(md);
  document.getElementById('previewOverlay').classList.add('open');
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
    </div>`;

  row.querySelector('.btn.secondary').addEventListener('click', () => row.remove());
  row.querySelector(`#${dlId}_ok`).addEventListener('click', async function () {
    const refRow = document.getElementById(refId);
    const md  = refRow?.dataset.md ?? '';
    const images = parseImages(refRow?.dataset.images);
    const fmt = document.getElementById(`${dlId}_fmt`).value;
    await withLoading(this, () => exportDoc(md, fmt, '보고서', '', images));
    row.remove();
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
        <div class="card-title">학과별 맞춤 재생성</div>
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
      badge.textContent = '✓ 재생성 완료';
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
      document.getElementById(`${dcId}_dl`).addEventListener('click', async function () {
        const fmt = document.getElementById(`${dcId}_fmt`).value;
        await withLoading(this, () => exportDoc(md, fmt, `${deptName} 맞춤 보고서`, ''));
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
      <div class="card-title">피드백이 제출되었습니다 🙏</div>
      <div class="card-row">
        <div class="fb-lbl">평점</div>
        <div class="card-val" style="font-size:22px;font-weight:700;color:var(--blue-600)">
          ${score}<span style="font-size:13px;font-weight:400;color:var(--gray-400)"> / 10</span>
        </div>
      </div>
      ${text ? `<div class="card-row"><div class="fb-lbl">의견</div><div class="card-val">${esc(text)}</div></div>` : ''}`;
    scrollBottom();
  });

  msgs().appendChild(row);
  scrollBottom();
}
