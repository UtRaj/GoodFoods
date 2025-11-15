# agents/app/core/utils/llm_client.py

import json
from groq import Groq
from typing import List, Dict
from ...config import settings

class LLMClient:
    def __init__(self):
        self.groq_llm = Groq(api_key=settings.GROQ_API_KEY)

    def get_response(self, messages: List[Dict[str, str]], is_json=True, perf=False, response_schema=None):
        print("#" * 100)
        print(messages)
        try:
            response_format = None
            if is_json:
                response_format = {"type": "json_object"}
            
            response = self.groq_llm.chat.completions.create(
                model=settings.DEFAULT_MODEL,
                messages=messages,
                temperature=1,
                max_completion_tokens=500,
                top_p=1,
                stream=False,
                response_format=response_format,
                stop=None,
            )
            print(response.choices[0].message.content)
            print("#" * 100)
            
            if is_json:
                return json.loads(response.choices[0].message.content)
            else:
                return response.choices[0].message.content
        except Exception as e:
            print(f"Error in LLM Client: {str(e)}")
            return {"error": f"Error in LLM Client: {str(e)}"}