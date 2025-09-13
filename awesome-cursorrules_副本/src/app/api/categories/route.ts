import { NextResponse } from 'next/server';
import { dbQueries } from '@/lib/database';

export async function GET() {
    try {
        const categories = dbQueries.getCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}