import type { Preview } from "@storybook/nextjs-vite";
import { Figtree } from "next/font/google";

import "../src/app/globals.css";

const figtree = Figtree({ variable: "--font-figtree", subsets: ["latin"] });

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disabled: true },
  },
  decorators: [
    (Story) => (
      <div className={`${figtree.variable} bg-background font-sans text-foreground`}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
