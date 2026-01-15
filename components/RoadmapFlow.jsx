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
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import CustomNode from './CustomNode'

// 노드 타입 등록
const nodeTypes = {
  custom: CustomNode,
}

// 기본 노드 위치 (NodeID -> {x, y})
const defaultPositions = {
  // 기본 과정 - 상단
  'node_intro': { x: 450, y: 30 },
  
  // 플랫폼 가입
  'node_boj_setup': { x: 150, y: 120 },
  'node_boj_usage': { x: 350, y: 120 },
  'node_koala_setup': { x: 550, y: 120 },
  'node_koala_usage': { x: 750, y: 120 },
  
  // solved.ac
  'node_solved_link': { x: 350, y: 220 },
  'node_solved_usage': { x: 550, y: 220 },
  
  // 코딩 도구
  'node_tools_intro': { x: 450, y: 320 },
  
  // IDE
  'tool_vscode': { x: 80, y: 420 },
  'tool_pycharm': { x: 180, y: 420 },
  
  // 온라인 IDE
  'tool_replit': { x: 300, y: 420 },
  'tool_onlinegdb': { x: 400, y: 420 },
  
  // 온라인 러너
  'tool_ideone': { x: 520, y: 420 },
  'tool_tio': { x: 620, y: 420 },
  
  // 노트북
  'tool_colab': { x: 740, y: 420 },
  'tool_marimo': { x: 840, y: 420 },
  
  // 스터디 기록
  'node_til': { x: 250, y: 530 },
  'node_join': { x: 450, y: 530 },
  'node_study': { x: 650, y: 530 },
  
  // 대회 참가
  'node_arena': { x: 250, y: 630 },
  'node_arenajoin': { x: 450, y: 630 },
  'node_arenacoalla': { x: 650, y: 630 },
  
  // 고급 과정 ======
  // 크롬 확장
  'ext_bjcode': { x: 80, y: 780 },
  'ext_bojhub': { x: 200, y: 780 },
  'ext_bojext': { x: 320, y: 780 },
  'ext_testcase': { x: 440, y: 780 },
  
  // 고급 활용
  'adv_boj': { x: 580, y: 780 },
  'adv_solved': { x: 700, y: 780 },
  'adv_koala': { x: 820, y: 780 },
  
  // 온라인 콘테스트
  'contest_atcoder': { x: 80, y: 880 },
  'contest_codeforces': { x: 220, y: 880 },
  
  // 다이어그램 툴
  'draw_io': { x: 400, y: 880 },
  'excalidraw': { x: 520, y: 880 },
  
  // 시각화 도구
  'pythontutor': { x: 680, y: 880 },
  'vscode_ext': { x: 820, y: 880 },
}

// 엣지 정의
const edgeDefinitions = [
  // 기본 흐름
  { source: 'node_intro', target: 'node_boj_setup' },
  { source: 'node_intro', target: 'node_koala_setup' },
  { source: 'node_boj_setup', target: 'node_boj_usage' },
  { source: 'node_koala_setup', target: 'node_koala_usage' },
  { source: 'node_boj_usage', target: 'node_solved_link' },
  { source: 'node_solved_link', target: 'node_solved_usage' },
  { source: 'node_solved_usage', target: 'node_tools_intro' },
  
  // 코딩 도구 연결
  { source: 'node_tools_intro', target: 'tool_vscode' },
  { source: 'node_tools_intro', target: 'tool_replit' },
  { source: 'node_tools_intro', target: 'tool_ideone' },
  { source: 'node_tools_intro', target: 'tool_colab' },
  
  // 스터디 기록
  { source: 'node_til', target: 'node_join' },
  { source: 'node_join', target: 'node_study' },
  
  // 대회 참가
  { source: 'node_arena', target: 'node_arenajoin' },
  { source: 'node_arenajoin', target: 'node_arenacoalla' },
  
  // 기본 -> 고급
  { source: 'node_arenacoalla', target: 'ext_bjcode' },
]

export default function RoadmapFlow({ initialNodes, savedPositions }) {
  const [positionData, setPositionData] = useState(null)
  
  // 위치 데이터 병합 (저장된 위치 > 기본 위치)
  const positions = useMemo(() => {
    return { ...defaultPositions, ...savedPositions }
  }, [savedPositions])

  // 노드 데이터를 React Flow 형식으로 변환
  const { flowNodes, flowEdges } = useMemo(() => {
    const flowNodes = []
    const flowEdges = []

    // 각 노드 생성
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

    // 엣지 생성
    edgeDefinitions.forEach((edge, index) => {
      const sourceExists = initialNodes.some((n) => n.id === edge.source)
      const targetExists = initialNodes.some((n) => n.id === edge.target)
      
      if (sourceExists && targetExists) {
        flowEdges.push({
          id: `edge-${index}`,
          source: edge.source,
          target: edge.target,
          type: 'smoothstep',
          style: { 
            stroke: '#E65100', 
            strokeWidth: 3,
          },
        })
      }
    })

    return { flowNodes, flowEdges }
  }, [initialNodes, positions])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  // 노드 클릭 → 링크 열기
  const onNodeClick = useCallback((event, node) => {
    // Shift 클릭은 위치 조정용으로 무시
    if (event.shiftKey) return
    
    if (node.data.link) {
      window.open(node.data.link, '_blank')
    }
  }, [])

  // 위치 내보내기
  const exportPositions = useCallback(() => {
    const posData = {}
    nodes.forEach((node) => {
      if (node.type === 'custom') {
        posData[node.id] = {
          x: Math.round(node.position.x),
          y: Math.round(node.position.y),
        }
      }
    })
    
    const dataStr = JSON.stringify(posData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = 'node-positions.json'
    a.click()
    
    URL.revokeObjectURL(url)
    setPositionData(posData)
  }, [nodes])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
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
      
      {/* 위치 저장 버튼 */}
      <Panel position="top-right" className="flex gap-2">
        <button
          onClick={exportPositions}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium transition-colors"
        >
          📥 위치 저장 (JSON)
        </button>
      </Panel>
    </ReactFlow>
  )
}
