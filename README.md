# 锻造事业部BOM和节拍核算 V51｜Gemini免费AI识别 + V48云端工艺库版

本版本基于 V48 页面结构恢复，保留原来的 BOM、工艺路线、Capacity Study、工艺数据库维护逻辑；将 PDF/图片 OCR 主识别方式替换为 Gemini API AI 视觉识别。

## 版本特性

- 锻造毛坯成本分析：PDF / PNG / JPG 上传后走 Gemini AI 识别。
- 机加工 Production capacity study：PDF / PNG / JPG 上传后走 Gemini AI 识别。
- 机加工节拍仍按 `Scycle time / Cavity` 计算。
- 机加工识别后仍自动追加“自动打码”工序。
- 保留 V48 云端工艺数据库功能：Netlify Blobs + get/save process db。
- AI 识别失败时保留传统 OCR 回退，便于临时救场。

## Netlify 环境变量

必须配置：

```text
GEMINI_API_KEY = 你的 Gemini API Key
```

如果继续使用 V48 云端工艺数据库保存功能，还需要：

```text
ADMIN_PASSWORD = 你的管理员密码
```

可选：

```text
GEMINI_MODEL = gemini-2.5-flash
```

## 部署方式

1. 解压本 zip。
2. 把解压后的内容上传覆盖 GitHub 仓库根目录。
3. 确认 GitHub 根目录存在：

```text
index.html
package.json
netlify.toml
netlify/functions/ai-recognize.mjs
netlify/functions/get-process-db.mjs
netlify/functions/save-process-db.mjs
```

4. Netlify 自动部署或手动 Trigger deploy。
5. 在 Netlify 的 Project configuration → Environment variables 添加 `GEMINI_API_KEY`。
6. 修改环境变量后必须重新部署一次。

## 注意

Gemini 免费层有额度限制，且免费层的数据使用政策需要按 Google 官方说明确认。内部报价、客户图纸等敏感文件建议先做脱敏，或使用公司批准的企业级 AI 服务。
