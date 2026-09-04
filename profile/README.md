<div align="center">

# md2wechat

面向 AI Agent 的微信公众号创作与发布 CLI，也是连接 Markdown、公众号排版、图片、预览校验和草稿流程的开放生态。

[在线编辑器](https://www.md2wechat.cn) · [CLI / Skill](https://github.com/geekjourneyx/md2wechat-skill) · [使用指南](https://github.com/md2wechat/md2wechat-guide) · [可执行模板](https://github.com/md2wechat/md2wechat-templates)

</div>

## 按任务选择入口

| 你要完成的任务 | 推荐入口 | 边界 |
|---|---|---|
| 在线编辑 Markdown 并复制微信富文本 | [在线编辑器](https://www.md2wechat.cn) | 人工编辑、预览和复制 |
| 在 Codex、Claude Code 等 Agent 中完成公众号工作流 | [md2wechat CLI / Skill](https://github.com/geekjourneyx/md2wechat-skill) | 核心产品与 Agent 运行协议 |
| 将 Markdown 转成微信兼容 HTML | [Convert API](https://www.md2wechat.cn/api-docs) | 只转换内容，不创建公众号草稿 |
| 接入素材与公众号草稿服务 | [Publishing API](https://md2wechat.com/api/v1) | 涉及外部写操作，需要凭证和用户确认 |
| 按步骤完成安装、发现、检查、预览和发布 | [Guide](https://github.com/md2wechat/md2wechat-guide) | 稳定任务教程 |
| 复用企业办公与创作者内容骨架 | [md2wechat Templates](https://github.com/md2wechat/md2wechat-templates) | 可验证的 Markdown 模板 |
| 查找微信 Markdown、发布、Skill 和 MCP 工具 | [Awesome](https://github.com/md2wechat/awesome-wechat-markdown) | 中立生态目录 |
| 核对版本事实、术语和平台证据 | [Wiki](https://github.com/md2wechat/md2wechat-wiki) | 事实来源与复核记录 |

## 最短可验证路径

具体命令、主题和 Layout 能力以当前安装版本的 Discovery 输出为准：

```bash
md2wechat version --json
md2wechat capabilities --json
md2wechat skills read md2wechat --json
```

推荐流程：安装 → Discovery → 结构检查 → 排版 → 本地/API 预览 → 用户确认后的草稿操作。创建草稿不等于群发。

## 产品关系

- **CLI / Skill**：Agent 原生的公众号创作与发布入口。
- **在线编辑器**：适合人工编辑、实时预览和复制 HTML。
- **Convert API**：`POST https://www.md2wechat.cn/api/convert`，负责 Markdown 到微信兼容 HTML 的转换。
- **Publishing API**：`https://md2wechat.com/api/v1`，负责需要授权的素材和草稿副作用服务。

## 平台兼容性

办公 Agent 和技能市场变化很快。平台是否可安装、是否完成真实 smoke、是否能创建草稿，必须分开记录；组织主页不直接宣布未经复核的支持关系。查看 [Wiki 的状态与证据](https://github.com/md2wechat/md2wechat-wiki/tree/main/evidence)。

## 参与维护

- CLI、渲染、安装和发布问题：[主项目 Issues](https://github.com/geekjourneyx/md2wechat-skill/issues)
- 教程错误：[Guide Issues](https://github.com/md2wechat/md2wechat-guide/issues)
- 生态项目新增或更正：[Awesome Issues](https://github.com/md2wechat/awesome-wechat-markdown/issues)
- 版本、术语或证据问题：[Wiki Issues](https://github.com/md2wechat/md2wechat-wiki/issues)

提交问题前请删除 AppID、AppSecret、API Key、Cookie、草稿 ID 和未公开文章内容。
