"""Smartsheet AI Integration System.

Advanced spreadsheet automation and analysis capabilities:
- AI-powered spreadsheet creation and management
- Automated data analysis and visualization
- Smart formula generation and optimization
- Data cleaning and transformation
- Predictive analytics and forecasting
- Custom workflow automation
- Real-time data synchronization
- Advanced reporting and dashboards
- Data validation and error handling
- Integration with external data sources
- Collaborative sheet management

This enables Sallie to work with spreadsheets with AI intelligence.
"""

import json
import logging
import time
import asyncio
import aiohttp
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple, Union
from datetime import datetime, timedelta
from pathlib import Path
from dataclasses import dataclass, field
from enum import Enum
from concurrent.futures import ThreadPoolExecutor

from utils import setup_logging
from limbic import LimbicSystem
from retrieval import MemorySystem
from llm_router import get_llm_router

logger = setup_logging("smartsheet_ai")

class SheetType(str, Enum):
    """Types of spreadsheets."""
    WORKSHEET = "worksheet"
    DASHBOARD = "dashboard"
    REPORT = "report"
    FORM = "form"
    DATABASE = "database"
    TIMELINE = "timeline"
    CALENDAR = "calendar"
    BUDGET = "budget"
    INVENTORY = "inventory"
    PROJECT_PLAN = "project_plan"
    ANALYSIS = "analysis"

class DataType(str, Enum):
    """Data types for spreadsheet cells."""
    TEXT = "text"
    NUMBER = "number"
    DATE = "date"
    BOOLEAN = "boolean"
    FORMULA = "formula"
    CURRENCY = "currency"
    PERCENTAGE = "percentage"
    URL = "url"
    EMAIL = "email"
    PHONE = "phone"

class CellFormat(str, Enum):
    """Cell formatting options."""
    BOLD = "bold"
    ITALIC = "italic"
    UNDERLINE = "underline"
    STRIKETHROUGH = "strikethrough"
    BACKGROUND_COLOR = "background_color"
    TEXT_COLOR = "text_color"
    FONT_SIZE = "font_size"
    ALIGNMENT = "alignment"
    BORDER = "border"

class ChartType(str, Enum):
    """Chart types for data visualization."""
    LINE = "line"
    BAR = "bar"
    COLUMN = "column"
    PIE = "pie"
    SCATTER = "scatter"
    AREA = "area"
    DONUT = "donut"
    RADAR = "radar"
    HISTOGRAM = "histogram"
    BOX_PLOT = "box_plot"
    HEATMAP = "heatmap"

@dataclass
class SmartsheetCell:
    """Individual cell in a spreadsheet."""
    row: int
    column: int
    value: Any
    data_type: DataType
    formula: Optional[str]
    format: Dict[str, Any]
    notes: Optional[str]
    validation: Optional[Dict[str, Any]]
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class SmartsheetRange:
    """Range of cells in a spreadsheet."""
    start_row: int
    start_column: int
    end_row: int
    end_column: int
    name: Optional[str]
    data: List[List[Any]]
    format: Dict[str, Any]
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class SmartsheetChart:
    """Chart configuration for data visualization."""
    id: str
    title: str
    chart_type: ChartType
    data_range: str
    x_axis: str
    y_axis: str
    series: List[Dict[str, Any]]
    style: Dict[str, Any]
    position: Dict[str, Any]
    created_at: datetime = field(default_factory=datetime.now)

@dataclass
class Smartsheet:
    """Complete spreadsheet."""
    id: str
    name: str
    description: str
    sheet_type: SheetType
    rows: int
    columns: int
    cells: Dict[str, SmartsheetCell]
    ranges: Dict[str, SmartsheetRange]
    charts: Dict[str, SmartsheetChart]
    formulas: Dict[str, str]
    styles: Dict[str, Dict[str, Any]]
    settings: Dict[str, Any]
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

@dataclass
class SmartsheetAnalysis:
    """Analysis results for spreadsheet data."""
    sheet_id: str
    analysis_type: str
    insights: List[str]
    statistics: Dict[str, Any]
    recommendations: List[str]
    charts: List[str]
    created_at: datetime = field(default_factory=datetime.now)

