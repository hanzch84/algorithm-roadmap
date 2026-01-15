'use client'

import { Handle, Position } from '@xyflow/react'

export default function CustomNode({ data }) {
  const isAdvanced = data.section === '고급'
  const hasLink = !!data.link
  const isIntro = data.group === 'intro'

  let nodeClass = 'node-basic'
  if (isAdvanced) nodeClass = 'node-advanced'
  if (isIntro) nodeClass = 'node-intro'

  return (
    <div
      className={`
        px-4 py-2 rounded-lg shadow-md
        transition-all duration-200
        ${nodeClass}
        ${hasLink ? 'cursor-pointer hover:shadow-lg' : 'cursor-default opacity-70'}
      `}
      style={{ minWidth: '120px', maxWidth: '180px' }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-2 !h-2"
      />
      
      <div className="text-center">
        <span className="text-sm font-medium leading-tight block">
          {data.label}
        </span>
        {hasLink && (
          <span className="text-xs opacity-60 mt-1 block">
            🔗 클릭하여 이동
          </span>
        )}
        {!hasLink && (
          <span className="text-xs opacity-40 mt-1 block">
            링크 없음
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-400 !w-2 !h-2"
      />
    </div>
  )
}
