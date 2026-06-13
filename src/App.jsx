import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Komponen Halaman Auth
import Login from './pages/auth/Login';

// Import Komponen Halaman Admin
import AdminDashboard from './pages/admin/Dashboard';
import DataBarang from './pages/admin/DataBarang';
import Kategori from './pages/admin/Kategori'; // <-- Tambahan Import Kategori

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Halaman Awal (Login) */}
        <Route path="/" element={<Login />} />
        
        {/* Rute Halaman Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/DataBarang" element={<DataBarang />} />
        <Route path="/admin/kategori" element={<Kategori />} /> {/* <-- Tambahan Rute Kategori */}
        
        {/* Tips: Jika nanti ada rute lain seperti supplier, 
          tambahkan di sini dengan pola yang sama:
          <Route path="/admin/supplier" element={<DataSupplier />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;