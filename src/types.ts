export type RGB = { r: number; g: number; b: number };

export type NeuralOptions = {
  baseColor?: string | RGB;       // hex "#rrggbb" или RGB
  speed?: number;                 // по умолчанию 1.0
  scale?: number;                 // по умолчанию 1.0
  pointer?: boolean;              // трекать курсор, по умолчанию true
  scrollReactive?: boolean;       // реагировать на скролл, по умолчанию true
};

export type NeuralController = {
  start(): void;
  stop(): void;
  resize(): void;
  setColor(color: string | RGB): void;
  setSpeed(speed: number): void;
  setScale(scale: number): void;
  destroy(): void;
};
