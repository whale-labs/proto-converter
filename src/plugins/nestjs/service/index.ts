import {
  createInterfaceName,
  DEFAULT_REQUEST_PREFIX,
  ProtoInfo,
  LINE_FEED,
} from '../../../utils'
import NestjsFile from '../createNestjsFile'
import {
  createGrpcOptionName,
  createServiceInnerName,
  createInterfaceImport,
  createServiceMethodName,
} from '../utils'

const NESTJS_DEPENDENCIES = `
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';`

const createImports = (services: protobuf.Service[]) => `
${NESTJS_DEPENDENCIES}
${createInterfaceImport(services)};
`

const createMethod = (serviceInnerName: string, method: string) => {
  const methodName = createServiceMethodName(method)
  return `
public async ${methodName}(${DEFAULT_REQUEST_PREFIX}) {
  return await this.${serviceInnerName}.${methodName}(${DEFAULT_REQUEST_PREFIX}).toPromise()
}`
}

const assembleMethods = (serviceInnerName: string, methods: string[]) =>
  methods.map((m) => createMethod(serviceInnerName, m)).join(LINE_FEED)

const serviceTemplate = (serviceName: string, methods: string[]) => {
  const serviceInnerName = createServiceInnerName(serviceName)
  const interfaceName = createInterfaceName(serviceName)

  return `
@Injectable()
export class ${serviceName} implements OnModuleInit {

  private ${serviceInnerName}: ${interfaceName}

  constructor(@Inject('${createGrpcOptionName()}') private readonly client: ClientGrpc) {}

  async onModuleInit() {
      this.${serviceInnerName} = this.client.getService<${interfaceName}>('${serviceName}')
  }

  ${assembleMethods(serviceInnerName, methods)}
}
`
}

const createContent = (services: ProtoInfo['services']) =>
  services!
    .map(({ name, methods }) => serviceTemplate(name, Object.keys(methods)))
    .join(LINE_FEED)

export const { createSource, buildFile: buildService } = new NestjsFile({
  fileType: 'service',
  createImports,
  createContent,
}).getBuildTools()

export default buildService
