'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { middlemen } from '@/lib/db/middleman-schema'
import { eq } from 'drizzle-orm'
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

export async function createMiddlemanProfile(data: {
  firstName: string
  lastName: string
  phoneNumber: string
  location: string
  bio?: string
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const existingMiddleman = await db
    .select({ id: middlemen.id })
    .from(middlemen)
    .where(eq(middlemen.email, session.user.email))
    .limit(1)

  if (existingMiddleman.length > 0) {
    throw new Error('Profile already exists')
  }

  const newMiddleman = {
    id: uuidv4(),
    email: session.user.email,
    firstName: data.firstName,
    lastName: data.lastName,
    phoneNumber: data.phoneNumber,
    location: data.location,
    bio: data.bio,
    verificationStatus: 'pending' as const,
  }

  await db.insert(middlemen).values(newMiddleman)
  revalidatePath('/middleman')
  return newMiddleman
}

export async function getMiddlemanProfile() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')

  const middlemanProfile = await db
    .select()
    .from(middlemen)
    .where(eq(middlemen.email, session.user.email))
    .limit(1)

  return middlemanProfile[0] || null
}

export async function updateMiddlemanProfile(data: {
  phoneNumber?: string
  location?: string
  bio?: string
}) {
  const middlemanId = await getMiddlemanId()

  await db
    .update(middlemen)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(middlemen.id, middlemanId))

  revalidatePath('/middleman')
  return { success: true }
}

export async function getMiddlemanStats() {
  const middlemanId = await getMiddlemanId()

  const middlemanData = await db
    .select({
      walletBalance: middlemen.walletBalance,
      totalEarnings: middlemen.totalEarnings,
      dealsCompleted: middlemen.dealsCompleted,
      rating: middlemen.rating,
    })
    .from(middlemen)
    .where(eq(middlemen.id, middlemanId))
    .limit(1)

  return middlemanData[0] || null
}

export async function getMiddlemanDashboardData() {
  const middlemanId = await getMiddlemanId()

  const profile = await db
    .select()
    .from(middlemen)
    .where(eq(middlemen.id, middlemanId))
    .limit(1)

  return profile[0] || null
}
