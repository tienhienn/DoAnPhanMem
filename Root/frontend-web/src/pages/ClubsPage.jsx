import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../utils/apiClient';
import { Users, Calendar, Plus, Search } from 'lucide-react';

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [clubsRes, myClubsRes] = await Promise.all([
        apiClient.get('/api/clubs'),
        apiClient.get('/api/students/me/clubs')
      ]);
      
      const clubsData = clubsRes.data;
      const myClubsData = myClubsRes.data;
      
      if (clubsData.success) setClubs(clubsData.data);
      if (myClubsData.success) setMyClubs(myClubsData.data);
      
    } catch (err) {
      console.error('Lỗi khi tải danh sách CLB:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(c => 
    c.TenCLB.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.LinhVuc?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const myClubIds = myClubs.map(c => c.MaCLB);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-indigo-50">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" /> Danh sách Câu lạc bộ
          </h1>
          <p className="text-gray-500 mt-1">Khám phá và tham gia các hoạt động ngoại khóa</p>
        </div>
        <div className="relative w-full md:w-72">
          <input 
            type="text" 
            placeholder="Tìm kiếm CLB..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* My Clubs Section */}
      {myClubs.length > 0 && !searchTerm && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800 px-2 flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full"></span> CLB Của Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClubs.map(club => (
              <Link key={club.MaCLB} to={`/clubs/${club.MaCLB}`} className="group bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-2xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-green-600 font-bold text-xl shadow-sm border border-green-100 group-hover:scale-105 transition-transform">
                    {club.Logo ? <img src={club.Logo} alt="" className="w-full h-full object-cover rounded-xl" /> : club.TenCLB.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-green-700 transition-colors">{club.TenCLB}</h3>
                    <p className="text-sm font-medium text-green-600 mt-1 bg-green-100 inline-block px-2 py-0.5 rounded-md">{club.VaiTroCLB}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Clubs */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-800 px-2 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span> Khám phá
        </h2>
        
        {filteredClubs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">Không tìm thấy câu lạc bộ nào phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClubs.map(club => (
              <Link key={club.MaCLB} to={`/clubs/${club.MaCLB}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1">
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500 relative">
                  <div className="absolute -bottom-8 left-6 w-16 h-16 bg-white p-1 rounded-2xl shadow-sm">
                    <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl">
                      {club.Logo ? <img src={club.Logo} alt="" className="w-full h-full object-cover rounded-xl" /> : club.TenCLB.charAt(0)}
                    </div>
                  </div>
                  {myClubIds.includes(club.MaCLB) && (
                    <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded-md border border-white/30">
                      Đã tham gia
                    </div>
                  )}
                </div>
                
                <div className="pt-10 px-6 pb-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{club.TenCLB}</h3>
                  <div className="text-xs font-medium text-indigo-500 bg-indigo-50 inline-flex px-2 py-1 rounded-md mb-3 self-start">
                    {club.LinhVuc || 'Khác'}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {club.MoTa || 'Chưa có mô tả'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4 mt-auto">
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {club.SoThanhVienHienTai}/{club.SoThanhVienToiDa}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(club.NgayThanhLap).getFullYear()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
