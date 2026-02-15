import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ auth, locations }) {
    
    const calculateAge = (startDate) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const occupiedCount = locations.filter(loc => loc.batch_tanams && loc.batch_tanams.length > 0).length;
    const emptyCount = locations.length - occupiedCount;

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Produksi</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {occupiedCount} lokasi aktif · {emptyCount} tersedia
                    </p>
                </div>
            }
        >
            <Head title="Produksi" />

            <div className="page-container">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {locations.map((loc, index) => {
                        const activeBatch = loc.batch_tanams && loc.batch_tanams.length > 0 ? loc.batch_tanams[0] : null;
                        const isOccupied = !!activeBatch;
                        const age = activeBatch ? calculateAge(activeBatch.tanggal_mulai) : 0;

                        return (
                            <div 
                                key={loc.id} 
                                className={`location-card ${isOccupied ? 'occupied' : 'empty'} animate-fade-in-up`}
                                style={{ opacity: 0, animationDelay: `${index * 0.04}s` }}
                            >
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-sm font-bold text-gray-900 leading-tight">
                                            {loc.nama_lokasi}
                                        </h3>
                                        <span className={`badge text-[9px] ${isOccupied ? 'badge-dark' : 'badge-light'}`}>
                                            {isOccupied ? 'Aktif' : 'Kosong'}
                                        </span>
                                    </div>

                                    {isOccupied ? (
                                        <div className="space-y-3">
                                            {/* Variety Info */}
                                            <div className="bg-gray-50 rounded-xl p-3">
                                                <p className="text-xs font-bold text-gray-900">
                                                    {activeBatch.master_varietas?.nama_varietas}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                    {activeBatch.kode_batch}
                                                </p>
                                            </div>
                                            
                                            {/* Stats */}
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Umur</p>
                                                    <p className="text-lg font-bold text-gray-900 leading-tight">{age}<span className="text-xs text-gray-400 font-normal ml-0.5">hr</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Qty</p>
                                                    <p className="text-lg font-bold text-gray-900 leading-tight">{activeBatch.jumlah_tanaman}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Action */}
                                            <Link 
                                                href={route('production.show', activeBatch.id)}
                                                className="btn btn-primary w-full text-xs !py-2"
                                            >
                                                Lihat Detail
                                                <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] text-gray-400">Kapasitas {loc.kapasitas}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {locations.length === 0 && (
                    <div className="empty-state mt-12">
                        <svg className="empty-icon" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <span className="empty-text">Belum ada lokasi produksi</span>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
