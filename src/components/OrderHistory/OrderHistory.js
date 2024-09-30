import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../Loader/Loader'

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Please log in to view your order history.');
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Token before order history request:', token);
      const response = await api.get('api/orders/history');
      console.log('Order history response:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching order history:', error);
      setError('Failed to load order history. Please try again later.');
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Loading your order history..." />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-8 text-center">Order History</h1>
      {orders.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white shadow-md rounded-lg p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-0">Order #{order._id}</h2>
                <span className={`px-2 py-1 rounded text-xs sm:text-sm ${
                  order.status === 'completed' ? 'bg-green-200 text-green-800' :
                  order.status === 'processing' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-4">Ordered on: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item._id} className="flex justify-between items-center text-sm">
                    <span className="truncate mr-2">{item.item.name} x {item.quantity}</span>
                    <span className="whitespace-nowrap">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between items-center font-bold text-sm sm:text-base">
                  <span>Total Amount:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">You haven't placed any orders yet.</p>
      )}
    </div>
  );
}

export default OrderHistory;