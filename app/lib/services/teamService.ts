import connectDB from '@/app/lib/db';
import TeamMember from '@/app/lib/models/TeamMember';
import Department from '@/app/lib/models/Department';

// Types for filtering team members
export type TeamFilter = {
    activeOnly?: boolean;
    showInTeam?: boolean;
    departmentId?: string;
    role?: string | string[];
}

export async function getTeamMembers(filter: TeamFilter = {}) {
    await connectDB();

    const query: any = {};
    if (filter.activeOnly !== false) query.isActive = true;
    if (filter.showInTeam) query.showInTeam = true;
    if (filter.departmentId) query.departmentId = filter.departmentId;

    if (filter.role) {
        if (Array.isArray(filter.role)) {
            query.role = { $in: filter.role };
        } else if (filter.role.includes(',')) {
            query.role = { $in: filter.role.split(',') };
        } else {
            query.role = filter.role;
        }
    }

    let members = await TeamMember.find(query)
        .populate('departmentId', 'name slug color nameEn')
        .lean();

    // Custom sort by role hierarchy + order
    const roleOrder: Record<string, number> = {
        president: 1,
        vice_president: 2,
        secretary: 3,
        treasurer: 4,
        board_member: 5,
        audit_head: 6,
        audit_member: 7,
        head: 8,
        member: 9,
        featured: 10
    };

    members.sort((a, b) => {
        const roleA = roleOrder[a.role as string] || 99;
        const roleB = roleOrder[b.role as string] || 99;
        if (roleA !== roleB) return roleA - roleB;
        return (a.order || 0) - (b.order || 0);
    });

    return JSON.parse(JSON.stringify(members));
}

export async function getDepartments(activeOnly: boolean = true) {
    await connectDB();

    const query = activeOnly ? { isActive: true } : {};
    const departments = await Department.find(query)
        .sort({ order: 1 })
        .lean();

    return JSON.parse(JSON.stringify(departments));
}
