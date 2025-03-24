
// Plan configuration for available subscription plans
export interface PlanConfig {
  name: string;
  description: string;
  features: string[];
  price: number; // in pence (GBP)
}

export interface ProductConfig {
  [key: string]: PlanConfig;
}

// Configure available plans
export const productConfig: ProductConfig = {
  growth: {
    name: "Growth Plan",
    description: "Up to 500 subscribers with basic recovery and churn prediction",
    features: ["Up to 500 subscribers", "Basic recovery", "Churn prediction", "Email notifications", "Standard support"],
    price: 4900, // £49 in pence
  },
  scale: {
    name: "Scale Plan",
    description: "Up to 2,000 subscribers with advanced recovery and AI churn prevention",
    features: ["Up to 2,000 subscribers", "Advanced recovery", "AI churn prevention", "Win-back campaigns", "Priority support"],
    price: 9900, // £99 in pence
  },
  pro: {
    name: "Pro Plan",
    description: "Unlimited subscribers with enterprise features and dedicated support",
    features: ["Unlimited subscribers", "Enterprise features", "Custom retention workflows", "Dedicated account manager", "24/7 premium support"],
    price: 19900, // £199 in pence
  }
};
