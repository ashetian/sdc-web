"use client";
import { SkeletonPage } from "./_components/Skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-neo-yellow p-8">
            <SkeletonPage type="cards" />
        </div>
    );
}
