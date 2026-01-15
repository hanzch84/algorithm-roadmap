'use client'

import { ReactFlow, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

const testNodes = [
  { id: '1', position: { x: 100, y: 100 }, data: { label: '테스트 노드 1' } },
  { id: '2', position: { x: 300, y: 100 }, data: { label: '테스트 노드 2' } },
]

const testEdges = [
  { id: 'e1', source: '1', target: '2' },
]

export default function RoadmapFlow() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={testNodes}
        edges={testEdges}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}
