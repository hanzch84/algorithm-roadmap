'use client'

import { memo, useMemo, useState, useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// 핸들 숨김 CSS (React Flow 기본 스타일 오버라이드)
const hideHandleStyles = `
  .react-flow__handle.invisible-handle {
    width: 1px !important;
    height: 1px !important;
    min-width: 0 !important;
    min-height: 0 !important;
    opacity: 0 !important;
    background: transparent !important;
    border: none !important;
    pointer-events: none !important;
    visibility: hidden !important;
  }
  .react-flow__handle.invisible-handle:hover {
    opacity: 0 !important;
    visibility: hidden !important;
  }
`

// 보이지 않는 핸들 스타일
const invisibleHandleStyle = {
  width: 1,
  height: 1,
  opacity: 0,
  background: 'transparent',
  border: 'none',
  pointerEvents: 'none',
  visibility: 'hidden',
}

// ========================================
// 읽기 전용 엣지 컴포넌트
// ========================================
function ReadOnlyEdge({
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
}) {
  const handleRadius = 5

  let adjustedSourceX = sourceX
  let adjustedSourceY = sourceY

  switch (sourcePosition) {
    case 'right': adjustedSourceX = sourceX - handleRadius; break
    case 'left': adjustedSourceX = sourceX + handleRadius; break
    case 'bottom': adjustedSourceY = sourceY - handleRadius; break
    case 'top': adjustedSourceY = sourceY + handleRadius; break
  }

  let adjustedTargetX = targetX
  let adjustedTargetY = targetY

  switch (targetPosition) {
    case 'right': adjustedTargetX = targetX - handleRadius; break
    case 'left': adjustedTargetX = targetX + handleRadius; break
    case 'bottom': adjustedTargetY = targetY - handleRadius; break
    case 'top': adjustedTargetY = targetY + handleRadius; break
  }

  const midX = (adjustedSourceX + adjustedTargetX) / 2
  const midY = (adjustedSourceY + adjustedTargetY) / 2

  const dx = adjustedTargetX - adjustedSourceX
  const dy = adjustedTargetY - adjustedSourceY
  const distance = Math.sqrt(dx * dx + dy * dy)
  const curvature = Math.min(60, Math.max(20, distance * 0.15))

  const perpX = distance > 0 ? -dy / distance : 0
  const perpY = distance > 0 ? dx / distance : 1

  const defaultControlPoint = {
    x: midX + perpX * curvature,
    y: midY + perpY * curvature,
  }

  const controlPoint = data?.controlPoint || defaultControlPoint
  const path = `M ${adjustedSourceX} ${adjustedSourceY} Q ${controlPoint.x} ${controlPoint.y} ${adjustedTargetX} ${adjustedTargetY}`

  return (
    <path
      id={id}
      className="react-flow__edge-path"
      d={path}
      style={{
        ...style,
        stroke: style.stroke || '#E65100',
        strokeWidth: style.strokeWidth || 2,
        fill: 'none',
      }}
      markerEnd={markerEnd}
    />
  )
}

const MemoizedReadOnlyEdge = memo(ReadOnlyEdge)

// ========================================
// 읽기 전용 노드 컴포넌트
// ========================================
function ReadOnlyNode({ data }) {
  const [isHovered, setIsHovered] = useState(false)

  const isAdvanced = data.section === '고급'
  const hasLink = !!data.link
  const isVisited = data.isVisited

  let backgroundColor, borderColor, textColor

  if (!hasLink) {
    backgroundColor = '#F5F5F5'
    borderColor = '#BDBDBD'
    textColor = '#9E9E9E'
  } else if (isVisited) {
    backgroundColor = isAdvanced ? '#E1BEE7' : '#B2DFDB'
    borderColor = isAdvanced ? '#9C27B0' : '#00695C'
    textColor = isAdvanced ? '#6A1B9A' : '#004D40'
  } else {
    backgroundColor = isAdvanced ? '#EDE7F6' : '#E0F2F1'
    borderColor = isAdvanced ? '#7E57C2' : '#00897B'
    textColor = isAdvanced ? '#4527A0' : '#004D40'
  }

  if (isHovered && hasLink) {
    backgroundColor = isAdvanced ? '#D1C4E9' : '#B2DFDB'
    borderColor = isAdvanced ? '#5E35B1' : '#00695C'
  }

  const nodeStyle = {
    padding: '6px 12px',
    borderRadius: '8px',
    border: `2px solid ${borderColor}`,
    backgroundColor,
    fontSize: '12px',
    fontWeight: 500,
    color: textColor,
    cursor: hasLink ? 'pointer' : 'default',
    minWidth: '80px',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    transform: isHovered && hasLink ? 'scale(1.05)' : 'scale(1)',
    boxShadow: isHovered && hasLink ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
  }

  return (
    <div
      style={nodeStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={hasLink ? `클릭: ${data.link}` : '링크 없음'}
    >
      {/* 투명 핸들 - 엣지 연결용 */}
      <Handle type="target" position={Position.Top} id="top" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="target" position={Position.Left} id="left" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="target" position={Position.Right} id="right" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />

      {data.label}
      {hasLink && <span style={{ marginLeft: '4px', fontSize: '10px' }}>{isVisited ? '✓' : '🔗'}</span>}

      <Handle type="source" position={Position.Top} id="top-src" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="source" position={Position.Left} id="left-src" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="source" position={Position.Right} id="right-src" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
    </div>
  )
}

// ========================================
// 읽기 전용 그룹 노드 컴포넌트
// ========================================
function ReadOnlyGroupNode({ data }) {
  const isAdvanced = data.section === '고급'

  const groupStyle = {
    padding: '8px',
    borderRadius: '16px',
    border: `3px solid ${isAdvanced ? '#7E57C2' : '#00897B'}`,
    backgroundColor: isAdvanced ? 'rgba(237, 231, 246, 0.5)' : 'rgba(224, 242, 241, 0.5)',
    width: '100%',
    height: '100%',
  }

  return (
    <div style={groupStyle}>
      {/* 투명 핸들 - 모든 방향 */}
      <Handle type="target" position={Position.Top} id="top" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="target" position={Position.Left} id="left" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="target" position={Position.Right} id="right" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="target" position={Position.Bottom} id="bottom" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />

      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        color: isAdvanced ? '#4527A0' : '#004D40',
        marginBottom: '4px'
      }}>
        {data.label}
      </div>

      <Handle type="source" position={Position.Top} id="top-src" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="source" position={Position.Left} id="left-src" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="source" position={Position.Right} id="right-src" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" style={invisibleHandleStyle} className="invisible-handle" isConnectable={false} />
    </div>
  )
}

