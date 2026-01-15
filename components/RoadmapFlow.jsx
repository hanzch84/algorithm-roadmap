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
// 서브그래프(그룹) 정의 - 부모-자식 관계 포함
// ========================================
const defaultGroups = {
  // 최상위 섹션 (depth: 0) - 부모 없음
  'sec_basic': {
    label: '📘 기본 과정',
    section: '기본',
    depth: 0,
    parentId: null,
    position: { x: 0, y: 0 },
    size: { width: 950, height: 650 },
  },
  'sec_adv': {
    label: '🚀 고급 과정',
    section: '고급',
    depth: 0,
    parentId: null,
    position: { x: 0, y: 670 },
    size: { width: 950, height: 250 },
  },
  
  // 기본 과정 하위 (depth: 1) - sec_basic의 자식
  'sec_platform': {
    label: '플랫폼 가입',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 20, y: 70 },  // 부모 기준 상대좌표
    size: { width: 400, height: 120 },
  },
  'sec_solved': {
    label: 'solved.ac',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 440, y: 70 },
    size: { width: 300, height: 120 },
  },
  'sec_tools': {
    label: '🔧 코딩 도구',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 20, y: 210 },
    size: { width: 900, height: 180 },
  },
  'sec_record': {
    label: '스터디 기록/공유/발표',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 20, y: 410 },
    size: { width: 700, height: 100 },
  },
  'sec_arena': {
    label: '대회 참가',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 20, y: 530 },
    size: { width: 700, height: 100 },
  },
  
  // 코딩 도구 하위 (depth: 2) - sec_tools의 자식
  'sec_tools_ide': {
    label: 'IDE',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 20, y: 70 },  // sec_tools 기준 상대좌표
    size: { width: 180, height: 90 },
  },
  'sec_tools_online_ide': {
    label: '온라인 IDE',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 220, y: 70 },
    size: { width: 180, height: 90 },
  },
  'sec_tools_runner': {
    label: '온라인 러너',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 420, y: 70 },
    size: { width: 180, height: 90 },
  },
  'sec_tools_notebook': {
    label: '노트북',
    section: '기본',
    depth: 2,
    isSubgroup: true,
    parentId: 'sec_tools',
    position: { x: 620, y: 70 },
    size: { width: 180, height: 90 },
  },
  
  // 고급 과정 하위 (depth: 1) - sec_adv의 자식
  'sec_adv_ext': {
    label: '🧩 크롬 확장 프로그램',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 20, y: 50 },
    size: { width: 450, height: 80 },
  },
  'sec_adv_usage': {
    label: '⚡ 고급 활용법',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 480, y: 50 },
    size: { width: 450, height: 80 },
  },
  'sec_adv_contest': {
    label: '🌍 온라인 콘테스트',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 20, y: 150 },
    size: { width: 250, height: 80 },
  },
  'sec_adv_til': {
    label: '✍️ TIL 고급 작성법',
    section: '고급',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_adv',
    position: { x: 280, y: 150 },
    size: { width: 450, height: 80 },
  },
}

// ========================================
// 노드-그룹 매핑 (어느 그룹에 속하는지)
// ========================================
const nodeParentMapping = {
  // sec_basic 직속
  'node_intro': 'sec_basic',
  'node_tools_intro': 'sec_tools',
  
  // sec_platform 소속
  'node_boj_setup': 'sec_platform',
  'node_boj_usage': 'sec_platform',
  'node_koala_setup': 'sec_platform',
  'node_koala_usage': 'sec_platform',
  
  // sec_solved 소속
  'node_solved_link': 'sec_solved',
  'node_solved_usage': 'sec_solved',
  
  // sec_tools_xxx 소속
  'tool_vscode': 'sec_tools_ide',
  'tool_pycharm': 'sec_tools_ide',
  'tool_replit': 'sec_tools_online_ide',
  'tool_onlinegdb': 'sec_tools_online_ide',
  'tool_ideone': 'sec_tools_runner',
  'tool_tio': 'sec_tools_runner',
  'tool_colab': 'sec_tools_notebook',
  'tool_marimo': 'sec_tools_notebook',
  
  // sec_record 소속
  'node_til': 'sec_record',
  'node_join': 'sec_record',
  'node_study': 'sec_record',
  
  // sec_arena 소속
  'node_arena': 'sec_arena',
  'node_arenajoin': 'sec_arena',
  'node_arenacoalla': 'sec_arena',
  
  // sec_adv_ext 소속
  'ext_bjcode': 'sec_adv_ext',
  'ext_bojhub': 'sec_adv_ext',
  'ext_bojext': 'sec_adv_ext',
  'ext_testcase': 'sec_adv_ext',
  
  // sec_adv_usage 소속
  'adv_boj': 'sec_adv_usage',
  'adv_solved': 'sec_adv_usage',
  'adv_koala': 'sec_adv_usage',
  
  // sec_adv_contest 소속
  'contest_atcoder': 'sec_adv_contest',
  'contest_codeforces': 'sec_adv_contest',
  
  // sec_adv_til 소속
  'draw_io': 'sec_adv_til',
  'excalidraw': 'sec_adv_til',
  'pythontutor': 'sec_adv_til',
  'vscode_ext': 'sec_adv_til',
}