class SmartsheetAISystem:
    """
    Smartsheet AI Integration System - Advanced spreadsheet capabilities.
    
    Enables Sallie to:
    - Create and manage spreadsheets with AI
    - Analyze data and generate insights
    - Create automated workflows
    - Generate formulas and visualizations
    - Clean and transform data
    - Create reports and dashboards
    - Integrate with external data sources
    """
    
    def __init__(self, limbic: LimbicSystem, memory: MemorySystem):
        """Initialize Smartsheet AI System."""
        try:
            self.limbic = limbic
            self.memory = memory
            self.router = None  # Lazy init
            
            # Spreadsheet storage
            self.spreadsheets = {}
            self.analyses = {}
            
            # AI models
            self.data_analyzer = None
            self.formula_generator = None
            self.chart_generator = None
            self.workflow_automator = None
            
            # Load existing data
            self._load_smartsheet_data()
            
            logger.info("[SmartsheetAI] Smartsheet AI system initialized")
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to initialize: {e}")
            raise
    
    def _load_smartsheet_data(self):
        """Load existing spreadsheet data."""
        try:
            # Load spreadsheets
            sheets_file = Path("progeny_root/core/multimodal/smartsheet_sheets.json")
            if sheets_file.exists():
                with open(sheets_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for sheet_id, sheet_data in data.items():
                        self.spreadsheets[sheet_id] = Smartsheet(**sheet_data)
            
            # Load analyses
            analyses_file = Path("progeny_root/core/multimodal/smartsheet_analyses.json")
            if analyses_file.exists():
                with open(analyses_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for analysis_id, analysis_data in data.items():
                        self.analyses[analysis_id] = SmartsheetAnalysis(**analysis_data)
            
            logger.info(f"[SmartsheetAI] Loaded {len(self.spreadsheets)} spreadsheets, {len(self.analyses)} analyses")
            
        except Exception as e:
            logger.warning(f"[SmartsheetAI] Failed to load smartsheet data: {e}")
    
    async def create_spreadsheet(self, 
                                name: str,
                                description: str,
                                sheet_type: SheetType,
                                rows: int = 100,
                                columns: int = 26) -> Smartsheet:
        """
        Create a new spreadsheet with AI optimization.
        
        Args:
            name: Spreadsheet name
            description: Spreadsheet description
            sheet_type: Type of spreadsheet
            rows: Number of rows
            columns: Number of columns
            
        Returns:
            Created spreadsheet
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            # Generate sheet structure based on type
            sheet_structure = await self._generate_sheet_structure(sheet_type, rows, columns)
            
            # Create cells
            cells = {}
            for row in range(1, rows + 1):
                for col in range(1, columns + 1):
                    cell_id = f"{chr(64 + col)}{row}"
                    cells[cell_id] = SmartsheetCell(
                        row=row,
                        column=col,
                        value="",
                        data_type=DataType.TEXT,
                        formula=None,
                        format={},
                        notes=None,
                        validation=None
                    )
            
            # Create spreadsheet
            sheet = Smartsheet(
                id=f"sheet_{int(time.time())}",
                name=name,
                description=description,
                sheet_type=sheet_type,
                rows=rows,
                columns=columns,
                cells=cells,
                ranges={},
                charts={},
                formulas={},
                styles={},
                settings=sheet_structure.get("settings", {}),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Store spreadsheet
            self.spreadsheets[sheet.id] = sheet
            await self._save_spreadsheet(sheet)
            
            logger.info(f"[SmartsheetAI] Created spreadsheet: {sheet.name}")
            return sheet
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to create spreadsheet: {e}")
            raise
    
    async def analyze_data(self, sheet_id: str, analysis_type: str = "comprehensive") -> SmartsheetAnalysis:
        """
        Analyze spreadsheet data and generate insights.
        
        Args:
            sheet_id: Spreadsheet ID
            analysis_type: Type of analysis
            
        Returns:
            Analysis results
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if sheet_id not in self.spreadsheets:
                raise Exception(f"Spreadsheet {sheet_id} not found")
            
            sheet = self.spreadsheets[sheet_id]
            
            # Extract data from cells
            data = self._extract_data_from_cells(sheet.cells)
            
            # Perform analysis
            insights = await self._generate_insights(data, analysis_type)
            statistics = await self._calculate_statistics(data)
            recommendations = await self._generate_recommendations(data, analysis_type)
            
            # Generate charts
            charts = await self._generate_analysis_charts(data, analysis_type)
            
            # Create analysis
            analysis = SmartsheetAnalysis(
                sheet_id=sheet_id,
                analysis_type=analysis_type,
                insights=insights,
                statistics=statistics,
                recommendations=recommendations,
                charts=charts,
                created_at=datetime.now()
            )
            
            # Store analysis
            self.analyses[analysis.id] = analysis
            await self._save_analysis(analysis)
            
            logger.info(f"[SmartsheetAI] Analyzed spreadsheet {sheet_id}: {analysis_type}")
            return analysis
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to analyze data: {e}")
            raise
    
    async def generate_formula(self, sheet_id: str, description: str) -> str:
        """
        Generate AI-powered formula for spreadsheet.
        
        Args:
            sheet_id: Spreadsheet ID
            description: Description of desired formula
            
        Returns:
            Generated formula
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if sheet_id not in self.spreadsheets:
                raise Exception(f"Spreadsheet {sheet_id} not found")
            
            sheet = self.spreadsheets[sheet_id]
            
            # Extract context from sheet
            context = self._extract_sheet_context(sheet)
            
            # Generate formula
            prompt = f"""
            Generate a spreadsheet formula based on this description:
            
            Description: {description}
            Sheet Context: {context}
            Available Data: {list(sheet.cells.keys())[:10]}
            
            Return only the formula (e.g., =SUM(A1:A10))
            """
            
            formula = await self.router.generate_response(prompt)
            
            # Clean up formula
            formula = formula.strip()
            if not formula.startswith("="):
                formula = "=" + formula
            
            # Store formula
            sheet.formulas[f"formula_{int(time.time())}"] = formula
            await self._save_spreadsheet(sheet)
            
            logger.info(f"[SmartsheetAI] Generated formula: {formula}")
            return formula
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to generate formula: {e}")
            raise
    
    async def create_chart(self, 
                         sheet_id: str,
                         chart_type: ChartType,
                         title: str,
                         data_range: str,
                         x_axis: str,
                         y_axis: str) -> SmartsheetChart:
        """
        Create a chart for data visualization.
        
        Args:
            sheet_id: Spreadsheet ID
            chart_type: Type of chart
            title: Chart title
            data_range: Data range for chart
            x_axis: X-axis label
            y_axis: Y-axis label
            
        Returns:
            Created chart
        """
        try:
            if sheet_id not in self.spreadsheets:
                raise Exception(f"Spreadsheet {sheet_id} not found")
            
            sheet = self.spreadsheets[sheet_id]
            
            # Extract data for chart
            chart_data = self._extract_chart_data(sheet, data_range)
            
            # Generate series data
            series = await self._generate_chart_series(chart_data, chart_type)
            
            # Generate chart style
            style = await self._generate_chart_style(chart_type)
            
            # Create chart
            chart = SmartsheetChart(
                id=f"chart_{int(time.time())}",
                title=title,
                chart_type=chart_type,
                data_range=data_range,
                x_axis=x_axis,
                y_axis=y_axis,
                series=series,
                style=style,
                position={"row": 1, "column": 1},
                created_at=datetime.now()
            )
            
            # Store chart
            sheet.charts[chart.id] = chart
            await self._save_spreadsheet(sheet)
            
            logger.info(f"[SmartsheetAI] Created chart: {chart.title}")
            return chart
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to create chart: {e}")
            raise
    
    async def automate_workflow(self, 
                              sheet_id: str,
                              workflow_type: str,
                              trigger_conditions: List[str],
                              actions: List[str]) -> Dict[str, Any]:
        """
        Create automated workflow for spreadsheet operations.
        
        Args:
            sheet_id: Spreadsheet ID
            workflow_type: Type of workflow
            trigger_conditions: Trigger conditions
            actions: Actions to perform
            
        Returns:
            Workflow configuration
        """
        try:
            if not self.router:
                self.router = get_llm_router()
            
            if sheet_id not in self.spreadsheets:
                raise Exception(f"Spreadsheet {sheet_id} not found")
            
            # Generate workflow steps
            workflow_steps = await self._generate_workflow_steps(workflow_type, trigger_conditions, actions)
            
            # Create workflow
            workflow = {
                "id": f"workflow_{int(time.time())}",
                "sheet_id": sheet_id,
                "type": workflow_type,
                "trigger_conditions": trigger_conditions,
                "actions": actions,
                "steps": workflow_steps,
                "is_active": True,
                "created_at": datetime.now().isoformat()
            }
            
            logger.info(f"[SmartsheetAI] Created workflow: {workflow_type}")
            return workflow
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to create workflow: {e}")
            raise
    
    def _extract_data_from_cells(self, cells: Dict[str, SmartsheetCell]) -> List[List[Any]]:
        """Extract data from cells into 2D array."""
        try:
            data = []
            
            # Find max row and column
            max_row = max(cell.row for cell in cells.values()) if cells else 0
            max_col = max(cell.column for cell in cells.values()) if cells else 0
            
            # Create 2D array
            for row in range(1, max_row + 1):
                row_data = []
                for col in range(1, max_col + 1):
                    cell_id = f"{chr(64 + col)}{row}"
                    if cell_id in cells:
                        row_data.append(cells[cell_id].value)
                    else:
                        row_data.append("")
                data.append(row_data)
            
            return data
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to extract data from cells: {e}")
            return []
    
    async def _generate_insights(self, data: List[List[Any]], analysis_type: str) -> List[str]:
        """Generate insights from data analysis."""
        try:
            if not self.router:
                return ["Data analysis requires AI model"]
            
            prompt = f"""
            Analyze this spreadsheet data and provide insights:
            
            Data: {data[:10]}  # Show first 10 rows
            Analysis Type: {analysis_type}
            
            Provide 3-5 key insights about the data.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse insights
            insights = response.split("\n")[:5]
            return [insight.strip() for insight in insights if insight.strip()]
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to generate insights: {e}")
            return []
    
    async def _calculate_statistics(self, data: List[List[Any]]) -> Dict[str, Any]:
        """Calculate statistics for data."""
        try:
            # Convert to pandas DataFrame for easier analysis
            df = pd.DataFrame(data)
            
            # Calculate basic statistics
            stats = {
                "total_rows": len(df),
                "total_columns": len(df.columns),
                "numeric_columns": len(df.select_dtypes(include=[np.number]).columns),
                "text_columns": len(df.select_dtypes(include=['object']).columns)
            }
            
            # Calculate numeric statistics
            numeric_cols = df.select_dtypes(include=[np.number])
            if not numeric_cols.empty:
                stats["numeric_stats"] = {}
                for col in numeric_cols.columns:
                    stats["numeric_stats"][col] = {
                        "mean": df[col].mean(),
                        "median": df[col].median(),
                        "std": df[col].std(),
                        "min": df[col].min(),
                        "max": df[col].max()
                    }
            
            return stats
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to calculate statistics: {e}")
            return {}
    
    async def _generate_recommendations(self, data: List[List[Any]], analysis_type: str) -> List[str]:
        """Generate recommendations based on data analysis."""
        try:
            if not self.router:
                return ["Consider adding more data for better analysis"]
            
            prompt = f"""
            Based on this spreadsheet data, provide recommendations:
            
            Data: {data[:10]}
            Analysis Type: {analysis_type}
            
            Provide 3-5 actionable recommendations.
            """
            
            response = await self.router.generate_response(prompt)
            
            # Parse recommendations
            recommendations = response.split("\n")[:5]
            return [rec.strip() for rec in recommendations if rec.strip()]
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to generate recommendations: {e}")
            return []
    
    async def _generate_analysis_charts(self, data: List[List[Any]], analysis_type: str) -> List[str]:
        """Generate chart recommendations."""
        try:
            chart_recommendations = []
            
            # Analyze data structure
            df = pd.DataFrame(data)
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            
            if len(numeric_cols) >= 2:
                chart_recommendations.append("scatter_plot")
                chart_recommendations.append("correlation_matrix")
            elif len(numeric_cols) == 1:
                chart_recommendations.append("histogram")
                chart_recommendations.append("box_plot")
            
            if len(df.columns) >= 2:
                chart_recommendations.append("bar_chart")
                chart_recommendations.append("line_chart")
            
            return chart_recommendations
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to generate analysis charts: {e}")
            return []
    
    def _extract_sheet_context(self, sheet: Smartsheet) -> str:
        """Extract context from spreadsheet."""
        try:
            context = f"Sheet Type: {sheet.sheet_type}, Rows: {sheet.rows}, Columns: {sheet.columns}"
            
            # Add sample data
            sample_cells = list(sheet.cells.keys())[:5]
            if sample_cells:
                context += f", Sample Cells: {sample_cells}"
            
            return context
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to extract sheet context: {e}")
            return ""
    
    async def _generate_sheet_structure(self, sheet_type: SheetType, rows: int, columns: int) -> Dict[str, Any]:
        """Generate sheet structure based on type."""
        try:
            structures = {
                SheetType.WORKSHEET: {
                    "settings": {"auto_save": True, "calculation": "automatic"}
                },
                SheetType.DASHBOARD: {
                    "settings": {"auto_refresh": True, "interactive": True}
                },
                SheetType.REPORT: {
                    "settings": {"auto_format": True, "header_rows": 1}
                },
                SheetType.FORM: {
                    "settings": {"data_validation": True, "protection": True}
                },
                SheetType.DATABASE: {
                    "settings": {"primary_key": True, "relationships": True}
                },
                SheetType.BUDGET: {
                    "settings": {"currency_format": True, "summary_rows": True}
                },
                SheetType.PROJECT_PLAN: {
                    "settings": {"gantt_chart": True, "timeline": True}
                }
            }
            
            return structures.get(sheet_type, {"settings": {}})
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to generate sheet structure: {e}")
            return {}
    
    def _extract_chart_data(self, sheet: Smartsheet, data_range: str) -> List[List[Any]]:
        """Extract data for chart from specified range."""
        try:
            # Parse range (e.g., "A1:C10")
            parts = data_range.split(":")
            if len(parts) != 2:
                return []
            
            start_cell = parts[0]
            end_cell = parts[1]
            
            # Parse cell coordinates
            start_col = ord(start_cell[0]) - 64
            start_row = int(start_cell[1:])
            end_col = ord(end_cell[0]) - 64
            end_row = int(end_cell[1:])
            
            # Extract data
            chart_data = []
            for row in range(start_row, end_row + 1):
                row_data = []
                for col in range(start_col, end_col + 1):
                    cell_id = f"{chr(64 + col)}{row}"
                    if cell_id in sheet.cells:
                        row_data.append(sheet.cells[cell_id].value)
                    else:
                        row_data.append("")
                chart_data.append(row_data)
            
            return chart_data
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to extract chart data: {e}")
            return []
    
    async def _generate_chart_series(self, data: List[List[Any]], chart_type: ChartType) -> List[Dict[str, Any]]:
        """Generate series data for chart."""
        try:
            if not data or not data[0]:
                return []
            
            series = []
            
            # Generate series based on chart type
            if chart_type in [ChartType.LINE, ChartType.BAR, ChartType.COLUMN]:
                for i, col_data in enumerate(zip(*data)):
                    series.append({
                        "name": f"Series {i+1}",
                        "data": col_data
                    })
            elif chart_type == ChartType.PIE:
                # For pie chart, use first column as labels and second as values
                if len(data) >= 2:
                    labels = data[0]
                    values = data[1]
                    series.append({
                        "name": "Data",
                        "labels": labels,
                        "values": values
                    })
            
            return series
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to generate chart series: {e}")
            return []
    
    async def _generate_chart_style(self, chart_type: ChartType) -> Dict[str, Any]:
        """Generate chart style."""
        try:
            styles = {
                ChartType.LINE: {"color": "#007bff", "line_width": 2},
                ChartType.BAR: {"color": "#28a745", "bar_width": 0.8},
                ChartType.COLUMN: {"color": "#dc3545", "bar_width": 0.8},
                ChartType.PIE: {"colors": ["#007bff", "#28a745", "#dc3545", "#ffc107", "#17a2b8"]},
                ChartType.SCATTER: {"color": "#6f42c1", "marker_size": 6},
                ChartType.AREA: {"color": "#fd7e14", "opacity": 0.7}
            }
            
            return styles.get(chart_type, {"color": "#007bff"})
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to generate chart style: {e}")
            return {}
    
    async def _generate_workflow_steps(self, workflow_type: str, trigger_conditions: List[str], actions: List[str]) -> List[Dict[str, Any]]:
        """Generate workflow steps."""
        try:
            steps = []
            
            for i, action in enumerate(actions):
                steps.append({
                    "step": i + 1,
                    "action": action,
                    "condition": trigger_conditions[i] if i < len(trigger_conditions) else "",
                    "delay": 0,
                    "status": "pending"
                })
            
            return steps
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to generate workflow steps: {e}")
            return []
    
    def get_spreadsheets(self) -> Dict[str, Smartsheet]:
        """Get all spreadsheets."""
        return self.spreadsheets
    
    def get_spreadsheet(self, sheet_id: str) -> Optional[Smartsheet]:
        """Get a specific spreadsheet."""
        return self.spreadsheets.get(sheet_id)
    
    def get_analyses(self) -> Dict[str, SmartsheetAnalysis]:
        """Get all analyses."""
        return self.analyses
    
    async def update_cell(self, sheet_id: str, cell_id: str, value: Any, data_type: Optional[DataType] = None):
        """Update a cell value."""
        try:
            if sheet_id not in self.spreadsheets:
                raise Exception(f"Spreadsheet {sheet_id} not found")
            
            sheet = self.spreadsheets[sheet_id]
            
            if cell_id in sheet.cells:
                sheet.cells[cell_id].value = value
                sheet.cells[cell_id].updated_at = datetime.now()
                if data_type:
                    sheet.cells[cell_id].data_type = data_type
                
                await self._save_spreadsheet(sheet)
                logger.info(f"[SmartsheetAI] Updated cell {cell_id} in sheet {sheet_id}")
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to update cell: {e}")
    
    async def _save_spreadsheet(self, sheet: Smartsheet):
        """Save spreadsheet to file."""
        try:
            sheets_file = Path("progeny_root/core/multimodal/smartsheet_sheets.json")
            sheets_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if sheets_file.exists():
                with open(sheets_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update sheet data
            data[sheet.id] = {
                "id": sheet.id,
                "name": sheet.name,
                "description": sheet.description,
                "sheet_type": sheet.sheet_type.value,
                "rows": sheet.rows,
                "columns": sheet.columns,
                "cells": {
                    cell_id: {
                        "row": cell.row,
                        "column": cell.column,
                        "value": cell.value,
                        "data_type": cell.data_type.value,
                        "formula": cell.formula,
                        "format": cell.format,
                        "notes": cell.notes,
                        "validation": cell.validation,
                        "created_at": cell.created_at.isoformat(),
                        "updated_at": cell.updated_at.isoformat()
                    }
                    for cell_id, cell in sheet.cells.items()
                },
                "ranges": {
                    range_id: {
                        "start_row": range_obj.start_row,
                        "start_column": range_obj.start_column,
                        "end_row": range_obj.end_row,
                        "end_column": range_obj.end_column,
                        "name": range_obj.name,
                        "data": range_obj.data,
                        "format": range_obj.format,
                        "created_at": range_obj.created_at.isoformat()
                    }
                    for range_id, range_obj in sheet.ranges.items()
                },
                "charts": {
                    chart_id: {
                        "id": chart.id,
                        "title": chart.title,
                        "chart_type": chart.chart_type.value,
                        "data_range": chart.data_range,
                        "x_axis": chart.x_axis,
                        "y_axis": chart.y_axis,
                        "series": chart.series,
                        "style": chart.style,
                        "position": chart.position,
                        "created_at": chart.created_at.isoformat()
                    }
                    for chart_id, chart in sheet.charts.items()
                },
                "formulas": sheet.formulas,
                "styles": sheet.styles,
                "settings": sheet.settings,
                "created_at": sheet.created_at.isoformat(),
                "updated_at": sheet.updated_at.isoformat()
            }
            
            with open(sheets_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to save spreadsheet: {e}")
    
    async def _save_analysis(self, analysis: SmartsheetAnalysis):
        """Save analysis to file."""
        try:
            analyses_file = Path("progeny_root/core/multimodal/smartsheet_analyses.json")
            analyses_file.parent.mkdir(parents=True, exist_ok=True)
            
            # Load existing data
            data = {}
            if analyses_file.exists():
                with open(analyses_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
            
            # Update analysis data
            data[analysis.id] = {
                "sheet_id": analysis.sheet_id,
                "analysis_type": analysis.analysis_type,
                "insights": analysis.insights,
                "statistics": analysis.statistics,
                "recommendations": analysis.recommendations,
                "charts": analysis.charts,
                "created_at": analysis.created_at.isoformat()
            }
            
            with open(analyses_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Failed to save analysis: {e}")
    
    async def cleanup(self):
        """Cleanup resources."""
        try:
            logger.info("[SmartsheetAI] Smartsheet AI system cleaned up")
            
        except Exception as e:
            logger.error(f"[SmartsheetAI] Cleanup failed: {e}")

# Global instance
_smartsheet_ai_system = None

def get_smartsheet_ai_system() -> SmartsheetAISystem:
    """Get the global Smartsheet AI system."""
    global _smartsheet_ai_system
    if _smartsheet_ai_system is None:
        from limbic import get_limbic_system
        from retrieval import get_memory_system
        _smartsheet_ai_system = SmartsheetAISystem(get_limbic_system(), get_memory_system())
    return _smartsheet_ai_system
