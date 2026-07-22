"use client";
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar, Clock, MapPin, Search, Wrench, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SchedulingPage() {
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<any[]>([]);

    const fetchAppointments = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/schedule/list');
            const data = await res.json();
            setAppointments(data.reverse()); // Show newest first
        } catch (e) {
            console.error("Failed to fetch history", e);
        }
    };

    React.useEffect(() => {
        fetchAppointments();
    }, []);

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return { day: d.getDate(), month: d.toLocaleString('default', { month: 'short' }), weekDay: d.toLocaleString('default', { weekday: 'short' }) };
    });

    const times = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

    const handleBooking = async () => {
        if (selectedDate === null || !selectedTime) {
            alert("Please select a date and time.");
            return;
        }

        const date = dates[selectedDate];
        // Demo purpose: Just use current date + offset
        const bookingTime = new Date();
        bookingTime.setDate(bookingTime.getDate() + selectedDate);
        bookingTime.setHours(parseInt(selectedTime), 0, 0, 0);

        try {
            const response = await fetch('http://127.0.0.1:8000/schedule/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicle_id: "veh_001",
                    service_type: "Routine Maintenance",
                    preferred_time: bookingTime.toISOString(),
                    customer_id: "user_123"
                })
            });

            if (response.ok) {
                alert("Booking Confirmed!");
                setSelectedDate(null);
                setSelectedTime(null);
                fetchAppointments();
            } else {
                alert("Booking failed.");
            }
        } catch (e) {
            console.error(e);
            alert("Error connecting to server.");
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4 mb-2">
                    <div className="p-3 bg-emerald-500/20 rounded-xl">
                        <Calendar className="text-emerald-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Service Scheduling</h1>
                        <p className="text-slate-400">Book maintenance and repairs with certified centers</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Booking Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="glass-panel p-8 rounded-2xl">
                            <h2 className="text-xl font-bold text-white mb-6">Select Appointment</h2>

                            {/* Date Picker */}
                            <div className="mb-8">
                                <label className="text-sm text-slate-400 mb-3 block">Available Dates</label>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {dates.map((date, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedDate(i)}
                                            className={cn(
                                                "min-w-[80px] p-4 rounded-xl border transition-all flex flex-col items-center gap-1",
                                                selectedDate === i
                                                    ? "bg-emerald-500/20 border-emerald-500/50 text-white"
                                                    : "bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-600"
                                            )}
                                        >
                                            <span className="text-xs uppercase font-bold">{date.month}</span>
                                            <span className="text-2xl font-bold">{date.day}</span>
                                            <span className="text-xs opacity-70">{date.weekDay}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Picker */}
                            <div className="mb-8">
                                <label className="text-sm text-slate-400 mb-3 block">Available Slots</label>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                    {times.map((time, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedTime(time)}
                                            className={cn(
                                                "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                                                selectedTime === time
                                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                                                    : "bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-600"
                                            )}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex justify-end">
                                <button
                                    onClick={handleBooking}
                                    disabled={selectedDate === null || !selectedTime}
                                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                                    Confirm Scheduling
                                </button>
                            </div>
                        </div>

                        {/* Recent Service History */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-lg font-bold text-white mb-4">Service History</h3>
                            <div className="space-y-4">
                                {appointments.length === 0 ? (
                                    <p className="text-slate-500 text-sm">No service history found.</p>
                                ) : (
                                    appointments.map((appt: any, i: number) => (
                                        <div key={i} className="flex items-center gap-4 p-4 bg-slate-950/30 rounded-xl border border-slate-800/50">
                                            <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                                <Wrench size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-slate-200 font-medium">{appt.issue}</h4>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(appt.time).toLocaleDateString()} • {new Date(appt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <div className="text-emerald-400 flex items-center gap-1 text-sm">
                                                <CheckCircle size={14} />
                                                <span>{appt.status}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Service Centers List */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 rounded-2xl h-full">
                            <h2 className="text-lg font-bold text-white mb-4">Nearby Centers</h2>
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search location..."
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>

                            <div className="space-y-3">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="p-3 hover:bg-slate-800/50 transition-colors rounded-xl cursor-pointer group">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="text-slate-200 font-medium group-hover:text-emerald-400 transition-colors">Downtown OEM Hub</h4>
                                            <span className="text-xs font-mono bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded">1.2km</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-2">
                                            <MapPin size={12} />
                                            <span>1200 Auto Park Blvd, District 4</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">Specialist</span>
                                            <span className="text-[10px] uppercase font-bold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Fast Lane</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
