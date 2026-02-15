import Dropdown from '@/Components/Dropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import BottomNav from '@/Components/BottomNav';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    return (
        <div className="min-h-screen bg-[#fafafa]">
            {/* Top Bar - minimal */}
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="page-container !py-0">
                    <div className="flex h-14 items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.2 0-3.4.8-4 3-.6 2.2.5 4 2 5.5V21M12 3c1.2 0 3.4.8 4 3 .6 2.2-.5 4-2 5.5M8 21h8" />
                                </svg>
                            </div>
                            <span className="text-sm font-bold text-gray-900 tracking-tight hidden sm:block">
                                Sangkolo Garden
                            </span>
                        </Link>

                        {/* User */}
                        <Dropdown>
                            <Dropdown.Trigger>
                                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors duration-200">
                                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                    </div>
                                    <span className="font-medium hidden sm:block">{user.name}</span>
                                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>
                            </Dropdown.Trigger>
                            <Dropdown.Content>
                                <Dropdown.Link href={route('profile.edit')}>
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link href={route('logout')} method="post" as="button">
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </nav>

            {/* Header */}
            {header && (
                <header className="bg-white border-b border-gray-100">
                    <div className="page-container !py-4">
                        {header}
                    </div>
                </header>
            )}

            {/* Content */}
            <main className="pb-28">
                {children}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}
