from crewai.tools import BaseTool
from pydantic import BaseModel, Field


class SearchInput(BaseModel):
    query: str = Field(description="Aranacak konu veya soru")


class CustomSearchTool(BaseTool):
    name: str = "Custom Search"
    description: str = "Verilen konu hakkında bilgi araştırır"
    args_schema: type[BaseModel] = SearchInput

    def _run(self, query: str) -> str:
        return f"'{query}' hakkında araştırma sonuçları burada görünecek."
