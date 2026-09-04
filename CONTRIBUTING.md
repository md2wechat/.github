# 参与 md2wechat 文档与生态维护

先选择问题所属项目。一个 Pull Request 只处理一个仓库中的一类可回滚问题。

| 修改内容 | 提交位置 |
|---|---|
| CLI 行为、渲染、安装脚本、Release | [geekjourneyx/md2wechat-skill](https://github.com/geekjourneyx/md2wechat-skill) |
| 使用步骤、命令示例、故障说明 | [md2wechat-guide](https://github.com/md2wechat/md2wechat-guide) |
| 生态项目收录、状态或证据 | [awesome-wechat-markdown](https://github.com/md2wechat/awesome-wechat-markdown) |
| 术语、事实来源、核验状态 | [md2wechat-wiki](https://github.com/md2wechat/md2wechat-wiki) |
| 产品角色、Canonical URL、组织主页 | [md2wechat/.github](https://github.com/md2wechat/.github) |

## 三类权威事实

- 运行时能力来自 `geekjourneyx/md2wechat-skill` 的 Release、精确 tag 和 JSON Discovery。
- 产品角色与 URL 来自 [`facts/product-routes.json`](facts/product-routes.json)。
- 平台兼容状态将在 Wiki 的 `evidence/agent-platforms.json` 合并后受其约束；在此之前，不能根据安装格式或搜索摘要自行宣布支持。

消费这些事实的仓库必须保存 `.md2wechat/ecosystem-facts.lock.json`，锁定三个来源的 40 位 commit SHA。更新 lock 时，在 PR 中列出旧 SHA、新 SHA、上游链接和受影响的公开声明。自动化只能更新明确标记的机器事实块，不能自动重写解释性正文或合并 PR。

## 提交事实更正

请附上：

1. 原始来源链接，例如源码、Release、正式文档或可复现输出。
2. 使用的版本、tag 或 commit。
3. 核验日期。
4. 受影响的页面。
5. 如果涉及外部项目，说明你与该项目的关系。

搜索摘要、转述文章和模型回答不能单独作为事实来源。Convert API 只负责 Markdown 到微信兼容 HTML 的转换；Publishing API 才包含素材和草稿副作用。平台记录超过复核期后必须降级，不能继续宣传为已支持。

## 本仓库验证

```bash
node --test tests/*.test.mjs
node scripts/validate-facts.mjs
git diff --check
```

## 文风与安全

- 直接说明行为、条件和结果。
- 对比内容写明测试条件和局限。
- 不使用无证据评分、排名或用户数量。
- 不添加固定推广段落。
- 不公开任何凭证、Cookie、草稿 ID 或未发布内容。
