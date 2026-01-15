'use client'

import { memo, useState, useCallback } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react'

function EditableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}) {
  const { setEdges } = useReactFlow()
  const [isDragging, setIsDragging] = useState(false)

  // 컨트롤 포인트 기본값 (엣지 중앙)
  const defaultControlPoint = {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  }

  // 저장된 오프셋 또는 기본값 사용
  const offsetX = data?.controlPointOffset?.x || 0
  const offsetY = data?.controlPointOffset?.y || 0

  const controlPoint = {
    x: defaultControlPoint.x + offsetX,
    y: defaultControlPoint.y + offsetY,
  }

  // 커스텀 베지어 경로 생성
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.25,
  })

  // 컨트롤 포인트를 사용한 quadratic bezier path
  const customPath = `M ${sourceX} ${sourceY} Q ${controlPoint.x} ${controlPoint.y} ${targetX} ${targetY}`

  // 컨트롤 포인트 드래그 핸들러
  const onMouseDown = useCallback((e) => {
    e.stopPropagation()
    setIsDragging(true)

    const startX = e.clientX
    const startY = e.clientY
    const startOffsetX = offsetX
    const startOffsetY = offsetY

    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY

      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                controlPointOffset: {
                  x: startOffsetX + dx,
                  y: startOffsetY + dy,
                },
              },
            }
          }
          return edge
        })
      )
    }

    const onMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [id, offsetX, offsetY, setEdges])

  // 오프셋 리셋 (더블클릭)
  const onDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setEdges((edges) =>
      edges.map((edge) => {
        if (edge.id === id) {
          return {
            ...edge,
            data: {
              ...edge.data,
              controlPointOffset: { x: 0, y: 0 },
            },
          }
        }
        return edge
      })
    )
  }, [id, setEdges])

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={customPath}
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
          stroke: selected ? '#ef4444' : style.stroke || '#E65100',
        }}
        markerEnd={markerEnd}
        fill="none"
      />
      
      {/* 선택 시 컨트롤 포인트 표시 */}
      {selected && (
        <EdgeLabelRenderer>
          {/* 소스에서 컨트롤 포인트로 가는 보조선 */}
          <svg
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <line
              x1={sourceX}
              y1={sourceY}
              x2={controlPoint.x}
              y2={controlPoint.y}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
            <line
              x1={controlPoint.x}
              y1={controlPoint.y}
              x2={targetX}
              y2={targetY}
              stroke="#94a3b8"
              strokeWidth={1}
              strokeDasharray="4 2"
            />
          </svg>
          
          {/* 컨트롤 포인트 핸들 */}
          <div
            onMouseDown={onMouseDown}
            onDoubleClick={onDoubleClick}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${controlPoint.x}px, ${controlPoint.y}px)`,
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: isDragging ? '#3b82f6' : '#fff',
              border: '2px solid #3b82f6',
              cursor: 'grab',
              zIndex: 1000,
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            }}
            title="드래그: 곡률 조절 / 더블클릭: 리셋"
          />
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export default memo(EditableEdge)
