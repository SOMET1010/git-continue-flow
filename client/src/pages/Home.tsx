import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Globe, LogIn, Menu } from 'lucide-react';
import { AfricanPattern } from '@/components/ui/african-pattern';
import VoiceHeroButton from '@/components/VoiceHeroButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Animation variants pour effet staggered
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
} as const;

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
} as const;

const heroCardVariants = {
  hidden: { 
    opacity: 0, 
    y: 40,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

const sideCardVariants = {
  hidden: { 
    opacity: 0, 
    x: 30,
    y: 20,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
} as const;

const mascotVariants = {
  hidden: { opacity: 0, scale: 0.8, x: 50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    x: 0,
    transition: {
      type: "spring" as const,
      stiffness: 80,
      damping: 12,
      delay: 0.5,
    },
  },
} as const;

const footerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.8 },
  },
} as const;

/**
 * Page d'accueil PNAVIM-CI - "L'ÂME DU MARCHÉ"
 * Charte graphique: Terre Battue, Glassmorphism, Wax Digital
 * Layout: Hero central avec Tantie Sagesse + cartes secondaires
 */
export default function Home() {
  const [, setLocation] = useLocation();

  const handleRoleSelection = (role: string) => {
    setLocation(`/${role}`);
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-inter">
      {/* Background: Photo marché ivoirien floutée */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/marche-ivoirien.jpg)',
          filter: 'blur(3px) brightness(0.85)',
        }}
      />

      {/* Overlay dégradé orange chaud */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C25E00]/50 via-[#E67E22]/40 to-[#F1C40F]/30" />

      {/* Motif Wax Digital en filigrane */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <AfricanPattern variant="wax" opacity={1} />
      </div>

      {/* Contenu */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ===== HEADER ===== */}
        <motion.header 
          className="w-full py-4 px-4 md:px-8"
          variants={headerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl font-nunito font-extrabold text-[#C25E00]">P</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-nunito font-extrabold text-white text-xl drop-shadow-lg">PNAVIM-CI</h1>
                <p className="text-white/80 text-xs">Plateforme Nationale</p>
              </div>
            </div>

            {/* Navigation desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#about" className="text-white/90 hover:text-white font-medium transition-colors">
                À propos
              </a>
              <a href="#services" className="text-white/90 hover:text-white font-medium transition-colors">
                Services
              </a>
              <a href="#contact" className="text-white/90 hover:text-white font-medium transition-colors">
                Contact
              </a>
            </nav>

            {/* Actions: Langue + Connexion */}
            <div className="flex items-center gap-3">
              {/* Sélecteur de langue */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 hover:text-white gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="hidden sm:inline">FR</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>🇫🇷 Français</DropdownMenuItem>
                  <DropdownMenuItem>🇨🇮 Dioula</DropdownMenuItem>
                  <DropdownMenuItem>🌍 Nouchi</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Bouton Se connecter */}
              <Button
                onClick={() => setLocation('/login')}
                className="bg-[#F1C40F] hover:bg-[#D4AC0D] text-[#2D3436] font-bold shadow-lg"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Se connecter</span>
              </Button>

              {/* Menu mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
          <div className="w-full max-w-6xl">
            {/* Layout: Hero card + Cartes secondaires */}
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              
              {/* ===== CARTE HERO CENTRALE (Marchand) ===== */}
              <motion.div 
                className="lg:col-span-2 relative"
                variants={heroCardVariants}
              >
                <button
                  onClick={() => handleRoleSelection('merchant')}
                  className="w-full text-left group"
                >
                  {/* Carte Glassmorphism */}
                  <div className="relative bg-white/85 backdrop-blur-xl rounded-[2.5rem] border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] transition-all duration-300 overflow-hidden p-8 lg:p-10 min-h-[400px] lg:min-h-[450px]">
                    
                    {/* Motif Wax en arrière-plan de la carte */}
                    <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
                      <AfricanPattern variant="geometric" opacity={1} />
                    </div>

                    {/* Contenu */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Badge */}
                      <div className="inline-flex self-start items-center gap-2 bg-gradient-to-r from-[#F1C40F] to-[#F39C12] text-[#2D3436] px-4 py-2 rounded-full text-sm font-bold shadow-md mb-6">
                        ⭐ Accès principal
                      </div>

                      {/* Titre */}
                      <h2 className="font-nunito font-extrabold text-[#2D3436] text-4xl lg:text-5xl mb-3 leading-tight">
                        Je suis<br />Marchand
                      </h2>

                      {/* Sous-texte */}
                      <p className="text-[#636E72] text-lg lg:text-xl font-medium mb-8">
                        Encaisser, vendre et épargner
                      </p>

                      {/* CTA Vocal */}
                      <div className="mt-auto mb-4">
                        <VoiceHeroButton
                          label="Cliquez pour écouter"
                          size="large"
                        />
                      </div>
                    </div>

                    {/* Mascotte Tantie Sagesse - Débordement à droite */}
                    <motion.div 
                      className="absolute -right-4 lg:-right-8 bottom-0 pointer-events-none"
                      variants={mascotVariants}
                    >
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-[#F1C40F]/30 rounded-full blur-3xl scale-75 translate-y-8" />
                      
                      {/* Label */}
                      <div className="absolute top-4 right-8 lg:right-16 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg z-10 border border-white/50">
                        <p className="text-[#C25E00] text-sm font-bold text-center leading-tight">
                          Tantie<br />Sagesse
                        </p>
                      </div>

                      {/* Avatar 3D */}
                      <img
                        src="/suta-avatar-3d.png"
                        alt="Tantie Sagesse - Votre guide PNAVIM"
                        className="relative w-48 h-48 lg:w-64 lg:h-64 object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
                      />
                    </motion.div>
                  </div>
                </button>
              </motion.div>

              {/* ===== CARTES SECONDAIRES (Droite) ===== */}
              <div className="flex flex-col gap-6">
                
                {/* Carte Agent terrain */}
                <motion.button
                  onClick={() => handleRoleSelection('agent')}
                  className="w-full text-left group"
                  variants={sideCardVariants}
                >
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-[2rem] border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all duration-300 overflow-hidden p-6 min-h-[180px]">
                    
                    {/* Accent couleur vert manioc */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#2E7D32] to-[#4CAF50]" />

                    {/* Motif */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
                      <AfricanPattern variant="wax" opacity={1} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                      {/* Texte */}
                      <div className="flex-1">
                        <h3 className="font-nunito font-bold text-[#2D3436] text-2xl mb-1">
                          Agent terrain
                        </h3>
                        <p className="text-[#636E72] text-base">
                          Accompagner les marchands
                        </p>
                        
                        {/* Mini bouton play */}
                        <div className="mt-4">
                          <VoiceHeroButton
                            label="Écouter"
                            size="default"
                          />
                        </div>
                      </div>

                      {/* Vignette */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-[#2E7D32]/20 rounded-full blur-xl scale-110" />
                        <img
                          src="/pictograms/agent.png"
                          alt="Agent terrain"
                          className="relative w-24 h-24 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Carte Coopérative */}
                <motion.button
                  onClick={() => handleRoleSelection('cooperative')}
                  className="w-full text-left group"
                  variants={sideCardVariants}
                >
                  <div className="relative bg-white/80 backdrop-blur-lg rounded-[2rem] border-2 border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.18)] transition-all duration-300 overflow-hidden p-6 min-h-[180px]">
                    
                    {/* Accent couleur terre profond */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#A04000] to-[#C25E00]" />

                    {/* Motif */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
                      <AfricanPattern variant="kente" opacity={1} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                      {/* Texte */}
                      <div className="flex-1">
                        <h3 className="font-nunito font-bold text-[#2D3436] text-2xl mb-1">
                          Coopérative
                        </h3>
                        <p className="text-[#636E72] text-base">
                          Gérer ensemble
                        </p>
                        
                        {/* Mini bouton play */}
                        <div className="mt-4">
                          <VoiceHeroButton
                            label="Écouter"
                            size="default"
                          />
                        </div>
                      </div>

                      {/* Vignette */}
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-[#C25E00]/20 rounded-full blur-xl scale-110" />
                        <img
                          src="/pictograms/cooperative.png"
                          alt="Coopérative"
                          className="relative w-24 h-24 object-contain drop-shadow-xl group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </motion.button>

              </div>
            </motion.div>
          </div>
        </main>

        {/* ===== FOOTER GLASSMORPHISM ===== */}
        <motion.footer 
          className="py-6 px-4"
          variants={footerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="max-w-7xl mx-auto flex justify-center">
            <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-xl rounded-2xl px-8 py-4 shadow-lg border border-white/50">
              {/* Logo partenaires */}
              <img
                src="/logos/partners.png"
                alt="Partenaires institutionnels"
                className="h-8 object-contain opacity-80"
              />
              <div className="h-8 w-px bg-[#2D3436]/20" />
              <div className="text-center">
                <p className="font-nunito font-bold text-[#2D3436] text-sm">
                  République de Côte d'Ivoire
                </p>
                <p className="text-[#636E72] text-xs">
                  DGE • ANSUT
                </p>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
