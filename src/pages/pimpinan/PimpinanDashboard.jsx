import React, { useState, useEffect } from "react";
import MasterLayout from "../../layouts/MasterLayout";
import "./DashboardPimpinan.css";

// Import komponen Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from "chart.js";
import { Line } from "react-chartjs-2";

// Daftarkan elemen Chart
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PimpinanDashboard = () => {
  const [stats, setStats] = useState({
    totalAset: 0,
    totalBarang: 0,
    transaksiHariIni: 0,
    totalKritis: 0,
  });

  const [kritisList, setKritisList] = useState([]);

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  });

  // Ambil data dari API
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };

    try {
      const [resBarang, resTrans] = await Promise.all([fetch("http://127.0.0.1:8000/api/barang", { headers }), fetch("http://127.0.0.1:8000/api/transaksi", { headers })]);

      const dataBarang = await resBarang.json();
      const dataTrans = await resTrans.json();

      const arrayBarang = dataBarang.data || [];
      const arrayTrans = dataTrans.data || [];

      /* =========================
               1. KALKULASI KARTU STATISTIK
            ========================= */
      const totalBarang = arrayBarang.length;

      // Hitung Total Aset (stok * harga_beli)
      const totalAset = arrayBarang.reduce((sum, item) => sum + parseInt(item.stok) * parseFloat(item.harga_beli || 0), 0);

      // Barang Kritis (Stok <= 5)
      const listKritis = arrayBarang.filter((item) => parseInt(item.stok) <= 5).sort((a, b) => a.stok - b.stok);
      const totalKritis = listKritis.length;

      // Transaksi Hari Ini
      const todayStr = new Date().toISOString().split("T")[0];
      const transaksiHariIni = arrayTrans.filter((t) => t.tanggal_transaksi.startsWith(todayStr)).length;

      setStats({ totalAset, totalBarang, transaksiHariIni, totalKritis });
      setKritisList(listKritis.slice(0, 5)); // Ambil 5 teratas untuk list

      /* =========================
               2. KALKULASI GRAFIK 7 HARI
            ========================= */
      const labels = [];
      const dataMasuk = [];
      const dataKeluar = [];

      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateFilter = d.toISOString().split("T")[0];

        // Format tanggal untuk label (contoh: "18 Jun")
        labels.push(d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }));

        let sumMasuk = 0;
        let sumKeluar = 0;

        arrayTrans.forEach((t) => {
          if (t.tanggal_transaksi.startsWith(dateFilter)) {
            if (t.jenis_transaksi === "masuk") sumMasuk += parseInt(t.jumlah) || 0;
            if (t.jenis_transaksi === "keluar") sumKeluar += parseInt(t.jumlah) || 0;
          }
        });

        dataMasuk.push(sumMasuk);
        dataKeluar.push(sumKeluar);
      }

      setChartData({
        labels,
        datasets: [
          {
            label: "Barang Masuk",
            data: dataMasuk,
            borderColor: "#2563eb",
            backgroundColor: "rgba(37,99,235,0.1)",
            fill: true,
            tension: 0.4,
          },
          {
            label: "Barang Keluar",
            data: dataKeluar,
            borderColor: "#dc2626",
            backgroundColor: "rgba(220,38,38,0.1)",
            fill: true,
            tension: 0.4,
          },
        ],
      });
    } catch (error) {
      console.error("Gagal memuat data dashboard pimpinan:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <MasterLayout>
      <div className="pimpinan-dashboard">
        {/* HEADER */}
        <div className="page-header">
          <h3>Dashboard Analitik</h3>
          <p className="mb-0 opacity-75">Monitoring realtime inventori</p>
        </div>

        {/* CARD STATS */}
        <div className="row g-4">
          {/* TOTAL ASET */}
          <div className="col-md-6 col-xl-3">
            <div className="dashboard-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted fw-semibold">TOTAL ASET</small>
                  <div className="card-value text-primary">Rp {stats.totalAset.toLocaleString("id-ID")}</div>
                </div>
              </div>
            </div>
          </div>

          {/* TOTAL BARANG */}
          <div className="col-md-6 col-xl-3">
            <div className="dashboard-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted fw-semibold">TOTAL BARANG</small>
                  <div className="card-value text-success">{stats.totalBarang.toLocaleString("id-ID")}</div>
                </div>
                <div className="card-icon bg-success-soft">
                  <i className="fas fa-box"></i>
                </div>
              </div>
            </div>
          </div>

          {/* TRANSAKSI */}
          <div className="col-md-6 col-xl-3">
            <div className="dashboard-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted fw-semibold">TRANSAKSI HARI INI</small>
                  <div className="card-value text-warning">{stats.transaksiHariIni.toLocaleString("id-ID")}</div>
                </div>
                <div className="card-icon bg-warning-soft">
                  <i className="fas fa-chart-line"></i>
                </div>
              </div>
            </div>
          </div>

          {/* KRITIS */}
          <div className="col-md-6 col-xl-3">
            <div className="dashboard-card">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted fw-semibold">STOK KRITIS</small>
                  <div className="card-value text-danger">{stats.totalKritis.toLocaleString("id-ID")}</div>
                </div>
                <div className="card-icon bg-danger-soft">
                  <i className="fas fa-triangle-exclamation"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STOK KRITIS LIST */}
        <div className="chart-card">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold mb-1">Barang Stok Kritis</h5>
              <small className="text-muted">Barang dengan stok kurang dari atau sama dengan 5</small>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-3">
            {kritisList.length > 0 ? (
              kritisList.map((item) => (
                <span key={item.id_barang} className="badge-kritis">
                  {item.nama_barang} ({item.stok})
                </span>
              ))
            ) : (
              <div className="text-muted">Tidak ada stok kritis 🎉</div>
            )}
          </div>
        </div>

        {/* CHART BAR */}
        <div className="chart-card">
          <div className="mb-4">
            <h5 className="fw-bold mb-1">Tren Transaksi</h5>
            <small className="text-muted">Grafik transaksi 7 hari terakhir</small>
          </div>

          <div style={{ height: "300px" }}>
            {chartData.labels.length > 0 && (
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default PimpinanDashboard;
