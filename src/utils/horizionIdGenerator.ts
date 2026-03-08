// src/utils/horizionIdGenerator.ts
export const generateHorizionID = (): string => {
  const segment = () => Math.random().toString(36).substring(2, 6).toUpperCase();
  return `HZ-${segment()}-${segment()}-${segment()}`;
};