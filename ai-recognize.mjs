const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function reply(statusCode, body) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(body) };
}

function stripNulls(obj) {
  if (Array.isArray(obj)) return obj.map(stripNulls);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = v === undefined ? null : stripNulls(v);
    return out;
  }
  return obj;
}

function dataUrlToInlineData(dataUrl, mimeTypeFallback = '') {
  const m = String(dataUrl || '').match(/^data:([^;,]+)?(?:;[^,]*)?,(.*)$/s);
  if (!m) throw new Error('文件dataUrl格式无效。');
  const mimeType = m[1] || mimeTypeFallback || 'application/octet-stream';
  const data = m[2] || '';
  if (!data) throw new Error('文件base64内容为空。');
  return { mimeType, data };
}

function extractGeminiText(resp) {
  const parts = [];
  for (const c of resp?.candidates || []) {
    for (const p of c?.content?.parts || []) {
      if (typeof p?.text === 'string') parts.push(p.text);
    }
  }
  return parts.join('\n').trim();
}

function parseJsonFromText(text) {
  const raw = String(text || '').trim();
  if (!raw) throw new Error('Gemini未返回文本。');
  try { return JSON.parse(raw); } catch {}
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch {}
  }
  const first = raw.indexOf('{');
  const last = raw.lastIndexOf('}');
  if (first >= 0 && last > first) {
    try { return JSON.parse(raw.slice(first, last + 1)); } catch {}
  }
  throw new Error(`Gemini输出不是合法JSON：${raw.slice(0, 1200)}`);
}