const nodeTypes = { custom: ReadOnlyNode, group: ReadOnlyGroupNode }
const edgeTypes = { custom: MemoizedReadOnlyEdge }

// 기본 그룹/위치/엣지 정의 (동일)
const defaultGroups = {
  'sec_basic': { label: '📘 기본 과정', section: '기본', depth: 0, parentId: null, position: { x: -361, y: -29 }, size: { width: 693, height: 765 } },
  'sec_adv': { label: '🚀 고급 과정', section: '고급', depth: 0, parentId: null, position: { x: 352, y: -28 }, size: { width: 334, height: 762 } },
  'sec_platform': { label: '플랫폼 가입', section: '기본', depth: 1, isSubgroup: true, parentId: 'sec_basic', position: { x: 22, y: 83 }, size: { width: 331, height: 153 } },
  'sec_solved': { label: 'solved.ac', section: '기본', depth: 1, isSubgroup: true, parentId: 'sec_basic', position: { x: 394, y: 83 }, size: { width: 272, height: 152 } },
  'sec_tools': { label: '🔧 코딩 도구', section: '기본', depth: 1, isSubgroup: true, parentId: 'sec_basic', position: { x: 23, y: 244 }, size: { width: 643, height: 270 } },
  'sec_record': { label: '스터디 기록/공유/발표', section: '기본', depth: 1, isSubgroup: true, parentId: 'sec_basic', position: { x: 77, y: 528 }, size: { width: 555, height: 104 } },
  'sec_arena': { label: '대회 참가', section: '기본', depth: 1, isSubgroup: true, parentId: 'sec_basic', position: { x: 102, y: 642 }, size: { width: 530, height: 100 } },
  'sec_tools_ide': { label: 'IDE', section: '기본', depth: 2, isSubgroup: true, parentId: 'sec_tools', position: { x: 21, y: 100 }, size: { width: 140, height: 149 } },
  'sec_tools_online_ide': { label: '온라인 IDE', section: '기본', depth: 2, isSubgroup: true, parentId: 'sec_tools', position: { x: 171, y: 100 }, size: { width: 141, height: 148 } },
  'sec_tools_runner': { label: '온라인 러너', section: '기본', depth: 2, isSubgroup: true, parentId: 'sec_tools', position: { x: 323, y: 99 }, size: { width: 139, height: 148 } },
  'sec_tools_notebook': { label: '노트북', section: '기본', depth: 2, isSubgroup: true, parentId: 'sec_tools', position: { x: 473, y: 99 }, size: { width: 151, height: 147 } },
  'sec_adv_ext': { label: '🧩 크롬 확장 프로그램', section: '고급', depth: 1, isSubgroup: true, parentId: 'sec_adv', position: { x: 57, y: 259 }, size: { width: 250, height: 155 } },
  'sec_adv_usage': { label: '⚡ 고급 활용법', section: '고급', depth: 1, isSubgroup: true, parentId: 'sec_adv', position: { x: 87, y: 49 }, size: { width: 187, height: 201 } },
  'sec_adv_contest': { label: '🌐 온라인 콘테스트', section: '고급', depth: 1, isSubgroup: true, parentId: 'sec_adv', position: { x: 90, y: 591 }, size: { width: 150, height: 150 } },
  'sec_adv_til': { label: '✏️ TIL 고급 작성법', section: '고급', depth: 1, isSubgroup: true, parentId: 'sec_adv', position: { x: 26, y: 426 }, size: { width: 286, height: 159 } },
}

