import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST() {
  try {
    const response = await fetch(`${API_BASE_URL}/convergence/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Failed to start convergence: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error starting convergence:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start convergence' },
      { status: 500 }
    );
  }
}

