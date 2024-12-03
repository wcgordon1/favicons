'use client'

import { siteConfig } from '@/config/metadata'

export function OgImage({ title }: { title?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '-.02em',
        fontWeight: 700,
        background: 'white',
      }}
    >
      <div
        style={{
          left: 42,
          top: 42,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            marginLeft: 8,
            fontSize: 48,
            fontWeight: 600,
          }}
        >
          {siteConfig.name}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '20px 48px',
          lineHeight: 1.2,
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          {title || siteConfig.description}
        </div>
      </div>
    </div>
  )
} 