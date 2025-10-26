import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Rate limiting map (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Maximum requests per user per hour
const MAX_REQUESTS_PER_HOUR = 20

// Check if message is related to civic issues
function isCivicRelated(message: string): boolean {
  const civicKeywords = [
    'report', 'issue', 'problem', 'civic', 'municipal', 'city', 'public',
    'pothole', 'road', 'street', 'light', 'garbage', 'trash', 'waste',
    'water', 'leak', 'drainage', 'traffic', 'signal', 'sidewalk', 'park',
    'repair', 'maintenance', 'complaint', 'department', 'cost', 'time',
    'estimate', 'priority', 'status', 'update', 'fix', 'resolve',
    'community', 'neighborhood', 'infrastructure', 'service', 'help'
  ]
  
  const lowerMessage = message.toLowerCase()
  return civicKeywords.some(keyword => lowerMessage.includes(keyword))
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI assistant is not configured. Please contact administrator.' },
        { status: 503 }
      )
    }

    const { message, role, context } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Valid message is required' },
        { status: 400 }
      )
    }

    // Input validation
    if (message.length < 3) {
      return NextResponse.json(
        { error: 'Message is too short. Please provide more details.' },
        { status: 400 }
      )
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: 'Message is too long. Please keep it under 1000 characters.' },
        { status: 400 }
      )
    }

    // Check if message is civic-related
    if (!isCivicRelated(message)) {
      return NextResponse.json({
        answer: "I'm specifically designed to help with civic issue reporting and municipal services. Please ask questions related to:\n\n• Reporting civic problems (potholes, street lights, garbage, etc.)\n• Understanding the reporting process\n• Estimating repair costs and timelines\n• Municipal department information\n• Issue status and updates\n\nFor other topics, please contact general customer support.",
        blocked: true,
        timestamp: new Date().toISOString()
      })
    }

    // Rate limiting
    const userId = session.user.id
    const now = Date.now()
    const userLimit = rateLimitMap.get(userId)

    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= MAX_REQUESTS_PER_HOUR) {
          return NextResponse.json(
            { error: 'Rate limit exceeded. Please try again later.' },
            { status: 429 }
          )
        }
        userLimit.count++
      } else {
        rateLimitMap.set(userId, { count: 1, resetTime: now + 3600000 })
      }
    } else {
      rateLimitMap.set(userId, { count: 1, resetTime: now + 3600000 })
    }

    // Create strongly restricted system prompt
    const systemPrompt = role === 'admin' 
      ? `You are SeeClickFix AI Assistant - a specialized AI ONLY for helping municipal administrators manage civic infrastructure issues.

STRICT RULES - YOU MUST FOLLOW THESE:
1. ONLY answer questions about civic issues, municipal services, infrastructure problems, and public works
2. NEVER help with: homework, essays, coding, general knowledge, entertainment, or any non-civic topics
3. NEVER provide personal advice, medical advice, legal advice, or financial advice
4. If asked about non-civic topics, politely redirect to civic issues ONLY
5. Keep responses under 300 words, professional, and actionable

YOUR CAPABILITIES (CIVIC ONLY):
✓ Estimate repair costs and timelines for civic problems (roads, lights, water, etc.)
✓ Suggest appropriate municipal departments for issue handling
✓ Recommend priority levels based on infrastructure severity
✓ Provide insights on resource allocation for public works
✓ Help analyze patterns in civic issue reports
✓ Guide on administrative workflows for civic complaints

RESPONSE FORMAT:
- Start with acknowledging the civic issue/question
- Provide specific, practical administrative guidance
- Include cost/time estimates when relevant
- Suggest department assignments when appropriate
- End with actionable next steps

Remember: You serve municipal administrators managing public infrastructure ONLY.`
      
      : `You are SeeClickFix AI Assistant - a specialized AI ONLY for helping citizens report civic infrastructure issues effectively.

STRICT RULES - YOU MUST FOLLOW THESE:
1. ONLY answer questions about reporting civic issues, municipal services, and public infrastructure
2. NEVER help with: homework, essays, coding, general knowledge, entertainment, or any non-civic topics
3. NEVER provide personal advice, medical advice, legal advice, or financial advice
4. If asked about non-civic topics, politely say "I only help with civic issue reporting" and redirect
5. Keep responses under 200 words, friendly, and encouraging

YOUR CAPABILITIES (CIVIC ONLY):
✓ Guide on writing clear civic issue reports (potholes, lights, garbage, water leaks, etc.)
✓ Explain the municipal reporting process and timelines
✓ Suggest appropriate problem categories for different issues
✓ Provide tips for documenting issues with photos
✓ Answer questions about municipal services and departments
✓ Help understand report status and follow-up procedures

RESPONSE FORMAT:
- Start with validating their concern about civic infrastructure
- Provide specific, practical reporting guidance
- Include tips for effective documentation when relevant
- Set realistic expectations about resolution timelines
- End with encouraging action steps

Remember: You help citizens report PUBLIC INFRASTRUCTURE problems ONLY. Potholes, street lights, garbage, water issues, roads, parks, public facilities - these are your domain.`

    // Prepare conversation context with limits
    const maxContextMessages = 6 // Last 3 exchanges only
    const limitedContext = (context || []).slice(-maxContextMessages)
    
    const messages = [
      { role: 'system', content: systemPrompt },
      ...limitedContext.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as any,
        max_tokens: role === 'admin' ? 400 : 300,
        temperature: 0.5, // Lower for more consistent, focused responses
        presence_penalty: 0.3, // Discourage repetition
        frequency_penalty: 0.3, // Encourage variety in word choice
        top_p: 0.9, // Slightly restrict randomness
      })

      const answer = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try asking about civic issues like potholes, street lights, or garbage collection.'

      // Validate AI response is civic-related
      if (!isCivicRelated(answer) && !answer.includes('civic') && !answer.includes('infrastructure')) {
        return NextResponse.json({
          answer: "I can only assist with civic infrastructure issues and municipal services. Please ask about reporting problems like potholes, street lights, water leaks, garbage collection, or other public infrastructure concerns.",
          blocked: true,
          timestamp: new Date().toISOString()
        })
      }

      // For admin users, also provide structured suggestions
      let suggestions = null
      let estimatedCost = null
      let estimatedTime = null

      if (role === 'admin' && message.toLowerCase().includes('estimate') || message.toLowerCase().includes('cost') || message.toLowerCase().includes('time')) {
        // Generate mock estimates based on common civic issues
        const issueType = detectIssueType(message)
        const estimates = generateEstimates(issueType)
        
        estimatedCost = estimates.cost
        estimatedTime = estimates.time
        suggestions = estimates.suggestions
      }

      return NextResponse.json({
        answer,
        suggestions,
        estimatedCost,
        estimatedTime,
        timestamp: new Date().toISOString()
      })

    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError)
      
      // Fallback response if OpenAI fails
      const fallbackResponse = generateFallbackResponse(message, role)
      
      return NextResponse.json({
        answer: fallbackResponse,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error: any) {
    console.error('AI assistant error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function detectIssueType(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('pothole') || lowerMessage.includes('road')) return 'pothole'
  if (lowerMessage.includes('water') || lowerMessage.includes('leak')) return 'water-leak'
  if (lowerMessage.includes('garbage') || lowerMessage.includes('trash')) return 'garbage-collection'
  if (lowerMessage.includes('light') || lowerMessage.includes('street light')) return 'street-light'
  if (lowerMessage.includes('traffic') || lowerMessage.includes('signal')) return 'traffic-signal'
  if (lowerMessage.includes('drainage') || lowerMessage.includes('drain')) return 'drainage'
  
  return 'other'
}

function generateEstimates(issueType: string) {
  const estimates: any = {
    'pothole': {
      cost: '$150-500',
      time: '2-7 days',
      suggestions: [
        'Contact Public Works Department',
        'Priority: Medium to High depending on traffic volume',
        'Required: Road crew with asphalt and equipment'
      ]
    },
    'water-leak': {
      cost: '$200-1500',
      time: '1-3 days',
      suggestions: [
        'Contact Water Department immediately',
        'Priority: High (potential water waste)',
        'Required: Plumber and excavation equipment if needed'
      ]
    },
    'garbage-collection': {
      cost: '$50-200',
      time: '1-2 days',
      suggestions: [
        'Contact Waste Management Department',
        'Priority: Medium',
        'Required: Collection truck and crew'
      ]
    },
    'street-light': {
      cost: '$100-300',
      time: '1-5 days',
      suggestions: [
        'Contact Public Works or Utilities Department',
        'Priority: Medium to High for safety',
        'Required: Electrician and lift equipment'
      ]
    },
    'traffic-signal': {
      cost: '$500-2000',
      time: '1-3 days',
      suggestions: [
        'Contact Traffic Department immediately',
        'Priority: Urgent (safety issue)',
        'Required: Traffic technician and specialized equipment'
      ]
    },
    'drainage': {
      cost: '$300-800',
      time: '2-5 days',
      suggestions: [
        'Contact Public Works Department',
        'Priority: Medium to High during rainy season',
        'Required: Cleaning crew and specialized equipment'
      ]
    },
    'other': {
      cost: '$100-500',
      time: '1-7 days',
      suggestions: [
        'Assess appropriate department based on issue type',
        'Priority: To be determined after evaluation',
        'Required: Investigation and appropriate crew'
      ]
    }
  }

  return estimates[issueType] || estimates['other']
}

function generateFallbackResponse(message: string, role: string): string {
  if (role === 'admin') {
    return `I understand you're asking about "${message}". As an admin, I recommend reviewing the issue details, assigning it to the appropriate department, and setting a realistic timeline. If you need specific cost estimates or department suggestions, please provide more details about the issue type and location.`
  } else {
    return `Thank you for your question about "${message}". For the best assistance with civic issues, please provide specific details about the problem including location, type of issue, and any relevant photos. This helps ensure your report gets proper attention from the right department.`
  }
}