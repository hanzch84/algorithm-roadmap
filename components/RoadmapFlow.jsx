'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  reconnectEdge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import CustomNode from './CustomNode'

const nodeTypes = {
  custom: CustomNode,
}

// 기본 노드 위치
const defaultPositions = {
  'node_intro': { x: 450, y: 30 },
  'node_boj_setup': { x: 150, y: 120 },
  'node_boj_usage': { x: 350, y: 120 },
  'node_koala_setup': { x: 550, y: 120 },
  'node_koala_usage': { x: 750, y: 120 },
  'node_solved_link': { x: 350, y: 220 },
  'node_solved_usage': { x: 550, y: 220 },
  'node_tools_intro': { x: 450, y: 320 },
  'tool_vscode': { x: 80, y: 420 },
  'tool_pycharm': { x: 180, y: 420 },
  'tool_replit': { x: 300, y: 420 },
  'tool_onlinegdb': { x: 400, y: 420 },
  'tool_ideone': { x: 520, y: 420 },
  'tool_tio': { x: 620, y: 420 },
  'tool_colab': { x: 740, y: 420 },
  'tool_marimo': { x: 840, y: 420 },
  'node_til': { x: 250, y: 530 },
  'node_join': { x: 450, y: 530 },
  'node_study': { x: 650, y: 530 },
  'node_arena': { x: 250, y: 630 },
  'node_arenajoin': { x: 450, y: 630 },
  'node_arenacoalla': { x: 650, y: 630 },
  'ext_bjcode': { x: 80, y: 780 },
  'ext_bojhub': { x: 200, y: 780 },
  'ext_bojext': { x: 320, y: 780 },
  'ext_testcase': { x: 440, y: 780 },
  'adv_boj': { x: 580, y: 780 },
  'adv_solved': { x: 700, y: 780 },
  'adv_koala': { x: 820, y: 780 },
  'contest_atcoder': { x: 80, y: 880 },
  'contest_codeforces': { x: 220, y: 880 },
  'draw_io': { x: 400, y: 880 },
  'excalidraw': { x: 520, y: 880 },
  'pythontutor': { x: 680, y: 880 },
  'vscode_ext': { x: 820, y: 880 },
}

// 엣지 정의 (핸들 ID 포함)
const edgeDefinitions = [
  { source: 'node_intro', target: 'node_boj_setup', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_intro', target: 'node_koala_setup', sourceHandle: 'bottom-src', targetHandle: 'top' },
  { source: 'node_boj_setup', target: 'node_boj_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_koala_setup', target: 'node_koala_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { source: 'node_boj_usage', target: 'node_solved_link', sourceHandle: 'bottom-src', targetHandle: 'top' },
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
  { source: 'node_arenacoalla', target: 'ext_bjcode', sourceHandle: 'bottom-src', targetHandle: 'top' },
]

export default function RoadmapFlow({ initialNodes, savedPositions, savedEdges }) {
  const positions = useMemo(() => {
    return { ...defaultPositions, ...savedPositions }
  }, [savedPositions])

  // 노드/엣지 변환
  const { flowNodes, flowEdges } = useMemo(() => {
    const flowNodes = []
    const flowEdges = []

    initialNodes.forEach((node, index) => {
      const pos = positions[node.id] || { x: 100 + (index % 5) * 180, y: Math.floor(index / 5) * 100 }
      flowNodes.push({
        id: node.id,
        type: 'custom',
        position: pos,
        data: {
          label: node.name,
          link: node.link,
          section: node.section,
          group: node.group,
        },
      })
    })

    // 저장된 엣지가 있으면 사용, 없으면 기본값
    const edgesToUse = savedEdges || edgeDefinitions
    
    edgesToUse.forEach((edge, index) => {
      const sourceExists = initialNodes.some((n) => n.id === edge.source)
      const targetExists = initialNodes.some((n) => n.id === edge.target)
      
      if (sourceExists && targetExists) {
        flowEdges.push({
          id: edge.id || `edge-${index}`,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || 'bottom-src',
          targetHandle: edge.targetHandle || 'top',
          type: 'smoothstep',
          style: { stroke: '#E65100', strokeWidth: 3 },
          reconnectable: true,  // 재연결 활성화
        })
      }
    })

    return { flowNodes, flowEdges }
  }, [initialNodes, positions, savedEdges])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)
  const [selectedEdge, setSelectedEdge] = useState(null)

  // 노드 클릭 → 링크 열기
  const onNodeClick = useCallback((event, node) => {
    if (event.shiftKey) return
    if (node.data.link) {
      window.open(node.data.link, '_blank')
    }
  }, [])

  // 엣지 클릭 → 선택
  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge.id)
  }, [])

  // 엣지 재연결 핸들러
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

  // 전체 상태 내보내기 (위치 + 엣지)
  const exportFullState = useCallback(() => {
    const posData = {}
    nodes.forEach((node) => {
      if (node.type === 'custom') {
        posData[node.id] = {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
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
      positions: posData,
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

  return (
    <div onKeyDown={onKeyDown} tabIndex={0} className="w-full h-full outline-none">
      <ReactFlow
        nodes={nodes}
        edges={edges.map((e) => ({
          ...e,
          style: {
            ...e.style,
            stroke: e.id === selectedEdge ? '#ef4444' : '#E65100',
            strokeWidth: e.id === selectedEdge ? 4 : 3,
          },
        }))}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
        nodesDraggable={true}
        elementsSelectable={true}
      >
        <Background color="#ddd" gap={20} />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.data?.section === '고급') return '#EDE7F6'
            return '#E0F2F1'
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
          <div>• 엣지 끝점 드래그: 다른 노드/핸들로 재연결</div>
          <div>• 엣지 클릭 → Delete: 삭제</div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
