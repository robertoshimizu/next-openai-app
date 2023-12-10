// ./app/api/chat-with-fastapi/route.ts
import OpenAI from 'openai'
import { AIStream, OpenAIStream, StreamingTextResponse } from 'ai'
import { RemoteRunnable } from "langchain/runnables/remote";

// Create an OpenAI API client (that's edge friendly!)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

type InputObject = {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
};

type OutputObject = {
  input: Array<{ content: string; type: 'human' | 'ai' | 'system' | 'function' }>;
  config: Record<string, unknown>;
  kwargs: Record<string, unknown>;
};

function adaptObjects(inputArray: InputObject[]): OutputObject {
  const output = inputArray.map(item => {
    let type: 'human' | 'ai' | 'system' | 'function';
    switch (item.role) {
      case 'user':
        type = 'human';
        break;
      case 'assistant':
        type = 'ai';
        break;
      case 'system':
        type = 'system';
        break;
      case 'function':
        type = 'function';
        break;
      default:
        throw new Error(`Unknown role: ${item.role}`);
    }
    return { content: item.content, type };
  });

  return {
    input: output,
    config: {},
    kwargs: {}
  };
}

// Example usage
const input = [
  { role: 'user', content: 'ola' },
  { role: 'assistant', content: 'Olá! Como posso ajudar você hoje?' },
  { role: 'user', content: 'Conte uma piada' }
];






export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json()

//   Messages:  [
//   { role: 'user', content: 'ola' },
//   { role: 'assistant', content: 'Olá! Como posso ajudar você hoje?' },
//   { role: 'user', content: 'Conte uma piada' }
// ]

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

    // console.log(adaptObjects(messages));
    // const payload = {
    //                   "input": [
    //                       {
    //                           "content": "que eh Jack Sparrow?",
    //                           "type": "human"
    //                       }
    //                   ],
    //                   "config": {},
    //                   "kwargs": {}
    //                 }
    const payload = adaptObjects(messages)

    const fetchresponse = await fetch('http://127.0.0.1:8000/openai/invoke', {
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
    const textResponse = await fetchresponse.text()

    console.log('textResponse', textResponse)

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

      console.log('result invoke', result)
      // for await (const chunk of result) {
      //   // @ts-ignore
      //   console.log(chunk?.content);
      // }
      
    } catch (error) {
      console.error(error);
    }


  // Convert the response into a friendly text-stream
  const stream = OpenAIStream(response, {
    onStart: async () => {
      console.log('OpenAIStream started')
    },
    onCompletion: async (completion: any) => {
      // console.log('Completion completed', completion)
    },
    onFinal: async (completion: any) => {
      console.log('OpenAIStream completed')
    },
    onToken: async (token: any) => {
      // console.log('Token received', token)
    }
  })
  // Respond with the stream

  

  


  return new StreamingTextResponse(stream)
}
