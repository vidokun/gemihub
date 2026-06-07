# GemiHub API — Developer Guide

> Untuk developer plugin WordPress (AutoPost & AI Article Generator)

---

## 1. Endpoint

```
POST https://gemihub.vercel.app/api/v1/chat/completions
```

**Format**: OpenAI-compatible (bisa pakai OpenAI SDK langsung)

---

## 2. Authentication

Setiap request HARUS menyertakan header:

```
Authorization: Bearer MASTER_AUTH_TOKEN
```

Token didapat dari admin GemiHub. Tanpa token → **401 Unauthorized**.

```php
// WordPress example
$response = wp_remote_post('https://gemihub.vercel.app/api/v1/chat/completions', [
    'headers' => [
        'Authorization' => 'Bearer ' . GEMIHUB_API_TOKEN,
        'Content-Type'  => 'application/json',
    ],
    'body' => json_encode([...]),
]);
```

---

## 3. Request Format

### Non-Streaming (JSON response)

```json
{
  "model": "gemini-2.5-flash",
  "messages": [
    { "role": "system", "content": "Kamu adalah penulis artikel WordPress profesional." },
    { "role": "user", "content": "Buat artikel tentang AI untuk WordPress" }
  ],
  "temperature": 0.7,
  "maxOutputTokens": 2048,
  "stream": false
}
```

### Streaming (SSE — untuk real-time output)

```json
{
  "model": "gemini-2.5-flash",
  "messages": [
    { "role": "user", "content": "Generate 3 blog post ideas" }
  ],
  "stream": true
}
```

---

## 4. Response Format

### Non-Streaming (OpenAI-compatible)

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "gemini-2.5-flash",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "Ini hasil generate artikel..."
    },
    "finish_reason": "STOP"
  }],
  "usage": {
    "prompt_tokens": 50,
    "completion_tokens": 200,
    "total_tokens": 250
  }
}
```

### Streaming (SSE)

```
data: {"choices":[{"delta":{"content":"Ini"},"index":0}]}
data: {"choices":[{"delta":{"content":" hasil"},"index":0}]}
data: {"choices":[{"delta":{"content":" generate"},"index":0}]}
data: [DONE]
```

---

## 5. Supported Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `model` | string | ✅ | — | Model Gemini (lihat daftar di bawah) |
| `messages` | array | ✅ | — | Array `{role, content}` |
| `stream` | boolean | ❌ | false | `true` untuk SSE streaming |
| `temperature` | number | ❌ | — | 0.0 - 2.0 (kreativitas) |
| `maxOutputTokens` | number | ❌ | — | Max token output |
| `topP` | number | ❌ | — | Nucleus sampling |
| `topK` | number | ❌ | — | Top-K sampling |

### Messages Format

```json
[
  { "role": "system", "content": "System prompt / instruksi AI" },
  { "role": "user", "content": "Pertanyaan / input user" },
  { "role": "assistant", "content": "Response AI sebelumnya (untuk multi-turn)" }
]
```

---

## 6. Available Models

| Model | Best For |
|-------|----------|
| `gemini-2.5-flash` | Cepat, murah — daily content generation |
| `gemini-2.5-pro` | Artikel panjang & kompleks |
| `gemini-2.0-flash` | Legacy — fallback |
| `gemini-1.5-flash` | Cadangan |
| `gemini-1.5-pro` | Analisis mendalam |

> **Catatan**: Model yg tersedia dikelola admin lewat dashboard `/settings`. Hubungi admin jika butuh model lain.

---

## 7. Error Codes

| HTTP | Code | Arti |
|------|------|------|
| 400 | `INVALID_REQUEST` | JSON body tidak valid |
| 400 | `INVALID_MODEL` | Model tidak diizinkan |
| 401 | `UNAUTHORIZED` | Token tidak valid / tidak ada |
| 429 | — | Rate limit — coba lagi nanti |
| 500 | — | Server error |
| 503 | `NO_KEYS_AVAILABLE` | Semua API key habis — coba lagi nanti |

---

## 8. Rate Limiting & Load Balancing

GemiHub otomatis:
- **Load balance** 65+ Gemini API key dengan LRU strategy
- **Auto-retry** kalau key kena rate limit (429) → switch ke key berikutnya
- **Timeout**: ~30 detik untuk non-streaming, unlimited untuk streaming

> **Best practice**: Tambah retry logic di plugin kamu. Kalau dapat 503/429, tunggu 5-10 detik, coba lagi.

---

## 9. WordPress Plugin — Contoh Kode

### Generate Artikel

```php
function gemihub_generate_article($topic, $keywords) {
    $response = wp_remote_post('https://gemihub.vercel.app/api/v1/chat/completions', [
        'headers' => [
            'Authorization' => 'Bearer ' . GEMIHUB_API_TOKEN,
            'Content-Type'  => 'application/json',
        ],
        'body' => json_encode([
            'model'    => 'gemini-2.5-flash',
            'messages' => [
                ['role' => 'system', 'content' => "Kamu penulis artikel SEO. Format: judul + konten HTML. Keywords: $keywords"],
                ['role' => 'user', 'content' => "Buat artikel tentang: $topic"],
            ],
            'temperature'       => 0.7,
            'maxOutputTokens'   => 2048,
            'stream'            => false,
        ]),
        'timeout' => 60,
    ]);

    if (is_wp_error($response)) return null;

    $body = json_decode(wp_remote_retrieve_body($response), true);
    return $body['choices'][0]['message']['content'] ?? null;
}
```

### Auto-post ke WordPress

```php
$article = gemihub_generate_article('Tren AI 2025', 'artificial intelligence, machine learning');

if ($article) {
    wp_insert_post([
        'post_title'   => 'Tren AI 2025',
        'post_content' => $article,
        'post_status'  => 'publish',
        'post_author'  => 1,
    ]);
}
```

---

## 10. Plugin Config — yang perlu disampaikan ke developer

Berikan ini ke developer plugin:

```
GEMIHUB_API_ENDPOINT = https://gemihub.vercel.app/api/v1/chat/completions
GEMIHUB_API_TOKEN    = [MASTER_AUTH_TOKEN dari admin]
GEMIHUB_MODEL        = gemini-2.5-flash
GEMIHUB_MAX_TOKENS   = 2048
GEMIHUB_TEMPERATURE  = 0.7
```

---

## 11. Testing

```bash
# Test dari terminal
curl -X POST https://gemihub.vercel.app/api/v1/chat/completions \
  -H "Authorization: Bearer TOKEN_KAMU" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [{"role":"user","content":"Buat 3 ide judul artikel tentang AI"}],
    "stream": false
  }'
```
