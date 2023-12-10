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