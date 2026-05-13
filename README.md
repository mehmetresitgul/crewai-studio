# CrewAI Studio

Tarayıcı tabanlı çok-ajan yapay zeka orkestrasyon platformu. **crewAI** motoru üzerine inşa edilmiş, **Next.js** arayüzü ve **FastAPI** backend'i ile tam kapsamlı bir AI agent deneyimi sunar.

---

## Mimari

```
┌─────────────────────────────────────────────────────┐
│                  Tarayıcı (localhost:3000)           │
│           Next.js 16 + Vercel AI SDK + React 19     │
│   Agent Builder │ Task Builder │ Settings │ Results  │
└────────────────────────┬────────────────────────────┘
                         │ HTTP / SSE Stream
┌────────────────────────▼────────────────────────────┐
│              FastAPI Backend (localhost:8000)        │
│         backend.py — SSE streaming endpoint         │
│         /api/run        → crewAI kickoff            │
│         /api/extract-pdf → PDF metin çıkarma        │
│         /api/health     → sağlık kontrolü           │
└────────────────────────┬────────────────────────────┘
                         │ Python
┌────────────────────────▼────────────────────────────┐
│                crewAI 0.80.0 (Motor)                │
│   my_crew/  — tam crewAI proje yapısı               │
│   @CrewBase │ agents.yaml │ tasks.yaml │ tools/     │
└────────────────────────┬────────────────────────────┘
                         │ OpenAI-uyumlu API
┌────────────────────────▼────────────────────────────┐
│              LLM: claude-sonnet-4-6                 │
│              Base URL: https://app.claude.gg/       │
└─────────────────────────────────────────────────────┘
```

---

## Gereksinimler

| Araç | Sürüm |
|------|-------|
| Python | 3.10 – 3.13 |
| Node.js | 18+ |
| npm | 9+ |
| Git | herhangi |

---

## Kurulum

### 1. Repoyu klonla

```bash
git clone https://github.com/mehmetresitgul/crewai-studio.git
cd crewai-studio
```

### 2. Python bağımlılıklarını kur

```bash
pip install -r requirements.txt
```

`requirements.txt` içeriği:
```
crewai>=0.80.0
fastapi
uvicorn[standard]
pdfplumber
python-multipart
sse-starlette
```

### 3. my_crew paketini kur

```bash
cd my_crew
pip install -e .
cd ..
```

### 4. Frontend bağımlılıklarını kur

```bash
cd ui
npm install
cd ..
```

---

## Çalıştırma

Her bileşen ayrı terminalde çalışır:

### Terminal 1 — FastAPI Backend

```bash
uvicorn backend:app --reload --port 8000
```

Sunucu `http://localhost:8000` adresinde başlar.

### Terminal 2 — Next.js Frontend

```bash
cd ui
npm run dev
```

Uygulama `http://localhost:3000` adresinde açılır.

### Terminal 3 — crewAI (doğrudan kullanım, opsiyonel)

```bash
cd my_crew
python -m my_crew.main "Araştırmak istediğin konu"
```

Sonuç `my_crew/report.md` dosyasına yazılır.

---

## Proje Yapısı

```
crewai-studio/
│
├── README.md                      ← Bu dosya
├── requirements.txt               ← Python bağımlılıkları
├── backend.py                     ← FastAPI sunucu
├── run_crew.py                    ← Hızlı test scripti
│
├── my_crew/                       ← Tam crewAI proje yapısı
│   ├── .env                       ← LLM ayarları (API key, base URL)
│   ├── pyproject.toml             ← Paket tanımı
│   └── src/my_crew/
│       ├── crew.py                ← @CrewBase: agent/task/crew tanımları
│       ├── main.py                ← Giriş noktası (run/train/replay/test)
│       ├── config/
│       │   ├── agents.yaml        ← Agent rolleri ve hedefleri
│       │   └── tasks.yaml         ← Görev tanımları
│       └── tools/
│           └── custom_tool.py     ← Özel tool şablonu
│
└── ui/                            ← Next.js arayüzü
    ├── app/
    │   ├── page.tsx               ← Ana sayfa
    │   ├── layout.tsx             ← Genel layout
    │   ├── globals.css            ← CSS değişkenleri ve animasyonlar
    │   ├── types.ts               ← TypeScript tip tanımları
    │   ├── hooks/
    │   │   └── useCrew.ts         ← SSE stream hook (Vercel AI SDK stili)
    │   └── components/
    │       ├── AgentCard.tsx      ← Agent düzenleme kartı
    │       ├── TaskCard.tsx       ← Task düzenleme kartı
    │       ├── PdfUploader.tsx    ← PDF yükleme ve metin çıkarma
    │       └── ResultPanel.tsx    ← Canlı sonuç ve ilerleme paneli
    ├── package.json
    └── tsconfig.json
```

