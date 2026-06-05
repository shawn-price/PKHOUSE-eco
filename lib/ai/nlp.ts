// Simple NLP utilities for intent detection and entity extraction

export type Intent = 
  | 'search_properties'
  | 'ask_about_property'
  | 'valuation'
  | 'financing'
  | 'contact_agent'
  | 'general_question'
  | 'greeting'
  | 'farewell'
  | 'unclear';

const INTENT_KEYWORDS: Record<Intent, string[]> = {
  search_properties: ['search', 'find', 'looking', 'browse', 'show', 'properties', 'homes', 'houses', 'apartments', 'listings'],
  ask_about_property: ['tell', 'about', 'describe', 'details', 'information', 'specs', 'features', 'bedrooms', 'bathrooms'],
  valuation: ['value', 'estimate', 'appraisal', 'worth', 'price', 'cost', 'valuation', 'how much'],
  financing: ['mortgage', 'loan', 'financing', 'payment', 'afford', 'credit', 'interest', 'down payment'],
  contact_agent: ['agent', 'broker', 'realtor', 'contact', 'call', 'email', 'speak', 'talk', 'meet'],
  general_question: ['why', 'what', 'how', 'when', 'where', 'which', 'question', 'explain'],
  greeting: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
  farewell: ['goodbye', 'bye', 'farewell', 'see you', 'take care', 'thanks', 'thank you'],
  unclear: [],
};

export function detectIntent(text: string): Intent {
  const lowerText = text.toLowerCase();
  
  // Check for greetings first
  if (INTENT_KEYWORDS.greeting.some(kw => lowerText.includes(kw))) {
    return 'greeting';
  }
  
  // Check for farewells
  if (INTENT_KEYWORDS.farewell.some(kw => lowerText.includes(kw))) {
    return 'farewell';
  }

  // Check other intents
  const scores: Partial<Record<Intent, number>> = {};

  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (intent === 'greeting' || intent === 'farewell' || intent === 'unclear') continue;
    
    const matchCount = keywords.filter(kw => lowerText.includes(kw)).length;
    if (matchCount > 0) {
      scores[intent as Intent] = matchCount;
    }
  }

  if (Object.keys(scores).length === 0) {
    return INTENT_KEYWORDS.general_question.some(kw => lowerText.includes(kw)) 
      ? 'general_question' 
      : 'unclear';
  }

  const topIntent = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  return topIntent[0] as Intent;
}

export interface Entity {
  type: 'location' | 'price_range' | 'property_type' | 'bed_count' | 'bath_count';
  value: string;
}

export function extractEntities(text: string): Entity[] {
  const entities: Entity[] = [];
  const lowerText = text.toLowerCase();

  // Extract locations (simple - just common US cities/states)
  const locations = ['new york', 'california', 'texas', 'florida', 'los angeles', 'chicago', 'new york city', 'nyc'];
  for (const loc of locations) {
    if (lowerText.includes(loc)) {
      entities.push({ type: 'location', value: loc });
    }
  }

  // Extract price ranges
  const priceMatch = lowerText.match(/(\$[\d,]+)|(\d+k)|(\d+m)/gi);
  if (priceMatch) {
    entities.push({ type: 'price_range', value: priceMatch[0] });
  }

  // Extract property types
  const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'commercial', 'land', 'industrial'];
  for (const type of propertyTypes) {
    if (lowerText.includes(type)) {
      entities.push({ type: 'property_type', value: type });
    }
  }

  // Extract bedroom count
  const bedMatch = lowerText.match(/(\d+)\s*(bed|bedroom|br)/);
  if (bedMatch) {
    entities.push({ type: 'bed_count', value: bedMatch[1] });
  }

  // Extract bathroom count
  const bathMatch = lowerText.match(/(\d+)\s*(bath|bathroom|ba)/);
  if (bathMatch) {
    entities.push({ type: 'bath_count', value: bathMatch[1] });
  }

  return entities;
}

export function formatResponse(intent: Intent, entities: Entity[], baseResponse: string): string {
  let response = baseResponse;

  if (entities.length > 0) {
    const entitySummary = entities.map(e => `${e.type}: ${e.value}`).join(', ');
    response += `\n\nI detected: ${entitySummary}`;
  }

  return response;
}
