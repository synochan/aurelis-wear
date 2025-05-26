// Mock data for products when API fails
export const mockProducts = [
  {
    id: 1,
    name: "Classic T-Shirt",
    price: 29.99,
    category: "Shirts",
    image: "products/classic-tshirt",
    isNew: true,
    discountPercentage: 0,
    colors: [
      { id: 1, name: "Black", hex_value: "#000000" },
      { id: 2, name: "White", hex_value: "#FFFFFF" }
    ],
    sizes: [
      { id: 1, name: "S", size_type: "clothing" },
      { id: 2, name: "M", size_type: "clothing" },
      { id: 3, name: "L", size_type: "clothing" }
    ],
    description: "A comfortable and stylish classic t-shirt for everyday wear."
  },
  {
    id: 2,
    name: "Slim Fit Jeans",
    price: 49.99,
    category: "Pants",
    image: "products/slim-jeans",
    isNew: false,
    discountPercentage: 10,
    colors: [
      { id: 3, name: "Blue", hex_value: "#0000FF" },
      { id: 4, name: "Black", hex_value: "#000000" }
    ],
    sizes: [
      { id: 4, name: "30", size_type: "pants" },
      { id: 5, name: "32", size_type: "pants" },
      { id: 6, name: "34", size_type: "pants" }
    ],
    description: "Comfortable slim fit jeans that look great for any occasion."
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 89.99,
    category: "Shoes",
    image: "products/running-shoes",
    isNew: true,
    discountPercentage: 0,
    colors: [
      { id: 5, name: "Red", hex_value: "#FF0000" },
      { id: 6, name: "Black", hex_value: "#000000" }
    ],
    sizes: [
      { id: 7, name: "9", size_type: "shoes" },
      { id: 8, name: "10", size_type: "shoes" },
      { id: 9, name: "11", size_type: "shoes" }
    ],
    description: "Lightweight and comfortable running shoes for everyday workouts."
  },
  {
    id: 4,
    name: "Casual Jacket",
    price: 79.99,
    category: "Outerwear",
    image: "products/casual-jacket",
    isNew: false,
    discountPercentage: 15,
    colors: [
      { id: 7, name: "Brown", hex_value: "#8B4513" },
      { id: 8, name: "Gray", hex_value: "#808080" }
    ],
    sizes: [
      { id: 10, name: "M", size_type: "clothing" },
      { id: 11, name: "L", size_type: "clothing" },
      { id: 12, name: "XL", size_type: "clothing" }
    ],
    description: "A versatile casual jacket perfect for fall and spring weather."
  }
]; 