import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const ScheduleDashboard = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Admin form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ courseId: '', lecturerId: '', roomId: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchedules();
  }, [user]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      let res;
      if (user.role === 'LECTURER') {
        res = await api.get(`/schedules/lecturer/${user.id}`);
      } else if (user.role === 'STUDENT') {
        res = await api.get(`/schedules/student/${user.id}`);
      } else {
        res = await api.get('/schedules');
        
        // Fetch reference data for the Admin form
        const [cRes, tRes, rRes] = await Promise.all([
          api.get('/courses'),
          api.get('/lecturers'),
          api.get('/rooms')
        ]);
        if (cRes && cRes.success) setCourses(cRes.data || []);
        if (tRes && tRes.success) setTutors(tRes.data?.filter(t => t.status === 'ACTIVE') || []);
        if (rRes && rRes.success) setRooms(rRes.data || []);
      }
      
      if (res && res.success) setSchedules(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        ...formData,
        dayOfWeek: formData.dayOfWeek.toUpperCase(),
        startTime: formData.startTime.length === 5 ? formData.startTime + ':00' : formData.startTime,
        endTime: formData.endTime.length === 5 ? formData.endTime + ':00' : formData.endTime
      };
      const res = await api.post('/schedules', payload);
      if (res.success) {
        setShowForm(false);
        fetchSchedules();
      }
    } catch (err) {
      setError(err.message || 'Conflict detected or invalid schedule data.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to completely delete this schedule?")) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      alert("Failed to delete schedule");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading schedules...</div>;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Class Schedule</h1>
          <p className="text-surface-500">View and manage timetables and room allocations.</p>
        </div>
        {user.role === 'ADMIN' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Class
          </button>
        )}
      </div>

      {showForm && user.role === 'ADMIN' && (
        <div className="card mb-6 border-primary-200 bg-primary-50">
          <h2 className="text-lg font-bold text-surface-900 mb-4">Create Schedule Entry</h2>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Course</label>
              <select className="input-field py-2" required value={formData.courseId} onChange={e => setFormData({...formData, courseId: parseInt(e.target.value)})}>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseCode} - {c.courseName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Lecturer</label>
              <select className="input-field py-2" required value={formData.lecturerId} onChange={e => setFormData({...formData, lecturerId: parseInt(e.target.value)})}>
                <option value="">Select Lecturer</option>
                {tutors.map(t => <option key={t.lecturerId} value={t.lecturerId}>{t.fullName}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Room</label>
              <select className="input-field py-2" required value={formData.roomId} onChange={e => setFormData({...formData, roomId: parseInt(e.target.value)})}>
                <option value="">Select Room</option>
                {rooms.map(r => <option key={r.roomId} value={r.roomId}>{r.roomNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Day</label>
              <select className="input-field py-2" value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: e.target.value})}>
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Start Time (HH:MM)</label>
              <input type="time" className="input-field py-2" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">End Time (HH:MM)</label>
              <input type="time" className="input-field py-2" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
            </div>
            <div className="md:col-span-3 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary py-2">Cancel</button>
              <button type="submit" className="btn-primary py-2">Save Schedule</button>
            </div>
          </form>
        </div>
      )}

      {/* Timetable Grid View */}
      <div className="card overflow-x-auto shadow-sm border border-surface-200">
        <div className="min-w-[1000px]">
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-4 border-b border-surface-200 pb-4 mb-4 font-bold text-surface-700 bg-surface-50/50 p-4 rounded-t-xl">
            <div className="text-surface-500 font-semibold pl-2">Time Slot</div>
            {days.map(day => <div key={day} className="text-center">{day}</div>)}
          </div>
          
          <div className="grid grid-cols-6 gap-4 p-4 min-h-[400px]">
            {/* Time Column (Static markers) */}
            <div className="border-r border-surface-100 pr-4 space-y-12 text-sm font-medium text-surface-400 pt-2 relative">
              <div>08:00 AM</div>
              <div>10:00 AM</div>
              <div>12:00 PM</div>
              <div>02:00 PM</div>
              <div>04:00 PM</div>
            </div>
            
            {/* Day Columns */}
            {days.map(day => {
               const daySchedules = schedules
                 .filter(s => s.dayOfWeek.toUpperCase() === day.toUpperCase())
                 .sort((a, b) => a.startTime.localeCompare(b.startTime));
                 
               return (
                 <div key={day} className="space-y-4 relative border-r border-surface-50 last:border-0 pr-2 pb-6">
                    {daySchedules.length === 0 && (
                      <div className="h-full flex items-center justify-center text-xs text-surface-300 italic py-8">
                        No Classes
                      </div>
                    )}
                    {daySchedules.map(sch => (
                       <div key={sch.scheduleId} className="p-3 rounded-xl border border-primary-200 bg-primary-50/80 hover:shadow-md hover:border-primary-400 transition-all text-sm group cursor-pointer relative overflow-hidden">
                         <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                         
                         {user.role === 'ADMIN' && (
                           <button 
                             onClick={(e) => { e.stopPropagation(); handleDelete(sch.scheduleId); }} 
                             className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded-md shadow-sm z-10"
                             title="Delete Schedule"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         )}

                         <h3 className="font-bold text-primary-900 leading-tight mb-2 pl-2 pr-6">{sch.courseName}</h3>
                         <div className="space-y-1.5 pl-2">
                           <div className="flex items-center gap-2 text-surface-700 text-xs font-medium">
                             <Clock className="w-3.5 h-3.5 text-primary-500" />
                             <span>{sch.startTime.slice(0,5)} - {sch.endTime.slice(0,5)}</span>
                           </div>
                           <div className="flex items-center gap-2 text-surface-700 text-xs">
                             <MapPin className="w-3.5 h-3.5 text-primary-500" />
                             <span>Room {sch.roomNumber || sch.roomId}</span>
                           </div>
                           <div className="flex items-center gap-2 text-surface-600 text-xs">
                             <CalendarIcon className="w-3.5 h-3.5 text-surface-400" />
                             <span className="truncate max-w-[120px]" title={sch.lecturerName}>{sch.lecturerName}</span>
                           </div>
                         </div>
                       </div>
                    ))}
                 </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDashboard;
