import { readFileSync } from 'fs'
import { join } from 'path'
import { BuiltInParserName } from 'prettier'
import { getProtoInfo, ProtoInfo, formatCode } from 'src/utils'

interface TesterFactoryParams {
  path: string
  inputFileName?: string
  outputFileName?: string
  parser?: BuiltInParserName
  createSourceFunc: (info: ProtoInfo) => string
}

export function testerFactory({
  path,
  inputFileName = 'input.proto',
  outputFileName = 'output.graphql',
  parser = 'graphql',
  createSourceFunc,
}: TesterFactoryParams) {
  return async function tester(foldName: string, debug = false) {
    const testDir = join(path, foldName)
    const protoInfo = await getProtoInfo(join(testDir, inputFileName), '')
    const actual = createSourceFunc(protoInfo)
    const expected = readFileSync(join(testDir, outputFileName), {
      encoding: 'utf8',
    })
    debug && console.info('[actual, expected]', [actual, expected])
    expect(formatFile(actual,parser)).toBe(formatFile(expected,parser))
  }
}

function formatFile(schema: string, parser: BuiltInParserName) {
  const rawContent = schema
    .replace(/\n+/gm, '\n')
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
