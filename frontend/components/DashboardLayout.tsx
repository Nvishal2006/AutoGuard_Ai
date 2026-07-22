"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Calendar, BarChart3, Settings, X, Bell, Shield, User, Globe, Check } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile State
    const [profile, setProfile] = useState({
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Lead Technician',
        notifications: true,
        language: 'English'
    });

    useEffect(() => {
        if (isSettingsOpen) {
            fetchProfile();
        }
    }, [isSettingsOpen]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get('http://localhost:8000/profile');
            setProfile(res.data);
        } catch (e) {
            console.error("Failed to fetch profile", e);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await axios.post('http://localhost:8000/profile', profile);
            alert("Settings Saved Successfully!");
        } catch (e) {
            console.error("Failed to save profile", e);
            alert("Failed to save settings.");
        }
    };

    const navItems = [
        { name: 'Real-Time Status', href: '/', icon: LayoutDashboard },
        { name: 'Service Scheduling', href: '/scheduling', icon: Calendar },
        { name: 'OEM Insights', href: '/insights', icon: BarChart3 },
        { name: 'UEBA Security', href: '/ueba', icon: Shield },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a0a0f] text-slate-100 font-sans selection:bg-blue-500/30">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-950/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col relative z-20">
                <div className="p-8 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <div className="w-3 h-3 bg-white rounded-full" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent tracking-tight">
                            AutoGuard AI
                        </h1>
                        <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Predictive Ecosystem</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block relative group"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-blue-600/10 rounded-xl border border-blue-600/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={cn(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive ? "text-blue-400" : "text-slate-400 group-hover:text-slate-200"
                                )}>
                                    <Icon size={20} className={cn("transition-transform duration-200", isActive && "scale-110")} />
                                    <span className="font-medium">{item.name}</span>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-slate-900/50 hover:text-slate-300 transition-all font-medium"
                    >
                        <Settings size={18} />
                        <span className="text-sm">System Settings</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Ambient Background Glow */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px] pointer-events-none" />

                <header className="h-20 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-medium text-green-400">System Online</span>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center shadow-lg">
                            <span className="text-xs font-bold text-white">{profile.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto px-8 pb-8 z-10 scroll-smooth">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {children}
                    </motion.div>
                </div>
            </main>

            {/* Settings Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex h-[600px]"
                        >
                            {/* Sidebar */}
                            <div className="w-56 bg-slate-950/50 border-r border-slate-800 p-4 space-y-2">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Settings</div>
                                {[
                                    { id: 'profile', name: 'Profile', icon: User },
                                    { id: 'notifications', name: 'Notifications', icon: Bell },
                                    { id: 'security', name: 'Security', icon: Shield },
                                    { id: 'language', name: 'Language', icon: Globe },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-colors",
                                            activeTab === tab.id ? "bg-blue-600/10 text-blue-400" : "text-slate-400 hover:bg-slate-800"
                                        )}
                                    >
                                        <tab.icon size={16} /> {tab.name}
                                    </button>
                                ))}
                            </div>

                            {/* Content */}
                            <div className="flex-1 flex flex-col">
                                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                                    <h3 className="text-lg font-bold text-white capital">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                                    <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-slate-900/30">
                                    {activeTab === 'profile' && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                                                    <span className="text-2xl font-bold text-slate-400">{profile.name.substring(0, 2).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-semibold text-white">{profile.name}</h4>
                                                    <p className="text-slate-400 text-sm">{profile.role}</p>
                                                    <button className="mt-2 text-xs text-blue-400 hover:text-blue-300">Change Avatar</button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-slate-500">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={profile.name}
                                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs text-slate-500">Role</label>
                                                    <input
                                                        type="text"
                                                        value={profile.role}
                                                        onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-slate-500">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'notifications' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                                <div className="flex items-center gap-3">
                                                    <Bell size={18} className="text-blue-400" />
                                                    <div className="text-sm">
                                                        <div className="font-medium text-slate-200">Email Alerts</div>
                                                        <div className="text-xs text-slate-500">Receive critical alerts via email</div>
                                                    </div>
                                                </div>
                                                <div className="relative inline-block w-10 h-5 align-middle select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={profile.notifications}
                                                        onChange={(e) => setProfile({ ...profile, notifications: e.target.checked })}
                                                        className="absolute block w-5 h-5 rounded-full bg-[#0a0a0f] border-2 border-slate-600 appearance-none cursor-pointer checked:right-0 checked:border-blue-500"
                                                    />
                                                    <label className={`block overflow-hidden h-5 rounded-full cursor-pointer ${profile.notifications ? 'bg-blue-600' : 'bg-slate-700'}`}></label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'security' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                                                <h5 className="text-sm font-bold text-yellow-400 mb-1">Two-Factor Authentication</h5>
                                                <p className="text-xs text-slate-400 mb-3">Add an extra layer of security to your account.</p>
                                                <button className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-md hover:bg-yellow-500/30 transition-colors">
                                                    Enable 2FA
                                                </button>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-slate-500">Current Password</label>
                                                <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs text-slate-500">New Password</label>
                                                <input type="password" placeholder="••••••••" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'language' && (
                                        <div className="space-y-4">
                                            {['English', 'Spanish', 'French', 'German'].map(lang => (
                                                <div
                                                    key={lang}
                                                    onClick={() => setProfile({ ...profile, language: lang })}
                                                    className={cn(
                                                        "p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all",
                                                        profile.language === lang
                                                            ? "bg-blue-600/10 border-blue-500/50"
                                                            : "bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    <span className={cn("text-sm font-medium", profile.language === lang ? "text-blue-400" : "text-slate-300")}>{lang}</span>
                                                    {profile.language === lang && <Check size={16} className="text-blue-400" />}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2"
                                    >
                                        <Check size={16} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
