export default function Loading() {
    return (
        <div className="min-h-screen bg-neo-yellow flex items-center justify-center">
            <div className="bg-white border-4 border-black shadow-neo px-8 py-6 text-center">
                <div className="animate-pulse">
                    <span className="bg-neo-purple text-white px-4 py-2 text-2xl font-black border-2 border-black inline-block">
                        SDC
                    </span>
                </div>
                <p className="mt-4 font-black text-lg animate-pulse">Yükleniyor...</p>
            </div>
        </div>
    );
}
