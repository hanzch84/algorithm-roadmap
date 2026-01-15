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
// 서브그래프(그룹) 정의
// ========================================
const defaultGroups = {
  // 최상위 섹션 (depth: 0)
  'sec_basic': {
    label: '📘 기본 과정',
    section: '기본',
    depth: 0,
    position: { x: 0, y: 0 },
    size: { width: 950, height: 700 },
  },
  'sec_adv': {
    label: '🚀 고급 과정',
    section: '고급',
    depth: 0,
    position: { x: 0, y: 720 },
    size: { width: 950, height: 280 },
  },
  
  // 기본 과정 하위 (depth: 1)
  'sec_platform': {
    label: '플랫폼 가입',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    position: { x: 20, y: 80 },
    size: { width: 450, height: 100 },
  },
  'sec_solved': {
    label: 'solved.ac',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    position: { x: 480, y: 80 },
    size: { width: 300, height: 100 },
  },
  'sec_tools': {
    label: '🔧 코딩 도구',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    position: { x: 20, y: 200 },
    size: { width: 900, height: 200 },
  },
  'sec_record': {
    label: '스터디 기록/공유/발표',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    position: { x: 20, y: 420 },
    size: { width: 700, height: 80 },
  },
  'sec_arena': {
    label: '대회 참가',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    position: { x: 20, y: 520 },
    size: { width: 700, height: 80 },
  },
  
  // 코딩 도구 하위 (depth: 2)
  'sec_tools_ide': {
    label: 'IDE',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    position: { x: 40, y: 280 },
    size: { width: 180, height: 80 },
  },
  'sec_tools_online_ide': {
    label: '온라인 IDE',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    position: { x: 240, y: 280 },
    size: { width: 180, height: 80 },
  },
  'sec_tools_runner': {
    label: '온라인 러너',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    position: { x: 440, y: 280 },
    size: { width: 180, height: 80 },
  },
  'sec_tools_notebook': {
    label: '노트북',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    position: { x: 640, y: 280 },
    size: { width: 180, height: 80 },
  },
  
  // 고급 과정 하위 (depth: 1)
  'sec_adv_ext': {
    label: '🧩 크롬 확장 프로그램',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    position: { x: 20, y: 780 },
    size: { width: 450, height: 80 },
  },
  'sec_adv_usage': {
    label: '⚡ 고급 활용법',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    position: { x: 480, y: 780 },
    size: { width: 450, height: 80 },
  },
  'sec_adv_contest': {
    label: '🌍 온라인 콘테스트',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    position: { x: 20, y: 880 },
    size: { width: 250, height: 80 },
  },
  'sec_adv_til': {
    label: '✍️ TIL 고급 작성법',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    position: { x: 280, y: 880 },
    size: { width: 450, height: 80 },
  },
}

// ========================================
// 노드 기본 위치
// ========================================
const defaultPositions = {
  'node_intro': { x: 400, y: 40 },
  'node_boj_setup': { x: 40, y: 110 },
  'node_boj_usage': { x: 200, y: 110 },
  'node_koala_setup': { x: 40, y: 150 },
  'node_koala_usage': { x: 200, y: 150 },
  'node_solved_link': { x: 500, y: 110 },
  'node_solved_usage': { x: 660, y: 110 },
  'node_tools_intro': { x: 400, y: 220 },
  'tool_vscode': { x: 60, y: 300 },
  'tool_pycharm': { x: 140, y: 300 },
  'tool_replit': { x: 260, y: 300 },
  'tool_onlinegdb': { x: 340, y: 300 },
  'tool_ideone': { x: 460, y: 300 },
  'tool_tio': { x: 540, y: 300 },
  'tool_colab': { x: 660, y: 300 },
  'tool_marimo': { x: 740, y: 300 },
  'node_til': { x: 60, y: 440 },
  'node_join': { x: 280, y: 440 },
  'node_study': { x: 500, y: 440 },
  'node_arena': { x: 60, y: 540 },
  'node_arenajoin': { x: 280, y: 540 },
  'node_arenacoalla': { x: 500, y: 540 },
  'ext_bjcode': { x: 40, y: 800 },
  'ext_bojhub': { x: 140, y: 800 },
  'ext_bojext': { x: 240, y: 800 },
  'ext_testcase': { x: 340, y: 800 },
  'adv_boj': { x: 500, y: 800 },
  'adv_solved': { x: 620, y: 800 },
  'adv_koala': { x: 740, y: 800 },
  'contest_atcoder': { x: 40, y: 900 },
  'contest_codeforces': { x: 160, y: 900 },
  'draw_io': { x: 300, y: 900 },
  'excalidraw': { x: 400, y: 900 },
  'pythontutor': { x: 540, y: 900 },
  'vscode_ext': { x: 660, y: 900 },
}

