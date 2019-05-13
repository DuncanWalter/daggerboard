import { GlobalRoutingContext, LocalRoutingContext } from './contexts'
import { useContext } from 'react'
import { resolvePath } from './routes'

export function useHistory() {
  const ctx = useContext(GlobalRoutingContext)
  const match = useContext(LocalRoutingContext)

  return {
    push(path: string) {
      ctx.history.push(resolvePath(path, match))
    },
    replace(path: string) {
      ctx.history.replace(resolvePath(path, match))
    },
    goBack: ctx.history.goBack,
    goForward: ctx.history.goForward,
    location: ctx.history.location,
    block: ctx.history.block,
    params: match.params,
  }
}
