export default function AdminLoading() {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="bg-white border-4 border-black shadow-neo px-8 py-6 text-center">
                <div className="animate-pulse">
                    <span className="bg-neo-purple text-white px-4 py-2 text-xl font-black border-2 border-black inline-block">
                        SDC
                    </span>
                    <span className="text-black font-black text-lg ml-2">ADMIN</span>
                </div>
                <p className="mt-4 font-black animate-pulse">Yükleniyor...</p>
            </div>
        </div>
    );
}
