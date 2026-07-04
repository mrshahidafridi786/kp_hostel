"use client";

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/services/api';
import {
  Plus, Edit, Trash2, UserPlus, UserMinus, ShieldAlert,
  DoorOpen, Check, X, Users, Bed, ChevronRight, HelpCircle
} from 'lucide-react';

interface Resident {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
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

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [assignRoom, setAssignRoom] = useState<Room | null>(null);
  const [manageResidentsRoom, setManageResidentsRoom] = useState<Room | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 1,
    capacity: 4,
    monthlyFee: 9500,
    status: 'Available' as any
  });
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/rooms');
      if (data?.success && data?.rooms) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.warn('[ROOMS] Fetch failed, using mock');
      const mockRooms: Room[] = [
        { _id: '1', roomNumber: '101', floor: 1, capacity: 4, residents: [{ _id: 's1', name: 'Shahid Afridi', email: 'student@kpyouth.com' }], monthlyFee: 9500, status: 'Available' },
        { _id: '2', roomNumber: '102', floor: 1, capacity: 4, residents: [{ _id: 's2', name: 'Zeeshan Ali', email: 'zeeshan@kpyouth.com' }], monthlyFee: 9500, status: 'Available' },
        { _id: '3', roomNumber: '201', floor: 2, capacity: 2, residents: [], monthlyFee: 14000, status: 'Available' },
        { _id: '4', roomNumber: '202', floor: 2, capacity: 2, residents: [{ _id: 's3', name: 'Asad Ali', email: 'asad@kpyouth.com' }, { _id: 's4', name: 'Adnan Khan', email: 'adnan@kpyouth.com' }], monthlyFee: 14000, status: 'Full' },
        { _id: '5', roomNumber: '301', floor: 3, capacity: 1, residents: [], monthlyFee: 18000, status: 'Available' }
      ];
      setRooms(mockRooms);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnassignedStudents = async () => {
    try {
      // Find all students, then filter for ones with roomNumber undefined
      const data = await apiRequest('/students?limit=100');
      if (data?.success && data?.students) {
        const unassigned = data.students.filter((s: any) => !s.roomNumber && s.status === 'Active');
        setUnassignedStudents(unassigned);
      }
    } catch (err) {
      // Mock unassigned students if API is offline
      setUnassignedStudents([
        { _id: 's5', name: 'Kamran Akmal', email: 'kamran@kpyouth.com' },
        { _id: 's6', name: 'Younis Khan', email: 'younis@kpyouth.com' }
      ]);
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchUnassignedStudents();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await apiRequest('/rooms', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (data.success) {
        setAddModalOpen(false);
        fetchRooms();
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to create room');
      // Mock add
      setRooms(prev => [...prev, { _id: Date.now().toString(), ...formData, residents: [] }]);
      setAddModalOpen(false);
    }
  };

  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    setError(null);
    try {
      const data = await apiRequest(`/rooms/${editRoom._id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      if (data.success) {
        setEditRoom(null);
        fetchRooms();
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to update room');
      // Mock update
      setRooms(prev => prev.map(r => r._id === editRoom._id ? { ...r, ...formData } : r));
      setEditRoom(null);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    const room = rooms.find(r => r._id === id);
    if (room && room.residents.length > 0) {
      alert('Cannot delete a room that still has assigned student residents.');
      return;
    }
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await apiRequest(`/rooms/${id}`, { method: 'DELETE' });
      fetchRooms();
    } catch (err) {
      console.error(err);
      // Mock delete
      setRooms(prev => prev.filter(r => r._id !== id));
    }
  };

  const handleAssignResident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRoom || !selectedStudentId) return;
    try {
      const data = await apiRequest('/rooms/assign', {
        method: 'POST',
        body: JSON.stringify({ roomId: assignRoom._id, studentId: selectedStudentId })
      });
      if (data.success) {
        setAssignRoom(null);
        setSelectedStudentId('');
        fetchRooms();
        fetchUnassignedStudents();
      }
    } catch (err) {
      console.error('Assign failed', err);
      // Mock assign for demo
      const student = unassignedStudents.find(s => s._id === selectedStudentId);
      if (student && assignRoom) {
        setRooms(prev => prev.map(r => {
          if (r._id === assignRoom._id) {
            const updatedResidents = [...r.residents, student];
            return {
              ...r,
              residents: updatedResidents,
              status: updatedResidents.length >= r.capacity ? 'Full' : 'Available'
            };
          }
          return r;
        }));
        setUnassignedStudents(prev => prev.filter(s => s._id !== selectedStudentId));
      }
      setAssignRoom(null);
      setSelectedStudentId('');
    }
  };

  const handleRemoveResident = async (roomId: string, studentId: string) => {
    if (!confirm('Are you sure you want to discharge this student from this room?')) return;
    try {
      const data = await apiRequest('/rooms/remove', {
        method: 'POST',
        body: JSON.stringify({ roomId, studentId })
      });
      if (data.success) {
        setManageResidentsRoom(null);
        fetchRooms();
        fetchUnassignedStudents();
      }
    } catch (err) {
      console.error('Remove failed', err);
      // Mock remove for demo
      setRooms(prev => prev.map(r => {
        if (r._id === roomId) {
          const updatedResidents = r.residents.filter(res => res._id !== studentId);
          return {
            ...r,
            residents: updatedResidents,
            status: 'Available'
          };
        }
        return r;
      }));
      setManageResidentsRoom(null);
      fetchUnassignedStudents();
    }
  };

  const openEditModal = (room: Room) => {
    setEditRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      floor: room.floor,
      capacity: room.capacity,
      monthlyFee: room.monthlyFee,
      status: room.status
    });
  };

  const openAddModal = () => {
    setAddModalOpen(true);
    setFormData({
      roomNumber: '',
      floor: 1,
      capacity: 4,
      monthlyFee: 9500,
      status: 'Available'
    });
  };

  // Group rooms by floors
  const roomsByFloor: { [key: number]: Room[] } = {};
  rooms.forEach(room => {
    if (!roomsByFloor[room.floor]) {
      roomsByFloor[room.floor] = [];
    }
    roomsByFloor[room.floor].push(room);
  });

  const sortedFloors = Object.keys(roomsByFloor).map(Number).sort((a, b) => a - b);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
            Room Planner
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs">
            Configure rooms layouts, monitor occupancy levels, and assign students to floors.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="h-10 px-5 rounded-xl btn-gradient text-xs font-semibold flex items-center space-x-2 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Create Room</span>
        </button>
      </div>

      {/* Visual Floor Layout Display */}
      {rooms.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 text-slate-400">
          No rooms configured. Click &quot;Create Room&quot; to begin setting up your hostel layout.
        </div>
      ) : (
        <div className="space-y-12">
          {sortedFloors.map(floorNum => (
            <div key={floorNum} className="space-y-4">
              {/* Floor Header Label */}
              <h3 className="font-display font-extrabold text-sm uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center space-x-2">
                <span>Floor {floorNum}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </h3>

              {/* Floor Rooms Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                {roomsByFloor[floorNum].map(room => {
                  const vacancy = room.capacity - room.residents.length;
                  const isFull = vacancy <= 0;
                  
                  return (
                    <div
                      key={room._id}
                      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* Room Title */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="font-display font-extrabold text-lg text-slate-800 dark:text-white block">
                              Room {room.roomNumber}
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                              Monthly rent: PKR {room.monthlyFee}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                            room.status === 'Full' ? 'bg-red-500/10 text-red-500' :
                            room.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          }`}>
                            {room.status}
                          </span>
                        </div>

                        {/* Bed Space visualization */}
                        <div className="mb-6">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Beds Vacancy</span>
                          <div className="flex space-x-2">
                            {[...Array(room.capacity)].map((_, idx) => {
                              const isOccupied = idx < room.residents.length;
                              const resident = isOccupied ? room.residents[idx] : null;
                              return (
                                <div
                                  key={idx}
                                  className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 ${
                                    isOccupied
                                      ? 'bg-blue-600/10 border-blue-500/20 text-blue-600 dark:text-blue-400'
                                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-300'
                                  }`}
                                  title={resident ? `Occupied by: ${resident.name}` : 'Vacant Bed'}
                                >
                                  <Bed className="w-4 h-4" />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Residents Name list */}
                        {room.residents.length > 0 && (
                          <div className="mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-450 font-bold uppercase block mb-2">Current Occupants</span>
                            <div className="space-y-1.5">
                              {room.residents.map(res => (
                                <div key={res._id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between items-center bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-850">
                                  <span>{res.name}</span>
                                  <button
                                    onClick={() => handleRemoveResident(room._id, res._id)}
                                    className="text-red-500 hover:text-red-400 p-0.5"
                                    title="Discharge resident"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                        <div className="flex space-x-1.5">
                          <button
                            onClick={() => openEditModal(room)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-blue-600 hover:bg-slate-50"
                            title="Edit Room Pricing"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRoom(room._id)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-500 hover:text-red-500 hover:bg-slate-50"
                            title="Delete Room"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => setAssignRoom(room)}
                          disabled={isFull || room.status === 'Maintenance'}
                          className="h-8 px-3 rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-blue-600 text-[11px] font-semibold flex items-center space-x-1"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign Resident</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- CREATE ROOM MODAL --- */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Create Room</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Room Number / Name</label>
                <input
                  type="text" required value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. 101"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Floor Level</label>
                  <input
                    type="number" required min={1} max={10} value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value, 10) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Beds Capacity</label>
                  <input
                    type="number" required min={1} max={10} value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Monthly Rent / Fee (PKR)</label>
                <input
                  type="number" required min={0} value={formData.monthlyFee}
                  onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value, 10) })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. 9500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setAddModalOpen(false)}
                  className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 h-10 rounded-xl btn-gradient font-semibold">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT ROOM MODAL --- */}
      {editRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Edit Room</h3>
              <button onClick={() => setEditRoom(null)} className="text-slate-400 hover:text-slate-650">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoom} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Room Number / Name</label>
                <input
                  type="text" required value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Floor Level</label>
                  <input
                    type="number" required min={1} max={10} value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value, 10) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Beds Capacity</label>
                  <input
                    type="number" required min={editRoom.residents?.length || 1} max={10} value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Monthly Rent (PKR)</label>
                  <input
                    type="number" required min={0} value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: parseInt(e.target.value, 10) })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Room Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setEditRoom(null)}
                  className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 h-10 rounded-xl btn-gradient font-semibold">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ASSIGN RESIDENT MODAL --- */}
      {assignRoom && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display font-extrabold text-xl text-slate-900 dark:text-white">Assign to Room {assignRoom.roomNumber}</h3>
              <button onClick={() => setAssignRoom(null)} className="text-slate-400 hover:text-slate-655">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignResident} className="space-y-5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">Select Unassigned Student</label>
                {unassignedStudents.length === 0 ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-450 text-center">
                    No active students are currently unassigned. Register new students first.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Choose a student...</option>
                    {unassignedStudents.map(student => (
                      <option key={student._id} value={student._id}>
                        {student.name} ({student.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button" onClick={() => setAssignRoom(null)}
                  className="px-5 h-10 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unassignedStudents.length === 0 || !selectedStudentId}
                  className="px-6 h-10 rounded-xl btn-gradient font-semibold disabled:opacity-50"
                >
                  Confirm Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
