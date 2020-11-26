import { upperFirst } from 'lodash'
import path from 'path'
import {
  doesPathExist,
  execUnderDir,
  getServiceName,
  ProtoInfo,
  warnTip,
} from '../../../utils'
import NestjsFile, { GenerateContent } from '../createNestjsFile'
import {
  createGrpcOptionName,
  createResolverClassName,
  getServiceFileNamePrefix,
  getResolverFileNamePrefix,
  createNestjsFileName,
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

const addModuleToRoot = ({ config: { outputPath, rootDir } }: ProtoInfo) => {
  const modulePath = path.resolve(outputPath, createNestjsFileName('module'))
  if (doesPathExist(modulePath)) {
    return warnTip(`${modulePath} has existed`)
  }
  execUnderDir(`nest g mo ${getServiceName()}`, rootDir)
}

export const { createSource, buildFile: buildModule } = new NestjsFile({
  fileType: 'module',
  createContent,
  beforeCreate: addModuleToRoot,
}).getBuildTools()

export default buildModule
