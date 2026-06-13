import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import Komponen
import Login from './pages/auth/Login';
import AdminDashboard from './pages/admin/Dashboard';
import DataBarang from './pages/admin/DataBarang';
import Kategori from './pages/admin/Kategori';
import Supplier from './pages/admin/Supplier';
import Users from './pages/admin/Users'; // <-- Tambahan Import Users

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Rute Halaman Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/DataBarang" element={<DataBarang />} />
        <Route path="/admin/kategori" element={<Kategori />} />
        <Route path="/admin/supplier" element={<Supplier />} />
        <Route path="/admin/Users" element={<Users />} /> {/* <-- Tambahan Rute Users */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;