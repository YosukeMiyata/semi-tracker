import { Placeholder, SectionTitle } from "~/components/section";

export function meta() {
  return [{ title: "学ぶ — 半導体テーマトラッカー 2.0" }];
}

export default function Learn() {
  return (
    <>
      <SectionTitle title="用語辞典" note="「なぜ株価に効くのか」まで解説する投資家向け辞典" />
      <Placeholder>
        data/glossary.json(静的)から HBM / CoWoS / EUV / 2nm / NAND
        などの用語を「なぜ株価に効くか」付きで表示します。
      </Placeholder>
    </>
  );
}
