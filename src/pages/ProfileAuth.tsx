import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, LayoutDashboard, Compass, LogOut, Camera, Trash2, Edit3, Save, X } from 'lucide-react';
import styles from './ProfileAuth.module.css';
import { loginUser, registerUser, getApiBaseUrl, updateProfile, getStats, deleteAccount } from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { uploadAvatar } from '../lib/upload';

export function ProfileAuth() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // User Update State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{ total: number; tagsCount: Record<string, number> } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const navigate = useNavigate();
    const { user, login, logout, updateAvatar } = useAuth();

    useEffect(() => {
        if (user) {
            setEditName(user.name);
            getStats().then(setStats).catch(console.error);
        }
    }, [user]);
    
    const toggleAuthMode = () => setIsLogin(!isLogin);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        try {
            setUploadingAvatar(true);
            setError(null);
            const { avatarUrl } = await uploadAvatar(file);
            updateAvatar(avatarUrl);
        } catch (err) {
            setError("Erro ao salvar foto no backend.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setLoading(true);
            const updatedUser = await updateProfile({ name: editName });
            login(localStorage.getItem('voyagemind_token') || '', updatedUser);
            setIsEditing(false);
        } catch (err) {
            setError("Erro ao atualizar perfil.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus passaportes serão perdidos.")) {
            try {
                setLoading(true);
                await deleteAccount();
                logout();
                navigate('/');
            } catch (err) {
                setError("Erro ao excluir conta.");
            } finally {
                setLoading(false);
            }
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!email || !password || (!isLogin && !name)) {
            setError('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            setLoading(true);

            if (!isLogin) {
                await registerUser({ name, email, password });
            }

            const result = await loginUser({ email, password });
            login(result.token, { id: result.user.id, name: result.user.name, email: result.user.email, avatarUrl: result.user.avatarUrl });

            navigate('/passport');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Erro ao autenticar. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    }

    if (user) {
        return (
            <main className={styles.container} aria-label="Dashboard do Perfil">
                <div className={styles.backgroundElement} aria-hidden="true" />
                <div className={styles.authWrapper} style={{ justifyContent: 'center' }}>
                    <motion.article
                        className={`glass-panel ${styles.authCard}`}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ maxWidth: '600px', width: '100%' }}
                    >
                        <header className={styles.cardHeader}>
                            <h2 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                <LayoutDashboard size={28} aria-hidden="true" /> Dashboard do Explorador
                            </h2>
                            <p className={styles.subtitle}>Bem-vindo de volta!</p>
                        </header>
                        <section style={{ padding: 'var(--spacing-lg) 0', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }} aria-label="Informações do Usuário">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                    {user.avatarUrl ? (
                                        <img src={`${getApiBaseUrl()}${user.avatarUrl}`} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <User size={40} color="#aaa" aria-hidden="true" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                                    )}
                                    {uploadingAvatar && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{fontSize:'12px'}}>...</span></div>}
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', paddingBottom: '8px' }}>Foto de Perfil</h3>
                                    <button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className={styles.changePhotoBtn}
                                        disabled={uploadingAvatar}
                                        aria-label="Alterar foto de perfil"
                                    >
                                        <Camera size={16} aria-hidden="true" /> Alterar Foto
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" aria-hidden="true" tabIndex="-1" />
                                </div>
                            </div>

                            {error && <p className={styles.errorMessage} style={{ margin: 0 }} role="alert">{error}</p>}

                            <div className={styles.inputGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label>Seu Nome</label>
                                    {!isEditing ? (
                                        <button onClick={() => setIsEditing(true)} aria-label="Editar Nome" style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Edit3 size={14} /> Editar
                                        </button>
                                    ) : (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={handleUpdateProfile} disabled={loading} aria-label="Salvar Nome" style={{ background: 'transparent', border: 'none', color: '#4caf50', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Save size={14} /> Salvar
                                            </button>
                                            <button onClick={() => { setIsEditing(false); setEditName(user.name); }} aria-label="Cancelar Edição" style={{ background: 'transparent', border: 'none', color: 'var(--color-coral)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <X size={14} /> Cancelar
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.inputWrapper}>
                                    <User size={18} className={styles.inputIcon} aria-hidden="true" />
                                    <input type="text" readOnly={!isEditing} value={isEditing ? editName : user.name} onChange={(e) => setEditName(e.target.value)} style={{ opacity: isEditing ? 1 : 0.7 }} aria-label="Seu Nome" />
                                </div>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Email da Conta</label>
                                <div className={styles.inputWrapper}>
                                    <Mail size={18} className={styles.inputIcon} aria-hidden="true" />
                                    <input type="text" readOnly value={user.email} style={{ opacity: 0.7 }} aria-label="Seu Email" />
                                </div>
                            </div>

                            {stats && (
                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', marginTop: '16px' }}>
                                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>Estatísticas</h3>
                                    <p style={{ margin: '0 0 8px 0' }}><strong>Passaportes Criados:</strong> {stats.total}</p>
                                    <p style={{ margin: '0 0 4px 0' }}><strong>Tags Favoritas:</strong></p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {Object.entries(stats.tagsCount).map(([tag, count]) => (
                                            <span key={tag} style={{ background: 'var(--color-primary)', padding: '4px 8px', borderRadius: '8px', fontSize: '0.85rem' }}>
                                                {tag} ({count})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </section>
                        <footer className={styles.dashboardActions}>
                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={() => navigate('/passport')}
                                style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
                                aria-label="Acessar meu passaporte"
                            >
                                <Compass size={18} aria-hidden="true" /> <span>Meu Passaporte</span>
                            </button>
                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={handleDeleteAccount}
                                disabled={loading}
                                style={{
                                    background: 'rgba(255, 0, 0, 0.1)',
                                    color: '#ff4d4d',
                                    border: '1px solid rgba(255,0,0,0.2)'
                                }}
                                aria-label="Excluir Conta"
                            >
                                <Trash2 size={18} aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={() => { logout(); navigate('/'); }}
                                style={{
                                    flex: 1,
                                    background: 'rgba(255, 99, 71, 0.1)',
                                    color: 'var(--color-coral)',
                                    border: '1px solid rgba(255,99,71,0.2)'
                                }}
                                aria-label="Sair da Conta"
                            >
                                <LogOut size={18} aria-hidden="true" /> <span>Sair da Conta</span>
                            </button>
                        </footer>
                    </motion.article>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.container} aria-label="Página de Autenticação">
            <div className={styles.backgroundElement} aria-hidden="true" />

            <div className={styles.authWrapper}>
                <motion.section
                    className={`glass-panel ${styles.authCard}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <header className={styles.cardHeader}>
                        <motion.h1
                            key={isLogin ? 'login' : 'register'}
                            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                            className="text-gradient"
                        >
                            {isLogin ? 'Bem-vindo de volta' : 'Crie seu Passaporte'}
                        </motion.h1>
                        <p className={styles.subtitle}>
                            {isLogin
                                ? 'Continue sua jornada com o VoyageMind.'
                                : 'Junte-se a nós e desbloqueie o mundo.'}
                        </p>
                    </header>

                    <form className={styles.authForm} onSubmit={handleSubmit} aria-label={isLogin ? 'Formulário de Login' : 'Formulário de Cadastro'}>
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    key="name-input"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={styles.inputGroup}
                                >
                                    <label htmlFor="name">Como prefere ser chamado?</label>
                                    <div className={styles.inputWrapper}>
                                        <User size={18} className={styles.inputIcon} aria-hidden="true" />
                                        <input
                                            type="text"
                                            id="name"
                                            placeholder="Seu nome"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            aria-required="true"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className={styles.inputGroup}>
                            <label htmlFor="email">Email</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} className={styles.inputIcon} aria-hidden="true" />
                                <input
                                    type="email"
                                    id="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    aria-required="true"
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password">Senha</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} aria-hidden="true" />
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    aria-required="true"
                                />
                            </div>
                        </div>

                        {isLogin && (
                            <a href="#" className={styles.forgotPassword}>
                                Esqueceu a senha?
                            </a>
                        )}

                        {error && (
                            <p className={styles.errorMessage} role="alert">
                                {error}
                            </p>
                        )}

                        <button type="submit" className={styles.submitButton} disabled={loading} aria-label={isLogin ? 'Entrar' : 'Cadastrar'}>
                            <span>{loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Começar Aventura'}</span>
                            <ArrowRight size={18} aria-hidden="true" />
                        </button>
                    </form>

                    <footer className={styles.cardFooter}>
                        <p>
                            {isLogin ? 'Ainda não tem um passaporte?' : 'Já é um explorador?'}
                            <button type="button" onClick={toggleAuthMode} className={styles.toggleButton} aria-label={isLogin ? 'Alternar para Cadastro' : 'Alternar para Login'}>
                                {isLogin ? 'Cadastre-se' : 'Entrar'}
                            </button>
                        </p>
                    </footer>
                </motion.section>

                <aside className={styles.promoSide} aria-label="Promoção das Features">
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className={styles.promoContent}
                    >
                        <h2>Viaje Diferente.</h2>
                        <ul>
                            <li>
                                <div className={styles.promoIcon} aria-hidden="true">✨</div>
                                <div>
                                    <h3>Inteligência Invisível</h3>
                                    <p>Descubra rotas personalizadas sem precisar buscar.</p>
                                </div>
                            </li>
                            <li>
                                <div className={styles.promoIcon} aria-hidden="true">🏆</div>
                                <div>
                                    <h3>Passaporte XP</h3>
                                    <p>Colecione carimbos digitais imersivos em suas viagens.</p>
                                </div>
                            </li>
                        </ul>
                    </motion.div>
                </aside>
            </div>
        </main>
    );
}
