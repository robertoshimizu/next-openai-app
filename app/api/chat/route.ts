// ./app/api/chat/route.ts
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json()

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages
  })

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    onStart: async () => {
      console.log('Stream started')
    },
    onCompletion: async (completion: any) => {
      console.log('Completion completed', completion)
    },
    onFinal: async (completion: any) => {
      console.log('Stream completed', completion)
    },
    onToken: async (token: any) => {
      console.log('Token received', token)
    }
  })
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
