// app/api/anak/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { AnakService } from '@/services/anakService';

const anakService = new AnakService();

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const sessionId = req.cookies.get(auth.sessionCookieName)?.value;
    
    if (!sessionId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { session } = await auth.validateSession(sessionId);
    
    if (!session) {
      return Response.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user information from session
    const user = session.user;
    
    // Only allow Bidan and Kader with appropriate posyandu access to add children
    if (user.role !== 'BIDAN' && user.role !== 'KADER') {
      return Response.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const {
      namaAnak,
      jenisKelamin,
      tanggalLahir,
      namaWali,
      teleponWali,
      posyanduId
    } = await req.json();

    // Validate required fields
    if (!namaAnak || !jenisKelamin || !tanggalLahir || !namaWali || !posyanduId) {
      return Response.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      );
    }

    // Check if user has access to the specified posyandu
    if (user.role === 'KADER' && user.posyanduId !== posyanduId) {
      return Response.json(
        { error: 'Unauthorized: Cannot add child to different posyandu' },
        { status: 403 }
      );
    }

    // Create the anak record
    const newAnak = await anakService.createAnak(
      namaAnak,
      jenisKelamin,
      new Date(tanggalLahir),
      namaWali,
      teleponWali || null,
      posyanduId
    );

    return Response.json({
      success: true,
      message: 'Anak berhasil ditambahkan',
      anak: newAnak,
    });
  } catch (error) {
    console.error('Add anak error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const sessionId = req.cookies.get(auth.sessionCookieName)?.value;
    
    if (!sessionId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { session } = await auth.validateSession(sessionId);
    
    if (!session) {
      return Response.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Get user information from session
    const user = session.user;
    
    let anakList;
    
    // Bidan can see all anak in their posyandus, Kader can see anak in their posyandu
    if (user.role === 'BIDAN') {
      // In a real implementation, Bidan might have access to multiple posyandus
      // For now, we'll get all anak (this would need to be adjusted based on actual requirements)
      anakList = []; // Placeholder - would implement actual logic based on bidan's permissions
    } else if (user.role === 'KADER' && user.posyanduId) {
      anakList = await anakService.getAnakByPosyandu(user.posyanduId);
    } else {
      return Response.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    return Response.json({
      success: true,
      anakList,
    });
  } catch (error) {
    console.error('Get anak error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}