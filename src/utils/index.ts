import * as shell from 'shelljs'
import { errorTip, successTip } from './log'
import { format, Options as PrettierOptions } from 'prettier'
import { PROJECT_PATH, PRETTIER_CONFIG } from './config'
import { camelCase, isObject, isString } from 'lodash'
import { LINE_FEED } from './constants'

export * from './config'
export * from './proto'
export * from './log'
export * from './typings'
export * from './constants'

const getPrettierConfig = () => {
  try {
    return JSON.parse(shell.cat(`${PROJECT_PATH}/.prettierrc`))
  } catch (err) {
    return PRETTIER_CONFIG
  }
}

const prettierConfig = getPrettierConfig()

export const quitProcess = (message: string) => {
  errorTip(message)
  process.exit(1)
}

export const doesPathExist = (path: string) => shell.test('-e', path)

export const pathCheck = (path: string) =>
  doesPathExist(path) ||
  quitProcess(`"${path}" isn't exist, please check the path`)

/**
 * @param suffix  the file suffix without "."
 */
export const createFileName = (prefix = 'index', suffix = 'ts') =>
  `${prefix}.${suffix}`

export interface FormatCodeParams {
  source: string
  options?: PrettierOptions
}

export interface CreateFileWithSourceParams extends FormatCodeParams {
  dir: string
  fileName: string
}

export const formatCode = ({
  source,
  options = prettierConfig,
}: FormatCodeParams) => {
  const finalOptions = Object.assign({ parser: 'typescript' }, options)
  try {
    return format(source, finalOptions)
  } catch (e) {
    errorTip(`format file failed: ${e}`)
    return source
  }
}

export const touchFile = (dir: string, fileName: string) => {
  if (!shell.test('-d', dir)) {
    shell.mkdir('-p', dir)
  }
  shell.cd(dir)
  if (!shell.test('-f', fileName)) {
    shell.touch(fileName)
  }
  return `${dir}/${fileName}`
}

export const createFileWithSource = ({
  dir,
  fileName,
  source,
  options,
}: CreateFileWithSourceParams) => {
  const newFile = touchFile(dir, fileName)
  // to() will overwrite any existing content
  shell.ShellString(formatCode({ source, options })).to(newFile)
  successTip(`${newFile} has been created!`)
}

export const createGraphqlMethodName = ({ name, parent }: protobuf.Method) =>
  [parent?.name, name].map(camelCase).join('_')

export const createGqlMethodName = (method: protobuf.Method) =>
  createGraphqlMethodName(method)

export const createTypingMethodName = ({ name }: protobuf.Method) =>
  camelCase(name)

const maybeQueryRegex = /^(get|list)/i
export const maybeQueryMethod = (methodName: string) =>
  maybeQueryRegex.test(methodName)

export const getRequestType = (methodName: string) =>
  maybeQueryMethod(methodName) ? 'query' : 'mutation'

interface AssembleCommentConfig {
  comment: string | null
  label?: string
  inline?: boolean
}

export const assembleComment = (
  commentInfo: string | null | AssembleCommentConfig,
) => {
  const defaultLabel = '//'
  let comment: AssembleCommentConfig['comment'] = ''
  let label: AssembleCommentConfig['label'] = defaultLabel
  let inline: AssembleCommentConfig['inline'] = false
  if (isString(commentInfo)) {
    comment = commentInfo
  }
  if (isObject(commentInfo)) {
    comment = commentInfo.comment
    label = commentInfo.label ?? defaultLabel
    inline = commentInfo.inline
  }
  return comment
    ? `${label}${comment.replace(/\n/g, '')}${inline ? LINE_FEED : ''}`
    : ''
}
