# 🐨 코알라 알고리즘 스터디 로드맵

노션 DB와 연동된 인터랙티브 알고리즘 학습 로드맵입니다.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React Flow](https://img.shields.io/badge/React%20Flow-12-blue)
![Notion API](https://img.shields.io/badge/Notion-API-lightgrey)

## ✨ 기능

- 📊 노션 DB에서 실시간으로 노드 데이터 동기화
- 🖱️ 인터랙티브 로드맵 (확대/축소, 드래그)
- 🔗 노드 클릭 시 노션 페이지로 이동
- 📱 반응형 디자인
- 🎨 기본/고급 과정 색상 구분

## 🚀 배포 방법

### 1. GitHub 저장소 생성

```bash
# 프로젝트 폴더에서
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/algorithm-roadmap.git
git push -u origin main
```

### 2. Vercel 배포

1. [Vercel](https://vercel.com)에 GitHub 계정으로 로그인
2. "New Project" 클릭
3. GitHub 저장소 선택
4. **Environment Variables** 설정:
   - `NOTION_TOKEN`: `ntn_xxxxxxxxxxxxx` (노션 Integration 시크릿)
   - `NOTION_DATABASE_ID`: `2e9f50c47189807a910bf980a37090cc`
5. "Deploy" 클릭

### 3. 로컬 개발

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일 편집하여 실제 값 입력

# 개발 서버 실행
npm run dev
```

http://localhost:3000 에서 확인

## 📝 노션 DB 설정

### 필수 속성

| 속성명 | 타입 | 설명 |
|--------|------|------|
| `Name` | 제목 | 노드 표시 이름 |
| `NodeID` | 텍스트 | 고유 ID (예: `node_boj_setup`) |
| `Link` | URL | 클릭 시 이동할 노션 페이지 |
| `Group` | 선택 | 그룹명 (플랫폼 가입, 코딩 도구 등) |
| `Section` | 선택 | `기본` 또는 `고급` |
| `Order` | 숫자 | 정렬 순서 |

### Group 옵션

**기본 과정:**
- intro
- 플랫폼 가입
- solved.ac
- 코딩 도구
- IDE
- 온라인 IDE
- 온라인 러너
- 노트북
- 스터디 기록

**고급 과정:**
- 크롬 확장
- 고급 활용
- 온라인 콘테스트
- 다이어그램 툴
- 시각화 도구

## 📁 프로젝트 구조

```
algorithm-roadmap/
├── app/
│   ├── api/
│   │   └── notion/
│   │       └── route.js      # 노션 API 엔드포인트
│   ├── globals.css           # 전역 스타일
│   ├── layout.js             # 루트 레이아웃
│   └── page.js               # 메인 페이지
├── components/
│   ├── RoadmapFlow.jsx       # React Flow 컴포넌트
│   ├── CustomNode.jsx        # 커스텀 노드
│   └── GroupNode.jsx         # 그룹 배경 노드
├── .env.local.example        # 환경변수 예시
├── next.config.js
├── tailwind.config.js
└── package.json
```

## 🛠️ 커스터마이징

### 노드 위치 변경

`components/RoadmapFlow.jsx`의 `groupPositions` 객체 수정:

```javascript
const groupPositions = {
  'intro': { x: 400, y: 0 },
  '플랫폼 가입': { x: 150, y: 100 },
  // ...
}
```

### 연결선 추가/수정

`components/RoadmapFlow.jsx`의 `edgeDefinitions` 배열 수정:

```javascript
const edgeDefinitions = [
  { source: 'node_intro', target: 'node_boj_setup' },
  // 새로운 연결 추가
  { source: 'new_source', target: 'new_target' },
]
```

### 색상 변경

`tailwind.config.js` 또는 `app/globals.css`의 CSS 변수 수정

## 📄 라이선스

MIT License
