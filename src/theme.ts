// 设计系统 - 浅色主题
export const theme = {
  // 浅色背景系
  bg: {
    primary: '#f8fafc',
    secondary: '#ffffff',
    tertiary: '#f1f5f9',
    card: '#ffffff',
    cardHover: '#f8fafc',
  },
  // 文字色
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    muted: '#94a3b8',
    accent: '#0891b2',
  },
  // 强调色
  accent: {
    primary: '#0891b2',
    secondary: '#06b6d4',
    gradient: 'linear-gradient(135deg, #0891b2 0%, #0284c7 100%)',
    glow: 'rgba(8, 145, 178, 0.12)',
  },
  // 状态色
  status: {
    selected: '#0891b2',
    success: '#22c55e',
    warning: '#f59e0b',
    badge: '#f59e0b',
  },
  // 边框
  border: {
    subtle: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
    strong: 'rgba(0, 0, 0, 0.12)',
  },
  // 阴影
  shadow: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(8, 145, 178, 0.15)',
  },
}

export type Theme = typeof theme
