import type { Animal } from "./animal.interface";

export interface AnimalState {
  animals: Animal[];
  loading: boolean;
  error: string | null;
}
