import {
  createInterfaceName,
  DEFAULT_REQUEST_PREFIX,
  isFieldsEmpty,
  LINE_FEED,
} from '../../../utils'
import NestjsFile, {
  GenerateContent,
  EnhancedProtoInfo,
} from '../createNestjsFile'
import {
  createGrpcOptionName,
  createServiceInnerName,
  createInterfaceImport,
  createServiceMethodName,
} from '../utils'

let enhanceProtoInfo: EnhancedProtoInfo

const NESTJS_DEPENDENCIES = `
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';`

const createImports: GenerateContent = ({ services }) => `
${NESTJS_DEPENDENCIES}
${createInterfaceImport(services)};
`

const createMethod = (
  serviceInnerName: string,
  { name, requestType }: protobuf.Method,
) => {
  const methodName = createServiceMethodName(name)
  const noFields = isFieldsEmpty(requestType, enhanceProtoInfo.proto)
  return `
public async ${methodName}(${noFields ? '' : DEFAULT_REQUEST_PREFIX}) {
  return await this.${serviceInnerName}.${methodName}(${
    noFields ? '{}' : DEFAULT_REQUEST_PREFIX
  }).toPromise()
}`
}

const assembleMethods = ({ name, methods }: protobuf.Service) => {
  const serviceInnerName = createServiceInnerName(name)

  return Object.values(methods)
    .map((m) => createMethod(serviceInnerName, m))
    .join(LINE_FEED)
}

const serviceTemplate = (serivce: protobuf.Service) => {
  const { name } = serivce
  const serviceInnerName = createServiceInnerName(name)
  const interfaceName = createInterfaceName(name)

  return `
@Injectable()
export class ${name} implements OnModuleInit {

  private ${serviceInnerName}: ${interfaceName}

  constructor(@Inject('${createGrpcOptionName()}') private readonly client: ClientGrpc) {}

  async onModuleInit() {
      this.${serviceInnerName} = this.client.getService<${interfaceName}>('${name}')
  }

  ${assembleMethods(serivce)}
}
`
}

const createContent: GenerateContent = (protoInfo) => {
  enhanceProtoInfo = protoInfo
  return protoInfo.services.map(serviceTemplate).join(LINE_FEED)
}

export const { createSource, buildFile: buildService } = new NestjsFile({
  fileType: 'service',
  createImports,
  createContent,
}).getBuildTools()

export default buildService
