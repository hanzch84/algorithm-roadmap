'use client'

import { useState, useRef } from 'react'
import dynamic from 'next/dynamic'

// ReactFlow는 클라이언트에서만 로드
const RoadmapFlow = dynamic(() => import('../components/RoadmapFlow'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      로딩 중...
    </div>
  )
})

// 기본 데이터
const defaultNodes = [
  { id: 'node_intro', name: '🌐 온라인 저지 소개', group: 'intro', section: '기본', link: '' },
  { id: 'node_boj_setup', name: '백준 가입 및 설정', group: '플랫폼 가입', section: '기본', link: '' },
  { id: 'node_boj_usage', name: '백준 이용 방법', group: '플랫폼 가입', section: '기본', link: '' },
  { id: 'node_koala_setup', name: '코알라 OJ 가입 및 설정', group: '플랫폼 가입', section: '기본', link: '' },
  { id: 'node_koala_usage', name: '코알라 OJ 사용 방법', group: '플랫폼 가입', section: '기본', link: '' },
  { id: 'node_solved_link', name: 'solved.ac 연동하기', group: 'solved.ac', section: '기본', link: '' },
  { id: 'node_solved_usage', name: 'solved.ac 이용 방법', group: 'solved.ac', section: '기본', link: '' },
  { id: 'node_tools_intro', name: '🔧 코딩 도구 선택하기', group: '코딩 도구', section: '기본', link: '' },
  { id: 'tool_vscode', name: 'VS Code', group: 'IDE', section: '기본', link: '' },
  { id: 'tool_pycharm', name: 'PyCharm', group: 'IDE', section: '기본', link: '' },
  { id: 'tool_replit', name: 'Replit', group: '온라인 IDE', section: '기본', link: '' },
  { id: 'tool_onlinegdb', name: 'OnlineGDB', group: '온라인 IDE', section: '기본', link: '' },
  { id: 'tool_ideone', name: 'Ideone', group: '온라인 러너', section: '기본', link: '' },
  { id: 'tool_tio', name: 'TIO', group: '온라인 러너', section: '기본', link: '' },
  { id: 'tool_colab', name: 'Google Colab', group: '노트북', section: '기본', link: '' },
  { id: 'tool_marimo', name: 'Marimo', group: '노트북', section: '기본', link: '' },
  { id: 'node_til', name: 'TIL 작성 방법', group: '스터디 기록', section: '기본', link: '' },
  { id: 'node_join', name: '스터디 모임 구성', group: '스터디 기록', section: '기본', link: '' },
  { id: 'node_study', name: '음성채팅 및 화면공유 방법', group: '스터디 기록', section: '기본', link: '' },
  { id: 'node_arena', name: '백준 대회 정보 얻기', group: '대회 참가', section: '기본', link: '' },
  { id: 'node_arenajoin', name: '백준 대회 참가 방법', group: '대회 참가', section: '기본', link: '' },
  { id: 'node_arenacoalla', name: '코알라 대회 참가 방법', group: '대회 참가', section: '기본', link: '' },
  { id: 'ext_bjcode', name: '백준 코드', group: '크롬 확장', section: '고급', link: '' },
  { id: 'ext_bojhub', name: '백준 허브', group: '크롬 확장', section: '고급', link: '' },
  { id: 'ext_bojext', name: 'BOJ Extended', group: '크롬 확장', section: '고급', link: '' },
  { id: 'ext_testcase', name: 'testcase.ac', group: '크롬 확장', section: '고급', link: '' },
  { id: 'adv_boj', name: '백준 고급 활용', group: '고급 활용', section: '고급', link: '' },
  { id: 'adv_solved', name: 'solved.ac 고급 활용', group: '고급 활용', section: '고급', link: '' },
  { id: 'adv_koala', name: '코알라 OJ 고급 활용', group: '고급 활용', section: '고급', link: '' },
  { id: 'contest_atcoder', name: 'AtCoder', group: '온라인 콘테스트', section: '고급', link: '' },
  { id: 'contest_codeforces', name: 'Codeforces', group: '온라인 콘테스트', section: '고급', link: '' },
  { id: 'draw_io', name: 'draw.io', group: '다이어그램 툴', section: '고급', link: '' },
  { id: 'excalidraw', name: 'Excalidraw', group: '다이어그램 툴', section: '고급', link: '' },
  { id: 'pythontutor', name: 'Python Tutor', group: '시각화 도구', section: '고급', link: '' },
  { id: 'vscode_ext', name: 'VS CODE extension', group: '시각화 도구', section: '고급', link: '' },
]

export default function Home() {
  const [savedPositions, setSavedPositions] = useState(null)
  const [savedEdges, setSavedEdges] = useState(null)
  const fileInputRef = useRef(null)

  const handlePositionUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target?.result)
        
        if (state.positions) {
          setSavedPositions({ nodes: state.positions, groups: state.groups })
          setSavedEdges(state.edges || null)
        } else if (state.nodes) {
          setSavedPositions(state)
          setSavedEdges(state.edges || null)
        } else {
          setSavedPositions({ nodes: state })
          setSavedEdges(null)
        }
        
        const info = []
        if (state.positions) info.push(`노드 ${Object.keys(state.positions).length}개`)
        else if (state.nodes) info.push(`노드 ${Object.keys(state.nodes).length}개`)
        if (state.groups) info.push(`그룹 ${Object.keys(state.groups).length}개`)
        if (state.edges) info.push(`엣지 ${state.edges.length}개`)
        alert(`✅ 상태 적용 완료: ${info.join(', ')}`)
      } catch (err) {
        alert('❌ 잘못된 JSON 파일입니다.')
        console.error(err)
      }
    }
    reader.readAsText(file)
    if (event.target) event.target.value = ''
  }

  return (
    <main className="min-h-screen">
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
              📤 상태 불러오기
            </button>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-60px)]">
        <RoadmapFlow 
          initialNodes={defaultNodes} 
          savedPositions={savedPositions}
          savedEdges={savedEdges}
        />
      </div>
    </main>
  )
}
