# V54 AI Only 调试版 + 棒料规则修正

本版本基于 V53：
- 保留 V53 棒料规则：外购棒/挤压棒不受内铸长棒直径与长棒长度限制；内铸棒小于最小档按最小长棒计算并提示扒皮量过大；大于最大档报错。
- 锻造和机加工识别强制走 Netlify Function `/ .netlify/functions/ai-recognize`。
- AI失败时不再回退 OCR，避免误以为AI已调用。
- 识别成功状态栏会显示 Provider 和 Model，例如 `Provider: openrouter | Model: openrouter/free`。

Netlify 环境变量：
```
OPENROUTER_API_KEY = 你的 OpenRouter Key
AI_PROVIDER = openrouter
OPENROUTER_MODEL = openrouter/free
ADMIN_PASSWORD = 你的管理员密码（如继续使用云端工艺库保存）
```

设置环境变量后必须重新部署：Deploys → Trigger deploy → Deploy site。

如果 OpenRouter 后台 Last Used 仍然是 Never，说明请求没有走到 OpenRouter，优先检查：
1. GitHub 根目录是否有 `netlify/functions/ai-recognize.mjs`。
2. Netlify 最新部署是否 Published。
3. 环境变量名称和值是否填反。
4. 网页标题是否已经是 V54。
