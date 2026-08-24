export interface Category {
  id: string;
  title: string;
  description: string;
}

export interface CategoryApiResponse {
  id: string;
  resource: string;
  data: {
    title: string;
    description: string;
  };
  createdAt: string;
  updatedAt: string;
}
