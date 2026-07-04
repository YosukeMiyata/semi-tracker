import type { ReactNode } from "react";
import { Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration } from "react-router";
import { themesPerf } from "~/lib/data";
import "./app.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>半導体テーマトラッカー 2.0</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-paper pb-[76px] font-sans text-[15px] text-ink leading-[1.65]">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const TABS = [
  { to: "/", icon: "◉", label: "ホーム" },
  { to: "/news", icon: "▤", label: "ニュース" },
  { to: "/themes", icon: "↗", label: "テーマ" },
  { to: "/map", icon: "⬡", label: "マップ" },
  { to: "/learn", icon: "✎", label: "学ぶ" },
];

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-30 flex items-baseline gap-2.5 border-line border-b bg-paper/90 px-[18px] py-3 backdrop-blur-md">
        <div className="font-bold font-serif text-[19px] tracking-[0.02em]">
          半導体テーマトラッカー <em className="text-copper not-italic">2.0</em>
        </div>
        <div className="ml-auto font-mono text-[11px] text-ink-2">
          データ {themesPerf.last_updated} 時点
        </div>
      </header>

      <main className="mx-auto max-w-[640px] px-4 pt-[18px] pb-10">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-[640px] px-[18px] pb-5 text-[10.5px] text-ink-2 leading-[1.7]">
        <b>免責事項</b>
        :本サイトは公開情報の整理・ニュース論調の分析を提供するものであり、金融商品取引法上の投資助言ではありません。感情スコアはニュース記事の論調を機械的に数値化したもので、将来の株価を予測するものではありません。投資判断はご自身の責任でお願いします。
        <br />
        <br />
        データソース:株価=Stooq / Yahoo Finance
        日足(平日自動更新・前営業日確定分)/ニュース=主要メディア(出典リンクを各記事に表示予定)
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-line border-t bg-card px-1 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))]">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 rounded-[10px] px-2.5 py-1 text-[10.5px] ${
                isActive ? "font-bold text-copper" : "text-ink-2"
              }`
            }
          >
            <span className="text-[17px] leading-none">{tab.icon}</span>
            {tab.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : "不明なエラーが発生しました";
  return (
    <main className="mx-auto max-w-[640px] px-4 pt-[18px]">
      <h1 className="mb-2 font-bold font-serif text-[17px]">エラー</h1>
      <p className="text-[13px] text-ink-2">{message}</p>
    </main>
  );
}
