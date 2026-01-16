'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const ReadOnlyFlow = dynamic(() => import('../components/ReadOnlyFlow'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      로딩 중...
    </div>
  )
})

export default function SharePage() {
  const [nodes, setNodes] = useState([])
  const [layoutState, setLayoutState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Notion에서 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/notion')
        
        if (!res.ok) {
          throw new Error('데이터를 불러올 수 없습니다')
        }
        
        const data = await res.json()
        
        // 노드 데이터
        if (Array.isArray(data.nodes) && data.nodes.length > 0) {
          setNodes(data.nodes)
        }

        // 레이아웃 데이터
        if (data.layoutState) {
          setLayoutState(data.layoutState)
        } else {
          throw new Error('레이아웃 데이터가 없습니다. 먼저 에디터에서 "Notion에 저장"을 클릭하세요.')
        }
        
      } catch (err) {
        console.error('데이터 로드 실패:', err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-50 to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로드맵 불러오는 중...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-50 to-purple-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
            <div className="text-6xl mb-4">😢</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">로드맵을 불러올 수 없습니다</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <a 
              href="/"
              className="inline-block bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg"
            >
              에디터로 이동
            </a>
          </div>
        </div>
      </main>
    )
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
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              👁️ 읽기 전용
            </span>
          </div>
        </div>
      </header>

      <div className="h-[calc(100vh-60px)]">
        <ReadOnlyFlow 
          initialNodes={nodes} 
          savedPositions={{ 
            nodes: layoutState?.positions, 
            groups: layoutState?.groups 
          }}
          savedEdges={layoutState?.edges}
        />
      </div>
    </main>
  )
}
