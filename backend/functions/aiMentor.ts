import { APIGatewayProxyHandler } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { OpenSearchClient, SearchRequest } from '@aws-sdk/client-opensearch';

const bedrock = new BedrockRuntimeClient();
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);
const opensearch = new OpenSearchClient({});

interface UserNote {
  userId: string;
  studyId: string;
  content: string;
  timestamp: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    const { question, studyId, context } = JSON.parse(event.body || '{}');

    if (!question) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Question is required' }),
      };
    }

    // Get relevant context
    const relevantContext = await getRelevantContext(question, userId, studyId);

    // Generate AI response
    const response = await generateResponse(question, relevantContext);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer: response }),
    };
  } catch (error) {
    console.error('Error in AI mentor:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to process question',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

async function getRelevantContext(
  question: string,
  userId?: string,
  studyId?: string
): Promise<string> {
  const contexts: string[] = [];

  // Get user's notes if available
  if (userId) {
    const userNotes = await getUserNotes(userId, studyId);
    contexts.push(...userNotes.map(note => note.content));
  }

  // Search OpenSearch for relevant biblical context
  const searchResults = await searchBiblicalContext(question);
  contexts.push(...searchResults);

  return contexts.join('\n\n');
}

async function getUserNotes(userId: string, studyId?: string): Promise<UserNote[]> {
  const params = {
    TableName: process.env.NOTES_TABLE,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
    Limit: 5,
  };

  if (studyId) {
    params.KeyConditionExpression += ' AND studyId = :studyId';
    params.ExpressionAttributeValues[':studyId'] = studyId;
  }

  const { Items = [] } = await ddb.send(new QueryCommand(params));
  return Items as UserNote[];
}

async function searchBiblicalContext(question: string): Promise<string[]> {
  const searchRequest: SearchRequest = {
    index: process.env.BIBLICAL_CONTENT_INDEX,
    body: {
      query: {
        multi_match: {
          query: question,
          fields: ['content', 'commentary'],
          fuzziness: 'AUTO',
        },
      },
      size: 3,
    },
  };

  const response = await opensearch.search(searchRequest);
  return response.hits.hits.map(hit => hit._source.content);
}

async function generateResponse(question: string, context: string): Promise<string> {
  const prompt = `
    You are a knowledgeable and compassionate Bible scholar and mentor.
    Using the following context and your biblical knowledge, provide a thoughtful,
    encouraging, and scripturally-based response to the question.

    Context:
    ${context}

    Question: ${question}

    Please provide a response that:
    1. Addresses the question directly
    2. References relevant scripture
    3. Offers practical application
    4. Maintains a supportive and encouraging tone

    Response:
  `;

  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-v2',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt,
      max_tokens: 1000,
      temperature: 0.7,
      top_p: 0.9,
    }),
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));
  return result.completion;
}

// Helper function to format scripture references
function formatScriptureReference(reference: string): string {
  // TODO: Implement proper scripture reference formatting
  return reference.trim();
}

// Helper function to validate biblical content
function isValidBiblicalContent(content: string): boolean {
  // TODO: Implement content validation
  return content.length > 0;
}

// Helper function to sanitize user input
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .slice(0, 1000); // Limit input length
}
