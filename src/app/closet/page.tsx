'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Filter,
  SlidersHorizontal,
  Clock,
  Heart,
  CheckCircle2,
  AlertCircle,
  Shirt,
  RotateCcw,
} from 'lucide-react';
import { ClosetItemEntity, ClothingCategory } from '@/types';
import { ClothingCard } from '@/components/closet/ClothingCard';
import { ItemDetailModal } from '@/components/closet/ItemDetailModal';
import { AvailabilityModal } from '@/components/closet/AvailabilityModal';
import { ConfirmDeleteModal } from '@/components/closet/ConfirmDeleteModal';
import { AddItemModal } from '@/components/closet/AddItemModal';
import { useToast } from '@/components/ui/Toast';

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All', value: 'All' },
  { label: 'Tops', value: 'Tops' },
  { label: 'Bottoms', value: 'Bottoms' },
  { label: 'Outerwear', value: 'Outerwear' },
  { label: 'Shoes', value: 'Shoes' },
  { label: 'Accessories', value: 'Accessories' },
  { label: 'Ethnic Wear', value: 'Ethnic Wear' },
  { label: 'Dresses', value: 'Dresses' },
];

function ClosetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { success, error: toastError } = useToast();

  const [items, setItems] = useState<ClosetItemEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [category, setCategory] = useState<string>(searchParams.get('category') || 'All');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [sortOption, setSortOption] = useState('newest');

  // Modals state
  const [selectedItem, setSelectedItem] = useState<ClosetItemEntity | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(searchParams.get('action') === 'new');
  const [editingItem, setEditingItem] = useState<ClosetItemEntity | null>(null);
  const [availabilityItem, setAvailabilityItem] = useState<ClosetItemEntity | null>(null);
  const [deleteItem, setDeleteItem] = useState<ClosetItemEntity | null>(null);

  useEffect(() => {
    fetchItems();
  }, [category, statusFilter, favoriteOnly, sortOption]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (statusFilter && statusFilter !== 'ALL') params.set('status', statusFilter);
      if (favoriteOnly) params.set('favorite', 'true');
      if (sortOption) params.set('sort', sortOption);

      const res = await fetch(`/api/closet?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Failed to load wardrobe items');
    } finally {
      setLoading(false);
    }
  };

  // Filter client-side search query
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q) ||
      item.color.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.brand && item.brand.toLowerCase().includes(q))
    );
  });

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/closet/${id}/favorite`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, isFavorite: data.isFavorite } : item
          )
        );
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem((prev) => (prev ? { ...prev, isFavorite: data.isFavorite } : null));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateAvailability = async (params: {
    status: 'AVAILABLE' | 'TEMPORARILY_UNAVAILABLE';
    reason?: string;
    untilDate?: string;
  }) => {
    if (!availabilityItem) return;

    try {
      const res = await fetch(`/api/closet/${availabilityItem.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (data.success) {
        success(
          params.status === 'AVAILABLE' ? 'Item Available' : 'Marked Unavailable',
          `${availabilityItem.name} availability updated.`
        );
        // Refresh local items
        setItems((prev) =>
          prev.map((i) => (i.id === availabilityItem.id ? data.item : i))
        );
        if (selectedItem && selectedItem.id === availabilityItem.id) {
          setSelectedItem(data.item);
        }
        setAvailabilityItem(null);
      } else {
        toastError('Failed', data.error);
      }
    } catch (err) {
      console.error(err);
      toastError('Error', 'Could not update availability.');
    }
  };

  const handleQuickMakeAvailable = async (id: string) => {
    try {
      const res = await fetch(`/api/closet/${id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'AVAILABLE' }),
      });
      const data = await res.json();
      if (data.success) {
        success('Available Again', 'Item returned to active wardrobe recommendations.');
        setItems((prev) => prev.map((i) => (i.id === id ? data.item : i)));
        if (selectedItem && selectedItem.id === id) {
          setSelectedItem(data.item);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/closet/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Item Removed', 'The item has been removed from your closet.');
        setItems((prev) => prev.filter((i) => i.id !== id));
        if (selectedItem && selectedItem.id === id) {
          setIsDetailOpen(false);
          setSelectedItem(null);
        }
      } else {
        toastError('Failed', data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-[#78716C]">
            Wardrobe Inventory
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#151413]">
            My Closet
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#47583D] hover:bg-[#384630] text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#EAE4D7]">
        {CATEGORIES.map((cat) => {
          const active = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`px-4 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap rounded-t-xl transition-all border-b-2 ${
                active
                  ? 'border-[#47583D] text-[#2A3524] bg-[#FAF8F5]'
                  : 'border-transparent text-[#78716C] hover:text-[#151413] hover:bg-[#F3EFE6]/60'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C8984]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, type, color, brand..."
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FFFFFF] focus:outline-hidden focus:ring-1 focus:ring-[#47583D] shadow-xs"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Availability Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FFFFFF] font-medium text-[#151413] focus:outline-hidden focus:ring-1 focus:ring-[#47583D] shadow-xs"
          >
            <option value="ALL">All Availability</option>
            <option value="AVAILABLE">Available Only</option>
            <option value="TEMPORARILY_UNAVAILABLE">Temporarily Unavailable Only</option>
          </select>

          {/* Sort Selector */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-[#DDD5C7] bg-[#FFFFFF] font-medium text-[#151413] focus:outline-hidden focus:ring-1 focus:ring-[#47583D] shadow-xs"
          >
            <option value="newest">Recently Added</option>
            <option value="mostWorn">Most Frequently Worn</option>
            <option value="name">Alphabetical (A-Z)</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Favorites Filter */}
          <button
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`p-2.5 rounded-xl border text-xs font-semibold transition flex items-center gap-1.5 shadow-xs ${
              favoriteOnly
                ? 'bg-[#FFF2EE] border-[#F5D5C8] text-[#C76A52]'
                : 'bg-[#FFFFFF] border-[#DDD5C7] text-[#686561] hover:bg-[#F3EFE6]'
            }`}
            title="Filter Favorites"
          >
            <Heart className={`w-4 h-4 ${favoriteOnly ? 'fill-[#C76A52]' : ''}`} />
            <span className="hidden sm:inline">Favorites</span>
          </button>
        </div>
      </div>

      {/* Items count feedback */}
      <div className="flex items-center justify-between text-xs text-[#78716C] px-1">
        <span>
          Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </span>
        {statusFilter === 'TEMPORARILY_UNAVAILABLE' && (
          <span className="text-[#A9523C] font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Filtered to items in laundry, repair, or storage
          </span>
        )}
      </div>

      {/* Grid of Clothing Items */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-2xl bg-[#F0EBE1] animate-pulse border border-[#EAE4D7]"
            />
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item) => (
            <ClothingCard
              key={item.id}
              item={item}
              onSelect={(it) => {
                setSelectedItem(it);
                setIsDetailOpen(true);
              }}
              onToggleFavorite={handleToggleFavorite}
              onToggleAvailability={(it, e) => {
                e.stopPropagation();
                setAvailabilityItem(it);
              }}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-[#FFFFFF] border border-[#EAE4D7] space-y-4 max-w-md mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#EAE4D7] flex items-center justify-center mx-auto text-[#8C8984]">
            <Shirt className="w-8 h-8 opacity-60" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-[#151413]">Your closet is empty.</h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Add your first clothing item and start building your digital wardrobe.
            </p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsAddOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#47583D] hover:bg-[#384630] text-white text-xs font-semibold transition shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add First Item</span>
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onToggleFavorite={handleToggleFavorite}
        onOpenAvailabilityManager={(it) => setAvailabilityItem(it)}
        onOpenDeleteConfirm={(it) => setDeleteItem(it)}
        onOpenEdit={(it) => {
          setIsDetailOpen(false);
          setEditingItem(it);
          setIsAddOpen(true);
        }}
        onQuickMakeAvailable={handleQuickMakeAvailable}
      />

      {/* Add / Edit Item Modal */}
      <AddItemModal
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          setEditingItem(null);
        }}
        initialItem={editingItem}
        onItemSaved={(savedItem) => {
          fetchItems();
        }}
      />

      {/* Availability Manager Modal */}
      {availabilityItem && (
        <AvailabilityModal
          item={availabilityItem}
          isOpen={Boolean(availabilityItem)}
          onClose={() => setAvailabilityItem(null)}
          onUpdateAvailability={handleUpdateAvailability}
        />
      )}

      {/* Confirmation of Permanent Deletion Modal */}
      <ConfirmDeleteModal
        item={deleteItem}
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirmDelete={handleConfirmDelete}
        onSwitchToUnavailable={(it) => {
          setAvailabilityItem(it);
        }}
      />
    </div>
  );
}

export default function ClosetPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#78716C]">Loading Closet...</div>}>
      <ClosetContent />
    </Suspense>
  );
}
