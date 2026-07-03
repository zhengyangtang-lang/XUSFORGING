# XUS Forging BOM Tool V52 - OpenRouter 免费AI识别版

本版本基于 V48/V51 页面结构，保留 BOM、工艺路线、Capacity Study、工艺数据库维护逻辑。

核心变化：
- 锻造 PDF/图片、机加工 PDF/图片优先走 AI 识别。
- 默认推荐 OpenRouter Free Router：`openrouter/free`。
- PDF 会先在浏览器端转成页面图片，再提交给后端 AI 接口，因此截图式 PDF 也能识别。
- 识别结果不入库；工艺数据库仍可本地/云端按原逻辑维护。

## Netlify 环境变量

推荐配置：

```text
OPENROUTER_API_KEY = 你的 OpenRouter API Key
AI_PROVIDER = openrouter
OPENROUTER_MODEL = openrouter/free
```

可选备用 Gemini：

```text
GEMINI_API_KEY = 你的 Gemini API Key
AI_PROVIDER = gemini
GEMINI_MODEL = gemini-2.5-flash
```

如果继续使用云端工艺数据库保存功能，保留：

```text
ADMIN_PASSWORD = 你的管理员密码
```

设置环境变量后，需要在 Netlify 中重新部署。

## GitHub 更新方式

把本文件夹内的内容上传覆盖到 GitHub 仓库根目录：

```text
index.html
package.json
netlify.toml
README.md
netlify/
```

确认根目录有：

```text
netlify/functions/ai-recognize.mjs
netlify/functions/get-process-db.mjs
netlify/functions/save-process-db.mjs
```
