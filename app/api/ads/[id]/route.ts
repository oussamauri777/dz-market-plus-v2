import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Ad from '@/models/Ad';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserIdFromRequest } from '@/lib/mobile-auth';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await dbConnect();

        const ad = await Ad.findById(id).populate('user', 'name email phone wilaya image').lean();

        if (!ad) {
            return new NextResponse('Ad not found', { status: 404 });
        }

        const favoritesCount = await User.countDocuments({ favorites: id });

        return NextResponse.json({
            ...ad,
            _id: ad._id.toString(),
            user: {
                ...ad.user,
                _id: (ad.user as any)._id.toString(),
            },
            createdAt: ad.createdAt.toISOString(),
            favoritesCount,
        });
    } catch (error) {
        console.error('[AD_GET]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // Validate image count
        if (body.images && body.images.length > 10) {
            return NextResponse.json({ error: 'Trop d\'images (max 10)' }, { status: 400 });
        }

        await dbConnect();

        // Find the ad and check ownership
        const ad = await Ad.findById(id);

        if (!ad) {
            return NextResponse.json({ error: 'Annonce non trouvée' }, { status: 404 });
        }

        // Check if user owns this ad
        if (ad.user.toString() !== userId) {
            return NextResponse.json({ error: 'Vous ne pouvez modifier que vos propres annonces' }, { status: 403 });
        }

        // Update the ad
        const updatedAd = await Ad.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        ).populate('user', 'name email phone wilaya image');

        return NextResponse.json(updatedAd);
    } catch (error) {
        console.error('[AD_PATCH]', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id || getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        // Find the ad and check ownership
        const ad = await Ad.findById(id);

        if (!ad) {
            return NextResponse.json({ error: 'Annonce non trouvée' }, { status: 404 });
        }

        // Check if user owns this ad
        if (ad.user.toString() !== userId) {
            return NextResponse.json({ error: 'Vous ne pouvez supprimer que vos propres annonces' }, { status: 403 });
        }

        // Delete the ad
        await Ad.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Annonce supprimée avec succès' });
    } catch (error) {
        console.error('[AD_DELETE]', error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}
