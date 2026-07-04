import type { Config } from "@react-router/dev/config";

export default {
  // 静的サイト(GitHub Pages)なので SSR は使わず、全タブを事前レンダリングする
  ssr: false,
  basename: "/semi-tracker/",
  prerender: ["/", "/news", "/themes", "/map", "/learn"],
} satisfies Config;
