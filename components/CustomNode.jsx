'use client'

import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'

function CustomNode({ data, selected }) {
  const isAdvanced = data.section === '고급'
  
  const baseStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '2px solid',
    borderColor: isAdvanced ? '#a855f7' : '#2dd4bf',
    backgroundColor: isAdvanced ? '#faf5ff' : '#f0fdfa',
    color: isAdvanced ? '#581c87' : '#115e59',
    cursor: 'pointer',
    minWidth: '80px',
    textAlign: 'center',
    fontWeight: 500,
    boxShadow: selected ? '0 0 0 2px #fb923c' : '0 1px 2px rgba(0,0,0,0.1)',
  }

  const handleStyle = { 
    width: 8,
    height: 8,
    background: isAdvanced ? '#9333ea' : '#0d9488',
    border: 'none',
  }

  return (
    <div style={baseStyle}>
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={handleStyle}
      />
      
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={handleStyle}
      />
      
      <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {data.label}
      </div>
      
      <Handle
        type="source"
        position={Position.Right}
        id="right-src"
        style={handleStyle}
      />
      
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-src"
        style={handleStyle}
      />
      
      <Handle
        type="source"
        position={Position.Left}
        id="left-src"
        style={{ ...handleStyle, top: '70%' }}
      />
    </div>
  )
}

export default memo(CustomNode)
