'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import CustomNode from './CustomNode'
import GroupNode from './GroupNode'

// 노드 타입 등록
const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
}

// 그룹별 위치 설정
const groupPositions = {
  // 기본 과정
  'intro': { x: 400, y: 0 },
  '플랫폼 가입': { x: 150, y: 100 },
  'solved.ac': { x: 400, y: 250 },
  '코딩 도구': { x: 400, y: 380 },
  'IDE': { x: 150, y: 450 },
  '온라인 IDE': { x: 350, y: 450 },
  '온라인 러너': { x: 550, y: 450 },
  '노트북': { x: 750, y: 450 },
  '스터디 기록': { x: 400, y: 620 },
  // 고급 과정
  '크롬 확장': { x: 100, y: 800 },
  '고급 활용': { x: 400, y: 800 },
  '온라인 콘테스트': { x: 700, y: 800 },
  '다이어그램 툴': { x: 200, y: 950 },
  '시각화 도구': { x: 550, y: 950 },
}

// 엣지 정의
const edgeDefinitions = [
  { source: 'node_intro', target: 'node_boj_setup' },
  { source: 'node_intro', target: 'node_koala_setup' },
  { source: 'node_boj_setup', target: 'node_boj_usage' },
  { source: 'node_koala_setup', target: 'node_koala_usage' },
  { source: 'node_boj_usage', target: 'node_solved_link' },
  { source: 'node_koala_usage', target: 'node_solved_link' },
  { source: 'node_solved_link', target: 'node_solved_usage' },
  { source: 'node_solved_usage', target: 'node_tools_intro' },
  { source: 'node_tools_intro', target: 'tool_vscode' },
  { source: 'node_tools_intro', target: 'tool_replit' },
  { source: 'node_tools_intro', target: 'tool_ideone' },
  { source: 'node_tools_intro', target: 'tool_colab' },
  { source: 'node_til', target: 'node_join' },
  { source: 'node_join', target: 'node_study' },
]

export default function RoadmapFlow({ initialNodes }) {
  // 노드 데이터를 React Flow 형식으로 변환
  const { flowNodes, flowEdges } = useMemo(() => {
    const nodesByGroup = {}
    
    // 그룹별로 노드 분류
    initialNodes.forEach((node) => {
      const group = node.group || '기타'
      if (!nodesByGroup[group]) {
        nodesByGroup[group] = []
      }
      nodesByGroup[group].push(node)
    })

    const flowNodes = []
    const flowEdges = []
    
    // 섹션 그룹 노드 (배경)
    flowNodes.push({
      id: 'section_basic',
      type: 'group',
      position: { x: 50, y: -50 },
      data: { label: '📘 기본 과정', section: '기본' },
      style: { 
        width: 900, 
        height: 720,
        zIndex: -1,
      },
    })
    
    flowNodes.push({
      id: 'section_advanced',
      type: 'group',
      position: { x: 50, y: 720 },
      data: { label: '🚀 고급 과정', section: '고급' },
      style: { 
        width: 900, 
        height: 320,
        zIndex: -1,
      },
    })

    // 각 노드 생성
    initialNodes.forEach((node, index) => {
      const groupPos = groupPositions[node.group] || { x: 400, y: index * 80 }
      const groupNodes = nodesByGroup[node.group] || []
      const indexInGroup = groupNodes.findIndex((n) => n.id === node.id)
      
      // 그룹 내 위치 계산
      let offsetX = 0
      let offsetY = 0
      
      if (groupNodes.length > 1) {
        if (['IDE', '온라인 IDE', '온라인 러너', '노트북', '크롬 확장', '고급 활용', '온라인 콘테스트', '다이어그램 툴', '시각화 도구'].includes(node.group)) {
          // 가로 배열 그룹
          offsetY = indexInGroup * 50
        } else {
          // 세로 배열 그룹
          offsetX = indexInGroup * 180
        }
      }

      flowNodes.push({
        id: node.id,
        type: 'custom',
        position: { 
          x: groupPos.x + offsetX, 
          y: groupPos.y + offsetY 
        },
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
      // 소스와 타겟 노드가 존재하는지 확인
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
            strokeWidth: 2,
          },
          animated: false,
        })
      }
    })

    return { flowNodes, flowEdges }
  }, [initialNodes])

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  const onNodeClick = useCallback((event, node) => {
    if (node.data.link) {
      window.open(node.data.link, '_blank')
    }
  }, [])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.3}
      maxZoom={1.5}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
    >
      <Background color="#ccc" gap={20} />
      <Controls />
      <MiniMap 
        nodeColor={(node) => {
          if (node.data?.section === '고급') return '#EDE7F6'
          return '#E0F2F1'
        }}
        maskColor="rgba(0, 0, 0, 0.1)"
      />
    </ReactFlow>
  )
}
