/**
 * Mock data to use as fallback when the API is unavailable
 */

import { Product } from '@/components/ProductCard';

// Mock product data
export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Classic T-Shirt",
    price: 599,
    priceDisplay: "₱599.00",
    image: "/product-placeholder.svg",
    categories: [{ id: 1, name: "T-Shirts", slug: "t-shirts" }],
    colors: [
      { id: 1, name: "Black", hex_value: "#000000" },
      { id: 2, name: "White", hex_value: "#FFFFFF" },
      { id: 3, name: "Navy", hex_value: "#000080" }
    ],
    sizes: [
      { id: 1, name: "S" },
      { id: 2, name: "M" },
      { id: 3, name: "L" },
      { id: 4, name: "XL" }
    ],
    isNew: true,
    description: "A comfortable classic t-shirt for everyday wear."
  },
  {
    id: 2,
    name: "Slim Fit Jeans",
    price: 1299,
    priceDisplay: "₱1,299.00",
    image: "/product-placeholder.svg",
    categories: [{ id: 2, name: "Jeans", slug: "jeans" }],
    colors: [
      { id: 1, name: "Blue", hex_value: "#0000FF" },
      { id: 4, name: "Black", hex_value: "#000000" }
    ],
    sizes: [
      { id: 1, name: "28" },
      { id: 2, name: "30" },
      { id: 3, name: "32" },
      { id: 4, name: "34" }
    ],
    description: "Stylish slim fit jeans that look great with any outfit."
  },
  {
    id: 3,
    name: "Summer Dress",
    price: 899,
    priceDisplay: "₱899.00",
    discountPrice: 699,
    discountPriceDisplay: "₱699.00",
    discountPercentage: 22,
    image: "/product-placeholder.svg",
    categories: [{ id: 3, name: "Dresses", slug: "dresses" }],
    colors: [
      { id: 5, name: "Red", hex_value: "#FF0000" },
      { id: 6, name: "Green", hex_value: "#00FF00" },
      { id: 7, name: "Yellow", hex_value: "#FFFF00" }
    ],
    sizes: [
      { id: 1, name: "S" },
      { id: 2, name: "M" },
      { id: 3, name: "L" }
    ],
    description: "A lightweight summer dress perfect for warm weather."
  },
  {
    id: 4,
    name: "Athletic Shorts",
    price: 499,
    priceDisplay: "₱499.00",
    image: "/product-placeholder.svg",
    categories: [{ id: 4, name: "Shorts", slug: "shorts" }],
    colors: [
      { id: 1, name: "Black", hex_value: "#000000" },
      { id: 8, name: "Grey", hex_value: "#808080" }
    ],
    sizes: [
      { id: 1, name: "S" },
      { id: 2, name: "M" },
      { id: 3, name: "L" },
      { id: 4, name: "XL" }
    ],
    description: "Comfortable athletic shorts for your workout or casual wear."
  }
];

// More mock products
export const mockFeaturedProducts: Product[] = [
  ...mockProducts,
  {
    id: 5,
    name: "Formal Shirt",
    price: 899,
    priceDisplay: "₱899.00",
    image: "/product-placeholder.svg",
    categories: [{ id: 5, name: "Formal", slug: "formal" }],
    colors: [
      { id: 1, name: "White", hex_value: "#FFFFFF" },
      { id: 9, name: "Blue", hex_value: "#0000FF" },
      { id: 10, name: "Pink", hex_value: "#FFC0CB" }
    ],
    sizes: [
      { id: 1, name: "S" },
      { id: 2, name: "M" },
      { id: 3, name: "L" },
      { id: 4, name: "XL" }
    ],
    isNew: true,
    description: "A stylish formal shirt for professional settings."
  },
  {
    id: 6,
    name: "Winter Jacket",
    price: 2499,
    priceDisplay: "₱2,499.00",
    discountPrice: 1999,
    discountPriceDisplay: "₱1,999.00",
    discountPercentage: 20,
    image: "/product-placeholder.svg",
    categories: [{ id: 6, name: "Jackets", slug: "jackets" }],
    colors: [
      { id: 1, name: "Black", hex_value: "#000000" },
      { id: 11, name: "Brown", hex_value: "#A52A2A" }
    ],
    sizes: [
      { id: 1, name: "S" },
      { id: 2, name: "M" },
      { id: 3, name: "L" },
      { id: 4, name: "XL" }
    ],
    description: "A warm winter jacket to keep you comfortable in cold weather."
  }
];

// Function to get a single product by ID
export const getMockProductById = (id: number): Product | undefined => {
  return [...mockProducts, ...mockFeaturedProducts].find(product => product.id === id);
};

export default {
  mockProducts,
  mockFeaturedProducts,
  getMockProductById
}; 