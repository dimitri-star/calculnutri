import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calculator, CalendarDays, Bot, ArrowRight, Zap } from 'lucide-react'

const features = [
  {
    icon: <Calculator size={22} />,
    title: 'Calcul précis',
    desc: 'Calories, macros et TDEE personnalisés selon ton profil, activité et objectifs.',
  },
  {
    icon: <CalendarDays size={22} />,
    title: 'Plan 7 jours',
    desc: 'Génère un plan alimentaire hebdomadaire complet, adapté à tes goûts et budget.',
  },
  {
    icon: <Bot size={22} />,
    title: 'Coach IA',
    desc: 'Un expert nutrition disponible 24h/24 pour répondre à toutes tes questions.',
  },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans overflow-hidden">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-[#FF7A00]/8 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-[#FF7A00]/5 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 md:px-12 py-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF7A00] flex items-center justify-center text-sm">
              🥗
            </div>
            <span className="font-bold text-lg tracking-tight">NutriCalc</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-[#757575] hover:text-[#1A1A1A] transition-colors"
          >
            Se connecter
          </button>
        </nav>

        {/* Hero */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/25 text-[#FF7A00] text-xs font-medium mb-8">
              <Zap size={12} />
              Nutrition intelligente, résultats réels
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6 text-[#1A1A1A]">
              Ton plan nutrition
              <br />
              <span className="text-[#FF7A00]">sur-mesure</span>
            </h1>

            <p className="text-[#757575] text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
              Calcule tes besoins caloriques, génère un plan 7 jours et accède à un
              coach IA expert — tout sauvegardé dans ton compte.
            </p>

            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 bg-[#FF7A00] hover:bg-[#e56e00] text-white font-bold text-base px-8 py-4 rounded-2xl shadow-[0_0_40px_rgba(255,122,0,0.4)] transition-colors"
            >
              Accéder à l'application
              <ArrowRight size={18} />
            </motion.button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full mt-20"
          >
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white border border-[#EBEBEB] rounded-2xl p-6 text-left hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FF7A00]/15 text-[#FF7A00] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-sm mb-2 text-[#1A1A1A]">{f.title}</h3>
                <p className="text-[#757575] text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-[#BDBDBD] text-xs">
          © 2025 NutriCalc — Tous droits réservés
        </footer>
      </div>
    </div>
  )
}
