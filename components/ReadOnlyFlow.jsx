'use client'

import { useMemo } from 'react'
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

// ========================================
// 읽기 전용 노드 컴포넌트 (Handle 추가)
// ========================================
function ReadOnlyNode({ data }) {
  const isAdvanced = data.section === '고급'

  const style = {
    padding: '6px 12px',
    borderRadius: '8px',
    border: `2px solid ${isAdvanced ? '#7E57C2' : '#00897B'}`,
    backgroundColor: isAdvanced ? '#EDE7F6' : '#E0F2F1',
    fontSize: '12px',
    fontWeight: 500,
    color: isAdvanced ? '#4527A0' : '#004D40',
    cursor: data.link ? 'pointer' : 'default',
    minWidth: '80px',
    textAlign: 'center',
  }

  const handleStyle = {
    width: 6,
    height: 6,
    background: isAdvanced ? '#7E57C2' : '#00897B',
    border: 'none',
  }

  const handleClick = () => {
    if (data.link) {
      window.open(data.link, '_blank')
    }
  }

  return (
    <div style={style} onClick={handleClick} title={data.link || ''}>
      <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="target" position={Position.Left} id="left" style={handleStyle} />

      {data.label}
      {data.link && <span style={{ marginLeft: '4px', fontSize: '10px' }}>🔗</span>}

      <Handle type="source" position={Position.Right} id="right-src" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" style={handleStyle} />
    </div>
  )
}

// ========================================
// 읽기 전용 그룹 노드 컴포넌트 (Handle 추가)
// ========================================
function ReadOnlyGroupNode({ data }) {
  const isAdvanced = data.section === '고급'

  const style = {
    padding: '8px',
    borderRadius: '16px',
    border: `3px solid ${isAdvanced ? '#7E57C2' : '#00897B'}`,
    backgroundColor: isAdvanced ? 'rgba(237, 231, 246, 0.5)' : 'rgba(224, 242, 241, 0.5)',
    width: '100%',
    height: '100%',
  }

  const handleStyle = {
    width: 8,
    height: 8,
    background: isAdvanced ? '#7E57C2' : '#00897B',
    border: 'none',
  }

  return (
    <div style={style}>
      <Handle type="target" position={Position.Top} id="top" style={handleStyle} />
      <Handle type="target" position={Position.Left} id="left" style={handleStyle} />

      <div style={{
        fontSize: '13px',
        fontWeight: 700,
        color: isAdvanced ? '#4527A0' : '#004D40',
        marginBottom: '4px'
      }}>
        {data.label}
      </div>

      <Handle type="source" position={Position.Right} id="right-src" style={handleStyle} />
      <Handle type="source" position={Position.Bottom} id="bottom-src" style={handleStyle} />
    </div>
  )
}

const nodeTypes = {
  custom: ReadOnlyNode,
  group: ReadOnlyGroupNode,
}

// ========================================
// 기본 그룹 정의
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

// 기본 엣지
const defaultEdges = [
  { id: 'edge-2', source: 'node_boj_setup', target: 'node_boj_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-3', source: 'node_koala_setup', target: 'node_koala_usage', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-13', source: 'node_arena', target: 'node_arenajoin', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-14', source: 'node_arenajoin', target: 'node_arenacoalla', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-11', source: 'node_til', target: 'node_join', sourceHandle: 'right-src', targetHandle: 'left' },
  { id: 'edge-12', source: 'node_join', target: 'node_study', sourceHandle: 'right-src', targetHandle: 'left' },
]

// 기본 노드 위치
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
}

// 화살표 스타일
const markerEnd = {
  type: 'arrowclosed',
  color: '#E65100',
  width: 12,
  height: 12,
}

// ========================================
// 메인 컴포넌트
// ========================================
export default function ReadOnlyFlow({ nodes: inputNodes, positions: inputPositions, groups: inputGroups, edges: inputEdges }) {
  const { flowNodes, flowEdges } = useMemo(() => {
    const flowNodes = []
    const flowEdges = []

    // 그룹 데이터 병합
    const groups = { ...defaultGroups }
    if (inputGroups && Object.keys(inputGroups).length > 0) {
      Object.keys(inputGroups).forEach(key => {
        if (groups[key]) {
          groups[key] = { ...groups[key], ...inputGroups[key] }
        }
      })
    }

    // 위치 데이터 병합
    const positions = { ...defaultPositions, ...(inputPositions || {}) }

    // 1. 그룹 노드 생성
    const groupEntries = Object.entries(groups)
    groupEntries.sort((a, b) => (a[1]?.depth || 0) - (b[1]?.depth || 0))

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
        },
        draggable: false,
        selectable: false,
      }

      if (group.parentId) {
        node.parentId = group.parentId
        node.extent = 'parent'
      }

      flowNodes.push(node)
    })

    // 2. 일반 노드 생성
    if (inputNodes && inputNodes.length > 0) {
      inputNodes.forEach((node, index) => {
        if (!node) return

        const pos = positions[node.id] || { x: 20 + (index % 4) * 120, y: 40 }

        const flowNode = {
          id: node.id,
          type: 'custom',
          position: pos,
          zIndex: 100,
          data: {
            label: node.name || '',
            link: node.link || '',
            section: node.section || '기본',
          },
          draggable: false,
          selectable: false,
        }

        const parentGroupId = nodeParentMapping[node.id]
        if (parentGroupId && groups[parentGroupId]) {
          flowNode.parentId = parentGroupId
          flowNode.extent = 'parent'
        }

        flowNodes.push(flowNode)
      })
    }

    // 3. 엣지 생성
    const allNodeIds = flowNodes.map(n => n.id)
    const edgesToUse = (inputEdges && inputEdges.length > 0) ? inputEdges : defaultEdges

    edgesToUse.forEach((edge, index) => {
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
          type: 'default',
          style: { stroke: '#E65100', strokeWidth: 2 },
          markerEnd,
        })
      }
    })

    return { flowNodes, flowEdges }
  }, [inputNodes, inputPositions, inputGroups, inputEdges])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        minZoom={0.2}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={true}
        zoomOnScroll={true}
        nodeOrigin={[0, 0]}
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
        />

        <Panel position="bottom-left" className="bg-white/90 p-3 rounded-lg shadow text-xs">
          <div className="font-bold mb-1">사용법</div>
          <div>• 마우스 드래그: 화면 이동</div>
          <div>• 스크롤: 확대/축소</div>
          <div>• 노드 클릭: 링크 열기 🔗</div>
        </Panel>
      </ReactFlow>
    </div>
  )
}