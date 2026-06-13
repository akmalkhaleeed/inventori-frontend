import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './LaporanTransaksi.css';

export default function LaporanTransaksi() {
    // 1. STATE UNTUK FILTER
    const [tglMulai, setTglMulai] = useState(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [tglSelesai, setTglSelesai] = useState(() => {
        const date = new Date();
        return date.toISOString().split('T')[0];
    });
    const [idBarang, setIdBarang] = useState('');
    const [jenisTransaksi, setJenisTransaksi] = useState('');

    // 2. STATE UNTUK DATA API
    const [barangList, setBarangList] = useState([]);
    const [dataTransaksi, setDataTransaksi] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const BASE_URL = 'http://127.0.0.1:8000/api';
    const token = localStorage.getItem('token');
    const authHeaders = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    useEffect(() => {
        setLoading(true);
        fetch(`${BASE_URL}/barang`, { method: 'GET', headers: authHeaders })
            .then((res) => res.json())
            .then((data) => {
                setBarangList(data.data || data);
                fetchTransaksi();
            })
            .catch((err) => {
                console.error(err);
                setError('Gagal memuat daftar master barang');
                setLoading(false);
            });
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchTransaksi = () => {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (tglMulai) params.append('tgl_mulai', tglMulai);
        if (tglSelesai) params.append('tgl_selesai', tglSelesai);
        if (idBarang) params.append('id_barang', idBarang);
        if (jenisTransaksi) params.append('jenis_transaksi', jenisTransaksi);

        fetch(`${BASE_URL}/transaksi?${params.toString()}`, { method: 'GET', headers: authHeaders })
            .then((res) => {
                if (!res.ok) throw new Error('Gagal mengambil data laporan transaksi');
                return res.json();
            })
            .then((resJson) => {
                const rawData = resJson.data || resJson;
                setDataTransaksi(Array.isArray(rawData) ? rawData : []);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchTransaksi();
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);

    const formatTanggalPrint = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${String(date.getDate()).padStart(2, '0')} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
    };

    let totalMasuk = 0;
    let totalKeluar = 0;

    const dataDenganNo = dataTransaksi.map((row, index) => {
        const jenis = row.jenis_transaksi || row.jenis || '';
        const harga = jenis === 'masuk' ? (row.harga_beli ?? 0) : (row.harga_jual_aktual ?? row.harga_jual ?? 0);
        const subtotal = (row.jumlah ?? 0) * harga;
        const displayJumlah = Math.abs(row.jumlah ?? 0);

        if (jenis === 'masuk') totalMasuk += subtotal;
        else if (jenis === 'keluar') totalKeluar += subtotal;

        const namaBarangFallback = row.nama_barang || row.barang?.nama_barang || barangList.find(b => String(b.id) === String(row.id_barang))?.nama_barang || '-';

        return {
            ...row,
            no: index + 1,
            jenis_final: jenis,
            harga_final: harga,
            subtotal,
            nama_barang_final: namaBarangFallback,
            jumlah_final: displayJumlah
        };
    });

    const keuntungan = totalKeluar - totalMasuk;
    const d = new Date();
    const noDokumen = `TRX/LAP/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${Math.floor(Math.random() * 900) + 100}`;

    return (
        <MasterLayout>
            <div className="lap-area">

                {/* ===== TAMPILAN WEB ===== */}
                <div className="web-only">
                    <div className="lap-page-header d-flex justify-content-between align-items-center flex-wrap">
                        <div>
                            <h3 className="fw-bold">Laporan Transaksi Inventaris</h3>
                            <p className="mb-0 opacity-75">Rekap transaksi barang masuk dan keluar</p>
                        </div>
                        <button onClick={() => window.print()} className="btn btn-light rounded-pill px-4 fw-semibold mt-3 mt-lg-0">
                            <i className="fas fa-print me-2"></i> Cetak / PDF Laporan
                        </button>
                    </div>

                    {error && <div className="alert alert-danger rounded-3">{error}</div>}

                    {/* Filter */}
                    <div className="lap-card p-4 mb-4">
                        <form onSubmit={handleFilterSubmit} className="row g-3">
                            <div className="col-md-3">
                                <label className="small fw-bold mb-1">Dari Tanggal</label>
                                <input type="date" className="form-control rounded-3" value={tglMulai} onChange={(e) => setTglMulai(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold mb-1">Sampai Tanggal</label>
                                <input type="date" className="form-control rounded-3" value={tglSelesai} onChange={(e) => setTglSelesai(e.target.value)} />
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold mb-1">Filter Barang</label>
                                <select className="form-select rounded-3" value={idBarang} onChange={(e) => setIdBarang(e.target.value)}>
                                    <option value="">Semua Barang</option>
                                    {barangList.map((b) => <option key={b.id || b.id_barang} value={b.id || b.id_barang}>{b.nama_barang}</option>)}
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="small fw-bold mb-1">Jenis Transaksi</label>
                                <div className="input-group">
                                    <select className="form-select rounded-start-3" value={jenisTransaksi} onChange={(e) => setJenisTransaksi(e.target.value)}>
                                        <option value="">Semua</option>
                                        <option value="masuk">Barang Masuk</option>
                                        <option value="keluar">Barang Keluar</option>
                                    </select>
                                    <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                                        {loading ? '...' : 'Filter'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <div className="lap-summary-card lap-bg-income">
                                <h6>Total Barang Masuk</h6>
                                <h2>{formatRupiah(totalMasuk)}</h2>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="lap-summary-card lap-bg-expense">
                                <h6>Total Barang Keluar</h6>
                                <h2>{formatRupiah(totalKeluar)}</h2>
                            </div>
                        </div>
                        <div className="col-md-4 mb-3">
                            <div className="lap-summary-card lap-bg-profit">
                                <h6>Selisih / Profit</h6>
                                <h2>{formatRupiah(keuntungan)}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Tabel */}
                    <div className="lap-card p-4">
                        <div className="mb-4">
                            <h5 className="fw-bold">Preview Data Tabel</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>No</th>
                                        <th>Tanggal</th>
                                        <th>Nama Barang</th>
                                        <th>Status</th>
                                        <th>Jumlah</th>
                                        <th>Harga</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" className="text-center py-4">Loading...</td></tr>
                                    ) : dataDenganNo.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-4">Tidak ada data transaksi pada periode ini</td></tr>
                                    ) : (
                                        dataDenganNo.map((item) => (
                                            <tr key={item.id || item.id_transaksi || item.no}>
                                                <td>{item.no}</td>
                                                <td>{formatTanggalPrint(item.tanggal_transaksi || item.created_at || item.tanggal)}</td>
                                                <td className="fw-semibold">{item.nama_barang_final}</td>
                                                <td>
                                                    <span className={`lap-badge-${item.jenis_final === 'masuk' ? 'masuk' : 'keluar'}`}>
                                                        {item.jenis_final.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{item.jumlah_final}</td>
                                                <td>{formatRupiah(item.harga_final)}</td>
                                                <td className="fw-bold">{formatRupiah(item.subtotal)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ===== TAMPILAN CETAK ===== */}
                <div className="print-only paper-cetak">
                    <div className="kop-surat">
                        <img src="/logoinveera.png" alt="Logo" className="logo" />
                        <div className="kop-text">
                            <h2>CV. INVEERA</h2>
                            <p>Jl. Peta No. 123 Kota Tasikmalaya, Jawa Barat</p>
                            <p>Telp: (0265) 345-9090 | Email: inveera@gmail.com</p>
                            <p>Sistem Informasi Manajemen Inventaris</p>
                        </div>
                    </div>

                    <div className="judul-cetak">
                        <h3>Laporan Rekapitulasi Transaksi Inventaris</h3>
                        <p>Periode : {formatTanggalPrint(tglMulai)} - {formatTanggalPrint(tglSelesai)}</p>
                    </div>

                    <table className="summary-cetak">
                        <thead>
                            <tr>
                                <td className="label-cetak">Total Masuk</td>
                                <td className="label-cetak">Total Keluar</td>
                                <td className="label-cetak">Profit</td>
                                <td className="label-cetak">Jumlah Transaksi</td>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{formatRupiah(totalMasuk)}</td>
                                <td>{formatRupiah(totalKeluar)}</td>
                                <td>{formatRupiah(keuntungan)}</td>
                                <td>{dataDenganNo.length} Transaksi</td>
                            </tr>
                        </tbody>
                    </table>

                    <table className="tabel-cetak">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Tanggal</th>
                                <th>Nama Barang</th>
                                <th>Status</th>
                                <th>Jumlah</th>
                                <th>Harga</th>
                                <th>Total</th>
                                <th>Petugas</th>
                                <th>Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataDenganNo.map((item) => (
                                <tr key={item.id || item.id_transaksi || item.no}>
                                    <td>{item.no}</td>
                                    <td>{new Date(item.tanggal_transaksi || item.created_at || item.tanggal).toLocaleDateString('id-ID')}</td>
                                    <td>{item.nama_barang_final}</td>
                                    <td style={{ textTransform: 'uppercase' }}>{item.jenis_final}</td>
                                    <td>{item.jumlah_final} {item.satuan || item.barang?.satuan || ''}</td>
                                    <td>{formatRupiah(item.harga_final)}</td>
                                    <td>{formatRupiah(item.subtotal)}</td>
                                    <td>{item.nama_lengkap || item.user?.name || item.user?.nama_lengkap || 'Admin'}</td>
                                    <td>{item.keterangan || '-'}</td>
                                </tr>
                            ))}
                            <tr style={{ fontWeight: 'bold', background: '#f1f5f9' }}>
                                <td colSpan="5" style={{ textAlign: 'right' }}>GRAND TOTAL</td>
                                <td colSpan="2">
                                    Masuk : {formatRupiah(totalMasuk)}<br />
                                    Keluar : {formatRupiah(totalKeluar)}
                                </td>
                                <td colSpan="2"></td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="footer-cetak">
                        <p>No Dokumen : {noDokumen}</p>
                        <table className="ttd-cetak">
                            <tbody>
                                <tr>
                                    <td>Dibuat Oleh</td>
                                    <td>Diperiksa Oleh</td>
                                    <td>Disetujui Oleh</td>
                                </tr>
                                <tr>
                                    <td className="space-ttd"></td>
                                    <td className="space-ttd"></td>
                                    <td className="space-ttd"></td>
                                </tr>
                                <tr>
                                    <td>(___________________)</td>
                                    <td>(___________________)</td>
                                    <td>(___________________)</td>
                                </tr>
                                <tr>
                                    <td>Admin Gudang</td>
                                    <td>Kepala Gudang</td>
                                    <td>Pimpinan</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </MasterLayout>
    );
}