import { Resolver, Query, Args, Mutation } from '@nestjs/graphql'
import { Inject } from '@nestjs/common'
import { CreateNestjsServie, Test } from './nestjs.service'

@Resolver('CreateNestjsServie')
export class CreateNestjsServieResolver {
  private createNestjsServie: CreateNestjsServie

  constructor(@Inject('CreateNestjsServie') createNestjsServie: CreateNestjsServie) {
    this.createNestjsServie = createNestjsServie
  }

  @Mutation('createNestjsServie_addMethod')
  async addMethod() {
    return await this.createNestjsServie.addMethod()
  }

  @Query('createNestjsServie_listMethods')
  async listMethods(@Args('req') req) {
    return await this.createNestjsServie.listMethods(req)
  }
}

@Resolver('Test')
export class TestResolver {
  private test: Test

  constructor(@Inject('Test') test: Test) {
    this.test = test
  }

  @Mutation('test_addMethod')
  async addMethod() {
    return await this.test.addMethod()
  }

  @Query('test_listMethods')
  async listMethods(@Args('req') req) {
    return await this.test.listMethods(req)
  }
}
