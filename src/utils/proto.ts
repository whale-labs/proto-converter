import protobuf, { Namespace } from 'protobufjs'
import { isEmpty, isString, upperFirst } from 'lodash'
import { pathCheck, quitProcess } from './index'
import { getConverterConfig, getServiceName } from './config'
import { DEFAULT_REQUIRED_KEY } from './constants'
import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
} from 'graphql'
import ProtoMessage from '../protoMessage'
import ProtoInputType from './handleInputType'

export type AllField = protobuf.Field | protobuf.MapField

export type ValidMessageType = protobuf.Type | protobuf.Enum

export interface EnhancedReflectionObject extends protobuf.ReflectionObject {
  isInput?: boolean
}

export interface ProtoInfo {
  root: protobuf.Root
  proto: protobuf.Namespace
  services: protobuf.Service[] | null
  messages: EnhancedReflectionObject[]
  config: Required<ConverterConfig>
}

type ConverterPlugin = (protoInfo: ProtoInfo) => void

export interface ConverterConfig {
  serviceName?: string
  sourcePath?: string
  protoPath: string
  outputPath?: string
  rootDir?: string
  plugins: ConverterPlugin[]
}

// TODO: the value of "xxx64" should be read from grpc option
const ScalarTypeMap = {
  double: GraphQLFloat,
  float: GraphQLFloat,
  int32: GraphQLInt,
  int64: GraphQLString,
  uint32: GraphQLInt,
  uint64: GraphQLString,
  sint32: GraphQLInt,
  sint64: GraphQLString,
  fixed32: GraphQLInt,
  fixed64: GraphQLString,
  sfixed32: GraphQLInt,
  sfixed64: GraphQLString,
  bool: GraphQLBoolean,
  string: GraphQLString,
  bytes: GraphQLString,
}

export function isScalar(type: any) {
  return Object.prototype.hasOwnProperty.call(ScalarTypeMap, type)
}

export function convertScalar(type: string) {
  return ScalarTypeMap[type]
}

const PROTOBUF_TYPES = [
  'Root',
  'Type',
  'Enum',
  'Namespace',
  'Service',
  'Method',
  'OneOf',
  'Field',
  'MapField',
  'ReflectionObject',
]
export const typeClassName = (type: any) => type?.constructor?.name

export const whichType = (
  type: unknown,
  typeName: typeof PROTOBUF_TYPES[number],
) => typeClassName(type) === typeName

export const isType = (type: unknown) => whichType(type, 'Type')

export const isEnum = (type: unknown) => whichType(type, 'Enum')

export const isMapField = (type: any) =>
  whichType(type, 'MapField') || type?.map

export const isNamespace = (type: unknown) => whichType(type, 'Namespace')

export const isService = (type: unknown) => whichType(type, 'Service')

export function getServices({ nestedArray }: protobuf.Namespace) {
  return nestedArray?.filter(isService) as protobuf.Service[]
}

export function fullTypeName(
  type: protobuf.ReflectionObject | string | null,
  needPrefix = true,
): string {
  if (!type) {
    quitProcess(`cant't get fullTypeName of ${type}`)
  }
  // TODO: configuration
  const serviceName = getServiceName()
  const prefix = needPrefix && serviceName ? upperFirst(serviceName) : ''
  const name = isString(type) ? type : type!.name
  const suffix = isMapField(type) ? 'Map' : ''
  return [prefix, name, suffix].filter(Boolean).join('_')
}

export function isRequired(field: protobuf.ReflectionObject) {
  const comment = field.comment
  if (!comment || comment.length < 8) return false
  // protobuf will removes whitespace from both ends of a string
  return comment.startsWith(DEFAULT_REQUIRED_KEY)
}

export function getMapKeys({ comment }: protobuf.ReflectionObject) {
  if (!comment) return
  const keysRegex = /\[[\w,\s]+\]/g
  const matchResult = comment.match(keysRegex)
  const targetString = (matchResult?.[0] ?? '').replace(/[[\]\s]+/gm, '')
  if (!targetString) return
  return targetString.split(',').sort()
}

export function getMethods(proto: protobuf.Namespace) {
  return getServices(proto).flatMap(({ methods }) => Object.values(methods))
}

// message name or path, for example: "token.proto.Empty"
export async function geteRootProto(protoPath: string) {
  pathCheck(protoPath)
  const root = new protobuf.Root()

  return root.load(protoPath, {
    keepCase: true,
    alternateCommentMode: true,
  })
}

function createNamespaceByNested(
  nested: protobuf.NamespaceBase['nested'] = {},
) {
  const proto = new Namespace('mainProto')
  return Object.assign(proto, {
    nested,
  }) as protobuf.Namespace
}

export function getMainProto(root: protobuf.Root) {
  const { nested, files } = root
  if (isEmpty(nested)) {
    quitProcess('nothing to parse!')
  }
  let mainProto: any = Object.values(nested!)[0]
  // if not define "package" in proto file,
  // root.nested inclueds service、message、enum and so on
  if (!isNamespace(mainProto)) {
    if (files?.length === 1) {
      mainProto = createNamespaceByNested(nested)
    } else {
      quitProcess(`${files[0]} need to define "package" for parsing`)
    }
  } else {
    while (isNamespace(Object.values(mainProto?.nested || {})[0])) {
      mainProto = Object.values(mainProto.nested!)[0]
    }
    // define "package" and import other files, but define nothing
    if (isEmpty(mainProto.nested)) {
      quitProcess('nothing to parse!')
    }
  }
  return mainProto as protobuf.Namespace
}

export function formatMainProto(mainProto: protobuf.Namespace) {
  return new ProtoInputType(mainProto).getProto()
}

export async function getProtoInfo(
  protoPath: string,
  serviceName: string,
): Promise<ProtoInfo> {
  const config = getConverterConfig(protoPath, serviceName)
  const root = await geteRootProto(config.protoPath)
  const mainProto = getMainProto(root)
  const proto = formatMainProto(mainProto)
  const services = getServices(proto)
  const messages = new ProtoMessage(proto).getMessages()
  return {
    root,
    proto,
    services: isEmpty(services) ? null : services,
    messages,
    config,
  }
}

export function lookup(path: string, namespace: protobuf.Namespace) {
  const r = namespace.lookup(path)
  if (!r) {
    throw Error(`"${path}" is undefined, check the proto file!`)
  }
  return r
}

export function isFieldsEmpty(typeName: string, namespace: protobuf.Namespace) {
  const result = lookup(typeName, namespace) as ValidMessageType
  return isEmpty((result as any)?.fields)
}
