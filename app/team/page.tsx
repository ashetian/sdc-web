import Team from "../_components/Team";
import { getDepartments, getTeamMembers } from "../lib/services/teamService";

export const dynamic = 'force-dynamic'; // Ensure new data is fetched on navigation if not cached

export default async function TeamPage() {
    // SSR: Fetch departments and team members in parallel for better performance
    const [departments, members] = await Promise.all([
        getDepartments(),
        getTeamMembers({ showInTeam: true, activeOnly: true })
    ]);

    return (
        <main className="min-h-screen bg-white">
            <div className="pt-24 pb-12">
                <Team
                    initialDepartments={departments as any}
                    initialMembers={members as any}
                />
            </div>
        </main>
    );
}
