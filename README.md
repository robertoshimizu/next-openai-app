# Using fetch

endpoint:
Langserve
`'http://localhost:8000/openai/invoke' `
payload:
```
{
    "input": [
        {
            "content": "que eh Jack Sparrow?",
            "type": "human"
        }
    ],
    "config": {}
}
```
Output: 
```
{
  "output": {
    "content": "Jack Sparrow es un personaje ficticio y el protagonista de la serie de películas de \"Piratas del Caribe\". Es interpretado por el actor Johnny Depp. Sparrow es un carismático y excéntrico pirata, conocido por su estilo de vestir extravagante, su andar peculiar y su ingenio para salir de situaciones peligrosas. A lo largo de las películas, se embarca en diversas aventuras en busca de tesoros y enfrentándose a enemigos como el Capitán Barbossa y Davy Jones.",
    "additional_kwargs": {},
    "type": "ai",
    "example": false
  },
  "callback_events": [],
  "metadata": {
    "run_id": "1ba06d38-a562-480d-aac0-b3fc56e5c740"
  }
}
```

# Models with No Memory

The api `chat-with-fastapi` converses with the `intelli_server` langserve back end.
It deals with the most basic endpoint:

```python
add_routes(
    app,
    ChatOpenAI(),
    path="/openai",
)
```

The `messages` object in the `useChat`, contains all outstanding messages, and it contains memory. However, it consumes too much tokens, and it eventually exceeds the token limit size of the LLM model. 
So, there is a variant, that adatps and sends only the last message, so the python backend then needs to manage it. For that, the end point is `path="/openai-with-tools"`, where we also add functions.

# Requirements


1- Agnostic to LLM Models. 
2- Common interface. Today, the parser is beskpoke to `ChatOpenAI()` output. But it must be common to all, `ChatAnthropic()`, etc
3- It would be nice to receive stream of `intermediate steps` to let customer knowing what is happening

# Comments

Fetch from fastapi is good for basic chat completions. However, when working with langchain's agent-executor or openai chat with functions, it does not stream. Because of the intermediate function call.
It seems that Vercel AI SDK has this feature better resolved, therefore, it has decided to carry on with vercel/typescript.
Potentially we can make an API server, exposing the `api/routes.ts`. Need to test it in postman. And then see how we can add security and a swagger.

Nevertheless, we can add some python serverless functions in next.js/vercel.
https://vercel.com/docs/functions/serverless-functions/runtimes/python