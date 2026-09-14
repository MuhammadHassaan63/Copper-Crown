import { useEffect, useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/ProductCard';
import { Input, Select } from '@/components/ui/Form';
import { EmptyState } from '@/components/ui/Loading';
import { Package } from 'lucide-react';
import type { Product } from '@/types/database';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
      } else {
        setProducts((data as Product[]) || []);
      }
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ['all', ...Array.from(cats).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    let result = products;
    if (category !== 'all') {
      result = result.filter((p) => p.category === category);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price-low':
        result = [...result].sort((a, b) => a.price_cents - b.price_cents);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.price_cents - a.price_cents);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result = [...result].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
    return result;
  }, [products, category, search, sortBy]);

  return (
    <div className="animate-fade-in">
      <div className="bg-crown-900 text-white py-12">
        <div className="container-max px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold">Products</h1>
          <p className="mt-2 text-crown-400">
            Quality electrical products for every project — from wiring to smart panels.
          </p>
        </div>
      </div>

      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="card p-5 sticky top-24">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-semibold text-crown-900">Filters</h3>
                <button onClick={() => setShowFilters(false)}>
                  <X className="w-5 h-5 text-crown-400" />
                </button>
              </div>

              <h3 className="font-semibold text-crown-900 mb-3 hidden lg:block">Categories</h3>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      category === cat
                        ? 'bg-copper-50 text-copper-700'
                        : 'text-crown-600 hover:bg-crown-50'
                    }`}
                  >
                    {cat === 'all' ? 'All Categories' : cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-crown-400" />
                <input
                  className="input-field pl-10"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sm:w-48"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </Select>
              <button
                onClick={() => setShowFilters(true)}
                className="btn-secondary lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            <p className="text-sm text-crown-400 mb-4">
              {loading ? 'Loading...' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`}
            </p>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="card aspect-[3/4] animate-pulse bg-crown-100" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={<Package className="w-12 h-12" />}
                title="No products found"
                description="Try adjusting your search or filters."
              />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
