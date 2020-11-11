import { getProtoInfo } from './utils/proto'
import { customInspect } from './utils/log'
import { ProtoInfo } from './utils/proto'
import ProtoConverter from './protoConverter'
import protoToGraphql from './graphql'

export { buildInterface } from './typings'
export { buildGql } from './gql'

export interface ConvertProps {
  protoPath: string
  serviceName: string
}

function convert(protoInfo: ProtoInfo) {
  const protoConverter = new ProtoConverter(protoInfo)
  protoConverter.use(protoToGraphql)
  protoConverter.use(protoInfo.config.plugins)
  protoConverter.dispatch()
}

export async function converter(protoPath: string, serviceName: string) {
  try {
    const protoInfo = await getProtoInfo(protoPath, serviceName)
    convert(protoInfo)
  } catch (error) {
    customInspect(error, 'convert error')
  }
}
