import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Sidebar.css';

const Sidebar = () => {
    const navigate = useNavigate();
    
    // Ambil data user dari memori saat login
    const role = localStorage.getItem('userRole') || 'guest';
    const userName = localStorage.getItem('userName') || 'Pengguna';
    const initial = userName.charAt(0).toUpperCase();

    const handleLogout = (e) => {
        e.preventDefault();
        Swal.fire({
            title: 'Keluar dari sistem?',
            text: 'Sesi login akan diakhiri.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6366f1',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.clear();
                navigate('/');
            }
        });
    };

    return (
        <div className="sidebar" id="sidebar">
            {/* LOGO */}
            <div className="sidebar-brand">
                <div className="brand-logo">
                    <i className={`fas text-white ${role === 'pimpinan' ? 'fa-chart-pie' : role === 'admin' ? 'fa-layer-group' : 'fa-box-open'}`}></i>
                </div>
                <h4 className="mb-0 fw-bold">INVEERA</h4>
            </div>

            {/* MENU DINAMIS BERDASARKAN ROLE */}
            <div className="sidebar-menu">
                
                {/* MENU DASHBOARD (Bisa diakses semua role) */}
                <NavLink to={`/${role}/dashboard`} className="nav-link">
                    <i className="fas fa-th-large"></i> Dashboard
                </NavLink>

                {/* ======= MENU ADMIN & PETUGAS ======= */}
                {(role === 'admin' || role === 'petugas') && (
                    <>
                        <div className="menu-header">Master Data</div>
                        <NavLink to={`/${role}/databarang`} className="nav-link">
                            <i className="fas fa-box"></i> {role === 'admin' ? 'Data Barang' : 'Stok Barang'}
                        </NavLink>
                        <NavLink to={`/${role}/kategori`} className="nav-link">
                            <i className="fas fa-tags"></i> Kategori
                        </NavLink>
                        <NavLink to={`/${role}/supplier`} className="nav-link">
                            <i className="fas fa-truck"></i> Data Supplier
                        </NavLink>

                        <div className="menu-header">Transaksi</div>
                        <NavLink to={`/${role}/masuk`} className="nav-link">
                            <i className="fas fa-arrow-alt-circle-down"></i> Barang Masuk
                        </NavLink>
                        <NavLink to={`/${role}/keluar`} className="nav-link">
                            <i className="fas fa-arrow-alt-circle-up"></i> Barang Keluar
                        </NavLink>
                    </>
                )}

                {/* ======= TAMBAHAN KHUSUS ADMIN ======= */}
                {role === 'admin' && (
                    <>
                        <div className="menu-header">Sistem & Laporan</div>
                        <NavLink to="/admin/laporan" className="nav-link">
                            <i className="fas fa-file-invoice"></i> Laporan
                        </NavLink>
                        <NavLink to="/admin/users" className="nav-link">
                            <i className="fas fa-user-shield"></i> Pengguna
                        </NavLink>
                    </>
                )}

                {/* ======= MENU PIMPINAN ======= */}
                {role === 'pimpinan' && (
                    <>
                        <div className="menu-header">Laporan Inventori</div>
                        <NavLink to="/pimpinan/laporan-stok" className="nav-link">
                            <i className="fas fa-clipboard-list"></i> Stok Opname
                        </NavLink>
                        <NavLink to="/pimpinan/laporan-masuk" className="nav-link">
                            <i className="fas fa-file-import"></i> Barang Masuk
                        </NavLink>
                        <NavLink to="/pimpinan/laporan-keluar" className="nav-link">
                            <i className="fas fa-file-export"></i> Barang Keluar
                        </NavLink>
                        <NavLink to="/pimpinan/laporan-terlaris" className="nav-link">
                            <i className="fas fa-fire"></i> Barang Terlaris
                        </NavLink>

                        <div className="menu-header">Referensi</div>
                        <NavLink to="/pimpinan/supplier" className="nav-link">
                            <i className="fas fa-truck"></i> Daftar Supplier
                        </NavLink>
                    </>
                )}
            </div>

            {/* FOOTER & LOGOUT */}
            <div className="sidebar-footer">
                <div className="user-pill shadow-sm">
                    <div className="user-avatar text-uppercase">
                        {initial}
                    </div>
                    <div className="overflow-hidden">
                        <p className="mb-0 small fw-bold text-truncate" style={{ maxWidth: '130px' }}>
                            {userName}
                        </p>
                        <span className="badge bg-primary text-uppercase" style={{ fontSize: '9px', padding: '4px 8px' }}>
                            {role}
                        </span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn border-0">
                    <i className="fas fa-sign-out-alt me-2"></i> Keluar
                </button>
            </div>
        </div>
    );
};

export default Sidebar;