import React from 'react';
import { Link } from 'react-router-dom';
import ImageWithFallback from '../ImageWithFallback/ImageWithFallback';

function ItemCard({ item }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <ImageWithFallback
        src={item.imageUrl}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <Link 
          to={`/item/${item._id}`}
          className="text-xl font-semibold text-blue-600 hover:text-blue-800"
        >
          {item.name}
        </Link>
        <p className="text-sm text-gray-500 mt-1">{item.category}</p>
        <p className="text-gray-600 mt-2">{item.description}</p>
        <p className="text-lg font-bold text-orange-600 mt-2">${item.price.toFixed(2)}</p>
      </div>
    </div>
  );
}

export default ItemCard;