import {
  DEFAULT_REQUEST_PREFIX,
  createInterfaceName,
  createTypingMethodName,
  assembleComment,
  ProtoInfo,
  LINE_FEED,
} from '../utils'

const createServiceMethodType = (method: protobuf.Method) => {
  const { comment, requestType, responseType } = method
  const parsedComment = assembleComment({ comment, inline: true })
  // TODO: this should be configurable
  // grpc service requires an empty object when have no request params
  const requestParam = `${DEFAULT_REQUEST_PREFIX}: ${requestType}`
  // TODO: the responseType wrapper should be read from configuration
  return `${parsedComment}${createTypingMethodName(
    method,
  )}(${requestParam}): Observable<${responseType}>
`
}

const createServiceType = ({ name, methods }: protobuf.Service) => {
  const methodTypes = Object.values(methods).map((m) =>
    createServiceMethodType(m),
  )
  return `
export interface ${createInterfaceName(name)} {
  ${methodTypes.join(LINE_FEED)}
}
`
}

export const createServicesType = (protoInfo: ProtoInfo) =>
  (protoInfo.services || []).map((s) => createServiceType(s)).join(LINE_FEED)

export default createServicesType
