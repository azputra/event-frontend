// src/pages/Dashboard.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Selamat Datang, {user?.email}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {user?.role === 'admin' && (
            <>
              <Link
                to="/events"
                className="bg-blue-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">Kelola Event</h3>
                <p className="text-gray-600">Tambah, edit, dan hapus event</p>
              </Link>
              
              <Link
                to="/customers"
                className="bg-green-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">Kelola Peserta</h3>
                <p className="text-gray-600">Kelola data peserta dan generate barcode</p>
              </Link>
              
              <Link
                to="/users"
                className="bg-purple-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">Kelola User</h3>
                <p className="text-gray-600">Tambah dan kelola akun user</p>
              </Link>
            </>
          )}
          
          {user?.role === 'petugas' && (
            <>
              <Link
                to="/customers"
                className="bg-green-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">Lihat Peserta</h3>
                <p className="text-gray-600">Lihat daftar peserta terdaftar</p>
              </Link>
              
              <Link
                to="/scan"
                className="bg-yellow-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">Scan Barcode</h3>
                <p className="text-gray-600">Verifikasi kedatangan customer</p>
              </Link>
            </>
          )}

          {user?.role === 'viewer' && (
            <>
              <Link
                to="/customers"
                className="bg-green-100 p-6 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">Lihat Peserta</h3>
                <p className="text-gray-600">Lihat daftar peserta terdaftar</p>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;