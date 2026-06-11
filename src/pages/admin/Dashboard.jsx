import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const userName = localStorage.getItem('userName') || 'Admin';

    const [stats, setStats] = useState({ totalStok: 0, totalPetugas: 0, totalTransaksi: 0 });
    const [lowStock, setLowStock] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSemuaData = async () => {
            try {
                const token = localStorage.getItem('token'); 
                const headers = {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                };

                // 1. JURUS PROMISE.ALL: Mengirim 3 kurir fetch secara bersamaan!
                const [resUser, resBarang, resTransaksi] = await Promise.all([
                    fetch('http://127.0.0.1:8000/api/user', { headers }),
                    fetch('http://127.0.0.1:8000/api/barang', { headers }),
                    fetch('http://127.0.0.1:8000/api/transaksi', { headers })
                ]);

                // 2. Buka paket JSON-nya
                const [dataUser, dataBarang, dataTransaksi] = await Promise.all([
                    resUser.json(),
                    resBarang.json(),
                    resTransaksi.json()
                ]);

                // 3. Pastikan datanya berbentuk Array (Asumsi Akmal menaruhnya di dalam .data)
                const users = dataUser.data || [];
                const barangs = dataBarang.data || [];
                const transaksis = dataTransaksi.data || [];

                // 4. Hitung Total Stok (Menjumlahkan seluruh angka 'stok' dari semua barang)
                // Jika backend Akmal hanya menghitung macam barang, ganti jadi barangs.length
                const hitungTotalStok = barangs.reduce((total, item) => total + (Number(item.stok) || 0), 0);

                setStats({
                    totalStok: hitungTotalStok > 0 ? hitungTotalStok : barangs.length, 
                    totalPetugas: users.length,
                    totalTransaksi: transaksis.length
                });

                // 5. Filter Stok Kritis (Ambil barang yang stoknya di bawah atau sama dengan 5)
                const barangKritis = barangs.filter(b => Number(b.stok) <= 5).slice(0, 3); // Ambil 3 teratas
                setLowStock(barangKritis.length > 0 ? barangKritis : []);

                // 6. Ambil 4 Transaksi Terakhir untuk tabel
                setRecentActivities(transaksis.slice(0, 4));

            } catch (error) {
                console.error("Gagal menarik data dari Akmal:", error);
                loadDummyData(); // Tetap panggil dummy kalau error
            } finally {
                setIsLoading(false);
            }
        };

        const loadDummyData = () => {
            setStats({ totalStok: 1245, totalPetugas: 5, totalTransaksi: 342 });
            setLowStock([
                { id: 1, nama_barang: 'Proyektor Epson X500 (DUMMY)', stok: 2 },
                { id: 2, nama_barang: 'Kertas HVS A4 70gsm (DUMMY)', stok: 5 }
            ]);
            setRecentActivities([
                { id: 1, nama_petugas: 'Budi (DUMMY)', nama_barang: 'Kabel VGA 15m', jenis: 'masuk', waktu: '14 Jun, 09:30' }
            ]);
        };

        fetchSemuaData();
    }, []);

    return (
        <MasterLayout>
            <div className="admin-banner mb-4">
                <div className="row align-items-center">
                    <div className="col-lg-7">
                        <span className="badge bg-primary bg-opacity-25 text-light mb-3 px-3 py-2 rounded-pill border border-primary">
                            Sistem Inventaris v1.0
                        </span>
                        <h1 className="fw-bold mb-2">Pusat Kendali Admin</h1>
                        <p className="opacity-75 mb-0">
                            Halo, <strong className="text-warning">{userName}</strong>. Pantau pergerakan aset sekolah hari ini.
                        </p>
                    </div>
                    <div className="col-lg-5 text-lg-end mt-4 mt-lg-0">
                        <button className="btn btn-light rounded-pill px-4 py-2 fw-bold shadow-sm text-dark">
                            <i className="fas fa-file-pdf me-2 text-danger"></i>Cetak Laporan
                        </button>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-12 col-md-4">
                    <div className="admin-card card-primary">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted small fw-bold text-uppercase mb-2">Total Unit Barang</h6>
                                <h2 className="fw-bold mb-0 text-dark">
                                    {isLoading ? '...' : stats.totalStok.toLocaleString('id-ID')}
                                </h2>
                            </div>
                            <div className="icon-circle bg-primary bg-opacity-10 text-primary">
                                <i className="fas fa-box-open fa-lg"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="admin-card card-success">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted small fw-bold text-uppercase mb-2">Petugas Lapangan</h6>
                                <h2 className="fw-bold mb-0 text-dark">
                                    {isLoading ? '...' : stats.totalPetugas}
                                </h2>
                            </div>
                            <div className="icon-circle bg-success bg-opacity-10 text-success">
                                <i className="fas fa-user-shield fa-lg"></i>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-4">
                    <div className="admin-card card-warning">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 className="text-muted small fw-bold text-uppercase mb-2">Log Transaksi</h6>
                                <h2 className="fw-bold mb-0 text-dark">
                                    {isLoading ? '...' : stats.totalTransaksi.toLocaleString('id-ID')}
                                </h2>
                            </div>
                            <div className="icon-circle bg-warning bg-opacity-10 text-warning">
                                <i className="fas fa-history fa-lg"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-4">
                    <div className="glass-panel">
                        <h5 className="fw-bold mb-4 text-danger d-flex align-items-center">
                            <i className="fas fa-exclamation-triangle me-2"></i>Stok Kritis
                        </h5>
                        
                        {isLoading ? (
                            <div className="text-center py-4 text-muted small">Memuat data...</div>
                        ) : lowStock.length > 0 ? (
                            lowStock.map((item, index) => (
                                <div key={item.id || index} className="d-flex align-items-center mb-3 p-3 border rounded-3 bg-light">
                                    <div className="flex-grow-1">
                                        <h6 className="mb-1 fw-bold small">{item.nama_barang || item.nama}</h6>
                                        <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1" style={{ fontSize: '11px' }}>
                                            Sisa {item.stok} unit
                                        </span>
                                    </div>
                                    <button className="btn btn-sm btn-dark rounded-circle shadow-sm" style={{ width: '32px', height: '32px' }}>
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

                <div className="col-12 col-lg-8">
                    <div className="glass-panel">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0">Aktivitas Terbaru</h5>
                            <button className="btn btn-sm btn-outline-primary rounded-pill px-3 fw-bold">Lihat Semua</button>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-borderless table-hover align-middle mb-0">
                                <thead className="table-light rounded-top">
                                    <tr className="small text-muted text-uppercase">
                                        <th className="py-3 ps-3 rounded-start">Petugas / Info</th>
                                        <th className="py-3">Item</th>
                                        <th className="py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr><td colSpan="3" className="text-center py-4 text-muted small">Memuat aktivitas...</td></tr>
                                    ) : recentActivities.length > 0 ? (
                                        recentActivities.map((act, index) => (
                                            <tr key={act.id || index} className="border-bottom">
                                                <td className="ps-3 py-3">
                                                    <div className="fw-bold small text-dark">{act.nama_petugas || act.user_id || 'Sistem'}</div>
                                                    <div className="small text-muted" style={{ fontSize: '11px' }}>{act.waktu || act.created_at}</div>
                                                </td>
                                                <td className="small text-secondary py-3">{act.nama_barang || act.barang_id || '-'}</td>
                                                <td className="py-3">
                                                    <span className={`badge rounded-pill px-3 py-2 ${(!act.jenis || act.jenis === 'masuk') ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`} style={{ fontSize: '10px' }}>
                                                        {(act.jenis || 'TERCATAT').toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="text-center text-muted py-5 small">
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