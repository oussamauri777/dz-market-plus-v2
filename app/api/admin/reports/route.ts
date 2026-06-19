import { NextResponse } from 'next/server';
import { requireAdmin, createAdminResponse } from '@/lib/adminAuth';
import dbConnect from '@/lib/db';
import Report from '@/models/Report';
import User from '@/models/User';
import Ad from '@/models/Ad';
import Review from '@/models/Review';

export async function GET(req: Request) {
    try {
        await requireAdmin(req);
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;
        const status = searchParams.get('status');

        const filter: any = {};
        if (status) filter.status = status;

        // We need to populate the target based on targetType
        // Since we can't easily do dynamic population with simple find in one go if types differ widely,
        // we'll rely on the refPath in the schema if it works, or just fetch and populate manually.
        // Mongoose refPath should work if the model names match the enum values (capitalized).
        // Our enum is lowercase 'ad', 'user', 'review'. Models are 'Ad', 'User', 'Review'.
        // We might need to adjust the data or schema.
        // For now, let's try to populate and see. If it fails, we might need to fix the schema or data.

        const reports = await Report.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('reporter', 'name email image');

        // Manually populate targets for now to be safe
        const populatedReports = await Promise.all(reports.map(async (report) => {
            let target = null;
            if (report.targetType === 'ad') {
                target = await Ad.findById(report.targetId).select('title images');
            } else if (report.targetType === 'user') {
                target = await User.findById(report.targetId).select('name email image');
            } else if (report.targetType === 'review') {
                target = await Review.findById(report.targetId).populate('ad', 'title');
            }

            return {
                ...report.toObject(),
                target
            };
        }));

        const total = await Report.countDocuments(filter);

        return NextResponse.json({
            reports: populatedReports,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                page,
                limit
            }
        });
    } catch (error) {
        console.error('[ADMIN_REPORTS_GET]', error);
        return createAdminResponse(error);
    }
}

export async function PATCH(req: Request) {
    try {
        await requireAdmin(req);
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const { status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: 'Report ID and status required' }, { status: 400 });
        }

        const report = await Report.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        return NextResponse.json(report);
    } catch (error) {
        console.error('[ADMIN_REPORTS_PATCH]', error);
        return createAdminResponse(error);
    }
}
