import { useReducer, ReactElement } from 'react'

import { isPromise } from './isPromise'
import { isAbsolute, join, formalize } from './join'
import {
  MatchResult,
  DaggerboardContext,
  Route,
  MatchRequest,
  AsyncMatchResult,
} from './types'
import { useRef } from 'react'
import pathToRegexp from 'path-to-regexp'

function interpretRoute(
  route: Route,
  request: MatchRequest,
  ctx: DaggerboardContext,
): AsyncMatchResult {
  if (ctx.isTerminal(route)) {
    return assignRoute(route, request)
  } else if (typeof route === 'string') {
    return assignRoute(resolvePath(route, request), request)
  } else if (typeof route === 'function') {
    return interpretRoute(
      route({
        params: request.params,
        exact: request.path === '',
        match: request.globalMatch,
      }),
      request,
      ctx,
    )
  } else if (isPromise(route)) {
    return route.then(syncRoute => interpretRoute(syncRoute, request, ctx))
  } else if (typeof route === 'object') {
    return matchRoute({ ...request, router: route }, ctx)
  } else {
    return assignRoute(null, request)
  }
}

function pickRoute(
  cases: string[],
  request: MatchRequest,
  ctx: DaggerboardContext,
): AsyncMatchResult {
  const { router, path } = request
  const [casePath, ...rest] = cases

  if (!rest.length) {
    return assignRoute(null, request)
  }

  const keys: pathToRegexp.Key[] = []
  const pattern = pathToRegexp(`${formalize(casePath)}`, keys, {
    end: false,
  })
  const parse = pattern.exec(path)
  if (parse) {
    const [match, ...parameters] = parse

    const route = router[casePath]

    const combinedParams = {
      ...request.params,
      ...parameters.reduce(
        (acc, param, i) => {
          acc[keys[i].name] = param
          return acc
        },
        {} as { [param: string]: string },
      ),
    }

    const innerRequest = {
      router: request.router,
      path: path.slice(match.length),
      globalMatch: `${request.globalMatch}${match}`,
      localMatch: match,
      params: combinedParams,
      parent: request,
    }

    const result = interpretRoute(route, innerRequest, ctx)

    if (isPromise(result)) {
      return result.then(route => {
        if (route === null) {
          return pickRoute(rest, request, ctx)
        } else {
          return result
        }
      })
    } else {
      if (result.route === null) {
        return pickRoute(rest, request, ctx)
      } else {
        return result
      }
    }
  } else {
    if (rest.length) {
      return pickRoute(rest, request, ctx)
    } else {
      return assignRoute(null, request)
    }
  }
}

export function matchRoute(
  request: MatchRequest,
  ctx: DaggerboardContext,
): AsyncMatchResult {
  const { router } = request

  return pickRoute(Object.keys(router), request, ctx)
}

function assignRoute(
  route: ReactElement | string | null,
  request: MatchRequest,
): MatchResult {
  return {
    ...request,
    route,
  }
}

export function resolvePath(path: string, request: MatchRequest) {
  if (isAbsolute(path)) {
    return path
  } else {
    return join(
      request.globalMatch.slice(
        0,
        request.globalMatch.length - request.localMatch.length,
      ),
      path,
    )
  }
}

const constant = {}
export function useDidChange(nextValue: unknown) {
  const lastValue = useRef(constant as any)
  if (lastValue.current !== nextValue) {
    lastValue.current = nextValue
    return true
  } else {
    return false
  }
}

export function useForceUpdate() {
  const [, forceUpdate] = useReducer(i => ++i, 0)
  return forceUpdate as () => void
}
