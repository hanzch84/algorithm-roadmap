'use client'

import { memo } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'

function GroupNode({ data, selected }) {
  const isAdvanced = data.section === '고급'
  const isSubgroup = data.isSubgroup
  
  // 색상 설정
  const bgColor = isAdvanced 
    ? (isSubgroup ? 'rgba(237, 231, 246, 0.4)' : 'rgba(237, 231, 246, 0.6)')
    : (isSubgroup ? 'rgba(224, 242, 241, 0.4)' : 'rgba(224, 242, 241, 0.6)')
  const borderColor = isAdvanced ? '#7E57C2' : '#00897B'
  const textColor = isAdvanced ? '#4527A0' : '#004D40'

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={50}
        isVisible={selected}
        lineClassName="!border-blue-400"
        handleClassName="!w-2 !h-2 !bg-blue-400"
      />
      <div
        style={{
          width: '100%',
          height: '100%',
          background: bgColor,
          border: `${isSubgroup ? '2px dashed' : '3px solid'} ${borderColor}`,
          borderRadius: isSubgroup ? '8px' : '12px',
          padding: '8px',
        }}
      >
        <div
          style={{
            fontSize: isSubgroup ? '11px' : '13px',
            fontWeight: 'bold',
            color: textColor,
            marginBottom: '4px',
          }}
        >
          {data.label}
        </div>
      </div>
    </>
  )
}

export default memo(GroupNode)
