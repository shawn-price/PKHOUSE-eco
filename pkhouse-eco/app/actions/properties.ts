'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { properties, agents } from '@/lib/db/schema'
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

export async function createProperty(data: {
  title: string
  description?: string
  address: string
  city?: string
  state?: string
  zipCode?: string
  price?: string
  propertyType?: string
  bedrooms?: number
  bathrooms?: number
  squareFeet?: number
}) {
  const userId = await getUserId()
  const agentId = await getAgentId()

  const propertyId = crypto.randomUUID()

  await db.insert(properties).values({
    id: propertyId,
    userId,
    agentId,
    title: data.title,
    description: data.description,
    address: data.address,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    price: data.price ? parseFloat(data.price).toString() : null,
    propertyType: data.propertyType,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    squareFeet: data.squareFeet,
    listingStatus: 'active',
    imageUrls: [],
  })

  revalidatePath('/properties')
  return { success: true, propertyId }
}

export async function getAgentProperties() {
  const userId = await getUserId()

  return db
    .select()
    .from(properties)
    .where(eq(properties.userId, userId))
}

export async function getPropertyById(propertyId: string) {
  const userId = await getUserId()

  const result = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
    .limit(1)

  return result[0] || null
}

export async function updateProperty(
  propertyId: string,
  data: Partial<typeof data>
) {
  const userId = await getUserId()

  const property = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
    .limit(1)

  if (!property.length) {
    throw new Error('Property not found')
  }

  const updates: Record<string, any> = { updatedAt: new Date() }
  Object.keys(data).forEach((key) => {
    if (data[key as keyof typeof data] !== undefined) {
      updates[key] = data[key as keyof typeof data]
    }
  })

  await db.update(properties).set(updates).where(eq(properties.id, propertyId))

  revalidatePath('/properties')
  return { success: true }
}

export async function deleteProperty(propertyId: string) {
  const userId = await getUserId()

  const property = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, userId)))
    .limit(1)

  if (!property.length) {
    throw new Error('Property not found')
  }

  await db.delete(properties).where(eq(properties.id, propertyId))

  revalidatePath('/properties')
  return { success: true }
}
