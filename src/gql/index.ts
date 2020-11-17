import { isEmpty } from 'lodash'
import {
  createFileWithSource,
  assembleComment,
  createGqlMethodName,
  getServiceName,
  createFileName,
  DEFAULT_REQUEST_PREFIX,
  getMethods,
  fullTypeName,
  ProtoInfo,
  lookup,
  getRequestType,
  LINE_FEED,
} from '../utils'
import parseResponseFields from './parseResponseType'

const parseParams = (requestObject: protobuf.ReflectionObject) => {
  if (isEmpty((requestObject as any).fields)) return ['', '']
  return [
    `($${DEFAULT_REQUEST_PREFIX}: ${fullTypeName(requestObject)})`,
    `(${DEFAULT_REQUEST_PREFIX}: $${DEFAULT_REQUEST_PREFIX})`,
  ]
}

const buildGqlItem = (method: protobuf.Method, protoInfo: ProtoInfo) => {
  const { name, requestType, responseType, comment } = method
  const [outerParams, innerParams] = parseParams(
    lookup(requestType, protoInfo.root),
  )
  const type = getRequestType(name)
  const queryName = createGqlMethodName(method)
  const res = parseResponseFields(responseType, protoInfo)
  return `
  ${assembleComment(comment)}
  export const ${queryName} = gql\`
    ${type} ${queryName} ${outerParams} {
      ${queryName} ${innerParams} ${res}
    }
  \`
  `
}

export const assembleGqlContent = (protoInfo: ProtoInfo) => {
  const methods = getMethods(protoInfo.proto)
  const gqls = methods.map((i) => buildGqlItem(i, protoInfo)).join(LINE_FEED)
  return `
    import gql from 'graphql-tag';

    ${gqls}
  `
}

export const buildGql = (protoInfo: ProtoInfo) => {
  createFileWithSource({
    source: assembleGqlContent(protoInfo),
    dir: protoInfo.config.outputPath,
    fileName: createFileName(getServiceName() + '.gql'),
  })
}

export default buildGql
