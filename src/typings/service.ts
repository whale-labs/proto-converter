import { isEmpty } from 'lodash'
import {
  DEFAULT_REQUEST_PREFIX,
  createInterfaceName,
  formatServiceName,
  assembleComment,
  ProtoInfo,
  lookup,
} from '../utils'

const createServiceMethodType = (
  method: protobuf.Method,
  { root }: ProtoInfo,
) => {
  const { comment, requestType, responseType } = method
  const parsedComment = assembleComment({comment,inline: true})
  const requestFields = (lookup(method.requestType, root) as protobuf.Type)
    ?.fields
  const requestParam = isEmpty(requestFields)
    ? ''
    : `${DEFAULT_REQUEST_PREFIX}: ${requestType}`
  // TODO: the responseType wrapper should be read from configuration
  return `${parsedComment}${formatServiceName(
    method,
  )}(${requestParam}): Observable<${responseType}>
`
}

const createServiceType = (
  { name, methods }: protobuf.Service,
  protoInfo: ProtoInfo,
) => {
  const methodTypes = Object.values(methods).map((m) =>
    createServiceMethodType(m, protoInfo),
  )
  return `
export interface ${createInterfaceName(name)} {
  ${methodTypes.join('\n')}
}
`
}

export const createServicesType = (protoInfo: ProtoInfo) =>
  (protoInfo.services || []).map((s) => createServiceType(s, protoInfo)).join('\n')

export default createServicesType
