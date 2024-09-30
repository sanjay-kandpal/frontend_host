import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../Loader/Loader';

import Banner from '../Banner/Banner';
import CategoryButtons from '../CategoryButtons/CategoryButtons';
import ItemCard from '../ItemCard/ItemCard';

function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const searchInputRef = useRef(null);

  const categories = ['All', 'Fruit', 'Vegetable', 'Non-veg', 'Breads', 'Other'];

  const banners = [
    { title: "Welcome to AkaBite!", content: "Get 50% OFF on Your First Order" },
    { title: "New Items Added!", content: "Check out our latest collection" },
    { title: "Free Delivery", content: "On orders over $50" },
  ];

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await api.get('api/items');
      
      setItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to load items. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchItems();
    }
  }, [authLoading, isAuthenticated, fetchItems]);

  useEffect(() => {
    const filterItems = () => {
      let result = items;
      
      if (selectedCategory !== 'All') {
        result = result.filter(item => item.category === selectedCategory);
      }
      
      if (searchTerm) {
        const lowercasedSearch = searchTerm.toLowerCase();
        result = result.filter(item => 
          item.name.toLowerCase().includes(lowercasedSearch) ||
          item.description.toLowerCase().includes(lowercasedSearch)
        );
      }
      
      setFilteredItems(result);
    };

    filterItems();
  }, [selectedCategory, searchTerm, items]);

  useEffect(() => {
    if (isSearchActive && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchActive]);

  const handleCategoryClick = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchActive(prev => !prev);
    if (isSearchActive) {
      setSearchTerm('');
    }
  }, [isSearchActive]);

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

  return (
    <div className="bg-white min-h-screen relative">
      <Banner banners={banners} />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-center items-center mb-8 relative">
          {isSearchActive ? (
            <div className="flex items-center bg-white rounded-full shadow-lg w-full max-w-3xl">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Hey!!!! Search (-_-)..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="px-6 py-3 w-full rounded-l-full focus:outline-none"
              />
              <button
                onClick={toggleSearch}
                className="bg-orange-500 text-white p-3 rounded-r-full hover:bg-orange-600 transition duration-300"
                aria-label="Close search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-bold text-orange-600 mr-4">AkaBite</h1>
              <button
                onClick={toggleSearch}
                className="bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition duration-300"
                aria-label="Open search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </>
          )}
        </div>

        <CategoryButtons 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onCategoryClick={handleCategoryClick} 
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map(item => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 mt-8">No items found. Try adjusting your search or category selection.</p>
        )}
      </div>
    </div>
  );
}

export default Home;