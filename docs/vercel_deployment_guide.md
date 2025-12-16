# Vercelへのデプロイ（公開）完全ガイド

Vercel（バーセル）は、Reactなどのアプリを無料で簡単に公開できるサービスです。
主に**「GitHubと連携する方法（推奨）」**と**「手動でアップロードする方法」**の2つがあります。

---

## 方法1: GitHub連携（推奨・一番楽）
一度設定すれば、Gitでコミット＆プッシュするたびに自動で更新されるようになります。

### 手順
1. **GitHubにリポジトリを作成** (まだの場合)
   * [GitHub](https://github.com/) にログインし、`New repository` から新しいリポジトリを作成します（例: `go-nogo-test`）。
   * 作成画面のコマンドに従い、今のローカルリポジトリをGitHubにプッシュします。
     ```bash
     # 例（ターミナルで実行）
     git remote add origin https://github.com/ユーザー名/リポジトリ名.git
     git push -u origin master
     ```

2. **VercelでNew Projectを作成**
   * [Vercel Dashboard](https://vercel.com/dashboard) にアクセスします。
   * **[Add New...]** -> **[Project]** をクリック。
   * **[Import Git Repository]** で GitHub を選択し、先ほどのリポジトリをImportします。

3. **設定とDeploy**
   * プロジェクト名などはそのままでOK。
   * **Framework Preset** が `Vite` になっていることを確認。
   * **[Deploy]** ボタンをクリック。

4. **完了**
   * 1分ほどでビルドが終わり、URL（例: `https://go-nogo-test.vercel.app`）が発行されます。

---

## 方法2: コマンドラインから手動デプロイ（GitHub不要）
GitHubを使わずに、今のPCにある状態を直接Vercelにアップロードします。

### 手順
1. **Vercel CLIのインストール**
   ターミナルで以下のコマンドを実行します。
   ```bash
   npm i -g vercel
   ```

2. **デプロイの実行**
   プロジェクトフォルダで以下のコマンドを実行します。
   ```bash
   vercel
   ```

3. **対話形式の設定**
   これだけで公開作業が始まります。いくつかの質問には基本的に `Enter`（Yes/デフォルト）を押すだけでOKです。
   * `Set up and deploy?` -> **y**
   * `Which scope?` -> (自分のアカウントを選択してEnter)
   * `Link to existing project?` -> **n** (初めての場合)
   * `Project name?` -> (そのままEnter)
   * `Directory?` -> (そのままEnter)
   * `Want to modify settings?` -> **n**

4. **完了**
   * 処理が終わると `Production: https://...` というURLが表示されます。これが公開URLです。

---

### 補足
* **更新したいとき**:
  * **方法1**の場合: コードを修正して `git push` するだけ。
  * **方法2**の場合: 再度 `vercel --prod` コマンドを実行します。
