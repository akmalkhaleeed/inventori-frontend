import React, { useState, useEffect, useMemo } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './StokOpname.css';

const StokOpname = () => {
    const [barangs, setBarangs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // State "Sakti" untuk menggabungkan dua file menjadi satu
    const [showReport, setShowReport] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/barang', { headers });
            const result = await response.json();
            setBarangs(result.data || result || []);
        } catch (error) {
            console.error("Gagal mengambil data barang:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Kalkulasi Summary secara real-time dari array barangs
    const summary = useMemo(() => {
        let tBarang = barangs.length;
        let tStok = 0;
        let tAset = 0;
        let sKritis = 0;
        let tProfit = 0;

        barangs.forEach(b => {
            const stok = parseInt(b.stok) || 0;
            const hargaBeli = parseFloat(b.harga_beli) || 0;
            const hargaJual = parseFloat(b.harga_jual) || 0;

            tStok += stok;
            tAset += (stok * hargaBeli);
            if (stok <= 5) sKritis += 1;
            tProfit += ((hargaJual - hargaBeli) * stok);
        });

        return { tBarang, tStok, tAset, sKritis, tProfit };
    }, [barangs]);

    // Fungsi Print Bawaan Browser
    const handlePrint = () => {
        window.print();
    };

    // Format Tanggal untuk Kop Laporan
    const todayDateObj = new Date();
    const todayDate = todayDateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const firstDay = `01 ${todayDateObj.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;
    
    const noDok = `INV/LAP/${todayDateObj.getFullYear()}/${String(todayDateObj.getMonth() + 1).padStart(2, '0')}/${Math.floor(Math.random() * 900) + 100}`;
    const printTime = `${todayDate} ${String(todayDateObj.getHours()).padStart(2, '0')}:${String(todayDateObj.getMinutes()).padStart(2, '0')} WIB`;

    // =========================================================================
    // RENDER: MODE LAPORAN (KERTAS CETAK LANDSCAPE)
    // =========================================================================
    if (showReport) {
        return (
            <div className="report-mode-wrapper">
                <div className="action-bar hide-on-print">
                    <h5>Preview Cetak Laporan</h5>
                    <div className="btn-group-report">
                        <button className="btn-report btn-back" onClick={() => setShowReport(false)}>Kembali</button>
                        <button className="btn-report btn-print" onClick={handlePrint}>Print Laporan</button>
                        <button className="btn-report btn-pdf" onClick={handlePrint}>Download PDF</button>
                    </div>
                </div>

                <div className="paper-wrapper">
                    <div className="paper" id="area-laporan">
                        <div className="kop">
                            <img 
                                src="/assets/img/logoinveera.png" 
                                alt="Logo INVEERA" 
                                className="logo" 
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/82?text=Logo'; }}
                            />
                            <div className="kop-text">
                                <h1>CV. INVEERA</h1>
                                <p>Jl. Peta No. 123 Kota Tasikmalaya, Jawa Barat</p>
                                <p>Telp: (0265) 345-9090 | Email: inveera@gmail.com</p>
                                <p>Sistem Informasi Manajemen Inventaris</p>
                            </div>
                        </div>

                        <div className="judul">
                            <h3>LAPORAN MONITORING INVENTORI BARANG</h3>
                            <p>Periode : {firstDay} - {todayDate}</p>
                        </div>

                        <table className="summary-table">
                            <thead>
                                <tr>
                                    <td className="label">Total Barang</td>
                                    <td className="label">Total Stok</td>
                                    <td className="label">Stok Kritis</td>
                                    <td className="label">Nilai Aset</td>
                                    <td className="label">Potensi Profit</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="value">{summary.tBarang} Item</td>
                                    <td className="value">{summary.tStok} Unit</td>
                                    <td className="value">{summary.sKritis} Item</td>
                                    <td className="value">Rp {summary.tAset.toLocaleString('id-ID')}</td>
                                    <td className="value">Rp {summary.tProfit.toLocaleString('id-ID')}</td>
                                </tr>
                            </tbody>
                        </table>

                        <table className="table-laporan">
                            <thead>
                                <tr>
                                    <th width="4%">No</th>
                                    <th width="15%">Nama Barang</th>
                                    <th width="10%">Kategori</th>
                                    <th width="12%">Supplier</th>
                                    <th width="10%">Harga Beli</th>
                                    <th width="10%">Harga Jual</th>
                                    <th width="9%">Profit</th>
                                    <th width="6%">Stok</th>
                                    <th width="6%">Satuan</th>
                                    <th width="11%">Total Aset</th>
                                    <th width="7%">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {barangs.map((row, idx) => {
                                    const profit = (parseFloat(row.harga_jual) || 0) - (parseFloat(row.harga_beli) || 0);
                                    const totalNilai = (parseFloat(row.harga_beli) || 0) * (parseInt(row.stok) || 0);
                                    const supplierName = row.nama_supplier || row.supplier?.nama_supplier || '-';
                                    
                                    let statusClass = "badge-status aman";
                                    let statusText = "AMAN";
                                    if (row.stok <= 0) {
                                        statusClass = "badge-status habis";
                                        statusText = "HABIS";
                                    } else if (row.stok <= 5) {
                                        statusClass = "badge-status kritis";
                                        statusText = "KRITIS";
                                    }

                                    return (
                                        <tr key={row.id_barang}>
                                            <td className="text-center">{idx + 1}</td>
                                            <td><b>{row.nama_barang}</b></td>
                                            <td>{row.nama_kategori || '-'}</td>
                                            <td>{supplierName}</td>
                                            <td className="text-right">Rp {Number(row.harga_beli).toLocaleString('id-ID')}</td>
                                            <td className="text-right">Rp {Number(row.harga_jual).toLocaleString('id-ID')}</td>
                                            <td className="text-right">Rp {profit.toLocaleString('id-ID')}</td>
                                            <td className="text-center">{row.stok}</td>
                                            <td className="text-center">{row.satuan}</td>
                                            <td className="text-right">Rp {totalNilai.toLocaleString('id-ID')}</td>
                                            <td className="text-center">
                                                <span className={statusClass}>{statusText}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="footer-laporan">
                            <div className="footer-info">
                                No Dokumen : {noDok} <br/><br/>
                                Tanggal Cetak : {printTime}
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
    // RENDER: MODE DASHBOARD (UTAMA - SUDAH LENGKAP)
    // =========================================================================
    return (
        <MasterLayout>
            <div className="page-header-gradient d-flex justify-content-between align-items-center flex-wrap shadow-sm">
                <div className="position-relative z-1">
                    <h3 className="text-white fw-bold mb-1">Dashboard Monitoring Inventori</h3>
                    <p className="text-white opacity-75 mb-0">Pantau stok barang, aset gudang, dan kondisi inventori secara realtime.</p>
                </div>
                <div className="mt-3 mt-lg-0 position-relative z-1">
                    <button onClick={() => setShowReport(true)} className="btn btn-light rounded-pill px-4 fw-bold shadow-sm">
                        <i className="fas fa-print me-2 text-primary"></i> Cetak Laporan
                    </button>
                </div>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-lg-3 col-md-6">
                    <div className="card-summary p-4">
                        <div className="icon-box bg-primary-subtle text-primary mb-3"><i className="fas fa-box"></i></div>
                        <p className="text-muted fw-bold small mb-1 text-uppercase">Total Barang</p>
                        <h4 className="fw-bolder text-dark mb-0">{isLoading ? '...' : summary.tBarang.toLocaleString('id-ID')}</h4>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card-summary p-4">
                        <div className="icon-box bg-success-subtle text-success mb-3"><i className="fas fa-cubes"></i></div>
                        <p className="text-muted fw-bold small mb-1 text-uppercase">Total Stok</p>
                        <h4 className="fw-bolder text-dark mb-0">{isLoading ? '...' : summary.tStok.toLocaleString('id-ID')}</h4>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card-summary p-4">
                        <div className="icon-box bg-danger-subtle text-danger mb-3"><i className="fas fa-triangle-exclamation"></i></div>
                        <p className="text-muted fw-bold small mb-1 text-uppercase">Stok Kritis</p>
                        <h4 className="fw-bolder text-dark mb-0">{isLoading ? '...' : summary.sKritis.toLocaleString('id-ID')}</h4>
                    </div>
                </div>
                <div className="col-lg-3 col-md-6">
                    <div className="card-summary p-4">
                        <div className="icon-box bg-warning-subtle text-warning mb-3"><i className="fas fa-wallet"></i></div>
                        <p className="text-muted fw-bold small mb-1 text-uppercase">Nilai Aset</p>
                        <h4 className="fw-bolder text-dark mb-0 fs-5">Rp {isLoading ? '...' : summary.tAset.toLocaleString('id-ID')}</h4>
                    </div>
                </div>
            </div>

            <div className="card-table">
                <div className="mb-4">
                    <h5 className="fw-bold mb-1 text-dark">Data Inventori Barang</h5>
                    <small className="text-muted">Monitoring stok barang gudang secara realtime.</small>
                </div>
                <div className="table-responsive">
                    <table className="table align-middle mb-0" style={{ minWidth: '1000px' }}>
                        <thead className="table-light">
                            <tr className="small text-muted font-uppercase text-center">
                                <th>No</th>
                                <th className="text-start">Nama Barang</th>
                                <th>Kategori</th>
                                <th>Supplier</th>
                                <th>Harga Beli</th>
                                <th>Harga Jual</th>
                                <th>Profit/Unit</th>
                                <th>Stok</th>
                                <th>Satuan</th>
                                <th>Total Nilai</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="11" className="text-center py-5 text-muted"><i className="fas fa-spinner fa-spin me-2"></i> Memuat...</td></tr>
                            ) : barangs.length > 0 ? (
                                barangs.map((row, idx) => {
                                    const isHabis = row.stok <= 0;
                                    const isKritis = row.stok > 0 && row.stok <= 5;
                                    
                                    const profit = (parseFloat(row.harga_jual) || 0) - (parseFloat(row.harga_beli) || 0);
                                    const totalNilai = (parseFloat(row.harga_beli) || 0) * (parseInt(row.stok) || 0);
                                    const supplierName = row.nama_supplier || row.supplier?.nama_supplier || '-';

                                    return (
                                        <tr key={row.id_barang}>
                                            <td className="text-center text-muted fw-bold">{idx + 1}</td>
                                            <td className="fw-bold text-dark">{row.nama_barang}</td>
                                            <td className="text-muted small">{row.nama_kategori || '-'}</td>
                                            <td className="text-muted small">{supplierName}</td>
                                            
                                            {/* Warna khusus sesuai PHP Native */}
                                            <td className="text-center fw-bold text-danger">Rp {Number(row.harga_beli).toLocaleString('id-ID')}</td>
                                            <td className="text-center fw-bold text-success">Rp {Number(row.harga_jual).toLocaleString('id-ID')}</td>
                                            <td className="text-center fw-bold" style={{ color: '#0284c7' }}>Rp {profit.toLocaleString('id-ID')}</td>
                                            
                                            <td className="text-center">
                                                <span className="bg-light text-dark fw-bold border px-3 py-2 rounded-3">
                                                    {row.stok}
                                                </span>
                                            </td>
                                            <td className="text-center text-muted small">{row.satuan}</td>
                                            
                                            <td className="text-center fw-bold text-primary">Rp {totalNilai.toLocaleString('id-ID')}</td>
                                            <td className="text-center">
                                                {isHabis ? <span className="badge bg-dark px-3 py-2 rounded-pill">Habis</span> : 
                                                 isKritis ? <span className="badge bg-danger px-3 py-2 rounded-pill">Kritis</span> : 
                                                 <span className="badge bg-success px-3 py-2 rounded-pill">Aman</span>}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan="11" className="text-center py-5 text-muted">Belum ada data barang.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </MasterLayout>
    );
};

export default StokOpname;