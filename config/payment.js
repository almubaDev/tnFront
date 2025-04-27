export const PAYPAL_CONFIG = {
  clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID || "YOUR_PAYPAL_CLIENT_ID",
  currency: "USD",
  intent: "subscription",
  vault: true
}; 