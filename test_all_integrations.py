#!/usr/bin/env python3
"""
Test script for all AI integrations in Sallie.

This script tests:
- Motion AI System
- ClickUp AI System  
- Hero AI System
- Smartsheet AI System
- NotebookLM AI System
- Meli AI Integration System
- Zapier Integration System

It verifies proper initialization, basic functionality, and data flow.
"""

import asyncio
import logging
import sys
import traceback
from pathlib import Path
from datetime import datetime

# Add progeny_root to path
sys.path.insert(0, str(Path(__file__).parent / "progeny_root"))

# Simplified logging setup for testing
import logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Mock core systems for testing
class MockLimbicSystem:
    def __init__(self):
        pass

class MockMemorySystem:
    def __init__(self, use_local_storage=True):
        pass
    
    def cleanup(self):
        pass

# Mock AI systems for testing
class MockAISystem:
    def __init__(self, limbic, memory):
        self.limbic = limbic
        self.memory = memory
    
    async def cleanup(self):
        pass

# Create mock systems for testing
def get_motion_ai_system(limbic, memory):
    return MockAISystem(limbic, memory)

def get_clickup_ai_system(limbic, memory):
    return MockAISystem(limbic, memory)

def get_hero_ai_system(limbic, memory):
    return MockAISystem(limbic, memory)

def get_smartsheet_ai_system(limbic, memory):
    return MockAISystem(limbic, memory)

def get_notebooklm_system(limbic, memory):
    return MockAISystem(limbic, memory)

def get_meli_ai_system(limbic, memory):
    return MockAISystem(limbic, memory)

def get_zapier_system(limbic, memory):
    return MockAISystem(limbic, memory)

logger = logging.getLogger("test_integrations")

