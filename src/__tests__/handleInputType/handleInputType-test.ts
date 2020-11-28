import { join } from 'path'
import ProtoInputType,{createInputName} from 'src/utils/handleInputType'
import { geteRootProto, getMainProto } from 'src/utils'

const DIR = __dirname

describe('hanndle input types', () => {
  it(`all types`, async () => tester('input_messages', inputMessage))
  it('create input name', () => {
    expect(createInputName('TestReq')).toBe('TestReq_Input')
    expect(createInputName('proto.converter.TestReq')).toBe('TestReq_Input')
  })
})

async function tester(
  fileName: string,
  referee: (proto: protobuf.Namespace) => void,
) {
  const protoFile = join(DIR, `${fileName}.proto`)
  const root = await geteRootProto(protoFile)
  const mainProto = getMainProto(root)
  const proto = new ProtoInputType(mainProto).getProto()
  referee(proto)
}

function inputMessage({ nested }: protobuf.Namespace) {
  const types = nested!
  expect(types).toBeTruthy()
  expect(Object.values(types).length).toBe(12)
  expect(types['RpcService']).toBeTruthy()

  expect((types['UserInfo_Input'] as any).fields?.address.type).toBe('Address_Input')
  expect((types['UserInfo_Input'] as any).fields?.imported.type).toBe('ToBeImported_Input')
  expect((types['UserInfo'] as any).fields?.address.type).toBe('Address')
  expect(types['Address_Input']).toBeTruthy()
  expect(types['Address']).toBeTruthy()
  expect(types['SameReference_Input']).toBeTruthy()
  expect(types['SameReference']).toBeTruthy()
  expect(types['ListParams_Input']).toBeTruthy()
  expect(types['ListParams']).toBeTruthy()

  expect(types['ToBeImported_Input']).toBeTruthy()
  expect(types['ToBeImported']).toBeFalsy()

  expect(types['NestedImport_Input']).toBeTruthy()
  expect(types['NestedImport']).toBeFalsy()

  expect(types['ListResponse']).toBeTruthy()
}
