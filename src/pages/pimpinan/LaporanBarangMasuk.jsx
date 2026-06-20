import React, { useState, useEffect, useMemo } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './LaporanBarangMasuk.css';

const LaporanBarangMasuk = () => {
    const [transactions, setTransactions] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [barangs, setBarangs] = useState([]); // <-- State baru untuk kamus barang
    const [isLoading, setIsLoading] = useState(true);
    
    // State Kontrol Mode Cetak Laporan (Landscape)
    const [showReport, setShowReport] = useState(false);

    // State untuk Filter Data
    const [tgl1, setTgl1] = useState(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    });
    const [tgl2, setTgl2] = useState(() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    });
    const [selectedSup, setSelectedSup] = useState('');

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

    // 1. Ambil list supplier untuk Dropdown Filter
    const fetchSuppliers = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/supplier', { headers });
            const result = await response.json();
            setSuppliers(result.data || result || []);
        } catch (error) {
            console.error("Gagal mengambil data supplier:", error);
        }
    };

    // 2. Ambil list barang sebagai kamus (untuk mencari relasi supplier)
    const fetchBarangs = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/barang', { headers });
            const result = await response.json();
            setBarangs(result.data || result || []);
        } catch (error) {
            console.error("Gagal mengambil data barang:", error);
        }
    };

    // 3. Ambil seluruh data transaksi
    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/transaksi', { headers });
            const result = await response.json();
            setTransactions(result.data || result || []);
        } catch (error) {
            console.error("Gagal mengambil data transaksi:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
        fetchBarangs();
        fetchTransactions();
    }, []);

    // 4. Logika Pemfilteran Data Secara Real-time
    const filteredRows = useMemo(() => {
        return transactions.filter(item => {
            if (item.jenis_transaksi !== 'masuk') return false;

            // Filter Tanggal
            const itemDate = item.tanggal_transaksi ? item.tanggal_transaksi.split(' ')[0].split('T')[0] : '';
            const matchDate = itemDate >= tgl1 && itemDate <= tgl2;
            
            // Filter Supplier (Cari relasinya dari kamus barang)
            const linkedBarang = barangs.find(b => String(b.id_barang) === String(item.id_barang));
            const itemSupplierId = linkedBarang ? linkedBarang.id_supplier : (item.barang?.id_supplier || item.id_supplier);
            
            const matchSupplier = selectedSup === '' || String(itemSupplierId) === String(selectedSup);

            return matchDate && matchSupplier;
        });
    }, [transactions, barangs, tgl1, tgl2, selectedSup]);

    // 5. Hitung Summary
    const totalUnit = useMemo(() => {
        return filteredRows.reduce((sum, item) => sum + (parseInt(item.jumlah) || 0), 0);
    }, [filteredRows]);

    const supplierNameSelected = useMemo(() => {
        if (!selectedSup) return 'Semua Supplier';
        const found = suppliers.find(s => String(s.id_supplier) === String(selectedSup));
        return found ? found.nama_supplier : 'Semua Supplier';
    }, [selectedSup, suppliers]);

    const handlePrint = () => {
        window.print();
    };

    const formatDateIndo = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const noDok = `LPM/${new Date().toISOString().slice(0,10).replace(/-/g,'')}/${Math.floor(Math.random() * 900) + 100}`;
    const nowTime = `${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} ${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')} WIB`;

    // =========================================================================
    // RENDER MODE: CETAK LAPORAN (KERTAS A4 LANDSCAPE)
    // =========================================================================
    if (showReport) {
        return (
            <div className="report-mode-wrapper">
                <div className="action-bar hide-on-print">
                    <h5>Preview Cetak Laporan Barang Masuk</h5>
                    <div className="btn-group gap-2">
                        <button className="btn btn-secondary fw-bold" onClick={() => setShowReport(false)}>Kembali</button>
                        <button className="btn btn-primary fw-bold" onClick={handlePrint}>Print Laporan</button>
                        <button className="btn btn-danger fw-bold" onClick={handlePrint}>Download PDF</button>
                    </div>
                </div>

                <div className="paper-wrapper">
                    <div className="paper landscape-paper" id="area-laporan">
                        {/* KOP SURAT */}
                        <div className="kop">
                            <img 
                                src="/public/logoinveera.png" 
                                className="logo" 
                                alt="Logo" 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/82?text=Logo'; }}
                            />
                            <div className="kop-text">
                                <h1>CV. INVEERA</h1>
                                <p>Jl. Peta No. 123 Kota Tasikmalaya, Jawa Barat</p>
                                <p>Telp: (0265) 345-9090 | Email: inveera@gmail.com</p>
                                <p>Sistem Informasi Manajemen Inventaris</p>
                            </div>
                        </div>

                        {/* JUDUL */}
                        <div className="judul">
                            <h3>Laporan Barang Masuk</h3>
                            <p>Periode : {formatDateIndo(tgl1)} - {formatDateIndo(tgl2)}</p>
                        </div>

                        {/* SUMMARY LAPORAN */}
                        <table className="summary-table-masuk">
                            <tbody>
                                <tr>
                                    <td className="label" width="33.33%">Total Transaksi</td>
                                    <td className="label" width="33.33%">Total Barang Masuk</td>
                                    <td className="label" width="33.33%">Supplier Dipilih</td>
                                </tr>
                                <tr>
                                    <td className="value">{filteredRows.length} Transaksi</td>
                                    <td className="value">{totalUnit.toLocaleString('id-ID')} Unit</td>
                                    <td className="value">{supplierNameSelected}</td>
                                </tr>
                            </tbody>
                        </table>

                        {/* TABEL DATA UTAMA */}
                        <table className="table-laporan-masuk">
                            <thead>
                                <tr>
                                    <th width="5%">No</th>
                                    <th width="15%">Tanggal</th>
                                    <th width="35%">Nama Barang</th>
                                    <th width="30%">Supplier</th>
                                    <th width="15%">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRows.length > 0 ? (
                                    filteredRows.map((row, idx) => {
                                        // 1. Format Tanggal
                                        let dateFormatted = '-';
                                        if (row.tanggal_transaksi) {
                                            const t = row.tanggal_transaksi.split(' ')[0].split('T')[0].split('-');
                                            if(t.length === 3) dateFormatted = `${t[2]}/${t[1]}/${t[0]}`;
                                        }

                                        // 2. Cari Relasi Barang & Supplier
                                        const linkedBarang = barangs.find(b => String(b.id_barang) === String(row.id_barang));
                                        
                                        const fixNamaBarang = linkedBarang ? linkedBarang.nama_barang : (row.barang?.nama_barang || row.nama_barang);
                                        const fixSatuan = linkedBarang ? linkedBarang.satuan : (row.barang?.satuan || row.satuan || 'Unit');
                                        const fixSupplierName = linkedBarang ? (linkedBarang.nama_supplier || linkedBarang.supplier?.nama_supplier) : '-';

                                        return (
                                            <tr key={row.id_transaksi}>
                                                <td className="text-center">{idx + 1}</td>
                                                <td className="text-center">{dateFormatted}</td>
                                                <td><b>{fixNamaBarang}</b></td>
                                                <td>{fixSupplierName || '-'}</td>
                                                <td className="text-center">
                                                    <span className="badge-masuk-report">
                                                        {row.jumlah} {fixSatuan}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-3">Tidak ada data barang masuk.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* FOOTER TANDA TANGAN */}
                        <div className="footer-laporan">
                            <div className="footer-info">
                                No Dokumen : {noDok} <br/><br/>
                                Tanggal Cetak : {nowTime}
                            </div>
                            <table className="ttd-table">
                                <tbody>
                                    <tr>
                                        <td>Dibuat Oleh</td>
                                        <td>Diperiksa Oleh</td>
                                        <td>Disetujui Oleh</td>
                                    </tr>
                                    <tr>
                                        <td className="space"></td>
                                        <td className="space"></td>
                                        <td className="space"></td>
                                    </tr>
                                    <tr>
                                        <td>(___________________)</td>
                                        <td>(___________________)</td>
                                        <td>(___________________)</td>
                                    </tr>
                                    <tr>
                                        <td className="jabatan">Admin Gudang</td>
                                        <td className="jabatan">Kepala Gudang</td>
                                        <td className="jabatan">Pimpinan</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // RENDER MODE: MONITORING / DASHBOARD UTAMA
    // =========================================================================
    return (
        <MasterLayout>
            {/* HEADER */}
            <div className="page-header d-lg-flex justify-content-between align-items-center">
                <div>
                    <h3>Laporan Barang Masuk</h3>
                    <p>Monitoring transaksi barang masuk berdasarkan supplier dan tanggal</p>
                </div>
                <button
                    onClick={() => setShowReport(true)}
                    className="btn btn-light text-dark rounded-pill px-4 py-2 mt-3 mt-lg-0 fw-bold shadow-sm"
                >
                    <i className="fas fa-print me-2 text-primary"></i> Cetak
                </button>
            </div>

            {/* FILTER CARD */}
            <div className="filter-card">
                <div className="row g-3 filter-grid">
                    <div className="col-lg-3">
                        <label className="form-label fw-semibold">Tanggal Awal</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            value={tgl1} 
                            onChange={(e) => setTgl1(e.target.value)} 
                        />
                    </div>
                    <div className="col-lg-3">
                        <label className="form-label fw-semibold">Tanggal Akhir</label>
                        <input 
                            type="date" 
                            className="form-control" 
                            value={tgl2} 
                            onChange={(e) => setTgl2(e.target.value)} 
                        />
                    </div>
                    <div className="col-lg-4">
                        <label className="form-label fw-semibold">Supplier</label>
                        <select 
                            className="form-select text-dark" 
                            value={selectedSup}
                            onChange={(e) => setSelectedSup(e.target.value)}
                        >
                            <option value="">Semua Supplier</option>
                            {suppliers.map((s) => (
                                <option key={s.id_supplier} value={s.id_supplier}>
                                    {s.nama_supplier}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="col-lg-2 d-grid">
                        <label className="form-label d-none d-lg-block">&nbsp;</label>
                        <button 
                            className="btn btn-primary btn-filter d-flex align-items-center justify-content-center gap-2"
                            onClick={() => { fetchTransactions(); fetchBarangs(); }}
                        >
                            <i className="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* MONITORING TABLE */}
            <div className="table-card">
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th className="text-center" width="80">No</th>
                                <th className="text-center">Tanggal</th>
                                <th>Nama Barang</th>
                                <th>Supplier</th>
                                <th className="text-center">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5 text-muted">
                                        <i className="fas fa-spinner fa-spin fa-2x mb-2"></i>
                                        <p className="mb-0">Memuat data transaksi masuk...</p>
                                    </td>
                                </tr>
                            ) : filteredRows.length > 0 ? (
                                filteredRows.map((row, idx) => {
                                    // Konversi tanggal string ke format d/m/Y lokal
                                    let displayDate = '-';
                                    if (row.tanggal_transaksi) {
                                        const parts = row.tanggal_transaksi.split(' ')[0].split('T')[0].split('-');
                                        if (parts.length === 3) displayDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
                                    }

                                    // CARI RELASI BARANG & SUPPLIER
                                    const linkedBarang = barangs.find(b => String(b.id_barang) === String(row.id_barang));
                                    
                                    const fixNamaBarang = linkedBarang ? linkedBarang.nama_barang : (row.barang?.nama_barang || row.nama_barang);
                                    const fixSatuan = linkedBarang ? linkedBarang.satuan : (row.barang?.satuan || row.satuan || 'Unit');
                                    const fixSupplierName = linkedBarang ? (linkedBarang.nama_supplier || linkedBarang.supplier?.nama_supplier) : '-';

                                    return (
                                        <tr key={row.id_transaksi}>
                                            <td className="text-center text-muted fw-bold">{idx + 1}</td>
                                            <td className="text-center">
                                                <span className="tanggal-box-view">{displayDate}</span>
                                            </td>
                                            <td>
                                                <div className="barang-name-view">{fixNamaBarang}</div>
                                            </td>
                                            <td>
                                                <div className="supplier-name-view">
                                                    {fixSupplierName || '-'}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className="jumlah-box-view">
                                                    <i className="fas fa-box me-1"></i>
                                                    {row.jumlah} {fixSatuan}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">
                                        <h6 className="fw-bold text-dark">Data Tidak Ditemukan</h6>
                                        <p className="text-muted mb-0">Tidak ada transaksi barang masuk pada filter yang dipilih.</p>
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

export default LaporanBarangMasuk;