import chalk from 'chalk'
import { inspect } from 'util'
import { format as formatTime } from 'date-fns'

type NotificationFunc = (msg: string) => void

export const now = () => formatTime(Date.now(), 'HH:mm:ss.SSS')

export const log: NotificationFunc = (msg) => console.log(`${now()}: ${msg}`)

const defaultInspectOptions = {
  colors: true,
  depth: 3,
}

export const customInspect = (
  data: unknown | unknown[],
  options: string | Record<string, unknown> = {},
  name = 'log',
) => {
  if ('string' === typeof options) {
    name = options
    options = {}
  }
  const d = Array.isArray(data) ? data : [data]
  console.log(
    `=========================================${name}==========================================`,
  )
  d.map((d: unknown) =>
    console.info(
      inspect(d, {
        ...defaultInspectOptions,
        ...(options as Record<string, unknown>),
      }),
    ),
  )
}

const success = chalk.bold.greenBright

const error = chalk.bold.red

const warning = chalk.keyword('orange')

const warnWithLine = chalk.underline.keyword('orange')

export const successTip: NotificationFunc = (message) =>
  log(success(`${message}`))

export const debugTip: NotificationFunc = (message) =>
  log(warning(`${message}`))

export const warnTip: NotificationFunc = (message) =>
  log(warnWithLine(`${message}`))

export const errorTip: NotificationFunc = (message) => log(error(`${message}`))
