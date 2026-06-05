'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { deals, properties, agents, commissions, user as userTable } from '@/lib/db/schema'
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

export async function createDeal(data: {
  propertyId: string
  buyingAgentId: string
  buyerName?: string
  renterName?: string
  dealType: 'sale' | 'rent'
  commissionAmount?: string
}) {
  const userId = await getUserId()
  const sellingAgentId = await getAgentId()

  // Verify property ownership
  const property = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, data.propertyId), eq(properties.userId, userId)))
    .limit(1)

  if (!property.length) {
    throw new Error('Property not found or not owned by you')
  }

  // Verify buying agent exists
  const buyingAgent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, data.buyingAgentId))
    .limit(1)

  if (!buyingAgent.length) {
    throw new Error('Buying agent not found')
  }

  const dealId = crypto.randomUUID()
  const commissionAmount = data.commissionAmount
    ? parseFloat(data.commissionAmount)
    : undefined

  await db.insert(deals).values({
    id: dealId,
    propertyId: data.propertyId,
    sellingAgentId,
    buyingAgentId: data.buyingAgentId,
    buyerName: data.buyerName,
    renterName: data.renterName,
    dealType: data.dealType,
    commissionAmount: commissionAmount ? commissionAmount.toString() : null,
    dealStatus: 'pending',
  })

  revalidatePath('/deals')
  return { success: true, dealId }
}

export async function getMyDeals() {
  const userId = await getUserId()
  const agentId = await getAgentId()

  // Get deals where user is either selling or buying agent
  return db
    .select()
    .from(deals)
    .where(or(eq(deals.sellingAgentId, agentId), eq(deals.buyingAgentId, agentId)))
}

export async function getDealById(dealId: string) {
  const userId = await getUserId()

  const deal = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1)

  if (!deal.length) {
    throw new Error('Deal not found')
  }

  const agentId = await getAgentId()
  if (deal[0].sellingAgentId !== agentId && deal[0].buyingAgentId !== agentId) {
    throw new Error('Unauthorized')
  }

  return deal[0]
}

export async function updateDealStatus(
  dealId: string,
  status: 'pending' | 'in_progress' | 'closed' | 'cancelled'
) {
  const userId = await getUserId()
  const agentId = await getAgentId()

  const deal = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1)

  if (!deal.length) {
    throw new Error('Deal not found')
  }

  if (deal[0].sellingAgentId !== agentId && deal[0].buyingAgentId !== agentId) {
    throw new Error('Unauthorized')
  }

  const updates: Record<string, any> = {
    dealStatus: status,
    updatedAt: new Date(),
  }

  if (status === 'closed') {
    updates.closedAt = new Date()
  }

  await db.update(deals).set(updates).where(eq(deals.id, dealId))

  revalidatePath('/deals')
  return { success: true }
}

export async function getAvailableAgents() {
  const userId = await getUserId()

  // Get all agents except current user
  const allAgents = await db
    .select({
      id: agents.id,
      companyName: agents.companyName,
      phoneNumber: agents.phoneNumber,
      verificationStatus: agents.verificationStatus,
      userName: userTable.name,
      userEmail: userTable.email,
    })
    .from(agents)
    .innerJoin(userTable, eq(agents.userId, userTable.id))
    .where(ne(agents.userId, userId))

  return allAgents
}
