'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAgentProfile } from '@/app/actions/agents'
import AgentSetupForm from '@/components/agent-setup-form'

export default async function AgentSetupPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user) {
    redirect('/sign-in')
  }

  const agentProfile = await getAgentProfile()

  if (agentProfile) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Complete Your Agent Profile</h1>
          <p className="text-muted-foreground">
            Set up your agent profile to start listing properties and managing deals.
          </p>
        </div>
        <AgentSetupForm />
      </div>
    </div>
  )
}
