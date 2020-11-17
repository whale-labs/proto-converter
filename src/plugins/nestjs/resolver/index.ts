import {
  maybeQueryMethod,
  DEFAULT_REQUEST_PREFIX,
  LINE_FEED,
  createGraphqlMethodName,
} from '../../../utils'
import NestjsFile from '../createNestjsFile'
import {
  createResolverClassName,
  createResolverName,
  createServiceInnerName,
  createServiceMethodName,
  getServiceFileNamePrefix,
} from '../utils'

const NESTJS_DEPENDENCIES = `
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'`

const createImports = (services: protobuf.Service[]) => `
${NESTJS_DEPENDENCIES}
import { ${services
  .map(({ name }) => name)
  .join(',')} } from './${getServiceFileNamePrefix()}';
`

const createMethod = (method: protobuf.Method) => {
  const { parent, name } = method
  const serviceInnerName = createServiceInnerName(parent!.name)
  const methodName = createServiceMethodName(name)
  const graphqlMethodName = createGraphqlMethodName(method)
  const requestType = maybeQueryMethod(name) ? 'Query' : 'Mutation'
  return `
@${requestType}('${graphqlMethodName}')
async ${methodName}(@Args('${DEFAULT_REQUEST_PREFIX}') ${DEFAULT_REQUEST_PREFIX}) {
  return await this.${serviceInnerName}.${methodName}(${DEFAULT_REQUEST_PREFIX})
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

const createContent = (services: protobuf.Service[]) =>
  services.map(resolverTemplate).join(LINE_FEED)

export const { createSource, buildFile: buildResolver } = new NestjsFile({
  fileType: 'resolver',
  createImports,
  createContent,
}).getBuildTools()

export default buildResolver
