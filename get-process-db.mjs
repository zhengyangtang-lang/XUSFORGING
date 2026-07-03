import { getStore } from "@netlify/blobs";

const STORE_NAME = "xusheng-forging-bom-db";
const KEY = "process-database-v1";

export default async () => {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const data = await store.get(KEY, { type: "json", consistency: "strong" });
    return Response.json({ ok: true, data: data || null });
  } catch (error) {
    return Response.json({ ok: false, error: error?.message || String(error) }, { status: 500 });
  }
};
