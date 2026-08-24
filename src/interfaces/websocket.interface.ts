export type WebSocketAction = "CREATE" | "UPDATE" | "DELETE";

export interface ResourceChangedMessage {
  type: "RESOURCE_CHANGED";

  source: "ADMIN" | "SHOP";

  action: WebSocketAction;

  resource: string;

  id?: string;
}

export interface AnimalChangedMessage {
  type: "ANIMAL_CHANGED";

  action: WebSocketAction;

  id?: string;
}

export interface AnimalsChangedMessage {
  type: "ANIMALS_CHANGED";

  action: WebSocketAction;

  id?: string;
}

export interface AnimalUpdatedMessage {
  type: "ANIMAL_UPDATED";

  animalId: string;

  stock: number;
}

export interface ConnectedMessage {
  type: "CONNECTED";

  message: string;
}

export type WebSocketMessage =
  | ResourceChangedMessage
  | AnimalChangedMessage
  | AnimalsChangedMessage
  | AnimalUpdatedMessage
  | ConnectedMessage;
