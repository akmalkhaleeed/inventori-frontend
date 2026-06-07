import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './AdminDashboard.css'; // Panggil file CSS barusan

const AdminDashboard = () => {
    // 1. Ambil nama admin dari Local Storage
    const userName = localStorage.getItem('userName') || 'Admin';

    // 2. Siapkan State untuk menampung data dari Backend nanti
    const [stats, setStats] = useState({
        totalStok: 0,
        totalPetugas: 0,
        totalTransaksi: 0
    });
    const [lowStock, setLowStock] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);

    // 3. Simulasi Pengambilan Data (useEffect ini akan jalan saat halaman pertama kali dibuka)
    useEffect(() => {
        // NANTI: Di sini kamu akan menggunakan fetch() ke API Laravel Akmal
        // Untuk sekarang, kita isi dengan data dummy agar desainnya bisa dilihat:
        setStats({
            totalStok: 1245,
            totalPetugas: 5,
            totalTransaksi: 342
        });

        setLowStock([
            { id: 1, nama_barang: 'Proyektor Epson X500', stok: 2 },
            { id: 2, nama_barang: 'Kertas HVS A4 70gsm', stok: 5 },
            { id: 3, nama_barang: 'Tinta Printer Hitam', stok: 1 }
        ]);

        setRecentActivities([
            { id: 1, nama_petugas: 'Budi', nama_barang: 'Kabel VGA 15m', jenis: 'masuk', waktu: '14 Jun, 09:30' },
            { id: 2, nama_petugas: 'Siti', nama_barang: 'Mouse Wireless', jenis: 'keluar', waktu: '14 Jun, 10:15' },
            { id: 3, nama_petugas: 'Andi', nama_barang: 'Keyboard USB', jenis: 'keluar', waktu: '14 Jun, 11:00' },
        ]);
    }, []);

    return (
        <MasterLayout>
            {/* Banner Section */}
            <div className="admin-banner shadow-sm mb-4">
                <div className="row align-items-center">
                    <div className="col-lg-7">
                        <span className="badge bg-primary mb-3 px-3 py-2 rounded-pill">Sistem Inventaris v1.0</span>
                        <h1 className="fw-bold mb-2">Pusat Kendali Admin</h1>
                        <p className="opacity-75 mb-0">
                            Halo, <strong>{userName}</strong>. Pantau pergerakan aset sekolah hari ini.
                        </p>
                    </div>
                    <div className="col-lg-5 text-lg-end mt-3 mt-lg-0">
                        <button className="btn btn-light rounded-pill px-4 py-2 fw-bold shadow-sm">
                            <i className="fas fa-file-pdf me-2 text-danger"></i>Cetak Laporan
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-12 col-md-4">
                    <div className="admin-card card-primary shadow-sm">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted small fw-bold text-uppercase mb-1">Total Unit Barang</h6>
                                <h2 className="fw-bold mb-0">{stats.totalStok.toLocaleString('id-ID')}</h2>
                            </div>
                            <div className="icon-circle bg-primary bg-opacity-10 text-primary rounded-4">
                                <i className="fas fa-box-open fa-lg"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="admin-card card-success shadow-sm">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted small fw-bold text-uppercase mb-1">Petugas Lapangan</h6>
                                <h2 className="fw-bold mb-0">{stats.totalPetugas}</h2>
                            </div>
                            <div className="icon-circle bg-success bg-opacity-10 text-success rounded-4">
                                <i className="fas fa-user-shield fa-lg"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="admin-card card-warning shadow-sm">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted small fw-bold text-uppercase mb-1">Log Transaksi</h6>
                                <h2 className="fw-bold mb-0">{stats.totalTransaksi.toLocaleString('id-ID')}</h2>
                            </div>
                            <div className="icon-circle bg-warning bg-opacity-10 text-warning rounded-4">
                                <i className="fas fa-history fa-lg"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {/* Stock Alert Panel */}
                <div className="col-12 col-lg-4">
                    <div className="glass-panel">
                        <h5 className="fw-bold mb-4 text-danger d-flex align-items-center">
                            <i className="fas fa-exclamation-triangle me-2"></i>Stok Kritis
                        </h5>
                        
                        {/* Looping data barang kritis menggunakan map */}
                        {lowStock.length > 0 ? (
                            lowStock.map((item) => (
                                <div key={item.id} className="d-flex align-items-center mb-3 p-3 border rounded-4 bg-light">
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1 fw-bold small">{item.nama_barang}</h6>
                                        <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill" style={{ fontSize: '11px' }}>
                                            Sisa {item.stok} unit
                                        </span>
                                    </div>
                                    <button className="btn btn-sm btn-dark rounded-circle shadow-sm">
                                        <i className="fas fa-plus"></i>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4">
                                <i className="fas fa-check-circle fa-3x text-success opacity-25 mb-3"></i>
                                <p className="text-muted small mb-0">Semua stok aman.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activities Table */}
                <div className="col-12 col-lg-8">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Aktivitas Terbaru</h5>
                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold border-0">Lihat Semua</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="table-light">
                                    <tr className="small text-muted text-uppercase">
                                        <th className="border-0 ps-3">Petugas</th>
                                        <th className="border-0">Item</th>
                                        <th className="border-0">Status</th>
                                        <th className="border-0">Waktu</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Looping data aktivitas */}
                                    {recentActivities.length > 0 ? (
                                        recentActivities.map((act) => (
                                            <tr key={act.id}>
                                                <td className="ps-3">
                                                    <div className="fw-bold small">{act.nama_petugas}</div>
                                                </td>
                                                <td className="small text-muted">{act.nama_barang}</td>
                                                <td>
                                                    <span className={`badge rounded-pill px-2 ${act.jenis === 'masuk' ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '9px' }}>
                                                        {act.jenis.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="small text-muted text-nowrap">{act.waktu}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted py-5 small">
                                                Belum ada transaksi tercatat.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default AdminDashboard;