const nodeParentMapping = {
  'node_intro': 'sec_basic', 'node_tools_intro': 'sec_tools',
  'node_boj_setup': 'sec_platform', 'node_boj_usage': 'sec_platform',
  'node_koala_setup': 'sec_platform', 'node_koala_usage': 'sec_platform',
  'node_solved_link': 'sec_solved', 'node_solved_usage': 'sec_solved',
  'tool_vscode': 'sec_tools_ide', 'tool_pycharm': 'sec_tools_ide',
  'tool_replit': 'sec_tools_online_ide', 'tool_onlinegdb': 'sec_tools_online_ide',
  'tool_ideone': 'sec_tools_runner', 'tool_tio': 'sec_tools_runner',
  'tool_colab': 'sec_tools_notebook', 'tool_marimo': 'sec_tools_notebook',
  'node_til': 'sec_record', 'node_join': 'sec_record', 'node_study': 'sec_record',
  'node_arena': 'sec_arena', 'node_arenajoin': 'sec_arena', 'node_arenacoalla': 'sec_arena',
  'ext_bjcode': 'sec_adv_ext', 'ext_bojhub': 'sec_adv_ext', 'ext_bojext': 'sec_adv_ext', 'ext_testcase': 'sec_adv_ext',
  'adv_boj': 'sec_adv_usage', 'adv_solved': 'sec_adv_usage', 'adv_koala': 'sec_adv_usage',
  'contest_atcoder': 'sec_adv_contest', 'contest_codeforces': 'sec_adv_contest',
  'draw_io': 'sec_adv_til', 'excalidraw': 'sec_adv_til', 'pythontutor': 'sec_adv_til', 'vscode_ext': 'sec_adv_til',
}

