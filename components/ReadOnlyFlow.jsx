'use client'

import { useCallback, useMemo, useState, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

// ========================================
// 읽기 전용 노드 컴포넌트 (핸들 숨김)
// ========================================
import { memo } from 'react'

const ReadOnlyNode = memo(function ReadOnlyNode({ data, selected }) {
  const isAdvanced = data.section === '고급'
  
  const baseStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: `2px solid ${isAdvanced ? '#7E57C2' : '#00897B'}`,
    backgroundColor: isAdvanced ? '#EDE7F6' : '#E0F2F1',
    minWidth: '80px',
    fontSize: '12px',
    fontWeight: 500,
    color: isAdvanced ? '#4527A0' : '#004D40',
    cursor: data.link ? 'pointer' : 'default',
    transition: 'all 0.2s',
    boxShadow: selected ? '0 0 0 2px #3b82f6' : 'none',
  }

  return (
    <div style={baseStyle}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        justifyContent: 'center',
      }}>
        {data.link && <span style={{ fontSize: '10px' }}>🔗</span>}
        <span>{data.label}</span>
      </div>
    </div>
  )
})

// ========================================
// 읽기 전용 그룹 노드
// ========================================
const ReadOnlyGroupNode = memo(function ReadOnlyGroupNode({ data }) {
  const isAdvanced = data.section === '고급'
  
  const style = {
    padding: '8px',
    borderRadius: '16px',
    border: `3px solid ${isAdvanced ? '#7E57C2' : '#00897B'}`,
    backgroundColor: isAdvanced ? 'rgba(237, 231, 246, 0.5)' : 'rgba(224, 242, 241, 0.5)',
    width: '100%',
    height: '100%',
  }

  return (
    <div style={style}>
      <div style={{ 
        fontSize: '13px', 
        fontWeight: 700, 
        color: isAdvanced ? '#4527A0' : '#004D40',
        marginBottom: '4px'
      }}>
        {data.label}
      </div>
    </div>
  )
})

// ========================================
// 읽기 전용 엣지 (편집 불가)
// ========================================
const ReadOnlyEdge = memo(function ReadOnlyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  data,
}) {
  // 기본 곡률 계산
  const midX = (sourceX + targetX) / 2
  const midY = (sourceY + targetY) / 2
  
  const dx = targetX - sourceX
  const dy = targetY - sourceY
  const distance = Math.sqrt(dx * dx + dy * dy)
  
  const curvature = Math.min(60, Math.max(20, distance * 0.15))
  
  const perpX = distance > 0 ? -dy / distance : 0
  const perpY = distance > 0 ? dx / distance : 1
  
  const defaultControlPoint = {
    x: midX + perpX * curvature,
    y: midY + perpY * curvature,
  }
  
  const controlPoint = data?.controlPoint || defaultControlPoint
  
  const path = `M ${sourceX} ${sourceY} Q ${controlPoint.x} ${controlPoint.y} ${targetX} ${targetY}`

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
})

const nodeTypes = {
  custom: ReadOnlyNode,
  group: ReadOnlyGroupNode,
}

const edgeTypes = {
  custom: ReadOnlyEdge,
}

// ========================================
// 서브그래프(그룹) 정의 (RoadmapFlow와 동일)
// ========================================
const defaultGroups = {
  'sec_basic': {
    label: '📘 기본 과정',
    section: '기본',
    depth: 0,
    parentId: null,
    position: { x: -361, y: -29 },
    size: { width: 693, height: 765 },
  },
  'sec_adv': {
    label: '🚀 고급 과정',
    section: '고급',
    depth: 0,
    parentId: null,
    position: { x: 352, y: -28 },
    size: { width: 334, height: 762 },
  },
  'sec_platform': {
    label: '플랫폼 가입',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 22, y: 83 },
    size: { width: 358, height: 154 },
  },
  'sec_solved': {
    label: 'solved.ac',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 394, y: 83 },
    size: { width: 272, height: 152 },
  },
  'sec_tools': {
    label: '🔧 코딩 도구',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 23, y: 244 },
    size: { width: 643, height: 270 },
  },
  'sec_record': {
    label: '스터디 기록/공유/발표',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 102, y: 528 },
    size: { width: 485, height: 104 },
  },
  'sec_arena': {
    label: '대회 참가',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 107, y: 645 },
    size: { width: 470, height: 100 },
  },
  'sec_tools_ide': {
    label: 'IDE',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 21, y: 100 },
    size: { width: 140, height: 149 },
  },
  'sec_tools_online_ide': {
    label: '온라인 IDE',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 171, y: 100 },
    size: { width: 141, height: 148 },
  },
  'sec_tools_runner': {
    label: '온라인 러너',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 323, y: 99 },
    size: { width: 139, height: 148 },
  },
  'sec_tools_notebook': {
    label: '노트북',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 473, y: 99 },
    size: { width: 151, height: 147 },
  },
  'sec_adv_ext': {
    label: '🧩 크롬 확장 프로그램',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 57, y: 259 },
    size: { width: 250, height: 155 },
  },
  'sec_adv_usage': {
    label: '⚡ 고급 활용법',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 87, y: 49 },
    size: { width: 187, height: 201 },
  },
  'sec_adv_contest': {
    label: '🌐 온라인 콘테스트',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 90, y: 591 },
    size: { width: 150, height: 150 },
  },
  'sec_adv_til': {
    label: '✏️ TIL 고급 작성법',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 26, y: 426 },
    size: { width: 286, height: 159 },
  },
}

