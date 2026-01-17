'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// React Flow는 SSR 비활성화
const ReadOnlyFlow = dynamic(() => import('../../components/ReadOnlyFlow'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로드맵 불러오는 중...</p>
      </div>
    </div>
  ),
})

export default function SharePage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Notion API에서 데이터 가져오기
        const response = await fetch('/api/notion')

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || '데이터를 불러올 수 없습니다')
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로드맵 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">로드맵을 불러올 수 없습니다</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-800">
            🐨 코알라 알고리즘 스터디 로드맵
          </h1>
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            👁️ 읽기 전용
          </span>
        </div>
        <a
          href="/"
          className="text-sm text-blue-500 hover:text-blue-600"
        >
          ✏️ 편집 모드로 이동
        </a>
      </header>

      {/* 로드맵 뷰어 */}
      <main className="flex-1">
        <ReadOnlyFlow
          nodes={data?.nodes || []}
          positions={data?.layout?.positions || {}}
          groups={data?.layout?.groups || {}}
          edges={data?.layout?.edges || []}
        />
      </main>
    </div>
  )
}