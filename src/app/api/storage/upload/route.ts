import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyFirebaseSession } from '@/lib/firebase-admin';
import { createAdminClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized. No session cookie found.' }, { status: 401 });
    }

    try {
      await verifyFirebaseSession(sessionCookie);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const supabase = createAdminClient();
    const bucketName = 'business-logos';

    // Generate a unique filename using timestamp and safe characters
    const fileExtension = file.name.split('.').pop() || 'png';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, buffer, {
        contentType: file.type,
        duplex: 'half',
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return NextResponse.json({ error: 'Failed to upload image to Storage' }, { status: 500 });
    }

    // Retrieve public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error('API /storage/upload error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
