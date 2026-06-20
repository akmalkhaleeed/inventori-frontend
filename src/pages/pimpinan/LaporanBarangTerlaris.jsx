import React, { useState, useEffect, useMemo } from 'react';
import MasterLayout from '../../layouts/MasterLayout';
import './LaporanBarangTerlaris.css';

const LaporanBarangTerlaris = () => {
    const [transactions, setTransactions] = useState([]);
    const [barangs, setBarangs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [resTrans, resBarang] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/transaksi', { headers }),
                fetch('http://127.0.0.1:8000/api/barang', { headers })
            ]);
            
            const dataTrans = await resTrans.json();
            const dataBarang = await resBarang.json();

            setTransactions(dataTrans.data || dataTrans || []);
            setBarangs(dataBarang.data || dataBarang || []);
        } catch (error) {
            console.error("Gagal mengambil data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const topItems = useMemo(() => {
        if (!transactions.length || !barangs.length) return [];

        const keluar = transactions.filter(t => t.jenis_transaksi === 'keluar');

        const mapGroup = {};
        keluar.forEach(t => {
            const id = t.id_barang;
            if (!mapGroup[id]) mapGroup[id] = 0;
            mapGroup[id] += (parseInt(t.jumlah) || 0);
        });

        let result = Object.keys(mapGroup).map(id => {
            const brg = barangs.find(b => String(b.id_barang) === String(id));
            return {
                id_barang: id,
                nama_barang: brg ? brg.nama_barang : 'Barang Terhapus / Tidak Diketahui',
                nama_kategori: brg ? (brg.nama_kategori || brg.kategori?.nama_kategori || '-') : '-',
                total_keluar: mapGroup[id]
            };
        });

        result.sort((a, b) => b.total_keluar - a.total_keluar);
        return result.slice(0, 10);
    }, [transactions, barangs]);

    return (
        <MasterLayout>
            <div className="page-header-terlaris shadow-sm">
                <div className="position-relative z-1">
                    <h3 className="text-white fw-bold mb-1">Barang Terlaris</h3>
                    <p className="text-white opacity-75 mb-0">
                        Top 10 barang dengan penggunaan tertinggi
                    </p>
                </div>
            </div>

            <div className="row g-4 printable-area">
                {isLoading ? (
                    <div className="col-12 text-center py-5">
                        <i className="fas fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                        <h6 className="fw-bold text-muted">Menganalisis Data Transaksi...</h6>
                    </div>
                ) : topItems.length > 0 ? (
                    topItems.map((item, index) => (
                        <div className="col-md-6 col-xl-4" key={item.id_barang}>
                            <div className="analysis-card d-flex align-items-center">
                                <div className="rank-badge me-3 shadow-sm">
                                    #{index + 1}
                                </div>
                                <div className="flex-grow-1 text-truncate pe-2">
                                    <h6 className="fw-bold mb-1 text-truncate" title={item.nama_barang}>
                                        {item.nama_barang}
                                    </h6>
                                    <small className="text-muted text-truncate d-block">
                                        {item.nama_kategori}
                                    </small>
                                </div>
                                <div className="text-end">
                                    <div className="total-box text-nowrap">
                                        {item.total_keluar.toLocaleString('id-ID')} Unit
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12">
                        <div className="analysis-card text-center py-5">
                            <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
                            <h6 className="fw-bold text-dark">Belum Ada Data</h6>
                            <p className="text-muted mb-0">Tidak ada riwayat transaksi barang keluar untuk dianalisis.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="tips-box mt-5 shadow-sm">
                <div className="d-flex align-items-center">
                    <div className="icon-tips me-4 d-none d-sm-flex">
                        <i className="fas fa-lightbulb fa-2x"></i>
                    </div>
                    <div>
                        <h5 className="fw-bold mb-2">Rekomendasi Strategis</h5>
                        <p className="mb-0 opacity-75">
                            Barang dengan frekuensi penggunaan tertinggi disarankan untuk memiliki <strong>stok minimum (*buffer stock*) yang lebih besar</strong>. Hal ini bertujuan untuk mencegah kelangkaan mendadak yang berpotensi menghambat kelancaran operasional.
                        </p>
                    </div>
                </div>
            </div>
        </MasterLayout>
    );
};

export default LaporanBarangTerlaris;