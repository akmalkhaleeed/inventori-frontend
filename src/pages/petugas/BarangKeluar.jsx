import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import Swal from 'sweetalert2';
import './BarangKeluarPetugas.css';

const BarangKeluarPetugas = () => {
    const [barangs, setBarangs] = useState([]);
    const [history, setHistory] = useState([]);
    const [isLoadingBarang, setIsLoadingBarang] = useState(true);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        id_barang: '',
        jumlah: '',
        harga_jual_aktual: '',
        keterangan: ''
    });

    const token = localStorage.getItem('token');
    const headers = { 
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
    };

    // 1. Ambil Data Barang (Hanya yang stoknya > 0)
    const fetchBarang = async () => {
        setIsLoadingBarang(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/barang', { headers });
            const result = await response.json();
            const allBarang = result.data || result || [];
            
            // Filter barang yang stoknya lebih dari 0
            const availableBarang = allBarang.filter(b => parseInt(b.stok) > 0);
            setBarangs(availableBarang);
        } catch (error) {
            console.error("Gagal mengambil data barang:", error);
        } finally {
            setIsLoadingBarang(false);
        }
    };

    // 2. Ambil Riwayat & Filter Otomatis (Masuk -> Keluar, Tanggal Hari Ini)
    const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/transaksi', { headers });
            const result = await response.json();
            const allTransaksi = result.data || result || [];

            // Tanggal Lokal (WIB)
            const todayDate = new Date();
            const today = new Date(todayDate.getTime() - (todayDate.getTimezoneOffset() * 60000))
                            .toISOString()
                            .split('T')[0];

            const filteredHistory = allTransaksi.filter(item => {
                const itemDate = item.tanggal_transaksi ? item.tanggal_transaksi.split(' ')[0].split('T')[0] : '';
                return item.jenis_transaksi === 'keluar' && itemDate === today; // Filter transaksi KELUAR
            });

            setHistory(filteredHistory);
        } catch (error) {
            console.error("Gagal mengambil riwayat transaksi:", error);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchBarang();
        fetchHistory();
    }, []);

    // 3. Auto-fill Harga Jual saat Barang Dipilih
    const handleSelectBarang = (e) => {
        const selectedId = e.target.value;
        const selectedBarang = barangs.find(b => b.id_barang.toString() === selectedId);
        
        setFormData({ 
            ...formData, 
            id_barang: selectedId,
            // Otomatis isi harga jual dari data barang jika ada
            harga_jual_aktual: selectedBarang ? selectedBarang.harga_jual : '' 
        });
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 4. Handle Submit Barang Keluar
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi Dasar
        if (!formData.id_barang || formData.jumlah <= 0 || formData.harga_jual_aktual <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Tidak Valid!',
                text: 'Pastikan barang, jumlah, dan harga jual sudah benar.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        // Cek apakah jumlah keluar melebihi stok
        const selectedBarang = barangs.find(b => b.id_barang.toString() === formData.id_barang);
        if (selectedBarang && parseInt(formData.jumlah) > parseInt(selectedBarang.stok)) {
            Swal.fire({
                icon: 'error',
                title: 'Stok Tidak Mencukupi!',
                html: `Sisa stok tersedia: <br><b>${selectedBarang.stok} ${selectedBarang.satuan}</b>`,
                confirmButtonColor: '#ef4444'
            });
            return;
        }

        setIsSubmitting(true);

        const userId = localStorage.getItem('user_id') || localStorage.getItem('userId') || localStorage.getItem('id_user') || 1; 

        // Untuk barang keluar, kita perlu mengirim harga beli aslinya dan harga jual aktual
        const payload = {
            id_barang: parseInt(formData.id_barang),
            id_user: parseInt(userId),
            jumlah: parseInt(formData.jumlah),
            harga_beli: parseFloat(selectedBarang.harga_beli), // Harga beli asli barang
            harga_jual_aktual: parseFloat(formData.harga_jual_aktual), // Harga jual saat dikeluarkan
            keterangan: formData.keterangan.trim(),
            jenis_transaksi: 'keluar' 
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/transaksi', {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    html: `
                        Barang berhasil dikeluarkan.<br><br>
                        <b>${selectedBarang.nama_barang}</b><br>
                        Jumlah: <b>${formData.jumlah} ${selectedBarang.satuan}</b>
                    `,
                    confirmButtonColor: '#4f46e5'
                });
                
                setFormData({ id_barang: '', jumlah: '', harga_jual_aktual: '', keterangan: '' });
                fetchBarang();
                fetchHistory();
            } else {
                const errResult = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal!',
                    text: errResult.message || 'Terjadi kesalahan saat menyimpan.',
                    confirmButtonColor: '#ef4444'
                });
            }
        } catch (error) {
            Swal.fire('Error!', 'Tidak dapat terhubung ke server backend.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MasterLayout>
            <div className="mb-4">
                <h3 className="fw-bold mb-1 text-dark">Barang Keluar</h3>
                <p className="text-muted mb-0">Catat pengeluaran barang dari gudang.</p>
            </div>

            <div className="row g-4">
                {/* KOLOM FORM INPUT */}
                <div className="col-lg-5">
                    <div className="card-custom">
                        <form onSubmit={handleSubmit}>
                            {/* PILIH BARANG */}
                            <div className="mb-3">
                                <label className="form-label">Pilih Barang</label>
                                <select
                                    name="id_barang"
                                    className="form-select text-dark fw-semibold"
                                    value={formData.id_barang}
                                    onChange={handleSelectBarang}
                                    disabled={isLoadingBarang}
                                    required
                                >
                                    <option value="">-- Pilih Barang --</option>
                                    {barangs.map((b) => (
                                        <option key={b.id_barang} value={b.id_barang}>
                                            {b.nama_barang} | Stok: {Number(b.stok).toLocaleString('id-ID')} {b.satuan}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* HARGA JUAL */}
                            <div className="mb-3">
                                <label className="form-label">Harga Jual Aktual</label>
                                <input
                                    type="number"
                                    name="harga_jual_aktual"
                                    className="form-control"
                                    placeholder="Masukkan harga jual..."
                                    min="1"
                                    value={formData.harga_jual_aktual}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* JUMLAH */}
                            <div className="mb-3">
                                <label className="form-label">Jumlah Keluar</label>
                                <input
                                    type="number"
                                    name="jumlah"
                                    className="form-control"
                                    placeholder="Masukkan jumlah..."
                                    min="1"
                                    value={formData.jumlah}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            {/* KETERANGAN */}
                            <div className="mb-3">
                                <label className="form-label">Keterangan</label>
                                <textarea
                                    name="keterangan"
                                    className="form-control"
                                    rows="3"
                                    placeholder="Contoh: Dijual ke pelanggan..."
                                    value={formData.keterangan}
                                    onChange={handleInputChange}
                                ></textarea>
                            </div>

                            {/* INFO */}
                            <div className="info-box small text-muted mb-4">
                                <div className="mb-1">
                                    <i className="fa-solid fa-circle-info me-1 text-primary"></i>
                                    Pastikan stok mencukupi.
                                </div>
                                <div>Sistem otomatis mengurangi stok barang.</div>
                            </div>

                            {/* BUTTON SUBMIT */}
                            <button
                                type="submit"
                                className="btn btn-keluar w-100 d-flex align-items-center justify-content-center"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <><i className="fas fa-spinner fa-spin me-2"></i> Memproses...</>
                                ) : (
                                    <><i className="fas fa-paper-plane me-2"></i> Simpan Transaksi</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* KOLOM RIWAYAT */}
                <div className="col-lg-7">
                    <div className="card-custom">
                        <div className="mb-4">
                            <h5 className="fw-bold text-dark mb-1">Riwayat Barang Keluar Hari Ini</h5>
                            <small className="text-muted">Semua transaksi pengeluaran hari ini.</small>
                        </div>

                        <div className="table-responsive">
                            <table className="table align-middle mb-0">
                                <thead className="table-light">
                                    <tr className="small text-muted font-uppercase">
                                        <th>Waktu</th>
                                        <th>Barang</th>
                                        <th>Harga Beli</th>
                                        <th>Harga Jual</th>
                                        <th>Keterangan</th>
                                        <th className="text-end">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingHistory ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4 text-muted small">
                                                <i className="fas fa-spinner fa-spin me-2"></i> Memuat riwayat...
                                            </td>
                                        </tr>
                                    ) : history.length > 0 ? (
                                        history.map((row) => {
                                            // Konversi Waktu UTC ke WIB
                                            let timeFormatted = '--:--';
                                            if (row.tanggal_transaksi) {
                                                let dateString = row.tanggal_transaksi;
                                                if (!dateString.includes('T')) dateString = dateString.replace(' ', 'T') + 'Z';
                                                else if (!dateString.endsWith('Z')) dateString += 'Z';
                                                
                                                const dateObj = new Date(dateString);
                                                timeFormatted = dateObj.toLocaleTimeString('id-ID', {
                                                    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
                                                }).replace('.', ':');
                                            }

                                            return (
                                                <tr key={row.id_transaksi}>
                                                    <td className="small text-muted fw-semibold">{timeFormatted} WIB</td>
                                                    <td>
                                                        <div className="fw-bold text-dark">
                                                            {row.barang?.nama_barang || row.nama_barang || 'ID: ' + row.id_barang}
                                                        </div>
                                                        <small className="text-muted">{row.barang?.satuan || row.satuan}</small>
                                                    </td>
                                                    <td className="fw-semibold text-dark small">
                                                        Rp {Number(row.harga_beli).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="fw-semibold text-success small">
                                                        Rp {Number(row.harga_jual_aktual).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="small text-muted">
                                                        {row.keterangan || '-'}
                                                    </td>
                                                    <td className="text-end">
                                                        <span className="badge-keluar">
                                                            - {Number(row.jumlah).toLocaleString('id-ID')} {row.barang?.satuan || row.satuan || ''}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="text-center py-5 text-muted small">
                                                Belum ada transaksi keluar hari ini.
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

export default BarangKeluarPetugas;