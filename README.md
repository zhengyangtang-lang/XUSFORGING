# 锻造事业部BOM和节拍核算 V45｜Netlify Blobs 云端工艺数据库版

## 部署方式

1. 将本文件夹上传到 GitHub 仓库。
2. Netlify 新建站点，选择该 GitHub 仓库。
3. Build command: `npm install`
4. Publish directory: `.`
5. 在 Netlify Site configuration → Environment variables 中新增：
   - `ADMIN_PASSWORD` = 你的管理员保存密码
6. 部署完成后打开网址。

## 使用方式

- 普通用户：打开网页自动读取云端工艺数据库，只做分析和导出。
- 管理员：进入工艺数据维护窗口，输入管理员密码，点击“保存到云端主库”。
- 项目分析结果不会写入云端，仅工艺数据库和铸棒规则写入 Netlify Blobs。

## 注意

首次部署后云端库为空，页面会使用内置默认库。管理员需要进入工艺数据维护窗口，点击“保存到云端主库”初始化主数据库。
