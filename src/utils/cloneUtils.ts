import { Enum, Field, MapField, Type } from 'protobufjs'
import { isEnum, isMapField, isType, typeClassName } from '.'

export function cloneFields(fields: protobuf.Type['fieldsArray']) {
  return fields.reduce((newField, field) => {
    const fieldHandler = isMapField(field) ? cloneMapField : cloneField
    newField[field.name] = fieldHandler(field as any) as protobuf.Field
    return newField
  }, {} as protobuf.Type['fields'])
}

export function cloneField(field: protobuf.Field) {
  const { name, id, type } = field
  return Object.assign(new Field(name, id, type), field)
}

export function cloneMapField(field: protobuf.MapField) {
  const { name, id, keyType, type } = field
  return Object.assign(new MapField(name, id, keyType, type), field)
}

export function cloneMessage(name: string, source: protobuf.ReflectionObject) {
  if (isEnum(source)) {
    return cloneEnum(name, source)
  }
  if (isType(source)) {
    return cloneType(name, source)
  }
  throw new TypeError(`${typeClassName(source)} is not a valid message type`)
}

export function cloneType(name: string, source: protobuf.ReflectionObject) {
  return Object.assign(new Type(name), source, {
    name,
  }) as protobuf.Type
}

export function cloneEnum(name: string, source: protobuf.ReflectionObject) {
  return Object.assign(new Enum(name), source, {
    name,
  }) as protobuf.Enum
}
