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

// function adaptObjects(inputArray: InputObject[]): OutputObject {
//   const output = inputArray.map(item => {
//     let type: 'human' | 'ai' | 'system' | 'function';
//     switch (item.role) {
//       case 'user':
//         type = 'human';
//         break;
//       case 'assistant':
//         type = 'ai';
//         break;
//       case 'system':
//         type = 'system';
//         break;
//       case 'function':
//         type = 'function';
//         break;
//       default:
//         throw new Error(`Unknown role: ${item.role}`);
//     }
//     return { content: item.content, type };
//   });

//   return {
//     input: output,
//     config: {},
//     kwargs: {}
//   };
// }
function adaptObjects(inputArray: InputObject[]): Record<string, any> {
  let mostRecentHumanContent = '';
  for (let i = inputArray.length - 1; i >= 0; i--) {
    if (inputArray[i].role === 'user') {
      mostRecentHumanContent = inputArray[i].content;
      break;
    }
  }

  if (mostRecentHumanContent === '') {
    throw new Error('No human (user) type message found in the input array');
  }

  return {
    input: {
      question: mostRecentHumanContent
    },
    config: {
      configurable: {
        report_type: "research_report",
        search_engine: "tavily"
      }
    },
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
  event: string;
  data: string;
};

function customParser(): (chunk: string) => { completion: string, token: string } | void  {
    // @ts-ignore
    return (chunk: string) => {
        const parsedChunk: any = JSON.parse(chunk);
        //console.log('Chunk:', parsedChunk);
        const messageContent = parsedChunk
        return messageContent;
        
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
  let fetchResponse: Response;


    // const payload = {
    //                   "input": {
    //                     "question": "Que é Bono Vox?"
    //                   },
    //                   "config": {
    //                     "configurable": {
    //                       "report_type": "research_report",
    //                       "search_engine": "tavily"
    //                     }
    //                   },
    //                   "kwargs": {}
    //                 }
    

    // Now using streams

  fetchResponse = await fetch('http://127.0.0.1:8000/research-assistant/stream', {
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