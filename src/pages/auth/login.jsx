import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setIsLoading(true);

        try {
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
            
            // Console log ini akan membantu Anda melihat struktur data asli dari Laravel
            console.log("Response dari Backend API:", res); 

            if (response.ok) {
                // Ekstraksi data role dan nama dari response backend
                const rawRole = res.role || (res.user && res.user.role) || '';
                const userRole = String(rawRole).toLowerCase().trim();
                const userName = res.nama_lengkap || (res.user && res.user.nama_lengkap) || (res.user && res.user.name) || 'Pengguna';
                
                // EKSTRAKSI ID USER: Mengecek berbagai kemungkinan struktur JSON dari API
                const userId = res.id_user || 
                               res.id || 
                               (res.user && (res.user.id_user || res.user.id)) || 
                               (res.data && res.data.user && (res.data.user.id_user || res.data.user.id));

                // VALIDASI PENTING: Cegah masuk aplikasi jika ID User tidak terbaca
                if (!userId) {
                    console.error("Gagal mendapatkan ID User. Struktur JSON:", res);
                    Swal.fire({
                        icon: 'error',
                        title: 'Format Data Salah',
                        text: 'Sistem tidak dapat membaca ID User dari server. Hubungi Admin/Programmer.',
                        confirmButtonColor: '#6366f1'
                    });
                    setIsLoading(false);
                    return; // Hentikan proses login sampai sini
                }

                // Simpan Token
                const apiToken = res.access_token || res.token || (res.data && res.data.token) || (res.data && res.data.access_token);
                if (apiToken) {
                    localStorage.setItem('token', apiToken);
                }
                
                // Simpan data user ke localStorage (pasti aman karena lolos if di atas)
                localStorage.setItem('userRole', userRole);
                localStorage.setItem('userName', userName);
                localStorage.setItem('id_user', userId);

                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil Masuk!',
                    text: res.message || `Selamat datang, ${userName}`,
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    // Navigasi setelah login sukses berdasarkan role
                    if (userRole === 'admin') {
                        navigate('/admin/dashboard');
                    } else if (userRole === 'pimpinan') {
                        navigate('/pimpinan/dashboard');
                    } else {
                        navigate('/petugas/dashboard');
                    }
                });
                
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: res.message || 'Username atau password salah!',
                    confirmButtonColor: '#6366f1'
                });
            }
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: 'Tidak dapat terhubung ke server backend.',
                confirmButtonColor: '#6366f1'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
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
        </div>
    );
};

export default Login;