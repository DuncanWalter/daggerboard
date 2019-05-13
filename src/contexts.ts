import { createContext } from 'react'
import { MatchResult, DaggerboardContext } from './types'

export const GlobalRoutingContext = createContext<DaggerboardContext>({} as any)
export const LocalRoutingContext = createContext<MatchResult>({} as any)
