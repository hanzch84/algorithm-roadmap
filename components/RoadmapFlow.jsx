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
  reconnectEdge,
  addEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import CustomNode from './CustomNode'
import GroupNode from './GroupNode'

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
}

// ========================================
// 서브그래프(그룹) 정의 - JSON 반영
// ========================================
const defaultGroups = {
  'sec_basic': {
    label: '📘 기본 과정',
    section: '기본',
    depth: 0,
    parentId: null,
    position: { x: -361, y: -29 },
    size: { width: 950, height: 650 },
  },
  'sec_adv': {
    label: '🚀 고급 과정',
    section: '고급',
    depth: 0,
    parentId: null,
    position: { x: 393, y: -25 },  // 변경
    size: { width: 950, height: 250 },
  },
  'sec_platform': {
    label: '플랫폼 가입',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 22, y: 83 },
    size: { width: 400, height: 120 },
  },
  'sec_solved': {
    label: 'solved.ac',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 394, y: 96 },  // 변경
    size: { width: 300, height: 120 },
  },
  'sec_tools': {
    label: '🔧 코딩 도구',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 23, y: 244 },  // 변경
    size: { width: 900, height: 180 },
  },
  'sec_record': {
    label: '스터디 기록/공유/발표',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 117, y: 520 },  // 변경
    size: { width: 700, height: 100 },
  },
  'sec_arena': {
    label: '대회 참가',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 119, y: 640 },  // 변경
    size: { width: 700, height: 100 },
  },
  'sec_tools_ide': {
    label: 'IDE',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 22, y: 99 },
    size: { width: 180, height: 90 },
  },
  'sec_tools_online_ide': {
    label: '온라인 IDE',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 171, y: 100 },
    size: { width: 180, height: 90 },
  },
  'sec_tools_runner': {
    label: '온라인 러너',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 323, y: 101 },
    size: { width: 180, height: 90 },
  },
  'sec_tools_notebook': {
    label: '노트북',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 474, y: 102 },
    size: { width: 180, height: 90 },
  },
  'sec_adv_ext': {
    label: '🧩 크롬 확장 프로그램',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 94, y: 232 },  // 변경
    size: { width: 450, height: 80 },
  },
  'sec_adv_usage': {
    label: '⚡ 고급 활용법',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 93, y: 49 },
    size: { width: 450, height: 80 },
  },
  'sec_adv_contest': {
    label: '🌍 온라인 콘테스트',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 114, y: 605 },  // 변경
    size: { width: 250, height: 80 },
  },
  'sec_adv_til': {
    label: '✍️ TIL 고급 작성법',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 40, y: 452 },  // 변경
    size: { width: 450, height: 80 },
  },
}

// ========================================
// 노드-그룹 매핑
// ========================================
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

// ========================================
// 노드 기본 위치 - JSON 반영
// ========================================
const defaultPositions = {
  'node_intro': { x: 25, y: 25 },  // 변경
  'node_boj_setup': { x: 63, y: 43 },  // 변경
  'node_boj_usage': { x: 212, y: 43 },  // 변경
  'node_koala_setup': { x: 35, y: 88 },  // 변경
  'node_koala_usage': { x: 195, y: 88 },  // 변경
  'node_solved_link': { x: 19, y: 36 },  // 변경
  'node_solved_usage': { x: 107, y: 76 },  // 변경
  'node_tools_intro': { x: 170, y: 43 },  // 변경
  'tool_vscode': { x: 20, y: 37 },
  'tool_pycharm': { x: 20, y: 79 },
  'tool_replit': { x: 20, y: 37 },
  'tool_onlinegdb': { x: 21, y: 79 },
  'tool_ideone': { x: 20, y: 40 },
  'tool_tio': { x: 20, y: 82 },
  'tool_colab': { x: 19, y: 36 },
  'tool_marimo': { x: 20, y: 79 },
  'node_til': { x: 20, y: 40 },
  'node_join': { x: 145, y: 40 },  // 변경
  'node_study': { x: 275, y: 40 },  // 변경
  'node_arena': { x: 20, y: 38 },  // 변경
  'node_arenajoin': { x: 160, y: 38 },  // 변경
  'node_arenacoalla': { x: 300, y: 38 },  // 변경
  'ext_bjcode': { x: 35, y: 40 },
  'ext_bojhub': { x: 35, y: 156 },  // 변경
  'ext_bojext': { x: 32, y: 79 },  // 변경
  'ext_testcase': { x: 35, y: 117 },  // 변경
  'adv_boj': { x: 34, y: 36 },
  'adv_solved': { x: 20, y: 75 },  // 변경
  'adv_koala': { x: 22, y: 115 },  // 변경
  'contest_atcoder': { x: 25, y: 38 },
  'contest_codeforces': { x: 24, y: 77 },  // 변경
  'draw_io': { x: 21, y: 40 },
  'excalidraw': { x: 22, y: 79 },  // 변경
  'pythontutor': { x: 136, y: 80 },  // 변경
  'vscode_ext': { x: 131, y: 40 },
}

