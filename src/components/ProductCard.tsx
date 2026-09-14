import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from '@/context/RouterContext';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import type { Product } from '@/types/database';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const onSale = product.compare_at_cents && product.compare_at_cents > product.price_cents;
  const outOfStock = product.stock <= 0;

  return (
    <div className="card card-hover group flex flex-col overflow-hidden">
      <Link to={`/products/${product.slug}`} className="relative block aspect-square overflow-hidden bg-crown-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-crown-300">
            <Eye className="w-12 h-12" />
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {onSale && <Badge variant="copper">Sale</Badge>}
          {product.is_featured && <Badge variant="neutral">Featured</Badge>}
          {outOfStock && <Badge variant="danger">Out of Stock</Badge>}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-copper-600 uppercase tracking-wider mb-1">
            {product.category}
          </p>
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-semibold text-crown-900 leading-snug hover:text-copper-600 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1.5 text-sm text-crown-400 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-crown-900">
              {formatPrice(product.price_cents)}
            </span>
            {onSale && (
              <span className="text-sm text-crown-400 line-through">
                {formatPrice(product.compare_at_cents!)}
              </span>
            )}
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="p-2.5 rounded-lg bg-copper-50 text-copper-600 hover:bg-copper-500 hover:text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
