import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/app/types/supabase';
import AccountForm from './account-form'

export default async function Account() {
  const supabase = createServerComponentClient<Database>({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      <AccountForm session={session} />
    </div>
  )
}