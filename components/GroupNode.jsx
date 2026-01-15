'use client'

import { memo } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'

function GroupNode({ data, selected }) {
  const isAdvanced = data.section === '고급'
  const isSubgroup = data.isSubgroup
  const depth = data.depth || 0
  
  // 깊이에 따른 투명도 조정 (깊을수록 진하게)
  const opacity = 0.3 + (depth * 0.15)
  
  // 색상 설정
  const bgColor = isAdvanced 
    ? `rgba(237, 231, 246, ${opacity})`
    : `rgba(224, 242, 241, ${opacity})`
  const borderColor = isAdvanced ? '#7E57C2' : '#00897B'
  const textColor = isAdvanced ? '#4527A0' : '#004D40'

  return (
    <>
      <NodeResizer 
        minWidth={80} 
        minHeight={40}
        isVisible={selected}
        lineClassName="!border-blue-500"
        handleClassName="!w-3 !h-3 !bg-blue-500 !border-white !border-2"
      />
      {/* 4방향 연결점 */}
      <Handle type="target" position={Position.Top} id="top" style={{ background: borderColor, width: 8, height: 8 }} />
      <Handle type="target" position={Position.Left} id="left" style={{ background: borderColor, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" style={{ background: borderColor, width: 8, height: 8 }} />
      <Handle type="source" position={Position.Right} id="right-src" style={{ background: borderColor, width: 8, height: 8 }} />
      
      <div
        style={{
          width: '100%',
          height: '100%',
          background: bgColor,
          border: `${isSubgroup ? '2px dashed' : '3px solid'} ${borderColor}`,
          borderRadius: isSubgroup ? '8px' : '16px',
          padding: '6px 10px',
        }}
      >
        <div
          style={{
            fontSize: isSubgroup ? '11px' : '14px',
            fontWeight: 'bold',
            color: textColor,
            userSelect: 'none',
          }}
        >
          {data.label}
        </div>
      </div>
    </>
  )
}

export default memo(GroupNode)
