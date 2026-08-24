import { createAsyncThunk } from "@reduxjs/toolkit";

import type {
  Animal,
  AnimalApiResponse,
} from "../../interfaces/animal.interface";

import { get, getById, update } from "../../services/apiClient";

import type { RootState } from "../index";

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
});

export const getAnimals = createAsyncThunk<
  Animal[],
  boolean | undefined,
  {
    state: RootState;
  }
>(
  "animals/getAnimals",
  async () => {
    const response = await get<AnimalApiResponse[]>(ANIMALS_URL);

    return [...response]
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      .map(mapAnimal);
  },
  {
    condition: (forceRefresh = false, { getState }) => {
      const { animals } = getState();

      if (animals.loading) {
        return false;
      }

      if (!forceRefresh && animals.animals.length > 0) {
        return false;
      }

      return true;
    },
  },
);

export const getAnimalById = createAsyncThunk<Animal, string>(
  "animals/getAnimalById",
  async (id) => {
    const response = await getById<AnimalApiResponse>(ANIMALS_URL, id);

    return mapAnimal(response);
  },
);

export const updateAnimal = createAsyncThunk<
  Animal,
  {
    id: string;
    animal: Omit<Animal, "id">;
  }
>("animals/updateAnimal", async ({ id, animal }) => {
  await update<AnimalApiResponse, Omit<Animal, "id">>(ANIMALS_URL, id, animal);

  return {
    id,
    ...animal,
  };
});