function promptFor(kind) {
  const common = `你必须只输出一个JSON对象，不要Markdown，不要解释，不要代码块。
如果字段无法确定，填 null。数字字段必须输出数字，不要输出带单位的字符串。
JSON顶层结构必须包含：document_type, raw_text, forging, machining_rows, warnings。`;

  if (kind === 'forging') {
    return `${common}

你是汽车铝合金锻造报价工程师。请从上传的锻造毛坯成本分析PDF/图片中抽取字段。
识别规则：
1. 节拍字段必须读取原表已经给出的结果值，不要重新计算。
2. 锻造节拍、热处理节拍、酸洗探伤节拍、抛丸节拍必须读取对应标签的 s/件 结果值。
3. 不要把步进时间、装框数量、挂取数量、网带速度、最快6s、60/(...)、Capacity等中间参数当成最终节拍。
4. 设备名称按原文保留，例如 手工锻630ton锻造线、热模锻4000ton锻造线、T6热处理线、酸洗+探伤自动线、抛丸机等。
5. bar_source 只允许 internal / outsource / extruded / null。铸造棒/内铸棒为 internal，外购棒/委外短棒为 outsource，挤压棒为 extruded。
6. polish_enabled 如果原表没有明确取消，默认可填 true；polish_cycle 如果无明确值可填 30。

返回JSON示例字段：
{
  "document_type":"forging_cost_analysis",
  "raw_text":"可简短保留关键识别文本",
  "warnings":[],
  "forging":{
    "drawing_no":null,
    "part_no":null,
    "outline_size":null,
    "blank_drawing_weight":null,
    "blank_projection_area":null,
    "die_tol_lower":null,
    "die_tol_upper":null,
    "extra_blank_weight":null,
    "internal_blank_weight":null,
    "material":null,
    "bar_source":null,
    "bar_diameter":null,
    "bar_length":null,
    "pcs_per_cycle":null,
    "forge_line":null,
    "bar_heat_cycle":null,
    "forge_form_cycle":null,
    "forge_cycle":null,
    "heat_line":null,
    "heat_step_time":null,
    "heat_frame_qty":null,
    "heat_cycle":null,
    "acid_line":null,
    "acid_step_time":null,
    "acid_hang_qty":null,
    "acid_cycle":null,
    "polish_enabled":true,
    "polish_cycle":30,
    "shot_enabled":null,
    "shot_line":null,
    "shot_belt_speed":null,
    "shot_qty_per_m":null,
    "shot_cycle":null
  },
  "machining_rows":[]
}`;
  }

  return `${common}

你是汽车零件机加工报价工程师。请从上传的 Production capacity study / 机加工产能分析PDF或图片中抽取真实数据行。
识别规则：
1. 只抽取实际数据行，不要抽表头、合并表头、说明文字、Capacity汇总列。
2. procedure 来自工步/procedure/Process列，例如 Machining OP 10、OP10、OP20；输出统一格式 OP10、OP20、OP30。
3. equipment 来自 Machining Equipments / MAC / 加工设备列。
4. program 来自 Program processing time / 程序加工时间列。
5. clamp 来自 clamping time / 装夹时间列。
6. scycle 来自 Scycle time(s) 列。
7. cavity 来自 Cavity 列；如果表格显示 1，必须填 1。
8. cycle_seconds = scycle / cavity。
9. 不要把 Capacity/Day、Capacity/Week、Capacity/Month、Annual Capacity 作为节拍。
10. OEE 90% 输出为 90，NG 5.0% 输出为 5.0。

返回JSON示例字段：
{
  "document_type":"machining_capacity_study",
  "raw_text":"可简短保留关键识别文本",
  "warnings":[],
  "forging":{
    "drawing_no":null,"part_no":null,"outline_size":null,"blank_drawing_weight":null,"blank_projection_area":null,"die_tol_lower":null,"die_tol_upper":null,"extra_blank_weight":null,"internal_blank_weight":null,"material":null,"bar_source":null,"bar_diameter":null,"bar_length":null,"pcs_per_cycle":null,"forge_line":null,"bar_heat_cycle":null,"forge_form_cycle":null,"forge_cycle":null,"heat_line":null,"heat_step_time":null,"heat_frame_qty":null,"heat_cycle":null,"acid_line":null,"acid_step_time":null,"acid_hang_qty":null,"acid_cycle":null,"polish_enabled":null,"polish_cycle":null,"shot_enabled":null,"shot_line":null,"shot_belt_speed":null,"shot_qty_per_m":null,"shot_cycle":null
  },
  "machining_rows":[
    {"part_no":null,"procedure":"OP10","equipment":null,"program":null,"clamp":null,"scycle":null,"cavity":1,"cycle_seconds":null,"oee":null,"ng_rate":null}
  ]
}`;
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return reply(405, { ok: false, error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return reply(500, {
      ok: false,
      error: '服务器未配置 GEMINI_API_KEY，无法使用免费AI识别。请在Netlify环境变量中新增 GEMINI_API_KEY 后重新部署。'
    });
  }

  let req;
  try { req = JSON.parse(event.body || '{}'); } catch { return reply(400, { ok: false, error: '请求JSON解析失败。' }); }

  const { kind, filename = 'upload', mimeType = '', dataUrl = '' } = req || {};
  if (!['forging', 'machining'].includes(kind)) return reply(400, { ok: false, error: 'kind 必须是 forging 或 machining。' });
  if (!dataUrl || !String(dataUrl).startsWith('data:')) return reply(400, { ok: false, error: '缺少文件dataUrl。' });

  let inlineData;
  try { inlineData = dataUrlToInlineData(dataUrl, mimeType); }
  catch (e) { return reply(400, { ok: false, error: e.message || String(e) }); }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: `${promptFor(kind)}\n\n文件名：${filename}` },
        { inline_data: inlineData }
      ]
    }],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json'
    }
  };

  let apiResp;
  try {
    apiResp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    return reply(500, { ok: false, error: `调用Gemini接口失败：${e.message || e}` });
  }

  const text = await apiResp.text();
  if (!apiResp.ok) {
    return reply(500, { ok: false, error: `Gemini接口返回错误 HTTP ${apiResp.status}: ${text.slice(0, 1600)}` });
  }

  let raw;
  try { raw = JSON.parse(text); } catch { return reply(500, { ok: false, error: `Gemini响应不是JSON：${text.slice(0, 1200)}` }); }

  const outputText = extractGeminiText(raw);
  let data;
  try { data = parseJsonFromText(outputText); }
  catch (e) { return reply(500, { ok: false, error: e.message || String(e), raw: outputText.slice(0, 1600) }); }

  return reply(200, { ok: true, data: stripNulls(data), model, provider: 'gemini' });
}
