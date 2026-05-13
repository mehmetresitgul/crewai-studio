# my_crew — crewAI Proje Modülü

Bu dizin, crewAI'ın resmi proje yapısına uygun olarak oluşturulmuş tam bir crew paketidir. `@CrewBase` dekoratörü, YAML konfigürasyon dosyaları ve `crewai run` CLI komutu ile çalışır.

---

## Kurulum

```bash
pip install -e .
```

---

## Çalıştırma

```bash
# Konu belirterek çalıştır
python -m my_crew.main "Kuantum Bilgisayarlar"

# Sonuç report.md dosyasına yazılır
```

---

## Yapı

```
my_crew/
├── .env                        ← API key ve model ayarları
├── pyproject.toml              ← Paket tanımı
├── report.md                   ← En son çalıştırmanın çıktısı
└── src/my_crew/
    ├── crew.py                 ← Ana crew tanımı (@CrewBase)
    ├── main.py                 ← run / train / replay / test
    ├── config/
    │   ├── agents.yaml         ← Agent tanımları
    │   └── tasks.yaml          ← Task tanımları
    └── tools/
        └── custom_tool.py      ← Özel tool şablonu
```

---

## Agent'lar

### Researcher
- **Rol**: `{topic} Araştırmacısı`
- **Hedef**: Konuyu derinlemesine araştırıp temel bilgileri derler
- **Süreç**: Task 1'i üstlenir, çıktısı Task 2'ye context olarak geçer

### Reporting Analyst
- **Rol**: `{topic} Rapor Analisti`
- **Hedef**: Araştırma verilerini Türkçe, yapılandırılmış rapora dönüştürür
- **Çıktı**: `report.md` dosyasına markdown formatında rapor yazar

---

## LLM Konfigürasyonu

`.env` dosyası:

```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://app.claude.gg/
MODEL=openai/claude-sonnet-4-6
```

`crew.py` içinde LLM nesnesi:

```python
llm = LLM(
    model="openai/claude-sonnet-4-6",
    base_url="https://app.claude.gg/",
    api_key="sk-...",
)
```

Bu yapı sayesinde OpenAI SDK'sına uyumlu herhangi bir API uç noktası kullanılabilir.

---

## Yeni Agent / Task Ekleme

1. `config/agents.yaml` dosyasına yeni agent ekle
2. `config/tasks.yaml` dosyasına yeni task ekle
3. `crew.py` dosyasına `@agent` ve `@task` dekoratörleriyle metodları ekle

Örnek:

```python
@agent
def editor(self) -> Agent:
    return Agent(
        config=self.agents_config["editor"],
        llm=llm,
        verbose=True,
    )

@task
def editing_task(self) -> Task:
    return Task(config=self.tasks_config["editing_task"])
```

---

## CLI Referansı

```bash
python -m my_crew.main "konu"     # crew'u çalıştır
python -m my_crew.main train      # modeli eğit
python -m my_crew.main replay     # task'tan devam et
python -m my_crew.main test       # test et ve değerlendir
```
