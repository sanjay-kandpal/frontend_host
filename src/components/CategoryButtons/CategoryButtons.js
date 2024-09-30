import React from 'react';

function CategoryButtons({ categories, selectedCategory, onCategoryClick }) {
  return (
    <div className="flex flex-wrap justify-center gap-4 mb-8">
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategoryClick(category)}
          className={`px-4 py-2 rounded-full ${
            selectedCategory === category
              ? 'bg-orange-600 text-white'
              : 'bg-orange-200 text-orange-800 hover:bg-orange-300'
          } transition duration-300`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default CategoryButtons;