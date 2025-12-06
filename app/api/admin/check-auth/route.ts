import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "../../../lib/auth";
import connectDB from "@/app/lib/db";
import TeamMember from "@/app/lib/models/TeamMember";
import AdminAccess from "@/app/lib/models/AdminAccess";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const payload = await verifyAuth(req);
        if (!payload || !payload.userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check for individual permissions in AdminAccess table for this Member
        // payload.userId corresponds to the Member ID (User ID)
        const accessRule = await AdminAccess.findOne({
            memberId: payload.userId
        });

        // Find the TeamMember linked to this user (optional)
        const teamMember = await TeamMember.findOne({ memberId: payload.userId, isActive: true })
            .populate("departmentId");

        let isSuperAdmin = false;
        let allowedKeys: string[] = [];
        let role = null;
        let department = null;
        let name = payload.nickname || '';

        // Case 1: Is President/VP (Automatic Superadmin)
        if (teamMember && ['president', 'vice_president'].includes(teamMember.role)) {
            isSuperAdmin = true;
            allowedKeys = ['ALL'];
            role = teamMember.role;
            department = teamMember.departmentId;
            name = teamMember.name;
        }
        // Case 2: Has Explicit AdminAccess (e.g. Granted via Superadmin Panel or Emergency)
        else if (accessRule) {
            allowedKeys = accessRule.allowedKeys;
            // If they have 'ALL' key, consider them effectively a superadmin for UI purposes
            if (allowedKeys.includes('ALL')) {
                isSuperAdmin = true;
            }
            if (teamMember) {
                role = teamMember.role;
                department = teamMember.departmentId;
                name = teamMember.name;
            }
        }
        // Case 3: No Access
        else {
            return NextResponse.json({
                error: "Access Denied",
                isSuperAdmin: false,
                role: teamMember?.role || null,
                allowedKeys: []
            }, { status: 403 });
        }

        return NextResponse.json({
            isSuperAdmin,
            role,
            department,
            allowedKeys,
            name
        });

    } catch (error) {
        console.error("Auth check error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
