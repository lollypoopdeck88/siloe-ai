import { APIGatewayProxyHandler } from 'aws-lambda';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const bedrock = new BedrockRuntimeClient();
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

interface SOAPStudy {
  id: string;
  scripture: string;
  reference: string;
  observation: string;
  application: string;
  prayer: string;
  createdAt: string;
  userId?: string;
}

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const userId = event.requestContext.authorizer?.claims.sub;
    const { passage, reference } = JSON.parse(event.body || '{}');

    // If no passage provided, select one based on user's history
    const selectedPassage = passage || await recommendPassage(userId);

    // Generate SOAP study using Claude
    const study = await generateSOAPStudy(selectedPassage);

    // Save to DynamoDB
    await saveStudy(study, userId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ study }),
    };
  } catch (error) {
    console.error('Error generating study:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to generate study',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

async function recommendPassage(userId?: string): Promise<string> {
  if (userId) {
    // Check user's study history
    const { Items = [] } = await ddb.send(new QueryCommand({
      TableName: process.env.STUDIES_TABLE,
      IndexName: 'UserStudiesIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: 10,
    }));

    // TODO: Implement smart recommendation based on history
    // For now, return a default passage
  }

  // Default recommendations
  const recommendations = [
    'John 3:16-21',
    'Psalm 23',
    'Philippians 4:4-9',
    'Romans 8:28-39',
    'Matthew 5:1-12',
  ];

  return recommendations[Math.floor(Math.random() * recommendations.length)];
}

async function generateSOAPStudy(passage: string): Promise<SOAPStudy> {
  const prompt = `
    Generate a SOAP Bible study for the passage: ${passage}

    Please provide:
    1. Scripture: The full text of the passage
    2. Observation: Key insights and meaning of the passage
    3. Application: How to apply this passage to daily life
    4. Prayer: A prayer related to the passage's teachings

    Format as JSON with these fields: scripture, reference, observation, application, prayer.
    Keep each section concise but meaningful.
  `;

  const response = await bedrock.send(new InvokeModelCommand({
    modelId: 'anthropic.claude-v2',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      prompt,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  }));

  const result = JSON.parse(new TextDecoder().decode(response.body));

  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...result,
  };
}

async function saveStudy(study: SOAPStudy, userId?: string): Promise<void> {
  await ddb.send(new PutCommand({
    TableName: process.env.STUDIES_TABLE,
    Item: {
      ...study,
      userId,
      ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days retention
    },
  }));
}

// Helper function to extract Bible references
function parseBibleReference(reference: string): {
  book: string;
  chapter: number;
  verses: number[];
} {
  // TODO: Implement proper Bible reference parsing
  // This is a placeholder implementation
  const [book, chapterVerse] = reference.split(' ');
  const [chapter, verseRange] = chapterVerse.split(':');
  const [startVerse, endVerse] = verseRange.split('-').map(Number);

  return {
    book,
    chapter: Number(chapter),
    verses: endVerse
      ? Array.from({ length: endVerse - startVerse + 1 }, (_, i) => startVerse + i)
      : [startVerse],
  };
}
