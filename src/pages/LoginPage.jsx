import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { loadUserData } from '../hooks/useSupabaseSync.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isLogin = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data.user) {
          await loadUserData(data.user.id)
          navigate('/app')
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Compte créé ! Vérifie ton email pour confirmer ton inscription.')
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setLoading(false)
    }
  }

  function translateError(msg) {
    if (msg.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.'
    if (msg.includes('Email not confirmed')) return 'Confirme ton email avant de te connecter.'
    if (msg.includes('User already registered')) return 'Un compte existe déjà avec cet email.'
    if (msg.includes('Password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.'
    return msg
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#FF7A00]/6 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back to landing */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[#757575] hover:text-[#1A1A1A] text-sm mb-8 transition-colors"
        >
          <ChevronLeft size={16} />
          Retour
        </button>

        <div className="bg-white border border-[#EBEBEB] rounded-3xl p-8 shadow-sm">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#FF7A00] flex items-center justify-center text-base">
              🥗
            </div>
            <span className="text-[#1A1A1A] font-bold text-lg tracking-tight">NutriCalc</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] mb-1">
            {isLogin ? 'Bienvenue' : 'Créer un compte'}
          </h1>
          <p className="text-[#757575] text-sm mb-8">
            {isLogin
              ? 'Connecte-toi pour accéder à tes données'
              : 'Tes données seront sauvegardées automatiquement'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse email"
                required
                className="w-full bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A1A] placeholder-[#BDBDBD] rounded-xl pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#FF7A00]/60 focus:bg-white transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#BDBDBD]" />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                minLength={6}
                className="w-full bg-[#F5F5F5] border border-[#E0E0E0] text-[#1A1A1A] placeholder-[#BDBDBD] rounded-xl pl-11 pr-11 py-3.5 text-sm outline-none focus:border-[#FF7A00]/60 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#BDBDBD] hover:text-white/60 transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Error / Success */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3"
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-[#FF7A00] hover:bg-[#e56e00] disabled:opacity-50 text-white font-bold text-sm py-3.5 rounded-xl transition-colors shadow-[0_0_30px_rgba(255,122,0,0.3)]"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Se connecter' : 'Créer mon compte'}
                  <ArrowRight size={16} />
                </>
              )}
            </motion.button>
          </form>

          {/* Toggle mode */}
          <p className="text-center text-[#BDBDBD] text-xs mt-6">
            {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
            <button
              onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError(''); setSuccess('') }}
              className="text-[#FF7A00] hover:text-[#ff9640] font-medium transition-colors"
            >
              {isLogin ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
