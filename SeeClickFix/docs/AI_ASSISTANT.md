# SeeClickFix AI Assistant - Security & Usage Guide

## 🛡️ Security Features

### 1. **Strict Scope Restriction**
The AI Assistant is **ONLY** trained for civic infrastructure issues:
- ✅ Potholes, street lights, garbage collection, water leaks
- ✅ Municipal services, department information
- ✅ Reporting process, cost estimates, timelines
- ❌ **NO** general knowledge, homework, coding help
- ❌ **NO** personal, medical, legal, or financial advice
- ❌ **NO** entertainment or off-topic conversations

### 2. **Multi-Layer Input Validation**

#### Pre-Processing Filters:
```typescript
✓ Message length: 3-1000 characters
✓ Type validation: Must be string
✓ Keyword detection: Must contain civic-related terms
✓ Automatic rejection of off-topic queries
```

#### Civic Keywords Whitelist:
```
report, issue, problem, civic, municipal, city, public, pothole, road, 
street, light, garbage, trash, waste, water, leak, drainage, traffic, 
signal, sidewalk, park, repair, maintenance, complaint, department, 
cost, time, estimate, priority, status, update, fix, resolve
```

### 3. **Rate Limiting**
```
Max Requests: 20 per user per hour
Prevents: API abuse, excessive costs
Resets: Automatically after 1 hour
```

### 4. **Response Validation**
- AI responses are checked for civic-relevance
- Off-topic responses trigger automatic blocking
- Fallback messages redirect to civic topics

### 5. **System Prompt Engineering**

#### Admin Prompt:
```
STRICT RULES enforced in system prompt:
- ONLY civic/municipal/infrastructure topics
- NEVER help with non-civic questions
- Professional, actionable guidance only
- 300 word limit for responses
```

#### User Prompt:
```
STRICT RULES enforced in system prompt:
- ONLY civic issue reporting topics
- NEVER help with non-civic questions
- Friendly, encouraging tone
- 200 word limit for responses
```

## 📊 Monitoring & Logging

### What Gets Logged:
```typescript
✓ All user messages (for audit)
✓ Rate limit violations
✓ Blocked off-topic attempts
✓ API errors and failures
✓ Response validation results
```

### Cost Control:
```
Model: gpt-3.5-turbo (cost-effective)
Max Tokens: 300-400 (cost-limited)
Temperature: 0.5 (focused responses)
Context: Last 6 messages only (token-efficient)
```

## 🚨 What Happens with Misuse

### User Asks Off-Topic Question:

1. **Pre-Filter Check** (keyword detection)
   ```
   Question: "Write me a poem about love"
   Result: ❌ BLOCKED - No civic keywords found
   Response: Redirect message to civic topics only
   ```

2. **AI Response Check** (content validation)
   ```
   If AI somehow generates off-topic response:
   Result: ❌ BLOCKED - Response validation failed
   Response: Generic civic-only redirect message
   ```

3. **Rate Limit Trigger**
   ```
   After 20 requests in 1 hour:
   Result: ❌ 429 Rate Limit Exceeded
   Response: "Please try again later"
   ```

## 💡 Proper Usage Examples

### ✅ Good Questions (Will Work):

**For Users:**
```
"How do I report a pothole on Main Street?"
"What information should I include when reporting a broken street light?"
"How long does it typically take to fix a water leak?"
"Which category should I choose for overflowing garbage bins?"
"Can you help me write a clear description for a sidewalk issue?"
```

**For Admins:**
```
"Estimate cost to repair a 2-foot pothole on highway"
"Which department handles traffic signal malfunctions?"
"What priority level for a major water main break?"
"Typical timeline for street light bulb replacement?"
"Resource allocation for drainage cleaning in monsoon season"
```

### ❌ Bad Questions (Will Be Blocked):

```
"Write my homework essay" - BLOCKED (not civic-related)
"What's the capital of France?" - BLOCKED (general knowledge)
"Help me with my Python code" - BLOCKED (coding help)
"Tell me a joke" - BLOCKED (entertainment)
"Give me medical advice" - BLOCKED (medical advice)
"What stocks should I buy?" - BLOCKED (financial advice)
```

## 🔧 Configuration

### Environment Variables Required:
```bash
OPENAI_API_KEY=sk-... # Required for AI functionality
```

### Rate Limit Settings (in code):
```typescript
MAX_REQUESTS_PER_HOUR = 20 // Adjust based on usage
RESET_TIME = 3600000 // 1 hour in milliseconds
```

### Model Configuration:
```typescript
model: 'gpt-3.5-turbo'    // Cost-effective
max_tokens: 300-400        // Limit response length
temperature: 0.5           // Balanced creativity/consistency
top_p: 0.9                 // Slightly restrict randomness
presence_penalty: 0.3      // Discourage repetition
frequency_penalty: 0.3     // Encourage variety
```

## 📈 Best Practices for Administrators

### 1. Monitor Usage:
- Check logs for misuse attempts
- Track rate limit violations
- Review blocked queries

### 2. Update Keywords:
- Add new civic terms as needed
- Keep whitelist updated with local terminology
- Consider multilingual keywords if needed

### 3. Cost Management:
- Monitor OpenAI API usage dashboard
- Adjust rate limits based on budget
- Consider caching common responses

### 4. User Education:
- Display AI capabilities clearly in UI
- Show example questions
- Explain restrictions upfront

## 🎯 Summary

The SeeClickFix AI Assistant is **hardened** against misuse with:
- ✅ Strict scope limitation (civic issues only)
- ✅ Input validation (length, type, relevance)
- ✅ Rate limiting (20/hour per user)
- ✅ Response validation (civic-content check)
- ✅ System prompt engineering (STRICT RULES)
- ✅ Cost controls (token limits, efficient model)

**Result:** Users cannot use it for homework, general chat, or any non-civic purposes. It's locked down specifically for civic infrastructure reporting assistance only.