// 노드-그룹 매핑
const nodeParentMapping = {
  'node_intro': 'sec_basic',
  'node_tools_intro': 'sec_tools',
  'node_boj_setup': 'sec_platform',
  'node_boj_usage': 'sec_platform',
  'node_koala_setup': 'sec_platform',
  'node_koala_usage': 'sec_platform',
  'node_solved_link': 'sec_solved',
  'node_solved_usage': 'sec_solved',
  'tool_vscode': 'sec_tools_ide',
  'tool_pycharm': 'sec_tools_ide',
  'tool_replit': 'sec_tools_online_ide',
  'tool_onlinegdb': 'sec_tools_online_ide',
  'tool_ideone': 'sec_tools_runner',
  'tool_tio': 'sec_tools_runner',
  'tool_colab': 'sec_tools_notebook',
  'tool_marimo': 'sec_tools_notebook',
  'node_til': 'sec_record',
  'node_join': 'sec_record',
  'node_study': 'sec_record',
  'node_arena': 'sec_arena',
  'node_arenajoin': 'sec_arena',
  'node_arenacoalla': 'sec_arena',
  'ext_bjcode': 'sec_adv_ext',
  'ext_bojhub': 'sec_adv_ext',
  'ext_bojext': 'sec_adv_ext',
  'ext_testcase': 'sec_adv_ext',
  'adv_boj': 'sec_adv_usage',
  'adv_solved': 'sec_adv_usage',
  'adv_koala': 'sec_adv_usage',
  'contest_atcoder': 'sec_adv_contest',
  'contest_codeforces': 'sec_adv_contest',
  'draw_io': 'sec_adv_til',
  'excalidraw': 'sec_adv_til',
  'pythontutor': 'sec_adv_til',
  'vscode_ext': 'sec_adv_til',
}

// 기본 위치
const defaultPositions = {
  'node_intro': { x: 25, y: 25 },
  'node_boj_setup': { x: 63, y: 43 },
  'node_boj_usage': { x: 212, y: 43 },
  'node_koala_setup': { x: 35, y: 88 },
  'node_koala_usage': { x: 195, y: 88 },
  'node_solved_link': { x: 19, y: 49 },
  'node_solved_usage': { x: 107, y: 89 },
  'node_tools_intro': { x: 170, y: 43 },
  'tool_vscode': { x: 25, y: 42 },
  'tool_pycharm': { x: 25, y: 89 },
  'tool_replit': { x: 30, y: 42 },
  'tool_onlinegdb': { x: 21, y: 89 },
  'tool_ideone': { x: 30, y: 45 },
  'tool_tio': { x: 30, y: 87 },
  'tool_colab': { x: 19, y: 46 },
  'tool_marimo': { x: 35, y: 89 },
  'node_til': { x: 20, y: 40 },
  'node_join': { x: 145, y: 40 },
  'node_study': { x: 285, y: 40 },
  'node_arena': { x: 20, y: 38 },
  'node_arenajoin': { x: 160, y: 38 },
  'node_arenacoalla': { x: 300, y: 38 },
  'ext_bjcode': { x: 21, y: 46 },
  'ext_bojhub': { x: 128, y: 92 },
  'ext_bojext': { x: 107, y: 46 },
  'ext_testcase': { x: 21, y: 92 },
  'adv_boj': { x: 34, y: 41 },
  'adv_solved': { x: 20, y: 90 },
  'adv_koala': { x: 22, y: 140 },
  'contest_atcoder': { x: 25, y: 48 },
  'contest_codeforces': { x: 24, y: 92 },
  'draw_io': { x: 21, y: 45 },
  'excalidraw': { x: 22, y: 94 },
  'pythontutor': { x: 151, y: 95 },
  'vscode_ext': { x: 111, y: 45 },
}

