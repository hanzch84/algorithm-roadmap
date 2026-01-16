import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

// ========================================
// POST - 로드맵 저장 및 공유 링크 생성
// ========================================
export async function POST(request) {
    try {
        let body
        try {
            body = await request.json()
        } catch (e) {
            return NextResponse.json(
                { error: '잘못된 JSON 요청입니다' },
                { status: 400 }
            )
        }

        const { title, positions, groups, edges, nodes } = body

        if (!nodes || nodes.length === 0) {
            return NextResponse.json(
                { error: '노드 데이터가 필요합니다' },
                { status: 400 }
            )
        }

        // 고유 ID 생성 (8자)
        const id = nanoid(8)

        // 저장할 데이터
        const roadmapData = {
            id,
            title: title || '로드맵',
            positions: positions || {},
            groups: groups || {},
            edges: edges || [],
            nodes: nodes || [],
            createdAt: new Date().toISOString(),
        }

        // Vercel KV에 저장 (30일 만료)
        await kv.set(`roadmap:${id}`, JSON.stringify(roadmapData), {
            ex: 60 * 60 * 24 * 30, // 30일
        })

        return NextResponse.json({
            success: true,
            id,
            url: `/view/${id}`,
            expiresIn: '30일',
        })

    } catch (error) {
        console.error('Roadmap save error:', error)
        return NextResponse.json(
            { error: error.message || '로드맵 저장에 실패했습니다' },
            { status: 500 }
        )
    }
}

// ========================================
// GET - 로드맵 조회
// ========================================
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json(
                { error: 'ID가 필요합니다' },
                { status: 400 }
            )
        }

        const data = await kv.get(`roadmap:${id}`)

        if (!data) {
            return NextResponse.json(
                { error: '로드맵을 찾을 수 없습니다' },
                { status: 404 }
            )
        }

        // 문자열이면 파싱
        const roadmapData = typeof data === 'string' ? JSON.parse(data) : data

        return NextResponse.json(roadmapData)

    } catch (error) {
        console.error('Roadmap fetch error:', error)
        return NextResponse.json(
            { error: error.message || '로드맵 조회에 실패했습니다' },
            { status: 500 }
        )
    }
}