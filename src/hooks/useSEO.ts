const defaultSEO = {
  title: 'AIJIM | Custom Fashion & Print Products',
  description:
    'Your trusted partner [AIJIM] — From custom T-shirts to fashion drops, we bring your ideas to life with premium quality and fast delivery.',
  keywords: [
    'AIJIM',
    
    'fashion India',
    
    
    'premium streetwear',
    'AIJIM clothing',
    'hoodies',
   
  ],
  url: 'https://aijim.pages.dev',
  image: 'https://aijim.pages.dev/og-image.jpg',
  twitterHandle: '@aijimindia',
};

const routeSEO: Record<string, Partial<typeof defaultSEO>> = {
  '/': {
    title: 'AIJIM | Custom Prints, Fashion, and Personalized Gifts',
    description: 'Explore the latest trends and premium printed products by AIJIM — fashion-forward and quality-driven.',
  },
  '/signin': {
    title: 'Sign In | AIJIM',
    description: 'Access your AIJIM account to track orders, manage your wishlist, and shop faster.',
  },
  '/signup': {
    title: 'Create an Account | AIJIM',
    description: 'Join AIJIM and unlock personalized fashion, print-on-demand products, and exclusive offers.',
  },
  '/cart': {
    title: 'Your Cart | AIJIM',
    description: 'Review your selected AIJIM products and proceed to checkout.',
  },
  '/checkout': {
    title: 'Checkout | AIJIM',
    description: 'Securely complete your order with fast delivery and trusted payment options.',
  },
  '/payment': {
    title: 'Complete Payment | AIJIM',
    description: 'Finalize your AIJIM order using secure payment methods.',
  },
  '/payment-retry/:orderId': {
    title: 'Retry Payment | AIJIM',
    description: 'Retry your order payment and complete your transaction securely.',
  },
  '/products': {
    title: 'Shop All Products | AIJIM',
    description: 'Browse AIJIM’s full collection of clothing, gifts, and custom printed items.',
  },
  '/products/:id': {
    title: 'Category | AIJIM',
    description: 'Explore stylish clothing and custom designs under your selected category.',
  },
  '/product/details/:productId': {
    title: 'Product Details | AIJIM',
    description: 'Check out design, sizing, and features of this AIJIM product before you buy.',
  },
  '/about-us': {
    title: 'About Us | AIJIM',
    description: 'Learn about AIJIM’s journey, mission, and our commitment to high-quality custom fashion.',
  },
  '/contact-us': {
    title: 'Contact Us | AIJIM',
    description: 'Need help? Get in touch with the AIJIM support team for assistance.',
  },
  '/order-complete': {
    title: 'Order Complete | AIJIM',
    description: 'Thank you for your purchase. Your AIJIM order has been placed successfully.',
  },
  '/orders': {
    title: 'Order History | AIJIM',
    description: 'View all your past orders and track your deliveries from AIJIM.',
  },
  '/track-order': {
    title: 'Track Your Order | AIJIM',
    description: 'Track your AIJIM order in real-time using your email or order ID.',
  },
  '/wishlist': {
    title: 'Your Wishlist | AIJIM',
    description: 'Save your favorite AIJIM items to purchase later.',
  },
  '/profile': {
    title: 'Your Profile | AIJIM',
    description: 'Manage your AIJIM profile and personal details.',
  },
  '/account': {
    title: 'Account Settings | AIJIM',
    description: 'Update your shipping address, password, and other account settings.',
  },
  '/reset-password': {
    title: 'Reset Password | AIJIM',
    description: 'Reset your AIJIM account password securely.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | AIJIM',
    description: 'Understand how AIJIM handles your data and privacy.',
  },
  '/terms-conditions': {
    title: 'Terms & Conditions | AIJIM',
    description: 'Review AIJIM’s terms of use and service conditions.',
  },
  '/shipping-delivery': {
    title: 'Shipping & Delivery | AIJIM',
    description: 'Details about shipping methods, timelines, and delivery policies.',
  },
  '/cancellation-refund': {
    title: 'Cancellation & Refund | AIJIM',
    description: 'Learn how to cancel orders and request refunds at AIJIM.',
  },
};

export default function useSEO(path: string = '/', overrides = {}) {
  return {
    ...defaultSEO,
    ...routeSEO[path],
    ...overrides,
  };
}