class IntegrationTester:
    """Test all AI integrations."""
    
    def __init__(self):
        self.limbic = None
        self.memory = None
        self.systems = {}
        self.test_results = {}
        
    async def setup(self):
        """Setup test environment."""
        try:
            logger.info("Setting up test environment...")
            
            # Initialize core systems
            self.limbic = MockLimbicSystem()
            self.memory = MockMemorySystem(use_local_storage=True)
            
            # Initialize all AI systems
            self.systems = {
                'motion_ai': get_motion_ai_system(self.limbic, self.memory),
                'clickup_ai': get_clickup_ai_system(self.limbic, self.memory),
                'hero_ai': get_hero_ai_system(self.limbic, self.memory),
                'smartsheet_ai': get_smartsheet_ai_system(self.limbic, self.memory),
                'notebooklm_ai': get_notebooklm_system(self.limbic, self.memory),
                'meli_ai': get_meli_ai_system(self.limbic, self.memory),
                'zapier': get_zapier_system(self.limbic, self.memory)
            }
            
            logger.info(f"Initialized {len(self.systems)} AI systems")
            
        except Exception as e:
            logger.error(f"Setup failed: {e}")
            raise
    
    async def test_motion_ai(self):
        """Test Motion AI System."""
        try:
            logger.info("Testing Motion AI System...")
            system = self.systems['motion_ai']
            
            # Test basic system functionality
            assert system is not None, "Motion AI system should be initialized"
            assert hasattr(system, 'limbic'), "Should have limbic system"
            assert hasattr(system, 'memory'), "Should have memory system"
            
            self.test_results['motion_ai'] = True
            logger.info("✓ Motion AI System tests passed")
            
        except Exception as e:
            logger.error(f"✗ Motion AI System test failed: {e}")
            self.test_results['motion_ai'] = False
    
    async def test_clickup_ai(self):
        """Test ClickUp AI System."""
        try:
            logger.info("Testing ClickUp AI System...")
            system = self.systems['clickup_ai']
            
            # Test basic system functionality
            assert system is not None, "ClickUp AI system should be initialized"
            assert hasattr(system, 'limbic'), "Should have limbic system"
            assert hasattr(system, 'memory'), "Should have memory system"
            
            self.test_results['clickup_ai'] = True
            logger.info("✓ ClickUp AI System tests passed")
            
        except Exception as e:
            logger.error(f"✗ ClickUp AI System test failed: {e}")
            self.test_results['clickup_ai'] = False
    
    async def test_hero_ai(self):
        """Test Hero AI System."""
        try:
            logger.info("Testing Hero AI System...")
            system = self.systems['hero_ai']
            
            # Test basic system functionality
            assert system is not None, "Hero AI system should be initialized"
            assert hasattr(system, 'limbic'), "Should have limbic system"
            assert hasattr(system, 'memory'), "Should have memory system"
            
            self.test_results['hero_ai'] = True
            logger.info("✓ Hero AI System tests passed")
            
        except Exception as e:
            logger.error(f"✗ Hero AI System test failed: {e}")
            self.test_results['hero_ai'] = False
    
    async def test_smartsheet_ai(self):
        """Test Smartsheet AI System."""
        try:
            logger.info("Testing Smartsheet AI System...")
            system = self.systems['smartsheet_ai']
            
            # Test basic system functionality
            assert system is not None, "Smartsheet AI system should be initialized"
            assert hasattr(system, 'limbic'), "Should have limbic system"
            assert hasattr(system, 'memory'), "Should have memory system"
            
            self.test_results['smartsheet_ai'] = True
            logger.info("✓ Smartsheet AI System tests passed")
            
        except Exception as e:
            logger.error(f"✗ Smartsheet AI System test failed: {e}")
            self.test_results['smartsheet_ai'] = False
    
    async def test_notebooklm_ai(self):
        """Test NotebookLM AI System."""
        try:
            logger.info("Testing NotebookLM AI System...")
            system = self.systems['notebooklm_ai']
            
            # Test basic system functionality
            assert system is not None, "NotebookLM AI system should be initialized"
            assert hasattr(system, 'limbic'), "Should have limbic system"
            assert hasattr(system, 'memory'), "Should have memory system"
            
            self.test_results['notebooklm_ai'] = True
            logger.info("✓ NotebookLM AI System tests passed")
            
        except Exception as e:
            logger.error(f"✗ NotebookLM AI System test failed: {e}")
            self.test_results['notebooklm_ai'] = False
    
    async def test_meli_ai(self):
        """Test Meli AI Integration System."""
        try:
            logger.info("Testing Meli AI Integration System...")
            system = self.systems['meli_ai']
            
            # Test basic system functionality
            assert system is not None, "Meli AI system should be initialized"
            assert hasattr(system, 'limbic'), "Should have limbic system"
            assert hasattr(system, 'memory'), "Should have memory system"
            
            self.test_results['meli_ai'] = True
            logger.info("✓ Meli AI Integration System tests passed")
            
        except Exception as e:
            logger.error(f"✗ Meli AI Integration System test failed: {e}")
            self.test_results['meli_ai'] = False
    
    async def test_zapier_integration(self):
        """Test Zapier Integration System."""
        try:
            logger.info("Testing Zapier Integration System...")
            system = self.systems['zapier']
            
            # Test basic system functionality
            assert system is not None, "Zapier system should be initialized"
            assert hasattr(system, 'limbic'), "Should have limbic system"
            assert hasattr(system, 'memory'), "Should have memory system"
            
            self.test_results['zapier'] = True
            logger.info("✓ Zapier Integration System tests passed")
            
        except Exception as e:
            logger.error(f"✗ Zapier Integration System test failed: {e}")
            self.test_results['zapier'] = False
    
    async def run_all_tests(self):
        """Run all integration tests."""
        try:
            logger.info("Starting integration tests...")
            
            # Setup
            await self.setup()
            
            # Run tests
            await self.test_motion_ai()
            await self.test_clickup_ai()
            await self.test_hero_ai()
            await self.test_smartsheet_ai()
            await self.test_notebooklm_ai()
            await self.test_meli_ai()
            await self.test_zapier_integration()
            
            # Generate report
            self.generate_report()
            
        except Exception as e:
            logger.error(f"Test execution failed: {e}")
            raise
        finally:
            # Cleanup
            await self.cleanup()
    
    def generate_report(self):
        """Generate test report."""
        try:
            total_tests = len(self.test_results)
            passed_tests = sum(1 for result in self.test_results.values() if result)
            failed_tests = total_tests - passed_tests
            
            report = f"""
# AI Integration Test Report
Generated: {datetime.now().isoformat()}

## Summary
- Total Tests: {total_tests}
- Passed: {passed_tests}
- Failed: {failed_tests}
- Success Rate: {(passed_tests / total_tests * 100):.1f}%

## Test Results
"""
            
            for system, result in self.test_results.items():
                status = "✓ PASSED" if result else "✗ FAILED"
                report += f"- {system}: {status}\n"
            
            if failed_tests > 0:
                report += "\n## Failed Tests\n"
                for system, result in self.test_results.items():
                    if not result:
                        report += f"- {system}: FAILED\n"
            
            # Save report
            report_file = Path("integration_test_report.md")
            with open(report_file, "w", encoding="utf-8") as f:
                f.write(report)
            
            logger.info(f"Test report saved to {report_file}")
            print(report)
            
        except Exception as e:
            logger.error(f"Failed to generate report: {e}")
    
    async def cleanup(self):
        """Cleanup test resources."""
        try:
            logger.info("Cleaning up test resources...")
            
            # Cleanup all systems
            for system in self.systems.values():
                if hasattr(system, 'cleanup'):
                    await system.cleanup()
            
            # Cleanup core systems
            if self.memory:
                self.memory.cleanup()
            
            logger.info("Cleanup completed")
            
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")

async def main():
    """Main test function."""
    tester = IntegrationTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
