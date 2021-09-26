# Lofter Memory

将 Lofter 乐乎上喜欢的博文缓存到本地。

## 用法

1. 克隆仓库 `git clone https://github.com/lightyears1998/lofter-memory`
2. 在浏览器的 UserScript Manager （如 ViolentMonkey）中安装 `browser/lofter.user.js` 用户脚本
3. 安装依赖 `yarn install`
4. 运行服务 `node host/index.js`
5. 浏览 Lofter 的喜欢页面 <https://www.lofter.com/like>

> 博文将被缓存到 `$CWD/var` 路径下。

## TODO

- 更友善的 README
- 保存更多 Meta 信息

----

## 技术栈

- UserScript (ViolentMonkey Script)
- Node.js ESM (JavaScript)
- express.js, got.js, lowdb.js

> 本项目是原生 JavaScript 开发的一次尝试，暂无使用 TypeScript 的计划。
