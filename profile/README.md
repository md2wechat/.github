<div align="center">

# md2wechat

md2wechat 是面向 AI Agent 的微信公众号创作与发布 CLI。

把 Markdown 变成适合微信公众号的内容：你可以在线排版，也可以用 CLI 或 Skill 在自己的工作流中完成检查、预览、转换，以及在授权后创建草稿。

[在线编辑器](https://www.md2wechat.cn) · [CLI / Skill](https://github.com/geekjourneyx/md2wechat-skill) · [使用指南](https://github.com/md2wechat/md2wechat-guide) · [最新版本](https://github.com/geekjourneyx/md2wechat-skill/releases/latest)

</div>

## 选择使用方式

| 你想做什么 | 从这里开始 |
|---|---|
| 在线编辑 Markdown、预览并复制微信富文本 | [在线编辑器](https://www.md2wechat.cn) |
| 在本地工作流中处理公众号内容 | [md2wechat CLI / Skill](https://github.com/geekjourneyx/md2wechat-skill) |
| 将 Markdown 转为微信兼容 HTML | [Convert API](https://www.md2wechat.cn/api-docs)：只转换 HTML，不创建草稿 |
| 上传素材并创建公众号草稿 | [Publishing API](https://md2wechat.com/api/v1)：创建草稿不等于群发 |
| 根据产品资料准备介绍或百科式文章 | [定向写作指引](https://github.com/geekjourneyx/md2wechat-skill/blob/v3.7.0/docs/WRITING.md)：由 Agent 阅读指引后撰稿 |
| 保存到知乎、CSDN、头条或腾讯云开发者社区草稿 | [多平台草稿说明](https://github.com/geekjourneyx/md2wechat-skill/blob/v3.7.0/docs/SYNC.md)：在已登录账号中保存并重新打开核对 |

## 第一次使用

想先看看排版效果，可直接打开[在线编辑器](https://www.md2wechat.cn)，粘贴 Markdown 后预览并复制内容。

想把流程放进本地项目或日常写作工具，请从 [CLI / Skill](https://github.com/geekjourneyx/md2wechat-skill) 开始，再按 [Guide](https://github.com/md2wechat/md2wechat-guide) 的步骤安装和使用。

## 最近更新

[v3.7.0（2026-09-23）](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.7.0)增加了产品介绍和百科式文章的写作指引，以及腾讯云开发者社区未发布草稿流程。写作由 Agent 读取内置指引完成，无需新的写作命令；指定搜索产品不保证收录或引用，百科词条只准备草稿。腾讯云目前验证了短结构正文与单图的保存重开，长文、多图和草稿列表恢复仍待验证。

[v3.6.0](https://github.com/geekjourneyx/md2wechat-skill/releases/tag/v3.6.0)增加了知乎、CSDN、头条的未发布草稿流程。CLI 先在本地准备文章，后续由具备浏览器能力的 Agent 在你已登录的账号中操作；本地准备成功不代表远端草稿已保存。以上流程均不包含公开发布。后续版本以[最新 Release](https://github.com/geekjourneyx/md2wechat-skill/releases/latest)为准。

## 在 AI 工具中使用

能够运行本地命令的 AI 工具，可以通过 md2wechat 的 [Skill / CLI](https://github.com/geekjourneyx/md2wechat-skill) 接入内容工作流。先在 Agent 实际执行命令的环境安装，再阅读当前版本的操作说明；安装步骤见 [Guide](https://github.com/md2wechat/md2wechat-guide)。[Wiki](https://github.com/md2wechat/md2wechat-wiki)记录版本事实和平台验证进度。通用安装路径不代表每个办公 Agent 都已完成实际运行验证。

## 文档与生态

- [Guide](https://github.com/md2wechat/md2wechat-guide)：安装、排版、预览和发布的分步说明
- [md2wechat Templates](https://github.com/md2wechat/md2wechat-templates)：可复用的内容骨架
- [Awesome](https://github.com/md2wechat/awesome-wechat-markdown)：微信 Markdown、发布、Skill 和 MCP 工具目录
- [Wiki](https://github.com/md2wechat/md2wechat-wiki)：版本事实、术语与使用记录

## 反馈

- CLI、渲染、安装和发布问题：[主项目 Issues](https://github.com/geekjourneyx/md2wechat-skill/issues)
- 教程错误：[Guide Issues](https://github.com/md2wechat/md2wechat-guide/issues)
- 生态项目新增或更正：[Awesome Issues](https://github.com/md2wechat/awesome-wechat-markdown/issues)
- 版本或术语问题：[Wiki Issues](https://github.com/md2wechat/md2wechat-wiki/issues)

请勿在 Issue 中粘贴 AppID、AppSecret、API Key、Cookie、草稿 ID 或未公开文章内容。
