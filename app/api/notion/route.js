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
      
      // 디버깅: 속성명 확인
      const propKeys = Object.keys(properties)
      
      // 속성명 대소문자 무관하게 찾기
      const findProp = (name) => {
        const key = propKeys.find(k => k.toLowerCase() === name.toLowerCase())
        return key ? properties[key] : null
      }

      return {
        id: getTextProperty(findProp('NodeID')) || getTextProperty(findProp('nodeid')) || page.id,
        name: getTitleProperty(findProp('Name')) || getTitleProperty(findProp('이름')) || '제목 없음',
        link: getUrlProperty(findProp('Link')) || '',
        group: getSelectProperty(findProp('Group')) || '기타',
        section: getSelectProperty(findProp('Section')) || '기본',
        order: getNumberProperty(findProp('Order')) || 0,
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
  if (!prop) return null
  if (prop.type === 'title') {
    return prop.title?.[0]?.plain_text || null
  }
  return null
}

function getTextProperty(prop) {
  if (!prop) return null
  if (prop.type === 'rich_text') {
    return prop.rich_text?.[0]?.plain_text || null
  }
  return null
}

function getUrlProperty(prop) {
  if (!prop) return null
  if (prop.type === 'url') {
    return prop.url || null
  }
  return null
}

function getSelectProperty(prop) {
  if (!prop) return null
  if (prop.type === 'select') {
    return prop.select?.name || null
  }
  return null
}

function getNumberProperty(prop) {
  if (!prop) return null
  if (prop.type === 'number') {
    return prop.number || 0
  }
  return 0
}
