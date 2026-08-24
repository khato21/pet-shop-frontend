export interface Animal {
  id: string;
  name: string;
  priceUSD: number;
  priceGEL: number;
  description: string;
  isPopular: boolean;
  stock: number;
  imageUrl: string;
  createdAt?: string;
}

export interface AnimalApiResponse {
  id: string;
  resource: string;
  data: {
    name: string;
    priceUSD: number;
    priceGEL: number;
    description: string;
    isPopular: boolean;
    stock: number;
    imageUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}
