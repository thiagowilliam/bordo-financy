import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhotoGallery, type GalleryPhoto } from "./photo-gallery";

const url = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

const lisbon: GalleryPhoto[] = [
  ["1541322841511-e0aed2019f2a", "Bondinho amarelo em uma rua de Lisboa"],
  ["1734812788137-3a9941711a6c", "Vista de telhados e do rio Tejo"],
  ["1570556979680-d06d000d4ceb", "Fachada de azulejos portugueses"],
  ["1693772868211-3d8728176449", "Praça com arcos em Lisboa"],
  ["1622984119798-d39d18c08f4c", "Palácio da Pena em Sintra"],
  ["1729553232361-7030371fcdf6", "Pôr do sol sobre a cidade"],
].map(([id, alt], index) => ({ id, url: url(id), alt, isCover: index === 0 }));

const meta = {
  title: "Organisms/PhotoGallery",
  component: PhotoGallery,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    photos: lisbon,
    canAdd: true,
    onAddFiles: () => {},
    onSetCover: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof PhotoGallery>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { photos: [] } };
export const MaxPhotos: Story = {
  args: {
    canAdd: false,
    photos: Array.from({ length: 10 }, (_, i) => ({
      ...lisbon[i % lisbon.length],
      id: `photo-${i}`,
      isCover: i === 0,
    })),
  },
};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
