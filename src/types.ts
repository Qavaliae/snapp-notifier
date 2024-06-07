import { ObjectId } from 'mongodb'

export interface Store {
  _id: ObjectId
  enabled: boolean
  tracker: string,
  cookie: string,
  state?: State
  listeners: Listener[]
}

export type Listener = TelegramListener | MailListener

export interface BaseListener {
  channel: string
  enabled: boolean
}

export interface TelegramListener extends BaseListener {
  channel: 'telegram'
  bot: string
  chatId: string
}

export interface MailListener extends BaseListener {
  channel: 'mail'
  email: string
}

export interface State {
  title: string
  status: string,
  events: {
    title: string,
    date: string
  }[]
}