// 기본 엣지
const defaultEdges = [
  { id: 'edge-2', source: 'node_boj_setup', target: 'node_boj_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-3', source: 'node_koala_setup', target: 'node_koala_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-11', source: 'node_til', target: 'node_join', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-12', source: 'node_join', target: 'node_study', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-13', source: 'node_arena', target: 'node_arenajoin', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-14', source: 'node_arenajoin', target: 'node_arenacoalla', sourceHandle: 'right-src', targetHandle: 'left' },
]

// 화살표 스타일
const markerEnd = {
  type: 'arrowclosed',
  color: '#E65100',
  width: 12,
  height: 12,
}

// ========================================
// 노드/엣지 생성 함수
// ========================================
function buildFlowData(initialNodes, nodePositions, groupData, savedEdges) {
  const flowNodes = []
  const flowEdges = []
  
  const groups = groupData || defaultGroups
  const nodes = initialNodes || []
  const positions = { ...defaultPositions, ...(nodePositions || {}) }
  const edgesToUse = savedEdges || defaultEdges

  // 1. 그룹 노드 생성
  const groupEntries = Object.entries(groups || {})
  groupEntries.sort((a, b) => ((a[1]?.depth) || 0) - ((b[1]?.depth) || 0))
  
  groupEntries.forEach(([id, group]) => {
    if (!group) return
    const depth = group.depth || 0
    const node = {
      id,
      type: 'group',
      position: group.position || { x: 0, y: 0 },
      style: {
        width: group.size?.width || 200,
        height: group.size?.height || 100,
        zIndex: -10 + depth * 5,
      },
      data: {
        label: group.label || '',
        section: group.section || '기본',
        isSubgroup: group.isSubgroup || false,
        depth: depth,
      },
      draggable: false, // 읽기 전용
      selectable: false, // 선택 불가
    }
    
    if (group.parentId) {
      node.parentId = group.parentId
      node.extent = 'parent'
    }
    
    flowNodes.push(node)
  })

  // 2. 일반 노드 생성
  nodes.forEach((node, index) => {
    if (!node) return
    const pos = positions[node.id] || { 
      x: 20 + (index % 4) * 120, 
      y: 40 
    }
    
    const flowNode = {
      id: node.id,
      type: 'custom',
      position: pos,
      zIndex: 100,
      data: {
        label: node.name || '',
        link: node.link || '',
        section: node.section || '기본',
        group: node.group || '',
      },
      draggable: false, // 읽기 전용
      selectable: true, // 클릭 감지용
    }
    
    const parentGroupId = nodeParentMapping[node.id]
    if (parentGroupId && groups[parentGroupId]) {
      flowNode.parentId = parentGroupId
      flowNode.extent = 'parent'
    }
    
    flowNodes.push(flowNode)
  })

  // 3. 엣지 생성
  const allNodeIds = flowNodes.map(n => n.id)
  
  ;(edgesToUse || []).forEach((edge, index) => {
    if (!edge) return
    const sourceExists = allNodeIds.includes(edge.source)
    const targetExists = allNodeIds.includes(edge.target)
    
    if (sourceExists && targetExists) {
      flowEdges.push({
        id: edge.id || `edge-${index}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || 'bottom-src',
        targetHandle: edge.targetHandle || 'top',
        type: 'custom',
        style: { stroke: '#E65100', strokeWidth: 2 },
        markerEnd,
        selectable: false, // 선택 불가
        data: {
          controlPoint: edge.controlPoint || null,
        },
      })
    }
  })

  return { flowNodes, flowEdges }
}

// ========================================
// 메인 컴포넌트 (읽기 전용)
// ========================================
export default function ReadOnlyFlow({ initialNodes, savedPositions, savedEdges }) {
  const { nodePositions, groupData } = useMemo(() => {
    const nodePos = savedPositions?.nodes || savedPositions?.positions || {}
    const groupPos = savedPositions?.groups || null
    
    let mergedGroups = { ...defaultGroups }
    if (groupPos) {
      Object.keys(groupPos || {}).forEach(key => {
        if (mergedGroups[key]) {
          mergedGroups[key] = { ...mergedGroups[key], ...groupPos[key] }
        }
      })
    }
    
    return { nodePositions: nodePos, groupData: mergedGroups }
  }, [savedPositions])

  const [nodes, setNodes] = useNodesState([])
  const [edges, setEdges] = useEdgesState([])

  useEffect(() => {
    const { flowNodes, flowEdges } = buildFlowData(initialNodes, nodePositions, groupData, savedEdges)
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [initialNodes, nodePositions, groupData, savedEdges, setNodes, setEdges])

  // 노드 클릭 → 링크 열기
  const onNodeClick = useCallback((event, node) => {
    if (node.type === 'group') return
    if (node.data.link) {
      window.open(node.data.link, '_blank')
    }
  }, [])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        nodeOrigin={[0, 0]}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
      >
        <Background color="#ddd" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'group') {
              return node.data?.section === '고급' ? '#D1C4E9' : '#B2DFDB'
            }
            return node.data?.section === '고급' ? '#EDE7F6' : '#E0F2F1'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
          pannable={false}
          zoomable={false}
        />
        
        <Panel position="bottom-left" className="bg-white/90 p-3 rounded-lg shadow text-xs">
          <div className="font-bold mb-1">사용법</div>
          <div>• 노드 클릭: 링크 열기</div>
          <div>• 마우스 드래그: 화면 이동</div>
          <div>• 스크롤: 확대/축소</div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
