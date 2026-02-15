import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const firstName = auth.user.name.split(' ')[0];
    
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Selamat Pagi';
    if (hour >= 12 && hour < 15) greeting = 'Selamat Siang';
    else if (hour >= 15 && hour < 18) greeting = 'Selamat Sore';
    else if (hour >= 18) greeting = 'Selamat Malam';

    const menuItems = [
        {
            title: 'Semai',
            description: 'Kelola pembibitan & penyemaian',
            href: route('nursery.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-3.4.8-4 3-.6 2.2.5 4 2 5.5V21M12 3c1.2 0 3.4.8 4 3 .6 2.2-.5 4-2 5.5M8 21h8M7 15c-2 0-4-1-4-3s1.5-3 3-3c.3 0 .6 0 .9.1M17 15c2 0 4-1 4-3s-1.5-3-3-3c-.3 0-.6 0-.9.1" />
                </svg>
            ),
        },
        {
            title: 'Produksi',
            description: 'Monitor kebun & lokasi tanam',
            href: route('production.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
            ),
        },
        {
            title: 'Panen',
            description: 'Catat & kelola hasil panen',
            href: route('harvest.index'),
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="page-container">
                {/* Greeting */}
                <div className="py-6 animate-fade-in-up" style={{ opacity: 0 }}>
                    <p className="text-sm text-gray-400 font-medium">{greeting},</p>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight mt-1">{firstName}</h1>
                    <p className="text-sm text-gray-400 mt-2">
                        {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 space-y-3">
                    {menuItems.map((item, index) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className={`card flex items-center gap-4 p-5 group animate-fade-in-up stagger-${index + 1}`}
                            style={{ opacity: 0 }}
                        >
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                            </div>
                            <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </Link>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
