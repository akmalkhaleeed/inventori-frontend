import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Komponen
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DataBarang from './pages/admin/DataBarang';
import Kategori from './pages/admin/Kategori';
import Supplier from './pages/admin/Supplier';
import Users from './pages/admin/Users';
import BarangMasuk from './pages/admin/BarangMasuk';
import BarangKeluar from './pages/admin/BarangKeluar';

// Tambahkan import komponen LaporanTransaksi di sini
import LaporanTransaksi from './pages/admin/LaporanTransaksi';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Rute Halaman Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/databarang" element={<DataBarang />} />
        <Route path="/admin/kategori" element={<Kategori />} />
        <Route path="/admin/supplier" element={<Supplier />} />
        <Route path="/admin/users" element={<Users />} />
        
        {/* Rute Transaksi & Laporan */}
        <Route path="/admin/masuk" element={<BarangMasuk />} />
        <Route path="/admin/keluar" element={<BarangKeluar />} />
        
        {/* Tambahkan Rute Laporan Transaksi di sini */}
        <Route path="/admin/laporan" element={<LaporanTransaksi />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;