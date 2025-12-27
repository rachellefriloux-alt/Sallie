import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const questionId = searchParams.get('id');

    let url = `${API_BASE_URL}/convergence/question`;
    if (questionId) {
      url = `${API_BASE_URL}/convergence/question/${questionId}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to fetch question: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching convergence question:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

