import { readFileSync } from 'fs'
import { join } from 'path'
import { BuiltInParserName } from 'prettier'
import {
  getProtoInfo,
  ProtoInfo,
  formatCode,
  LINE_FEED,
  customInspect,
} from 'src/utils'

interface TesterFactoryParams {
  path: string
  inputFileName?: string
  outputFileName?: string
  parser?: BuiltInParserName
  serviceName?: string
  createSourceFunc: (info: ProtoInfo) => string
}

export function testerFactory({
  path,
  inputFileName = 'input.proto',
  outputFileName = 'output.graphql',
  parser = 'graphql',
  serviceName = '',
  createSourceFunc,
}: TesterFactoryParams) {
  return async function tester(foldName: string, debug = false) {
    const testDir = join(path, foldName)
    const protoInfo = await getProtoInfo(
      join(testDir, inputFileName),
      serviceName,
    )
    const actual = createSourceFunc(protoInfo)
    const expected = readFileSync(join(testDir, outputFileName), {
      encoding: 'utf8',
    })
    if (debug) {
      customInspect(protoInfo, 'protoInfo')
    }
    expect(formatFile(actual, parser)).toBe(formatFile(expected, parser))
  }
}

function formatFile(schema: string, parser: BuiltInParserName) {
  const rawContent = schema
    .replace(/\n+/gm, LINE_FEED)
    .replace(/^[ ]+/gm, '  ')
    .replace(/[\n ]+$/gm, '')
    .replace(/[ ]+\n/gm, '')
  return formatCode({
    source: rawContent,
    options: {
      parser,
    },
  })
}
