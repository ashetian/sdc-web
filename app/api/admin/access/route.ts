import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/app/lib/auth";
import connectDB from "@/app/lib/db";
import TeamMember from "@/app/lib/models/TeamMember";
import Member from "@/app/lib/models/Member";
import AdminAccess from "@/app/lib/models/AdminAccess";

// Helper to check Superadmin status
async function isSuperAdmin(userId: string) {
    const teamMember = await TeamMember.findOne({ memberId: userId, isActive: true });
    return teamMember && ['president', 'vice_president'].includes(teamMember.role);
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const payload = await verifyAuth(req);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!await isSuperAdmin(payload.userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const accesses = await AdminAccess.find().populate('memberId', 'fullName email studentNo').sort({ createdAt: -1 });
        return NextResponse.json(accesses);
    } catch (e: any) {
        console.error("API Error:", e);
        return NextResponse.json({ error: "Internal Error: " + (e.message || String(e)) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const payload = await verifyAuth(req);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!await isSuperAdmin(payload.userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { memberId, allowedKeys } = await req.json();

        if (!memberId || !Array.isArray(allowedKeys)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        const access = await AdminAccess.findOneAndUpdate(
            { memberId },
            {
                memberId,
                allowedKeys,
                grantedBy: payload.userId
            },
            { upsert: true, new: true }
        );

        return NextResponse.json(access);
    } catch (e) {
        console.error("Access POST Error:", e);
        return NextResponse.json({ error: "Internal Error: " + (e instanceof Error ? e.message : String(e)) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const payload = await verifyAuth(req);
        if (!payload || !payload.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        if (!await isSuperAdmin(payload.userId)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await AdminAccess.findByIdAndDelete(id);

        return NextResponse.json({ message: "Deleted" });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
