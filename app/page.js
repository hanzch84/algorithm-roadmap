'use client'

import { useState, useEffect, useRef } from 'react'
import RoadmapFlow from '../components/RoadmapFlow'

export default function Home() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedPositions, setSavedPositions] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchNodes()
  }, [])

  const fetchNodes = async () => {
    try {
      const response = await fetch('/api/notion')
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다')
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setNodes(data)
      } else {
        throw new Error(data.error || '잘못된 응답 형식')
      }
    } catch (err) {
      setError(err.message)
      setNodes(getDefaultNodes())
    } finally {
      setLoading(false)
    }
  }

  // 위치 파일 업로드 핸들러
  const handlePositionUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const positions = JSON.parse(e.target.result)
        setSavedPositions(positions)
        alert('위치 데이터가 적용되었습니다!')
      } catch (err) {
        alert('잘못된 JSON 파일입니다.')
      }
    }
    reader.readAsText(file)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading text-2xl font-display text-basic-border mb-4">
            🐨 로딩 중...
          </div>
          <p className="text-gray-500">노션에서 데이터를 불러오고 있습니다</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* 헤더 */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-display text-gray-800">
            🐨 코알라 알고리즘 스터디 로드맵
          </h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#E0F2F1] border-2 border-[#00897B]"></span>
              기본
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-[#EDE7F6] border-2 border-[#7E57C2]"></span>
              고급
            </span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePositionUpload}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs"
            >
              📤 위치 불러오기
            </button>
          </div>
        </div>
      </header>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-yellow-800 text-sm max-w-7xl mx-auto">
            ⚠️ {error} - 기본 데이터를 표시합니다.
          </p>
        </div>
      )}

      {/* 로드맵 */}
      <div className="h-[calc(100vh-60px)]">
        <RoadmapFlow initialNodes={nodes} savedPositions={savedPositions} />
      </div>
    </main>
  )
}

// 노션 연결 실패 시 기본 데이터
function getDefaultNodes() {
  return [
    // 기본 과정
    { id: 'node_intro', name: '🌐 온라인 저지 소개', group: 'intro', section: '기본', order: 1, link: '' },
    { id: 'node_boj_setup', name: '백준 가입 및 설정', group: '플랫폼 가입', section: '기본', order: 2, link: '' },
    { id: 'node_boj_usage', name: '백준 이용 방법', group: '플랫폼 가입', section: '기본', order: 3, link: '' },
    { id: 'node_koala_setup', name: '코알라 OJ 가입 및 설정', group: '플랫폼 가입', section: '기본', order: 4, link: '' },
    { id: 'node_koala_usage', name: '코알라 OJ 사용 방법', group: '플랫폼 가입', section: '기본', order: 5, link: '' },
    { id: 'node_solved_link', name: 'solved.ac 연동하기', group: 'solved.ac', section: '기본', order: 6, link: '' },
    { id: 'node_solved_usage', name: 'solved.ac 이용 방법', group: 'solved.ac', section: '기본', order: 7, link: '' },
    { id: 'node_tools_intro', name: '🔧 코딩 도구 선택하기', group: '코딩 도구', section: '기본', order: 8, link: '' },
    { id: 'tool_vscode', name: 'VS Code', group: 'IDE', section: '기본', order: 9, link: '' },
    { id: 'tool_pycharm', name: 'PyCharm', group: 'IDE', section: '기본', order: 10, link: '' },
    { id: 'tool_replit', name: 'Replit', group: '온라인 IDE', section: '기본', order: 11, link: '' },
    { id: 'tool_onlinegdb', name: 'OnlineGDB', group: '온라인 IDE', section: '기본', order: 12, link: '' },
    { id: 'tool_ideone', name: 'Ideone', group: '온라인 러너', section: '기본', order: 13, link: '' },
    { id: 'tool_tio', name: 'TIO', group: '온라인 러너', section: '기본', order: 14, link: '' },
    { id: 'tool_colab', name: 'Google Colab', group: '노트북', section: '기본', order: 15, link: '' },
    { id: 'tool_marimo', name: 'Marimo', group: '노트북', section: '기본', order: 16, link: '' },
    { id: 'node_til', name: 'TIL 작성 방법', group: '스터디 기록', section: '기본', order: 17, link: '' },
    { id: 'node_join', name: '스터디 모임 구성', group: '스터디 기록', section: '기본', order: 18, link: '' },
    { id: 'node_study', name: '음성채팅 및 화면공유 방법', group: '스터디 기록', section: '기본', order: 19, link: '' },
    // 대회 참가 (신규)
    { id: 'node_arena', name: '백준 대회 정보 얻기', group: '대회 참가', section: '기본', order: 20, link: '' },
    { id: 'node_arenajoin', name: '백준 대회 참가 방법', group: '대회 참가', section: '기본', order: 21, link: '' },
    { id: 'node_arenacoalla', name: '코알라 대회 참가 방법', group: '대회 참가', section: '기본', order: 22, link: '' },
    // 고급 과정
    { id: 'ext_bjcode', name: '백준 코드', group: '크롬 확장', section: '고급', order: 23, link: '' },
    { id: 'ext_bojhub', name: '백준 허브', group: '크롬 확장', section: '고급', order: 24, link: '' },
    { id: 'ext_bojext', name: 'BOJ Extended', group: '크롬 확장', section: '고급', order: 25, link: '' },
    { id: 'ext_testcase', name: 'testcase.ac', group: '크롬 확장', section: '고급', order: 26, link: '' },
    { id: 'adv_boj', name: '백준 고급 활용', group: '고급 활용', section: '고급', order: 27, link: '' },
    { id: 'adv_solved', name: 'solved.ac 고급 활용', group: '고급 활용', section: '고급', order: 28, link: '' },
    { id: 'adv_koala', name: '코알라 OJ 고급 활용', group: '고급 활용', section: '고급', order: 29, link: '' },
    { id: 'contest_atcoder', name: 'AtCoder', group: '온라인 콘테스트', section: '고급', order: 30, link: '' },
    { id: 'contest_codeforces', name: 'Codeforces', group: '온라인 콘테스트', section: '고급', order: 31, link: '' },
    { id: 'draw_io', name: 'draw.io', group: '다이어그램 툴', section: '고급', order: 32, link: '' },
    { id: 'excalidraw', name: 'Excalidraw', group: '다이어그램 툴', section: '고급', order: 33, link: '' },
    { id: 'pythontutor', name: 'Python Tutor', group: '시각화 도구', section: '고급', order: 34, link: '' },
    { id: 'vscode_ext', name: 'VS CODE extension', group: '시각화 도구', section: '고급', order: 35, link: '' },
  ]
}
