'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { agents } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getAgentProfile() {
  const userId = await getUserId()
  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, userId))
    .limit(1)

  return agent[0] || null
}

export async function createAgentProfile(data: {
  companyName: string
  phoneNumber: string
  licenseNumber?: string
  bio?: string
}) {
  const userId = await getUserId()

  // Check if agent profile already exists
  const existing = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, userId))
    .limit(1)

  if (existing.length > 0) {
    throw new Error('Agent profile already exists')
  }

  const agentId = crypto.randomUUID()

  await db.insert(agents).values({
    id: agentId,
    userId,
    companyName: data.companyName,
    phoneNumber: data.phoneNumber,
    licenseNumber: data.licenseNumber,
    bio: data.bio,
    verificationStatus: 'pending',
  })

  revalidatePath('/')
  return { success: true, agentId }
}

export async function updateAgentProfile(data: {
  companyName?: string
  phoneNumber?: string
  bio?: string
  licenseNumber?: string
}) {
  const userId = await getUserId()

  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, userId))
    .limit(1)

  if (!agent.length) {
    throw new Error('Agent profile not found')
  }

  const updates: Record<string, any> = {}
  if (data.companyName) updates.companyName = data.companyName
  if (data.phoneNumber) updates.phoneNumber = data.phoneNumber
  if (data.bio) updates.bio = data.bio
  if (data.licenseNumber) updates.licenseNumber = data.licenseNumber
  updates.updatedAt = new Date()

  await db
    .update(agents)
    .set(updates)
    .where(eq(agents.id, agent[0].id))

  revalidatePath('/')
  return { success: true }
}
