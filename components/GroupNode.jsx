'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, NodeResizer, useReactFlow } from '@xyflow/react'

function GroupNode({ id, data, selected }) {
  const { setNodes } = useReactFlow()
  const isAdvanced = data.section === '고급'
  const isTopLevel = data.depth === 0
  
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [labelValue, setLabelValue] = useState(data.label || '')
  const labelInputRef = useRef(null)

  // data 변경 시 로컬 상태 동기화
  useEffect(() => {
    setLabelValue(data.label || '')
  }, [data.label])

  // 라벨 편집 시작 (Shift + 더블클릭)
  const handleLabelDoubleClick = useCallback((e) => {
    if (e.shiftKey) {
      e.stopPropagation()
      setIsEditingLabel(true)
    }
  }, [])

  // 라벨 저장
  const saveLabelEdit = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, label: labelValue } }
          : node
      )
    )
    setIsEditingLabel(false)
  }, [id, labelValue, setNodes])

  // 라벨 키보드 이벤트
  const handleLabelKeyDown = useCallback((e) => {
    e.stopPropagation()
    if (e.key === 'Enter') {
      saveLabelEdit()
    } else if (e.key === 'Escape') {
      setLabelValue(data.label || '')
      setIsEditingLabel(false)
    }
  }, [saveLabelEdit, data.label])

  // 편집 모드 시 자동 포커스
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus()
      labelInputRef.current.select()
    }
  }, [isEditingLabel])

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

  // 최상위 그룹은 16px, 나머지는 13px
  const fontSize = isTopLevel ? '16px' : '13px'

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
        {/* 라벨 영역 */}
        {isEditingLabel ? (
          <input
            ref={labelInputRef}
            type="text"
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            onKeyDown={handleLabelKeyDown}
            onBlur={saveLabelEdit}
            onClick={(e) => e.stopPropagation()}
            className="nodrag"
            style={{
              fontSize: fontSize,
              fontWeight: 700,
              width: 'calc(100% - 16px)',
              padding: '2px 4px',
              border: '1px solid #3b82f6',
              borderRadius: '4px',
              outline: 'none',
              background: 'white',
              color: isAdvanced ? '#4527A0' : '#004D40',
              marginBottom: '4px',
            }}
          />
        ) : (
          <div
            onDoubleClick={handleLabelDoubleClick}
            style={{ 
              fontSize: fontSize, 
              fontWeight: 700, 
              color: isAdvanced ? '#4527A0' : '#004D40',
              marginBottom: '4px',
              cursor: 'default',
            }}
            title="Shift + 더블클릭: 라벨 편집"
          >
            {data.label}
          </div>
        )}
        
        <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
        <Handle type="target" position={Position.Left} id="left" style={handleStyle} />
        <Handle type="source" position={Position.Right} id="right-src" style={handleStyle} />
        <Handle type="source" position={Position.Bottom} id="bottom-src" style={handleStyle} />
      </div>
    </>
  )
}

export default memo(GroupNode)
