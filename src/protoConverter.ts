import { ProtoInfo } from './utils/proto'
import { customInspect } from './utils/log'

export type ProtoConverterMiddleware = (protoInfo: ProtoInfo) => void

export default class ProtoConverter {
  private middlewares: ProtoConverterMiddleware[] = []
  private protoInfo: ProtoInfo

  constructor(protoInfo: ProtoInfo) {
    this.protoInfo = protoInfo
  }

  use(fn: ProtoConverterMiddleware | ProtoConverterMiddleware[]) {
    if (!fn) return
    const callbacks = arrify(fn)
    if (callbacks.length === 0) return
    for (let i = 0; i < callbacks.length; i++) {
      const cb = callbacks[i]
      if (typeof cb !== 'function') {
        throw new TypeError(
          'requires a middleware function but got a ' + getType(cb),
        )
      }
      this.middlewares.push(cb)
    }
  }

  dispatch() {
    this.middlewares.forEach((fn) => {
      try {
        fn(this.protoInfo)
      } catch (error) {
        customInspect(error, fn.name || '<anonymous>')
      }
    })
  }
}

function getType(obj: unknown) {
  const type = typeof obj
  if (type !== 'object') {
    return type
  }
  const objectRegExp = /^\[object (\S+)\]$/
  return Object.prototype.toString.call(obj).replace(objectRegExp, '$1')
}

function arrify(value: unknown) {
  if (!value) {
    return []
  }
  return Array.isArray(value) ? value : [value]
}
