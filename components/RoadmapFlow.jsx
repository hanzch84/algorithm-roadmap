'use client'

import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
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
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import CustomNode from './CustomNode'
import GroupNode from './GroupNode'
import CustomEdge from './CustomEdge'

const nodeTypes = {
  custom: CustomNode,
  group: GroupNode,
}

const edgeTypes = {
  custom: CustomEdge,
}

// ========================================
// 서브그래프(그룹) 정의
// ========================================
const defaultGroups = {
  'sec_basic': {
    label: '📘 기본 과정',
    section: '기본',
    depth: 0,
    parentId: null,
    position: { x: -361, y: -29 },
    size: { width: 693, height: 765 },
    isSubgroup: false,
  },
  'sec_adv': {
    label: '🚀 고급 과정',
    section: '고급',
    depth: 0,
    parentId: null,
    position: { x: 352, y: -28 },
    size: { width: 334, height: 762 },
    isSubgroup: false,
  },
  'sec_platform': {
    label: '플랫폼 가입',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 22, y: 83 },
    size: { width: 331, height: 153 },
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
    position: { x: 77, y: 528 },
    size: { width: 555, height: 104 },
  },
  'sec_arena': {
    label: '대회 참가',
    section: '기본',
    depth: 1,
    isSubgroup: true,
    parentId: 'sec_basic',
    position: { x: 47, y: 645 },
    size: { width: 530, height: 100 },
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

// ========================================
// 노드-그룹 매핑 (동적으로 업데이트됨)
// ========================================
let nodeParentMapping = {
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
// 노드 기본 위치
// ========================================
const defaultPositions = {
  'node_intro': { x: 25, y: 25 },
  'node_boj_setup': { x: 38, y: 43 },
  'node_boj_usage': { x: 177, y: 43 },
  'node_koala_setup': { x: 40, y: 88 },
  'node_koala_usage': { x: 170, y: 88 },
  'node_solved_link': { x: 19, y: 44 },
  'node_solved_usage': { x: 107, y: 89 },
  'node_tools_intro': { x: 190, y: 43 },
  'tool_vscode': { x: 25, y: 42 },
  'tool_pycharm': { x: 25, y: 89 },
  'tool_replit': { x: 30, y: 42 },
  'tool_onlinegdb': { x: 21, y: 89 },
  'tool_ideone': { x: 30, y: 45 },
  'tool_tio': { x: 31, y: 89 },
  'tool_colab': { x: 19, y: 46 },
  'tool_marimo': { x: 35, y: 89 },
  'node_til': { x: 35, y: 45 },
  'node_join': { x: 192, y: 45 },
  'node_study': { x: 355, y: 45 },
  'node_arena': { x: 30, y: 43 },
  'node_arenajoin': { x: 195, y: 43 },
  'node_arenacoalla': { x: 360, y: 43 },
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

// ========================================
// 기본 엣지 정의
// ========================================
const defaultEdges = [
  { id: 'edge-2', source: 'node_boj_setup', target: 'node_boj_usage', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: -175.09, y: 118.08 } },
  { id: 'edge-3', source: 'node_koala_setup', target: 'node_koala_usage', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: -179.04, y: 162.50 } },
  { id: 'edge-13', source: 'node_arena', target: 'node_arenajoin', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: null },
  { id: 'edge-14', source: 'node_arenajoin', target: 'node_arenacoalla', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: null },
  { id: 'edge-1768455001460', source: 'node_boj_usage', target: 'node_solved_link', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 14.44, y: 115.12 } },
  { id: 'edge-1768457272681', source: 'node_intro', target: 'node_koala_setup', sourceHandle: 'bottom-src', targetHandle: 'left', controlPoint: { x: -360.66, y: 156.57 } },
  { id: 'edge-1768457839803', source: 'node_tools_intro', target: 'sec_tools_ide', sourceHandle: 'left-src', targetHandle: 'top', controlPoint: { x: -243.20, y: 284.90 } },
  { id: 'edge-1768457846287', source: 'node_tools_intro', target: 'sec_tools_notebook', sourceHandle: 'right-src', targetHandle: 'top', controlPoint: { x: 196.06, y: 276.01 } },
  { id: 'edge-1768457863495', source: 'node_tools_intro', target: 'sec_tools_online_ide', sourceHandle: 'bottom-src', targetHandle: 'top', controlPoint: null },
  { id: 'edge-1768457879417', source: 'node_tools_intro', target: 'sec_tools_runner', sourceHandle: 'right-src', targetHandle: 'top', controlPoint: { x: 45.04, y: 285.88 } },
  { id: 'edge-1768457941643', source: 'sec_tools', target: 'sec_record', sourceHandle: 'bottom-src', targetHandle: 'top', controlPoint: { x: -17.15, y: 489.23 } },
  { id: 'edge-1768457963564', source: 'sec_record', target: 'sec_arena', sourceHandle: 'bottom-src', targetHandle: 'top', controlPoint: { x: -32.95, y: 608.66 } },
  { id: 'edge-1768458027580', source: 'node_solved_link', target: 'node_solved_usage', sourceHandle: 'bottom-src', targetHandle: 'left', controlPoint: null },
  { id: 'edge-1768458251117', source: 'sec_record', target: 'sec_adv_til', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 327.35, y: 483.30 } },
  { id: 'edge-1768458255698', source: 'sec_arena', target: 'sec_adv_contest', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 329.32, y: 646.17 } },
  { id: 'edge-1768528784912', source: 'node_intro', target: 'node_boj_setup', sourceHandle: 'bottom-src', targetHandle: 'left', controlPoint: { x: -359.67, y: 110.18 } },
  { id: 'edge-1768529007019', source: 'sec_platform', target: 'sec_tools', sourceHandle: 'right-src', targetHandle: 'top', controlPoint: { x: 36.15, y: 131.90 } },
  { id: 'edge-1768529174088', source: 'sec_solved', target: 'sec_adv_usage', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 370.78, y: 118.08 } },
  { id: 'edge-1768529181806', source: 'sec_solved', target: 'sec_adv_ext', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 365.84, y: 300.69 } },
  { id: 'edge-1768529253767', source: 'node_til', target: 'node_join', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: -121.78, y: 566.22 } },
  { id: 'edge-1768529311056', source: 'node_join', target: 'node_study', sourceHandle: 'right-src', targetHandle: 'left', controlPoint: { x: 48.00, y: 565.23 } },
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
        notionPageId: node.notionPageId || null,
      },
    }

    const parentGroupId = nodeParentMapping[node.id]
    if (parentGroupId && groups[parentGroupId]) {
      flowNode.parentId = parentGroupId
      flowNode.extent = 'parent'
    }

    flowNodes.push(flowNode)
  })

  // 3. 엣지 생성 (커스텀 타입)
  const allNodeIds = flowNodes.map(n => n.id)

    ; (edgesToUse || []).forEach((edge, index) => {
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
          reconnectable: true,
          data: {
            controlPoint: edge.controlPoint || null,
          },
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
  const [selectedNode, setSelectedNode] = useState(null)
  const [newNodeId, setNewNodeId] = useState(null)

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

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  useEffect(() => {
    const { flowNodes, flowEdges } = buildFlowData(initialNodes, nodePositions, groupData, savedEdges)
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [initialNodes, nodePositions, groupData, savedEdges, setNodes, setEdges])

  const onNodeClick = useCallback((event, node) => {
    if (event.shiftKey) {
      setSelectedNode(node.id)
      setSelectedEdge(null)
      return
    }

    if (node.type === 'group') {
      setSelectedNode(node.id)
      setSelectedEdge(null)
      return
    }

    setSelectedNode(node.id)
    setSelectedEdge(null)

    if (node.data.link) {
      window.open(node.data.link, '_blank')
    }
  }, [])

  const onNodeDoubleClick = useCallback((event, node) => {
    if (node.type !== 'group' || event.shiftKey) return

    event.stopPropagation()

    const groupId = node.id
    const groupSection = node.data?.section || '기본'

    const newId = `node_new_${Date.now()}`
    const newPosition = { x: 50, y: 50 }

    const newNode = {
      id: newId,
      type: 'custom',
      position: newPosition,
      zIndex: 100,
      parentId: groupId,
      extent: 'parent',
      data: {
        label: '새 노드',
        link: '',
        section: groupSection,
        group: groupId,
        isNew: true,
      },
    }

    nodeParentMapping[newId] = groupId

    setNodes((nds) => [...nds, newNode])
    setNewNodeId(newId)
  }, [setNodes])

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge.id)
    setSelectedNode(null)
  }, [])

  const onPaneClick = useCallback(() => {
    setSelectedEdge(null)
    setSelectedNode(null)
  }, [])

  const onConnect = useCallback((connection) => {
    const newEdge = {
      ...connection,
      id: `edge-${Date.now()}`,
      type: 'custom',
      style: { stroke: '#E65100', strokeWidth: 2 },
      markerEnd,
      reconnectable: true,
      data: {
        controlPoint: null,
      },
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

  const deleteSelectedNode = useCallback(() => {
    if (selectedNode) {
      const nodeToDelete = nodes.find(n => n.id === selectedNode)
      if (nodeToDelete?.type === 'group') {
        alert('그룹은 삭제할 수 없습니다.')
        return
      }

      setNodes((nds) => nds.filter((n) => n.id !== selectedNode))
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode && e.target !== selectedNode))
      delete nodeParentMapping[selectedNode]
      setSelectedNode(null)
    }
  }, [selectedNode, nodes, setNodes, setEdges])

  const onKeyDown = useCallback((event) => {
    if (event.key === 'Delete' || event.key === 'Backspace') {
      if (selectedEdge) {
        deleteSelectedEdge()
      } else if (selectedNode) {
        deleteSelectedNode()
      }
    }
  }, [selectedEdge, selectedNode, deleteSelectedEdge, deleteSelectedNode])

  // JSON 다운로드
  const exportFullState = useCallback(() => {
    const nodeData = {}
    const groupDataExport = {}
    const customNodes = []

      ; (nodes || []).forEach((node) => {
        if (!node) return
        if (node.type === 'custom') {
          nodeData[node.id] = {
            x: Math.round(node.position.x),
            y: Math.round(node.position.y),
          }
          customNodes.push({
            id: node.id,
            name: node.data?.label || '',
            link: node.data?.link || '',
            section: node.data?.section || '기본',
            group: node.parentId || node.data?.group || '',
          })
        } else if (node.type === 'group') {
          groupDataExport[node.id] = {
            ...(defaultGroups[node.id] || {}),
            label: node.data?.label || defaultGroups[node.id]?.label || '',
            section: node.data?.section || defaultGroups[node.id]?.section || '기본',
            depth: node.data?.depth ?? defaultGroups[node.id]?.depth ?? 0,
            isSubgroup: node.data?.isSubgroup ?? defaultGroups[node.id]?.isSubgroup ?? false,
            parentId: node.parentId || defaultGroups[node.id]?.parentId || null,
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

    const edgeData = (edges || []).map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      controlPoint: e.data?.controlPoint || null,
    }))

    const fullState = {
      positions: nodeData,
      groups: groupDataExport,
      edges: edgeData,
      nodes: customNodes,
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

  // ========================================
  // Notion에 레이아웃 저장
  // ========================================
  const [isSaving, setIsSaving] = useState(false)

  const saveToNotion = useCallback(async () => {
    setIsSaving(true)

    try {
      const nodeData = {}
      const groupDataExport = {}

        ; (nodes || []).forEach((node) => {
          if (!node) return
          if (node.type === 'custom') {
            nodeData[node.id] = {
              x: Math.round(node.position.x),
              y: Math.round(node.position.y),
            }
          } else if (node.type === 'group') {
            groupDataExport[node.id] = {
              ...(defaultGroups[node.id] || {}),
              label: node.data?.label || defaultGroups[node.id]?.label || '',
              section: node.data?.section || defaultGroups[node.id]?.section || '기본',
              depth: node.data?.depth ?? defaultGroups[node.id]?.depth ?? 0,
              isSubgroup: node.data?.isSubgroup ?? defaultGroups[node.id]?.isSubgroup ?? false,
              parentId: node.parentId || defaultGroups[node.id]?.parentId || null,
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

      const edgeData = (edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        controlPoint: e.data?.controlPoint || null,
      }))

      const response = await fetch('/api/notion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positions: nodeData,
          groups: groupDataExport,
          edges: edgeData,
        }),
      })

      // 응답 텍스트로 먼저 받아서 확인
      const text = await response.text()

      if (!text) {
        throw new Error('서버 응답이 비어있습니다')
      }

      let result
      try {
        result = JSON.parse(text)
      } catch (e) {
        console.error('JSON 파싱 오류:', text)
        throw new Error(`서버 응답 파싱 오류: ${text.substring(0, 100)}`)
      }

      if (!response.ok) {
        throw new Error(result.error || '저장에 실패했습니다')
      }

      alert('✅ Notion에 레이아웃이 저장되었습니다!')

    } catch (error) {
      console.error('Save to Notion error:', error)
      alert(`❌ 오류: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }, [nodes, edges])

  // 페이지 생성 (Vercel KV)
  const [isPublishing, setIsPublishing] = useState(false)
  const [shareUrl, setShareUrl] = useState(null)

  const publishRoadmap = useCallback(async () => {
    setIsPublishing(true)

    try {
      const nodeData = {}
      const groupDataExport = {}
      const customNodes = []

        ; (nodes || []).forEach((node) => {
          if (!node) return
          if (node.type === 'custom') {
            nodeData[node.id] = {
              x: Math.round(node.position.x),
              y: Math.round(node.position.y),
            }
            customNodes.push({
              id: node.id,
              name: node.data?.label || '',
              link: node.data?.link || '',
              section: node.data?.section || '기본',
              group: node.data?.group || '',
            })
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

      const edgeData = (edges || []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        controlPoint: e.data?.controlPoint || null,
      }))

      const response = await fetch('/api/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '🐨 코알라 알고리즘 스터디 로드맵',
          positions: nodeData,
          groups: groupDataExport,
          edges: edgeData,
          nodes: customNodes,
        }),
      })

      const text = await response.text()

      if (!text) {
        throw new Error('서버 응답이 비어있습니다')
      }

      let result
      try {
        result = JSON.parse(text)
      } catch (e) {
        throw new Error(`서버 응답 파싱 오류: ${text.substring(0, 100)}`)
      }

      if (!response.ok) {
        throw new Error(result.error || '저장에 실패했습니다')
      }

      const fullUrl = `${window.location.origin}${result.url}`
      setShareUrl(fullUrl)

      await navigator.clipboard.writeText(fullUrl)
      alert(`✅ 페이지가 생성되었습니다!\n\n링크가 클립보드에 복사되었습니다:\n${fullUrl}`)

    } catch (error) {
      console.error('Publish error:', error)
      alert(`❌ 오류: ${error.message}`)
    } finally {
      setIsPublishing(false)
    }
  }, [nodes, edges])

  const styledEdges = (edges || []).map((e) => ({
    ...e,
    selected: e.id === selectedEdge,
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
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onConnect={onConnect}
        onReconnect={onReconnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
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

        <Panel position="top-right" className="flex gap-2 flex-wrap">
          <button
            onClick={saveToNotion}
            disabled={isSaving}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium"
          >
            {isSaving ? '⏳ 저장 중...' : '💾 Notion에 저장'}
          </button>
          <button
            onClick={publishRoadmap}
            disabled={isPublishing}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium"
          >
            {isPublishing ? '⏳ 생성 중...' : '🌐 페이지 생성'}
          </button>
          <button
            onClick={exportFullState}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium"
          >
            📥 JSON 다운로드
          </button>
          {selectedNode && (
            <button
              onClick={deleteSelectedNode}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium"
            >
              🗑️ 노드 삭제
            </button>
          )}
          {selectedEdge && (
            <button
              onClick={deleteSelectedEdge}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md text-sm font-medium"
            >
              🗑️ 엣지 삭제
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
          <div className="mt-1 text-orange-600 font-medium">• 엣지 중간점 드래그: 곡률 조절</div>
          <div className="text-orange-600">• 중간점 더블클릭: 곡률 초기화</div>
          <div className="mt-1 text-blue-600 font-medium">• 노드 더블클릭: 라벨 편집</div>
          <div className="text-blue-600">• 노드 우클릭: 링크 편집</div>
          <div className="text-purple-600">• 그룹 더블클릭: 새 노드 생성</div>
          <div className="text-purple-600">• Shift + 그룹 더블클릭: 라벨 편집</div>
          <div className="mt-1 text-red-600 font-medium">• Shift + 클릭 → Delete: 노드/엣지 삭제</div>
        </Panel>
      </ReactFlow>
    </div>
  )
}