# サイトの更新

公開先: https://kannan-xiao4.github.io/kannan-xiao4/

`main`へのpushでGitHub Actionsが静的HTMLを生成し、GitHub Pagesに公開します。Pull Requestではビルドとリンク検証のみを実行します。

## 経歴・制作物・考え方を更新する

既存の`docs/career.md`、`docs/personal-projects.md`、`docs/approach.md`を編集してください。同じMarkdownからWebページを生成するので、GitHub向けとWeb向けに本文を二重管理する必要はありません。Markdown内の相対リンクは生成時にWeb用のURLへ変換されます。

トップページの紹介文や構成は`scripts/build.mjs`、色やレイアウトは`site/assets/style.css`で編集できます。外部リンクは`site/config.json`の`links`で管理します。

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
