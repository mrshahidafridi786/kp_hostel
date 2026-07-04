import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import { Plus, Edit, Trash2, UserPlus, UserMinus, X, Bed, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Resident { _id: string; name: string; email: string; }
interface Room { _id: string; roomNumber: string; floor: number; capacity: number; residents: Resident[]; monthlyFee: number; status: 'Available' | 'Full' | 'Maintenance'; }

const MOCK_ROOMS: Room[] = [
  { _id: '1', roomNumber: '101', floor: 1, capacity: 4, residents: [{ _id: 's1', name: 'Shahid Afridi', email: 'student@kpyouth.com' }], monthlyFee: 9500, status: 'Available' },
  { _id: '2', roomNumber: '102', floor: 1, capacity: 4, residents: [{ _id: 's2', name: 'Zeeshan Ali', email: 'zeeshan@kpyouth.com' }], monthlyFee: 9500, status: 'Available' },
  { _id: '3', roomNumber: '201', floor: 2, capacity: 2, residents: [], monthlyFee: 14000, status: 'Available' },
  { _id: '4', roomNumber: '202', floor: 2, capacity: 2, residents: [{ _id: 's3', name: 'Asad Ali', email: 'asad@kpyouth.com' }, { _id: 's4', name: 'Adnan Khan', email: 'adnan@kpyouth.com' }], monthlyFee: 14000, status: 'Full' },
  { _id: '5', roomNumber: '301', floor: 3, capacity: 1, residents: [], monthlyFee: 18000, status: 'Available' },
];
const MOCK_UNASSIGNED = [{ _id: 's5', name: 'Kamran Akmal', email: 'kamran@kpyouth.com' }, { _id: 's6', name: 'Younis Khan', email: 'younis@kpyouth.com' }];

const emptyForm = { roomNumber: '', floor: 1, capacity: 4, monthlyFee: 9500, status: 'Available' as const };

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [unassigned, setUnassigned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [assignRoom, setAssignRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedStudent, setSelectedStudent] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const d = await apiRequest('/rooms');
      if (d?.success) setRooms(d.rooms);
    } catch { setRooms(MOCK_ROOMS); }
    finally { setLoading(false); }
  };
  const fetchUnassigned = async () => {
    try {
      const d = await apiRequest('/students?limit=100');
      if (d?.success) setUnassigned(d.students.filter((s: any) => !s.roomNumber && s.status === 'Active'));
    } catch { setUnassigned(MOCK_UNASSIGNED); }
  };
  useEffect(() => { fetchRooms(); fetchUnassigned(); }, []);

  const createRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await apiRequest('/rooms', { method: 'POST', body: JSON.stringify(formData) }); }
    catch { setRooms(prev => [...prev, { _id: Date.now().toString(), ...formData, residents: [] }]); }
    setAddOpen(false); fetchRooms();
  };
  const updateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    try { await apiRequest(`/rooms/${editRoom._id}`, { method: 'PUT', body: JSON.stringify(formData) }); }
    catch { setRooms(prev => prev.map(r => r._id === editRoom._id ? { ...r, ...formData } : r)); }
    setEditRoom(null); fetchRooms();
  };
  const deleteRoom = async (id: string) => {
    const room = rooms.find(r => r._id === id);
    if (room && room.residents.length > 0) { alert('Cannot delete a room with assigned students.'); return; }
    if (!confirm('Delete this room?')) return;
    try { await apiRequest(`/rooms/${id}`, { method: 'DELETE' }); }
    catch { setRooms(prev => prev.filter(r => r._id !== id)); return; }
    fetchRooms();
  };
  const assignResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRoom || !selectedStudent) return;
    try { await apiRequest('/rooms/assign', { method: 'POST', body: JSON.stringify({ roomId: assignRoom._id, studentId: selectedStudent }) }); }
    catch {
      const stu = unassigned.find(s => s._id === selectedStudent);
      if (stu && assignRoom) {
        setRooms(prev => prev.map(r => r._id === assignRoom._id ? { ...r, residents: [...r.residents, stu], status: r.residents.length + 1 >= r.capacity ? 'Full' : 'Available' } : r));
        setUnassigned(prev => prev.filter(s => s._id !== selectedStudent));
      }
    }
    setAssignRoom(null); setSelectedStudent(''); fetchRooms(); fetchUnassigned();
  };
  const removeResident = async (roomId: string, studentId: string) => {
    if (!confirm('Remove this student from room?')) return;
    try { await apiRequest('/rooms/remove', { method: 'POST', body: JSON.stringify({ roomId, studentId }) }); }
    catch { setRooms(prev => prev.map(r => r._id === roomId ? { ...r, residents: r.residents.filter(res => res._id !== studentId), status: 'Available' } : r)); fetchUnassigned(); return; }
    fetchRooms(); fetchUnassigned();
  };

  const openEdit = (r: Room) => { setEditRoom(r); setFormData({ roomNumber: r.roomNumber, floor: r.floor, capacity: r.capacity, monthlyFee: r.monthlyFee, status: r.status }); };

  const roomsByFloor: Record<number, Room[]> = {};
  rooms.forEach(r => { roomsByFloor[r.floor] = [...(roomsByFloor[r.floor] || []), r]; });
  const floors = Object.keys(roomsByFloor).map(Number).sort((a,b) => a-b);

  const RoomForm = ({ title, onSubmit, onClose, disabledCapMin }: any) => (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Room Number</label>
            <input required value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} className="input-base text-xs" placeholder="e.g. 101" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Floor</label>
              <input type="number" required min={1} max={10} value={formData.floor} onChange={e => setFormData({...formData, floor: +e.target.value})} className="input-base text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Capacity</label>
              <input type="number" required min={disabledCapMin||1} max={10} value={formData.capacity} onChange={e => setFormData({...formData, capacity: +e.target.value})} className="input-base text-xs" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Monthly Fee (PKR)</label>
              <input type="number" required min={0} value={formData.monthlyFee} onChange={e => setFormData({...formData, monthlyFee: +e.target.value})} className="input-base text-xs" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Status</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="input-base text-xs">
                <option value="Available">Available</option><option value="Full">Full</option><option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">Cancel</button>
            <button type="submit" className="px-6 h-10 rounded-xl btn-gradient text-xs">Save</button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">Room Planner</h1>
          <p className="text-slate-400 text-xs">Configure rooms, monitor occupancy, assign students</p>
        </div>
        <button onClick={() => { setAddOpen(true); setFormData(emptyForm); }} className="h-10 px-5 rounded-xl btn-gradient text-xs flex items-center space-x-2 self-start">
          <Plus className="w-4 h-4" /><span>Create Room</span>
        </button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i) => <div key={i} className="h-56 shimmer rounded-2xl" />)}
        </div>
      ) : rooms.length === 0 ? (
        <div className="p-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 text-slate-400">
          No rooms configured. Click "Create Room" to begin.
        </div>
      ) : (
        <div className="space-y-10">
          {floors.map(floorNum => (
            <div key={floorNum} className="space-y-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm uppercase tracking-widest text-blue-600 dark:text-blue-400">Floor {floorNum}</h3>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] text-slate-400">{roomsByFloor[floorNum].length} room{roomsByFloor[floorNum].length>1?'s':''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {roomsByFloor[floorNum].map((room, ri) => {
                  const isFull = room.residents.length >= room.capacity;
                  return (
                    <motion.div key={room._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.08 }}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 shadow-sm card-shine flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="font-extrabold text-lg text-slate-800 dark:text-white block">Room {room.roomNumber}</span>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">PKR {room.monthlyFee.toLocaleString()} / mo</span>
                        </div>
                        <span className={`${room.status==='Full'?'badge-red':room.status==='Maintenance'?'badge-amber':'badge-green'}`}>{room.status}</span>
                      </div>

                      <div className="mb-5">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Beds ({room.residents.length}/{room.capacity})</span>
                        <div className="flex space-x-1.5">
                          {[...Array(room.capacity)].map((_, idx) => {
                            const occ = idx < room.residents.length;
                            return (
                              <div key={idx} title={occ ? `${room.residents[idx].name}` : 'Vacant'}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center border-2 transition-all ${occ ? 'bg-blue-500/10 border-blue-400/40 text-blue-500' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-300'}`}>
                                <Bed className="w-4 h-4" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {room.residents.length > 0 && (
                        <div className="mb-5 space-y-1.5">
                          {room.residents.map(res => (
                            <div key={res._id} className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{res.name}</span>
                              <button onClick={() => removeResident(room._id, res._id)} className="text-red-400 hover:text-red-500 p-0.5 transition-colors"><UserMinus className="w-3.5 h-3.5" /></button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex space-x-1.5">
                          <button onClick={() => openEdit(room)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-500 hover:border-blue-300 transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteRoom(room._id)} className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                        <button onClick={() => setAssignRoom(room)} disabled={isFull || room.status === 'Maintenance'}
                          className="h-8 px-3 rounded-lg border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-blue-500 text-[11px] font-semibold flex items-center space-x-1 transition-all">
                          <UserPlus className="w-3.5 h-3.5" /><span>Assign</span>
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

      <AnimatePresence>
        {addOpen && <RoomForm title="Create Room" onSubmit={createRoom} onClose={() => setAddOpen(false)} />}
        {editRoom && <RoomForm title={`Edit Room ${editRoom.roomNumber}`} onSubmit={updateRoom} onClose={() => setEditRoom(null)} disabledCapMin={editRoom.residents.length} />}

        {assignRoom && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Assign to Room {assignRoom.roomNumber}</h3>
                <button onClick={() => setAssignRoom(null)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={assignResident} className="space-y-5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Select Unassigned Student</label>
                  {unassigned.length === 0 ? (
                    <p className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-center">No unassigned active students.</p>
                  ) : (
                    <select required value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="input-base text-xs">
                      <option value="">Choose a student...</option>
                      {unassigned.map(s => <option key={s._id} value={s._id}>{s.name} ({s.email})</option>)}
                    </select>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setAssignRoom(null)} className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">Cancel</button>
                  <button type="submit" disabled={!selectedStudent || unassigned.length === 0} className="px-6 h-10 rounded-xl btn-gradient text-xs disabled:opacity-50">Confirm Assign</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
