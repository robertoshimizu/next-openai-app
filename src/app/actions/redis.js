'use server'

import { client } from '@/lib/db'

export async function saveChat(completion) {
  // create a chat id
  const id = Math.floor(Math.random() * 100000)

  // save new hash for the chat
  await client.hSet(`chat:${id}`, {
    completion
  })
}
