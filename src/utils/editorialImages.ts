import type { NewsTopic } from '../types/news.ts';

export const CATEGORY_IMAGE_MAP: Record<NewsTopic, string> = {
  World: '/src/assets/images/editorial_newsroom_lead_1795542572423.jpg',
  Technology: '/src/assets/images/editorial_tech_grid_1795542554907.jpg',
  Finance: '/src/assets/images/editorial_finance_hub_1795542556051.jpg',
  Climate: '/src/assets/images/editorial_climate_science_1795542556042.jpg',
  Science: '/src/assets/images/editorial_climate_science_1795542556042.jpg',
  Policy: '/src/assets/images/editorial_diplomacy_summit_1795542555929.jpg',
};

const ALL_EDITORIAL_IMAGES = [
  '/src/assets/images/editorial_newsroom_lead_1795542572423.jpg',
  '/src/assets/images/editorial_tech_grid_1795542554907.jpg',
  '/src/assets/images/editorial_finance_hub_1795542556051.jpg',
  '/src/assets/images/editorial_climate_science_1795542556042.jpg',
  '/src/assets/images/editorial_diplomacy_summit_1795542555929.jpg',
];

export function getEditorialImageForTopic(topic: NewsTopic, slotOffset = 0): string {
  const primary = CATEGORY_IMAGE_MAP[topic] ?? ALL_EDITORIAL_IMAGES[0];
  if (slotOffset <= 0) {
    return primary;
  }
  const primaryIndex = ALL_EDITORIAL_IMAGES.indexOf(primary);
  const nextIndex = (Math.max(0, primaryIndex) + slotOffset) % ALL_EDITORIAL_IMAGES.length;
  return ALL_EDITORIAL_IMAGES[nextIndex];
}
