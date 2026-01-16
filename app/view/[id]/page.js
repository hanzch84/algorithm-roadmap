'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

// React Flow는 SSR 비활성화
const ReadOnlyFlow = dynamic(() => import('../../../components/ReadOnlyFlow'), {
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

export default function ViewRoadmapPage() {
    const params = useParams()
    const id = params.id

    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!id) return

        async function fetchRoadmap() {
            try {
                const response = await fetch(`/api/roadmap?id=${id}`)

                if (!response.ok) {
                    const err = await response.json()
                    throw new Error(err.error || '로드맵을 찾을 수 없습니다')
                }

                const roadmapData = await response.json()
                setData(roadmapData)
            } catch (err) {
                console.error('Fetch error:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchRoadmap()
    }, [id])

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
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">로드맵을 찾을 수 없습니다</h1>
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
                        {data?.title || '로드맵'}
                    </h1>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        👁️ 읽기 전용
                    </span>
                </div>
                <div className="text-sm text-gray-500">
                    {data?.createdAt && `생성: ${new Date(data.createdAt).toLocaleDateString('ko-KR')}`}
                </div>
            </header>

            {/* 로드맵 뷰어 */}
            <main className="flex-1">
                <ReadOnlyFlow
                    nodes={data?.nodes || []}
                    positions={data?.positions || {}}
                    groups={data?.groups || {}}
                    edges={data?.edges || []}
                />
            </main>
        </div>
    )
}