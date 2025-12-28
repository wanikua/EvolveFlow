"""
MCP (Model Context Protocol) 客户端
负责工具发现和调用
"""
from typing import Dict, Any, List, Optional
from loguru import logger
from models import MCPToolConfig
import json


class MCPClient:
    """
    MCP 协议客户端
    实现工具的动态发现和调用
    """

    def __init__(self):
        self.tools: Dict[str, MCPToolConfig] = {}
        self._initialize_builtin_tools()

    def _initialize_builtin_tools(self):
        """初始化内置工具"""
        builtin_tools = [
            {
                "name": "get_weather",
                "description": "获取指定城市的实时天气信息",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "city": {
                            "type": "string",
                            "description": "城市名称"
                        },
                        "unit": {
                            "type": "string",
                            "enum": ["celsius", "fahrenheit"],
                            "default": "celsius"
                        }
                    },
                    "required": ["city"]
                },
                "handler": "handle_weather"
            },
            {
                "name": "calculate",
                "description": "执行数学计算",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "expression": {
                            "type": "string",
                            "description": "数学表达式，如 '2 + 2 * 3'"
                        }
                    },
                    "required": ["expression"]
                },
                "handler": "handle_calculate"
            },
            {
                "name": "web_search",
                "description": "在网络上搜索信息",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "搜索关键词"
                        },
                        "limit": {
                            "type": "integer",
                            "description": "返回结果数量",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                },
                "handler": "handle_web_search"
            }
        ]

        for tool_config in builtin_tools:
            self.register_tool(MCPToolConfig(**tool_config))

        logger.info(f"Initialized {len(self.tools)} builtin MCP tools")

    def register_tool(self, tool: MCPToolConfig):
        """注册新工具"""
        self.tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name}")

    def discover_tools(self) -> List[MCPToolConfig]:
        """发现所有可用工具"""
        return list(self.tools.values())

    def get_tool(self, tool_name: str) -> Optional[MCPToolConfig]:
        """获取指定工具"""
        return self.tools.get(tool_name)

    async def call_tool(self, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        调用工具

        Returns:
            {
                "success": bool,
                "result": Any,
                "error": Optional[str]
            }
        """
        tool = self.get_tool(tool_name)

        if not tool:
            return {
                "success": False,
                "result": None,
                "error": f"Tool '{tool_name}' not found"
            }

        try:
            # 验证参数
            self._validate_params(params, tool.input_schema)

            # 调用工具处理器
            handler = getattr(self, tool.handler, None)
            if not handler:
                raise ValueError(f"Handler '{tool.handler}' not implemented")

            result = await handler(params)

            return {
                "success": True,
                "result": result,
                "error": None
            }

        except Exception as e:
            logger.error(f"Tool execution failed: {tool_name}, error: {str(e)}")
            return {
                "success": False,
                "result": None,
                "error": str(e)
            }

    def _validate_params(self, params: Dict[str, Any], schema: Dict[str, Any]):
        """验证参数（简化版 JSON Schema 验证）"""
        required = schema.get("required", [])
        properties = schema.get("properties", {})

        # 检查必需参数
        for field in required:
            if field not in params:
                raise ValueError(f"Missing required parameter: {field}")

        # 基础类型检查
        for key, value in params.items():
            if key in properties:
                expected_type = properties[key].get("type")
                if expected_type == "string" and not isinstance(value, str):
                    raise ValueError(f"Parameter '{key}' should be string")
                elif expected_type == "integer" and not isinstance(value, int):
                    raise ValueError(f"Parameter '{key}' should be integer")

    # ==================== 工具处理器实现 ====================

    async def handle_weather(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """天气工具处理器（模拟）"""
        city = params["city"]
        unit = params.get("unit", "celsius")

        # 模拟天气数据
        mock_weather = {
            "北京": {"temp_c": 15, "temp_f": 59, "condition": "晴"},
            "上海": {"temp_c": 20, "temp_f": 68, "condition": "多云"},
            "深圳": {"temp_c": 25, "temp_f": 77, "condition": "阴"},
        }

        weather = mock_weather.get(city, {"temp_c": 18, "temp_f": 64, "condition": "未知"})

        temp = weather[f"temp_{unit[0]}"]

        return {
            "city": city,
            "temperature": temp,
            "unit": unit,
            "condition": weather["condition"],
            "description": f"{city}今天{temp}°{'C' if unit == 'celsius' else 'F'}，{weather['condition']}"
        }

    async def handle_calculate(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """计算工具处理器"""
        expression = params["expression"]

        try:
            # 安全的数学表达式求值（仅允许基本运算）
            allowed_chars = set("0123456789+-*/(). ")
            if not all(c in allowed_chars for c in expression):
                raise ValueError("Invalid characters in expression")

            result = eval(expression, {"__builtins__": {}}, {})

            return {
                "expression": expression,
                "result": result
            }
        except Exception as e:
            raise ValueError(f"Calculation error: {str(e)}")

    async def handle_web_search(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """网络搜索工具处理器（模拟）"""
        query = params["query"]
        limit = params.get("limit", 5)

        # 模拟搜索结果
        mock_results = [
            {
                "title": f"关于 {query} 的结果 {i+1}",
                "url": f"https://example.com/result{i+1}",
                "snippet": f"这是关于 {query} 的第 {i+1} 个搜索结果摘要..."
            }
            for i in range(min(limit, 5))
        ]

        return {
            "query": query,
            "results": mock_results,
            "total": len(mock_results)
        }


# 全局 MCP 客户端实例
mcp_client = MCPClient()
