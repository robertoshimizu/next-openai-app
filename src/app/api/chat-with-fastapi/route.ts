// ./app/api/chat-with-fastapi/route.ts

import { AIStream, StreamingTextResponse, type AIStreamCallbacksAndOptions } from 'ai'


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

// This function is used to adapt the input array of messages to the format expected by the AI API.
// So it carries all the messages outstanding in the conversation.
// At some point it may exceed the max size of tokens allowed by model.
function adaptObjectsWithMemory(inputArray: InputObject[]): OutputObject {
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

// This function is used to adapt the last message to the format expected by the AI API.
// So it carries only the last message in the conversation.
// It leaves to the python backend to manage the memory of the conversation.
function adaptObjectsNoMemory(inputArray: InputObject[]): Record<string, any> {
  let mostRecentHumanMessage = null;
  for (let i = inputArray.length - 1; i >= 0; i--) {
    if (inputArray[i].role === 'user') {
      mostRecentHumanMessage = { content: inputArray[i].content, type: 'human' };
      break;
    }
  }

  if (!mostRecentHumanMessage) {
    throw new Error('No human (user) type message found in the input array');
  }

  return {
    input: [mostRecentHumanMessage],
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


// Choose between the two options below:
  const payload = adaptObjectsNoMemory(messages)
  //const payload = adaptObjectsWithMemory(messages)

  let fetchResponse: Response;


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

  //const url = 'http://127.0.0.1:8000/openai/stream' // no memory
  const url = 'http://127.0.0.1:8000/openai-with-tools/stream' // with memory and tools


  fetchResponse = await fetch(url, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })

  if (!fetchResponse.ok) {
    throw new Error(
      'HTTP status ' + fetchResponse.status + ' - ' + fetchResponse.statusText
    )
  }

  
  const fetchStream = FetchStream(fetchResponse, {
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
      
  return new StreamingTextResponse(fetchStream)
}
