import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Komponen Auth
import Login from './pages/auth/Login';

// Import Komponen Admin
import AdminDashboard from './pages/admin/Dashboard';
import DataBarangAdmin from './pages/admin/DataBarang'; // <-- Alias untuk Data Barang Admin
import Kategori from './pages/admin/Kategori';
import Supplier from './pages/admin/Supplier';
import Users from './pages/admin/Users';
import BarangMasuk from './pages/admin/BarangMasuk';
import BarangKeluar from './pages/admin/BarangKeluar';
import LaporanTransaksi from './pages/admin/LaporanTransaksi';

// Import Komponen Petugas
import PetugasDashboard from './pages/petugas/Dashboard';
import DataBarangPetugas from './pages/petugas/DataBarang'; // <-- Import Data Barang khusus Petugas

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* ================= RUTE ADMIN ================= */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/databarang" element={<DataBarangAdmin />} /> {/* <-- Panggil komponen Admin */}
        <Route path="/admin/kategori" element={<Kategori />} />
        <Route path="/admin/supplier" element={<Supplier />} />
        <Route path="/admin/users" element={<Users />} />
        
        {/* Transaksi & Laporan Admin */}
        <Route path="/admin/masuk" element={<BarangMasuk />} />
        <Route path="/admin/keluar" element={<BarangKeluar />} />
        <Route path="/admin/laporan" element={<LaporanTransaksi />} />


        {/* ================= RUTE PETUGAS ================= */}
        <Route path="/petugas/dashboard" element={<PetugasDashboard />} />
        
        {/* Petugas menggunakan komponen Data Barang spesifik miliknya */}
        <Route path="/petugas/databarang" element={<DataBarangPetugas />} /> {/* <-- Panggil komponen Petugas */}
        
        {/* Petugas menggunakan komponen operasional lainnya yang sama dengan Admin */}
        <Route path="/petugas/kategori" element={<Kategori />} />
        <Route path="/petugas/supplier" element={<Supplier />} />
        <Route path="/petugas/masuk" element={<BarangMasuk />} />
        <Route path="/petugas/keluar" element={<BarangKeluar />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;