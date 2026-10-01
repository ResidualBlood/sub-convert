# SubConvert Frontend

一个零依赖、纯前端的 SubConverter 订阅转换链接生成器。

基于 [Zbuter/sub-convert](https://github.com/Zbuter/sub-convert) 定制。

在线使用：[https://zy.duohao.xyz/](https://zy.duohao.xyz/)

## 功能

- 默认后端：`https://suc.duohao.xyz`
- 支持自定义 SubConverter 后端地址
- 默认远程配置：ResidualBlood/Clash_Rules 的 `Myself/config/Home.ini`
- 支持自定义或关闭远程配置
- 配置预设：Home、Home_NOAD、自定义；两份 Home 配置均含广告及隐私规则，Home_NOAD 显式使用 V6 基础模板
- UDP 默认关闭，可在高级选项中启用
- 高级选项支持“展开规则全文”；取消勾选生成 `expand=false`，使用远程规则引用，实际支持取决于后端及客户端
- 支持多个订阅地址（每行一个）
- 覆盖 Clash、sing-box、Surge、Quantumult、Loon、Surfboard 及节点列表等输出类型
- 实时生成、一键复制或直接打开转换链接
- 配置保存在浏览器 `localStorage`，页面本身不会上传订阅地址

## 本地运行

项目不需要安装依赖。可以直接打开 `index.html`，也可以启动任意静态文件服务器：

```powershell
python -m http.server 4173
```

然后访问 `http://localhost:4173`。

## 部署

运行 `node test.mjs` 验证，然后运行 `node build.mjs`，将 `public/` 部署到 Cloudflare Pages 或其他静态服务器。

部署文件：

- `index.html`
- `styles.css`
- `app.js`
- `_headers`（Cloudflare Pages 安全响应头）

## 注意

前端只负责生成 URL。转换请求由用户复制链接后或点击“打开”时直接发送到所选 SubConverter 后端；后端可用性、CORS 策略和订阅隐私策略由对应服务提供者决定。
