import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingCart, ArrowLeft, Check, Truck, Shield, RotateCcw, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { Link, useRouter } from '@/context/RouterContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, EmptyState } from '@/components/ui/Loading';
import type { Product, Review } from '@/types/database';
import { Star } from 'lucide-react';

export function ProductDetailPage({ slug }: { slug: string }) {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      const productData = data as Product | null;
      setProduct(productData);
      if (productData) {
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productData.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        setReviews((reviewData as Review[]) || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="container-max px-4 py-20 flex justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-max px-4 py-20">
        <EmptyState
          title="Product not found"
          description="The product you're looking for may have been removed."
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      </div>
    );
  }

  const gallery = product.gallery_urls?.length ? product.gallery_urls : [product.image_url];
  const onSale = product.compare_at_cents && product.compare_at_cents > product.price_cents;
  const outOfStock = product.stock <= 0;
  const specs = product.specifications as Record<string, string> | null;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="animate-fade-in">
      <div className="container-max px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-1.5 text-sm text-crown-500 hover:text-copper-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="card overflow-hidden aspect-square bg-crown-50">
              {gallery[activeImage] && (
                <img
                  src={gallery[activeImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3">
                {gallery.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImage === i ? 'border-copper-500' : 'border-crown-200'
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="copper">{product.category}</Badge>
              {onSale && <Badge variant="danger">Sale</Badge>}
              {product.is_featured && <Badge variant="neutral">Featured</Badge>}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-crown-900 leading-tight">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-crown-400">SKU: {product.sku}</p>

            {reviews.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(avgRating) ? 'text-copper-400' : 'text-crown-200'}`}
                      fill={i < Math.round(avgRating) ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="text-sm text-crown-400">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            <div className="mt-5 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-crown-900">
                {formatPrice(product.price_cents)}
              </span>
              {onSale && (
                <span className="text-lg text-crown-400 line-through">
                  {formatPrice(product.compare_at_cents!)}
                </span>
              )}
            </div>

            <p className="mt-5 text-crown-600 leading-relaxed">{product.description}</p>

            {product.long_description && (
              <div className="mt-4 text-sm text-crown-500 leading-relaxed">
                {product.long_description}
              </div>
            )}

            {/* Specifications */}
            {specs && Object.keys(specs).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-crown-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm py-2 px-3 bg-crown-50 rounded-lg">
                      <span className="text-crown-400">{key}</span>
                      <span className="font-medium text-crown-900 text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2">
              {outOfStock ? (
                <Badge variant="danger">Out of Stock</Badge>
              ) : product.stock < 10 ? (
                <Badge variant="warning">Only {product.stock} left in stock</Badge>
              ) : (
                <Badge variant="success">
                  <Check className="w-3 h-3 mr-1" />
                  In Stock
                </Badge>
              )}
            </div>

            {/* Quantity + Cart + Buy Now */}
            <div className="mt-8 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border border-crown-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-crown-600 hover:bg-crown-100 transition-colors"
                    disabled={outOfStock}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-crown-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 text-crown-600 hover:bg-crown-100 transition-colors"
                    disabled={outOfStock}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  size="lg"
                  className="flex-1"
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
              </div>
              <Button
                onClick={handleBuyNow}
                disabled={outOfStock}
                size="lg"
                variant="secondary"
                fullWidth
              >
                <Zap className="w-5 h-5 text-copper-500" />
                Buy Now
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-crown-100">
              <div className="text-center">
                <Truck className="w-6 h-6 text-copper-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-crown-600">Fast<br />Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-copper-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-crown-600">Quality<br />Assured</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 text-copper-500 mx-auto mb-1.5" />
                <p className="text-xs font-medium text-crown-600">Easy<br />Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {reviews.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-crown-900 mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="card p-5">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-copper-400' : 'text-crown-200'}`}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  {review.title && <h4 className="font-semibold text-crown-900 mb-1">{review.title}</h4>}
                  <p className="text-sm text-crown-500 leading-relaxed">"{review.comment}"</p>
                  <p className="mt-3 text-xs text-crown-400">— {review.user_name || 'Customer'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
