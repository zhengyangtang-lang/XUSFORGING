import { getStore } from "@netlify/blobs";

const STORE_NAME = "xusheng-forging-bom-db";
const KEY = "process-database-v1";

function validNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validatePayload(data) {
  if (!data || !Array.isArray(data.db) || !Array.isArray(data.castRows)) {
    return "数据格式错误：缺少 db 或 castRows。";
  }
  for (const row of data.db) {
    if (!row.process || !row.code || !validNumber(Number(row.oee)) || !validNumber(Number(row.yield)) || !validNumber(Number(row.operators))) {
      return "设备数据库存在空字段或无效数字。";
    }
  }
  for (const row of data.castRows) {
    if (!validNumber(Number(row.diameter)) || !validNumber(Number(row.speed)) || !validNumber(Number(row.holes))) {
      return "铸棒规则存在无效数字。";
    }
  }
  return "";
}

export default async (request) => {
  try {
    if (request.method !== "POST") {
      return Response.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return Response.json({ ok: false, error: "服务器未配置 ADMIN_PASSWORD 环境变量。" }, { status: 500 });
    }

    const body = await request.json();
    if (!body || body.password !== adminPassword) {
      return Response.json({ ok: false, error: "管理员密码错误。" }, { status: 401 });
    }

    const data = body.data;
    const err = validatePayload(data);
    if (err) {
      return Response.json({ ok: false, error: err }, { status: 400 });
    }

    const payload = {
      ...data,
      updatedAt: new Date().toISOString(),
      schemaVersion: data.schemaVersion || "v1"
    };

    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    await store.setJSON(KEY, payload);

    return Response.json({ ok: true, updatedAt: payload.updatedAt });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || String(error) }, { status: 500 });
  }
};
