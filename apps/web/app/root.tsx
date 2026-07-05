import type { ReactNode } from "react";
import { Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration } from "react-router";
import { HomeHeaderMenu, HomeSectionNavBar } from "~/components/home-header-menu";
import { themesPerf } from "~/lib/data";
import "./app.css";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0B0E15" />
        <title>半導体テーマトラッカー</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=IBM+Plex+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-paper pb-[76px] font-sans text-[15px] text-ink leading-[1.65] md:pb-12 md:text-[17px] md:leading-[1.75] lg:text-[18px]">
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

function DesktopNavLink({ to, icon, label, end }: (typeof TABS)[number] & { end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] transition-colors md:px-4 md:py-2.5 md:text-[15px] lg:text-[16px] ${
          isActive
            ? "bg-copper-soft font-bold text-copper"
            : "text-ink-2 hover:bg-panel2/60 hover:text-ink"
        }`
      }
    >
      <span className="text-[15px] leading-none">{icon}</span>
      {label}
    </NavLink>
  );
}

export default function App() {
  return (
    <>
      <header className="sticky top-0 z-30 border-line border-b bg-paper/95 backdrop-blur-md">
        <div className="app-container py-4 md:py-6">
          <div className="flex items-center gap-2.5 md:gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] text-ink-2 tracking-[0.16em] md:text-[12px]">
                SEMICONDUCTOR THEME TRACKER
              </div>
              <h1 className="mt-1.5 font-bold font-serif text-[19px] leading-[1.4] tracking-[0.02em] md:mt-2 md:text-[24px] lg:text-[26px]">
                半導体<span className="text-copper">テーマ</span>トラッカー
              </h1>
              <p className="mt-1 font-mono text-[10px] text-faint sm:hidden">
                {themesPerf.last_updated} 時点
              </p>
            </div>
            <div className="hidden shrink-0 font-mono text-[11px] text-faint sm:block md:text-[13px]">
              {themesPerf.last_updated} 時点
            </div>
            <HomeHeaderMenu />
          </div>
          <nav
            className="-mx-1 mt-3 hidden items-center gap-0.5 overflow-x-auto md:flex [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="メインナビゲーション"
          >
            {TABS.map((tab) => (
              <DesktopNavLink key={tab.to} {...tab} end={tab.to === "/"} />
            ))}
          </nav>
        </div>
        <HomeSectionNavBar />
      </header>

      <main className="app-container pt-[18px] pb-10 md:pt-8 md:pb-16">
        <Outlet />
      </main>

      <footer className="app-container type-body-sm pb-5 md:pb-10">
        <b className="text-ink-2">免責事項</b>
        :本サイトは公開情報の整理・ニュース論調の分析を提供するものであり、金融商品取引法上の投資助言ではありません。感情スコアはニュース記事の論調を機械的に数値化したもので、将来の株価を予測するものではありません。投資判断はご自身の責任でお願いします。
        <br />
        <br />
        データソース:株価=Stooq / Yahoo Finance
        日足(平日自動更新・前営業日確定分)/ヘッドライン=日経・Bloomberg・Reuters・CNBC・WSJ・日刊工業・東洋経済・日経xTECH・ITmedia・EE
        Times Japan・DigiTimes・SemiEngineering・Tom&apos;s
        Hardware(RSS・平日自動)/分析ニュース=手動編集(data/news.json)
      </footer>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex gap-px border-line border-t bg-line pt-px pb-[env(safe-area-inset-bottom)] md:hidden"
        aria-label="メインナビゲーション"
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === "/"}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 bg-paper px-2 py-2.5 text-[11px] ${
                isActive ? "font-bold text-copper" : "text-ink-2"
              }`
            }
          >
            <span className="text-[18px] leading-none">{tab.icon}</span>
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
    <main className="app-container pt-[18px] md:pt-6">
      <h1 className="mb-2 font-bold font-serif text-[17px] md:text-[20px]">エラー</h1>
      <p className="text-[13px] text-ink-2 md:text-[15px]">{message}</p>
    </main>
  );
}
