# サイトの更新

公開先: https://kannan-xiao4.github.io/kannan-xiao4/

`main`へのpushでGitHub Actionsが静的HTMLを生成し、GitHub Pagesに公開します。Pull Requestではビルドとリンク検証のみを実行します。

## 経歴・制作物・考え方を更新する

経歴と考え方は`docs/career.md`、`docs/approach.md`を編集してください。個人制作は`site/projects.json`で管理します。`npm run build`で日付の降順に並べた`docs/personal-projects.md`を生成するため、このMarkdownを直接編集すると上書きされます。同じMarkdownからWebページを生成するので、GitHub向けとWeb向けに本文を二重管理する必要はありません。Markdown内の相対リンクは生成時にWeb用のURLへ変換されます。

トップページの紹介文や構成は`scripts/build.mjs`、色やレイアウトは`site/assets/style.css`で編集できます。外部リンクは`site/config.json`の`links`で管理します。

デザインは白地・青いリンク・システムのゴシック体を基本にしています。プロフィール画像とファビコンは、GitHubの公開プロフィール画像を保存した`site/assets/avatar.png`を使用します。GitHub側で画像を変更した場合は、このファイルも差し替えてください。

全ページで上部の横並びヘッダーを共通で使用します。トップページのイラストは`site/assets/torimaru-hero.png`です。ユーザー提供のとりまるの画像をもとに生成し、プロンプトは`design/torimaru-hero.md`に保存しています。トップページの個人制作には、`site/projects.json`の新しいものを4件表示します。画像は`site/assets/games/`に保存し、`image`で指定してください。現在のゲーム画像はunityroom公開ページのカバー画像を使い、取得元は`imageSource`に記録しています。画像は外部サイトから毎回読み込まず、サイトと一緒に配信します。

## 制作物とソーシャルリンク

`site/projects.json`には、タイトル・説明・カテゴリ・日付・GitHub URL・ゲームURLを保存します。GitHubの作成日を日本時間に変換した`date`を基本とし、unityroom投稿日を使う作品には`dateSource`で明記します。公開リポジトリを新しく追加したら、このファイルにも追記してください。ビルド時にGitHubから自動取得はしません。

GitHub・X・LinkedInのURLは`site/config.json`の`links`、アイコンの対応は`socials`で管理します。GitHub・X・LinkedInは公式配布のブランドアイコン、RSSはMaterial Symbolsのフィード記号を使います。ヘッダー・フッターとブログのRSSリンクはアイコンだけを表示し、`aria-label`と`title`でリンク名を付けています。各素材の取得元は`site/assets/icons/NOTICE.md`、RSS記号のライセンスは同ディレクトリの`LICENSE.txt`を参照してください。

## ブログの記事を追加する

`posts/2026-11-02-example.md`のように、日付と英数字・ハイフンの名前を付けたMarkdownを追加してください。ファイル名が記事のURLになります。先頭に以下のメタデータを記入します。値を引用符で囲む必要はありません。

```markdown
---
title: 記事のタイトル
date: 2026-11-02
category: 開発メモ
description: 記事の内容を紹介する短い説明。
---

本文をMarkdownで書きます。

## 見出し

コードブロック、表、箇条書き、リンクが使えます。
```

一覧、トップページの新着記事、RSS、サイトマップに自動で追加されます。`date`は日本時間での公開日です。未来の日付の記事はその日以降のビルドで表示されます。定時実行はないため、予約投稿する場合は公開日以降にActionsの「Publish portfolio」を手動実行してください。

最初の記事は、既存の`docs/approach.md`の文章を抜粋してまとめたものです。

## 読書記録を更新する

`docs/reading.md`を編集すると、独立ページの`docs/reading.html`に反映されます。ヘッダー・ホーム・READMEから参照でき、ブログの記事一覧やRSSには入りません。

公開するのは書名、状態、年単位の時期、公開用に整理した感想です。私的な原文や元データをリポジトリに追加せず、知人の名前、職場・生活上の出来事、内部リンク、書籍のネタバレを本文と差分から確認してください。感想のない本に感想を補ったり、未確認の状態を読了に変えたりしません。記録時点の状態と現在の状態、記録の年と読了日も区別します。

## ローカルで確認する

Node.js 22以上を使用します。

```sh
npm ci
npm run build
npm run check
npm run preview
```

http://127.0.0.1:4173/kannan-xiao4/ を開いてください。編集後は再度`npm run build`を実行するとプレビューに反映されます。`npm run check`で内部リンク・ページ内の目次・画像やCSSの参照先を検証します。

## 公開設定

GitHubのSettings → Pages → Build and deployment → Sourceは「GitHub Actions」を使用します。ワークフローは`.github/workflows/pages.yml`です。生成された`dist/`はコミットしません。

公開URLを変更する場合は`site/config.json`の`origin`（ホスト名まで）と`basePath`（リポジトリ名のパス）を更新します。例えば、ユーザーサイト用の`kannan-xiao4.github.io`リポジトリでは`basePath`を空文字にします。

仕組み: [GitHub Pagesのカスタムワークフロー](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