// ========================================
// 노드 기본 위치 (부모 그룹 기준 상대좌표)
// ========================================
const defaultPositions = {
  'node_intro': { x: 400, y: 30 },
  
  // sec_platform 내부 (상대좌표)
  'node_boj_setup': { x: 20, y: 40 },
  'node_boj_usage': { x: 200, y: 40 },
  'node_koala_setup': { x: 20, y: 80 },
  'node_koala_usage': { x: 200, y: 80 },
  
  // sec_solved 내부
  'node_solved_link': { x: 20, y: 50 },
  'node_solved_usage': { x: 160, y: 50 },
  
  // sec_tools 직속
  'node_tools_intro': { x: 380, y: 30 },
  
  // sec_tools_ide 내부
  'tool_vscode': { x: 20, y: 40 },
  'tool_pycharm': { x: 100, y: 40 },
  
  // sec_tools_online_ide 내부
  'tool_replit': { x: 20, y: 40 },
  'tool_onlinegdb': { x: 100, y: 40 },
  
  // sec_tools_runner 내부
  'tool_ideone': { x: 20, y: 40 },
  'tool_tio': { x: 100, y: 40 },
  
  // sec_tools_notebook 내부
  'tool_colab': { x: 20, y: 40 },
  'tool_marimo': { x: 100, y: 40 },
  
  // sec_record 내부
  'node_til': { x: 20, y: 40 },
  'node_join': { x: 250, y: 40 },
  'node_study': { x: 480, y: 40 },
  
  // sec_arena 내부
  'node_arena': { x: 20, y: 40 },
  'node_arenajoin': { x: 250, y: 40 },
  'node_arenacoalla': { x: 480, y: 40 },
  
  // sec_adv_ext 내부
  'ext_bjcode': { x: 20, y: 35 },
  'ext_bojhub': { x: 130, y: 35 },
  'ext_bojext': { x: 240, y: 35 },
  'ext_testcase': { x: 350, y: 35 },
  
  // sec_adv_usage 내부
  'adv_boj': { x: 20, y: 35 },
  'adv_solved': { x: 160, y: 35 },
  'adv_koala': { x: 300, y: 35 },
  
  // sec_adv_contest 내부
  'contest_atcoder': { x: 20, y: 35 },
  'contest_codeforces': { x: 130, y: 35 },
  
  // sec_adv_til 내부
  'draw_io': { x: 20, y: 35 },
  'excalidraw': { x: 130, y: 35 },
  'pythontutor': { x: 260, y: 35 },
  'vscode_ext': { x: 360, y: 35 },
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
function buildFlowData(initialNodes, nodePositions, groupData, savedEdges) {
  const flowNodes = []
  const flowEdges = []
  
  const groups = groupData || defaultGroups

  // 1. 그룹 노드 생성 (depth 순으로 정렬 - 부모가 먼저 생성되어야 함)
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
    
    // 부모가 있으면 설정
    if (group.parentId) {
      node.parentId = group.parentId
      node.extent = 'parent'  // 부모 밖으로 못 나감
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
    
    // 노드가 속한 그룹 설정
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
  const { nodePositions, groupData } = useMemo(() => {
    const nodePos = savedPositions?.nodes || savedPositions?.positions || {}
    const groupPos = savedPositions?.groups || null
    
    // 저장된 그룹 데이터가 있으면 기본값과 병합
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

  // 초기 데이터 생성
  const { flowNodes, flowEdges } = useMemo(() => {
    return buildFlowData(initialNodes, nodePositions, groupData, savedEdges)
  }, [initialNodes, nodePositions, groupData, savedEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  // 데이터 변경 시 업데이트
  useEffect(() => {
    const { flowNodes, flowEdges } = buildFlowData(initialNodes, nodePositions, groupData, savedEdges)
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [initialNodes, nodePositions, groupData, savedEdges, setNodes, setEdges])

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
            width: Math.round(node.style?.width || node.width || 200),
            height: Math.round(node.style?.height || node.height || 100),
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
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
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
