// app/api/pengukuran/route.ts
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
    
    // Only Kader and Bidan can record measurements
    if (user.role !== 'BIDAN' && user.role !== 'KADER') {
      return Response.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const {
      anakId,
      beratBadanKg,
      tinggiBadanCm
    } = await req.json();

    // Validate required fields
    if (!anakId || beratBadanKg === undefined || tinggiBadanCm === undefined) {
      return Response.json(
        { error: 'Data pengukuran tidak lengkap' },
        { status: 400 }
      );
    }

    // Check if anak exists and user has access to it
    const anak = await anakService.getAnakById(anakId);
    if (!anak) {
      return Response.json(
        { error: 'Anak tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user has access to the anak's posyandu
    if (user.role === 'KADER' && user.posyanduId !== anak.posyanduId) {
      return Response.json(
        { error: 'Unauthorized: Cannot record measurement for child from different posyandu' },
        { status: 403 }
      );
    }

    // Record the measurement
    const newPengukuran = await anakService.recordPengukuran(
      anakId,
      beratBadanKg,
      tinggiBadanCm,
      user.id // Use the authenticated user's ID
    );

    return Response.json({
      success: true,
      message: 'Pengukuran berhasil dicatat',
      pengukuran: newPengukuran,
    });
  } catch (error) {
    console.error('Record measurement error:', error);
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

    // Get query parameters
    const url = new URL(req.url);
    const anakId = url.searchParams.get('anakId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let pengukuranList;
    
    if (anakId) {
      // Get measurements for a specific anak
      const anak = await anakService.getAnakById(parseInt(anakId));
      if (!anak) {
        return Response.json(
          { error: 'Anak tidak ditemukan' },
          { status: 404 }
        );
      }
      
      // Check if user has access to the anak's posyandu
      const user = session.user;
      if (user.role === 'KADER' && user.posyanduId !== anak.posyanduId) {
        return Response.json(
          { error: 'Unauthorized: Cannot access measurements for child from different posyandu' },
          { status: 403 }
        );
      }
      
      pengukuranList = await anakService.getPengukuranByAnak(parseInt(anakId));
    } else if (startDate && endDate) {
      // Get measurements within a date range
      // This would require additional permission checks based on user role
      const user = session.user;
      if (user.role !== 'BIDAN') {
        return Response.json(
          { error: 'Forbidden: Date range queries only available to Bidan' },
          { status: 403 }
        );
      }
      
      pengukuranList = await anakService.getPengukuranByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      return Response.json(
        { error: 'Parameter tidak lengkap' },
        { status: 400 }
      );
    }

    return Response.json({
      success: true,
      pengukuranList,
    });
  } catch (error) {
    console.error('Get measurements error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}