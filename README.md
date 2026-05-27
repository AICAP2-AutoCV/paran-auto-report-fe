# 파RAG학기 — 프론트엔드 (paran-auto-report-fe)

채팅 형태로 보고서를 요청하고, 결과를 미리보거나 Word/PDF로 다운로드하는 **브라우저 UI**입니다.

> **이 폴더만으로는 동작하지 않습니다.**  
> 반드시 `paran-auto-report/` (API 서버)가 먼저 실행되어 있어야 합니다.  
> 서버 세팅 방법은 [paran-auto-report/README.md](../paran-auto-report/README.md)를 참고하세요.

---

## 이 폴더를 별도로 실행할 필요가 없는 이유

API 서버(`paran-auto-report/src/api.py`)는 시작할 때 이 폴더를 자동으로 감지해 `/ui` 경로로 서빙합니다.

```python
# paran-auto-report/src/api.py 내부
_FE_DIR = Path(__file__).parent.parent.parent / "paran-auto-report-fe"
if _FE_DIR.exists():
    app.mount("/ui", StaticFiles(directory=str(_FE_DIR), html=True), name="frontend")
```

즉, **두 폴더가 나란히 있고 API 서버가 켜져 있으면** 브라우저에서 바로 열 수 있습니다.

```
http://localhost:8000/ui
```

---

## 화면 기능 설명

### 1. 프로필 입력 (최초 1회)

처음 접속하면 내 정보 입력 모달이 자동으로 뜹니다.

| 항목 | 설명 |
|------|------|
| 팀명 | 보고서 표지에 표시됩니다 |
| 학과 | 보고서 표지에 표시됩니다 |
| 학번 | 보고서 표지에 표시됩니다 |
| 성명 | 보고서 표지 + 작성자에 표시됩니다 |
| 내 역할 | AI가 보고서를 쓸 때 참고합니다 (예: 백엔드 개발, 데이터 분석) |

- 입력한 정보는 **브라우저 localStorage에 저장**되어 다음 접속에도 유지됩니다.
- 나중에 수정하려면 우측 상단 프로필 버튼(사람 아이콘)을 클릭하세요.

---

### 2. 보고서 생성

채팅 입력창에 보고서 주제를 입력하고 전송하면 AI가 Notion 데이터를 기반으로 보고서를 작성합니다.

**기간을 자연어로 지정할 수 있습니다.**

| 입력 예시 | 적용 기간 |
|-----------|-----------|
| 이번 주 활동 요약해줘 | 이번 주 월~일 |
| 지난 주 개발 내용 정리 | 지난 주 월~일 |
| 최근 14일 작업 정리 | 최근 14일 |
| 이번 달 프로젝트 진행 정리 | 최근 30일 |
| 지난 달 회의 내용 정리 | 지난 달 1일~말일 |
| 2025-05-01 ~ 2025-05-15 요약 | 해당 날짜 범위 |

상단의 **추천 칩**을 클릭하면 입력창에 자동으로 채워집니다.

---

### 3. 보고서 카드 기능

보고서 생성이 완료되면 카드가 표시됩니다. 카드에서 할 수 있는 것들:

| 버튼 | 기능 |
|------|------|
| 미리보기 | 마크다운으로 렌더링된 보고서를 모달에서 확인 |
| 다운로드 | Word(.docx) 또는 PDF 형식으로 저장 |
| 피드백 | 보고서 품질을 1~10점으로 평가 + 의견 제출 |
| 학과별 맞춤 재생성 | 학과를 선택하면 해당 학과 스타일로 보고서 재작성 |
| 용어 해설 추가 (체크박스) | 보고서 내 전문 용어에 해설 섹션 자동 추가 |

**미리보기 모달**에서는 추가로:
- **파일 미리보기** — Word 파일을 실제로 변환해 HTML로 보여줍니다 (pandoc 필요)
- **다운로드** — 형식 선택 후 바로 저장

---

### 4. 학과별 맞춤 재생성

같은 Notion 데이터를 기반으로 학과별 보고서 양식에 맞게 재작성합니다.

1. 보고서 카드의 **학과별 맞춤 재생성** 버튼 클릭
2. 소속 학과 선택 (API에서 자동으로 목록을 불러옵니다)
3. 보고서 날짜 선택
4. **재생성하기** 클릭 → 스트리밍으로 실시간 생성
5. 완료 후 Word/PDF로 다운로드

---

## 파일 구조

```
paran-auto-report-fe/
├── index.html          ← 전체 HTML 구조 (모달 포함)
├── style.css           ← 전체 스타일
└── js/
    ├── state.js        ← 전역 변수 (API_BASE, isStreaming, userInfo 등)
    ├── api.js          ← API 서버와 통신하는 fetch 함수 모음
    ├── profile.js      ← 프로필 모달 열기/닫기, localStorage 저장
    ├── ui.js           ← 메시지 카드, 모달, 다운로드 카드 등 UI 빌더
    └── app.js          ← 진입점, 이벤트 바인딩, 날짜 파싱 로직
```

### 각 JS 파일의 역할

**state.js** — 다른 파일들이 공유하는 전역 변수를 선언합니다.
```js
let API_BASE = window.location.origin; // API 서버 주소 (자동 감지)
let isStreaming = false;               // 생성 중 여부
let userInfo = {};                     // 프로필 정보
```

**api.js** — 서버와 통신하는 함수들. 직접 fetch를 쓰지 않고 이 파일의 함수를 씁니다.
- `checkHealth()` — 서버 연결 상태 확인
- `generateFullReport(body)` — 보고서 생성 요청
- `exportDoc(md, format, ...)` — Word/PDF 다운로드
- `addGlossary(md)` — 용어 해설 추가
- `submitFeedback(traceId, score, comment)` — 피드백 제출

**app.js** — 페이지 로드 시 초기화, 버튼 이벤트, 한국어 날짜 파싱.

**ui.js** — DOM 조작. 메시지 추가, 카드 생성, 모달 제어 등.

**profile.js** — localStorage에서 사용자 정보를 읽고 씁니다.

---

## API 주소 변경이 필요한 경우

기본적으로 `state.js`에서 API 주소를 자동으로 감지합니다.

```js
// state.js
let API_BASE = window.location.origin.startsWith('http')
  ? window.location.origin       // /ui 로 접속하면 http://localhost:8000
  : 'http://localhost:8000';     // 파일로 직접 열었을 때 기본값
```

API 서버가 다른 포트나 주소에서 실행 중이라면 `state.js`의 `API_BASE`를 직접 수정하세요.

```js
// 예: API 서버가 8080 포트에 있는 경우
let API_BASE = 'http://localhost:8080';
```

---

## 개발 시 참고사항

- 별도 빌드 과정 없이 HTML/CSS/JS 파일을 수정하면 브라우저 새로고침으로 바로 반영됩니다.
- API 서버의 `--reload` 옵션과 무관하게 FE 파일은 즉시 적용됩니다.
- 브라우저 개발자 도구(F12) → Network 탭에서 API 요청/응답을 확인할 수 있습니다.
- `localStorage`에 저장된 프로필 정보는 개발자 도구 → Application → Local Storage에서 확인하거나 삭제할 수 있습니다.
