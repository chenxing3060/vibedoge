import { NextResponse } from 'next/server';
import { dbQueries } from '@/lib/database';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const categoryId = searchParams.get('category_id');
        const limit = parseInt(searchParams.get('limit') || '50');
        
        if (!query.trim()) {
            return NextResponse.json([]);
        }
        
        const results = dbQueries.searchRules(query, {
            category_id: categoryId || undefined,
            limit
        });
        
        return NextResponse.json(results);
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search rules' },
            { status: 500 }
        );
    }
}