import { isEmpty } from 'lodash'
import {
  isScalar,
  lookup,
  isEnum,
  getMapKeys,
  warnTip,
  ProtoInfo,
  LINE_FEED,
  isMapField,
} from '../utils'

type CustomField = protobuf.Field & protobuf.MapField
type ParseResponseField = (field: CustomField) => string

let protoInfo: ProtoInfo
// handle circular reference
let parents: string[] = []

function lookupType(typeName: string) {
  return (
    protoInfo.messages.find(({ name }) => name === typeName) ||
    lookup(typeName, protoInfo.root)
  )
}

function parseResponseFields(responseType: string) {
  if (isScalar(responseType)) return ''

  const typeValue = lookupType(responseType)
  if (isEnum(typeValue)) return ''

  const fields = (typeValue as any).fields as protobuf.Field
  if (isEmpty(fields)) return ''

  const tempRes = Object.values(fields).map(parseFieldHandler).join(LINE_FEED)
  return tempRes ? `{${tempRes}}` : ''
}

// BEWARE: just for golang
const parseMapField: ParseResponseField = (field) => {
  const { name, type, keyType } = field
  const keys = getMapKeys(field)
  if (!keys) return name
  // keyType must be "string" "number", or JavaScript can't use it
  if (!isScalar(keyType)) {
    warnTip(`the keyType of map field ${name} is not a scalar type!`)
  }
  return `${name} {${keys.map((i) => `${i} ${parseResponseFields(type)}`)}}`
}

const parseFieldHandler: ParseResponseField = (field) => {
  const { name, type } = field
  if (isMapField(field)) return parseMapField(field)
  if (isScalar(type) || parents.includes(type)) return name
  parents.push(type)
  return `${name} ${parseResponseFields(type)}`
}

function parseResponseType(responseType: string) {
  const typeValue = lookupType(responseType) as protobuf.Type
  const result = Object.values(typeValue.fields)
    .map((f) => {
      parents = [responseType]
      return parseFieldHandler(f as CustomField)
    })
    .join(LINE_FEED)
  return result ? `{${result}}` : ''
}

function parseResponse(responseType: string, info: ProtoInfo) {
  protoInfo = info
  return parseResponseType(responseType)
}

export default parseResponse
