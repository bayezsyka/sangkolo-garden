import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useState } from 'react';

export default function Index({ auth, batches, varieties, locations }) {
    const [showModal, setShowModal] = useState(false);
    const [showPhaseModal, setShowPhaseModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState(null);
    const [targetPhase, setTargetPhase] = useState(null);
    
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_tanaman: `Batch ${todayStr}`,
        jumlah_tanaman: '100',
        tanggal_tanam: new Date().toISOString().slice(0, 16),
        nama_lokasi: '',
    });

    const { 
        data: editData, 
        setData: setEditData, 
        put: putUpdate, 
        processing: editProcessing, 
        errors: editErrors, 
        reset: resetEdit 
    } = useForm({
        nama_custom: '',
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

    const { 
        data: phaseData, 
        setData: setPhaseData, 
        put: putPhase, 
        processing: phaseProcessing, 
        errors: phaseErrors, 
        reset: resetPhase 
    } = useForm({
        next_phase: '',
        nama_lokasi: '',
    });

    const { put, delete: destroy, processing: moving } = useForm();

    const submitNewBatch = (e) => {
        e.preventDefault();
        
        // Update time right before sending
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
        
        post(route('nursery.store'), {
            data: {
                ...data,
                tanggal_tanam: localISOTime
            },
            onSuccess: () => {
                setShowModal(false);
                reset();
            },
        });
    };
    
    // ... (rest of the component)

    // Helper to get name
    const getBatchName = (batch) => batch.nama_custom || batch.master_varietas?.nama_varietas || 'Tanaman';



    const openPhaseModal = (batch, nextPhaseName) => {
        setSelectedBatch(batch);
        setTargetPhase(nextPhaseName);
        setPhaseData({
            next_phase: nextPhaseName,
            nama_lokasi: '',
        });
        setShowPhaseModal(true);
    };

    const submitPhaseChange = (e) => {
        e.preventDefault();
        putPhase(route('nursery.update_phase', selectedBatch.id), {
            onSuccess: () => {
                setShowPhaseModal(false);
                resetPhase();
                setSelectedBatch(null);
            }
        });
    };

    const nextPhaseImmediate = (batchId, nextPhaseName) => {
        put(route('nursery.update_phase', { batch: batchId, next_phase: nextPhaseName }));
    };

    const handleEdit = (batch) => {
        setSelectedBatch(batch);
        setEditData({
            nama_custom: batch.nama_custom || batch.master_varietas?.nama_varietas || '',
            jumlah_tanaman: batch.jumlah_tanaman,
        });
        setShowEditModal(true);
    };

    const submitUpdate = (e) => {
        e.preventDefault();
        putUpdate(route('nursery.update', selectedBatch.id), {
            onSuccess: () => {
                setShowEditModal(false);
                resetEdit();
            }
        });
    };

    const handleDelete = (batchId) => {
        if (confirm('Apakah Anda yakin ingin menghapus batch ini? Semua riwayat akan hilang.')) {
            destroy(route('nursery.destroy', batchId));
        }
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
            prevPhaseTarget: null,
            isTransfer: false,
            phaseKey: 'semai', // Initial is semai types
        },
        {
            key: 'peram',
            title: 'Pemeraman',
            step: '02',
            items: batches.peram || [],
            nextPhaseTarget: 'semai_tray',
            nextPhaseLabel: 'Pindah ke Tray',
            prevPhaseTarget: 'persiapan_benih',
            isTransfer: false,
            phaseKey: 'pemeraman',
        },
        {
            key: 'semai_tray',
            title: 'Semai Tray',
            step: '03',
            items: batches.semai_tray || [],
            nextPhaseTarget: null,
            nextPhaseLabel: null,
            prevPhaseTarget: 'peram',
            isTransfer: true,
            phaseKey: 'semai_tray',
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
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEdit(batch)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleDelete(batch.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="text-sm font-bold text-gray-900 mb-1">
                                            {getBatchName(batch)}
                                        </h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25z" />
                                            </svg>
                                            <span>{batch.jumlah_tanaman} tanaman</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-3">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                            <span>{batch.lokasi_saat_ini?.nama_lokasi}</span>
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            {/* Primary Action Button (Next Phase or Transfer) */}
                                            {col.isTransfer ? (
                                                <>
                                                    <button
                                                        onClick={() => openPhaseModal(batch, col.prevPhaseTarget)}
                                                        disabled={moving}
                                                        className="btn btn-secondary text-xs !py-2"
                                                        title="Kembalikan fase"
                                                    >
                                                        <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => openTransferModal(batch)}
                                                        className="btn btn-primary flex-1 text-xs !py-2"
                                                    >
                                                        Pindah Tanam
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    {col.prevPhaseTarget && (
                                                        <button
                                                            onClick={() => openPhaseModal(batch, col.prevPhaseTarget)}
                                                            disabled={moving}
                                                            className="btn btn-secondary text-xs !py-2"
                                                            title="Kembalikan fase"
                                                        >
                                                            <svg className="w-3.5 h-3.5 rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    {col.nextPhaseTarget && (
                                                        <button
                                                            onClick={() => openPhaseModal(batch, col.nextPhaseTarget)}
                                                            disabled={moving}
                                                            className="btn btn-primary flex-1 text-xs !py-2"
                                                        >
                                                            {col.nextPhaseLabel}
                                                            <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
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
                    <form onSubmit={submitNewBatch} encType="multipart/form-data">
                        <div className="mb-4">
                            <InputLabel htmlFor="nama_tanaman" value="Nama Tanam / Varietas" />
                            <TextInput
                                id="nama_tanaman"
                                type="text"
                                value={data.nama_tanaman}
                                onChange={(e) => setData('nama_tanaman', e.target.value)}
                                className="input-field mt-1.5"
                                placeholder="Contoh: Selada Romaine"
                                required
                            />
                             <InputError message={errors.nama_tanaman} className="mt-2" />
                        </div>

                        <div className="mb-4">
                            <InputLabel htmlFor="nama_lokasi" value="Lokasi Semai" />
                            <TextInput
                                id="nama_lokasi"
                                list="semai_list"
                                value={data.nama_lokasi}
                                onChange={(e) => setData('nama_lokasi', e.target.value)}
                                className="input-field mt-1.5"
                                placeholder="Contoh: Meja A1"
                                required
                            />
                            <datalist id="semai_list">
                                {locations.semai.map((loc) => (
                                    <option key={loc.id} value={loc.nama_lokasi} />
                                ))}
                            </datalist>
                            <InputError message={errors.nama_lokasi} className="mt-2" />
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

            {/* Modal Edit Batch */}
            <Modal show={showEditModal} onClose={() => setShowEditModal(false)}>
                <div className="p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Edit Batch Tanam</h2>
                        <p className="text-xs text-gray-400 mt-1">Sesuaikan detail tanaman atau jumlah</p>
                    </div>
                    <form onSubmit={submitUpdate}>
                        <div className="mb-4">
                            <InputLabel htmlFor="edit_nama" value="Nama Tanam / Varietas" />
                            <TextInput
                                id="edit_nama"
                                type="text"
                                value={editData.nama_custom}
                                onChange={(e) => setEditData('nama_custom', e.target.value)}
                                className="input-field mt-1.5"
                                required
                            />
                            <InputError message={editErrors.nama_custom} className="mt-2" />
                        </div>

                        <div className="mb-6">
                            <InputLabel htmlFor="edit_jumlah" value="Jumlah Tanaman" />
                            <TextInput
                                id="edit_jumlah"
                                type="number"
                                value={editData.jumlah_tanaman}
                                onChange={(e) => setEditData('jumlah_tanaman', e.target.value)}
                                className="mt-1.5"
                                required
                            />
                            <InputError message={editErrors.jumlah_tanaman} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" disabled={editProcessing} className="btn btn-primary">
                                {editProcessing ? 'Menyimpan...' : 'Perbarui'}
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
                                Batch <span className="font-mono font-medium text-gray-600">{selectedBatch.kode_batch}</span> — {getBatchName(selectedBatch)}
                            </p>
                        )}
                    </div>
                    
                    <form onSubmit={submitTransfer}>
                        <div className="mb-4">
                            <InputLabel htmlFor="lokasi_tujuan_id" value="Lokasi Tujuan (Produksi)" />
                            <select
                                id="lokasi_tujuan_id"
                                value={transferData.lokasi_tujuan_id}
                                onChange={(e) => setTransferData('lokasi_tujuan_id', e.target.value)}
                                className="input-field mt-1.5"
                                required
                            >
                                <option value="">Pilih lokasi produksi...</option>
                                {locations.produksi.map((loc) => (
                                    <option key={loc.id} value={loc.id}>
                                        {loc.nama_lokasi} (Kapasitas: {loc.kapasitas})
                                    </option>
                                ))}
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

            {/* Modal Ganti Fase dengan Lokasi */}
            <Modal show={showPhaseModal} onClose={() => setShowPhaseModal(false)}>
                <div className="p-6">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Pindah Fase</h2>
                        {selectedBatch && (
                            <p className="text-xs text-gray-400 mt-1">
                                Pindahkan <span className="font-semibold">{getBatchName(selectedBatch)}</span> ke fase <span className="capitalize font-semibold">{targetPhase?.replace('_', ' ')}</span>
                            </p>
                        )}
                    </div>

                    <form onSubmit={submitPhaseChange}>
                        <div className="mb-6">
                            <InputLabel htmlFor="phase_nama_lokasi" value="Lokasi Baru" />
                            <TextInput
                                id="phase_nama_lokasi"
                                list="phase_list"
                                value={phaseData.nama_lokasi}
                                onChange={(e) => setPhaseData('nama_lokasi', e.target.value)}
                                className="input-field mt-1.5"
                                placeholder="Pilih atau ketik lokasi baru..."
                                required
                            />
                            <datalist id="phase_list">
                                {targetPhase && locations[targetPhase === 'persiapan_benih' ? 'semai' : (targetPhase === 'peram' ? 'pemeraman' : 'semai_tray')]?.map((loc) => (
                                    <option key={loc.id} value={loc.nama_lokasi} />
                                ))}
                            </datalist>
                            <InputError message={phaseErrors.nama_lokasi} className="mt-2" />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setShowPhaseModal(false)} className="btn btn-secondary">
                                Batal
                            </button>
                            <button type="submit" disabled={phaseProcessing} className="btn btn-primary">
                                {phaseProcessing ? 'Memproses...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
