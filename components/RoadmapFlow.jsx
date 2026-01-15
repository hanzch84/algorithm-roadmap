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
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import CustomNode from './CustomNode'
import GroupNode from './GroupNode'

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
}

// 그룹 정의 - depth로 레이어 구분 (0이 가장 아래)
const groupDefinitions = [
  // 최상위 섹션 (depth: 0, 가장 아래)
  { id: 'sec_basic', label: '📘 기본 과정', section: '기본', depth: 0, x: 20, y: 50, width: 920, height: 550 },
  { id: 'sec_adv', label: '🚀 고급 과정', section: '고급', depth: 0, x: 20, y: 620, width: 920, height: 260 },
  
  // 기본 과정 서브그룹 (depth: 1)
  { id: 'sec_platform', label: '플랫폼 가입', section: '기본', parent: 'sec_basic', depth: 1, x: 20, y: 50, width: 450, height: 100 },
  { id: 'sec_solved', label: 'solved.ac', section: '기본', parent: 'sec_basic', depth: 1, x: 490, y: 50, width: 240, height: 100 },
  { id: 'sec_tools', label: '🔧 코딩 도구', section: '기본', parent: 'sec_basic', depth: 1, x: 20, y: 170, width: 880, height: 180 },
  { id: 'sec_record', label: '스터디 기록/공유/발표', section: '기본', parent: 'sec_basic', depth: 1, x: 20, y: 370, width: 430, height: 90 },
  { id: 'sec_arena', label: '대회 참가', section: '기본', parent: 'sec_basic', depth: 1, x: 470, y: 370, width: 430, height: 90 },
  
  // 코딩 도구 하위 그룹 (depth: 2)
  { id: 'sec_tools_ide', label: 'IDE', section: '기본', parent: 'sec_tools', depth: 2, x: 20, y: 50, width: 190, height: 100 },
  { id: 'sec_tools_online_ide', label: '온라인 IDE', section: '기본', parent: 'sec_tools', depth: 2, x: 230, y: 50, width: 190, height: 100 },
  { id: 'sec_tools_runner', label: '온라인 러너', section: '기본', parent: 'sec_tools', depth: 2, x: 440, y: 50, width: 190, height: 100 },
  { id: 'sec_tools_notebook', label: '노트북', section: '기본', parent: 'sec_tools', depth: 2, x: 650, y: 50, width: 190, height: 100 },
  
  // 고급 과정 서브그룹 (depth: 1)
  { id: 'sec_adv_ext', label: '🧩 크롬 확장 프로그램', section: '고급', parent: 'sec_adv', depth: 1, x: 20, y: 40, width: 440, height: 90 },
  { id: 'sec_adv_usage', label: '⚡ 고급 활용법', section: '고급', parent: 'sec_adv', depth: 1, x: 480, y: 40, width: 420, height: 90 },
  { id: 'sec_adv_contest', label: '🌍 온라인 콘테스트', section: '고급', parent: 'sec_adv', depth: 1, x: 20, y: 150, width: 210, height: 90 },
  { id: 'sec_adv_til', label: '✍️ TIL 고급 작성법', section: '고급', parent: 'sec_adv', depth: 1, x: 250, y: 150, width: 460, height: 90 },
]

// 노드-그룹 매핑
const nodeGroupMapping = {
  'node_boj_setup': { parent: 'sec_platform', x: 15, y: 40 },
  'node_boj_usage': { parent: 'sec_platform', x: 125, y: 40 },
  'node_koala_setup': { parent: 'sec_platform', x: 235, y: 40 },
  'node_koala_usage': { parent: 'sec_platform', x: 345, y: 40 },
  'node_solved_link': { parent: 'sec_solved', x: 15, y: 40 },
  'node_solved_usage': { parent: 'sec_solved', x: 125, y: 40 },
  'node_tools_intro': { parent: 'sec_tools', x: 400, y: 10 },
  'tool_vscode': { parent: 'sec_tools_ide', x: 15, y: 40 },
  'tool_pycharm': { parent: 'sec_tools_ide', x: 100, y: 40 },
  'tool_replit': { parent: 'sec_tools_online_ide', x: 15, y: 40 },
  'tool_onlinegdb': { parent: 'sec_tools_online_ide', x: 100, y: 40 },
  'tool_ideone': { parent: 'sec_tools_runner', x: 15, y: 40 },
  'tool_tio': { parent: 'sec_tools_runner', x: 100, y: 40 },
  'tool_colab': { parent: 'sec_tools_notebook', x: 15, y: 40 },
  'tool_marimo': { parent: 'sec_tools_notebook', x: 100, y: 40 },
  'node_til': { parent: 'sec_record', x: 15, y: 35 },
  'node_join': { parent: 'sec_record', x: 155, y: 35 },
  'node_study': { parent: 'sec_record', x: 295, y: 35 },
  'node_arena': { parent: 'sec_arena', x: 15, y: 35 },
  'node_arenajoin': { parent: 'sec_arena', x: 155, y: 35 },
  'node_arenacoalla': { parent: 'sec_arena', x: 295, y: 35 },
  'ext_bjcode': { parent: 'sec_adv_ext', x: 15, y: 35 },
  'ext_bojhub': { parent: 'sec_adv_ext', x: 120, y: 35 },
  'ext_bojext': { parent: 'sec_adv_ext', x: 225, y: 35 },
  'ext_testcase': { parent: 'sec_adv_ext', x: 330, y: 35 },
  'adv_boj': { parent: 'sec_adv_usage', x: 15, y: 35 },
  'adv_solved': { parent: 'sec_adv_usage', x: 150, y: 35 },
  'adv_koala': { parent: 'sec_adv_usage', x: 285, y: 35 },
  'contest_atcoder': { parent: 'sec_adv_contest', x: 15, y: 35 },
  'contest_codeforces': { parent: 'sec_adv_contest', x: 110, y: 35 },
  'draw_io': { parent: 'sec_adv_til', x: 15, y: 35 },
  'excalidraw': { parent: 'sec_adv_til', x: 110, y: 35 },
  'pythontutor': { parent: 'sec_adv_til', x: 240, y: 35 },
  'vscode_ext': { parent: 'sec_adv_til', x: 350, y: 35 },
}

