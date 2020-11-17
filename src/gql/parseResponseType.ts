import { isEmpty } from 'lodash'
import {
  isScalar,
  lookup,
  isEnum,
  typeClassName,
  getMapKeys,
  warnTip,
  ProtoInfo,
  LINE_FEED,
} from '../utils'

type ParseResponseField = (
  filed: protobuf.Field & protobuf.MapField,
  protoInfo: ProtoInfo,
) => string

// BEWARE: just for golang
const parseMapField: ParseResponseField = (field, protoInfo) => {
  const { name, type, keyType } = field
  const keys = getMapKeys(field)
  if (!keys) return name
  // keyType must be "string" "number", or JavaScript can't use it
  if (!isScalar(keyType)) {
    warnTip(`the keyType of map field ${name} is not a scalar type!`)
  }
  return `${name} {${keys.map(
    (i) => `${i} ${parseResponseFields(type, protoInfo)}`,
  )}}`
}

const parseNormalField: ParseResponseField = (field, protoInfo) => {
  const { name, type } = field
  return `${name} ${parseResponseFields(type, protoInfo)}`
}

const parseFieldMap = new Map([
  ['Field', parseNormalField],
  ['MapField', parseMapField],
])

const parseFieldHandler: ParseResponseField = (field, protoInfo) => {
  const handler = parseFieldMap.get(typeClassName(field) || 'Field')!
  return handler(field, protoInfo)
}

function parseResponseFields(responseType: string, protoInfo: ProtoInfo) {
  if (isScalar(responseType)) return ''

  const typeValue =
    protoInfo.messages.find(({ name }) => name === responseType) ||
    lookup(responseType, protoInfo.root)
  if (isEnum(typeValue)) return ''

  const fields = (typeValue as any).fields as protobuf.Field
  if (isEmpty(fields)) return ''

  const tempRes = Object.values(fields)
    .map((r) => parseFieldHandler(r, protoInfo))
    .join(LINE_FEED)
  return tempRes ? `{${tempRes}}` : ''
}

export default parseResponseFields
