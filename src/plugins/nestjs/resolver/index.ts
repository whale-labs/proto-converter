import {
  maybeQueryMethod,
  DEFAULT_REQUEST_PREFIX,
  LINE_FEED,
  createGraphqlMethodName,
  isFieldsEmpty,
} from '../../../utils'
import NestjsFile, {
  EnhancedProtoInfo,
  GenerateContent,
} from '../createNestjsFile'
import {
  createResolverClassName,
  createResolverName,
  createServiceInnerName,
  createServiceMethodName,
  getServiceFileNamePrefix,
} from '../utils'

let enhanceProtoInfo: EnhancedProtoInfo

const NESTJS_DEPENDENCIES = `
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'`

const createImports: GenerateContent = ({ services }) => `
${NESTJS_DEPENDENCIES}
import { ${services
  .map(({ name }) => name)
  .join(',')} } from './${getServiceFileNamePrefix()}';
`

const createMethod = (method: protobuf.Method) => {
  const { parent, name, requestType } = method
  const serviceInnerName = createServiceInnerName(parent!.name)
  const methodName = createServiceMethodName(name)
  const graphqlMethodName = createGraphqlMethodName(method)
  const QueryType = maybeQueryMethod(name) ? 'Query' : 'Mutation'
  const noFields = isFieldsEmpty(requestType, enhanceProtoInfo.proto)
  const args = noFields
    ? ''
    : `@Args('${DEFAULT_REQUEST_PREFIX}') ${DEFAULT_REQUEST_PREFIX}`
  return `
    @${QueryType}('${graphqlMethodName}')
    async ${methodName}(${args}) {
      return await this.${serviceInnerName}.${methodName}(${
    noFields ? '' : DEFAULT_REQUEST_PREFIX
  })
    }`
}

const assembleMethods = ({ methods }: protobuf.Service) =>
  Object.values(methods).map(createMethod).join(LINE_FEED)

const resolverTemplate = (service: protobuf.Service) => {
  const serviceName = service.name
  const serviceInnerName = createServiceInnerName(serviceName)
  return `
@Resolver('${createResolverName(serviceName)}')
export class ${createResolverClassName(serviceName)} {

  private ${serviceInnerName}: ${serviceName}

  constructor(@Inject('${serviceName}') ${serviceInnerName}: ${serviceName}) {
    this.${serviceInnerName} = ${serviceInnerName}
  }

  ${assembleMethods(service)}
}
`
}

const createContent: GenerateContent = (protoInfo) => {
  enhanceProtoInfo = protoInfo
  return protoInfo.services.map(resolverTemplate).join(LINE_FEED)
}

export const { createSource, buildFile: buildResolver } = new NestjsFile({
  fileType: 'resolver',
  createImports,
  createContent,
}).getBuildTools()

export default buildResolver
