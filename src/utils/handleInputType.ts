import { isEmpty } from 'lodash'
import { assembleName, isScalar, isType, lookup } from '.'
import { cloneFields, cloneMessage } from './cloneUtils'
import { INPUT_TYPE_SUFFIX } from './config'
import { getMethods } from './proto'

export function createInputName(name: string) {
  // handle import type, example: "proto.converter.TestReq"
  const typeName = name.split('.').pop() || ''
  return assembleName(typeName, INPUT_TYPE_SUFFIX)
}

export function addMessageToNamespace(
  namespace: protobuf.Namespace,
  message: protobuf.ReflectionObject,
) {
  // TODO: "namespace.add(message)" doesn't work
  namespace.nested = Object.assign(namespace.nested, {
    [message.name]: message,
  })
  // we need to clear cache manually
  ;(namespace as any)._nestedArray = null
}

export default class ProtoInputType {
  private proto: protobuf.Namespace

  constructor(proto: protobuf.Namespace) {
    this.proto = proto
    this.handleServices()
  }

  handleServices() {
    const methods = getMethods(this.proto)
    if (isEmpty(methods)) return
    methods.forEach(this.handleRequestType, this)
  }

  handleRequestType(method: protobuf.Method) {
    const initialRequestType = method.requestType
    const newRequestName = createInputName(initialRequestType)
    method.requestType = newRequestName
    this.handleInputType(initialRequestType)
  }

  handleInputType(originalTypeName: string) {
    const source = lookup(originalTypeName, this.proto)
    const name = createInputName(source.name)
    if (this.proto.get(name)) return
    const newType = cloneMessage(name, source)
    addMessageToNamespace(this.proto, newType)
    isType(newType) && this.handleInputTypeFields(newType as protobuf.Type)
  }

  handleInputTypeFields(newType: protobuf.Type) {
    // keep same reference with original type except fields
    const fields = cloneFields(newType.fieldsArray)
    newType.fields = fields
    // clear cached fields
    ;(newType as any)._fieldsById = (newType as any)._fieldsArray = (newType as any)._oneofsArray = null
    Object.values(fields).forEach((f) => {
      const { type } = f
      if (isScalar(type)) return
      f.type = createInputName(type)
      this.handleInputType(type)
    })
  }

  getProto() {
    // TODO: "this.proto.add(new Type('testType'))" here does work!
    return this.proto
  }
}
