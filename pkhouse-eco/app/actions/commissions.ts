'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { commissions, deals, agents } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
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

export async function getCommissionLedger() {
  const agentId = await getAgentId()

  const ledger = await db
    .select({
      id: commissions.id,
      amount: commissions.amount,
      status: commissions.commissionStatus,
      escrowAmount: commissions.escrowAmount,
      escrowReleaseDate: commissions.escrowReleaseDate,
      notes: commissions.notes,
      createdAt: commissions.createdAt,
      dealId: commissions.dealId,
    })
    .from(commissions)
    .where(eq(commissions.agentId, agentId))

  return ledger
}

export async function createCommissionRecord(data: {
  dealId: string
  amount: string
  escrowAmount?: string
  escrowReleaseDate?: Date
  notes?: string
}) {
  const userId = await getUserId()
  const agentId = await getAgentId()

  // Verify deal exists and user is part of it
  const deal = await db
    .select()
    .from(deals)
    .where(eq(deals.id, data.dealId))
    .limit(1)

  if (!deal.length) {
    throw new Error('Deal not found')
  }

  if (deal[0].sellingAgentId !== agentId && deal[0].buyingAgentId !== agentId) {
    throw new Error('Unauthorized')
  }

  const commissionId = crypto.randomUUID()
  const amount = parseFloat(data.amount)
  const escrowAmount = data.escrowAmount ? parseFloat(data.escrowAmount) : undefined

  await db.insert(commissions).values({
    id: commissionId,
    dealId: data.dealId,
    agentId,
    amount: amount.toString(),
    escrowAmount: escrowAmount ? escrowAmount.toString() : null,
    escrowReleaseDate: data.escrowReleaseDate,
    notes: data.notes,
    commissionStatus: 'pending',
  })

  revalidatePath('/commissions')
  return { success: true, commissionId }
}

export async function updateCommissionStatus(
  commissionId: string,
  status: 'pending' | 'approved' | 'in_escrow' | 'released'
) {
  const userId = await getUserId()
  const agentId = await getAgentId()

  const commission = await db
    .select()
    .from(commissions)
    .where(eq(commissions.id, commissionId))
    .limit(1)

  if (!commission.length) {
    throw new Error('Commission record not found')
  }

  if (commission[0].agentId !== agentId) {
    throw new Error('Unauthorized')
  }

  await db
    .update(commissions)
    .set({ commissionStatus: status, updatedAt: new Date() })
    .where(eq(commissions.id, commissionId))

  revalidatePath('/commissions')
  return { success: true }
}

export async function getTotalCommissions() {
  const agentId = await getAgentId()

  const result = await db
    .select()
    .from(commissions)
    .where(eq(commissions.agentId, agentId))

  const total = result.reduce((sum, c) => sum + parseFloat(c.amount), 0)
  const pending = result
    .filter((c) => c.commissionStatus === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)

  return { total, pending }
}
