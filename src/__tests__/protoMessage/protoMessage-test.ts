import { join } from 'path'
import ProtoMessage, { Messages } from '../../protoMessage'
import { geteRootProto, getMainProto } from '../../utils'

const DIR = __dirname

describe('get proto messages', () => {
  it(`just message`, async () => tester('just_message', justMessage))
  it(`nested message`, async () => tester('nested_messages', nestedMessage))
  it(`redundancy messages`, async () => tester('redundancy_messages', redundancyMessage))
  it(`import messages`, async () => tester('import_messages', importMessage))
})

async function tester(fileName: string, referee: (messages: Messages) => void) {
  const protoFile = join(DIR, `${fileName}.proto`)
  const root = await geteRootProto(protoFile)
  const proto = getMainProto(root)
  const messages = new ProtoMessage(proto,root).getMessages()
  referee(messages)
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
  expect(messages[0].name).toBe('Address')
}

function importMessage(messages: Messages) {
  expect(messages.length).toBe(3)
  expect(messages.find(({name})=> name === 'ImportTypeA')).toBeTruthy()
}
