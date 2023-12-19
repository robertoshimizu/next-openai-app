'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/app/types/supabase'
import { getURL } from '../utils/helpers'
import Logo from '@/components/icons/Logo'

export default function AuthForm() {
  const supabase = createClientComponentClient<Database>()

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
        magicLink={true}
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