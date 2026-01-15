'use client'

import { memo, useState, useCallback, useRef, useEffect } from 'react'
import { Handle, Position, useReactFlow } from '@xyflow/react'

function CustomNode({ id, data, selected }) {
  const { setNodes } = useReactFlow()
  const isAdvanced = data.section === '고급'
  
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [isEditingLink, setIsEditingLink] = useState(false)
  const [labelValue, setLabelValue] = useState(data.label || '')
  const [linkValue, setLinkValue] = useState(data.link || '')
  const labelInputRef = useRef(null)
  const linkInputRef = useRef(null)

  // data 변경 시 로컬 상태 동기화
  useEffect(() => {
    setLabelValue(data.label || '')
    setLinkValue(data.link || '')
  }, [data.label, data.link])

  // 새 노드 생성 시 자동 편집 모드 진입
  useEffect(() => {
    if (data.isNew) {
      setIsEditingLabel(true)
      // isNew 플래그 제거
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? { ...node, data: { ...node.data, isNew: false } }
            : node
        )
      )
    }
  }, [data.isNew, id, setNodes])

  // 라벨 편집 시작 (더블클릭)
  const handleLabelDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setIsEditingLabel(true)
  }, [])

  // 링크 편집 시작 (우클릭)
  const handleContextMenu = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditingLink(true)
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

  // 링크 저장
  const saveLinkEdit = useCallback(() => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, link: linkValue } }
          : node
      )
    )
    setIsEditingLink(false)
  }, [id, linkValue, setNodes])

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

  // 링크 키보드 이벤트
  const handleLinkKeyDown = useCallback((e) => {
    e.stopPropagation()
    if (e.key === 'Enter') {
      saveLinkEdit()
    } else if (e.key === 'Escape') {
      setLinkValue(data.link || '')
      setIsEditingLink(false)
    }
  }, [saveLinkEdit, data.link])

  // 편집 모드 시 자동 포커스
  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus()
      labelInputRef.current.select()
    }
  }, [isEditingLabel])

  useEffect(() => {
    if (isEditingLink && linkInputRef.current) {
      linkInputRef.current.focus()
      linkInputRef.current.select()
    }
  }, [isEditingLink])

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

  // 핸들 중심점 위치 설정
  const handleStyle = { 
    width: 8,
    height: 8,
    background: isAdvanced ? '#9333ea' : '#0d9488',
    border: 'none',
  }

  return (
    <div style={baseStyle} onContextMenu={handleContextMenu}>
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
            fontSize: '14px',
            fontWeight: 600,
            width: '100%',
            minWidth: '60px',
            padding: '2px 4px',
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            outline: 'none',
            textAlign: 'center',
            background: 'white',
          }}
        />
      ) : (
        <div
          onDoubleClick={handleLabelDoubleClick}
          style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}
          title="더블클릭: 라벨 편집 | 우클릭: 링크 편집"
        >
          {data.label}
        </div>
      )}

      {/* 링크 편집 모달 */}
      {isEditingLink && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: '4px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
            링크 URL
          </div>
          <input
            ref={linkInputRef}
            type="text"
            value={linkValue}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={handleLinkKeyDown}
            onBlur={saveLinkEdit}
            className="nodrag"
            placeholder="https://..."
            style={{
              fontSize: '12px',
              width: '100%',
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              outline: 'none',
            }}
          />
        </div>
      )}
      
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
