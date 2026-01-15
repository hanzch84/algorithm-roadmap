'use client'

import { useState, useEffect, useRef } from 'react'
import RoadmapFlow from '../components/RoadmapFlow'

export default function Home() {
  const [nodes, setNodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [savedPositions, setSavedPositions] = useState(null)
  const [savedEdges, setSavedEdges] = useState(null)  // 추가
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

  // 상태 파일 업로드 핸들러
  const handlePositionUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const state = JSON.parse(e.target.result)
        
        // positions/edges 포맷 (RoadmapFlow에서 저장한 형식)
        if (state.positions) {
          setSavedPositions({ nodes: state.positions })
          setSavedEdges(state.edges || null)
        }
        // nodes/groups/edges 포맷 (기존 형식)
        else if (state.nodes) {
          setSavedPositions(state)
          setSavedEdges(state.edges || null)
        }
        // 위치만 있는 구형식
        else {
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
    event.target.value = ''  // 같은 파일 재업로드 허용
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
              📤 상태 불러오기
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
        <RoadmapFlow 
          initialNodes={nodes} 
          savedPositions={savedPositions}
          savedEdges={savedEdges}  // 추가
        />
      </div>
    </main>
  )
}

// 기본 데이터 함수는 그대로 유지
function getDefaultNodes() {
  return [
    // ... 기존 코드 그대로
  ]
}
