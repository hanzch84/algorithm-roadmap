import './globals.css'

export const metadata = {
  title: '코알라 알고리즘 스터디 로드맵',
  description: '알고리즘 학습을 위한 인터랙티브 로드맵',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
