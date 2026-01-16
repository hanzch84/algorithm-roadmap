'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'

const RoadmapFlow = dynamic(() => import('./components/RoadmapFlow'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      로딩 중...
    </div>
  )
})

export default function Home() {
  const [nodes, setNodes] = useState([])
  const [savedPositions, setSavedPositions] = useState(null)
  const [savedEdges, setSavedEdges] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef(null)

  // Notion에서 노드 + 레이아웃 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/notion')
        if (res.ok) {
          const data = await res.json()
          
          // 노드 데이터
          if (Array.isArray(data.nodes) && data.nodes.length > 0) {
            setNodes(data.nodes)
            console.log('✅ Notion에서 노드 로드:', data.nodes.length, '개')
          }

          // 레이아웃 데이터
          if (data.layoutState) {
            setSavedPositions({ 
              nodes: data.layoutState.positions, 
              groups: data.layoutState.groups 
            })
            setSavedEdges(data.layoutState.edges || null)
            console.log('✅ Notion에서 레이아웃 로드 완료')
          }
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // JSON 파일에서 상태 불러오기 (로컬 백업용)
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
            {isLoading && (
              <span className="text-xs text-gray-400">로딩 중...</span>
            )}
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
              📂 파일에서 불러오기
            </button>
            <a
              href="/share"
              target="_blank"
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
            >
              👁️ 공유 페이지 보기
            </a>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-60px)]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Notion에서 데이터 로딩 중...
          </div>
        ) : (
          <RoadmapFlow 
            initialNodes={nodes} 
            savedPositions={savedPositions}
            savedEdges={savedEdges}
          />
        )}
      </div>
    </main>
  )
}
