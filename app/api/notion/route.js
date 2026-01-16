import { Client } from '@notionhq/client'
import { NextResponse } from 'next/server'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.NOTION_DATABASE_ID

// ========================================
// GET - 노드 목록 + 레이아웃 가져오기
// ========================================
export async function GET() {
  try {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
      return NextResponse.json(
        { error: '노션 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
    })

    const nodes = []
    let layoutState = null

    response.results.forEach((page) => {
      const properties = page.properties
      const propKeys = Object.keys(properties)

      const findProp = (name) => {
        const key = propKeys.find(k => k.toLowerCase() === name.toLowerCase())
        return key ? properties[key] : null
      }

      const nodeId = getTextProperty(findProp('NodeID')) || page.id

      if (nodeId === '_layout') {
        const stateJson = getTextProperty(findProp('StateJSON'))
        if (stateJson) {
          try {
            layoutState = JSON.parse(stateJson)
          } catch (e) {
            console.error('레이아웃 JSON 파싱 오류:', e)
          }
        }
        return
      }

      nodes.push({
        id: nodeId,
        name: getTitleProperty(findProp('Name')) || '제목 없음',
        link: getUrlProperty(findProp('Link')) || '',
        group: getSelectProperty(findProp('Group')) || '기타',
        section: getSelectProperty(findProp('Section')) || '기본',
        order: getNumberProperty(findProp('Order')) || 0,
        notionPageId: page.id,
      })
    })

    return NextResponse.json({ nodes, layoutState })
  } catch (error) {
    console.error('Notion API Error:', error)
    return NextResponse.json(
      { error: error.message || '노션 데이터를 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// ========================================
// PATCH - 노드 업데이트 (이름, 링크)
// ========================================
export async function PATCH(request) {
  try {
    if (!process.env.NOTION_TOKEN) {
      return NextResponse.json(
        { error: '노션 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { notionPageId, name, link } = body

    if (!notionPageId) {
      return NextResponse.json(
        { error: 'notionPageId가 필요합니다' },
        { status: 400 }
      )
    }

    const properties = {}

    if (name !== undefined) {
      properties.Name = {
        title: [{ text: { content: name } }],
      }
    }

    if (link !== undefined) {
      properties.Link = {
        url: link || null,
      }
    }

    const response = await notion.pages.update({
      page_id: notionPageId,
      properties: properties,
    })

    return NextResponse.json({
      success: true,
      message: '노드가 업데이트되었습니다',
      pageId: response.id,
    })

  } catch (error) {
    console.error('Notion Update Error:', error)
    return NextResponse.json(
      { error: error.message || '노드 업데이트에 실패했습니다' },
      { status: 500 }
    )
  }
}

// ========================================
// PUT - 레이아웃 상태 저장
// ========================================
export async function PUT(request) {
  try {
    // 환경변수 확인
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
      return NextResponse.json(
        { error: '노션 환경변수가 설정되지 않았습니다' },
        { status: 500 }
      )
    }

    // 요청 본문 파싱
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json(
        { error: '잘못된 JSON 요청입니다' },
        { status: 400 }
      )
    }

    const { positions, groups, edges } = body

    // _layout 레코드 찾기
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'NodeID',
        rich_text: {
          equals: '_layout',
        },
      },
    })

    if (response.results.length === 0) {
      return NextResponse.json({
        error: '_layout 레코드를 찾을 수 없습니다. Notion DB에 다음 레코드를 추가하세요: Name="_레이아웃 상태", NodeID="_layout"',
      }, { status: 404 })
    }

    const layoutPage = response.results[0]
    const layoutPageId = layoutPage.id

    // StateJSON 필드 확인
    const propKeys = Object.keys(layoutPage.properties)
    const stateJsonKey = propKeys.find(k => k.toLowerCase() === 'statejson')

    if (!stateJsonKey) {
      return NextResponse.json({
        error: 'StateJSON 컬럼이 없습니다. Notion DB에 "StateJSON" (Text 타입) 컬럼을 추가하세요.',
      }, { status: 400 })
    }

    // JSON 생성
    const stateJson = JSON.stringify({ positions, groups, edges })

    // Notion rich_text는 2000자 제한 - 청크로 분할
    const chunks = []
    for (let i = 0; i < stateJson.length; i += 2000) {
      chunks.push({ text: { content: stateJson.slice(i, i + 2000) } })
    }

    // Notion 업데이트
    await notion.pages.update({
      page_id: layoutPageId,
      properties: {
        [stateJsonKey]: {
          rich_text: chunks,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: '레이아웃이 저장되었습니다',
      dataSize: stateJson.length,
      chunks: chunks.length,
    })

  } catch (error) {
    console.error('Layout Save Error:', error)
    return NextResponse.json(
      { error: error.message || '레이아웃 저장에 실패했습니다' },
      { status: 500 }
    )
  }
}

// ========================================
// 헬퍼 함수들
// ========================================
function getTitleProperty(prop) {
  if (!prop || prop.type !== 'title') return null
  return prop.title?.[0]?.plain_text || null
}

function getTextProperty(prop) {
  if (!prop || prop.type !== 'rich_text') return null
  return prop.rich_text?.map(t => t.plain_text).join('') || null
}

function getUrlProperty(prop) {
  if (!prop || prop.type !== 'url') return null
  return prop.url || null
}

function getSelectProperty(prop) {
  if (!prop || prop.type !== 'select') return null
  return prop.select?.name || null
}

function getNumberProperty(prop) {
  if (!prop || prop.type !== 'number') return null
  return prop.number || 0
}