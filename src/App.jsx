import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Komponen Halaman
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Halaman Awal (Login) */}
        <Route path="/" element={<Login />} />
        
        {/* Rute Halaman Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Nanti rute untuk Pimpinan dan Petugas tinggal ditambahkan di bawah sini */}
        {/* <Route path="/petugas/dashboard" element={<PetugasDashboard />} /> */}
        {/* <Route path="/pimpinan/dashboard" element={<PimpinanDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;