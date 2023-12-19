'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getURL } from '../utils/helpers'
import type { Database } from '@/app/types/supabase';

export default function AuthForm() {
  const supabase = createClientComponentClient<Database>()

  if (supabase) {
    console.log('Supabase client initialized ...')
  }

  return (
    <Auth
        supabaseClient={supabase}
        providers={['google', 'facebook', 'apple']}
        redirectTo={`${getURL()}/auth/callback`}
        magicLink={false}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#404040',
                brandAccent: '#52525b'
              }
            }
          }
        }}
        theme="dark"
      />
  )
}