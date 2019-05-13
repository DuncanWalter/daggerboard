import React, { useContext, useRef } from 'react'
import { useHistory } from './useHistory'
import { LocalRoutingContext, GlobalRoutingContext } from './contexts'
import { useDidChange, useForceUpdate, matchRoute } from './routes'
import { MatchResult, Router } from './types'
import { isPromise } from './isPromise'

// For optimization, the rule needs to be that this ONLY
// cares to recheck stuff when the outerMatch updates.
// When outerMatch updates, the whole thing cycles.
// Else, it will just return the latest match it has.
// The root service provider will have a hook that watches
// the actual provided context.
export function useRouter(router: Router): React.ReactElement {
  const ctx = useContext(GlobalRoutingContext)
  const outerMatch = useContext(LocalRoutingContext)
  const outerMatchChanged = useDidChange(outerMatch)

  const forceUpdate = useForceUpdate()

  const { replace } = useHistory()

  let nextInnerMatch: MatchResult | Promise<MatchResult>

  const lastInnerMatchRef = useRef<MatchResult>({
    ...outerMatch,
    route: null,
  })

  if (outerMatchChanged) {
    nextInnerMatch = matchRoute(
      {
        ...outerMatch,
        localMatch: '',
        router,
      },
      ctx,
    )
  } else {
    nextInnerMatch = lastInnerMatchRef.current
  }

  if (isPromise(nextInnerMatch)) {
    const lastInnerMatch = lastInnerMatchRef.current
    nextInnerMatch.then(innerMatch => {
      if (lastInnerMatch === lastInnerMatchRef.current) {
        if (typeof innerMatch.route == 'string') {
          if (innerMatch.route !== ctx.currentPath) {
            replace(innerMatch.route)
          }
        } else {
          lastInnerMatchRef.current = innerMatch
          forceUpdate()
        }
      }
    })
  } else {
    if (typeof nextInnerMatch.route == 'string') {
      if (nextInnerMatch.route !== ctx.currentPath) {
        replace(nextInnerMatch.route)
      }
    } else {
      lastInnerMatchRef.current = nextInnerMatch
    }
  }

  return (
    <LocalRoutingContext.Provider value={lastInnerMatchRef.current}>
      {lastInnerMatchRef.current.route}
    </LocalRoutingContext.Provider>
  )
}