const specialNodes = {
  'node_intro': { parent: 'sec_basic', x: 400, y: 10, section: '기본' },
}

// 기본 엣지 정의
const defaultEdgeDefinitions = [
  { id: 'e1', source: 'node_intro', target: 'node_boj_setup', sh: 'bottom-src', th: 'top' },
  { id: 'e2', source: 'node_intro', target: 'node_koala_setup', sh: 'bottom-src', th: 'top' },
  { id: 'e3', source: 'node_boj_setup', target: 'node_boj_usage', sh: 'right-src', th: 'left' },
  { id: 'e4', source: 'node_koala_setup', target: 'node_koala_usage', sh: 'right-src', th: 'left' },
  { id: 'e5', source: 'node_boj_usage', target: 'node_solved_link', sh: 'right-src', th: 'left' },
  { id: 'e6', source: 'node_solved_link', target: 'node_solved_usage', sh: 'right-src', th: 'left' },
  { id: 'e7', source: 'node_solved_usage', target: 'node_tools_intro', sh: 'bottom-src', th: 'top' },
  { id: 'e8', source: 'node_tools_intro', target: 'tool_vscode', sh: 'bottom-src', th: 'top' },
  { id: 'e9', source: 'node_tools_intro', target: 'tool_replit', sh: 'bottom-src', th: 'top' },
  { id: 'e10', source: 'node_tools_intro', target: 'tool_ideone', sh: 'bottom-src', th: 'top' },
  { id: 'e11', source: 'node_tools_intro', target: 'tool_colab', sh: 'bottom-src', th: 'top' },
  { id: 'e12', source: 'node_til', target: 'node_join', sh: 'right-src', th: 'left' },
  { id: 'e13', source: 'node_join', target: 'node_study', sh: 'right-src', th: 'left' },
  { id: 'e14', source: 'node_arena', target: 'node_arenajoin', sh: 'right-src', th: 'left' },
  { id: 'e15', source: 'node_arenajoin', target: 'node_arenacoalla', sh: 'right-src', th: 'left' },
  { id: 'e16', source: 'sec_tools', target: 'sec_record', sh: 'bottom-src', th: 'top', isGroupEdge: true },
  { id: 'e17', source: 'sec_record', target: 'sec_arena', sh: 'right-src', th: 'left', isGroupEdge: true },
  { id: 'e18', source: 'sec_basic', target: 'sec_adv', sh: 'bottom-src', th: 'top', isGroupEdge: true },
]

