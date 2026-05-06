/* ================================================================
   API: health check, SSE streaming, export, feedback
================================================================ */

async function checkHealth() {
  const dot = document.getElementById('apiDot');
  dot.className = 'api-dot loading';
  try {
    const r = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(5000) });
    dot.className = r.ok ? 'api-dot ok' : 'api-dot err';
  } catch {
    dot.className = 'api-dot err';
  }
}

async function streamSSE(url, body, onChunk, onDone, onError, onMeta) {
  let resp;
  try {
    resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    onError('서버에 연결할 수 없습니다. API 주소를 확인해 주세요.');
    return;
  }
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    onError(`서버 오류 (${resp.status}): ${txt.slice(0, 180)}`);
    return;
  }
  onMeta?.({ traceId: resp.headers.get('X-Trace-ID') || '' });

  const reader = resp.body.getReader();
  const dec    = new TextDecoder();
  let buf = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (raw === '[DONE]') { onDone(); return; }
        try { const p = JSON.parse(raw); if (p.chunk != null) onChunk(p.chunk); } catch {}
      }
    }
  } catch { onError('스트리밍 중 오류가 발생했습니다.'); return; }
  onDone();
}

async function generateFullReport(body) {
  let r;
  try {
    r = await fetch(`${API_BASE}/report/generate-full`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('서버에 연결할 수 없습니다. API 주소를 확인해 주세요.');
  }
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`서버 오류 (${r.status}): ${t.slice(0, 180)}`);
  }
  return r.json();
}

async function exportDoc(md, format, title, author, images = []) {
  const r = await fetch(`${API_BASE}/document/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      markdown:   md,
      format,
      title,
      author:     userInfo.name || author || 'Unknown',
      student_id: userInfo.student_id || undefined,
      department: userInfo.department || undefined,
      team_name:  userInfo.team_name  || undefined,
      images,
    }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status}: ${t.slice(0, 80)}`);
  }
  const blob = await r.blob();
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href: url, download: `report_${iso(new Date())}.${format}` });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function submitFeedback(traceId, score, comment) {
  const r = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trace_id: traceId,
      score,
      comment: comment || null,
      feedback_type: 'user_satisfaction',
    }),
  });
  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status}: ${t.slice(0, 120)}`);
  }
  return r.json();
}
