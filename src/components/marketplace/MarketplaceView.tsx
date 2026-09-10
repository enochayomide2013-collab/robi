import React, { useState } from 'react';
import { ShoppingBag, Coins, Sparkles, Filter, Check, ShieldCheck, Search } from 'lucide-react';
import { ItemCosmetic, UserProfile } from '../../types';

interface MarketplaceViewProps {
  user: UserProfile;
  items: ItemCosmetic[];
  onPurchaseItem: (item: ItemCosmetic) => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  user,
  items,
  onPurchaseItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingId, setPurchasingId] = useState<string | null>(null);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleBuy = async (item: ItemCosmetic) => {
    setPurchasingId(item.id);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/marketplace/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          itemId: item.id,
          price: item.price,
          transactionId: `tx_${user.id}_${item.id}_${Date.now()}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPurchasedIds((prev) => [...prev, item.id]);
        onPurchaseItem(item);
      } else {
        setErrorMsg(data.error || 'Failed to complete transaction.');
      }
    } catch {
      setErrorMsg('Network error during purchase transaction.');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-amber-500/10 via-slate-900 to-indigo-500/10 border border-amber-500/30 rounded-3xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
              Creator Economy
            </span>
            <span className="text-xs text-amber-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              Idempotent Secure Transactions
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">Cosmetics & Avatar Marketplace</h1>
          <p className="text-xs text-slate-300">Discover limited-edition hats, wings, visors, and clothing created by the community</p>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-2xl px-4 py-2.5 text-amber-300 font-black text-sm">
          <Coins className="w-5 h-5 text-amber-400" />
          <span>Your Balance: {(user?.coins ?? 0).toLocaleString()} A-Coins</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 font-bold">
          {errorMsg}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-3">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'hat', 'back', 'clothing', 'glasses'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer whitespace-nowrap ${
                selectedCategory === cat ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search cosmetics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.map((item) => {
          const isOwned = (user?.inventory || []).some((i) => i.id === item.id) || purchasedIds.includes(item.id);
          const canAfford = (user?.coins ?? 0) >= item.price;

          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex flex-col justify-between shadow-lg transition-all space-y-3"
            >
              <div className="relative aspect-square rounded-xl bg-slate-950 flex items-center justify-center text-4xl shadow-inner">
                {item.imageUrl}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-[9px] font-extrabold uppercase text-amber-400">
                  {item.rarity}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-xs text-white line-clamp-1">{item.name}</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 truncate">By {item.creatorName}</p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-black text-amber-400">
                  <Coins className="w-3.5 h-3.5" />
                  <span>{item.price}</span>
                </div>

                {isOwned ? (
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Owned
                  </span>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={purchasingId === item.id || !canAfford}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs cursor-pointer shadow-md transition-all"
                  >
                    {purchasingId === item.id ? 'Buying...' : 'Buy Item'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
