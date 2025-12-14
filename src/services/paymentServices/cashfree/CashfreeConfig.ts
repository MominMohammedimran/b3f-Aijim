
export interface CashfreeOptions {
  paymentSessionId: string;
  redirectTarget: string;
}

export interface CashfreeResponse {
  orderId: string;
  paymentSessionId: string;
}

export const getCashfreeConfig = () => {
  return {
    environment: 'production' as const
  };
};
