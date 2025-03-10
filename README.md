# ICSS/SPT 2025 タイムテーブルビューア

> [!NOTE]
> 🔗 **公開URL**: <https://kawayama.github.io/icss-2025-website/>

![image](./docs/website.png)

## プロジェクト概要

このプロジェクトは、[電子情報通信学会（IEICE）の研究会プログラム](https://ken.ieice.org/ken/program/index.php?tgs_regid=7d40e0d1fbc823c402c27c393bae23134140f3b86336e69dc2ce7ec212b50b80&update=1)をより見やすく、使いやすくするためのウェブアプリケーションです。特にICSS（情報通信システムセキュリティ研究会）とSPT（セキュリティ基礎研究会）の2025年会議向けに最適化されています。

## 主な機能

- **直感的なタイムテーブル表示**: 日付・会場別に分かりやすくセッションを表示
- **セッション選択機能**: 参加したいセッションを選択して保存
- **スケジュールの永続化**: 選択したセッションはブラウザのローカルストレージに自動保存
- **スケジュールのエクスポート**: 選択したセッションを整形された形式でクリップボードにコピー可能
- **レスポンシブデザイン**: スマートフォンからPCまで様々なデバイスで快適に閲覧可能
- **セッション詳細へのリンク**: 各セッションの詳細情報へ簡単にアクセス

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全なJavaScript
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [Heroicons](https://heroicons.com/) - SVGアイコンセット

## 使用方法

1. タイムテーブルから参加したいセッションをクリックして選択
2. 選択したセッションは青色でハイライト表示
3. 「選択した公演をコピー」ボタンをクリックして予定をエクスポート
4. セッションカード内の詳細リンクから公式ページへアクセス可能

## 開発環境のセットアップ

```bash
# パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
```

[http://localhost:3000](http://localhost:3000)をブラウザで開いてアプリケーションを確認できます。

## デプロイ

このアプリケーションは[Vercel](https://vercel.com)へのデプロイを推奨します：

```bash
npm run build
npm run start
```

または、Vercelプラットフォームを使用して直接デプロイすることもできます。

## 謝辞

このプロジェクトは電子情報通信学会の研究会プログラムを元に、より使いやすいインターフェースを提供することを目的として作られました。オリジナルコンテンツの著作権は電子情報通信学会に帰属します。
