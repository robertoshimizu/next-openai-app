// ./app/api/chat/route.ts
import { kv } from '@vercel/kv'
import OpenAI from 'openai'
import {
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData
} from 'ai'

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json()
  //console.log('req', req)

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages
  })

  // Instantiate the StreamData. It works with all API providers.
  const data = new experimental_StreamData()

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    onFinal: async (completion: any) => {
      console.log('Stream completed', completion)
      console.log('messages', messages)
      // IMPORTANT! you must close StreamData manually or the response will never finish.
      data.close()
      const hsetResponse = await kv.hset(`chat:${Date.now()}`, {
        message: 'Ola World'
      })
      console.log(`HSET response: ${hsetResponse}`)
    },
    // IMPORTANT! until this is stable, you must explicitly opt in to supporting streamData.
    experimental_streamData: false
  })

  // Add a test message to the stream
  // data.append({
  //   text: 'Hello, how are you?'
  // })
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