const defaultEdges = [
  { id: 'edge-2', source: 'node_boj_setup', target: 'node_boj_usage', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: -175.09, y: 118.08 } },
  { id: 'edge-3', source: 'node_koala_setup', target: 'node_koala_usage', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: -179.04, y: 162.5 } },
  { id: 'edge-13', source: 'node_arena', target: 'node_arenajoin', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: null },
  { id: 'edge-14', source: 'node_arenajoin', target: 'node_arenacoalla', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: null },
  { id: 'edge-1768455001460', source: 'node_boj_usage', target: 'node_solved_link', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: -1.48, y: 112.74 } },
  { id: 'edge-1768457272681', source: 'node_intro', target: 'node_koala_setup', sourceHandle: 'bottom-src', targetHandle: 'left', controlPoint: { x: -362.09, y: 162.08 } },
  { id: 'edge-1768457708909', source: 'sec_platform', target: 'sec_tools', sourceHandle: 'right-src', targetHandle: 'top', controlPoint: { x: 13.11, y: 128.03 } },
  { id: 'edge-1768457839803', source: 'node_tools_intro', target: 'sec_tools_ide', sourceHandle: 'left-src', targetHandle: 'top', controlPoint: { x: -238.41, y: 293.4 } },
  { id: 'edge-1768457846287', source: 'node_tools_intro', target: 'sec_tools_notebook', sourceHandle: 'right-src', targetHandle: 'top', controlPoint: { x: 202.1, y: 282.98 } },
  { id: 'edge-1768457863495', source: 'node_tools_intro', target: 'sec_tools_online_ide', sourceHandle: 'bottom-src', targetHandle: 'top', controlPoint: { x: -93.19, y: 304.51 } },
  { id: 'edge-1768457879417', source: 'node_tools_intro', target: 'sec_tools_runner', sourceHandle: 'right-src', targetHandle: 'top', controlPoint: { x: 56.19, y: 280.2 } },
  { id: 'edge-1768457941643', source: 'sec_tools', target: 'sec_record', sourceHandle: 'bottom-src', targetHandle: 'top', controlPoint: { x: -7.73, y: 488.64 } },
  { id: 'edge-1768457963564', source: 'sec_record', target: 'sec_arena', sourceHandle: 'bottom-src', targetHandle: 'top', controlPoint: { x: 2.69, y: 605.37 } },
  { id: 'edge-1768458027580', source: 'node_solved_link', target: 'node_solved_usage', sourceHandle: 'bottom-src', targetHandle: 'left', controlPoint: null },
  { id: 'edge-1768458251117', source: 'sec_record', target: 'sec_adv_til', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 339.68, y: 484.47 } },
  { id: 'edge-1768458255698', source: 'sec_arena', target: 'sec_adv_contest', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 409.86, y: 639.42 } },
  { id: 'edge-1768458351295', source: 'sec_solved', target: 'sec_adv_ext', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 354.27, y: 306.6 } },
  { id: 'edge-1768459407226', source: 'sec_solved', target: 'sec_adv_usage', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 374.42, y: 121.08 } },
  { id: 'edge-11', source: 'node_til', target: 'node_join', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: -118.21, y: 562.99 } },
  { id: 'edge-12', source: 'node_join', target: 'node_study', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 48.55, y: 561.6 } },
  { id: 'edge-1768651866715', source: 'node_intro', target: 'node_boj_setup', sourceHandle: 'bottom-src', targetHandle: 'left', controlPoint: { x: -357.92, y: 112.74 } },
]

const defaultPositions = {
  'node_intro': { x: 25, y: 25 }, 'node_boj_setup': { x: 38, y: 43 }, 'node_boj_usage': { x: 177, y: 43 },
  'node_koala_setup': { x: 40, y: 88 }, 'node_koala_usage': { x: 170, y: 88 },
  'node_solved_link': { x: 19, y: 44 }, 'node_solved_usage': { x: 107, y: 89 },
  'node_tools_intro': { x: 190, y: 43 },
  'tool_vscode': { x: 25, y: 42 }, 'tool_pycharm': { x: 25, y: 89 },
  'tool_replit': { x: 30, y: 42 }, 'tool_onlinegdb': { x: 30, y: 88 },
  'tool_ideone': { x: 30, y: 45 }, 'tool_tio': { x: 31, y: 89 },
  'tool_colab': { x: 19, y: 46 }, 'tool_marimo': { x: 35, y: 89 },
  'node_til': { x: 35, y: 45 }, 'node_join': { x: 192, y: 45 }, 'node_study': { x: 355, y: 45 },
  'node_arena': { x: 30, y: 43 }, 'node_arenajoin': { x: 195, y: 43 }, 'node_arenacoalla': { x: 360, y: 43 },
}

const markerEnd = { type: 'arrowclosed', color: '#E65100', width: 12, height: 12 }

