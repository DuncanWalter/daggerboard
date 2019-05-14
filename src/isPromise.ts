export function isPromise(arg: unknown): arg is Promise<any> {
  return arg && Promise && arg instanceof Promise
}

type CollapseAsync<T> = T extends Promise<any> ? T : T | Promise<T>

export function unSync<T, U>(
  item: T | Promise<T>,
  fun: (item: T) => U,
): CollapseAsync<U> {
  if (isPromise(item)) {
    return item.then(fun) as CollapseAsync<U>
  } else {
    return fun(item) as CollapseAsync<U>
  }
}
