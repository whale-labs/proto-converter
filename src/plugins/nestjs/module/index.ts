import { upperFirst } from 'lodash'
import { getServiceName } from '../../../utils'
import NestjsFile, { GenerateContent } from '../createNestjsFile'
import {
  createGrpcOptionName,
  createResolverClassName,
  getServiceFileNamePrefix,
  getResolverFileNamePrefix,
} from '../utils'

const createImports = (serviceNames: string[], resolverNames: string[]) => `
import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { ClientProviderOptions } from '@nestjs/microservices/module/interfaces/clients-module.interface';

import { ${serviceNames.join(',')} } from './${getServiceFileNamePrefix()}';
import { ${resolverNames.join(',')} } from './${getResolverFileNamePrefix()}';
import { ${createGrpcOptionName()} } from 'src/grpc.options';
`

const createModuleName = () => upperFirst(getServiceName()) + 'Module'

const createModule = (serviceNames: string[], resolverNames: string[]) => `
@Module({
  imports: [ClientsModule.register([${createGrpcOptionName()} as ClientProviderOptions])],
  providers: [
    ${[serviceNames].concat(resolverNames).join(',')}
  ],
  exports:[${serviceNames.join(',')}]
})

export class ${createModuleName()} {}
`

export const createContent: GenerateContent = ({ services }) => {
  const serviceNames = services.map(({ name }) => name)
  const resolverNames = serviceNames.map(createResolverClassName)
  return [
    createImports(serviceNames, resolverNames),
    createModule(serviceNames, resolverNames),
  ].join('\n')
}

export const { createSource, buildFile: buildModule } = new NestjsFile({
  fileType: 'module',
  createContent,
}).getBuildTools()

export default buildModule