// ========================================
// 메인 컴포넌트
// ========================================
export default function ReadOnlyFlow({ nodes: inputNodes, positions: inputPositions, groups: inputGroups, edges: inputEdges }) {
  const [visitedNodes, setVisitedNodes] = useState(new Set())

  useEffect(() => {
    try {
      const saved = localStorage.getItem('roadmap-visited-nodes')
      if (saved) setVisitedNodes(new Set(JSON.parse(saved)))
    } catch (e) { }
  }, [])

  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'group') return
    const link = node.data?.link
    if (link) {
      setVisitedNodes(prev => {
        const newSet = new Set(prev)
        newSet.add(node.id)
        try { localStorage.setItem('roadmap-visited-nodes', JSON.stringify([...newSet])) } catch (e) { }
        return newSet
      })
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }, [])

  const clearVisited = useCallback(() => {
    setVisitedNodes(new Set())
    try { localStorage.removeItem('roadmap-visited-nodes') } catch (e) { }
  }, [])

  const { flowNodes, flowEdges } = useMemo(() => {
    const flowNodes = []
    const flowEdges = []

    const groups = { ...defaultGroups }
    if (inputGroups) Object.keys(inputGroups).forEach(key => {
      if (groups[key]) groups[key] = { ...groups[key], ...inputGroups[key] }
    })

    const positions = { ...defaultPositions, ...(inputPositions || {}) }

    // 그룹 노드
    Object.entries(groups).sort((a, b) => (a[1]?.depth || 0) - (b[1]?.depth || 0)).forEach(([id, group]) => {
      if (!group) return
      const node = {
        id, type: 'group',
        position: group.position || { x: 0, y: 0 },
        style: { width: group.size?.width || 200, height: group.size?.height || 100, zIndex: -10 + (group.depth || 0) * 5 },
        data: { label: group.label || '', section: group.section || '기본' },
        draggable: false, selectable: false,
      }
      if (group.parentId) { node.parentId = group.parentId; node.extent = 'parent' }
      flowNodes.push(node)
    })

    // 일반 노드
    if (inputNodes?.length > 0) {
      inputNodes.forEach((node, i) => {
        if (!node) return
        const pos = positions[node.id] || { x: 20 + (i % 4) * 120, y: 40 }
        const flowNode = {
          id: node.id, type: 'custom', position: pos, zIndex: 100,
          data: { label: node.name || '', link: node.link || '', section: node.section || '기본', isVisited: visitedNodes.has(node.id) },
          draggable: false, selectable: false,
        }
        const parentGroupId = nodeParentMapping[node.id]
        if (parentGroupId && groups[parentGroupId]) { flowNode.parentId = parentGroupId; flowNode.extent = 'parent' }
        flowNodes.push(flowNode)
      })
    }

    // 엣지
    const allNodeIds = flowNodes.map(n => n.id)
    const edgesToUse = inputEdges?.length > 0 ? inputEdges : defaultEdges
    edgesToUse.forEach((edge, i) => {
      if (!edge || !allNodeIds.includes(edge.source) || !allNodeIds.includes(edge.target)) return
      flowEdges.push({
        id: edge.id || `edge-${i}`,
        source: edge.source, target: edge.target,
        sourceHandle: edge.sourceHandle || 'bottom-src', targetHandle: edge.targetHandle || 'top',
        type: 'custom', style: { stroke: '#E65100', strokeWidth: 2 }, markerEnd,
        data: { controlPoint: edge.controlPoint || null },
      })
    })

    return { flowNodes, flowEdges }
  }, [inputNodes, inputPositions, inputGroups, inputEdges, visitedNodes])

  return (
    <div className="w-full h-full">
      <style>{hideHandleStyles}</style>
      <ReactFlow
        nodes={flowNodes} edges={flowEdges}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2} maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
        panOnDrag={true} zoomOnScroll={true} nodeOrigin={[0, 0]}
      >
        <Background color="#ddd" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'group') return node.data?.section === '고급' ? '#D1C4E9' : '#B2DFDB'
            if (node.data?.isVisited) return node.data?.section === '고급' ? '#CE93D8' : '#80CBC4'
            return node.data?.section === '고급' ? '#EDE7F6' : '#E0F2F1'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        <Panel position="bottom-left" className="bg-white/90 p-3 rounded-lg shadow text-xs">
          <div className="font-bold mb-1">사용법</div>
          <div>• 드래그: 화면 이동 | 스크롤: 확대/축소</div>
          <div>• 노드 클릭: 링크 열기 🔗</div>
          <div className="mt-2 text-gray-500">
            <span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: '#E0F2F1', border: '1px solid #00897B' }}></span>미방문
            <span className="inline-block w-3 h-3 rounded mx-1 ml-2" style={{ backgroundColor: '#B2DFDB', border: '1px solid #00695C' }}></span>방문
            <span className="inline-block w-3 h-3 rounded mx-1 ml-2" style={{ backgroundColor: '#F5F5F5', border: '1px solid #BDBDBD' }}></span>링크없음
          </div>
          {visitedNodes.size > 0 && (
            <button onClick={clearVisited} className="mt-2 text-blue-600 hover:underline">
              방문 기록 초기화 ({visitedNodes.size}개)
            </button>
          )}
        </Panel>
      </ReactFlow>
    </div>
  )
}