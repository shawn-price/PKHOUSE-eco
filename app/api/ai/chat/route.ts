import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { detectIntent, extractEntities, formatResponse } from '@/lib/ai/nlp';

const SYSTEM_PROMPT = `You are a helpful real estate assistant for the PKHOUSE ECO platform. 
You help users find properties, understand the market, get financing information, and connect with agents.
Be friendly, concise, and helpful. If you don't know something, direct the user to contact an agent.`;

const INTENT_RESPONSES: Record<string, string> = {
  greeting: 'Hello! Welcome to PKHOUSE ECO. How can I help you find your dream property today?',
  search_properties: 'I can help you search for properties! Tell me what you\'re looking for - location, price range, property type, number of bedrooms/bathrooms?',
  ask_about_property: 'To learn more about a specific property, please view it on our platform or contact the listing agent directly.',
  valuation: 'Property valuation depends on many factors like location, size, condition, and market trends. Contact our agents for a professional appraisal.',
  financing: 'We can help connect you with financing options. Speak with our agents about mortgage loans, down payments, and financing solutions.',
  contact_agent: 'I can help connect you with our agents! Tell me what type of property you\'re interested in.',
  general_question: 'Great question! I\'m here to help with real estate information. Please ask away!',
  farewell: 'Thanks for using PKHOUSE ECO! Feel free to reach out anytime. Have a great day!',
  unclear: 'I\'m not sure I understood that. Could you rephrase your question? I can help with property search, valuations, financing, and agent connections.',
};

export async function POST(request: NextRequest) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Detect intent and extract entities
    const intent = detectIntent(message);
    const entities = extractEntities(message);

    // Get response based on intent
    let response = INTENT_RESPONSES[intent] || INTENT_RESPONSES.unclear;
    response = formatResponse(intent, entities, response);

    return NextResponse.json({
      success: true,
      data: {
        message: response,
        intent,
        entities,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
