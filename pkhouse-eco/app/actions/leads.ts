'use server'

import { db } from '@/lib/db'
import { leads } from '@/lib/db/consumer-schema'
import { v4 as uuidv4 } from 'uuid'

export interface LeadData {
  propertyId: string
  email: string
  phone?: string
  firstName?: string
  lastName?: string
  interestLevel?: 'interested' | 'very_interested' | 'serious'
  message?: string
  contactPreference?: 'email' | 'phone' | 'both'
}

export async function createLead(data: LeadData) {
  try {
    const leadId = uuidv4()
    
    const result = await db.insert(leads).values({
      id: leadId,
      propertyId: data.propertyId,
      email: data.email,
      phone: data.phone,
      firstName: data.firstName,
      lastName: data.lastName,
      interestLevel: data.interestLevel || 'interested',
      message: data.message,
      contactPreference: data.contactPreference || 'email',
      leadStatus: 'new',
    })

    return { success: true, leadId }
  } catch (error) {
    console.error('Error creating lead:', error)
    return { success: false, error: 'Failed to capture lead' }
  }
}

export async function getPropertyLeads(propertyId: string) {
  try {
    const result = await db
      .select()
      .from(leads)
      .where((lead: any) => lead.propertyId === propertyId)

    return result
  } catch (error) {
    console.error('Error fetching leads:', error)
    return []
  }
}
