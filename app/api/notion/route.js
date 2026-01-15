import { Client } from '@notionhq/client'
import { NextResponse } from 'next/server'

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
})

const databaseId = process.env.NOTION_DATABASE_ID

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

    const nodes = response.results.map((page) => {
      const properties = page.properties

      return {
        id: getTextProperty(properties.NodeID) || page.id,
        name: getTitleProperty(properties.Name) || '제목 없음',
        link: getUrlProperty(properties.Link) || '',
        group: getSelectProperty(properties.Group) || '기타',
        section: getSelectProperty(properties.Section) || '기본',
        order: getNumberProperty(properties.Order) || 0,
        notionPageId: page.id,
      }
    })

    return NextResponse.json(nodes)
  } catch (error) {
    console.error('Notion API Error:', error)
    return NextResponse.json(
      { error: error.message || '노션 데이터를 가져오는데 실패했습니다' },
      { status: 500 }
    )
  }
}

// 속성 값 추출 헬퍼 함수들
function getTitleProperty(prop) {
  if (!prop || prop.type !== 'title') return null
  return prop.title?.[0]?.plain_text || null
}

function getTextProperty(prop) {
  if (!prop || prop.type !== 'rich_text') return null
  return prop.rich_text?.[0]?.plain_text || null
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
