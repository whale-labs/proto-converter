import protobuf from 'protobufjs'
import { isEmpty, isString, upperFirst } from 'lodash'
import { pathCheck, quitProcess, warnTip } from './index'
import { getConverterConfig, getServiceName } from './config'
import { DEFAULT_REQUIRED_KEY } from './constants'
import {
  GraphQLFloat,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
} from 'graphql'
import ProtoMessage from '../protoMessage'

export type AllField = protobuf.Field | protobuf.MapField

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
  plugins?: ConverterPlugin[]
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

export function getMapKeys({ comment, name }: protobuf.ReflectionObject) {
  if (!comment) {
    return warnTip(`${name}: no comment of the map field!`)
  }
  const keysRegex = /\[[\w,\s]+\]/g
  const matchResult = comment.match(keysRegex)
  const targetString = (matchResult?.[0] ?? '').replace(/[[\]\s]+/gm, '')
  if (!targetString) {
    return warnTip(`get map keys failed from comment of ${name}!`)
  }
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
  const n = new protobuf.Namespace('main_proto')
  const nestedArray = Object.values(nested)
  return { ...n, nested, nestedArray } as protobuf.Namespace
}

export function getMainProto({ nested, files }: protobuf.Root) {
  if (isEmpty(nested)) {
    quitProcess('nothing to parse!')
  }
  let mainProto: any = Object.values(nested!)[0]
  // if not define "package" in proto file,
  // root.nested inclueds service、message、enum and so on
  if (!isNamespace(mainProto)) {
    if (files?.length === 1) {
      return createNamespaceByNested(nested)
    }
    quitProcess('need to define "package" for parse')
  }
  while (isNamespace(Object.values(mainProto?.nested || {})[0])) {
    mainProto = Object.values(mainProto.nested!)[0]
  }
  // define "package" and import other files, but define nothing
  if (isEmpty(mainProto.nested)) {
    quitProcess('nothing to parse!')
  }
  return mainProto as protobuf.Namespace
}

export async function getProtoInfo(
  protoPath: string,
  serviceName: string,
): Promise<ProtoInfo> {
  const config = getConverterConfig(protoPath, serviceName)
  const root = await geteRootProto(config.protoPath)
  const mainProto = getMainProto(root)
  const services = getServices(mainProto)
  const messages = new ProtoMessage(mainProto, root).getMessages()
  return {
    root,
    proto: mainProto,
    services: isEmpty(services) ? null : services,
    messages,
    config,
  }
}

export function lookup(path: string, root: protobuf.Root) {
  const r = root.lookup(path)
  if (!r) {
    throw Error(`"${path}" is undefined, check the proto file!`)
  }
  return r
}
