'use client'

import { memo } from 'react'
import { Handle, Position, NodeResizer } from '@xyflow/react'

function GroupNode({ data, selected }) {
  const isAdvanced = data.section === '고급'
  
  const style = {
    padding: '8px',
    borderRadius: '16px',
    border: `3px solid ${isAdvanced ? '#7E57C2' : '#00897B'}`,
    backgroundColor: isAdvanced ? 'rgba(237, 231, 246, 0.5)' : 'rgba(224, 242, 241, 0.5)',
    width: '100%',
    height: '100%',
  }

  const handleStyle = {
    width: 10,
    height: 10,
    background: isAdvanced ? '#7E57C2' : '#00897B',
    border: 'none',
  }

  return (
    <>
      <NodeResizer 
        minWidth={100} 
        minHeight={50} 
        isVisible={selected}
        lineStyle={{ border: '1px solid', borderColor: isAdvanced ? '#7E57C2' : '#00897B' }}
        handleStyle={{ width: 8, height: 8, borderRadius: 2 }}
      />
      <div style={style}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 700, 
          color: isAdvanced ? '#4527A0' : '#004D40',
          marginBottom: '4px'
        }}>
          {data.label}
        </div>
        
        <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
        <Handle type="target" position={Position.Left} id="left" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="right-src" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="bottom-src" style={handleStyle} />
      </div>
    </>
  )
}

export default memo(GroupNode)
