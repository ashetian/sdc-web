import { NextRequest, NextResponse } from 'next/server';
// Force rebuild
import connectDB from '@/app/lib/db';
import InventoryItem from '@/app/lib/models/InventoryItem';
import Member from '@/app/lib/models/Member';
import TeamMember from '@/app/lib/models/TeamMember';
import AdminAccess from '@/app/lib/models/AdminAccess';
import { verifyAuth } from '@/app/lib/auth';
import { logAdminAction, AUDIT_ACTIONS } from '@/app/lib/utils/logAdminAction';

// Custom Audit Action for Inventory (we might need to add these to logAdminAction.ts later, but string works)
const INVENTORY_ACTIONS = {
    CREATE: 'CREATE_INVENTORY_ITEM',
    UPDATE: 'UPDATE_INVENTORY_ITEM',
    DELETE: 'DELETE_INVENTORY_ITEM',
    ASSIGN: 'ASSIGN_INVENTORY_ITEM',
    RETURN: 'RETURN_INVENTORY_ITEM',
};

async function verifyAdmin() {
    const auth = await verifyAuth();
    if (!auth?.userId) return null;

    await connectDB();

    // Check TeamMember role (President/VP)
    const teamMember = await TeamMember.findOne({ memberId: auth.userId, isActive: true });
    if (teamMember && ['president', 'vice_president'].includes(teamMember.role)) {
        return { userId: auth.userId, nickname: auth.nickname };
    }

    // Check AdminAccess
    const access = await AdminAccess.findOne({ memberId: auth.userId });
    return access ? { userId: auth.userId, nickname: auth.nickname } : null;
}

// GET: List all items
export async function GET(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const q = searchParams.get('q');

        const query: any = {};
        if (category) query.category = category;
        if (status) query.status = status;
        if (q) {
            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { serialNumber: { $regex: q, $options: 'i' } },
                { assignedToName: { $regex: q, $options: 'i' } },
            ];
        }

        const items = await InventoryItem.find(query).sort({ updatedAt: -1 });
        return NextResponse.json(items);
    } catch (error) {
        console.error('Inventory GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create new item
export async function POST(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, category, serialNumber, description, photo, notes } = body;

        if (!name || !category) {
            return NextResponse.json({ error: 'Name and Category are required' }, { status: 400 });
        }

        await connectDB();

        const item = await InventoryItem.create({
            name,
            category,
            serialNumber,
            description,
            photo,
            notes,
            status: 'available',
        });

        // Audit Log
        await logAdminAction({
            adminId: admin.userId,
            adminName: admin.nickname || 'Admin',
            action: INVENTORY_ACTIONS.CREATE,
            targetType: 'InventoryItem',
            targetId: item._id.toString(),
            targetName: item.name,
            details: `Created item: ${item.category}`,
        });

        return NextResponse.json(item, { status: 201 });
    } catch (error) {
        console.error('Inventory CREATE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Update item or Assign/Return
export async function PUT(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, action, ...data } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await connectDB();
        const item = await InventoryItem.findById(id);
        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        // Handle specific actions
        if (action === 'assign') {
            const { memberId, dueDate } = data;
            if (!memberId) return NextResponse.json({ error: 'Member ID required for assignment' }, { status: 400 });

            const member = await Member.findById(memberId);
            if (!member) return NextResponse.json({ error: 'Member not found' }, { status: 404 });

            item.status = 'assigned';
            item.assignedTo = member._id;
            item.assignedToName = member.fullName || member.nickname || member.studentNo;
            item.assignedAt = new Date();
            item.dueDate = dueDate ? new Date(dueDate) : undefined;

            await item.save();

            await logAdminAction({
                adminId: admin.userId,
                adminName: admin.nickname || 'Admin',
                action: INVENTORY_ACTIONS.ASSIGN,
                targetType: 'InventoryItem',
                targetId: item._id.toString(),
                targetName: item.name,
                details: `Assigned to ${item.assignedToName}`,
            });

            return NextResponse.json(item);

        } else if (action === 'return') {
            const previousHolder = item.assignedToName;

            item.status = 'available';
            item.assignedTo = undefined;
            item.assignedToName = undefined;
            item.assignedAt = undefined;
            item.dueDate = undefined;

            await item.save();

            await logAdminAction({
                adminId: admin.userId,
                adminName: admin.nickname || 'Admin',
                action: INVENTORY_ACTIONS.RETURN,
                targetType: 'InventoryItem',
                targetId: item._id.toString(),
                targetName: item.name,
                details: `Returned from ${previousHolder}`,
            });

            return NextResponse.json(item);

        } else if (action === 'update_status') {
            // For assigning maintenance/lost etc.
            const { status, notes } = data;
            item.status = status;
            if (notes) item.notes = notes;

            // If status is NOT assigned, clear assignment
            if (status !== 'assigned') {
                item.assignedTo = undefined;
                item.assignedToName = undefined;
                item.assignedAt = undefined;
                item.dueDate = undefined;
            }

            await item.save();

            await logAdminAction({
                adminId: admin.userId,
                adminName: admin.nickname || 'Admin',
                action: INVENTORY_ACTIONS.UPDATE,
                targetType: 'InventoryItem',
                targetId: item._id.toString(),
                targetName: item.name,
                details: `Status changed to ${status}`,
            });

            return NextResponse.json(item);

        } else {
            // General Update (Edit details)
            Object.assign(item, data);
            await item.save();

            await logAdminAction({
                adminId: admin.userId,
                adminName: admin.nickname || 'Admin',
                action: INVENTORY_ACTIONS.UPDATE,
                targetType: 'InventoryItem',
                targetId: item._id.toString(),
                targetName: item.name,
                details: `Updated details`,
            });

            return NextResponse.json(item);
        }

    } catch (error) {
        console.error('Inventory UPDATE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: NextRequest) {
    try {
        const admin = await verifyAdmin();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await connectDB();
        const item = await InventoryItem.findByIdAndDelete(id);

        if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        await logAdminAction({
            adminId: admin.userId,
            adminName: admin.nickname || 'Admin',
            action: INVENTORY_ACTIONS.DELETE,
            targetType: 'InventoryItem',
            targetId: item._id.toString(),
            targetName: item.name,
            details: `Deleted item`,
        });

        return NextResponse.json({ message: 'Item deleted' });
    } catch (error) {
        console.error('Inventory DELETE error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
