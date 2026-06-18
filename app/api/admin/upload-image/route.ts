import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

// ─── POST /api/admin/upload-image ────────────────────────────────────────────
// Accepts: multipart/form-data with fields: file, product_id, product_slug, index
// Returns: { success: true, url: string, path: string }
//
// Supabase Storage bucket must exist: "product-images" (public)
// Create it in: Supabase Dashboard → Storage → New Bucket → "product-images" → Public

const BUCKET = 'product-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const productSlug = formData.get('product_slug') as string | null;
    const productId = formData.get('product_id') as string | null;
    const indexStr = formData.get('index') as string | null;
    const imageIndex = indexStr ? parseInt(indexStr, 10) : 0;

    // ── Validate inputs ──
    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
    if (!productSlug || !productId) {
      return NextResponse.json({ error: 'product_slug and product_id are required.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 5MB. Your file: ${(file.size / 1024 / 1024).toFixed(1)}MB` },
        { status: 400 }
      );
    }

    // ── Build storage path ──
    const ext = file.type === 'image/jpeg' ? 'jpg' :
                file.type === 'image/png'  ? 'png' :
                file.type === 'image/webp' ? 'webp' : 'jpg';

    const filename = `${productSlug}-${imageIndex}.${ext}`;
    const storagePath = `products/${filename}`;

    // ── Convert file to ArrayBuffer for upload ──
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // ── Upload to Supabase Storage ──
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,           // overwrite existing
        cacheControl: '2592000', // 30 days
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      // Common error: bucket doesn't exist
      if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
        return NextResponse.json({
          error: `Storage bucket "${BUCKET}" not found. Create it in Supabase Dashboard → Storage → New Bucket → "${BUCKET}" (set to Public).`,
        }, { status: 500 });
      }
      throw uploadError;
    }

    // ── Get public URL ──
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = urlData.publicUrl;

    // ── Update product images array in DB ──
    // Fetch existing images first
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('images')
      .eq('id', productId)
      .single();

    if (!fetchError && product) {
      const currentImages: string[] = product.images ?? [];

      // Replace at index or append
      const newImages = [...currentImages];
      newImages[imageIndex] = publicUrl;

      await supabase
        .from('products')
        .update({ images: newImages })
        .eq('id', productId);
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: storagePath,
      message: `Image uploaded successfully as ${filename}`,
    });

  } catch (err) {
    console.error('Image upload error:', err);
    return NextResponse.json(
      { error: 'Upload failed. Check Supabase Storage is configured.' },
      { status: 500 }
    );
  }
}

// ─── DELETE /api/admin/upload-image ──────────────────────────────────────────
// Body: { product_id, image_url, image_index }
export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();

  try {
    const { product_id, image_url, image_index } = await req.json();

    if (!product_id || !image_url) {
      return NextResponse.json({ error: 'product_id and image_url required.' }, { status: 400 });
    }

    // Extract storage path from URL
    const pathMatch = image_url.match(/product-images\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from(BUCKET).remove([pathMatch[1]]);
    }

    // Remove from product images array
    const { data: product } = await supabase
      .from('products')
      .select('images')
      .eq('id', product_id)
      .single();

    if (product?.images) {
      const newImages = (product.images as string[]).filter(
        (_: string, i: number) => i !== image_index
      );
      await supabase.from('products').update({ images: newImages }).eq('id', product_id);
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error('Image delete error:', err);
    return NextResponse.json({ error: 'Delete failed.' }, { status: 500 });
  }
}