---

## Nasıl Çalışır?

### 1. UI → Backend akışı

1. Kullanıcı tarayıcıda agent ve task'larını tanımlar
2. **Kickoff** butonuna basar
3. Next.js, `POST /api/run` isteği gönderir (JSON body: agents, tasks, llm config)
4. FastAPI endpoint'i **Server-Sent Events (SSE)** stream açar
5. Arka planda ayrı thread'de `crewAI.kickoff()` çalışır
6. Her saniye progress tick'i stream'e yazılır
7. crewAI bitince sonuç SSE üzerinden tarayıcıya gelir
8. `useCrew.ts` hook'u stream'i okuyup UI state'ini günceller

### 2. crewAI iç işleyişi

```
Crew.kickoff(inputs)
  │
  ├─► Task 1: research_task → Researcher agent
  │     └─► LLM'e prompt gönderir
  │         LLM araştırma özeti üretir
  │         Sonuç Task 2'ye context olarak geçer
  │
  └─► Task 2: reporting_task → Reporting Analyst agent
        └─► Task 1 çıktısını + kendi promptunu LLM'e gönderir
            LLM yapılandırılmış Türkçe rapor üretir
            report.md dosyasına yazar
```

### 3. PDF akışı

1. Kullanıcı PDF yükler
2. `POST /api/extract-pdf` endpoint'i dosyayı alır
3. **pdfplumber** ile metin çıkarır (max 20 MB)
4. Metin task description'a eklenir
5. Agent bu metni işler (çeviri, özetleme vb.)

### 4. SSE (Server-Sent Events)

Vercel AI SDK'nın streaming protokolüne benzer format:

```
data: {"type": "start", "content": "Crew başlatıldı..."}

data: {"type": "progress", "content": "Çalışıyor.."}

data: {"type": "result", "content": "# Rapor\n..."}

data: [DONE]
```

---

## Yapılandırma

### LLM Ayarları

Üç yerde değiştirilebilir:

**1. my_crew/.env** (crewAI doğrudan kullanımı için)
```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://app.claude.gg/
MODEL=openai/claude-sonnet-4-6
```

**2. my_crew/src/my_crew/crew.py** (crewAI paket kullanımı için)
```python
llm = LLM(
    model="openai/claude-sonnet-4-6",
    base_url="https://app.claude.gg/",
    api_key="sk-...",
)
```

**3. UI Ayarlar sekmesi** (çalışma zamanında değiştirmek için)
Tarayıcıda ⚙️ Ayarlar → model/base_url/api_key alanlarını düzenle

### Agent ve Task Yapılandırması

**YAML yöntemi** (`my_crew/src/my_crew/config/`):

```yaml
# agents.yaml
researcher:
  role: "{topic} Araştırmacısı"
  goal: "{topic} hakkında kapsamlı bilgi topla"
  backstory: "Deneyimli bir araştırmacısın."
```

```yaml
# tasks.yaml
research_task:
  description: "{topic} hakkında araştırma yap."
  expected_output: "Maddeler halinde araştırma özeti."
  agent: researcher
  output_file: report.md   # opsiyonel: dosyaya yazar
```

**UI yöntemi**: Tarayıcıda 👥 Agents ve 📋 Tasks sekmelerinden form doldur.

---

## crewAI CLI Komutları

`my_crew/` dizininde çalıştırılır:

```bash
# Crew'u çalıştır
python -m my_crew.main "konu başlığı"

# Modeli belirli örneklerle eğit
python -m my_crew.main train   # main.py içindeki train() fonksiyonu

# Belirli bir task'tan yeniden başlat
python -m my_crew.main replay

# Test et ve değerlendir
python -m my_crew.main test
```

