export interface Sale {
  animalId: string;
  quantity: number;
}

export interface SaleApiResponse {
  id: string;
  resource: string;
  data: {
    animalId: string;
    quantity: number;
  };
  createdAt: string;
  updatedAt: string;
}
