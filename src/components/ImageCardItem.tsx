import React, { useEffect, useState, useRef } from 'react'
import { theme } from '../theme'
import { FieldInfo, ImageCard } from '../types'
import '../styles/index.less'

interface ImageCardItemProps {
  card: ImageCard
  index: number
  isSelected: boolean
  onToggleSelect: (index: number) => void
  animationDelay: number
}

export const ImageCardItem: React.FC<ImageCardItemProps> = React.memo(
  ({ card, index, isSelected, onToggleSelect, animationDelay }) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [imageError, setImageError] = useState(false)
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null)
    const imgRef = useRef<HTMLImageElement>(null)

    // 使用 IntersectionObserver 懒加载
    useEffect(() => {
      const img = imgRef.current
      if (!img) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && img.dataset.src) {
              img.src = img.dataset.src
              observer.unobserve(img)
            }
          })
        },
        { rootMargin: '200px' }
      )

      observer.observe(img)
      return () => observer.disconnect()
    }, [])

    const renderFieldValue = (field: FieldInfo, fieldIndex: number) => {
      if (!field.value) return <span style={{ color: theme.text.muted }}>-</span>

      if (field.isImage) {
        return (
          <span
            className="field-link"
            onClick={(e) => {
              e.stopPropagation()
              window.open(field.value, '_blank')
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            图片
          </span>
        )
      }

      if (field.isUrl) {
        return (
          <span
            className="field-link"
            onClick={(e) => {
              e.stopPropagation()
              window.open(field.value, '_blank')
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            链接
          </span>
        )
      }

      const tooltipKey = `${index}-${fieldIndex}`
      const isOverflowing = field.value.length > 15

      return (
        <div
          className="field-value"
          onMouseEnter={() => isOverflowing && setActiveTooltip(tooltipKey)}
          onMouseLeave={() => setActiveTooltip(null)}
        >
          {field.value}
          {isOverflowing && activeTooltip === tooltipKey && (
            <div className="tooltip">{field.value}</div>
          )}
        </div>
      )
    }

    return (
      <div
        className="card-enter"
        style={{
          backgroundColor: theme.bg.card,
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${isSelected ? theme.status.selected : theme.border.subtle}`,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          animationDelay: `${animationDelay}ms`,
          boxShadow: isSelected ? `0 0 0 1px ${theme.status.selected}, ${theme.shadow.glow}` : theme.shadow.sm,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-6px)'
          e.currentTarget.style.boxShadow = isSelected
            ? `0 0 0 1px ${theme.status.selected}, ${theme.shadow.glow}, ${theme.shadow.lg}`
            : theme.shadow.lg
          e.currentTarget.style.borderColor = isSelected ? theme.status.selected : theme.border.medium
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = ''
          e.currentTarget.style.boxShadow = isSelected
            ? `0 0 0 1px ${theme.status.selected}, ${theme.shadow.glow}`
            : theme.shadow.sm
          e.currentTarget.style.borderColor = isSelected ? theme.status.selected : theme.border.subtle
        }}
      >
        {/* 图片区域 */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '75%',
            overflow: 'hidden',
            backgroundColor: '#e2e8f0',
          }}
        >
          {/* 骨架屏 */}
          {!imageLoaded && !imageError && (
            <div
              className="skeleton-shimmer"
              style={{
                position: 'absolute',
                inset: 0,
              }}
            />
          )}

          {/* 复选框 */}
          <div
            style={{
              position: 'absolute',
              top: 12,
              left: 12,
              width: 24,
              height: 24,
              borderRadius: 8,
              backgroundColor: isSelected ? theme.status.selected : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              border: `2px solid ${isSelected ? theme.status.selected : 'rgba(0, 0, 0, 0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              transition: 'all 0.2s',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelect(index)
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = theme.status.selected
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.2)'
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            {isSelected && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>

          {/* 分类标签 */}
          {card.lrZs && (
            <div
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: theme.status.badge,
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 700,
                padding: '5px 10px',
                borderRadius: 6,
                zIndex: 10,
                letterSpacing: '0.02em',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              {card.lrZs}
            </div>
          )}

          {/* 图片 */}
          <img
            ref={imgRef}
            data-src={card.imageUrl}
            alt="图片"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s',
              opacity: imageLoaded ? 1 : 0,
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (card.imageUrl) {
                window.open(card.imageUrl, '_blank')
              }
            }}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
          />

          {/* 错误状态 */}
          {imageError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.text.muted,
                gap: 8,
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
                <line x1="2" y1="2" x2="22" y2="22" />
              </svg>
              <span style={{ fontSize: 12 }}>加载失败</span>
            </div>
          )}
        </div>

        {/* 字段信息 - 允许 overflow 以显示 tooltip */}
        <div style={{ padding: '14px 16px', overflow: 'visible', position: 'relative' }}>
          {card.fields
            .filter((field) => field.name !== '预览' && !field.isImage)
            .slice(0, 4)
            .map((field, idx) => (
              <div key={idx} className="field-row">
                <span className="field-label">{field.name}</span>
                {renderFieldValue(field, idx)}
              </div>
            ))}
        </div>
      </div>
    )
  }
)
