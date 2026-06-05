'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { partnerships, agents, user as userTable } from '@/lib/db/schema'
import { eq, and, or, ne } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

async function getAgentId() {
  const userId = await getUserId()
  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, userId))
    .limit(1)

  if (!agent.length) {
    throw new Error('Agent profile not found')
  }
  return agent[0].id
}

export async function createPartnershipRequest(data: {
  partnerAgentId: string
  commissionSplit: string
  notes?: string
}) {
  const userId = await getUserId()
  const agentId = await getAgentId()

  // Verify partner agent exists
  const partnerAgent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, data.partnerAgentId))
    .limit(1)

  if (!partnerAgent.length) {
    throw new Error('Partner agent not found')
  }

  if (partnerAgent[0].id === agentId) {
    throw new Error('Cannot create partnership with yourself')
  }

  const partnershipId = crypto.randomUUID()
  const split = parseFloat(data.commissionSplit)

  await db.insert(partnerships).values({
    id: partnershipId,
    agent1Id: agentId,
    agent2Id: data.partnerAgentId,
    status: 'pending',
    commissionSplit: split.toString(),
    notes: data.notes,
  })

  revalidatePath('/partnerships')
  return { success: true, partnershipId }
}

export async function getMyPartnerships() {
  const agentId = await getAgentId()

  return db
    .select({
      id: partnerships.id,
      agent1Id: partnerships.agent1Id,
      agent2Id: partnerships.agent2Id,
      status: partnerships.status,
      commissionSplit: partnerships.commissionSplit,
      notes: partnerships.notes,
      createdAt: partnerships.createdAt,
      partnerName: userTable.name,
      partnerEmail: userTable.email,
    })
    .from(partnerships)
    .innerJoin(
      userTable,
      eq(
        userTable.id,
        partnerships.agent1Id === agentId ? partnerships.agent2Id : partnerships.agent1Id
      )
    )
    .where(
      or(
        eq(partnerships.agent1Id, agentId),
        eq(partnerships.agent2Id, agentId)
      )
    )
}

export async function updatePartnershipStatus(
  partnershipId: string,
  status: 'pending' | 'active' | 'inactive' | 'terminated'
) {
  const userId = await getUserId()
  const agentId = await getAgentId()

  const partnership = await db
    .select()
    .from(partnerships)
    .where(eq(partnerships.id, partnershipId))
    .limit(1)

  if (!partnership.length) {
    throw new Error('Partnership not found')
  }

  if (partnership[0].agent1Id !== agentId && partnership[0].agent2Id !== agentId) {
    throw new Error('Unauthorized')
  }

  await db
    .update(partnerships)
    .set({ status, updatedAt: new Date() })
    .where(eq(partnerships.id, partnershipId))

  revalidatePath('/partnerships')
  return { success: true }
}

export async function getAgentDirectory() {
  const userId = await getUserId()
  const agentId = await getAgentId()

  return db
    .select({
      id: agents.id,
      companyName: agents.companyName,
      phoneNumber: agents.phoneNumber,
      verificationStatus: agents.verificationStatus,
      bio: agents.bio,
      userName: userTable.name,
      userEmail: userTable.email,
    })
    .from(agents)
    .innerJoin(userTable, eq(agents.userId, userTable.id))
    .where(ne(agents.id, agentId))
}
