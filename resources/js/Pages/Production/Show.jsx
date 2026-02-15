import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { useRef } from 'react';

export default function Show({ auth, batch }) {
    const fileInputRef = useRef(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        batch_tanam_id: batch.id,
        tanggal: new Date().toISOString().split('T')[0],
        ppm_nutrisi: '',
        ph_air: '',
        suhu_air: '',
        catatan: '',
        foto_kondisi: null,
    });

    const calculateAge = (startDate) => {
        if (!startDate) return 0;
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const lastLog = batch.jurnal_kebuns && batch.jurnal_kebuns.length > 0 ? batch.jurnal_kebuns[0] : null;

    const submitJournal = (e) => {
        e.preventDefault();
        post(route('maintenance.store'), {
            onSuccess: () => {
                reset('ppm_nutrisi', 'ph_air', 'suhu_air', 'catatan', 'foto_kondisi');
                if(fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    const age = calculateAge(batch.tanggal_mulai);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Detail Perawatan</h1>
                        <p className="text-xs text-gray-400 mt-0.5">
                            <span className="font-mono">{batch.kode_batch}</span> — {batch.master_varietas?.nama_varietas}
                        </p>
                    </div>
                    <Link href={route('production.index')} className="btn btn-ghost text-xs gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Kembali
                    </Link>
                </div>
            }
        >
            <Head title={`Perawatan - ${batch.kode_batch}`} />

            <div className="page-container">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-fade-in-up" style={{ opacity: 0 }}>
                    <div className="stat-card">
                        <p className="stat-label">Umur</p>
                        <p className="stat-value">{age}<span className="text-sm text-gray-400 font-normal ml-1">hari</span></p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">Jumlah</p>
                        <p className="stat-value">{batch.jumlah_tanaman}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">PPM Terakhir</p>
                        <p className="stat-value">{lastLog?.ppm_nutrisi || '—'}</p>
                    </div>
                    <div className="stat-card">
                        <p className="stat-label">pH Terakhir</p>
                        <p className="stat-value">{lastLog?.ph_air || '—'}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Form */}
                    <div className="lg:col-span-1 animate-fade-in-up stagger-2" style={{ opacity: 0 }}>
                        <div className="card-flat p-5 sticky top-20">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                Catat Hari Ini
                            </h3>
                            
                            <form onSubmit={submitJournal} encType="multipart/form-data" className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="tanggal" value="Tanggal" />
                                    <TextInput
                                        id="tanggal"
                                        type="date"
                                        value={data.tanggal}
                                        onChange={(e) => setData('tanggal', e.target.value)}
                                        className="input-field mt-1.5"
                                        required
                                    />
                                    <InputError message={errors.tanggal} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <InputLabel htmlFor="ppm_nutrisi" value="PPM" />
                                        <TextInput
                                            id="ppm_nutrisi"
                                            type="number"
                                            value={data.ppm_nutrisi}
                                            onChange={(e) => setData('ppm_nutrisi', e.target.value)}
                                            className="input-field mt-1.5"
                                            placeholder="1100"
                                        />
                                        <InputError message={errors.ppm_nutrisi} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="ph_air" value="pH Air" />
                                        <TextInput
                                            id="ph_air"
                                            type="number"
                                            step="0.1"
                                            value={data.ph_air}
                                            onChange={(e) => setData('ph_air', e.target.value)}
                                            className="input-field mt-1.5"
                                            placeholder="6.0"
                                        />
                                        <InputError message={errors.ph_air} className="mt-2" />
                                    </div>
                                </div>

                                <div>
                                    <InputLabel htmlFor="catatan" value="Catatan" />
                                    <textarea
                                        id="catatan"
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        className="input-field mt-1.5 h-20 resize-none"
                                        placeholder="Tulis kondisi tanaman..."
                                    />
                                    <InputError message={errors.catatan} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="foto_kondisi" value="Foto (Opsional)" />
                                    <input
                                        ref={fileInputRef}
                                        id="foto_kondisi"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('foto_kondisi', e.target.files[0])}
                                        className="mt-1.5 block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-colors"
                                    />
                                    <InputError message={errors.foto_kondisi} className="mt-2" />
                                </div>

                                <button type="submit" disabled={processing} className="btn btn-primary w-full !py-3">
                                    {processing ? 'Menyimpan...' : 'Simpan Jurnal'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="lg:col-span-2 animate-fade-in-up stagger-3" style={{ opacity: 0 }}>
                        <div className="card-flat p-5 min-h-[400px]">
                            <h3 className="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                Riwayat Perawatan
                            </h3>
                            
                            <div>
                                {batch.jurnal_kebuns && batch.jurnal_kebuns.length > 0 ? (
                                    batch.jurnal_kebuns.map((log, index) => (
                                        <div key={log.id} className="timeline-item">
                                            <div className="timeline-dot">
                                                <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                            </div>
                                            
                                            <div className="mb-1">
                                                <span className="text-xs font-semibold text-gray-900">
                                                    {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {log.ppm_nutrisi && (
                                                    <span className="badge badge-light">
                                                        PPM: {log.ppm_nutrisi}
                                                    </span>
                                                )}
                                                {log.ph_air && (
                                                    <span className="badge badge-light">
                                                        pH: {log.ph_air}
                                                    </span>
                                                )}
                                            </div>

                                            {log.catatan && (
                                                <p className="mt-2 text-sm text-gray-500 leading-relaxed whitespace-pre-wrap">
                                                    {log.catatan}
                                                </p>
                                            )}

                                            {log.foto_kondisi && (
                                                <div className="mt-3">
                                                    <img 
                                                        src={`/storage/${log.foto_kondisi}`} 
                                                        alt="Kondisi" 
                                                        className="w-20 h-20 object-cover rounded-xl border border-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => window.open(`/storage/${log.foto_kondisi}`, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-state">
                                        <svg className="empty-icon" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                        <span className="empty-text">Belum ada catatan. Mulai catat hari ini!</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
