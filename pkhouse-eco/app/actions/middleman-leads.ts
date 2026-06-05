'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { middlemen, sourcedLeads, leadPropertyMatches } from '@/lib/db/middleman-schema'
import { properties } from '@/lib/db/schema'
import { eq, and, gte, lte, or } from 'drizzle-orm'
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

export async function createSourcedLead(data: {
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  budget: string
  location: string
  propertyType: string
  moveInDate?: string
  sourceChannel: string
  notes?: string
}) {
  const middlemanId = await getMiddlemanId()

  const newLead = {
    id: uuidv4(),
    middlemanId,
    leadId: uuidv4(),
    buyerName: data.buyerName,
    buyerEmail: data.buyerEmail,
    buyerPhone: data.buyerPhone,
    budget: data.budget,
    location: data.location,
    propertyType: data.propertyType,
    moveInDate: data.moveInDate ? new Date(data.moveInDate) : undefined,
    sourceChannel: data.sourceChannel,
    leadStatus: 'new' as const,
    notes: data.notes,
  }

  await db.insert(sourcedLeads).values(newLead)
  revalidatePath('/middleman/leads')
  return newLead
}

export async function getSourcedLeads() {
  const middlemanId = await getMiddlemanId()

  return db
    .select()
    .from(sourcedLeads)
    .where(eq(sourcedLeads.middlemanId, middlemanId))
    .orderBy(sourcedLeads.createdAt)
}

export async function getSourcedLeadById(leadId: string) {
  const middlemanId = await getMiddlemanId()

  const lead = await db
    .select()
    .from(sourcedLeads)
    .where(and(eq(sourcedLeads.id, leadId), eq(sourcedLeads.middlemanId, middlemanId)))
    .limit(1)

  return lead[0] || null
}

export async function matchPropertyToLead(
  leadId: string,
  propertyId: string,
  agentId: string
) {
  const middlemanId = await getMiddlemanId()

  const lead = await db
    .select()
    .from(sourcedLeads)
    .where(and(eq(sourcedLeads.id, leadId), eq(sourcedLeads.middlemanId, middlemanId)))
    .limit(1)

  if (!lead.length) throw new Error('Lead not found')

  // Calculate match score based on budget, location, property type
  const property = await db
    .select()
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1)

  if (!property.length) throw new Error('Property not found')

  let matchScore = 0
  if (lead[0].propertyType === property[0].propertyType) matchScore += 30
  if (lead[0].location && property[0].city && lead[0].location.toLowerCase() === property[0].city?.toLowerCase())
    matchScore += 40
  if (lead[0].budget && property[0].price) {
    const budgetNum = parseFloat(lead[0].budget)
    const priceNum = parseFloat(property[0].price)
    if (budgetNum >= priceNum * 0.9 && budgetNum <= priceNum * 1.1) matchScore += 30
  }

  const match = {
    id: uuidv4(),
    sourcedLeadId: leadId,
    propertyId,
    agentId,
    matchScore: (matchScore / 100).toString(),
    matchStatus: 'pending' as const,
  }

  await db.insert(leadPropertyMatches).values(match)
  revalidatePath(`/middleman/leads/${leadId}`)
  return match
}

export async function getMatchedProperties(leadId: string) {
  const middlemanId = await getMiddlemanId()

  const lead = await db
    .select()
    .from(sourcedLeads)
    .where(and(eq(sourcedLeads.id, leadId), eq(sourcedLeads.middlemanId, middlemanId)))
    .limit(1)

  if (!lead.length) throw new Error('Lead not found')

  return db
    .select({
      match: leadPropertyMatches,
      property: properties,
    })
    .from(leadPropertyMatches)
    .innerJoin(properties, eq(leadPropertyMatches.propertyId, properties.id))
    .where(eq(leadPropertyMatches.sourcedLeadId, leadId))
}

export async function getAvailablePropertiesForLead(leadId: string) {
  const lead = await getSourcedLeadById(leadId)
  if (!lead) throw new Error('Lead not found')

  const query = db.select().from(properties).where(eq(properties.listingStatus, 'active'))

  // Filter by property type if specified
  if (lead.propertyType) {
    const filtered = await query
    return filtered.filter(p => p.propertyType === lead.propertyType)
  }

  return query
}

export async function updateLeadStatus(leadId: string, status: string) {
  const middlemanId = await getMiddlemanId()

  await db
    .update(sourcedLeads)
    .set({
      leadStatus: status,
      updatedAt: new Date(),
    })
    .where(and(eq(sourcedLeads.id, leadId), eq(sourcedLeads.middlemanId, middlemanId)))

  revalidatePath('/middleman/leads')
  return { success: true }
}
