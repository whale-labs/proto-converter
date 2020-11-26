import protobuf from 'protobufjs'
import {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLNamedType,
  printType,
  GraphQLString,
  GraphQLInt,
} from 'graphql'
import {
  fullTypeName,
  convertScalar,
  isScalar,
  isRequired,
  isMapField,
  isEnum,
  EnhancedReflectionObject,
  AllField,
  ProtoInfo,
} from '../utils'
import { isEmpty, reduce } from 'lodash'
import { createProtoTypeByMapField } from '../createMapMessage'

const EMPTY_FIELDS = {
  code: { type: GraphQLInt },
  message: { type: GraphQLString },
}

function createEmptyObjectType(name: string) {
  return new GraphQLObjectType({
    name: name,
    fields: () => ({}),
  })
}

function isInputEmptyType(message: EnhancedReflectionObject) {
  return (
    !isEnum(message as protobuf.Field) &&
    message.isInput &&
    isEmpty((message as protobuf.Type).fieldsArray)
  )
}

export default class SchemaConverter {
  private types: Map<string, GraphQLNamedType> = new Map([])
  private root: protobuf.Root
  private messages: EnhancedReflectionObject[]
  // To handle circular reference
  private parents: string[] = []

  constructor({ messages, root }: ProtoInfo) {
    this.root = root
    this.messages = messages
    this.createSchema()
  }

  private createSchema() {
    this.messages.forEach((m) => {
      // init parents
      this.parents = [m.name]
      this.convertMessageAndEnum(m)
    })
  }

  private convertMessageAndEnum(object: EnhancedReflectionObject) {
    const typeName = fullTypeName(object)
    const existedType = this.existType(typeName)
    if (existedType) return existedType
    if (isInputEmptyType(object)) {
      return
    }
    this.parents.push(object.name)
    let type: GraphQLNamedType
    if (isEnum(object as protobuf.Field)) {
      type = this.convertEnum(object as protobuf.Enum)
    } else {
      type = this.convertMessage(object as protobuf.Type)
    }
    return this.addType(typeName, type)
  }

  private convertMessage(message: protobuf.Type) {
    const isInput = (message as any).isInput
    const fields = isEmpty(message.fieldsArray)
      ? EMPTY_FIELDS
      : this.convertFields(message)
    return new (isInput ? GraphQLInputObjectType : GraphQLObjectType)({
      name: fullTypeName(message),
      fields: () => fields,
    })
  }

  private convertFields(message: protobuf.Type) {
    const createField = (fields: any, field: protobuf.Field) => {
      const name = field.partOf ? field.partOf.name : field.name
      const type = field.partOf
        ? this.convertOneOf(field.partOf)
        : this.convertFieldType(field)
      fields[name] = { type }
      return fields
    }
    return reduce(message.fieldsArray, createField, {})
  }

  private convertEnum(enm: protobuf.Enum) {
    const enumType = new GraphQLEnumType({
      name: fullTypeName(enm),
      values: Object.assign(
        {},
        ...Object.keys(enm.values).map((key) => ({
          [key]: {
            value: enm.values[key].valueOf(),
          },
        })),
      ),
    })
    return enumType
  }

  private convertFieldType(field: AllField) {
    const type = isMapField(field)
      ? this.convertMapField(field as protobuf.MapField)
      : this.convertDataType(field as protobuf.Field)
    return isRequired(field) ? new GraphQLNonNull(type) : type
  }

  private convertMapField(mapField: protobuf.MapField) {
    // TODO: read the create-function from config
    const mapMessage = createProtoTypeByMapField(mapField)
    return this.convertMessageAndEnum(mapMessage)
  }

  private convertDataType(field: AllField) {
    const { type, repeated } = field
    // handle circular reference
    const isCircularReference = this.parents.includes(type)
    // prettier-ignore
    const baseType = isCircularReference
      ? createEmptyObjectType(type)
      : isScalar(type)
        ? convertScalar(type)
        : this.getType(type)
    return repeated ? new GraphQLList(baseType) : baseType
  }

  private convertOneOf(oneOf: protobuf.OneOf) {
    const name = fullTypeName(oneOf)
    const types = oneOf.fieldsArray.map((field) => this.convertFieldType(field))
    const unionType = new GraphQLUnionType({
      name,
      types: () => types,
    })
    return this.addType(name, unionType)
  }

  private lookupMessage(name: string) {
    const message =
      this.messages.find((m) => m.name === name) || this.root.lookup(name)
    if (!message) {
      throw new Error(`can't find "${name}" in messages`)
    }
    return message
  }

  private addType(name: string, type: GraphQLNamedType) {
    this.types.set(name, type)
    return type
  }

  private existType(name: string) {
    return this.types.get(name)
  }

  private getType(typeName: string) {
    const targetField = this.lookupMessage(typeName)
    const name = fullTypeName(targetField.name)
    return this.existType(name) || this.convertMessageAndEnum(targetField)
  }

  getSchemas() {
    return [...this.types.values()].sort().map((t) => printType(t))
  }
}
