import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../Loader/Loader';
function Checkout() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockError, setStockError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const GST_RATE = 0.18; // 18% GST
  const CUTE_CHARGE = 2; // $2 cute charge

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setLoading(false);
      setError('Please log in to proceed to checkout.');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/cart');
      setCart(response.data.cart);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart. Please try again later.');
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await api.post('api/orders/create');
      if (response.data.stockError) {
        setStockError(response.data.stockError);
      } else {
        setOrderSuccess(true);
        setTimeout(() => {
          navigate('/order-history');
        }, 3000);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      if (error.response && error.response.data.stockError) {
        setStockError(error.response.data.stockError);
      } else {
        setError('Failed to place order. Please try again.');
      }
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    }
  };
  
  if (loading) {
    return <Loader message="Loading Home Screen Please wait..." />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  const subtotal = cart && cart.items ? cart.items.reduce((total, item) => total + (item.item.price * item.quantity), 0) : 0;
  const gstAmount = subtotal * GST_RATE;
  const totalAmount = subtotal + gstAmount + CUTE_CHARGE;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Checkout</h1>
      {orderSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Order placed successfully! Redirecting to order history...</span>
        </div>
      )}
      {cart && cart.items && cart.items.length > 0 ? (
        <>
          <div className="bg-white shadow-md rounded my-6 p-6">
            <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
            {cart.items.map(item => (
              <div key={item._id} className="flex justify-between items-center mb-2">
                <span>{item.item.name} x {item.quantity}</span>
                <span>${(item.item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>GST (18%):</span>
                <span>${gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Cute Charge:</span>
                <span>${CUTE_CHARGE.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-bold mt-2">
                <span>Total Amount:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handlePlaceOrder}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition duration-300"
            >
              Place Order
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-600">Your cart is empty. Cannot proceed to checkout.</p>
      )}
      {stockError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
          <strong className="font-bold">Stock Error:</strong>
          <span className="block sm:inline"> {stockError}</span>
        </div>
      )}
    </div>
  );
}

export default Checkout;