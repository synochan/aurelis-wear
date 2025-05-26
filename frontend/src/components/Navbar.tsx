import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ShoppingBag, 
  User, 
  Search,
  Menu, 
  X,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUser, useLogout } from '@/api';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { CommandDialog, CommandInput, CommandList, CommandItem, CommandEmpty } from '@/components/ui/command';
import { api as apiClient } from '@/api';

const categories = [
  { name: "Men", slug: "men" },
  { name: "Women", slug: "women" },
  { name: "Kids", slug: "kids" },
  { name: "Accessories", slug: "accessories" },
  { name: "Shoes", slug: "shoes" },
  { name: "T-Shirt", slug: "t-shirt" },
  { name: "Pants", slug: "pants" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const { mutate: logout } = useLogout();
  const { cartItemCount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        toast({
          title: "Logged out",
          description: "You have been logged out successfully",
        });
        navigate('/');
      }
    });
  };

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    apiClient.get('/products', { params: { search: searchQuery } })
      .then(res => {
        const data = res.data.results || res.data;
        setSearchResults(data);
      })
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false));
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-heading font-extrabold">
            AURELIS
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {categories.map((category) => (
                  <NavigationMenuItem key={category.name}>
                    <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4">
                        <li className="row-span-1">
                          <NavigationMenuLink asChild>
                            <Link
                              to={`/products?category=${category.slug}`}
                              className="block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                              {category.name}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}
                <NavigationMenuItem>
                  <Link to="/products" className={navigationMenuTriggerStyle()}>
                    All Products
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
            
            {/* User Menu */}
            {!userLoading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.firstName} {user.lastName}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account">My Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/login">Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register">Register</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-aurelis text-[10px] font-medium flex items-center justify-center text-white">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && isMobile && (
        <div className="fixed inset-0 top-16 bg-white z-40 p-4 overflow-y-auto">
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.name} className="pb-3 border-b">
                <h3 className="font-medium text-lg mb-2">{category.name}</h3>
                <div className="ml-4 space-y-2">
                  <Link
                    to={`/products?category=${category.slug}`}
                    className="block py-1 font-medium text-aurelis"
                    onClick={() => setIsOpen(false)}
                  >
                    View All {category.name}
                  </Link>
                </div>
              </div>
            ))}
            <Link 
              to="/products" 
              className="block py-3 font-medium text-lg"
              onClick={() => setIsOpen(false)}
            >
              All Products
            </Link>
            
            {/* Mobile Auth Links */}
            <div className="border-t pt-3">
              {!userLoading && user ? (
                <>
                  <div className="font-medium text-lg mb-2">Account</div>
                  <Link 
                    to="/account" 
                    className="block py-1 ml-4"
                    onClick={() => setIsOpen(false)}
                  >
                    My Account
                  </Link>
                  <Link 
                    to="/orders" 
                    className="block py-1 ml-4"
                    onClick={() => setIsOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button 
                    className="block py-1 ml-4 text-red-600"
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="block py-3 font-medium text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-3 font-medium text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput
          placeholder="Search for products..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {searchLoading && <CommandItem>Loading...</CommandItem>}
          {!searchLoading && searchResults.length === 0 && searchQuery && (
            <CommandEmpty>No products found.</CommandEmpty>
          )}
          {searchResults.map(product => (
            <CommandItem
              key={product.id}
              onSelect={() => {
                setSearchOpen(false);
                navigate(`/products/${product.id}`);
              }}
            >
              {product.name}
            </CommandItem>
          ))}
          {!searchQuery && (
            <CommandItem onSelect={() => { setSearchOpen(false); navigate('/products'); }}>All Products</CommandItem>
          )}
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default Navbar;
