import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import Member from "@/app/lib/models/Member";
import AdminAccess from "@/app/lib/models/AdminAccess";

// This route should ONLY be accessible via Basic Auth (enforced by middleware)
// But middleware ensures 'Authorization' header is valid for /api/superadmin/* path 

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { studentNo } = await req.json();

        if (!studentNo) {
            return NextResponse.json({ error: "Öğrenci numarası gerekli" }, { status: 400 });
        }

        const member = await Member.findOne({ studentNo });
        if (!member) {
            return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
        }

        // Grant ALL permissions
        await AdminAccess.findOneAndUpdate(
            { memberId: member._id },
            {
                memberId: member._id,
                allowedKeys: ['ALL']
                // grantedBy is left null or system default for emergency
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ message: `${member.fullName} (${studentNo}) artık tam yetkili.` });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "İşlem başarısız" }, { status: 500 });
    }
}
