import fs from 'fs'
import systemPath from 'path'
import { isPlainObject, flow } from 'lodash'
import { ConverterConfig } from './proto'
import { doesPathExist, quitProcess } from '.'
import { warnTip } from './log'

export const PROJECT_PATH = fs.realpathSync(process.cwd())

export const CONFIG_PATH = systemPath.resolve(
  PROJECT_PATH,
  'proto-converter.config.js'
)

export const DEFAULT_REQUEST_PREFIX = 'req'

export const DEFAULT_REQUIRED_KEY = 'required'


export const PRETTIER_CONFIG = {
  proseWrap: 'never',
  singleQuote: true,
  trailingComma: 'es5',
  semi: false,
}

const DEFAULT_CONVERTER_CONFIG = {
  serviceName: '',
  sourcePath: PROJECT_PATH,
  outputPath: PROJECT_PATH,
  plugins: [],
}

const initConfig = (config: ConverterConfig) => {
  const defaultConfigKeys = Object.keys(DEFAULT_CONVERTER_CONFIG)
  defaultConfigKeys.forEach((key) => {
    if (!config[key]) {
      config[key] = defaultConfigKeys[key]
    }
  })
  return config
}

const absolutePath = (path: string) => {
  if (systemPath.isAbsolute(path)) {
    return path
  }
  return systemPath.resolve(PROJECT_PATH, path)
}

const initConfigPath = (config: ConverterConfig) => {
  const keys = ['sourcePath', 'outputPath']
  keys.forEach((key) => {
    config[key] = absolutePath(config[key])
  })
  return config
}

const formatOutputPath = ({
  outputPath,
  serviceName,
  ...config
}: Required<ConverterConfig>) => {
  const formattedPath = serviceName
    ? systemPath.join(outputPath, serviceName)
    : outputPath
  return { ...config, serviceName, outputPath: formattedPath }
}

export const formatProtoPath = ({
  sourcePath,
  protoPath,
  ...config
}: Required<ConverterConfig>) => {
  const p = systemPath.isAbsolute(protoPath)
    ? protoPath
    : systemPath.resolve(sourcePath, protoPath)
  if (!doesPathExist(p)) {
    quitProcess(`"${p}" isn't exist, please check the config`)
  }
  return { ...config, sourcePath, protoPath: p }
}

const formatConfig = flow([
  initConfig,
  initConfigPath,
  formatProtoPath,
  formatOutputPath,
])

export const getServiceName = (() => {
  let serviceName: string
  return (name?: string) => {
    if (serviceName) return serviceName
    if (name) {
      serviceName = name
    }
    return serviceName
  }
})()

export const getConverterConfig = (protoPath: string, serviceName: string) => {
  getServiceName(serviceName)
  const initConfig = { ...DEFAULT_CONVERTER_CONFIG, protoPath, serviceName }
  if (!doesPathExist(CONFIG_PATH)) {
    return initConfig
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tempConfig = require(CONFIG_PATH)
    if (!isPlainObject(tempConfig)) {
      quitProcess('config need to be a object')
    }
    return formatConfig({
      ...tempConfig,
      protoPath,
      serviceName,
    }) as Required<ConverterConfig>
  } catch (error) {
    warnTip(`failed to read config file: ${error}`)
  }
  return initConfig
}
