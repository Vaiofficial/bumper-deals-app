import { NextRequest, NextResponse } from 'next/server';
import { getStoredWishlist, saveWishlistItem, removeWishlistItem } from '@/lib/wishlistStorage';
import { extractAsinFromInput, fetchProductByAsin } from '@/lib/asinTracker';

export async function GET() {
  try {
    const items = await getStoredWishlist();
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { urlOrAsin, targetPrice } = body;

    if (!urlOrAsin || !targetPrice) {
      return NextResponse.json({ success: false, error: 'Product URL/ASIN and target price are required' }, { status: 400 });
    }

    const asin = extractAsinFromInput(urlOrAsin);
    if (!asin) {
      return NextResponse.json({ success: false, error: 'Could not detect valid Amazon ASIN or URL' }, { status: 400 });
    }

    const item = await fetchProductByAsin(asin, parseFloat(targetPrice));
    if (!item) {
      return NextResponse.json({ success: false, error: 'Could not fetch product details from Amazon India' }, { status: 404 });
    }

    const updated = await saveWishlistItem(item);
    return NextResponse.json({ success: true, item, items: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }
    const items = await removeWishlistItem(id);
    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
