import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/format';
import { Link } from '@/context/RouterContext';
import { EmptyState } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';

export function CartPage() {
  const { items, removeItem, updateQuantity, subtotalCents, totalItems } = useCart();
  const shippingCents = subtotalCents >= 10000 || subtotalCents === 0 ? 0 : 25000;
  const taxCents = 0;
  const totalCents = subtotalCents + shippingCents + taxCents;

  if (items.length === 0) {
    return (
      <div className="container-max px-4 py-20">
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12" />}
          title="Your cart is empty"
          description="Browse our products and add items to your cart."
          action={<Link to="/products" className="btn-primary">Shop Products</Link>}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-crown-900 mb-6">
          Shopping Cart ({totalItems})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="card p-4 flex gap-4">
                <Link to={`/products/${item.product.slug}`} className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-crown-50">
                    {item.product.image_url && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to={`/products/${item.product.slug}`}>
                        <h3 className="font-semibold text-crown-900 hover:text-copper-600 transition-colors truncate">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-crown-400 mt-0.5">SKU: {item.product.sku}</p>
                      <p className="text-sm text-copper-600 font-semibold mt-1">
                        {formatPrice(item.product.price_cents)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-crown-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-crown-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1.5 text-crown-600 hover:bg-crown-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1.5 text-crown-600 hover:bg-crown-100 transition-colors"
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-bold text-crown-900">
                      {formatPrice(item.product.price_cents * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-medium text-copper-600 hover:text-copper-700 transition-colors">
              <ArrowRight className="w-4 h-4 rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-crown-900 text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-crown-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-crown-900">{formatPrice(subtotalCents)}</span>
                </div>
                <div className="flex justify-between text-crown-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-crown-900">
                    {shippingCents === 0 ? 'Free' : formatPrice(shippingCents)}
                  </span>
                </div>
                <div className="flex justify-between text-crown-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-crown-900">{formatPrice(taxCents)}</span>
                </div>
                <div className="pt-3 border-t border-crown-100 flex justify-between">
                  <span className="font-bold text-crown-900">Total</span>
                  <span className="font-bold text-copper-600 text-lg">{formatPrice(totalCents)}</span>
                </div>
              </div>

              {subtotalCents > 0 && subtotalCents < 10000 && (
                <p className="mt-3 text-xs text-crown-400 bg-crown-50 p-3 rounded-lg">
                  Add {formatPrice(10000 - subtotalCents)} more for free delivery!
                </p>
              )}

              <Link to="/checkout" className="btn-primary w-full mt-4">
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
