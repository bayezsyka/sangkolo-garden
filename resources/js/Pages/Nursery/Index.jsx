import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useState } from 'react';

export default function Index({ auth, batches, varieties, availableLocations }) {
    const [showModal, setShowModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        master_varietas_id: '',
        jumlah_tanaman: '',
    });

    const { 
        data: transferData, 
        setData: setTransferData, 
        post: postTransfer, 
        processing: transferProcessing, 
        errors: transferErrors, 
        reset: resetTransfer 
    } = useForm({
        batch_id: '',
        lokasi_tujuan_id: '',
        jumlah_tanaman_hidup: '',
    });

    const { put, processing: moving } = useForm();

    const submitNewBatch = (e) => {
        e.preventDefault();
        post(route('nursery.store'), {
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };

    const nextPhase = (batchId, nextPhaseName) => {
        put(route('nursery.update_phase', { batch: batchId, next_phase: nextPhaseName }));
    };

    const openTransferModal = (batch) => {
        setSelectedBatch(batch);
        setTransferData({
            batch_id: batch.id,
            lokasi_tujuan_id: '',
            jumlah_tanaman_hidup: batch.jumlah_tanaman
        });
        setShowTransferModal(true);
    };

    const submitTransfer = (e) => {
        e.preventDefault();
        postTransfer(route('production.store_pindah_tanam'), {
            onSuccess: () => {
                setShowTransferModal(false);
                resetTransfer();
                setSelectedBatch(null);
            },
        });
    };

    const columns = [
        {
            key: 'persiapan_benih',
            title: 'Perendaman',
            step: '01',
            items: batches.persiapan_benih || [],
            nextPhaseTarget: 'peram',
            nextPhaseLabel: 'Mulai Peram',
            isTransfer: false,
        },
        {
            key: 'peram',
            title: 'Pemeraman',
            step: '02',
            items: batches.peram || [],
            nextPhaseTarget: 'semai_tray',
            nextPhaseLabel: 'Pindah ke Tray',
            isTransfer: false,
        },
        {
            key: 'semai_tray',
            title: 'Semai Tray',
            step: '03',
            items: batches.semai_tray || [],
            nextPhaseTarget: null,
            nextPhaseLabel: null,
            isTransfer: true,
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Manajemen Semai</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Kelola pembibitan dari perendaman hingga pindah tanam</p>
                    </div>
                    <button 
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary gap-1.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Tanam Baru
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Semai" />

            <div className="page-container">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {columns.map((col, colIndex) => (
                        <div 
                            key={col.key} 
                            className={`kanban-column animate-fade-in-up stagger-${colIndex + 1}`}
                            style={{ opacity: 0 }}
                        >
                            <div className="column-header">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-300">{col.step}</span>
                                    <span className="column-title">{col.title}</span>
                                </div>
                                <span className="column-count">{col.items.length}</span>
                            </div>

                            <div className="space-y-3">
                                {col.items.length === 0 && (
                                    <div className="empty-state !py-8">
                                        <svg className="empty-icon" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                        </svg>
                                        <span className="empty-text">Kosong</span>
                                    </div>
                                )}
                                {col.items.map((batch) => (
                                    <div key={batch.id} className="kanban-card">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="badge badge-light font-mono text-[10px]">
                                                {batch.kode_batch}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(batch.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">
                                            {batch.master_varietas?.nama_varietas || 'Unknown'}
                                        </h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25z" />
                                            </svg>
                                            <span>{batch.jumlah_tanaman} tanaman</span>
                                        </div>

                                        {col.nextPhaseTarget && (
                                            <button
                                                onClick={() => nextPhase(batch.id, col.nextPhaseTarget)}
                                                disabled={moving}
                                                className="btn btn-secondary w-full text-xs !py-2"
                                            >
                                                {col.nextPhaseLabel}
                                                <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                </svg>
                                            </button>
                                        )}

                                        {col.isTransfer && (
                                            <button
                                                onClick={() => openTransferModal(batch)}
                                                className="btn btn-primary w-full text-xs !py-2"
                                            >
                                                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                                </svg>
                                                Pindah Tanam
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Create New Batch */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Batch Tanam Baru</h2>
                        <p className="text-xs text-gray-400 mt-1">Mulai siklus tanam baru dari tahap perendaman</p>
                    </div>
                    <form onSubmit={submitNewBatch}>
                        <div className="mb-4">
                            <InputLabel htmlFor="master_varietas_id" value="Varietas" />
                            <select
                                id="master_varietas_id"
                                value={data.master_varietas_id}
                                onChange={(e) => setData('master_varietas_id', e.target.value)}
                                className="input-field mt-1.5"
                                required
                            >
                                <option value="">Pilih varietas...</option>
                                {varieties.map((v) => (
                                    <option key={v.id} value={v.id}>{v.nama_varietas}</option>
                                ))}
                            </select>
                            <InputError message={errors.master_varietas_id} className="mt-2" />
                        </div>

                        <div className="mb-6">
                            <InputLabel htmlFor="jumlah_tanaman" value="Jumlah Tanaman" />
                            <TextInput
                                id="jumlah_tanaman"
                                type="number"
                                value={data.jumlah_tanaman}
                                onChange={(e) => setData('jumlah_tanaman', e.target.value)}
                                className="mt-1.5"
                                placeholder="Contoh: 100"
                                required
                            />
                            <InputError message={errors.jumlah_tanaman} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" disabled={processing} className="btn btn-primary">
                                {processing ? 'Menyimpan...' : 'Simpan & Mulai'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Pindah Tanam */}
            <Modal show={showTransferModal} onClose={() => setShowTransferModal(false)}>
                <div className="p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Pindah Tanam</h2>
                        {selectedBatch && (
                            <p className="text-xs text-gray-400 mt-1">
                                Batch <span className="font-mono font-medium text-gray-600">{selectedBatch.kode_batch}</span> — {selectedBatch.master_varietas?.nama_varietas}
                            </p>
                        )}
                    </div>
                    
                    <form onSubmit={submitTransfer}>
                        <div className="mb-4">
                            <InputLabel htmlFor="lokasi_tujuan_id" value="Lokasi Tujuan" />
                            <select
                                id="lokasi_tujuan_id"
                                value={transferData.lokasi_tujuan_id}
                                onChange={(e) => setTransferData('lokasi_tujuan_id', e.target.value)}
                                className="input-field mt-1.5"
                                required
                            >
                                <option value="">Pilih lokasi...</option>
                                {availableLocations && availableLocations.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.nama_lokasi} (Kapasitas: {loc.kapasitas})
                                    </option>
                                ))}
                                {(!availableLocations || availableLocations.length === 0) && (
                                    <option value="" disabled>Tidak ada lokasi kosong</option>
                                )}
                            </select>
                            <InputError message={transferErrors.lokasi_tujuan_id} className="mt-2" />
                        </div>

                        <div className="mb-6">
                            <InputLabel htmlFor="jumlah_tanaman_hidup" value="Jumlah Tanaman Hidup" />
                            <TextInput
                                id="jumlah_tanaman_hidup"
                                type="number"
                                value={transferData.jumlah_tanaman_hidup}
                                onChange={(e) => setTransferData('jumlah_tanaman_hidup', e.target.value)}
                                className="mt-1.5"
                                required
                            />
                            <p className="mt-1.5 text-[11px] text-gray-400">
                                Jumlah sebelumnya: <span className="font-semibold text-gray-600">{selectedBatch?.jumlah_tanaman}</span>
                            </p>
                            <InputError message={transferErrors.jumlah_tanaman_hidup} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowTransferModal(false)} className="btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" disabled={transferProcessing} className="btn btn-primary">
                                {transferProcessing ? 'Memproses...' : 'Konfirmasi'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
