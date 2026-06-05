'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { middlemen, middlemanCommissions, middlemanDeals } from '@/lib/db/middleman-schema'
import { commissions as agentCommissions, deals } from '@/lib/db/schema'
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

export async function calculateMiddlemanCommission(
  dealId: string,
  agentCommissionAmount: string,
  middlemanCommissionPercentage: string
) {
  const middlemanId = await getMiddlemanId()

  const deal = await db
    .select()
    .from(deals)
    .where(eq(deals.id, dealId))
    .limit(1)

  if (!deal.length) throw new Error('Deal not found')

  const agentComm = parseFloat(agentCommissionAmount)
  const percentage = parseFloat(middlemanCommissionPercentage)
  const middlemanComm = (agentComm * percentage) / 100

  const commission = {
    id: uuidv4(),
    middlemanId,
    dealId,
    agentCommission: agentCommissionAmount,
    middlemanCommissionAmount: middlemanComm.toString(),
    escrowAmount: middlemanComm.toString(),
    commissionStatus: 'pending' as const,
    escrowReleaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  }

  await db.insert(middlemanCommissions).values(commission)
  revalidatePath('/middleman/commissions')
  return commission
}

export async function getMiddlemanCommissions() {
  const middlemanId = await getMiddlemanId()

  return db
    .select({
      commission: middlemanCommissions,
      deal: deals,
    })
    .from(middlemanCommissions)
    .leftJoin(deals, eq(middlemanCommissions.dealId, deals.id))
    .where(eq(middlemanCommissions.middlemanId, middlemanId))
    .orderBy(middlemanCommissions.createdAt)
}

export async function getReleaseableCommissions() {
  const middlemanId = await getMiddlemanId()

  const now = new Date()
  return db
    .select()
    .from(middlemanCommissions)
    .where(
      and(
        eq(middlemanCommissions.middlemanId, middlemanId),
        eq(middlemanCommissions.commissionStatus, 'in_escrow'),
        // escrowReleaseDate <= now
      )
    )
}

export async function releaseCommission(commissionId: string) {
  const middlemanId = await getMiddlemanId()

  const commission = await db
    .select()
    .from(middlemanCommissions)
    .where(
      and(
        eq(middlemanCommissions.id, commissionId),
        eq(middlemanCommissions.middlemanId, middlemanId)
      )
    )
    .limit(1)

  if (!commission.length) throw new Error('Commission not found')

  const amount = parseFloat(commission[0].middlemanCommissionAmount)

  // Update middleman wallet balance
  await db
    .update(middlemen)
    .set({
      walletBalance: (
        parseFloat((await db.select({ balance: middlemen.walletBalance }).from(middlemen).where(eq(middlemen.id, middlemanId)).limit(1))[0]?.balance || '0') +
        amount
      ).toString(),
    })
    .where(eq(middlemen.id, middlemanId))

  // Update commission status
  await db
    .update(middlemanCommissions)
    .set({
      commissionStatus: 'released',
      releasedAt: new Date(),
    })
    .where(eq(middlemanCommissions.id, commissionId))

  revalidatePath('/middleman/commissions')
  return { success: true }
}

export async function getCommissionStats() {
  const middlemanId = await getMiddlemanId()

  const commissions = await db
    .select()
    .from(middlemanCommissions)
    .where(eq(middlemanCommissions.middlemanId, middlemanId))

  const pending = commissions
    .filter(c => c.commissionStatus === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.middlemanCommissionAmount), 0)

  const inEscrow = commissions
    .filter(c => c.commissionStatus === 'in_escrow')
    .reduce((sum, c) => sum + parseFloat(c.middlemanCommissionAmount), 0)

  const released = commissions
    .filter(c => c.commissionStatus === 'released')
    .reduce((sum, c) => sum + parseFloat(c.middlemanCommissionAmount), 0)

  return { pending, inEscrow, released }
}
