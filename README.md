# Hugo Blog Commands

## 主题：PaperMod + Dracula 代码高亮

- 首次安装 PaperMod（只需一次）  
  `./scripts/install-papermod.sh`

- 代码高亮在 `config.toml` 的 `[markup.highlight]` 中已设为 `style = "dracula"`（深色）
- 已移除 Jane 的 Prism 配置，避免和 Hugo Chroma 冲突

## 常用本地命令

- 启动本地开发服务  
  `hugo server -D`

- 构建静态文件到 `public/`  
  `hugo`

- 清理后重新构建  
  `rm -rf public && hugo`

## 生产构建（自定义域名）

- 使用生产配置构建（保留本地 `config.toml`）  
  `hugo --environment production --config config.toml,config.production.toml`

- 说明  
  `config.production.toml` 中设置生产域名：`baseURL = "https://your-domain.com/"`

## 部署命令（手动发布到 GitHub Pages 仓库）

- 首次设置远程仓库（只需一次）  
  `cd public && git remote add origin https://github.com/hyyfrank/hyyfrank.github.io.git`

- 常规发布流程  
  `hugo --environment production --config config.toml,config.production.toml`  
  `cd public`  
  `git add .`  
  `git commit -m "deploy: update site"`  
  `git push origin master`

## 一键发布脚本（推荐）

- 固定发布到 `gh-pages` 分支  
  `./scripts/deploy-pages.sh`

## GitHub Pages 分支说明（现在的规则）

- `gh-pages` 仍然可用，而且是很多项目站点常用方式。
- 也可以从 `main` 或 `master` 发布（在仓库 Settings -> Pages 里可选）。
- 本项目脚本已固定推送到 `gh-pages`。
- 请在 GitHub Settings -> Pages 中把 Source 分支设置为 `gh-pages`（通常目录为 `/ (root)`）。
