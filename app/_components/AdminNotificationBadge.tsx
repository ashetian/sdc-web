"use client";

import { useState, useEffect } from "react";

interface AdminNotificationBadgeProps {
    type: 'comment' | 'project' | 'forum_topic' | 'registration' | 'applicant';
    className?: string;
}

const typeToApiType: Record<string, string> = {
    comment: 'admin_new_comment',
    project: 'admin_new_project',
    forum_topic: 'admin_new_forum_topic',
    registration: 'admin_new_registration',
    applicant: 'admin_new_applicant',
};

export default function AdminNotificationBadge({ type, className = "" }: AdminNotificationBadgeProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch(`/api/notifications/admin/count?type=${typeToApiType[type]}`);
                if (res.ok) {
                    const data = await res.json();
                    setCount(data.count);
                }
            } catch (error) {
                console.error('Error fetching admin notification count:', error);
            }
        };

        fetchCount();
        const interval = setInterval(fetchCount, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, [type]);

    return (
        <span
            className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full border-2 border-black ${count > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
                } ${className}`}
        >
            {count}
        </span>
    );
}