---

## Yeni Agent veya Task Ekleme

### 1. agents.yaml'a agent ekle

```yaml
analyst:
  role: "{topic} Veri Analisti"
  goal: "Verileri analiz et ve içgörüler çıkar"
  backstory: "İstatistik ve veri analizinde uzman."
```

### 2. tasks.yaml'a task ekle

```yaml
analysis_task:
  description: "Araştırma verilerini istatistiksel olarak analiz et."
  expected_output: "Sayısal bulgular ve grafikler."
  agent: analyst
```

### 3. crew.py'a ekle

```python
@agent
def analyst(self) -> Agent:
    return Agent(
        config=self.agents_config["analyst"],
        llm=llm,
        verbose=True,
    )

@task
def analysis_task(self) -> Task:
    return Task(config=self.tasks_config["analysis_task"])
```

---

## Yeni Tool Ekleme

`my_crew/src/my_crew/tools/custom_tool.py` şablonunu kopyala:

```python
from crewai.tools import BaseTool
from pydantic import BaseModel, Field

class MyToolInput(BaseModel):
    query: str = Field(description="Parametre açıklaması")

class MyTool(BaseTool):
    name: str = "My Tool"
    description: str = "Bu tool ne yapar"
    args_schema: type[BaseModel] = MyToolInput

    def _run(self, query: str) -> str:
        # tool mantığı buraya
        return "sonuç"
```

Agent'a ekle:

```python
from my_crew.tools.custom_tool import MyTool

@agent
def researcher(self) -> Agent:
    return Agent(
        config=self.agents_config["researcher"],
        llm=llm,
        tools=[MyTool()],
        verbose=True,
    )
```

---

## API Referansı

### `POST /api/run`

crewAI'ı çalıştırır, SSE stream döner.

**Request body:**
```json
{
  "agents": [
    {
      "role": "Researcher",
      "goal": "Research the topic",
      "backstory": "Expert researcher"
    }
  ],
  "tasks": [
    {
      "description": "Research AI trends",
      "expected_output": "Bullet point summary",
      "agent_index": 0
    }
  ],
  "llm": {
    "model": "openai/claude-sonnet-4-6",
    "base_url": "https://app.claude.gg/",
    "api_key": "sk-..."
  }
}
```

**Response:** `text/event-stream`

### `POST /api/extract-pdf`

PDF'ten metin çıkarır.

**Request:** `multipart/form-data`, `file` alanında PDF

**Response:**
```json
{
  "text": "PDF içeriği...",
  "page_count": 5,
  "char_count": 12400
}
```

### `GET /api/health`

```json
{ "status": "ok" }
```

---

## Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| AI Motor | crewAI 0.80.0 |
| LLM | claude-sonnet-4-6 (OpenAI-uyumlu API) |
| Backend | FastAPI 0.136 + uvicorn |
| Streaming | Server-Sent Events (SSE) |
| PDF İşleme | pdfplumber |
| Frontend | Next.js 16.2.6 + React 19 |
| AI SDK | Vercel AI SDK 6.x |
| Stil | Tailwind CSS 4 + CSS Variables |
| Dil | Python 3.11 / TypeScript 5 |

---

## Bilinen Kısıtlamalar

- **Taramalı PDF'ler desteklenmez** — OCR içermeyen görsel PDF'lerden metin çıkarılamaz
- **Gerçek zamanlı arama yok** — Agent'lar internete bağlanmaz, LLM'in eğitim verisini kullanır
- **Cloudflare proxy timeout** — LLM yanıtı 120 saniyeyi aşarsa 524 hatası alınabilir; konu kapsamını daraltmak gerekir
- **Windows encoding** — Terminal çıktısı için `PYTHONIOENCODING=utf-8` gerekir

---

## Sonraki Adımlar (Roadmap)

- [ ] Web arama tool (Serper API entegrasyonu)
- [ ] Memory sistemi (short-term, long-term, entity)
- [ ] Hierarchical process (manager agent)
- [ ] PDF çeviri UI entegrasyonu
- [ ] Docker Compose ile tek komut kurulum
- [ ] Kullanıcı kimlik doğrulama
