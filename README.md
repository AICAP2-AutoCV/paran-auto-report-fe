# 파RAG학기 프론트엔드

Notion 데이터를 기반으로 AI 보고서를 생성하고 미리보기, 재생성, 다운로드할 수 있는 채팅형 웹 UI입니다.

이 저장소는 별도 프론트엔드 서버나 빌드 과정 없이 동작합니다. 백엔드인 [`paran-auto-report`](https://github.com/AICAP2-AutoCV/paran-auto-report)가 정적 파일을 `/ui` 경로로 제공합니다.

## 주요 기능

- 자연어로 보고서 주제와 기간 입력
- 보고서 생성 결과 및 관련 이미지 확인
- Markdown 및 실제 Word 파일 미리보기
- Word(`.docx`)와 PDF 다운로드
- 학과별 보고서 양식으로 재생성
- 전문 용어 해설 추가
- 1~10점 사용자 피드백 제출
- 사용자 프로필 저장 및 보고서 표지 반영
- AI 생성물 확인 후 다운로드

## 목차

- [실행 방법](#실행-방법)
- [사용 방법](#사용-방법)
- [화면 기능](#화면-기능)
- [개발 안내](#개발-안내)
- [파일 구조](#파일-구조)
- [API 연결](#api-연결)
- [문제 해결](#문제-해결)

## 실행 방법

### 1. 저장소 배치

백엔드와 프론트엔드 저장소를 같은 상위 폴더에 배치합니다.

```text
AutoCV/
├── paran-auto-report/
└── paran-auto-report-fe/
```

처음 설치하는 경우:

```bash
git clone https://github.com/AICAP2-AutoCV/paran-auto-report.git
git clone https://github.com/AICAP2-AutoCV/paran-auto-report-fe.git
```

### 2. 백엔드 실행

백엔드 설치와 환경 변수 설정, Vector DB 구축 방법은 [백엔드 README](https://github.com/AICAP2-AutoCV/paran-auto-report)를 참고하세요.

```bash
cd paran-auto-report
source .venv/bin/activate
python -m uvicorn src.api:app --host 127.0.0.1 --port 8000 --reload
```

백엔드는 시작할 때 인접한 `paran-auto-report-fe/` 폴더를 감지해 자동으로 서빙합니다.

```python
_FE_DIR = Path(__file__).parent.parent.parent / "paran-auto-report-fe"
if _FE_DIR.exists():
    app.mount("/ui", StaticFiles(directory=str(_FE_DIR), html=True), name="frontend")
```

### 3. 화면 접속

백엔드가 실행 중일 때 다음 주소로 접속합니다.

<http://localhost:8000/ui>

프론트엔드용 명령을 따로 실행할 필요는 없습니다.

## 사용 방법

1. 처음 접속하면 프로필 입력 창에서 팀명, 학과, 학번, 성명, 역할을 입력합니다.
2. 추천 문구를 선택하거나 채팅창에 원하는 보고서를 직접 입력합니다.
3. 생성된 보고서 카드에서 미리보기, 다운로드, 피드백, 학과별 재생성을 선택합니다.
4. 필요하면 전문 용어 해설을 추가합니다.
5. AI 생성물 확인 항목에 동의한 뒤 Word 또는 PDF로 다운로드합니다.

### 입력 예시

| 입력 | 적용 기간 |
|---|---|
| `이번 주 활동 요약해줘` | 이번 주 월요일 이후 |
| `지난 주 개발 내용 정리` | 지난 주 월요일부터 일요일 |
| `최근 14일 작업 정리` | 현재 날짜 기준 최근 14일 |
| `이번 달 프로젝트 진행 정리` | 최근 30일 |
| `지난 달 회의 내용 정리` | 지난 달 1일부터 말일까지 |
| `2026-06-01 ~ 2026-06-07 요약` | 입력한 날짜 범위 |

## 화면 기능

### 프로필

| 항목 | 사용 위치 |
|---|---|
| 팀명 | 보고서 표지 |
| 학과 | 보고서 표지 |
| 학번 | 보고서 표지 |
| 성명 | 보고서 표지 및 작성자 |
| 역할 | 보고서 생성 시 사용자 담당 업무 참고 |

입력한 정보는 브라우저 `localStorage`의 `user_info` 항목에 저장됩니다. 우측 상단 프로필 버튼에서 언제든 수정할 수 있습니다.

### 보고서 카드

| 기능 | 설명 |
|---|---|
| 미리보기 | 생성된 Markdown 보고서를 화면에서 확인 |
| 파일 미리보기 | Word 파일을 생성한 뒤 HTML로 변환해 확인 |
| 다운로드 | Word 또는 PDF 형식으로 저장 |
| 용어 해설 | 보고서의 전문 용어를 강조하고 해설 섹션 추가 |
| 학과별 재생성 | 선택한 학과의 보고서 양식으로 내용 재작성 |
| 피드백 | 보고서에 1~10점 평점과 의견 제출 |

파일 미리보기는 백엔드 환경에 pandoc이 설치되어 있어야 합니다.

### AI 생성 동의

다운로드 전 다음 두 항목을 모두 확인해야 합니다.

1. 이 보고서는 AI가 생성한 것임을 확인했습니다.
2. 이 보고서를 그대로 사용하지 않고 응용·수정하여 활용하겠습니다.

두 체크박스를 모두 선택하면 다운로드 버튼이 활성화됩니다.

### 학과별 맞춤 재생성

1. 보고서 카드에서 `학과별 맞춤 재생성`을 선택합니다.
2. API에서 불러온 학과 목록 중 하나를 선택합니다.
3. 보고서 날짜를 지정합니다.
4. `재생성하기`를 누르면 결과가 실시간으로 표시됩니다.
5. 완료된 보고서를 Word 또는 PDF로 다운로드합니다.

## 개발 안내

이 프로젝트는 HTML, CSS, Vanilla JavaScript로 구성되어 있으며 별도 패키지 설치나 번들링이 필요하지 않습니다.

- 파일을 수정한 뒤 브라우저를 새로고침하면 바로 반영됩니다.
- 외부 라이브러리는 CDN으로 불러옵니다.
- Markdown 렌더링에는 `marked.js`를 사용합니다.
- 폰트는 Pretendard Variable을 사용합니다.
- 일반 API 요청은 Fetch API로 처리하고, 학과별 재생성 결과는 SSE로 스트리밍합니다.
- 전역 상태는 `js/state.js`에서 관리합니다.

브라우저가 이전 파일을 캐시하고 있다면 강력 새로고침을 사용하세요.

## 파일 구조

```text
paran-auto-report-fe/
├── index.html       # 채팅 화면과 모달의 HTML 구조
├── style.css        # 전체 화면 및 반응형 스타일
└── js/
    ├── state.js     # API 주소와 전역 상태
    ├── api.js       # 보고서 생성, 내보내기, 피드백 API
    ├── profile.js   # 프로필 입력 및 localStorage 관리
    ├── ui.js        # 보고서 카드, 모달, 재생성 UI
    └── app.js       # 초기화, 이벤트 연결, 날짜 해석
```

### JavaScript 모듈

| 파일 | 주요 역할 |
|---|---|
| `state.js` | `API_BASE`, 생성 상태, 미리보기 데이터, 사용자 정보 관리 |
| `api.js` | 상태 확인, 보고서 생성, 문서 다운로드, 용어 해설, 피드백 요청 |
| `profile.js` | 프로필 모달 제어와 `localStorage` 읽기·쓰기 |
| `ui.js` | 메시지, 보고서 카드, 다운로드, 재생성, 피드백 UI 렌더링 |
| `app.js` | 페이지 초기화, 입력 이벤트, 한국어 기간 표현 해석 |

스크립트는 의존 순서에 맞춰 다음과 같이 로드됩니다.

```html
<script src="js/state.js"></script>
<script src="js/api.js"></script>
<script src="js/profile.js"></script>
<script src="js/ui.js"></script>
<script src="js/app.js"></script>
```

## API 연결

### API 주소

`js/state.js`는 현재 페이지의 origin을 API 주소로 사용합니다.

```js
let API_BASE = window.location.origin.startsWith('http')
  ? window.location.origin
  : 'http://localhost:8000';
```

따라서 `http://localhost:8000/ui`로 접속하면 API 요청도 자동으로 `http://localhost:8000`으로 전송됩니다.

백엔드 주소를 고정해야 한다면 `API_BASE`를 직접 변경합니다.

```js
let API_BASE = 'http://localhost:8080';
```

### 사용 API

| Method | Endpoint | 사용 기능 |
|---|---|---|
| `GET` | `/health` | 백엔드 연결 상태 확인 |
| `GET` | `/departments` | 학과 목록 조회 |
| `POST` | `/report/generate-full` | 보고서와 관련 이미지 생성 |
| `POST` | `/report/regenerate` | 학과별 보고서 재생성 |
| `POST` | `/report/glossary` | 전문 용어 해설 추가 |
| `POST` | `/document/export` | Word 또는 PDF 다운로드 |
| `POST` | `/document/preview` | 실제 파일 기반 미리보기 |
| `POST` | `/feedback` | 사용자 평가 저장 |

## 문제 해결

### `/ui`가 열리지 않는 경우

- 백엔드가 `http://localhost:8000`에서 실행 중인지 확인합니다.
- <http://localhost:8000/health>가 `{"status":"ok"}`를 반환하는지 확인합니다.
- 두 저장소가 같은 상위 폴더에 있는지 확인합니다.

### 보고서 생성 요청이 실패하는 경우

- 브라우저 개발자 도구의 Network 탭에서 실패한 요청과 응답을 확인합니다.
- 백엔드 터미널의 오류 로그를 확인합니다.
- 백엔드 Vector DB가 먼저 구축되었는지 확인합니다.

### 프로필을 초기화하려는 경우

브라우저 개발자 도구의 Application 또는 저장소 탭에서 Local Storage를 열고 `user_info`를 삭제합니다.

### 파일 미리보기가 실패하는 경우

백엔드 환경에서 `pandoc --version`을 실행해 pandoc 설치 여부를 확인합니다. 기본 Markdown 미리보기와 Word 다운로드는 pandoc 없이도 사용할 수 있습니다.
