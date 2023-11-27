// ./app/api/chat/route.ts
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { AIStream, AIStreamCallbacksAndOptions, AIStreamParser } from 'ai'
import { text } from 'stream/consumers'

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

function parseOStream(): AIStreamParser {
  let previous = ''

  return (data) => {
    const json = JSON.parse(data) as {
      completion: string
      stop: string | null
      stop_reason: string | null
      truncated: boolean
      log_id: string
      model: string
      exception: string | null
    }

    // Anthropic's `completion` field is cumulative unlike OpenAI's
    // deltas. In order to compute the delta, we must slice out the text
    // we previously received.
    const text = json.completion
    const delta = text.slice(previous.length)
    previous = text

    return delta
  }
}
export function OStream(
  res: Response,
  cb?: AIStreamCallbacksAndOptions
): ReadableStream {
  return AIStream(res, parseOStream(), cb)
}

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json()

  // Ask OpenAI for a streaming chat completion given the prompt
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    stream: true,
    messages: messages
  })

  async function postJSON(data: any) {
    try {
      const response = await fetch('http://127.0.0.1:8000/chatcompletion', {
        method: 'POST', // or 'PUT'
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(
          'HTTP status ' + response.status + ' - ' + response.statusText
        )
      }

      console.log('response', response.url)

      //const textResponse = await response.text()

      // It is expected a text response from the server
      //const responseObj = new Response(textResponse)

      //const stream = AIStream(response)

      // Convert the response into a friendly text-stream
      //const stream = OStream(response)
      //console.log('stream', stream)

      console.log(
        '******************************************************************'
      )
      // console.log('Success:', result.body)
      const fastApiStream = OStream(response, {
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
      //console.log('fastApiStream', fastApiStream)
      console.log(
        '******************************************************************'
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }
  const data = [
    {
      role: 'user',
      content: 'What is the meaning of life?'
    }
  ]
  postJSON(data)

  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    onStart: async () => console.log('Starting segunda stream...'),
    // onToken: async (token: string) => console.log('Token:', token),
    onCompletion: async (completion: string) =>
      // console.log('Stream completed!', completion)
      console.log('Segunda stream completed!')
  })
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
