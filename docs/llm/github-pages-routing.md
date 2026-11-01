# GitHub Pagesの公開URLについての判断

記録日: 2026-11-01（日本時間）

## 現在の判断

当面は現在の構成を維持する。ルートURLへの移行は保留。

- リポジトリ: `kannan-xiao4/kannan-xiao4`
- サイト: https://kannan-xiao4.github.io/kannan-xiao4/
- GitHubプロフィールにも、このリポジトリのREADMEを表示する。
- `site/config.json`の`basePath`は`/kannan-xiao4`のまま。
- `kannan-xiao4.github.io`リポジトリの作成、既存リポジトリの改名、公開設定の変更は行っていない。

ユーザーが再び希望するまでは、移行やリポジトリ作成を進めない。この記録は実施指示ではなく、後から検討を再開するためのメモ。

## 検討した内容

希望したURLは https://kannan-xiao4.github.io/ 。GitHub PagesでこのルートURLにサイトを公開するには、`kannan-xiao4.github.io`という名前のリポジトリが必要になる。現在のリポジトリ名を維持したまま、Pagesの設定だけでルートURLへ変更することはできない。

現在のリポジトリを`kannan-xiao4.github.io`へ改名する方法もあるが、ユーザー名と同名のリポジトリではなくなるため、現在のREADMEをGitHubプロフィールに表示する役割を失う。この点を踏まえて、改名は採用していない。

### 選択肢1: 入口だけ転送する

`kannan-xiao4.github.io`リポジトリに転送用ページを置き、現在のサイトへ自動転送する。

- サイト本体とGitHubプロフィールは現在の構成を維持できる。
- 共有する入口はルートURLにできる。
- 転送後のアドレス欄は`/kannan-xiao4/`になる。ルートURLでサイト本体を配信する方法とは異なる。

### 選択肢2: プロフィール用とサイト公開用を分ける

同じ作業フォルダ内に、2つの独立したリポジトリを並べて管理する構成を検討した。

```text
作業フォルダ/
├── kannan-xiao4/            # GitHubプロフィール用
└── kannan-xiao4.github.io/  # Webサイト公開用
```

- プロフィールREADMEの表示と、ルートURLでのサイト公開を両立できる。
- Gitのコミット・pushは各リポジトリで別々になる。
- Markdownの正本をプロフィール側に置き、サイトのビルド時に取り込めば、本文の二重管理を避けられる。
- 片方の更新で他方が自動更新されるわけではない。取り込み方法・ビルドの起動方法・必要な権限は、実施時に別途設計する。

## 再開するときに確認すること

1. 短い入口URLだけが必要か、アドレス欄もルートURLに維持したいかを確認する。
2. `kannan-xiao4.github.io`リポジトリが、その時点で存在するか再確認する。
3. GitHubプロフィール用の`kannan-xiao4`リポジトリを維持する。
4. サイト本体を移す場合は、`basePath`、内部リンク、canonical、RSS、サイトマップ、更新手順と旧URLの扱いをまとめて見直す。

## 参考

- [GitHub Pagesのサイト種別とリポジトリ名・公開URL](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [現在のサイトの更新手順](../../SITE.md)
