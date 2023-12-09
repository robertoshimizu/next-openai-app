// ./app/api/chat-with-fastapi/route.ts
import OpenAI from 'openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { RemoteRunnable } from "langchain/runnables/remote";

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
  // console.log(
  //   '******************************************************************'
  // )
  // console.log('response', response)
  // console.log(
  //   '******************************************************************'
  // )

  try {
    const payload = {
                      "input": {
                        "topic": "Snow White"
                      },
                      "config": {},
                      "kwargs": {}
                    }

    const fetchresponse = await fetch('http://127.0.0.1:8000/joke/stream', {
      method: 'POST', // or 'PUT'
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!fetchresponse.ok) {
      throw new Error(
        'HTTP status ' + fetchresponse.status + ' - ' + fetchresponse.statusText
      )
    }

    // console.log('response', fetchresponse.json())
    // console.log(
    //     '******************************************************************'
    //   )
      //const textResponse = await response.text()

      // It is expected a text response from the server
      //const responseObj = new Response(textResponse)

      //const stream = AIStream(response)

      // Convert the response into a friendly text-stream
      //const stream = OStream(response)
      //console.log('stream', stream)
  
    } catch (err) {
      console.error(err)
    }

    try {
      const chain = new RemoteRunnable({
        url: `http://127.0.0.1:8000/joke/`,
      });
      const result = await chain.invoke({
        topic: "cats",
      });

      console.log('result Runnable', result)
      
    } catch (error) {
      console.error(error);
    }


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
      // console.log('Token received', token)
    }
  })
  // Respond with the stream
  return new StreamingTextResponse(stream)
}
