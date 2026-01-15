'use client'

import { Handle, Position } from '@xyflow/react'

export default function CustomNode({ data }) {
  const isAdvanced = data.section === '고급'
  const hasLink = data.link && data.link.length > 0
  const isIntro = data.group === 'intro'

  // 섹션별 색상
  const bgColor = isAdvanced ? '#EDE7F6' : '#E0F2F1'
  const borderColor = isAdvanced ? '#7E57C2' : '#00897B'
  const textColor = isAdvanced ? '#4527A0' : '#004D40'
  
  // 특수 노드 스타일
  const isSpecial = isIntro || data.group === '코딩 도구'

  return (
    <div
      className={`
        px-3 py-2 rounded-lg shadow-md
        transition-all duration-200
        ${hasLink ? 'cursor-pointer hover:shadow-xl hover:scale-105' : 'cursor-default'}
      `}
      style={{ 
        minWidth: '100px', 
        maxWidth: '160px',
        background: isSpecial ? '#FFFFFF' : bgColor,
        border: `${isSpecial ? '3px' : '2px'} solid ${borderColor}`,
        color: isSpecial ? borderColor : textColor,
        opacity: hasLink ? 1 : 0.6,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2"
        style={{ background: borderColor }}
      />
      
      <div className="text-center">
        <span className="text-xs font-medium leading-tight block">
          {data.label}
        </span>
        {hasLink && (
          <span className="text-[10px] opacity-70 mt-1 block">
            🔗 클릭
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2"
        style={{ background: borderColor }}
      />
    </div>
  )
}
