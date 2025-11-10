
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Package, Home, PackageSearch, LogOut ,Bell, X,Tag
  
,Percent} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import LocationPopover from '../ui/LocationPopover';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import Marquee from "react-fast-marquee";
import NavbarPopup from '../ui/NavbarPopup';
const Navbar = () => {
  const routerLocation = useRouterLocation();
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();
  const { clearCart } = useCart();
const [showPopup, setShowPopup] = useState(false);


// Auto-popup for new user only


const handleBellClick = () => {
  setShowPopup(true);
  ; // Reset closed state
};

const handleClosePopup = () => {
  setShowPopup(false);
   // Persist closed
};


const popupMessage = "🔥 Flat ₹200 off on orders above ₹999!";
  const { 
    currentLocation, 
    locations, 
    setCurrentLocation, 
  } = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    const handleCartUpdate = (event: CustomEvent) => {
      setCartCount(event.detail.count);
    };
    
    window.addEventListener('cart-updated' as any, handleCartUpdate as EventListener);
    
    const loadCartCount = () => {
      if (currentUser) {
        supabase
          .from('carts')
          .select('*')
          .eq('user_id', currentUser.id)
          .then(({ data }) => {
            if (data) {
              setCartCount(data.length);
            }
          });
      }
    };
    
    loadCartCount();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('cart-updated' as any, handleCartUpdate as EventListener);
    };
  }, [currentUser]);

  const isActive = (path: string) => {
    if (path === '/' && routerLocation.pathname === '/') {
      return true;
    } else if (path !== '/' && routerLocation.pathname !== '/'){
      return routerLocation.pathname.startsWith(path);
    }
    return false;
  };

  const handleLocationSelect = (location: any) => {
    setCurrentLocation(location);
    toast.success(`Location updated to ${location.name}`);
  };
  const handleSignOut = async () => {
    try {
      if (currentUser) {
        try {
          await supabase.from('carts').delete().eq('user_id', currentUser.id);
        } catch (error) {
         // console.error('Error clearing cart during sign out:', error);
        }
      }
      
      clearCart();
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      if (signOut) {
        await signOut();
      }
      
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
   //   console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };


  return (
    
    <div className={`fixed top-0 left-0 right-0 z-40  transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}>
      {/* 🔥 Flash Sale Marquee */}
            <div className="bg-red-600 h-5  pt-1 pb-1  md:h-6 md:pt-2 md:pb-2 flex items-center ">
              <Marquee gradient={false} speed={40} pauseOnHover={true} className="w-full">
                {Array.from({ length:10 }).map((_, i) => (
                  <span key={i} className="flex items-center uppercase text-white font-semibold text-[10px] sm:text-[14px] md:text-[15px] lg:text-[15px] px-4 whitespace-nowrap">
                      <Tag size={14} className='text-white font-semibold'/> &nbsp;Flat ₹500 Off on Orders Above ₹2500
                  </span>
                ))}
              </Marquee>
            </div>
             <div className={`flex items-center justify-between w-full  
       ${isScrolled 
          ? 'bg-transparent backdrop-blur-md bg-gray-800/90' 
          : 'bg-transparent '
      }`}>

    {/* Brand Logo */}
    <div className="flex  justify-between w-full px-1">
  {/* Left: Brand Text */}
  {/*<span className="text-white italic font-bold text-xl sm:text-2xl md:text-3xl tracking-wide font-poppins">
    AIJIM
  </span>
/*}
  {/* Center: Logo Image */}
  <div className="flex-grow flex">
    <img
      src="/aijim-uploads/aijim.svg"
      alt="AIJIM Logo"
      className=" w-28 sm:w-38 md:w-40 lg:w-50 object-contain"
    />
  </div>
</div>

    

    {/* Right Icons */}
    <div className="flex items-center gap-4 mr-5">
      
      {/* Popup Notification */}
    
      {/* Search Icon */}
      <Link
        to="/search"
        aria-label="search"
        className="text-white hover:text-yellow-500 transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
      </Link>

      {/* Cart Icon */}
      <Link to="/cart" aria-label='go to cart page' className="relative mt-2">
              <button className="text-white aria-labelleby='cart-button' hover:text-yellow-500">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
    </div>
  </div>
      

 


            








     <div className="fixed bottom-0 left-0 right-0 bg-black border-t  border-gray-800 p-2 z-50 ">
     <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-2 z-50">
  <div className="flex items-center justify-between leading-snug">
    <button
      onClick={() => {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`flex flex-col items-center font-bold text-xs sm:text-sm ${
        isActive('/') ? 'text-white border-b border-white' : 'text-[#6B7280]'
      }`}
    >
      <Home size={18} className={isActive('/') ? 'text-white' : 'text-[#6B7280]'} />
      <span>Home</span>
    </button>

    <button
      onClick={() => {
        navigate('/products');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`flex flex-col items-center font-bold text-xs sm:text-sm ${
        isActive('/products') ? 'text-white border-b border-white' : 'text-[#6B7280]'
      }`}
    >
      <Package size={18} className={isActive('/products') ? 'text-white' : 'text-[#6B7280]'} />
      <span>Products</span>
    </button>

    <button
      onClick={() => {
        navigate('/search');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`flex flex-col items-center font-bold text-xs sm:text-sm ${
        isActive('/search') ? 'text-white border-b border-white' : 'text-[#6B7280]'
      }`}
    >
      <Search size={18} className={isActive('/search') ? 'text-white' : 'text-[#6B7280]'} />
      <span>Search</span>
    </button>

    <button
      onClick={() => {
        navigate('/orders');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      className={`flex flex-col items-center font-bold text-xs sm:text-sm ${
        isActive('/orders') ? 'text-white border-b border-white' : 'text-[#6B7280]'
      }`}
    >
      <PackageSearch size={18} className={isActive('/orders') ? 'text-white' : 'text-[#6B7280]'} />
      <span>Orders</span>
    </button>

    {currentUser ? (
      <button
        onClick={() => {
          navigate('/profile');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center font-bold text-xs sm:text-sm ${
          isActive('/profile') ? 'text-white border-b border-white' : 'text-[#6B7280]'
        }`}
      >
        <User size={18} className={isActive('/profile') ? 'text-white' : 'text-[#6B7280]'} />
        <span>Profile</span>
      </button>
    ) : (
      <button
        onClick={() => {
          navigate('/signin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`flex flex-col items-center font-bold text-xs sm:text-sm ${
          isActive('/signin') ? 'text-white border-b border-white' : 'text-[#6B7280]'
        }`}
      >
        <User size={18} className={isActive('/signin') ? 'text-white' : 'text-[#6B7280]'} />
        <span>Sign In</span>
      </button>
    )}
  </div>
</div>
    </div>
  );
};

export default Navbar;
