import { useLocation } from 'wouter';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { 
  ShoppingCart, 
  Package, 
  Wallet,
  TrendingUp,
  AlertTriangle,
  PiggyBank,
  History,
  LogOut,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Dashboard marchand simplifié - Version Supabase directe
 * Sans dépendance au serveur Express/tRPC
 */
export default function MerchantDashboardSimple() {
  const [, setLocation] = useLocation();
  const { user, loading, signOut, isAuthenticated } = useSupabaseAuth();

  // Rediriger vers la page d'auth si non connecté
  if (!loading && !isAuthenticated) {
    setLocation('/auth');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Marchand';

  const handleLogout = async () => {
    await signOut();
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-primary">P</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">PNAVIM</h1>
              <p className="text-xs text-gray-500">Plateforme Nationale</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation('/settings')}
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Message de bienvenue */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bonjour {String(userName)} ! 👋
          </h1>
          <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Aujourd'hui
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500">FCFA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Mon Bédou
              </CardTitle>
              <Wallet className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500">FCFA</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Alertes Stock
              </CardTitle>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
              <p className="text-sm text-gray-500">Produits bas</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions principales */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* VENDRE */}
          <button
            onClick={() => setLocation('/merchant/cash-register')}
            className="bg-white border-2 border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-orange-50 p-4 rounded-full group-hover:bg-orange-100 transition-colors">
                <ShoppingCart className="w-12 h-12 text-orange-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">VENDRE</h3>
                <p className="text-sm text-gray-600">Faire mon Djossi</p>
              </div>
            </div>
          </button>

          {/* STOCK */}
          <button
            onClick={() => setLocation('/merchant/stock')}
            className="bg-white border-2 border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-green-50 p-4 rounded-full group-hover:bg-green-100 transition-colors">
                <Package className="w-12 h-12 text-green-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">STOCK</h3>
                <p className="text-sm text-gray-600">Mes produits</p>
              </div>
            </div>
          </button>

          {/* WALLET */}
          <button
            onClick={() => setLocation('/merchant/wallet')}
            className="bg-white border-2 border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-blue-50 p-4 rounded-full group-hover:bg-blue-100 transition-colors">
                <Wallet className="w-12 h-12 text-blue-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">PORTEFEUILLE</h3>
                <p className="text-sm text-gray-600">Mon Bédou</p>
              </div>
            </div>
          </button>

          {/* HISTORIQUE */}
          <button
            onClick={() => setLocation('/merchant/history')}
            className="bg-white border-2 border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-purple-50 p-4 rounded-full group-hover:bg-purple-100 transition-colors">
                <History className="w-12 h-12 text-purple-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">HISTORIQUE</h3>
                <p className="text-sm text-gray-600">Mes ventes</p>
              </div>
            </div>
          </button>

          {/* ÉPARGNE */}
          <button
            onClick={() => setLocation('/merchant/savings')}
            className="bg-white border-2 border-pink-200 rounded-2xl p-6 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-pink-50 p-4 rounded-full group-hover:bg-pink-100 transition-colors">
                <PiggyBank className="w-12 h-12 text-pink-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900">ÉPARGNE</h3>
                <p className="text-sm text-gray-600">Mes cagnottes</p>
              </div>
            </div>
          </button>
        </div>

        {/* Info panel */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Bienvenue sur PNAVIM !</strong> Cette version simplifiée vous permet de 
              gérer vos ventes, stock et épargne. Plus de fonctionnalités arrivent bientôt !
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
