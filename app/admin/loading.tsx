"use client";
import GlobalLoading from "@/app/_components/GlobalLoading";

export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <GlobalLoading fullScreen={false} message="YÜKLENİYOR" />
        </div>
    );
}
