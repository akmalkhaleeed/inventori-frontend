import React, { useState, useEffect, useMemo } from 'react';
import MasterLayout from '../../layouts/MasterLayout'; // Sesuaikan path ini
import Swal from 'sweetalert2';
import './BarangKeluar.css';

const BarangKeluar = () => {
    const [transaksiKeluar, setTransaksiKeluar] = useState([]);
    const [barangList, setBarangList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [stokTersedia, setStokTersedia] = useState(0);
    
    const [formData, setFormData] = useState({
        id_barang: '',
        jumlah: '',
        harga_jual_aktual: '',
        penerima: '',
        keterangan: ''
    });

    // Kalkulasi total harga otomatis (menggunakan useMemo seperti BarangMasuk)
    const totalHarga = useMemo(() => {
        return (parseFloat(formData.harga_jual_aktual) || 0) * (parseInt(formData.jumlah) || 0);
    }, [formData.harga_jual_aktual, formData.jumlah]);

    // Fetch API Data
    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
        
        try {
            const [resTrans, resBarang] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/transaksi', { headers }),
                fetch('http://127.0.0.1:8000/api/barang', { headers })
            ]);
            
            const dataTrans = await resTrans.json();
            const dataBarang = await resBarang.json();

            // Filter khusus untuk jenis transaksi 'keluar'
            const dataKeluar = (dataTrans.data || []).filter(t => t.jenis_transaksi === 'keluar');
            setTransaksiKeluar(dataKeluar);
            
            // Set master barang untuk di dropdown form
            setBarangList(dataBarang.data || []);
        } catch (err) { 
            console.error(err); 
        }
    };

    // Jalankan fetch saat komponen di-mount
    useEffect(() => { 
        fetchData(); 
    }, []);

    // Format Rupiah
    const formatRupiah = (angka) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
    };

    // Handle Perubahan Select Barang (Sambil cek stok)
    const handleBarangChange = (e) => {
        const selectedId = e.target.value;
        const selectedBarang = barangList.find(b => b.id_barang.toString() === selectedId);

        if (selectedBarang) {
            setFormData(prev => ({
                ...prev,
                id_barang: selectedId,
                harga_jual_aktual: selectedBarang.harga_jual || '' // Ambil harga_jual dari tabel barang jika ada
            }));
            setStokTersedia(selectedBarang.stok);
        } else {
            setFormData(prev => ({ ...prev, id_barang: '', harga_jual_aktual: '' }));
            setStokTersedia(0);
        }
    };

    // Handle Input Lainnya
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi Stok
        if (Number(formData.jumlah) > stokTersedia) {
            Swal.fire({
                icon: 'warning',
                title: 'Stok Kurang',
                text: `Stok tersedia hanya ${stokTersedia}`,
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        const token = localStorage.getItem('token');
        const id_user = localStorage.getItem('id_user'); 

        if (!id_user) {
            Swal.fire('Gagal!', 'ID User tidak ditemukan. Harap logout dan login kembali.', 'error');
            return;
        }

        const payload = { 
            ...formData, 
            id_user: id_user,
            jenis_transaksi: 'keluar' 
        };

        try {
            const response = await fetch('http://127.0.0.1:8000/api/transaksi', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`, 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire('Berhasil!', 'Barang telah dikeluarkan dari stok.', 'success');
                setShowModal(false);
                setFormData({ id_barang: '', jumlah: '', harga_jual_aktual: '', penerima: '', keterangan: '' });
                setStokTersedia(0);
                fetchData(); // Panggil ulang data API agar list otomatis terupdate
            } else {
                console.log("Error dari Backend:", result);
                Swal.fire('Gagal!', JSON.stringify(result.errors || result.message), 'error');
            }
        } catch (err) {
            Swal.fire('Error', 'Server tidak merespon: ' + err.message, 'error');
        }
    };

    return (
        <MasterLayout>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                    <h3 className="fw-bold mb-0 text-dark">Barang Keluar</h3>
                    <p className="text-muted small mb-0">Pencatatan distribusi barang inventaris</p>
                </div>
                
                <button
                    className="btn btn-danger rounded-pill px-4 shadow-sm fw-bold"
                    onClick={() => setShowModal(true)}
                >
                    <i className="fa fa-minus-circle me-2"></i>
                    Input Barang Keluar
                </button>
            </div>

            <div className="card overflow-hidden border-0">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4">Tanggal</th>
                                <th>Barang</th>
                                <th>Jumlah</th>
                                <th>Harga Jual Aktual</th>
                                <th>Total</th>
                                <th>Petugas</th>
                                <th className="pe-4">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksiKeluar.length > 0 ? (
                                transaksiKeluar.map((row) => {
                                    // Antisipasi perbedaan nama kolom dari backend, fallback ke properti default
                                    const hargaSatuan = row.harga_jual_aktual || row.harga_jual || row.harga_beli || 0;
                                    const total = row.jumlah * hargaSatuan;
                                    const namaBarangTampil = row.nama_barang || (row.barang && row.barang.nama_barang) || '-';
                                    const namaPetugas = row.nama_lengkap || row.name || (row.user && row.user.name) || 'Sistem';

                                    return (
                                        <tr key={row.id_transaksi || row.id}>
                                            <td className="ps-4">
                                                <span className="fw-bold d-block">
                                                    {new Date(row.tanggal_transaksi).toLocaleDateString('id-ID')}
                                                </span>
                                                <small className="text-muted">
                                                    {new Date(row.tanggal_transaksi).toLocaleTimeString('id-ID')} WIB
                                                </small>
                                            </td>
                                            <td className="fw-semibold text-dark">{namaBarangTampil}</td>
                                            <td>
                                                <span className="badge badge-keluar rounded-pill px-3 py-2 fw-bold">
                                                    - {row.jumlah}
                                                </span>
                                            </td>
                                            <td>{formatRupiah(hargaSatuan)}</td>
                                            <td className="fw-bold text-success">{formatRupiah(total)}</td>
                                            <td>
                                                <small className="text-secondary">{namaPetugas}</small>
                                            </td>
                                            <td className="pe-4 small text-muted">
                                                {row.keterangan}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-5 text-muted">
                                        Belum ada transaksi barang keluar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL BACKDROP */}
            {showModal && <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>}

            {/* MODAL INPUT DENGAN STATE */}
            <div 
                className={`modal fade ${showModal ? 'show' : ''}`} 
                style={{ display: showModal ? 'block' : 'none', zIndex: 1045 }} 
                tabIndex="-1"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <form onSubmit={handleSubmit} className="modal-content border-0 shadow-lg">
                        <div className="modal-header border-0 pb-0">
                            <h5 className="fw-bold text-danger">
                                <i className="fa fa-box-open me-2"></i>
                                Form Pengeluaran
                            </h5>
                            <button 
                                type="button" 
                                className="btn-close" 
                                onClick={() => setShowModal(false)}
                            ></button>
                        </div>

                        <div className="modal-body">
                            <div className="alert alert-warning border-0 small mb-3 py-2">
                                <i className="fa fa-info-circle me-1"></i>
                                Pastikan jumlah tidak melebihi stok tersedia.
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">Pilih Barang</label>
                                <select
                                    name="id_barang"
                                    className="form-select rounded-3 shadow-sm"
                                    value={formData.id_barang}
                                    onChange={handleBarangChange}
                                    required
                                >
                                    <option value="">-- Cari Barang --</option>
                                    {barangList.map(b => (
                                        <option key={b.id_barang} value={b.id_barang}>
                                            {b.nama_barang} (Stok: {b.stok} {b.satuan})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Jumlah Keluar</label>
                                    <input
                                        type="number"
                                        name="jumlah"
                                        className="form-control rounded-3 shadow-sm"
                                        min="1"
                                        placeholder="0"
                                        value={formData.jumlah}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Harga Jual Aktual</label>
                                    <input
                                        type="number"
                                        name="harga_jual_aktual"
                                        className="form-control rounded-3 shadow-sm"
                                        placeholder="Masukkan harga jual"
                                        value={formData.harga_jual_aktual}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Nama Penerima</label>
                                    <input
                                        type="text"
                                        name="penerima"
                                        className="form-control rounded-3 shadow-sm"
                                        placeholder="Siapa pengambil?"
                                        value={formData.penerima}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label small fw-bold">Total Penjualan</label>
                                    <input
                                        type="text"
                                        className="form-control rounded-3 shadow-sm bg-light"
                                        value={formatRupiah(totalHarga)}
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="mb-0">
                                <label className="form-label small fw-bold">Tujuan / Keperluan / Penerima</label>
                                <textarea
                                    name="keterangan"
                                    className="form-control rounded-3 shadow-sm"
                                    rows="3"
                                    placeholder="Contoh: Digunakan divisi Humas"
                                    value={formData.keterangan}
                                    onChange={handleInputChange}
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="modal-footer border-0 pt-0">
                            <button 
                                type="button" 
                                className="btn btn-light rounded-pill px-4" 
                                onClick={() => setShowModal(false)}
                            >
                                Batal
                            </button>
                            <button type="submit" className="btn btn-danger rounded-pill px-4 fw-bold flex-grow-1">
                                Proses Keluar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </MasterLayout>
    );
};

export default BarangKeluar;