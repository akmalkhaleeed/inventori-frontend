import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MasterLayout from '../../layouts/MasterLayout';
import './DashboardPetugas.css';

const PetugasDashboard = () => {
    const [stats, setStats] = useState({
        totalJenis: 0,
        masukHariIni: 0,
        keluarHariIni: 0
    });
    const [riwayat, setRiwayat] = useState([]);
    const [waktu, setWaktu] = useState(new Date());

    const userName = localStorage.getItem('userName') || 'User';
    const idUser = localStorage.getItem('id_user');

    // Jam Berjalan (Realtime)
    useEffect(() => {
        const timer = setInterval(() => setWaktu(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        try {
            const [resBarang, resTrans] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/barang', { headers }),
                fetch('http://127.0.0.1:8000/api/transaksi', { headers })
            ]);

            const dataBarang = await resBarang.json();
            const dataTrans = await resTrans.json();

            const arrayBarang = dataBarang.data || [];
            const arrayTrans = dataTrans.data || [];

            // 1. Hitung Total Jenis Barang
            const totalJenis = arrayBarang.length;

            // 2. Hitung SUM(jumlah) Barang Masuk & Keluar HARI INI
            const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
            
            let masukHariIni = 0;
            let keluarHariIni = 0;

            arrayTrans.forEach(t => {
                // Cek apakah tanggal transaksi = hari ini
                if (t.tanggal_transaksi.startsWith(today)) {
                    if (t.jenis_transaksi === 'masuk') {
                        masukHariIni += parseInt(t.jumlah) || 0;
                    } else if (t.jenis_transaksi === 'keluar') {
                        keluarHariIni += parseInt(t.jumlah) || 0;
                    }
                }
            });

            setStats({ totalJenis, masukHariIni, keluarHariIni });

            // 3. Filter Riwayat Khusus User Ini Saja & Ambil 5 Teratas
            const riwayatPribadi = arrayTrans
                .filter(t => String(t.id_user) === String(idUser))
                .sort((a, b) => new Date(b.tanggal_transaksi) - new Date(a.tanggal_transaksi))
                .slice(0, 5);
            
            setRiwayat(riwayatPribadi);

        } catch (error) {
            console.error("Gagal mengambil data dashboard:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Format Tanggal (d F Y)
    const tanggalSekarang = waktu.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const jamSekarang = waktu.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return (
        <MasterLayout>
            {/* Welcome Banner */}
            <div className="welcome-banner d-flex justify-content-between align-items-center flex-wrap gap-3">
                <div>
                    <h2 className="fw-bold mb-1">Halo, {userName}! 👋</h2>
                    <p className="opacity-75 mb-0">Selamat datang di Sistem Inventaris Modern Era.</p>
                </div>
                <div className="text-end d-none d-md-block">
                    <h5 className="fw-bold mb-0">{tanggalSekarang}</h5>
                    <small className="opacity-50">Sesi: {jamSekarang} WIB</small>
                </div>
            </div>

            {/* Statistik Cards */}
            <div className="row g-4 mb-5">
                {/* Total Barang */}
                <div className="col-md-4">
                    <div className="stat-card">
                        <div className="icon-shape bg-grad-primary text-white">
                            <i className="fa fa-boxes-stacked"></i>
                        </div>
                        <h6 className="text-muted small fw-bold">TOTAL JENIS BARANG</h6>
                        <h2 className="fw-bold mb-0">{stats.totalJenis.toLocaleString('id-ID')}</h2>
                    </div>
                </div>

                {/* Barang Masuk Hari Ini */}
                <div className="col-md-4">
                    <div className="stat-card">
                        <div className="icon-shape bg-grad-success text-white">
                            <i className="fa fa-arrow-trend-down"></i>
                        </div>
                        <h6 className="text-muted small fw-bold">BARANG MASUK HARI INI</h6>
                        <h2 className="fw-bold mb-0">{stats.masukHariIni.toLocaleString('id-ID')}</h2>
                    </div>
                </div>

                {/* Barang Keluar Hari Ini */}
                <div className="col-md-4">
                    <div className="stat-card">
                        <div className="icon-shape bg-grad-danger text-white">
                            <i className="fa fa-arrow-trend-up"></i>
                        </div>
                        <h6 className="text-muted small fw-bold">BARANG KELUAR HARI INI</h6>
                        <h2 className="fw-bold mb-0">{stats.keluarHariIni.toLocaleString('id-ID')}</h2>
                    </div>
                </div>
            </div>

            {/* Riwayat Aktivitas User */}
            <div className="table-container shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Riwayat Aktivitas Anda</h5>
                    <Link to="/petugas/databarang" className="btn btn-sm btn-light fw-bold rounded-pill px-3 shadow-sm border">
                        Lihat Semua Stok
                    </Link>
                </div>

                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr className="text-muted small">
                                <th>NAMA BARANG</th>
                                <th>WAKTU</th>
                                <th>JENIS</th>
                                <th className="text-end">JUMLAH</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riwayat.length > 0 ? (
                                riwayat.map((item) => (
                                    <tr key={item.id_transaksi}>
                                        <td className="fw-bold text-dark">{item.nama_barang}</td>
                                        <td className="text-muted small">
                                            {new Date(item.tanggal_transaksi).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </td>
                                        <td>
                                            {item.jenis_transaksi === 'masuk' ? (
                                                <span className="badge-status bg-success-subtle text-success">MASUK</span>
                                            ) : (
                                                <span className="badge-status bg-danger-subtle text-danger">KELUAR</span>
                                            )}
                                        </td>
                                        <td className={`text-end fw-bold ${item.jenis_transaksi === 'masuk' ? 'text-success' : 'text-danger'}`}>
                                            {item.jenis_transaksi === 'masuk' ? '+' : '-'} {item.jumlah.toLocaleString('id-ID')} {item.satuan || 'pcs'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-muted py-4 small">
                                        Belum ada aktivitas yang tercatat untuk akun Anda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MasterLayout>
    );
};

export default PetugasDashboard;