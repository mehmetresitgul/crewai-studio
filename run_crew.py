import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from crewai import LLM, Agent, Task, Crew

llm = LLM(
    model="openai/claude-sonnet-4-6",
    base_url="https://app.claude.gg/",
    api_key="sk-e3455b976eca4f05a0c6d9c3045cc9bb"
)

researcher = Agent(
    role="Researcher",
    goal="Research the given topic and provide a summary",
    backstory="You are an expert researcher.",
    llm=llm,
    verbose=True
)

task = Task(
    description="Briefly explain the role of AI agents in software development. Answer in Turkish.",
    expected_output="A 100-200 word summary in Turkish.",
    agent=researcher
)

crew = Crew(
    agents=[researcher],
    tasks=[task],
    verbose=True
)

result = crew.kickoff()
print("\n=== SONUÇ ===")
print(result)
