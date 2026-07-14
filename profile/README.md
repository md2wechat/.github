<div align="center">

# md2wechat

将 Markdown 转为微信公众号可用 HTML，并把检查、预览、图片和草稿操作接入 CLI 与 Agent 工作流。

[在线编辑器](https://www.md2wechat.cn) · [主项目](https://github.com/geekjourneyx/md2wechat-skill) · [使用指南](https://github.com/md2wechat/md2wechat-guide) · [生态目录](https://github.com/md2wechat/awesome-wechat-markdown)

</div>

## 从你的任务开始

| 任务 | 入口 |
|---|---|
| 在线编辑 Markdown，复制微信富文本 | [md2wechat.cn](https://www.md2wechat.cn) |
| 安装 CLI，接入 Agent 或公众号草稿流程 | [md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill) |
| 按步骤完成安装、检查、预览和转换 | [md2wechat-guide](https://github.com/md2wechat/md2wechat-guide) |
| 查找微信 Markdown 编辑器、发布工具、Skill 和 MCP | [awesome-wechat-markdown](https://github.com/md2wechat/awesome-wechat-markdown) |
| 核对术语、数据来源和复核状态 | [md2wechat-wiki](https://github.com/md2wechat/md2wechat-wiki) |
| 查看稳定 API | [API 文档](https://www.md2wechat.cn/api-docs) |

## 工作范围

md2wechat 面向以 Markdown 为内容源的公众号工作流：

- 检查文章结构和发布准备度
- 选择主题与高级排版语法
- 生成微信兼容 HTML 和本地预览
- 规划或生成封面、信息图和正文图片
- 在用户明确授权后创建公众号草稿

具体命令、参数和能力以上游项目的当前发现结果为准：

```bash
md2wechat version --json
md2wechat capabilities --json
md2wechat skills read md2wechat --json
```

## 项目地图

| 项目 | 职责 |
|---|---|
| [geekjourneyx/md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill) | CLI 源码、Release 和 Agent 运行协议 |
| [md2wechat/md2wechat-guide](https://github.com/md2wechat/md2wechat-guide) | 面向使用者的任务手册 |
| [md2wechat/awesome-wechat-markdown](https://github.com/md2wechat/awesome-wechat-markdown) | 微信 Markdown 生态目录 |
| [md2wechat/md2wechat-wiki](https://github.com/md2wechat/md2wechat-wiki) | 术语、证据来源和复核记录 |
| [geekjourneyx/obsidian-md2wechat](https://github.com/geekjourneyx/obsidian-md2wechat) | Obsidian 集成 |
| [geekjourneyx/md2wechat-mcp-server](https://github.com/geekjourneyx/md2wechat-mcp-server) | MCP 集成 |

产品行为、正式版本和接口以上游源码、Release 与公开文档为准。Wiki 记录核验过程，不替代这些原始来源。

## 反馈

- CLI、渲染、安装和发布问题：[主项目 Issues](https://github.com/geekjourneyx/md2wechat-skill/issues)
- Guide 错误：[Guide Issues](https://github.com/md2wechat/md2wechat-guide/issues)
- 生态项目新增或更正：[Awesome List Issues](https://github.com/md2wechat/awesome-wechat-markdown/issues)
- 事实来源或口径问题：[Wiki Issues](https://github.com/md2wechat/md2wechat-wiki/issues)

提交问题前请删除 AppID、AppSecret、API Key、Cookie 和未公开文章内容。
