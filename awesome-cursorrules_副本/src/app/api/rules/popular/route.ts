import { NextResponse } from 'next/server';
import { dbQueries } from '@/lib/database';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '6');
        
        const rules = dbQueries.getPopularRules(limit);
        return NextResponse.json(rules);
    } catch (error) {
        console.error('Failed to fetch popular rules:', error);
        return NextResponse.json(
            { error: 'Failed to fetch popular rules' },
            { status: 500 }
        );
    }
}