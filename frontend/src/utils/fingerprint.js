/**
 * Generating a browser fingerprint for vote tracking
 * Combining multiple browser characteristics
 */
export const generateFingerprint = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('fingerprint', 2, 2)
    
    const canvasData = canvas.toDataURL()
    
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasData.substring(0, 100),
    }
    
    // Simple hash function
    const str = JSON.stringify(fingerprint)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return hash.toString(36)
  }
  
  // Store fingerprint in sessionStorage for consistency
  export const getStoredFingerprint = () => {
    let fingerprint = sessionStorage.getItem('voter_fingerprint')
    
    if (!fingerprint) {
      fingerprint = generateFingerprint()
      sessionStorage.setItem('voter_fingerprint', fingerprint)
    }
    
    return fingerprint
  }