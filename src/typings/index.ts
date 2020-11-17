import {
  createFileWithSource,
  createFileName,
  ProtoInfo,
  getInterfaceFileNamePrefix,
  LINE_FEED,
} from '../utils'
import { isEmpty } from 'lodash'
import createServicesType from './service'
import createSchemaTypingSource from './schema'

export const createTypingSource = (protoInfo: ProtoInfo) => {
  // TODO: should be read from configuration
  const importSource = `import { Observable } from 'rxjs';`
  const serviceSource = createServicesType(protoInfo)
  const schemaSource = createSchemaTypingSource(protoInfo)
  if (isEmpty(serviceSource)) return schemaSource
  return [importSource, serviceSource, schemaSource].join(LINE_FEED)
}

export const buildInterface = (protoInfo: ProtoInfo) => {
  createFileWithSource({
    source: createTypingSource(protoInfo),
    dir: protoInfo.config.outputPath,
    fileName: createFileName(getInterfaceFileNamePrefix()),
  })
}

export default buildInterface