// ========================================
// 기본 엣지 정의
// ========================================
const defaultEdges = [
  { source: 'node_intro', target: 'node_boj_setup', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_intro', target: 'node_koala_setup', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_boj_setup', target: 'node_boj_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_koala_setup', target: 'node_koala_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_boj_usage', target: 'node_solved_link', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_solved_link', target: 'node_solved_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_solved_usage', target: 'node_tools_intro', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_tools_intro', target: 'tool_vscode', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_tools_intro', target: 'tool_replit', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_tools_intro', target: 'tool_ideone', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_tools_intro', target: 'tool_colab', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_til', target: 'node_join', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_join', target: 'node_study', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_arena', target: 'node_arenajoin', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_arenajoin', target: 'node_arenacoalla', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'sec_basic', target: 'sec_adv', sourceHandle: 'bottom-src', targetHandle: 'top' },
]

// ========================================
// 노드/엣지 생성 함수
// ========================================
function buildFlowData(initialNodes, nodePositions, groupPositions, savedEdges) {
  const flowNodes = []
  const flowEdges = []

  // 1. 그룹 노드 생성 (depth 순으로 정렬 - 낮은 것이 아래 레이어)
  const groupEntries = Object.entries(groupPositions || defaultGroups)
  groupEntries.sort((a, b) => (a[1].depth || 0) - (b[1].depth || 0))
  
  groupEntries.forEach(([id, group]) => {
    const depth = group.depth || 0
    flowNodes.push({
      id,
      type: 'group',
      position: group.position,
      style: {
        width: group.size?.width || 200,
        height: group.size?.height || 100,
        zIndex: -10 + depth * 5,  // depth 0: -10, depth 1: -5, depth 2: 0
      },
      data: {
        label: group.label,
        section: group.section,
        isSubgroup: group.isSubgroup,
        depth: depth,
      },
    })
  })

  // 2. 일반 노드 생성 (그룹 위에 표시)
  const positions = { ...defaultPositions, ...nodePositions }
  
  initialNodes.forEach((node, index) => {
    const pos = positions[node.id] || { 
      x: 100 + (index % 5) * 180, 
      y: Math.floor(index / 5) * 100 
    }
    flowNodes.push({
      id: node.id,
      type: 'custom',
      position: pos,
      zIndex: 100,  // 노드는 항상 최상위
      data: {
        label: node.name,
        link: node.link,
        section: node.section,
        group: node.group,
      },
    })
  })

  // 3. 엣지 생성
  const edgesToUse = savedEdges || defaultEdges
  const allNodeIds = flowNodes.map(n => n.id)
  
  edgesToUse.forEach((edge, index) => {
    const sourceExists = allNodeIds.includes(edge.source)
    const targetExists = allNodeIds.includes(edge.target)
    
    if (sourceExists && targetExists) {
      flowEdges.push({
        id: edge.id || `edge-${index}`,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || 'bottom-src',
        targetHandle: edge.targetHandle || 'top',
        type: 'smoothstep',
        style: { stroke: '#E65100', strokeWidth: 3 },
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

  // 저장된 위치 파싱
  const { nodePositions, groupPositions } = useMemo(() => {
    const nodePos = savedPositions?.nodes || savedPositions?.positions || {}
    const groupPos = savedPositions?.groups || null
    return { 
      nodePositions: nodePos, 
      groupPositions: groupPos ? { ...defaultGroups, ...groupPos } : defaultGroups 
    }
  }, [savedPositions])

  // 초기 데이터 생성
  const { flowNodes, flowEdges } = useMemo(() => {
    return buildFlowData(initialNodes, nodePositions, groupPositions, savedEdges)
  }, [initialNodes, nodePositions, groupPositions, savedEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  // 데이터 변경 시 업데이트
  useEffect(() => {
    const { flowNodes, flowEdges } = buildFlowData(initialNodes, nodePositions, groupPositions, savedEdges)
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [initialNodes, nodePositions, groupPositions, savedEdges, setNodes, setEdges])

  // 노드 클릭 → 링크 열기 (그룹 제외)
  const onNodeClick = useCallback((event, node) => {
    if (event.shiftKey) return
    if (node.type === 'group') return
    if (node.data.link) {
      window.open(node.data.link, '_blank')
    }
  }, [])

  // 엣지 클릭 → 선택
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge.id)
  }, [])

  // 새 엣지 연결
  const onConnect = useCallback((connection) => {
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'smoothstep',
      style: { stroke: '#E65100', strokeWidth: 3 },
      reconnectable: true,
    }
    setEdges((eds) => addEdge(newEdge, eds))
  }, [setEdges])

  // 엣지 재연결
  const onReconnect = useCallback((oldEdge, newConnection) => {
    setEdges((els) => reconnectEdge(oldEdge, newConnection, els))
  }, [setEdges])

  // 선택된 엣지 삭제
  const deleteSelectedEdge = useCallback(() => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge))
      setSelectedEdge(null)
    }
  }, [selectedEdge, setEdges])

  // 키보드 Delete 처리
  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete' && selectedEdge) {
      deleteSelectedEdge()
    }
  }, [selectedEdge, deleteSelectedEdge])

  // 전체 상태 내보내기
  const exportFullState = useCallback(() => {
    const nodeData = {}
    const groupData = {}
    
    nodes.forEach((node) => {
      if (node.type === 'custom') {
        nodeData[node.id] = {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        }
      } else if (node.type === 'group') {
        groupData[node.id] = {
          ...defaultGroups[node.id],
          position: {
            x: Math.round(node.position.x),
            y: Math.round(node.position.y),
          },
          size: {
            width: Math.round(node.style?.width || 200),
            height: Math.round(node.style?.height || 100),
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
    }))
    
    const fullState = {
      positions: nodeData,
      groups: groupData,
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

  // 선택된 엣지 스타일 적용
  const styledEdges = edges.map((e) => ({
    ...e,
    style: {
      ...e.style,
      stroke: e.id === selectedEdge ? '#ef4444' : '#E65100',
      strokeWidth: e.id === selectedEdge ? 4 : 3,
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
        defaultViewport={{ x: 0, y: 0, zoom: 0.6 }}
        nodesDraggable={true}
        elementsSelectable={true}
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
          <div>• 노드 드래그: 위치 이동</div>
          <div>• 그룹 선택 → 모서리 드래그: 크기 조절</div>
          <div>• 핸들 드래그 → 다른 노드: 새 엣지 추가</div>
          <div>• 엣지 끝점 드래그: 재연결</div>
          <div>• 엣지 클릭 → Delete: 삭제</div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
