import { upperFirst } from 'lodash'
import { Type, Field } from 'protobufjs'
import { assembleName, getMapKeys } from './utils'

interface EnhancedMapField extends protobuf.MapField {
  isInput?: boolean
}

export const DEFAULT_MAP_FIELD = 'JSON'

function createMapMessageName(field: EnhancedMapField) {
  const { type, keyType, isInput } = field
  const keys = (getMapKeys(field) || []).sort()
  const nameSuffix = isInput ? 'request' : 'response'
  const nameItems = [...keys, keyType, type, nameSuffix].map(upperFirst)
  return assembleName(nameItems)
}

function createFieldsArray(field: EnhancedMapField) {
  const { type, filename } = field
  const keys = getMapKeys(field)
  const fieldsArray = (keys || []).map(
    (name, index) =>
      new Field(name, index + 1, type, undefined, undefined, {
        filename,
      }),
  )
  return fieldsArray
}

function createFields(fieldsArray: protobuf.Field[]) {
  return fieldsArray.reduce((result, current) => {
    result[current.name] = current
    return result
  }, {} as protobuf.Type['fields'])
}

/**
 * @description map<key_type, value_type> map_field = N;
 * 1. key_type can be any integral or string type (so, any scalar type except for floating point types and bytes).
 * 2. The value_type can be any type except another map
 * 3. Map fields cannot be repeated
 *
 * @see https://developers.google.com/protocol-buffers/docs/proto3#maps
 * @see https://developers.google.com/protocol-buffers/docs/reference/go-generated#map
 */
export function createProtoTypeByMapField(field: EnhancedMapField) {
  const { isInput, comment, repeated } = field
  const mapFullName = createMapMessageName(field)
  const fieldsArray = createFieldsArray(field)
  const fields = createFields(fieldsArray)
  const type = new Type(mapFullName)
  // "fieldsArray" is readonly in type, but it links to "_fieldsArray" property
  return Object.assign(type, {
    _fieldsArray: fieldsArray,
    fields,
    comment,
    isInput,
    repeated,
  }) as protobuf.Type
}
