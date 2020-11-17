import { upperFirst, camelCase } from 'lodash'
import {
  createInterfaceName,
  getInterfaceFileNamePrefix,
  getServiceName,
  createFileName,
} from '../../utils'

export type NestjsFileType = 'resolver' | 'service' | 'module'

export const createFileNamePrefix = (type: NestjsFileType) =>
  `${getServiceName()}.${type}`
export const createNestjsFileName = (type: NestjsFileType) =>
  createFileName(createFileNamePrefix(type))

export const getServiceFileNamePrefix = () => createFileNamePrefix('service')
export const getResolverFileNamePrefix = () => createFileNamePrefix('resolver')

export const createGrpcOptionName = () => upperFirst(getServiceName())

export const createResolverName = (serviceName: string) =>
  upperFirst(serviceName)

const RESOLVER_CLASS_NAMEE_SUFFIX = 'Resolver'
export const createResolverClassName = (serviceName: string) =>
  createResolverName(serviceName).concat(RESOLVER_CLASS_NAMEE_SUFFIX)

export const createServiceInnerName = (serviceName: string) =>
  camelCase(serviceName)

export const createServiceMethodName = (methodName: string) =>
  camelCase(methodName)

const getInterfaceImportPath = () => `./${getInterfaceFileNamePrefix()}`

const getInterfaceNamesFromService = (services: protobuf.Service[]) =>
  services.map(({ name }) => createInterfaceName(name))

export const createInterfaceImport = (services: protobuf.Service[]) => {
  const interfaceNames = getInterfaceNamesFromService(services).join(',')
  return `import { ${interfaceNames} } from '${getInterfaceImportPath()}'`
}
