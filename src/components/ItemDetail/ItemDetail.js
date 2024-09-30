import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../Loader/Loader';
import ImageWithFallback from '../ImageWithFallback/ImageWithFallback';

function ItemDetail() {
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customQuantity, setCustomQuantity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addToCartError, setAddToCartError] = useState(null);
  const [quantityError, setQuantityError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const fetchItemDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`api/items/${id}`);
      setItem(response.data);
      setQuantity(response.data.stockQuantity > 0 ? 1 : 0);
    } catch (error) {
      console.error('Error fetching item details:', error);
      setError('Failed to load item details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === 'custom') {
      setQuantity(11);
      setCustomQuantity('11');
      setQuantityError(null);
    } else {
      const numValue = parseInt(value, 10);
      setQuantity(numValue);
      setCustomQuantity('');
      setQuantityError(null);
    }
  };

  const handleCustomQuantityChange = (e) => {
    const value = e.target.value;
    setCustomQuantity(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      if (numValue > item.stockQuantity) {
        setQuantityError(`Quantity exceeds available stock (${item.stockQuantity})`);
        setQuantity(item.stockQuantity);
      } else if (numValue <= 10) {
        setQuantityError('Please select 11 or more for custom quantity');
        setQuantity(11);
      } else {
        setQuantityError(null);
        setQuantity(numValue);
      }
    } else {
      setQuantityError('Please enter a valid number');
      setQuantity(11);
    }
  };

  const isQuantityValid = () => {
    return quantity > 0 && quantity <= item.stockQuantity && !quantityError;
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setAddToCartError('Please log in to add items to your cart.');
      return;
    }
    if (!isQuantityValid()) {
      setAddToCartError('Please select a valid quantity.');
      return;
    }
    try {
      setAddToCartError(null);
      const response = await api.post('api/cart/add', { itemId: item._id, quantity });
      console.log('Add to cart response:', response.data);
      setSuccessMessage(`${quantity} ${item.name}(s) added to cart!`);
      setTimeout(() => {
        setSuccessMessage(null);
        navigate('/cart');
      }, 2000);
    } catch (error) {
      console.error('Error adding item to cart:', error.response?.data || error.message);
      setAddToCartError(error.response?.data?.message || 'Failed to add item to cart. Please try again.');
    }
  };

  if (loading) return <Loader message="Loading item details..." />;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert"><strong className="font-bold">Error!</strong><span className="block sm:inline"> {error}</span></div>;
  if (!item) return <div className="text-center">Item not found</div>;

  const isNotAvailable = item.stockQuantity <= 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="mb-4 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600">Back</button>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-full h-64 object-cover" />
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
          <p className="text-gray-600 mb-4">{item.description}</p>
          <p className="text-green-600 font-bold text-xl mb-4">${item.price.toFixed(2)}</p>
          {isNotAvailable ? (
            <p className="text-red-500 font-bold mb-4">Item Not Available</p>
          ) : (
            <>
              <div className="flex items-center mb-4">
                <label htmlFor="quantity" className="mr-2">Quantity:</label>
                <select
                  id="quantity"
                  value={quantity > 10 ? 'custom' : quantity}
                  onChange={handleQuantityChange}
                  className="border rounded px-2 py-1 w-24"
                >
                  {[...Array(Math.min(10, item.stockQuantity)).keys()].map(i => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                  {item.stockQuantity > 10 && <option value="custom">10+ (Custom)</option>}
                </select>
                {quantity > 10 && (
                  <input
                    type="number"
                    value={customQuantity}
                    onChange={handleCustomQuantityChange}
                    min="11"
                    max={item.stockQuantity}
                    className="border rounded px-2 py-1 w-20 ml-2"
                    placeholder="Enter quantity"
                  />
                )}
              </div>
              {quantityError && (
                <p className="text-red-500 text-sm mb-2">{quantityError}</p>
              )}
              <button 
                onClick={handleAddToCart}
                className={`py-2 px-4 rounded ${isQuantityValid() ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                disabled={!isQuantityValid()}
              >
                Add to Cart
              </button>
              <p className="text-sm mt-2 text-gray-500">
                {item.stockQuantity} left in stock
              </p>
            </>
          )}
          {addToCartError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {addToCartError}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> {successMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;