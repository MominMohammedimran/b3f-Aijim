import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/layout/Layout';

const EmptyCart = () => {
  const { currentUser } = useAuth();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="text-center py-16 space-y-4">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-gray-600 pb-4">Add some items to get started!</p>

          <Link to="/" className="mt-6">
            <Button>Continue Shopping</Button>
          </Link>

          {!currentUser && (
            <div className="mt-6 space-y-2">
              <p className="text-gray-500 text-lg mb-2">You are not signed in.</p>
              <Link to="/signin">
                <Button
                  className="mt-2 text-xl bg-white text-gray-800"
                  variant="outline"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default EmptyCart;
