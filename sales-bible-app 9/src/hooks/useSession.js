import { useState, useCallback } from 'react'

const DEFAULT_SESSION = {
  product: '',       // orchestrate | bob | governance
  useCase: '',       // id of a pre-built use case, or '' if none/custom
  persona: '',        // id of selected persona
  customUseCase: null, // AI-generated use case object when situation doesn't match pre-built ones
  callType: '',      // inbound | outbound | validation | exec | stalled
  account: '',
  industry: '',
  buyerName: '',
  buyerTitle: '',
  knowSoFar: '',
  confirmedPains: '',
}

export function useSession() {
  const [session, setSession] = useState(DEFAULT_SESSION)

  const updateSession = useCallback((updates) => {
    setSession(prev => ({ ...prev, ...updates }))
  }, [])

  const resetSession = useCallback(() => {
    setSession(DEFAULT_SESSION)
  }, [])

  const hasContext = session.product && session.callType

  return { session, updateSession, resetSession, hasContext }
}
