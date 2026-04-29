// src/components/common/CategoryFilter.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import allEvent from "../../assets/allEvent.jpg";
import art from "../../assets/art.jpg";
import food from "../../assets/food.jpg";
import music from "../../assets/music.jpg";
import network from "../../assets/network.jpg";
import shopping from "../../assets/shopping.jpg";
import tech from "../../assets/tech.jpg";
import trending from "../../assets/trending.jpg";
import sports from "../../assets/sports.jpg";

import OptimizedImage from "./OptimizedImage";

const filterCategories = [
  { name: "All", icon: allEvent, value: "All" },
  { name: "Trending", icon: trending, value: "trending" },
  { name: "Music", icon: music, value: "music" },
  { name: "Sports", icon: sports, value: "sports" },
  { name: "Arts", icon: art, value: "arts" },
  { name: "Networking", icon: network, value: "networking" },
  { name: "Food", icon: food, value: "food" },
  { name: "Tech", icon: tech, value: "tech" },
  { name: "Shopping", icon: shopping, value: "shopping" },
];

const CategoryFilter = ({ currentCategory = "All", onCategoryChange }) => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryValue) => {
    if (onCategoryChange) {
      onCategoryChange(categoryValue);
    } else {
      if (categoryValue === "All") {
        navigate("/events");
      } else {
        navigate(`/events?category=${categoryValue}`);
      }
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-7 mt-6">
      {/* Circular Buttons with Label Underneath */}
      <div className="flex space-x-10 overflow-x-auto pb-4  scrollbar-custom">
        {filterCategories.map((filter, index) => {
          const isActive = currentCategory === filter.value;

          return (
            <div
              key={index}
              className="flex flex-col items-center flex-shrink-0"
            >
              <button
                onClick={() => handleCategoryClick(filter.value)}
                className={`
                  w-21 h-21 m-1 flex items-center justify-center 
                  rounded-full  transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-105"
                      : "border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                <OptimizedImage
                  src={filter.icon}
                  alt={filter.name}
                  className="h-10 w-10 scale-250 object-contain"
                />
              </button>
              <span 
                className={`
                mt-2 text-center text-sm font-medium transition-colors duration-300
                ${isActive ? "text-orange-600" : "text-gray-600"}
              `}
              >
                {filter.name}
              </span>
              {isActive && (
                <div className="w-1 h-1 bg-orange-500 rounded-full mt-1"></div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .scrollbar-custom::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #888;
          borderRadius: 10px;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </section>
  );
};

export default CategoryFilter;
