import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answer } = body;

    if (!answer || typeof answer !== 'string') {
      return NextResponse.json(
        { error: 'Answer text is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/convergence/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to submit answer: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error submitting convergence answer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit answer' },
      { status: 500 }
    );
  }
}

