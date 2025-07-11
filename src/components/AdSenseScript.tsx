'use client'

import { useEffect } from 'react'

const AdSenseScript = () => {
  useEffect(() => {
    // Só carregar o script em produção
    if (process.env.NODE_ENV !== 'production') {
      console.log('🚧 AdSense script não carregado em desenvolvimento')
      return
    }

    // Verificar se o script já foi carregado
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      return
    }

    console.log('📢 Carregando script do AdSense...')
    const script = document.createElement('script')
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2325936665567762'
    script.async = true
    script.crossOrigin = 'anonymous'
    
    document.head.appendChild(script)

    return () => {
      // Cleanup se necessário (remover script)
      const existingScript = document.querySelector('script[src*="adsbygoogle.js"]')
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
    }
  }, [])

  return null // Este componente não renderiza nada
}

export default AdSenseScript 