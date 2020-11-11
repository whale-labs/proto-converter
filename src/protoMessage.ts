import {
  getMethods,
  isScalar,
  lookup,
  isType,
  quitProcess,
} from './utils'
import { isEmpty, isString, values, each, sortBy } from 'lodash'

export interface EnhancedReflectionObject extends protobuf.ReflectionObject {
  isInput?: boolean
}

export type Messages = EnhancedReflectionObject[]

function createNestMessageName({ name, parent }: protobuf.Type) {
  if (isType(parent) && parent?.name) {
    return `${parent.name}_${name}`
  }
  return name
}

export default class ProtoMessage {
  private messages: Messages = []
  private root: protobuf.Root

  constructor(proto: protobuf.Namespace, root: protobuf.Root) {
    this.root = root
    this.findMessage(proto)
  }

  private findMessage(proto: protobuf.Namespace) {
    const methods = getMethods(proto)
    if (isEmpty(methods)) {
      return Object.values(proto.nested ?? {}).forEach((m) =>
        this.addMessage(m),
      )
    }
    // If there has methods, only convert messages to be used by methods
    methods.forEach(({ requestType, responseType }) => {
      this.addMessage(requestType, true)
      this.addMessage(responseType)
    })
  }

  private addMessage(
    nameOrMessage: string | EnhancedReflectionObject,
    isInput = false,
  ) {
    if (isScalar(nameOrMessage)) return

    const msg: EnhancedReflectionObject = isString(nameOrMessage)
      ? this.lookup(nameOrMessage)
      : nameOrMessage
    if (!msg) {
      quitProcess(`can't find ${nameOrMessage} in  all proto file!`)
    }
    // 1. same name in same/different proto file
    // 2. TODO: in case of circular reference
    if (this.hasExisted(msg.name)) return
    msg.isInput = isInput
    this.messages.push(msg)
    this.handleMessagesInFields(msg as protobuf.Type, isInput)
  }

  private handleMessagesInFields(
    // nested type's "fieldsArray" "nestedArray" are undefined
    // when there has fields or nested, is it a bug of protobuf.js?
    { nested, fields }: protobuf.Type,
    isInput = false,
  ) {
    if (isEmpty(fields)) return

    const fieldsWithCustomType = values(fields).filter(
      ({ type }) => !isScalar(type),
    )

    if (isEmpty(fieldsWithCustomType)) return

    // only find nested-types to be used
    const nestedTypes = isEmpty(nested)
      ? null
      : values(nested).filter(({ name }) =>
          fieldsWithCustomType.find(({ type }) => type === name),
        )

    this.handleNestedTypes(fieldsWithCustomType, nestedTypes, isInput)
  }

  private handleNestedTypes(
    fieldsWithCustomType: protobuf.Field[],
    nestedTypes: protobuf.ReflectionObject[] | null,
    isInput = false,
  ) {
    let customTypesInRoot: any[] = []
    const nestedMessages: Map<string, protobuf.Type> = new Map([])

    if (isEmpty(nestedTypes)) {
      customTypesInRoot = fieldsWithCustomType.map(({ type }) =>
        this.lookup(type),
      )
    } else {
      fieldsWithCustomType.forEach((field) => {
        const nestedType = nestedTypes?.find(
          ({ name }) => name === field.type,
        ) as protobuf.Type
        if (nestedType) {
          // change the name of nested type to avoid conflict with type in root
          const newName = createNestMessageName(nestedType)
          // the relationship of field and nestMessage is many-to-one mapping
          // use "set" make it unique automately
          nestedMessages.set(
            field.type,
            Object.assign(nestedType, {
              name: newName,
            }),
          )
          field.type = newName
        } else {
          customTypesInRoot.push(this.lookup(field.type))
        }
      })
    }
    const allNestedTypes = [...nestedMessages.values()].concat(
      customTypesInRoot,
    )
    each(allNestedTypes, (f) => this.addMessage(f, isInput))
  }

  private hasExisted(name: string) {
    return this.messages.find((m) => m.name === name)
  }

  private lookup(path: string) {
    return lookup(path, this.root)
  }

  getMessages() {
    // sort for testing easily
    return sortBy(this.messages,['name'])
  }
}