export default function RoadmapFlow({ initialNodes, savedPositions }) {
  const [selectedEdges, setSelectedEdges] = useState([])

  // 노드/엣지 생성
  const { flowNodes, flowEdges } = useMemo(() => {
    const flowNodes = []
    const flowEdges = []

    // 저장된 엣지가 있으면 사용, 없으면 기본값
    const edgesToUse = savedPositions?.edges || defaultEdgeDefinitions

    // 1. 그룹 노드 (depth가 낮을수록 zIndex 낮음 = 아래에 표시)
    groupDefinitions.forEach((group) => {
      const saved = savedPositions?.groups?.[group.id]
      flowNodes.push({
        id: group.id,
        type: 'group',
        position: saved ? { x: saved.x, y: saved.y } : { x: group.x, y: group.y },
        data: {
          label: group.label,
          section: group.section,
          isSubgroup: group.depth > 0,
          depth: group.depth,
        },
        style: {
          width: saved?.width || group.width,
          height: saved?.height || group.height,
        },
        parentId: group.parent,
        extent: group.parent ? 'parent' : undefined,
        draggable: true,
        selectable: true,
        // depth 0 = zIndex -10, depth 1 = zIndex -5, depth 2 = zIndex 0
        zIndex: -10 + (group.depth * 5),
      })
    })

    // 2. 특수 노드
    Object.entries(specialNodes).forEach(([nodeId, config]) => {
      const nodeData = initialNodes.find(n => n.id === nodeId)
      if (nodeData) {
        const saved = savedPositions?.nodes?.[nodeId]
        flowNodes.push({
          id: nodeId,
          type: 'custom',
          position: saved || { x: config.x, y: config.y },
          data: {
            label: nodeData.name,
            link: nodeData.link,
            section: config.section,
            group: 'intro',
          },
          parentId: config.parent,
          extent: 'parent',
          zIndex: 100,
        })
      }
    })

    // 3. 일반 노드
    initialNodes.forEach((node) => {
      if (specialNodes[node.id]) return
      const mapping = nodeGroupMapping[node.id]
      if (mapping) {
        const saved = savedPositions?.nodes?.[node.id]
        flowNodes.push({
          id: node.id,
          type: 'custom',
          position: saved || { x: mapping.x, y: mapping.y },
          data: {
            label: node.name,
            link: node.link,
            section: node.section,
            group: node.group,
          },
          parentId: mapping.parent,
          extent: 'parent',
          zIndex: 100,
        })
      }
    })

    // 4. 엣지
    edgesToUse.forEach((edge) => {
      const sourceExists = flowNodes.some(n => n.id === edge.source)
      const targetExists = flowNodes.some(n => n.id === edge.target)
      
      if (sourceExists && targetExists) {
        flowEdges.push({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sh,
          targetHandle: edge.th,
          type: 'smoothstep',
          style: { 
            stroke: edge.isGroupEdge ? '#7E57C2' : '#E65100', 
            strokeWidth: edge.isGroupEdge ? 3 : 2,
            strokeDasharray: edge.isGroupEdge ? '8,4' : undefined,
          },
          data: { isGroupEdge: edge.isGroupEdge },
          zIndex: 50,
        })
      }
    })

    return { flowNodes, flowEdges }
  }, [initialNodes, savedPositions])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  // 노드 클릭
  const onNodeClick = useCallback((event, node) => {
    if (event.shiftKey) return
    if (node.type === 'group') return
    if (node.data.link) {
      window.open(node.data.link, '_blank')
    }
  }, [])

  // 엣지 선택
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdges([edge.id])
  }, [])

  // 선택된 엣지 삭제
  const deleteSelectedEdges = useCallback(() => {
    if (selectedEdges.length > 0) {
      setEdges((eds) => eds.filter((e) => !selectedEdges.includes(e.id)))
      setSelectedEdges([])
    }
  }, [selectedEdges, setEdges])

  // 키보드 이벤트 (Delete/Backspace)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedEdges.length > 0) {
        e.preventDefault()
        deleteSelectedEdges()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedEdges, deleteSelectedEdges])

  // 전체 상태 내보내기
  const exportFullState = useCallback(() => {
    const state = {
      nodes: {},
      groups: {},
      edges: [],
    }
    
    // 노드 위치
    nodes.forEach((node) => {
      if (node.type === 'custom') {
        state.nodes[node.id] = {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        }
      } else if (node.type === 'group') {
        state.groups[node.id] = {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
          width: node.measured?.width || node.style?.width,
          height: node.measured?.height || node.style?.height,
        }
      }
    })

    // 엣지 상태
    edges.forEach((edge) => {
      state.edges.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sh: edge.sourceHandle,
        th: edge.targetHandle,
        isGroupEdge: edge.data?.isGroupEdge || false,
      })
    })
    
    const dataStr = JSON.stringify(state, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'roadmap-state.json'
    a.click()
    
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.05 }}
      minZoom={0.2}
      maxZoom={2}
      defaultViewport={{ x: 0, y: 0, zoom: 0.55 }}
      nodesDraggable={true}
      elementsSelectable={true}
      selectNodesOnDrag={false}
      edgesUpdatable={true}
      edgesFocusable={true}
    >
      <Background color="#e0e0e0" gap={25} />
      <Controls />
      <MiniMap 
        nodeColor={(node) => {
          if (node.type === 'group') {
            return node.data?.section === '고급' ? '#D1C4E9' : '#B2DFDB'
          }
          return node.data?.section === '고급' ? '#EDE7F6' : '#E0F2F1'
        }}
        maskColor="rgba(0, 0, 0, 0.08)"
        style={{ border: '1px solid #ccc' }}
      />
      
      <Panel position="top-right" className="flex flex-col gap-2">
        <button
          onClick={exportFullState}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-colors"
        >
          📥 전체 상태 저장
        </button>
        {selectedEdges.length > 0 && (
          <button
            onClick={deleteSelectedEdges}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-colors"
          >
            🗑️ 선택 엣지 삭제
          </button>
        )}
      </Panel>

      <Panel position="bottom-left" className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
        💡 그룹 선택 후 모서리 드래그로 크기 조절 | 엣지 클릭 후 Delete로 삭제
      </Panel>
    </ReactFlow>
  )
}
