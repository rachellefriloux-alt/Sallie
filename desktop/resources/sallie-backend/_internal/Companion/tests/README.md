# Test Suite

## Running Tests

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_device_access.py

# Run with coverage
pytest --cov=core --cov-report=html

# Run with verbose output
pytest -v
```

## Test Structure

- `test_device_access.py` - Device access API tests
- `test_smart_home.py` - Smart home integration tests
- `test_agency_safety.py` - Agency and safety tests (existing)

## Coverage Goals

- **Current**: Basic tests for new modules
- **Target**: >80% coverage for all core modules
- **Priority**: P0 features (device access, smart home, sync)

## Notes

- Tests use mocks for external dependencies (Home Assistant API, etc.)
- Platform-specific tests are skipped on incompatible platforms
- Integration tests require running services (Ollama, Qdrant)

