import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Komponen Auth
import Login from './pages/auth/Login';

// Import Komponen Admin
import AdminDashboard from './pages/admin/Dashboard';
import DataBarangAdmin from './pages/admin/DataBarang'; 
import KategoriAdmin from './pages/admin/Kategori'; 
import SupplierAdmin from './pages/admin/Supplier'; 
import Users from './pages/admin/Users';
import BarangMasukAdmin from './pages/admin/BarangMasuk'; // <-- Ubah jadi BarangMasukAdmin
import BarangKeluar from './pages/admin/BarangKeluar';
import LaporanTransaksi from './pages/admin/LaporanTransaksi';

// Import Komponen Petugas
import PetugasDashboard from './pages/petugas/Dashboard';
import DataBarangPetugas from './pages/petugas/DataBarang'; 
import KategoriPetugas from './pages/petugas/Kategori'; 
import SupplierPetugas from './pages/petugas/Supplier'; 
import BarangMasukPetugas from './pages/petugas/BarangMasuk'; // <-- IMPORT FILE BARANG MASUK PETUGAS DI SINI

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* ================= RUTE ADMIN ================= */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/databarang" element={<DataBarangAdmin />} /> 
        <Route path="/admin/kategori" element={<KategoriAdmin />} /> 
        <Route path="/admin/supplier" element={<SupplierAdmin />} /> 
        <Route path="/admin/users" element={<Users />} />
        
        {/* Transaksi & Laporan Admin */}
        <Route path="/admin/masuk" element={<BarangMasukAdmin />} /> {/* <-- Panggil Barang Masuk Admin */}
        <Route path="/admin/keluar" element={<BarangKeluar />} />
        <Route path="/admin/laporan" element={<LaporanTransaksi />} />


        {/* ================= RUTE PETUGAS ================= */}
        <Route path="/petugas/dashboard" element={<PetugasDashboard />} />
        <Route path="/petugas/databarang" element={<DataBarangPetugas />} /> 
        <Route path="/petugas/kategori" element={<KategoriPetugas />} /> 
        <Route path="/petugas/supplier" element={<SupplierPetugas />} /> 
        
        {/* <-- PANGGIL KOMPONEN BARANG MASUK PETUGAS DI SINI --> */}
        <Route path="/petugas/masuk" element={<BarangMasukPetugas />} /> 
        
        {/* Petugas masih meminjam komponen Barang Keluar milik Admin sementara ini */}
        <Route path="/petugas/keluar" element={<BarangKeluar />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;