'use client'

import { useEffect, useRef } from 'react'

interface AdSenseAdProps {
  adSlot: string
  adFormat?: string
  responsive?: boolean
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

let adCounter = 0

const AdSenseAd: React.FC<AdSenseAdProps> = ({
  adSlot,
  adFormat = 'auto',
  responsive = true,
  style = { display: 'block' },
  className = '',
}) => {
  const adId = useRef(`adsense-${++adCounter}`)
  const isProduction = process.env.NODE_ENV === 'production'
  
  useEffect(() => {
    // Só carregar anúncios em produção
    if (!isProduction) return

    const loadAd = () => {
      try {
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.adsbygoogle = window.adsbygoogle || []
            window.adsbygoogle.push({})
          }
        }, 1000)
      } catch (err) {
        console.error('AdSense error:', err)
      }
    }

    loadAd()
  }, [isProduction])

  // Em desenvolvimento, mostrar um placeholder
  if (!isProduction) {
    return (
      <div 
        className={`adsense-placeholder border-2 border-dashed border-gray-400 bg-gray-100 flex items-center justify-center ${className}`}
        style={{
          ...style,
          minHeight: style?.minHeight || '90px',
          backgroundColor: 'rgba(128, 128, 128, 0.2)',
          color: '#888'
        }}
        id={adId.current}
      >
        <div className="text-center p-4">
          <p className="text-sm font-mono">🚧 AdSense Placeholder</p>
          <p className="text-xs">Slot: {adSlot}</p>
          <p className="text-xs">Format: {adFormat}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`adsense-container ${className}`} id={adId.current}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-2325936665567762"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}

export default AdSenseAd 