import type { Animal, AnimalApiResponse } from "../interfaces/animal.interface";

import { get, getById } from "./apiClient";

const ANIMALS_URL = "animals";

const mapAnimal = (animal: AnimalApiResponse): Animal => ({
  id: animal.id,
  name: animal.data.name,
  priceUSD: animal.data.priceUSD,
  priceGEL: animal.data.priceGEL,
  description: animal.data.description,
  isPopular: animal.data.isPopular,
  stock: animal.data.stock,
  imageUrl: animal.data.imageUrl,
  createdAt: animal.createdAt,
});

export const getAnimals = async (): Promise<Animal[]> => {
  const response = await get<AnimalApiResponse[]>(ANIMALS_URL);

  return response.map(mapAnimal);
};

export const getAnimalById = async (id: string): Promise<Animal> => {
  const response = await getById<AnimalApiResponse>(ANIMALS_URL, id);

  return mapAnimal(response);
};
