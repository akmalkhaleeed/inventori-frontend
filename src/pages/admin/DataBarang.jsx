import React, { useState, useEffect } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './DataBarang.css';
import Swal from 'sweetalert2';

const DataBarang = () => {
    const [barangs, setBarangs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:8000/api/barang', {
                headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
            });
            const result = await response.json();
            setBarangs(result.data || []);
        } catch (error) {
            console.error("Gagal ambil data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Hapus Barang?',
            text: 'Semua transaksi terkait juga akan terhapus.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus'
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                await fetch(`http://127.0.0.1:8000/api/barang/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                Swal.fire('Berhasil!', 'Barang berhasil dihapus.', 'success');
                fetchData(); // Refresh data
            } catch {
                Swal.fire('Error!', 'Gagal menghapus barang.', 'error');
            }
        }
    };

    const getStokClass = (stok) => {
        if (stok <= 5) return 'stok-danger';
        if (stok <= 15) return 'stok-warning';
        return 'stok-aman';
    };

    const filteredData = barangs.filter(item => 
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MasterLayout>
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h2 className="page-title mb-1">Manajemen Barang</h2>
                    <small className="text-muted">Kelola data inventaris barang perusahaan</small>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    <input 
                        type="text" className="search-box" placeholder="Cari barang..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn-primary-custom">
                        <i className="fa fa-plus me-2"></i> Tambah Barang
                    </button>
                </div>
            </div>

            <div className="table-card">
                <div className="table-responsive">
                    <table className="table align-middle" id="barangTable">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama Barang</th>
                                <th>Kategori</th>
                                <th>Rak</th>
                                <th>Stok</th>
                                <th>Harga Beli</th>
                                <th>Harga Jual</th>
                                <th className="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan="8" className="text-center py-5">Memuat...</td></tr>
                            ) : filteredData.map((row, i) => (
                                <tr key={row.id}>
                                    <td>{i + 1}</td>
                                    <td className="fw-semibold">{row.nama_barang}</td>
                                    <td>{row.nama_kategori || '-'}</td>
                                    <td><span className="badge bg-light text-dark border">{row.lokasi_rak || '-'}</span></td>
                                    <td>
                                        <span className={`stok-badge ${getStokClass(row.stok)}`}>
                                            {row.stok} {row.satuan}
                                        </span>
                                    </td>
                                    <td>Rp {Number(row.harga_beli).toLocaleString('id-ID')}</td>
                                    <td>Rp {Number(row.harga_jual).toLocaleString('id-ID')}</td>
                                    <td className="text-center">
                                        <button className="btn-aksi btn-edit me-2"><i className="fa fa-pen"></i></button>
                                        <button className="btn-aksi btn-hapus" onClick={() => handleDelete(row.id)}><i className="fa fa-trash"></i></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MasterLayout>
    );
};

export default DataBarang;