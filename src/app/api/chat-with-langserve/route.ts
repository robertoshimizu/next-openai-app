// ./app/api/chat-with-fastapi/route.ts
import OpenAI from 'openai'
import { AIStream, StreamingTextResponse } from 'ai'
import { type AIStreamCallbacksAndOptions } from 'ai';
import { RemoteRunnable } from "langchain/runnables/remote";



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



type AIStreamChunk = {
    content: string;
    additional_kwargs: any;
    type: string;
    example: boolean;
};

function customParser(): (chunk: string) => { completion: string, token: string } | void  {
    // @ts-ignore
    return (chunk: string) => {
        try {
            // Parse the chunk as JSON
            const parsedChunk: AIStreamChunk = JSON.parse(chunk);

            // Check if the chunk is of type 'AIMessageChunk'
            if (parsedChunk.type === 'AIMessageChunk') {
                // Extract the message content
                const messageContent = parsedChunk.content;

                // Return the relevant data for the callbacks
                return messageContent
            }
        } catch (error) {
            console.error('Error parsing chunk:', error);
            // Handle parsing error or invalid chunk format
        }
    };
}

function FetchStream(
  res: Response,
  cb?: AIStreamCallbacksAndOptions,
): ReadableStream {
  //@ts-ignore
  return AIStream(res, customParser(), cb);
}


export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json()

//   Messages:  [
//   { role: 'user', content: 'ola' },
//   { role: 'assistant', content: 'Olá! Como posso ajudar você hoje?' },
//   { role: 'user', content: 'Conte uma piada' }
// ]


  const payload = adaptObjects(messages)



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
    

    // Now using streams

  const chain = new RemoteRunnable({
    url: `http://127.0.0.1:8000/openai/`,
  });
  const fetchResponse = await chain.stream(JSON.stringify(payload));
  let fetchStream:any
  for await (const chunk of fetchResponse) {
      fetchStream = FetchStream(chunk as Response, {
      onStart: async () => {
        console.log('Stream started');
      },
      onCompletion: async completion => {
        console.log('Completion completed', completion);
      },
      onFinal: async completion => {
        console.log('Stream completed', completion);
      },
      onToken: async token => {
        console.log('Token received', token);
      },
    });
  }
  return new StreamingTextResponse(fetchStream)
  
  
      
      
 

  
}
