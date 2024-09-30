import React from 'react';

const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <style>
        {`
          @keyframes plate-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes food-bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
      <svg width="100" height="100" viewBox="0 0 100 100" className="animate-[plate-spin_3s_linear_infinite]">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#f97316" strokeWidth="5" />
        <circle cx="50" cy="25" r="10" fill="#f97316" className="animate-[food-bounce_1s_ease-in-out_infinite]" />
        <circle cx="25" cy="50" r="10" fill="#f97316" className="animate-[food-bounce_1s_ease-in-out_infinite_0.3s]" />
        <circle cx="75" cy="50" r="10" fill="#f97316" className="animate-[food-bounce_1s_ease-in-out_infinite_0.6s]" />
      </svg>
      <p className="mt-4 text-lg font-medium text-orange-500">{message}</p>
    </div>
  );
};

export default Loader;