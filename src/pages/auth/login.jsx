import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './Login.css'; // Memanggil file CSS

const Login = () => {
    // 1. Inisialisasi State (Hanya username dan password)
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 2. Fungsi yang dijalankan saat tombol Submit ditekan
    const handleLogin = async (e) => {
        e.preventDefault(); // Mencegah form me-refresh halaman
        setIsLoading(true);

        try {
            // Mengirim data ke API Backend
            const response = await fetch('http://127.0.0.1:8000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    username: username, 
                    password: password 
                })
            });

            const res = await response.json();

            // 3. Logika utama: Menggunakan response.ok agar sinkron dengan backend
            if (response.ok) {
                
                // MENGAMBIL DAN MEMBERSIHKAN ROLE DARI BACKEND (Jurus Sapu Jagat)
                const rawRole = res.role || (res.user && res.user.role) || '';
                const userRole = String(rawRole).toLowerCase().trim();
                
                // Mengambil nama user
                const userName = res.nama_lengkap || (res.user && res.user.nama_lengkap) || 'Pengguna';

                // --- PENAMBAHAN LOCAL STORAGE ---
                localStorage.setItem('userRole', userRole);
                localStorage.setItem('userName', userName);
                // --------------------------------

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil Masuk!',
                    text: res.message || `Selamat datang, ${userName}`,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    // Redirect berdasarkan role yang sudah dibersihkan
                    if (userRole === 'admin') {
                        window.location.href = '/admin/dashboard';
                    } else if (userRole === 'kepala sekolah' || userRole === 'pimpinan') {
                        window.location.href = '/pimpinan/dashboard';
                    } else {
                        window.location.href = '/petugas/dashboard';
                    }
                });
            } else {
                // Logika jika password salah / username tidak ditemukan
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: res.message || 'Username atau password yang Anda masukkan salah!',
                    confirmButtonColor: '#6366f1'
                });
            }
        } catch (error) {
            // Logika jika server error / mati / terblokir CORS
            Swal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: 'Tidak dapat terhubung ke server backend.',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setIsLoading(false); // Mengembalikan tombol ke keadaan semula
        }
    };

    return (
        <div className="login-card">
            <div className="text-center">
                <div className="brand-icon shadow-lg">
                    <i className="fas fa-box-open"></i>
                </div>
                <h4 className="fw-bold mb-1 text-dark">INVEERA</h4>
                <p className="text-muted small mb-4">Sistem Inventaris Modern Era</p>
            </div>

            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Username</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Masukkan username" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required 
                    />
                </div>

                <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary">Password</label>
                    <input 
                        type="password" 
                        className="form-control" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                    />
                </div>

                <button type="submit" className="btn btn-login" disabled={isLoading}>
                    {isLoading ? (
                        <>Memproses... <i className="fas fa-spinner fa-spin ms-2"></i></>
                    ) : (
                        <>Masuk ke Sistem <i className="fas fa-sign-in-alt ms-2"></i></>
                    )}
                </button>
            </form>

            <div className="register-link">
                Belum punya akses? <br />
                <span className="text-muted small">Hubungi <b>Administrator TI</b> untuk mendaftarkan akun.</span>
            </div>
        </div>
    );
};

export default Login;