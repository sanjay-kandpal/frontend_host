import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../Loader/Loader';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [customQuantities, setCustomQuantities] = useState({});
  const [quantityErrors, setQuantityErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const navigate = useNavigate();

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/cart');
      setCartItems(response.data.cart.items || []);
      
      // Initialize custom quantities for items with quantity > 10
      const initialCustomQuantities = {};
      response.data.cart.items.forEach(item => {
        if (item.quantity > 10) {
          initialCustomQuantities[item._id] = item.quantity.toString();
        }
      });
      setCustomQuantities(initialCustomQuantities);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      checkAuthStatus().then(() => {
        if (isAuthenticated) {
          fetchCartItems();
        } else {
          setLoading(false);
        }
      });
    }
  }, [isAuthenticated, checkAuthStatus]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      if (newQuantity === 'custom') {
        setCustomQuantities(prev => ({ ...prev, [itemId]: '11' }));
        newQuantity = 11;
      } else {
        newQuantity = parseInt(newQuantity, 10);
      }

      const response = await api.put(`api/cart/update/${itemId}`, { quantity: newQuantity });
      
      if (response.data.message === 'Requested quantity is available') {
        setCartItems(prevItems => 
          prevItems.map(item => 
            item._id === itemId ? { ...item, quantity: newQuantity } : item
          )
        );
        setQuantityErrors(prev => ({ ...prev, [itemId]: null }));
        setNotification({ type: 'success', message: 'Quantity Available!' });
      } else if (response.data.availableStock <= 0) {
        setQuantityErrors(prev => ({ 
          ...prev, 
          [itemId]: `This item is no longer available in stock.`
        }));
        setNotification({ type: 'error', message: 'Item out of stock!' });

        // Save updated cart to backend
        await api.post('api/cart/save', { items: cartItems });
      } else {
        setQuantityErrors(prev => ({ 
          ...prev, 
          [itemId]: `Only ${response.data.availableStock} items are available in stock.`
        }));
      }
    } catch (error) {
      console.error('Error checking item availability:', error);
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Failed to check item availability. Please try again.' 
      });
    }
  };

  const handleCustomQuantityChange = async (itemId, value) => {
    setCustomQuantities(prev => ({ ...prev, [itemId]: value }));
    const numValue = parseInt(value, 10);
    const item = cartItems.find(item => item._id === itemId);

    if (!isNaN(numValue)) {
      if (numValue > item.item.stockQuantity) {
        setQuantityErrors(prev => ({ 
          ...prev, 
          [itemId]: `Quantity exceeds available stock (${Math.max(0, item.item.stockQuantity)})`
        }));
      } else if (numValue <= 10) {
        setQuantityErrors(prev => ({ 
          ...prev, 
          [itemId]: 'Please select 11 or more for custom quantity'
        }));
      } else {
        await handleQuantityChange(itemId, numValue);
      }
    } else {
      setQuantityErrors(prev => ({ 
        ...prev, 
        [itemId]: 'Please enter a valid number'
      }));
    }
  };

  const handleRemoveItem = (itemId) => {
    setItemToRemove(itemId);
    setShowConfirmation(true);
  };

  const confirmRemoveItem = async () => {
    try {
      await api.delete(`api/cart/remove/${itemToRemove}`);
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemToRemove));
      setNotification({ type: 'success', message: 'Item removed successfully!' });
      
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    } catch (error) {
      console.error('Error removing item from Basket:', error);
      setNotification({ type: 'error', message: 'Failed to remove item from cart. Please try again.' });
    } finally {
      setShowConfirmation(false);
      setItemToRemove(null);
    }
  };

  const cancelRemoveItem = () => {
    setShowConfirmation(false);
    setItemToRemove(null);
  };

  const handleProceedToCheckout = async () => {
    const invalidItems = cartItems.filter(item => 
      item.quantity <= 0 || item.quantity > Math.max(0, item.item.stockQuantity) || quantityErrors[item._id]
    );

    if (invalidItems.length > 0) {
      const itemNames = invalidItems.map(item => item.item.name).join(', ');
      setNotification({
        type: 'error',
        message: `Cannot proceed to checkout. Please update quantities for: ${itemNames}`
      });
    } else {
      try {
        // Save the current cart state before proceeding to checkout
        await api.post('api/cart/save', { items: cartItems });
        navigate('/checkout');
      } catch (error) {
        console.error('Error saving cart before checkout:', error);
        setNotification({
          type: 'error',
          message: 'Failed to proceed to checkout. Please try again.'
        });
      }
    }
  };

  const calculateTotal = useCallback(() => {
    return cartItems
      .filter(item => item.quantity > 0 && item.quantity <= Math.max(0, item.item.stockQuantity) && !quantityErrors[item._id])
      .reduce((total, item) => total + item.item.price * item.quantity, 0)
      .toFixed(2);
  }, [cartItems, quantityErrors]);

  const isCartValid = useCallback(() => {
    return cartItems.every(item => 
      item.quantity > 0 && 
      item.quantity <= Math.max(0, item.item.stockQuantity) &&
      !quantityErrors[item._id]
    ) && cartItems.length > 0;
  }, [cartItems, quantityErrors]);

  const renderQuantityOptions = (stockQuantity) => {
    const options = [];
    const maxOptions = Math.min(10, Math.max(0, stockQuantity));
    
    for (let i = 1; i <= maxOptions; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    
    if (stockQuantity > 10) {
      options.push(<option key="custom" value="custom">10+ (Custom)</option>);
    }
    
    return options;
  };

  const displayStock = (stockQuantity) => {
    return Math.max(0, stockQuantity);
  };

  if (loading) {
    return <Loader message="Loading your Basket..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 relative">
      <h1 className="text-3xl font-bold mb-8">Your Basket</h1>
      
      {notification && (
        <div className={`${notification.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'} px-4 py-3 rounded relative mb-4`} role="alert">
          <strong className="font-bold">{notification.type === 'success' ? 'Success! ' : 'Error! '}</strong>
          <span className="block sm:inline">{notification.message}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {cartItems.length === 0 ? (
        <p>Your Basket is empty. <Link to="/" className="text-blue-500 hover:underline">Continue shopping</Link></p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((cartItem) => (
              <li key={cartItem._id} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  {cartItem.item && (
                    <>
                      <img src={cartItem.item.imageUrl} alt={cartItem.item.name} className="w-16 h-16 object-cover rounded mr-4" />
                      <div>
                        <h2 className="text-lg font-semibold">{cartItem.item.name}</h2>
                        <p className="text-gray-600">
                          ${cartItem.item.price ? cartItem.item.price.toFixed(2) : "Price not available"} each
                        </p>
                        <p className="text-sm text-gray-500">
                          In stock: {displayStock(cartItem.item.stockQuantity)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center">
                  {displayStock(cartItem.item.stockQuantity) > 0 ? (
                    <select
                      value={cartItem.quantity > 10 ? 'custom' : cartItem.quantity}
                      onChange={(e) => handleQuantityChange(cartItem._id, e.target.value)}
                      className="border rounded px-2 py-1 w-24 mr-2"
                    >
                      {renderQuantityOptions(cartItem.item.stockQuantity)}
                    </select>
                  ) : (
                    <p className="text-red-500">Out of stock</p>
                  )}
                  {cartItem.quantity > 10 && displayStock(cartItem.item.stockQuantity) > 0 && (
                    <input
                      type="number"
                      value={customQuantities[cartItem._id] || ''}
                      onChange={(e) => handleCustomQuantityChange(cartItem._id, e.target.value)}
                      min="11"
                      max={displayStock(cartItem.item.stockQuantity)}
                      className="border rounded px-2 py-1 w-20 mr-2"
                      placeholder="Enter quantity"
                    />
                  )}
                  <button 
                    onClick={() => handleRemoveItem(cartItem._id)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {Object.entries(quantityErrors).map(([itemId, error]) => (
            error && (
              <div key={itemId} className="text-red-500 text-sm mt-2">
                {error}
              </div>
            )
          ))}
          <div className="mt-8">
            <p className="text-xl font-semibold">Total: ${calculateTotal()}</p>
            <button 
              onClick={handleProceedToCheckout}
              className={`mt-4 py-2 px-4 rounded ${
                isCartValid()
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isCartValid()}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}

      {/* Confirmation Popup */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Remove Item</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to remove this item from your cart?
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  id="ok-btn"
                  className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-24 mr-2 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                  onClick={confirmRemoveItem}
                >
                  Yes
                </button>
                <button
                  id="cancel-btn"
                  className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-24 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  onClick={cancelRemoveItem}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;