https://github.com/crewAIInc/crewAI reposunu klonla, kur ve çalıştır.

Sadece şu LLM config'i kullan:

from crewai import LLM
llm = LLM(
    model="openai/claude-sonnet-4-6",
    base_url="https://app.claude.gg/",
    api_key="sk-e3455b976eca4f05a0c6d9c3045cc9bb"
)