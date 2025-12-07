"use client";
import { SkeletonPage } from "@/app/_components/Skeleton";

export default function AdminLoading() {
    return (
        <div className="p-4">
            <SkeletonPage type="menu" />
        </div>
    );
}
