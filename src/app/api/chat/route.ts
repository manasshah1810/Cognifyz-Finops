import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client securely on the server
const getAnthropicClient = () => {
    if (!process.env.VITE_ANTHROPIC_API_KEY) {
        throw new Error('VITE_ANTHROPIC_API_KEY is missing from environment variables');
    }
    return new Anthropic({
        apiKey: process.env.VITE_ANTHROPIC_API_KEY.trim(),
    });
};

export async function POST(req: NextRequest) {
    try {
        const { messages, model = "claude-sonnet-4-6", system, max_tokens = 1024 } = await req.json();

        const anthropic = getAnthropicClient();

        // Anthropic messages must alternate between 'user' and 'assistant'
        // and cannot start with anything other than 'user' (unless it's a refill).
        // The system prompt is a top-level parameter.
        const anthropicMessages = messages
            .filter((m: any) => m.role === 'user' || m.role === 'assistant')
            .map((m: any) => ({
                role: m.role as 'user' | 'assistant',
                content: m.content
            }));

        const response = await anthropic.messages.create({
            model: model,
            max_tokens: max_tokens,
            system: system || messages.find((m: any) => m.role === 'system')?.content || undefined,
            messages: anthropicMessages,
        });

        // Convert the response to the compatible format the frontend expects (OpenAI-like)
        return NextResponse.json({
            choices: [
                {
                    message: {
                        role: 'assistant',
                        content: response.content[0].type === 'text' ? response.content[0].text : 'Unable to parse response',
                    },
                },
            ],
        });

    } catch (error: any) {
        console.error(' Anthropic SDK Error:', error);

        // Handle specific Anthropic errors
        const status = error.status || 500;
        const message = error.message || 'An unexpected error occurred';

        return NextResponse.json(
            { error: message, type: error.type || 'internal_error' },
            { status: status }
        );
    }
}
