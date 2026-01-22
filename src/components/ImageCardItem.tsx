import React, { useEffect, useState, useRef } from 'react'
import { Checkbox, Tooltip } from 'antd'
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

    const renderFieldValue = (field: FieldInfo) => {
      if (!field.value) return <span style={{ color: '#94a3b8' }}>-</span>

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

      return (
        <Tooltip title={field.value} placement="topLeft" mouseEnterDelay={0.3}>
          <span className="field-value">{field.value}</span>
        </Tooltip>
      )
    }

    return (
      <div
        className={`card-enter image-card${isSelected ? ' selected' : ''}`}
        style={{ animationDelay: `${animationDelay}ms` }}
        onClick={() => onToggleSelect(index)}
      >
        {/* 图片区域 */}
        <div className="image-card-image-wrapper">
          {/* 骨架屏 */}
          {!imageLoaded && !imageError && (
            <div
              className="skeleton-shimmer"
              style={{ position: 'absolute', inset: 0 }}
            />
          )}

          {/* 复选框 */}
          <div className="image-card-checkbox">
            <Checkbox checked={isSelected} />
          </div>

          {/* 查看大图按钮 */}
          {imageLoaded && !imageError && (
            <div
              className="image-card-preview-btn"
              onClick={(e) => {
                e.stopPropagation()
                if (card.imageUrl) {
                  window.open(card.imageUrl, '_blank')
                }
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" />
              </svg>
            </div>
          )}

          {/* 分类标签 */}
          {card.lrZs && <div className="image-card-badge">{card.lrZs}</div>}

          {/* 图片 */}
          <img
            ref={imgRef}
            data-src={card.imageUrl}
            alt="图片"
            className={`image-card-img${imageLoaded ? ' loaded' : ''}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setImageLoaded(true)
            }}
          />

          {/* 错误状态 */}
          {imageError && (
            <div className="image-card-error">
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

        {/* 字段信息 */}
        <div className="image-card-fields">
          {card.fields
            .filter((field) => field.name !== '预览' && !field.isImage)
            .map((field, idx) => (
              <div key={idx} className="field-row">
                <span className="field-label">{field.name}</span>
                {renderFieldValue(field)}
              </div>
            ))}
        </div>
      </div>
    )
  }
)
