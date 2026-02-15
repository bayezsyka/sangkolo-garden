import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Index({ auth, harvests }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">Hasil Panen</h1>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {harvests.length} data panen tercatat
                    </p>
                </div>
            }
        >
            <Head title="Hasil Panen" />

            <div className="page-container">
                {harvests.length > 0 ? (
                    <div className="space-y-3">
                        {harvests.map((harvest, index) => (
                            <div 
                                key={harvest.id} 
                                className={`card p-5 animate-fade-in-up`}
                                style={{ opacity: 0, animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">
                                            {harvest.nama_custom || harvest.master_varietas?.nama_varietas || 'Unknown'}
                                        </h3>
                                        <span className="text-[10px] font-mono text-gray-400">
                                            {harvest.kode_batch}
                                        </span>
                                    </div>
                                    <span className="badge badge-dark text-[9px]">Dipanen</span>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Berat</p>
                                        <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                                            {harvest.total_berat_panen || '—'}
                                            <span className="text-xs text-gray-400 font-normal ml-0.5">kg</span>
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Layak</p>
                                        <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                                            {harvest.jumlah_panen_layak || '—'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Afkir</p>
                                        <p className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                                            {harvest.jumlah_afkir || 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Info */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                        <span>{harvest.lokasi_saat_ini?.nama_lokasi || '—'}</span>
                                    </div>
                                    {harvest.tanggal_panen_aktual && (
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(harvest.tanggal_panen_aktual).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    )}
                                </div>

                                {harvest.catatan_panen && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs text-gray-500 leading-relaxed">{harvest.catatan_panen}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state mt-12 animate-fade-in">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-500">Belum ada data panen</p>
                        <p className="text-xs text-gray-400 mt-1">Data panen akan muncul setelah batch dipanen</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
