import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react'; // Added router
import { useState } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PhaseStopwatch from '@/Components/PhaseStopwatch';

export default function Index({ auth, locations, server_time }) {
    const [showManageModal, setShowManageModal] = useState(false);
    const [viewMode, setViewMode] = useState('list'); // 'list', 'form'
    const [editingLocation, setEditingLocation] = useState(null);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        nama_lokasi: '',
        kapasitas: '',
        foto_media: null,
    });

    // Phase name mapping for display
    const getPhaseName = (fase) => {
        const map = {
            'persiapan_benih': 'Perendaman',
            'peram': 'Pemeraman',
            'semai_tray': 'Semai Tray',
            'pindah_tanam': 'Pindah Tanam',
            'produksi': 'Produksi',
            'panen': 'Panen',
        };
        return map[fase] || fase;
    };

    const handleOpenManage = () => {
        setViewMode('list');
        setShowManageModal(true);
    };

    const handleCreate = () => {
        setEditingLocation(null);
        reset();
        clearErrors();
        setViewMode('form');
    };

    const handleEdit = (loc) => {
        setEditingLocation(loc);
        setData({
            nama_lokasi: loc.nama_lokasi,
            kapasitas: loc.kapasitas,
            foto_media: null, // Don't prefill file input
        });
        clearErrors();
        setViewMode('form');
    };

    const handleDelete = (loc) => {
        if (confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) {
            router.delete(route('production.destroy_location', loc.id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const routeName = editingLocation ? 'production.update_location' : 'production.store_location';
        const routeParams = editingLocation ? editingLocation.id : {};
        
        post(route(routeName, routeParams), {
            onSuccess: () => {
                reset();
                setViewMode('list');
                // Optional: keep modal open to manage more
            },
        });
    };

    const openHistoryModal = (batch) => {
        setSelectedBatch(batch);
        setShowHistoryModal(true);
    };

    const formatDuration = (start, end) => {
        if (!start) return '-';
        const startTime = new Date(start).getTime();
        const endTime = end ? new Date(end).getTime() : new Date().getTime();
        const diffMs = endTime - startTime;
        
        const totalSec = Math.floor(diffMs / 1000);
        const m = Math.floor((totalSec % 3600) / 60);
        const h = Math.floor((totalSec % 86400) / 3600);
        const d = Math.floor(totalSec / 86400);

        let parts = [];
        if (d > 0) parts.push(`${d}h`);
        if (h > 0) parts.push(`${h}j`);
        if (m > 0 || parts.length === 0) parts.push(`${m}m`);
        
        return parts.join(' ');
    };

    const occupiedCount = locations.filter(loc => loc.batch_tanams && loc.batch_tanams.length > 0).length;
    const emptyCount = locations.length - occupiedCount;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Produksi</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {occupiedCount} lokasi aktif · {emptyCount} tersedia
                        </p>
                    </div>
                    <button 
                        onClick={handleOpenManage}
                        className="btn btn-secondary text-xs gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                        </svg>
                        Atur Blok
                    </button>
                </div>
            }
        >
            <Head title="Produksi" />

            <div className="page-container">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {locations.map((loc, index) => {
                        const activeBatch = loc.batch_tanams && loc.batch_tanams.length > 0 ? loc.batch_tanams[0] : null;
                        const isOccupied = !!activeBatch;
                        const batchName = activeBatch ? (activeBatch.nama_custom || activeBatch.master_varietas?.nama_varietas || 'Tanpa Nama') : '';

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
                                                    {batchName}
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                    {activeBatch.kode_batch}
                                                </p>
                                            </div>
                                            
                                            {/* Qty */}
                                            <div>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Qty</p>
                                                <p className="text-lg font-bold text-gray-900 leading-tight">{activeBatch.jumlah_tanaman}</p>
                                            </div>

                                            {/* Phase Timer — Clean Stopwatch */}
                                            <PhaseStopwatch
                                                startTime={activeBatch.tanggal_ubah_fase || activeBatch.tanggal_mulai}
                                                phaseName={getPhaseName(activeBatch.fase_saat_ini)}
                                                serverTime={server_time}
                                                onClick={() => openHistoryModal(activeBatch)}
                                            />
                                            
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

            {/* Modal Manage Blocks */}
            <Modal show={showManageModal} onClose={() => setShowManageModal(false)}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {viewMode === 'list' ? 'Atur Blok Produksi' : (editingLocation ? 'Edit Blok' : 'Tambah Blok Baru')}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                                {viewMode === 'list' ? 'Kelola daftar lokasi produksi, kapasitas, dan media.' : 'Isi detail lokasi produksi.'}
                            </p>
                        </div>
                        {viewMode === 'form' && (
                            <button onClick={() => setViewMode('list')} className="text-xs text-gray-500 hover:text-gray-900">
                                Kembali ke Daftar
                            </button>
                        )}
                    </div>

                    {viewMode === 'list' ? (
                        <div className="space-y-4">
                            <button 
                                onClick={handleCreate}
                                className="btn btn-primary w-full text-xs justify-center mb-4"
                            >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Tambah Blok Baru
                            </button>

                            <div className="max-h-[400px] overflow-y-auto space-y-2">
                                {locations.map(loc => (
                                    <div key={loc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            {loc.foto_media ? (
                                                <img src={`/storage/${loc.foto_media}`} alt="Media" className="w-10 h-10 rounded-lg object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                    </svg>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{loc.nama_lokasi}</p>
                                                <p className="text-[10px] text-gray-500">Kapasitas: {loc.kapasitas}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEdit(loc)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                </svg>
                                            </button>
                                            <button onClick={() => handleDelete(loc)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="mb-4">
                                <InputLabel htmlFor="nama_lokasi" value="Nama Blok / Lokasi" />
                                <TextInput
                                    id="nama_lokasi"
                                    type="text"
                                    value={data.nama_lokasi}
                                    onChange={(e) => setData('nama_lokasi', e.target.value)}
                                    className="input-field mt-1.5"
                                    placeholder="Contoh: Modul A1"
                                    required
                                />
                                <InputError message={errors.nama_lokasi} className="mt-2" />
                            </div>

                            <div className="mb-4">
                                <InputLabel htmlFor="kapasitas" value="Kapasitas (Lubang Tanam)" />
                                <TextInput
                                    id="kapasitas"
                                    type="number"
                                    value={data.kapasitas}
                                    onChange={(e) => setData('kapasitas', e.target.value)}
                                    className="input-field mt-1.5"
                                    placeholder="Contoh: 200"
                                    required
                                />
                                <InputError message={errors.kapasitas} className="mt-2" />
                            </div>

                            <div className="mb-6">
                                <InputLabel htmlFor="foto_media" value="Foto Media (Opsional)" />
                                <input
                                    id="foto_media"
                                    type="file"
                                    onChange={(e) => setData('foto_media', e.target.files[0])}
                                    className="mt-1.5 block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors"
                                    accept="image/*"
                                />
                                <InputError message={errors.foto_media} className="mt-2" />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setViewMode('list')} className="btn btn-secondary">
                                    Batal
                                </button>
                                <button type="submit" disabled={processing} className="btn btn-primary">
                                    {processing ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
            {/* Modal Riwayat Fase */}
            <Modal show={showHistoryModal} onClose={() => setShowHistoryModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Riwayat Fase</h2>
                            {selectedBatch && (
                                <p className="text-xs text-gray-400 mt-1">
                                    Detail perjalanan <span className="font-semibold">{selectedBatch.nama_custom || selectedBatch.master_varietas?.nama_varietas}</span>
                                </p>
                            )}
                        </div>
                        <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="overflow-x-auto bg-gray-50 rounded-xl border border-gray-100 mb-4">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr className="bg-gray-100/50">
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fase</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lokasi</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Mulai</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Waktu Selesai</th>
                                    <th className="px-4 py-3 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Durasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {selectedBatch?.riwayat_fases?.length > 0 ? (
                                    selectedBatch.riwayat_fases.map((hist, idx) => (
                                        <tr key={hist.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs font-bold text-gray-900 capitalize">
                                                    {getPhaseName(hist.fase)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs text-gray-500">{hist.nama_lokasi || '-'}</span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {hist.tanggal_mulai ? new Date(hist.tanggal_mulai).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {hist.tanggal_selesai 
                                                        ? new Date(hist.tanggal_selesai).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                        : <span className="text-blue-500 font-bold px-1.5 py-0.5 bg-blue-50 rounded text-[9px] uppercase tracking-tighter">Berjalan</span>
                                                    }
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right whitespace-nowrap">
                                                <span className="text-xs font-bold text-gray-700 font-mono">
                                                    {formatDuration(hist.tanggal_mulai, hist.tanggal_selesai)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-xs text-gray-400 italic">
                                            Belum ada data riwayat fase.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button 
                            type="button" 
                            onClick={() => setShowHistoryModal(false)}
                            className="btn btn-secondary"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
