import React, { useState, useEffect } from 'react';
import { apiRequest, INITIAL_ROOMS } from '@/services/api';
import {
  Plus, Edit, Trash2, UserPlus, UserMinus, X, Bed, ChevronRight,
  Filter, Building2, Check, AlertTriangle, Sparkles, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Resident {
  _id: string;
  name: string;
  email: string;
}

interface Room {
  _id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  residents: Resident[];
  monthlyFee: number;
  status: 'Available' | 'Full' | 'Maintenance';
}

const emptyForm = {
  roomNumber: '',
  floor: 1,
  capacity: 4,
  monthlyFee: 9500,
  status: 'Available' as const,
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFloor, setActiveFloor] = useState<number | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [assignRoom, setAssignRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedStudent, setSelectedStudent] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const d = await apiRequest('/rooms');
      if (d?.success && d.rooms) {
        setRooms(d.rooms);
      }
    } catch {
      setRooms(INITIAL_ROOMS as unknown as Room[]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassigned = async () => {
    try {
      const d = await apiRequest('/students?limit=100');
      if (d?.success && d.students) {
        setUnassigned(d.students.filter((s: any) => !s.roomNumber && s.status === 'Active'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchUnassigned();
  }, []);

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/rooms', { method: 'POST', body: JSON.stringify(formData) });
    } catch (err) {
      console.error(err);
    }
    setAddOpen(false);
    setFormData(emptyForm);
    fetchRooms();
  };

  const updateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    try {
      await apiRequest(`/rooms/${editRoom._id}`, { method: 'PUT', body: JSON.stringify(formData) });
    } catch (err) {
      console.error(err);
    }
    setEditRoom(null);
    fetchRooms();
  };

  const deleteRoom = async (id: string) => {
    const room = rooms.find(r => r._id === id);
    if (room && room.residents && room.residents.length > 0) {
      alert('Cannot delete an occupied room. Please reassign or remove residents first.');
      return;
    }
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await apiRequest(`/rooms/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error(err);
    }
    fetchRooms();
  };

  const assignResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRoom || !selectedStudent) return;
    try {
      await apiRequest('/rooms/assign', {
        method: 'POST',
        body: JSON.stringify({ roomId: assignRoom._id, studentId: selectedStudent }),
      });
    } catch (err) {
      console.error(err);
    }
    setAssignRoom(null);
    setSelectedStudent('');
    fetchRooms();
    fetchUnassigned();
  };

  const removeResident = async (roomId: string, studentId: string) => {
    if (!confirm('Remove resident from this bed?')) return;
    try {
      await apiRequest('/rooms/unassign', {
        method: 'POST',
        body: JSON.stringify({ roomId, studentId }),
      });
    } catch (err) {
      console.error(err);
    }
    fetchRooms();
    fetchUnassigned();
  };

  const openEdit = (r: Room) => {
    setEditRoom(r);
    setFormData({
      roomNumber: r.roomNumber,
      floor: r.floor,
      capacity: r.capacity,
      monthlyFee: r.monthlyFee,
      status: r.status,
    });
  };

  // Grouping & Filtering
  const filteredRooms = rooms.filter(r => {
    if (activeFloor !== 'all' && r.floor !== activeFloor) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  const roomsByFloor: Record<number, Room[]> = {};
  filteredRooms.forEach(r => {
    roomsByFloor[r.floor] = [...(roomsByFloor[r.floor] || []), r];
  });
  const floors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);

  // Summary Metrics
  const totalBeds = rooms.reduce((acc, r) => acc + (r.capacity || 0), 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + ((r.residents && r.residents.length) || 0), 0);
  const availableBeds = Math.max(0, totalBeds - occupiedBeds);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            <Building2 className="w-4 h-4" />
            <span>Accommodation Matrix</span>
          </div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Room Allocations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
            Floor layouts, bed capacities, resident check-ins, and maintenance.
          </p>
        </div>

        <button
          onClick={() => { setAddOpen(true); setFormData(emptyForm); }}
          className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Room</span>
        </button>
      </motion.div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Total Rooms</span>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white">{rooms.length}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Total Beds</span>
          <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{totalBeds}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Occupied Beds</span>
          <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{occupiedBeds}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Vacant Beds</span>
          <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{availableBeds}</span>
        </div>
      </div>

      {/* Floor Tab Selector & Status Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Floor Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 mr-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Floor:
          </span>
          {[
            { id: 'all', label: 'All Floors' },
            { id: 1, label: 'Floor 1' },
            { id: 2, label: 'Floor 2' },
            { id: 3, label: 'Floor 3' },
            { id: 4, label: 'Floor 4' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFloor(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFloor === f.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center space-x-2 self-end md:self-auto">
          <span className="text-xs font-semibold text-slate-400">Filter:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Room States</option>
            <option value="Available">Available Only</option>
            <option value="Full">Fully Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {/* Floor by Floor Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-56 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-slate-400">
          No rooms match the selected floor or status criteria.
        </div>
      ) : (
        <div className="space-y-8">
          {floors.map(floorNum => (
            <div key={floorNum} className="space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-black text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Floor {floorNum} Wing
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400">
                  {roomsByFloor[floorNum].length} room{roomsByFloor[floorNum].length > 1 ? 's' : ''} listed
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {roomsByFloor[floorNum].map((room, ri) => {
                  const resList = room.residents || [];
                  const isFull = resList.length >= room.capacity;
                  const percent = Math.round((resList.length / room.capacity) * 100);

                  return (
                    <motion.div
                      key={room._id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ri * 0.04 }}
                      whileHover={{ y: -3, transition: { duration: 0.15 } }}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        {/* Room Header */}
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-extrabold text-lg text-slate-900 dark:text-white block">
                              Room {room.roomNumber}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">
                              PKR {room.monthlyFee.toLocaleString()} / month
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              room.status === 'Full'
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : room.status === 'Maintenance'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            }`}
                          >
                            {room.status}
                          </span>
                        </div>

                        {/* Capacity Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            <span>Bed Space: {resList.length} of {room.capacity}</span>
                            <span>{percent}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull ? 'bg-red-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Bed Icons */}
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1.5">
                            {[...Array(room.capacity)].map((_, idx) => {
                              const occ = idx < resList.length;
                              return (
                                <div
                                  key={idx}
                                  title={occ ? `Occupied by: ${resList[idx].name}` : 'Vacant Bed'}
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                                    occ
                                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold'
                                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-300'
                                  }`}
                                >
                                  <Bed className="w-4 h-4" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Residents List */}
                        {resList.length > 0 && (
                          <div className="mb-4 space-y-1.5">
                            {resList.map(res => (
                              <div
                                key={res._id}
                                className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800"
                              >
                                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                                  {res.name}
                                </span>
                                <button
                                  onClick={() => removeResident(room._id, res._id)}
                                  title="Vacate this student from room"
                                  className="text-red-400 hover:text-red-500 p-0.5 transition-colors flex-shrink-0"
                                >
                                  <UserMinus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => openEdit(room)}
                            title="Edit Room Pricing & Specs"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-blue-500 hover:border-blue-400 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteRoom(room._id)}
                            title="Delete Room"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-red-500 hover:border-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => setAssignRoom(room)}
                          disabled={isFull || room.status === 'Maintenance'}
                          className="h-8 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center space-x-1.5 transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign Bed</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {(addOpen || editRoom) && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  {editRoom ? `Edit Room ${editRoom.roomNumber}` : 'Create New Room'}
                </h3>
                <button
                  onClick={() => { setAddOpen(false); setEditRoom(null); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editRoom ? updateRoom : createRoom} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Room Number *
                  </label>
                  <input
                    required
                    value={formData.roomNumber}
                    onChange={e => setFormData({ ...formData, roomNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    placeholder="e.g. 101, 204, 302"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Floor Number
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={formData.floor}
                      onChange={e => setFormData({ ...formData, floor: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Bed Capacity
                    </label>
                    <input
                      type="number"
                      required
                      min={editRoom ? (editRoom.residents || []).length || 1 : 1}
                      max={8}
                      value={formData.capacity}
                      onChange={e => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Monthly Rent (PKR)
                    </label>
                    <input
                      type="number"
                      required
                      min={1000}
                      step={500}
                      value={formData.monthlyFee}
                      onChange={e => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white outline-none focus:border-blue-500"
                    >
                      <option value="Available">Available</option>
                      <option value="Full">Full</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setAddOpen(false); setEditRoom(null); }}
                    className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/25"
                  >
                    Save Room
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Assign Resident Dialog */}
        {assignRoom && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-7 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">
                  Assign Bed in Room {assignRoom.roomNumber}
                </h3>
                <button
                  onClick={() => setAssignRoom(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-5">
                Select an active resident who currently does not have an allocated room bed.
              </p>

              <form onSubmit={assignResident} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Unassigned Students ({unassigned.length})
                  </label>
                  {unassigned.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center text-slate-400">
                      All active students currently have assigned rooms.
                    </div>
                  ) : (
                    <select
                      required
                      value={selectedStudent}
                      onChange={e => setSelectedStudent(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="">Select resident...</option>
                      {unassigned.map(s => (
                        <option key={s._id || s.id} value={s._id || s.id}>
                          {s.name} — {s.university || 'Student'} ({s.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAssignRoom(null)}
                    className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedStudent || unassigned.length === 0}
                    className="px-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/25 disabled:opacity-40"
                  >
                    Confirm Bed Allocation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
