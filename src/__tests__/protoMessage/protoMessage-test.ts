import { join } from 'path'
import ProtoMessage, { Messages } from 'src/protoMessage'
import { geteRootProto, getMainProto } from 'src/utils'
import ProtoInputType from 'src/utils/handleInputType'

const DIR = __dirname

describe('get proto messages', () => {
  it(`just message`, async () => tester('just_message', justMessage))
  it(`nested message`, async () => tester('nested_messages', nestedMessage))
  it(`redundancy messages`, async () =>
    tester('redundancy_messages', redundancyMessage))
  it(`import messages`, async () => tester('import_messages', importMessage))
  it(`input messages`, async () => tester('input_messages', inputMessage))
})

async function tester(fileName: string, referee: (messages: Messages) => void) {
  const protoFile = join(DIR, `${fileName}.proto`)
  const root = await geteRootProto(protoFile)
  const mainProto = getMainProto(root)
  const proto = new ProtoInputType(mainProto).getProto()
  const messages = new ProtoMessage(proto).getMessages()
  referee(messages)
}

function findMessage(messages: Messages, messageName:string){
  return messages.find(({ name }) => name === messageName)
}

function justMessage(messages: Messages) {
  expect(messages.length).toBe(1)
  expect(messages[0].name).toBe('JustMessage')
}

function nestedMessage(messages: Messages) {
  expect(messages.length).toBe(5)
  expect(messages[0].name).toBe('TypeA')
}

function redundancyMessage(messages: Messages) {
  expect(messages.length).toBe(3)
  expect(messages[0].name).toBe('Address_Input')
  expect(findMessage(messages,'RedundancyMessage')).toBeFalsy()
}

function importMessage(messages: Messages) {
  expect(messages.length).toBe(3)
  expect(findMessage(messages,'ImportTypeA')).toBeTruthy()
}

function inputMessage(messages: Messages) {
  expect(messages.length).toBe(8)
  expect(findMessage(messages,'UserInfo_Input')).toBeTruthy()
  expect(findMessage(messages,'UserInfo')).toBeTruthy()
  expect(findMessage(messages,'ListParams_Input')).toBeTruthy()
  expect(findMessage(messages,'Address_Input')).toBeTruthy()
  expect(findMessage(messages,'Address')).toBeTruthy()
  expect(findMessage(messages,'SameReference_Input')).toBeTruthy()
  expect(findMessage(messages,'SameReference')).toBeTruthy()

  expect(findMessage(messages,'ListResponse')).toBeTruthy()

  expect(findMessage(messages,'ListParams')).toBeFalsy()
}
