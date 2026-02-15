import { Link, usePage } from '@inertiajs/react';

export default function BottomNav() {
    const { url } = usePage();

    const navItems = [
        {
            label: 'Semai',
            href: route('nursery.index'),
            active: url.startsWith('/nursery'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-3.4.8-4 3-.6 2.2.5 4 2 5.5V21M12 3c1.2 0 3.4.8 4 3 .6 2.2-.5 4-2 5.5M8 21h8M7 15c-2 0-4-1-4-3s1.5-3 3-3c.3 0 .6 0 .9.1M17 15c2 0 4-1 4-3s-1.5-3-3-3c-.3 0-.6 0-.9.1" />
                </svg>
            )
        },
        {
            label: 'Produksi',
            href: route('production.index'),
            active: url.startsWith('/production'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
            )
        },
        {
            label: 'Panen',
            href: route('harvest.index'),
            active: url.startsWith('/harvest'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
            )
        },
    ];

    return (
        <div className="bottom-nav">
            <div className="bottom-nav-inner">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={`nav-item ${item.active ? 'active' : ''}`}
                    >
                        {item.icon}
                        <span className="nav-label">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
