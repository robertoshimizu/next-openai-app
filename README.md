# Vercel AI SDK, Next.js, and OpenAI Chat Example

This example shows how to use the [Vercel AI SDK](https://sdk.vercel.ai/docs) with [Next.js](https://nextjs.org/) and [OpenAI](https://openai.com) to create a ChatGPT-like AI-powered streaming chat bot.

## Persist chat in Redis

Tried to create a redis client and a function in `@/lib/actions/redis` to save messages, but it seems that the `OpenAIStream` conclicts with the redis client object.
It seems that using the `kv` library it works. I still do not know why.

## Experimental Stream

Decouple the stream into roles: 0, 1, 2. See documentation. I left it `false`

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init), [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/), or [pnpm](https://pnpm.io) to bootstrap the example:

```bash
npx create-next-app --example https://github.com/vercel/ai/tree/main/examples/next-openai next-openai-app
```

```bash
yarn create next-app --example https://github.com/vercel/ai/tree/main/examples/next-openai next-openai-app
```

```bash
pnpm create next-app --example https://github.com/vercel/ai/tree/main/examples/next-openai next-openai-app
```

To run the example locally you need to:

1. Sign up at [OpenAI's Developer Platform](https://platform.openai.com/signup).
2. Go to [OpenAI's dashboard](https://platform.openai.com/account/api-keys) and create an API KEY.
3. Set the required OpenAI environment variable as the token value as shown [the example env file](./.env.local.example) but in a new file called `.env.local`
4. `pnpm install` to install the required dependencies.
5. `pnpm dev` to launch the development server.

## Learn More

To learn more about OpenAI, Next.js, and the Vercel AI SDK take a look at the following resources:

- [Vercel AI SDK docs](https://sdk.vercel.ai/docs)
- [Vercel AI Playground](https://play.vercel.ai)
- [OpenAI Documentation](https://platform.openai.com/docs) - learn about OpenAI features and API.
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
