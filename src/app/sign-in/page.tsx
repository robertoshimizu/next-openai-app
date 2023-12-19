'use client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { getURL } from '../utils/helpers'
import Logo from '@/components/icons/Logo'
import { useSupabase } from '../supabase-provider'
import AuthForm from './auth-form'

export default function LoginPage() {
  return (
    <div className="flex justify-center height-screen-helper">
      <div className="flex flex-col justify-between max-w-lg p-3 m-auto w-80 ">
        <div className="flex justify-center pb-12 ">
          <Logo width="64px" height="64px" />
        </div>
        <div className="flex flex-col space-y-4">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}