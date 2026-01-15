'use client'

import { memo, useCallback } from 'react'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react'

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}) {
  const { setEdges } = useReactFlow()
  
  // 컨트롤 포인트 기본값 계산 (소스와 타겟 중간)
  const defaultControlPoint = {
    x: (sourceX + targetX) / 2,
    y: (sourceY + targetY) / 2,
  }
  
  const controlPoint = data?.controlPoint || defaultControlPoint
  
  // 커스텀 베지어 경로 생성
  const path = `M ${sourceX} ${sourceY} Q ${controlPoint.x} ${controlPoint.y} ${targetX} ${targetY}`
  
  // 컨트롤 포인트 드래그 핸들러
  const onControlPointDrag = useCallback((event) => {
    event.stopPropagation()
    
    const startX = event.clientX
    const startY = event.clientY
    const startControlX = controlPoint.x
    const startControlY = controlPoint.y
    
    const onMouseMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      
      // 뷰포트 스케일을 고려한 이동량 계산
      const flowContainer = document.querySelector('.react-flow__viewport')
      if (!flowContainer) return
      
      const transform = flowContainer.style.transform
      const scaleMatch = transform.match(/scale\(([\d.]+)\)/)
      const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1
      
      const newX = startControlX + dx / scale
      const newY = startControlY + dy / scale
      
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  controlPoint: { x: newX, y: newY },
                },
              }
            : edge
        )
      )
    }
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [id, controlPoint, setEdges])
  
  // 컨트롤 포인트 초기화 (더블클릭)
  const onControlPointReset = useCallback((event) => {
    event.stopPropagation()
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? {
              ...edge,
              data: {
                ...edge.data,
                controlPoint: null,
              },
            }
          : edge
      )
    )
  }, [id, setEdges])

  const edgeColor = selected ? '#ef4444' : (style.stroke || '#E65100')
  const strokeWidth = selected ? 3 : (style.strokeWidth || 2)

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: strokeWidth,
          fill: 'none',
        }}
        markerEnd={markerEnd}
      />
      
      {/* 투명한 넓은 히트 영역 */}
      <path
        d={path}
        style={{
          stroke: 'transparent',
          strokeWidth: 20,
          fill: 'none',
          cursor: 'pointer',
        }}
      />
      
      <EdgeLabelRenderer>
        {/* 컨트롤 포인트 핸들 */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${controlPoint.x}px, ${controlPoint.y}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            onMouseDown={onControlPointDrag}
            onDoubleClick={onControlPointReset}
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: selected ? '#ef4444' : '#E65100',
              border: '2px solid white',
              cursor: 'grab',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              opacity: selected ? 1 : 0.6,
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'scale(1.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = selected ? '1' : '0.6'
              e.currentTarget.style.transform = 'scale(1)'
            }}
            title="드래그: 곡률 조절 | 더블클릭: 초기화"
          />
        </div>
        
        {/* 소스-컨트롤 포인트 연결선 (선택 시에만) */}
        {selected && (
          <>
            <svg
              style={{
                position: 'absolute',
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
                strokeDasharray="4"
              />
              <line
                x1={controlPoint.x}
                y1={controlPoint.y}
                x2={targetX}
                y2={targetY}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4"
              />
            </svg>
          </>
        )}
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(CustomEdge)


