import { Module } from '@nestjs/common'
import { ClientsModule } from '@nestjs/microservices'
import { ClientProviderOptions } from '@nestjs/microservices/module/interfaces/clients-module.interface'

import { CreateNestjsServie, Test } from './nestjs.service'
import { CreateNestjsServieResolver, TestResolver } from './nestjs.resolver'
import { Nestjs } from 'src/grpc.options'

@Module({
  imports: [ClientsModule.register([Nestjs as ClientProviderOptions])],
  providers: [
    CreateNestjsServie,
    Test,
    CreateNestjsServieResolver,
    TestResolver,
  ],
  exports: [CreateNestjsServie, Test],
})

export class NestjsModule {}
