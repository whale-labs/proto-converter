import { Injectable, OnModuleInit, Inject } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { ICreateNestjsServie, ICreateNestjsResolver } from './nestjs.d'

@Injectable()
export class CreateNestjsServie implements OnModuleInit {
  private createNestjsServie: ICreateNestjsServie

  constructor(@Inject('Nestjs') private readonly client: ClientGrpc) {}

  async onModuleInit() {
    this.createNestjsServie = this.client.getService<ICreateNestjsServie>(
      'CreateNestjsServie'
    )
  }

  public async addMethod(req) {
    return await this.createNestjsServie.addMethod(req).toPromise()
  }

  public async listMethods(req) {
    return await this.createNestjsServie.listMethods(req).toPromise()
  }
}

@Injectable()
export class CreateNestjsResolver implements OnModuleInit {
  private createNestjsResolver: ICreateNestjsResolver

  constructor(@Inject('Nestjs') private readonly client: ClientGrpc) {}

  async onModuleInit() {
    this.createNestjsResolver = this.client.getService<ICreateNestjsResolver>(
      'CreateNestjsResolver'
    )
  }

  public async addMethod(req) {
    return await this.createNestjsResolver.addMethod(req).toPromise()
  }

  public async listMethods(req) {
    return await this.createNestjsResolver.listMethods(req).toPromise()
  }
}
