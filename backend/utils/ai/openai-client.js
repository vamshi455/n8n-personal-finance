const { OpenAI } = require('openai');

class OpenAIClient {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async categorizeTransaction(transaction) {
    const prompt = `
    Categorize this financial transaction and provide insights:
    
    Transaction: ${JSON.stringify(transaction)}
    
    Return JSON with:
    {
      "category": "primary category",
      "subcategory": "specific subcategory", 
      "confidence": 0.95,
      "reasoning": "explanation",
      "merchant": "merchant name if identifiable",
      "tags": ["relevant", "tags"],
      "isRecurring": boolean
    }
    
    Categories: food, transportation, entertainment, utilities, healthcare, shopping, income, other
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI categorization error:', error);
      return {
        category: 'other',
        subcategory: 'unknown',
        confidence: 0.1,
        reasoning: 'AI categorization failed',
        merchant: null,
        tags: [],
        isRecurring: false
      };
    }
  }

  async processNaturalLanguageQuery(query, context = {}) {
    const systemPrompt = `
    You are an AI financial analyst. Convert natural language queries into actionable insights.
    
    Available data context: ${JSON.stringify(context)}
    
    For the user query, provide:
    1. SQL query to fetch relevant data (if needed)
    2. Analysis and insights
    3. Recommendations
    4. Visualization suggestions
    
    Return JSON format with these fields.
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI query processing error:', error);
      throw error;
    }
  }

  async generateInsights(transactionData) {
    const prompt = `
    Analyze this financial data and generate personalized insights:
    
    Data: ${JSON.stringify(transactionData)}
    
    Provide actionable insights about:
    - Spending patterns
    - Potential savings
    - Budget recommendations
    - Unusual activity alerts
    
    Return as JSON array of insight objects.
    `;

    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI insights generation error:', error);
      return { insights: [] };
    }
  }
}

module.exports = OpenAIClient;