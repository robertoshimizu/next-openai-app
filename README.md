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


### Database Schema

#### Profile

```
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  gender text,
  avatar_url text,
  website text,
  email text,
  telephone text,
  country text,
  birthdate timestamp,
  personal_id text,
  cpf text,
  customer_segment text,
  specialty text,


  constraint username_length check (char_length(username) >= 3)
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles
  enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, 
                               full_name,
                               gender,
                               avatar_url,
                               website,
                               email,
                               telephone,
                               country,
                               birthdate,
                               personal_id,
                               cpf,
                               customer_segment,
                               specialty
                               )
  values (new.id, 
          new.raw_user_meta_data->>'full_name', 
          new.raw_user_meta_data->>'gender',
          new.raw_user_meta_data->>'avatar_url',
          new.raw_user_meta_data->>'website',
          new.raw_user_meta_data->>'email',
          new.raw_user_meta_data->>'telephone',
          new.raw_user_meta_data->>'country',
          new.raw_user_meta_data->>'birthdate',
          new.raw_user_meta_data->>'personal_id',
          new.raw_user_meta_data->>'cpf',
          new.raw_user_meta_data->>'customer_segment',
          new.raw_user_meta_data->>'specialty');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up Storage!
insert into storage.buckets (id, name)
  values ('avatars', 'avatars');

-- Set up access controls for storage.
-- See https://supabase.com/docs/guides/storage#policy-examples for more details.
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'avatars');
```