// ========================================
// 기본 엣지 정의 - JSON 반영
// ========================================
const defaultEdges = [
  { id: 'edge-2', source: 'node_boj_setup', target: 'node_boj_usage', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-3', source: 'node_koala_setup', target: 'node_koala_usage', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-11', source: 'node_til', target: 'node_join', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-12', source: 'node_join', target: 'node_study', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-13', source: 'node_arena', target: 'node_arenajoin', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-14', source: 'node_arenajoin', target: 'node_arenacoalla', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-1768455001460', source: 'node_boj_usage', target: 'node_solved_link', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-1768457260453', source: 'node_intro', target: 'node_boj_setup', sourceHandle: 'bottom-src', targetHandle: 'top', type: 'default' },
  { id: 'edge-1768457272681', source: 'node_intro', target: 'node_koala_setup', sourceHandle: 'bottom-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-1768457708909', source: 'sec_platform', target: 'sec_tools', sourceHandle: 'right-src', targetHandle: 'top', type: 'default' },
  { id: 'edge-1768457839803', source: 'node_tools_intro', target: 'sec_tools_ide', sourceHandle: 'left-src', targetHandle: 'top', type: 'default' },
  { id: 'edge-1768457846287', source: 'node_tools_intro', target: 'sec_tools_notebook', sourceHandle: 'right-src', targetHandle: 'top', type: 'default' },
  { id: 'edge-1768457863495', source: 'node_tools_intro', target: 'sec_tools_online_ide', sourceHandle: 'bottom-src', targetHandle: 'top', type: 'default' },
  { id: 'edge-1768457879417', source: 'node_tools_intro', target: 'sec_tools_runner', sourceHandle: 'right-src', targetHandle: 'top', type: 'default' },
  { id: 'edge-1768457941643', source: 'sec_tools', target: 'sec_record', sourceHandle: 'bottom-src', targetHandle: 'top', type: 'default' },
  { id: 'edge-1768457963564', source: 'sec_record', target: 'sec_arena', sourceHandle: 'bottom-src', targetHandle: 'top', type: 'default' },
  { id: 'edge-1768458027580', source: 'node_solved_link', target: 'node_solved_usage', sourceHandle: 'bottom-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-1768458251117', source: 'sec_record', target: 'sec_adv_til', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-1768458255698', source: 'sec_arena', target: 'sec_adv_contest', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-1768458320929', source: 'sec_basic', target: 'sec_adv', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-1768458348466', source: 'sec_solved', target: 'sec_adv_usage', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
  { id: 'edge-1768458351295', source: 'sec_solved', target: 'sec_adv_ext', sourceHandle: 'right-src', targetHandle: 'left', type: 'default' },
]

// ========================================
// 화살표 스타일
// ========================================
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

  // 1. 그룹 노드 생성
  const groupEntries = Object.entries(groups)
  groupEntries.sort((a, b) => (a[1].depth || 0) - (b[1].depth || 0))
  
  groupEntries.forEach(([id, group]) => {
    const depth = group.depth || 0
    const node = {
      id,
      type: 'group',
      position: group.position,
      style: {
        width: group.size?.width || 200,
        height: group.size?.height || 100,
        zIndex: -10 + depth * 5,
      },
      data: {
        label: group.label,
        section: group.section,
        isSubgroup: group.isSubgroup,
        depth: depth,
      },
    }
    
    if (group.parentId) {
      node.parentId = group.parentId
      node.extent = 'parent'
    }
    
    flowNodes.push(node)
  })

  // 2. 일반 노드 생성
  const positions = { ...defaultPositions, ...nodePositions }
  
  initialNodes.forEach((node, index) => {
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
        label: node.name,
        link: node.link,
        section: node.section,
        group: node.group,
      },
    }
    
    const parentGroupId = nodeParentMapping[node.id]
    if (parentGroupId && groups[parentGroupId]) {
      flowNode.parentId = parentGroupId
      flowNode.extent = 'parent'
    }
    
    flowNodes.push(flowNode)
  })

  // 3. 엣지 생성
  const edgesToUse = savedEdges || defaultEdges
  const allNodeIds = flowNodes.map(n => n.id)
  
  edgesToUse.forEach((edge, index) => {
    const sourceExists = allNodeIds.includes(edge.source)
    const targetExists = allNodeIds.includes(edge.target)
    
    if (sourceExists && targetExists) {
      const sourceParent = nodeParentMapping[edge.source] || groups[edge.source]?.parentId
      const targetParent = nodeParentMapping[edge.target] || groups[edge.target]?.parentId
      
      // 저장된 type 우선, 없으면 자동 판단
      const edgeType = 'default'
      
      flowEdges.push({
        id: edge.id || `edge-${index}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || 'bottom-src',
        targetHandle: edge.targetHandle || 'top',
        type: edgeType,
        style: { stroke: '#E65100', strokeWidth: 2 },
        markerEnd,
        reconnectable: true,
      })
    }
  })

  return { flowNodes, flowEdges }
}

// ========================================
// 메인 컴포넌트
// ========================================
export default function RoadmapFlow({ initialNodes, savedPositions, savedEdges }) {
  const [selectedEdge, setSelectedEdge] = useState(null)

  const { nodePositions, groupData } = useMemo(() => {
    const nodePos = savedPositions?.nodes || savedPositions?.positions || {}
    const groupPos = savedPositions?.groups || null
    
    let mergedGroups = { ...defaultGroups }
    if (groupPos) {
      Object.keys(groupPos).forEach(key => {
        if (mergedGroups[key]) {
          mergedGroups[key] = { ...mergedGroups[key], ...groupPos[key] }
        }
      })
    }
    
    return { nodePositions: nodePos, groupData: mergedGroups }
  }, [savedPositions])

  const { flowNodes, flowEdges } = useMemo(() => {
    return buildFlowData(initialNodes, nodePositions, groupData, savedEdges)
  }, [initialNodes, nodePositions, groupData, savedEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  useEffect(() => {
    const { flowNodes, flowEdges } = buildFlowData(initialNodes, nodePositions, groupData, savedEdges)
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [initialNodes, nodePositions, groupData, savedEdges, setNodes, setEdges])

  const onNodeClick = useCallback((event, node) => {
    if (event.shiftKey) return
    if (node.type === 'group') return
    if (node.data.link) {
      window.open(node.data.link, '_blank')
    }
  }, [])

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge.id)
  }, [])

const onConnect = useCallback((connection) => {
  const newEdge = {
    ...connection,
    id: `edge-${Date.now()}`,
    type: 'default',
    style: { stroke: '#E65100', strokeWidth: 2 },
    markerEnd,
    reconnectable: true,
  }
  setEdges((eds) => addEdge(newEdge, eds))
}, [setEdges])

  const onReconnect = useCallback((oldEdge, newConnection) => {
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
  }, [setEdges])

  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge))
      setSelectedEdge(null)
    }
  }, [selectedEdge, setEdges])

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete' && selectedEdge) {
      deleteSelectedEdge()
    }
  }, [selectedEdge, deleteSelectedEdge])

const exportFullState = useCallback(() => {
  const nodeData = {}
  const groupDataExport = {}
  
  nodes.forEach((node) => {
    if (node.type === 'custom') {
      nodeData[node.id] = {
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      }
    } else if (node.type === 'group') {
      groupDataExport[node.id] = {
        ...defaultGroups[node.id],
        position: {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        },
        size: {
          width: Math.round(node.measured?.width || node.width || node.style?.width || 200),
          height: Math.round(node.measured?.height || node.height || node.style?.height || 100),
        },
      }
    }
  })
  
  const edgeData = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    type: e.type,
  }))
  
  const fullState = {
    positions: nodeData,
    groups: groupDataExport,
    edges: edgeData,
  }
  
  const dataStr = JSON.stringify(fullState, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'roadmap-state.json'
  a.click()
  URL.revokeObjectURL(url)
}, [nodes, edges])

  const styledEdges = edges.map((e) => ({
    ...e,
    style: {
      ...e.style,
      stroke: e.id === selectedEdge ? '#ef4444' : '#E65100',
      strokeWidth: e.id === selectedEdge ? 3 : 2,
    },
    markerEnd: {
      ...markerEnd,
      color: e.id === selectedEdge ? '#ef4444' : '#E65100',
    },
  }))

  return (
    <div onKeyDown={onKeyDown} tabIndex={0} className="w-full h-full outline-none">
      <ReactFlow
        nodes={nodes}
        edges={styledEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        nodesDraggable={true}
        elementsSelectable={true}
        nodeOrigin={[0, 0]}

      >
        <Background color="#ddd" gap={20} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'group') {
              return node.data?.section === '고급' ? '#D1C4E9' : '#B2DFDB'
            }
            return node.data?.section === '고급' ? '#EDE7F6' : '#E0F2F1'
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
        
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={exportFullState}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium"
          >
            📥 전체 상태 저장
          </button>
          {selectedEdge && (
            <button
              onClick={deleteSelectedEdge}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium"
            >
              🗑️ 선택 엣지 삭제
            </button>
          )}
        </Panel>
        
        <Panel position="bottom-left" className="bg-white/90 p-3 rounded-lg shadow text-xs">
          <div className="font-bold mb-1">사용법</div>
          <div>• 노드 드래그: 위치 이동 (그룹 내 제한)</div>
          <div>• 그룹 드래그: 하위 요소 함께 이동</div>
          <div>• 그룹 선택 → 모서리 드래그: 크기 조절</div>
          <div>• 핸들 드래그 → 다른 노드: 새 엣지</div>
          <div>• 엣지 끝점 드래그: 재연결</div>
          <div>• 엣지 클릭 → Delete: 삭제</div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
