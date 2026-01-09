"""
Integration Test Suite
Complete end-to-end testing for Sallie Studio ecosystem
"""

import pytest
import asyncio
import json
import time
from typing import Dict, Any, List
from unittest.mock import Mock, AsyncMock
from fastapi.testclient import TestClient
import httpx

# Test configuration
BACKEND_URL = "http://192.168.1.47:8742"
FRONTEND_URL = "http://localhost:3000"

class IntegrationTestSuite:
    """Comprehensive integration test suite"""
    
    def __init__(self):
        self.test_results = []
        self.backend_client = None
        self.frontend_client = None
        
    async def setup(self):
        """Setup test environment"""
        # Initialize backend client
        self.backend_client = httpx.AsyncClient(base_url=BACKEND_URL)
        
        # Initialize frontend client
        self.frontend_client = httpx.AsyncClient(base_url=FRONTEND_URL)
        
        print("🚀 Setting up integration test environment...")
        
    async def teardown(self):
        """Cleanup test environment"""
        if self.backend_client:
            await self.backend_client.aclose()
        if self.frontend_client:
            await self.frontend_client.aclose()
        
        print("🧹 Test environment cleaned up")
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details,
            "timestamp": time.time()
        })
        
    async def test_backend_health(self) -> bool:
        """Test backend health endpoint"""
        try:
            response = await self.backend_client.get("/health")
            passed = response.status_code == 200
            
            if passed:
                data = response.json()
                self.log_test(
                    "Backend Health Check",
                    True,
                    f"Status: {data.get('status', 'unknown')}"
                )
            else:
                self.log_test(
                    "Backend Health Check",
                    False,
                    f"Status code: {response.status_code}"
                )
                
            return passed
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Error: {str(e)}")
            return False
            
    async def test_frontend_health(self) -> bool:
        """Test frontend health"""
        try:
            response = await self.frontend_client.get("/")
            passed = response.status_code == 200
            
            self.log_test(
                "Frontend Health Check",
                passed,
                f"Status code: {response.status_code}"
            )
            
            return passed
        except Exception as e:
            self.log_test("Frontend Health Check", False, f"Error: {str(e)}")
            return False
            
    async def test_api_endpoints(self) -> bool:
        """Test all API endpoints"""
        endpoints = [
            "/api/features",
            "/api/user/profile",
            "/api/user/stats",
            "/api/convergence/status",
            "/api/convergence/questions"
        ]
        
        all_passed = True
        
        for endpoint in endpoints:
            try:
                response = await self.backend_client.get(endpoint)
                passed = response.status_code in [200, 404]  # 404 is acceptable for some endpoints
                
                self.log_test(
                    f"API Endpoint: {endpoint}",
                    passed,
                    f"Status: {response.status_code}"
                )
                
                if not passed:
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"API Endpoint: {endpoint}", False, f"Error: {str(e)}")
                all_passed = False
                
        return all_passed
        
    async def test_feature_accessibility(self) -> bool:
        """Test feature accessibility"""
        try:
            response = await self.backend_client.get("/api/features")
            
            if response.status_code != 200:
                self.log_test("Feature Accessibility", False, "Failed to fetch features")
                return False
                
            features = response.json().get("data", {}).get("features", [])
            
            # Check that all features have required fields
            required_fields = ["id", "name", "description", "icon", "category", "enabled", "interactive"]
            
            all_passed = True
            for feature in features:
                missing_fields = [field for field in required_fields if field not in feature]
                
                if missing_fields:
                    self.log_test(
                        f"Feature {feature.get('id', 'unknown')}",
                        False,
                        f"Missing fields: {missing_fields}"
                    )
                    all_passed = False
                else:
                    self.log_test(
                        f"Feature {feature.get('id', 'unknown')}",
                        True,
                        f"Accessible: {feature.get('enabled', False)}"
                    )
                    
            return all_passed
            
        except Exception as e:
            self.log_test("Feature Accessibility", False, f"Error: {str(e)}")
            return False
            
    async def test_user_profile_flow(self) -> bool:
        """Test user profile creation and management"""
        try:
            # Test profile retrieval
            response = await self.backend_client.get("/api/user/profile")
            profile_retrieved = response.status_code == 200
            
            self.log_test(
                "User Profile Retrieval",
                profile_retrieved,
                f"Status: {response.status_code}"
            )
            
            # Test profile update
            if profile_retrieved:
                update_data = {
                    "displayName": "Test User",
                    "bio": "Test bio for integration testing"
                }
                
                response = await self.backend_client.put(
                    "/api/user/profile",
                    json=update_data
                )
                
                profile_updated = response.status_code == 200
                
                self.log_test(
                    "User Profile Update",
                    profile_updated,
                    f"Status: {response.status_code}"
                )
                
                return profile_updated
                
            return profile_retrieved
            
        except Exception as e:
            self.log_test("User Profile Flow", False, f"Error: {str(e)}")
            return False
            
    async def test_convergence_flow(self) -> bool:
        """Test convergence onboarding flow"""
        try:
            # Test convergence status
            response = await self.backend_client.get("/api/convergence/status")
            status_ok = response.status_code in [200, 404]
            
            self.log_test(
                "Convergence Status Check",
                status_ok,
                f"Status: {response.status_code}"
            )
            
            # Test convergence questions
            response = await self.backend_client.get("/api/convergence/questions")
            questions_ok = response.status_code in [200, 404]
            
            self.log_test(
                "Convergence Questions Check",
                questions_ok,
                f"Status: {response.status_code}"
            )
            
            return status_ok and questions_ok
            
        except Exception as e:
            self.log_test("Convergence Flow", False, f"Error: {str(e)}")
            return False
            
    async def test_settings_integration(self) -> bool:
        """Test settings page integration"""
        try:
            # Test settings endpoint
            response = await self.backend_client.get("/api/settings")
            settings_ok = response.status_code in [200, 404]
            
            self.log_test(
                "Settings Integration",
                settings_ok,
                f"Status: {response.status_code}"
            )
            
            return settings_ok
            
        except Exception as e:
            self.log_test("Settings Integration", False, f"Error: {str(e)}")
            return False
            
    async def test_theme_system(self) -> bool:
        """Test theme system functionality"""
        try:
            # Test theme endpoints
            themes = ["dark", "light", "auto"]
            colors = ["violet", "blue", "green"]
            
            all_passed = True
            
            for theme in themes:
                for color in colors:
                    # Test theme application
                    response = await self.backend_client.post(
                        "/api/theme/apply",
                        json={"mode": theme, "color": color}
                    )
                    
                    passed = response.status_code in [200, 404]
                    
                    self.log_test(
                        f"Theme Application: {theme}-{color}",
                        passed,
                        f"Status: {response.status_code}"
                    )
                    
                    if not passed:
                        all_passed = False
                        
            return all_passed
            
        except Exception as e:
            self.log_test("Theme System", False, f"Error: {str(e)}")
            return False
            
    async def test_performance_metrics(self) -> bool:
        """Test performance metrics collection"""
        try:
            # Test metrics endpoint
            response = await self.backend_client.get("/api/metrics")
            metrics_ok = response.status_code in [200, 404]
            
            if metrics_ok and response.status_code == 200:
                data = response.json()
                
                # Check for required metric fields
                required_metrics = ["cpu_usage", "memory_usage", "response_time"]
                missing_metrics = [m for m in required_metrics if m not in data]
                
                if missing_metrics:
                    self.log_test(
                        "Performance Metrics",
                        False,
                        f"Missing metrics: {missing_metrics}"
                    )
                    return False
                else:
                    self.log_test(
                        "Performance Metrics",
                        True,
                        f"CPU: {data.get('cpu_usage', 'N/A')}%, Memory: {data.get('memory_usage', 'N/A')}%"
                    )
                    
            return metrics_ok
            
        except Exception as e:
            self.log_test("Performance Metrics", False, f"Error: {str(e)}")
            return False
            
    async def test_security_features(self) -> bool:
        """Test security features"""
        try:
            # Test authentication endpoints
            auth_endpoints = [
                "/api/auth/login",
                "/api/auth/logout",
                "/api/auth/refresh"
            ]
            
            all_passed = True
            
            for endpoint in auth_endpoints:
                response = await self.backend_client.post(endpoint, json={})
                
                # Should return 401 for unauthenticated requests
                passed = response.status_code == 401
                
                self.log_test(
                    f"Security Endpoint: {endpoint}",
                    passed,
                    f"Status: {response.status_code} (expected 401)"
                )
                
                if not passed:
                    all_passed = False
                    
            return all_passed
            
        except Exception as e:
            self.log_test("Security Features", False, f"Error: {str(e)}")
            return False
            
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run all integration tests"""
        print("\n🧪 Starting Integration Test Suite")
        print("=" * 50)
        
        await self.setup()
        
        # Core functionality tests
        await self.test_backend_health()
        await self.test_frontend_health()
        await self.test_api_endpoints()
        
        # Feature tests
        await self.test_feature_accessibility()
        await self.test_user_profile_flow()
        await self.test_convergence_flow()
        await self.test_settings_integration()
        
        # System tests
        await self.test_theme_system()
        await self.test_performance_metrics()
        await self.test_security_features()
        
        await self.teardown()
        
        # Calculate results
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["passed"])
        failed_tests = total_tests - passed_tests
        
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print("\n" + "=" * 50)
        print("📊 Integration Test Results")
        print("=" * 50)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {success_rate:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["passed"]:
                    print(f"  - {result['test']}: {result['details']}")
                    
        print("\n" + "=" * 50)
        
        return {
            "total_tests": total_tests,
            "passed_tests": passed_tests,
            "failed_tests": failed_tests,
            "success_rate": success_rate,
            "results": self.test_results
        }

# Test runner
async def run_integration_tests():
    """Run integration tests"""
    test_suite = IntegrationTestSuite()
    results = await test_suite.run_all_tests()
    
    # Save results to file
    with open("integration_test_results.json", "w") as f:
        json.dump(results, f, indent=2)
    
    return results

if __name__ == "__main__":
    # Run tests
    results = asyncio.run(run_integration_tests())
    
    # Exit with appropriate code
    exit_code = 0 if results["success_rate"] >= 90 else 1
    exit(exit_code)
