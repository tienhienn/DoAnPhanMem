import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import { User, Phone, Mail, Calendar, Edit2, Award, Book, Shield, Activity } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    soDienThoai: '',
    ngaySinh: '',
    gioiTinh: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/students/me');
      const result = response.data;
      if (result.success) {
        setProfile(result.data);
        setFormData({
          soDienThoai: result.data.soDienThoai || '',
          ngaySinh: result.data.ngaySinh ? result.data.ngaySinh.split('T')[0] : '',
          gioiTinh: result.data.gioiTinh || ''
        });
      } else {
        setError(result.message || 'Không thể lấy thông tin');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await apiClient.put('/api/students/me', formData);
      const result = response.data;
      if (result.success) {
        setEditing(false);
        fetchProfile();
        alert('Cập nhật thông tin thành công!');
      } else {
        alert(result.message || 'Lỗi cập nhật');
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Lỗi kết nối server');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;
  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6 flex items-start gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-t-2xl z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 mt-16 w-full">
          <div className="w-32 h-32 rounded-full border-4 border-white bg-indigo-100 flex items-center justify-center text-indigo-500 text-4xl font-bold shadow-md overflow-hidden shrink-0">
            {profile.anhDaiDien ? <img src={profile.anhDaiDien} alt="Avatar" className="w-full h-full object-cover" /> : profile.hoTen?.charAt(0)}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2 pt-2">
            <h1 className="text-3xl font-bold text-gray-800">{profile.hoTen}</h1>
            <p className="text-indigo-600 font-medium">{profile.MaND}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"><Book className="w-4 h-4 text-gray-500" /> Lớp {profile.tenLop || 'Chưa cập nhật'}</span>
              <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full"><Shield className="w-4 h-4 text-gray-500" /> {profile.tenKhoa || 'Chưa cập nhật'}</span>
              {profile.diemRenLuyen !== null && (
                <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full"><Award className="w-4 h-4" /> ĐRL: {profile.diemRenLuyen}</span>
              )}
            </div>
          </div>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm font-medium"
            >
              <Edit2 className="w-4 h-4" /> Chỉnh sửa
            </button>
          )}
        </div>
      </div>

      {/* Info Section */}
      {editing ? (
        <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm p-6 space-y-4 border border-indigo-100">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Cập nhật thông tin</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input 
                type="text" 
                value={formData.soDienThoai}
                onChange={e => setFormData({...formData, soDienThoai: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
              <input 
                type="date" 
                value={formData.ngaySinh}
                onChange={e => setFormData({...formData, ngaySinh: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
              <select 
                value={formData.gioiTinh}
                onChange={e => setFormData({...formData, gioiTinh: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button 
              type="button" 
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Thông tin liên hệ
            </h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Số điện thoại</p>
                  <p className="font-medium text-gray-800">{profile.soDienThoai || 'Chưa cập nhật'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày sinh</p>
                  <p className="font-medium text-gray-800">
                    {profile.ngaySinh ? new Date(profile.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl shadow-sm p-6 text-white relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 blur-xl"></div>
            <Activity className="w-12 h-12 text-indigo-200 mb-4" />
            <h3 className="text-lg font-medium text-indigo-100 mb-1">Trạng thái</h3>
            <p className="text-2xl font-bold">Đang hoạt động</p>
          </div>
        </div>
      )}
    </div>
  );
}
