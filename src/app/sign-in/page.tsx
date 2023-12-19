'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { getURL } from '../utils/helpers'
import Logo from '@/components/icons/Logo'
import { useSupabase } from '../supabase-provider'

export default function AuthForm() {
  const { supabase } = useSupabase();

  if (supabase) {
    console.log('Supabase client initialized ...')
  }

  console.log('getURL', getURL())

  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
        <div className="flex justify-center pb-12 ">
          <Logo width="64px" height="64px" />
        </div>
        <div className="flex flex-col space-y-4">
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
    </div>
      </div>
    </div>
    
    // <Auth
    //   supabaseClient={supabase}
    //   view="magic_link"
    //   appearance={{ theme: ThemeSupa }}
    //   theme="dark"
    //   showLinks={false}
    //   providers={[]}
    //   redirectTo="http://localhost:3000/auth/callback"
    // />
  )
}