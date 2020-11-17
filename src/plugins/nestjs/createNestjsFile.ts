import { isFunction } from 'lodash'
import { createFileWithSource, LINE_FEED, ProtoInfo } from '../../utils'
import { createNestjsFileName, NestjsFileType } from './utils'

export type GenerateContent = (services: protobuf.Service[]) => string

export interface CreateNestjsFileParams {
  fileType: NestjsFileType
  createImports?: GenerateContent
  createContent: GenerateContent
}

export default class NestjsFile {
  private config: CreateNestjsFileParams

  constructor(config: CreateNestjsFileParams) {
    this.config = config
  }

  private createSource(services: protobuf.Service[]) {
    const { createImports, createContent } = this.config
    const imports = isFunction(createImports) ? createImports(services) : ''
    const resolverContent = createContent(services)
    return [imports, resolverContent].join(LINE_FEED)
  }

  private buildFile({ services, config }: ProtoInfo) {
    if (!services) return
    const source = this.createSource.call(this, services)
    const fileName = createNestjsFileName(this.config.fileType)
    createFileWithSource({
      source,
      dir: config.outputPath,
      fileName,
    })
  }

  getBuildTools() {
    const createSource = this.createSource.bind(this)
    const buildFile = this.buildFile.bind(this)
    return { createSource, buildFile }
  }
}
