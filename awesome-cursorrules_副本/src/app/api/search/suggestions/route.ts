import { NextResponse } from 'next/server';
import { dbQueries } from '@/lib/database';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const limit = parseInt(searchParams.get('limit') || '5');
        
        if (query.trim().length < 2) {
            return NextResponse.json([]);
        }
        
        const suggestions = dbQueries.getSearchSuggestions(query, limit);
        
        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Search suggestions API error:', error);
        return NextResponse.json(
            { error: 'Failed to get search suggestions' },
            { status: 500 }
        );
    }
}