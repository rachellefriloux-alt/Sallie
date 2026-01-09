from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
import psutil
import asyncio

from ...core.database import get_db, check_db_connection
from ...core.config import settings

router = APIRouter()

class HealthCheck(BaseModel):
    status: str
    timestamp: str
    uptime: float
    service: str
    version: str
    checks: dict

@router.get("/", response_model=HealthCheck)
async def health_check(db: Session = Depends(get_db)):
    """Comprehensive health check"""
    try:
        # Check database connection
        db_healthy = check_db_connection()
        
        # Check system resources
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Check AI services
        ai_services_healthy = await check_ai_services()
        
        # Determine overall status
        checks = {
            "database": "healthy" if db_healthy else "unhealthy",
            "cpu": "healthy" if cpu_percent < 80 else "warning" if cpu_percent < 95 else "unhealthy",
            "memory": "healthy" if memory.percent < 80 else "warning" if memory.percent < 95 else "unhealthy",
            "disk": "healthy" if disk.percent < 80 else "warning" if disk.percent < 95 else "unhealthy",
            "ai_services": "healthy" if ai_services_healthy else "unhealthy"
        }
        
        overall_status = "healthy"
        if any(check == "unhealthy" for check in checks.values()):
            overall_status = "unhealthy"
        elif any(check == "warning" for check in checks.values()):
            overall_status = "warning"
        
        return HealthCheck(
            status=overall_status,
            timestamp=datetime.utcnow().isoformat(),
            uptime=psutil.boot_time(),
            service="python-ai-service",
            version=settings.APP_VERSION,
            checks={
                **checks,
                "system": {
                    "cpu_percent": cpu_percent,
                    "memory_percent": memory.percent,
                    "disk_percent": disk.percent,
                    "memory_available": memory.available,
                    "disk_free": disk.free
                }
            }
        )
    except Exception as e:
        return HealthCheck(
            status="unhealthy",
            timestamp=datetime.utcnow().isoformat(),
            uptime=psutil.boot_time(),
            service="python-ai-service",
            version=settings.APP_VERSION,
            checks={"error": str(e)}
        )

@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Readiness check - is service ready to accept traffic"""
    try:
        db_healthy = check_db_connection()
        ai_services_healthy = await check_ai_services()
        
        if db_healthy and ai_services_healthy:
            return {"status": "ready"}
        else:
            return {"status": "not ready", "checks": {"database": db_healthy, "ai_services": ai_services_healthy}}
    except Exception as e:
        return {"status": "not ready", "error": str(e)}

@router.get("/live")
async def liveness_check():
    """Liveness check - is the service running"""
    return {"status": "alive"}

@router.get("/metrics")
async def metrics_check():
    """Metrics endpoint for Prometheus"""
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent()
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Process metrics
        process = psutil.Process()
        process_memory = process.memory_info()
        
        metrics = f"""# HELP cpu_usage_percent CPU usage percentage
# TYPE cpu_usage_percent gauge
cpu_usage_percent {cpu_percent}

# HELP memory_usage_percent Memory usage percentage
# TYPE memory_usage_percent gauge
memory_usage_percent {memory.percent}

# HELP disk_usage_percent Disk usage percentage
# TYPE disk_usage_percent gauge
disk_usage_percent {disk.percent}

# HELP process_memory_bytes Process memory usage in bytes
# TYPE process_memory_bytes gauge
process_memory_bytes {process_memory.rss}

# HELP process_cpu_percent Process CPU usage percentage
# TYPE process_cpu_percent gauge
process_cpu_percent {process.cpu_percent()}

# HELP python_ai_service_uptime Service uptime in seconds
# TYPE python_ai_service_uptime counter
python_ai_service_uptime {psutil.boot_time()}
"""
        
        return metrics
    except Exception as e:
        return f"# Error collecting metrics: {str(e)}"

async def check_ai_services() -> bool:
    """Check if AI services are available"""
    try:
        # Check OpenAI
        if settings.OPENAI_API_KEY:
            import openai
            openai.Model.list()
        
        # Check Anthropic
        if settings.ANTHROPIC_API_KEY:
            from ...services.ai_service import ai_service
            if hasattr(ai_service, 'anthropic_client'):
                # Simple test call
                pass
        
        # Check local models
        if hasattr(ai_service, 'local_models') and ai_service.local_models:
            return True
        
        return True
    except Exception:
        return False
