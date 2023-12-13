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
    output?: string;
    messages?: Array<{
        content?: string;
        type?: string;
        additional_kwargs?: any;
        // Include other fields as necessary
    }>;
};

function customParser(): (chunk: string) => void {
    return (chunk: string) => {
        try {
            const parsedChunk: AIStreamChunk = JSON.parse(chunk);

            // Check if the chunk has a 'messages' array
            if (parsedChunk.messages && parsedChunk.messages.length > 0) {
                parsedChunk.messages.forEach(message => {
                    // Process each message where type is 'ai'
                    if (message.type === 'ai' && message.content !== undefined) {
                        const messageContent = message.content;
                        // Process the messageContent as needed
                        console.log(messageContent);
                        return messageContent; // Example: logging the content
                    }
                });
            }

            // Additional processing for other fields like 'output' can be added here

        } catch (error) {
            console.error('Error parsing chunk:', error);
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



  //const payload = adaptObjects(messages)
  let fetchResponse: Response;


  const payload = {
                    "input": {
                      "input": "Quem é Adam Clayton?",
                      "chat_history": [],
                      "agent_scratchpad": []
                    },
                    "config": {},
                    "kwargs": {}
                  }
    

    // Now using streams

  fetchResponse = await fetch('http://127.0.0.1:8000/openai-functions-agent/stream', {
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
