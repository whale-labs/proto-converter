import { isFunction } from 'lodash'
import { createFileWithSource, LINE_FEED, ProtoInfo } from '../../utils'
import { createNestjsFileName, NestjsFileType } from './utils'

type NotNullRecord<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

export type EnhancedProtoInfo = NotNullRecord<ProtoInfo>

export type GenerateContent = (protoInfo: EnhancedProtoInfo) => string

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

  private createSource(protoInfo: ProtoInfo) {
    if (!protoInfo.services) return ''
    const { createImports, createContent } = this.config
    const imports = isFunction(createImports)
      ? createImports(protoInfo as EnhancedProtoInfo)
      : ''
    const resolverContent = createContent(protoInfo as EnhancedProtoInfo)
    return [imports, resolverContent].join(LINE_FEED)
  }

  private buildFile(protoInfo: ProtoInfo) {
    const { services, config } = protoInfo
    if (!services) return
    const source = this.createSource.call(this, protoInfo)
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
