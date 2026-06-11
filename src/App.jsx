import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Komponen Halaman Auth
import Login from './pages/auth/Login';

// Import Komponen Halaman Admin
import AdminDashboard from './pages/admin/Dashboard';
import DataBarang from './pages/admin/DataBarang';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute Halaman Awal (Login) */}
        <Route path="/" element={<Login />} />
        
        {/* Rute Halaman Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/DataBarang" element={<DataBarang />} />
        
        {/* Tips: Jika nanti ada rute lain seperti kategori atau supplier, 
          tambahkan di sini dengan pola yang sama:
          <Route path="/admin/kategori" element={<Kategori />} />
          <Route path="/admin/supplier" element={<DataSupplier />} />
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;