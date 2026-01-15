'use client'

export default function GroupNode({ data }) {
  const isAdvanced = data.section === '고급'
  
  return (
    <div
      className={`
        w-full h-full rounded-2xl p-4
        ${isAdvanced ? 'group-advanced' : 'group-basic'}
      `}
    >
      <div className={`
        text-lg font-display mb-2
        ${isAdvanced ? 'text-advanced-text' : 'text-basic-text'}
      `}>
        {data.label}
      </div>
    </div>
  )
}
