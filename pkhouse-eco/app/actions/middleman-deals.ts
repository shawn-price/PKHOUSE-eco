'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { middlemen, middlemanDeals, middlemanMessages } from '@/lib/db/middleman-schema'
import { deals, agents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { headers } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import { revalidatePath } from 'next/cache'

async function getMiddlemanId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  
  const middleman = await db
    .select({ id: middlemen.id })
    .from(middlemen)
    .where(eq(middlemen.email, session.user.email))
    .limit(1)
  
  if (!middleman.length) throw new Error('Middleman profile not found')
  return middleman[0].id
}

export async function createMiddlemanDeal(data: {
  dealId: string
  agentId: string
  propertyId: string
  commissionPercentage: string
}) {
  const middlemanId = await getMiddlemanId()

  const deal = {
    id: uuidv4(),
    middlemanId,
    dealId: data.dealId,
    agentId: data.agentId,
    propertyId: data.propertyId,
    commissionPercentage: data.commissionPercentage,
    dealStatus: 'pending' as const,
  }

  await db.insert(middlemanDeals).values(deal)
  revalidatePath('/middleman/deals')
  return deal
}

export async function getMiddlemanDeals() {
  const middlemanId = await getMiddlemanId()

  return db
    .select({
      middlemanDeal: middlemanDeals,
      deal: deals,
      agent: agents,
    })
    .from(middlemanDeals)
    .leftJoin(deals, eq(middlemanDeals.dealId, deals.id))
    .leftJoin(agents, eq(middlemanDeals.agentId, agents.id))
    .where(eq(middlemanDeals.middlemanId, middlemanId))
    .orderBy(middlemanDeals.createdAt)
}

export async function getDealById(dealId: string) {
  const middlemanId = await getMiddlemanId()

  const deal = await db
    .select({
      middlemanDeal: middlemanDeals,
      deal: deals,
      agent: agents,
    })
    .from(middlemanDeals)
    .leftJoin(deals, eq(middlemanDeals.dealId, deals.id))
    .leftJoin(agents, eq(middlemanDeals.agentId, agents.id))
    .where(
      and(
        eq(middlemanDeals.id, dealId),
        eq(middlemanDeals.middlemanId, middlemanId)
      )
    )
    .limit(1)

  return deal[0] || null
}

export async function sendMessage(dealId: string, content: string, agentId: string) {
  const middlemanId = await getMiddlemanId()

  const message = {
    id: uuidv4(),
    dealId,
    senderId: middlemanId,
    senderType: 'middleman' as const,
    recipientId: agentId,
    content,
    messageStatus: 'sent' as const,
  }

  await db.insert(middlemanMessages).values(message)
  revalidatePath(`/middleman/deals/${dealId}`)
  return message
}

export async function getDealMessages(dealId: string) {
  const middlemanId = await getMiddlemanId()

  // Verify middleman has access to this deal
  const deal = await db
    .select()
    .from(middlemanDeals)
    .where(
      and(
        eq(middlemanDeals.id, dealId),
        eq(middlemanDeals.middlemanId, middlemanId)
      )
    )
    .limit(1)

  if (!deal.length) throw new Error('Deal not found')

  return db
    .select()
    .from(middlemanMessages)
    .where(eq(middlemanMessages.dealId, dealId))
    .orderBy(middlemanMessages.createdAt)
}

export async function updateDealStatus(dealId: string, status: string) {
  const middlemanId = await getMiddlemanId()

  const deal = await db
    .select()
    .from(middlemanDeals)
    .where(
      and(
        eq(middlemanDeals.id, dealId),
        eq(middlemanDeals.middlemanId, middlemanId)
      )
    )
    .limit(1)

  if (!deal.length) throw new Error('Deal not found')

  await db
    .update(middlemanDeals)
    .set({
      dealStatus: status,
      updatedAt: new Date(),
    })
    .where(eq(middlemanDeals.id, dealId))

  revalidatePath('/middleman/deals')
  return { success: true }
}
