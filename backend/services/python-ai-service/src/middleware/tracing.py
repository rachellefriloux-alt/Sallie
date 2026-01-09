from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from opentelemetry import trace
from opentelemetry.exporter.jaeger.thrift import JaegerExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.sdk.resources import SERVICE_NAME, RESOURCE
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class TracingMiddleware(BaseHTTPMiddleware):
    """Middleware for OpenTelemetry tracing"""
    
    def __init__(self, app):
        super().__init__(app)
        self._setup_tracing()
    
    def _setup_tracing(self):
        """Setup OpenTelemetry tracing"""
        try:
            if settings.JAEGER_ENDPOINT:
                # Configure Jaeger exporter
                jaeger_exporter = JaegerExporter(
                    agent_host_name="localhost",
                    agent_port=6831,
                    endpoint=settings.JAEGER_ENDPOINT,
                )
                
                # Configure tracer provider
                trace.set_tracer_provider(
                    TracerProvider(
                        resource=RESOURCE.create(
                            {
                                SERVICE_NAME: settings.APP_NAME,
                                SERVICE_VERSION: settings.APP_VERSION,
                            }
                        )
                    )
                )
                
                # Add span processor
                tracer_provider = trace.get_tracer_provider()
                span_processor = BatchSpanProcessor(jaeger_exporter)
                tracer_provider.add_span_processor(span_processor)
                
                # Instrument FastAPI and HTTPX
                FastAPIInstrumentor.instrument_app(self.app)
                HTTPXClientInstrumentor.instrument()
                
                logger.info("OpenTelemetry tracing initialized")
            else:
                logger.info("Jaeger endpoint not configured, tracing disabled")
        except Exception as e:
            logger.error(f"Failed to setup tracing: {e}")
    
    async def dispatch(self, request: Request, call_next):
        """Add tracing to requests"""
        tracer = trace.get_tracer(__name__)
        
        with tracer.start_as_current_span(
            f"{request.method} {request.url.path}",
            kind=trace.SpanKind.SERVER,
            attributes={
                "http.method": request.method,
                "http.url": str(request.url),
                "http.target": request.url.path,
                "http.host": request.url.hostname,
                "http.scheme": request.url.scheme,
                "user.agent": request.headers.get("user-agent", ""),
            },
        ) as span:
            try:
                response = await call_next(request)
                
                span.set_attributes({
                    "http.status_code": response.status_code,
                })
                
                if response.status_code >= 400:
                    span.set_status(trace.Status.ERROR)
                else:
                    span.set_status(trace.Status.OK)
                
                return response
                
            except Exception as e:
                span.set_status(trace.Status.ERROR)
                span.record_exception(e)
                raise

# Function to get current span
def get_current_span():
    """Get the current OpenTelemetry span"""
    return trace.get_current_span()

# Function to add attributes to current span
def add_span_attribute(key: str, value: str):
    """Add attribute to current span"""
    span = get_current_span()
    if span:
        span.set_attribute(key, value)

# Function to add event to current span
def add_span_event(name: str, attributes: dict = None):
    """Add event to current span"""
    span = get_current_span()
    if span:
        span.add_event(name, attributes or {})
