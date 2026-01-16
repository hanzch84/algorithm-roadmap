'use client'

import { memo, useCallback } from 'react'
import { EdgeLabelRenderer, useReactFlow } from '@xyflow/react'

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
  sourceHandleId,
  targetHandleId,
}) {
  const { setEdges, screenToFlowPosition } = useReactFlow()
  
  // 핸들 크기의 절반 (핸들 중심으로 연결하기 위한 보정값)
  const handleOffset = 4
  
  // 소스 좌표 보정 (핸들 중심으로)
  let adjustedSourceX = sourceX
  let adjustedSourceY = sourceY
  
  if (sourceHandleId?.includes('right')) {
    adjustedSourceX = sourceX + handleOffset
  } else if (sourceHandleId?.includes('left')) {
    adjustedSourceX = sourceX - handleOffset
  } else if (sourceHandleId?.includes('bottom')) {
    adjustedSourceY = sourceY + handleOffset
  } else if (sourceHandleId?.includes('top')) {
    adjustedSourceY = sourceY - handleOffset
  }
  
  // 타겟 좌표 보정 (핸들 중심으로)
  let adjustedTargetX = targetX
  let adjustedTargetY = targetY
  
  if (targetHandleId === 'right' || targetHandleId?.includes('right')) {
    adjustedTargetX = targetX + handleOffset
  } else if (targetHandleId === 'left') {
    adjustedTargetX = targetX - handleOffset
  } else if (targetHandleId === 'bottom') {
    adjustedTargetY = targetY + handleOffset
  } else if (targetHandleId === 'top') {
    adjustedTargetY = targetY - handleOffset
  }
  
  // 기본 곡률 계산 (직선이 아닌 곡선으로)
  const midX = (adjustedSourceX + adjustedTargetX) / 2
  const midY = (adjustedSourceY + adjustedTargetY) / 2
  
  // 소스-타겟 방향에 수직인 방향으로 오프셋
  const dx = adjustedTargetX - adjustedSourceX
  const dy = adjustedTargetY - adjustedSourceY
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  // 거리에 비례한 곡률 (최소 20, 최대 60)
  const curvature = Math.min(60, Math.max(20, distance * 0.15))
  
  // 수직 방향 벡터 (정규화)
  const perpX = distance > 0 ? -dy / distance : 0
  const perpY = distance > 0 ? dx / distance : 1
  
  // 기본 컨트롤 포인트 (중간점에서 수직 방향으로 오프셋)
  const defaultControlPoint = {
    x: midX + perpX * curvature,
    y: midY + perpY * curvature,
  }
  
  const controlPoint = data?.controlPoint || defaultControlPoint
  
  // 커스텀 베지어 경로 생성 (보정된 좌표 사용)
  const path = `M ${adjustedSourceX} ${adjustedSourceY} Q ${controlPoint.x} ${controlPoint.y} ${adjustedTargetX} ${adjustedTargetY}`
  
  // 컨트롤 포인트 드래그 핸들러
  const onControlPointDrag = useCallback((event) => {
    event.stopPropagation()
    event.preventDefault()
    
    const onMouseMove = (moveEvent) => {
      moveEvent.preventDefault()
      
      // 화면 좌표를 Flow 좌표로 변환
      const position = screenToFlowPosition({
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      })
      
      setEdges((edges) =>
        edges.map((edge) =>
          edge.id === id
            ? {
                ...edge,
                data: {
                  ...edge.data,
                  controlPoint: { x: position.x, y: position.y },
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
  }, [id, setEdges, screenToFlowPosition])
  
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
        {/* 선택 시에만 컨트롤 포인트와 가이드라인 표시 */}
        {selected && (
          <>
            {/* 소스-컨트롤 포인트 연결선 */}
            <svg
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
                zIndex: 99999,
              }}
            >
              <line
                x1={adjustedSourceX}
                y1={adjustedSourceY}
                x2={controlPoint.x}
                y2={controlPoint.y}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4"
              />
              <line
                x1={controlPoint.x}
                y1={controlPoint.y}
                x2={adjustedTargetX}
                y2={adjustedTargetY}
                stroke="#94a3b8"
                strokeWidth={1}
                strokeDasharray="4"
              />
            </svg>
            
            {/* 컨트롤 포인트 핸들 */}
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${controlPoint.x}px, ${controlPoint.y}px)`,
                pointerEvents: 'all',
                zIndex: 100000,
              }}
              className="nodrag nopan"
            >
              <div
                onMouseDown={onControlPointDrag}
                onDoubleClick={onControlPointReset}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid white',
                  cursor: 'grab',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                title="드래그: 곡률 조절 | 더블클릭: 초기화"
              />
            </div>
          </>
        )}
      </EdgeLabelRenderer>
    </>
  )
}

export default memo(CustomEdge)
