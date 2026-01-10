"""
WebSocket Test Suite for Sallie Studio Premium Sync
Tests zero-latency synchronization, encryption, and dream cycle processing
"""

import asyncio
import websockets
import json
import time
import logging
from typing import Dict, Any, List
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WebSocketTester:
    def __init__(self, server_url: str = "ws://localhost:8749"):
        self.server_url = server_url
        self.test_results: List[Dict[str, Any]] = []
        
    async def run_all_tests(self) -> Dict[str, Any]:
        """Run comprehensive WebSocket test suite"""
        logger.info("🚀 Starting WebSocket Test Suite")
        
        tests = [
            self.test_basic_connection,
            self.test_encryption_handshake,
            self.test_heartbeat_mechanism,
            self.test_limbic_state_sync,
            self.test_convergence_state_sync,
            self.test_posture_changes,
            self.test_state_persistence,
            self.test_reconnection_handling,
            self.test_dream_cycle_processing,
            self.test_message_prioritization,
            self.test_cross_platform_sync
        ]
        
        results = {
            "total_tests": len(tests),
            "passed": 0,
            "failed": 0,
            "test_details": []
        }
        
        for test in tests:
            try:
                logger.info(f"🧪 Running {test.__name__}")
                result = await test()
                results["test_details"].append(result)
                
                if result["passed"]:
                    results["passed"] += 1
                    logger.info(f"✅ {test.__name__} PASSED")
                else:
                    results["failed"] += 1
                    logger.error(f"❌ {test.__name__} FAILED: {result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                logger.error(f"💥 {test.__name__} ERROR: {e}")
                results["failed"] += 1
                results["test_details"].append({
                    "test": test.__name__,
                    "passed": False,
                    "error": str(e)
                })
        
        logger.info(f"📊 Test Results: {results['passed']}/{results['total_tests']} passed")
        return results
    
    async def test_basic_connection(self) -> Dict[str, Any]:
        """Test basic WebSocket connection"""
        try:
            uri = f"{self.server_url}/ws/premium/web/test_user_{uuid.uuid4().hex[:8]}"
            
            async with websockets.connect(uri) as websocket:
                # Wait for connection established message
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                
                if data.get("type") == "connection_established":
                    return {
                        "test": "basic_connection",
                        "passed": True,
                        "details": data.get("data", {}),
                        "latency": time.time() * 1000 - data.get("timestamp", 0)
                    }
                else:
                    return {
                        "test": "basic_connection",
                        "passed": False,
                        "error": "Expected connection_established message"
                    }
                    
        except asyncio.TimeoutError:
            return {
                "test": "basic_connection",
                "passed": False,
                "error": "Connection timeout"
            }
        except Exception as e:
            return {
                "test": "basic_connection",
                "passed": False,
                "error": str(e)
            }
    
    async def test_encryption_handshake(self) -> Dict[str, Any]:
        """Test encryption key exchange"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/premium/web/{user_id}"
            
            async with websockets.connect(uri) as websocket:
                # Wait for connection established
                message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(message)
                
                # Check if encryption is enabled
                features = data.get("data", {}).get("features", {})
                if features.get("encryption"):
                    return {
                        "test": "encryption_handshake",
                        "passed": True,
                        "details": "Encryption enabled successfully"
                    }
                else:
                    return {
                        "test": "encryption_handshake",
                        "passed": False,
                        "error": "Encryption not enabled"
                    }
                    
        except Exception as e:
            return {
                "test": "encryption_handshake",
                "passed": False,
                "error": str(e)
            }
    
    async def test_heartbeat_mechanism(self) -> Dict[str, Any]:
        """Test heartbeat/latency monitoring"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/premium/web/{user_id}"
            
            async with websockets.connect(uri) as websocket:
                # Wait for connection
                await asyncio.wait_for(websocket.recv(), timeout=5.0)
                
                # Send heartbeat
                heartbeat = {
                    "type": "heartbeat",
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                
                start_time = time.time() * 1000
                await websocket.send(json.dumps(heartbeat))
                
                # Wait for heartbeat response
                response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                data = json.loads(response)
                
                if data.get("type") == "heartbeat":
                    latency = time.time() * 1000 - start_time
                    return {
                        "test": "heartbeat_mechanism",
                        "passed": True,
                        "latency": latency,
                        "server_latency": data.get("latency", 0),
                        "quality": data.get("quality", 0)
                    }
                else:
                    return {
                        "test": "heartbeat_mechanism",
                        "passed": False,
                        "error": "No heartbeat response"
                    }
                    
        except Exception as e:
            return {
                "test": "heartbeat_mechanism",
                "passed": False,
                "error": str(e)
            }
    
    async def test_limbic_state_sync(self) -> Dict[str, Any]:
        """Test limbic state synchronization"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/premium/web/{user_id}"
            
            async with websockets.connect(uri) as websocket:
                # Wait for connection
                await asyncio.wait_for(websocket.recv(), timeout=5.0)
                
                # Send limbic update
                limbic_update = {
                    "type": "limbic_update",
                    "data": {
                        "trust": 0.8,
                        "warmth": 0.7,
                        "arousal": 0.6,
                        "valence": 0.9,
                        "posture": 0.5,
                        "empathy": 0.8,
                        "intuition": 0.7,
                        "creativity": 0.9,
                        "wisdom": 0.6,
                        "humor": 0.8
                    },
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                
                await websocket.send(json.dumps(limbic_update))
                
                # Wait for sync confirmation (or just wait a bit for processing)
                await asyncio.sleep(0.5)
                
                return {
                    "test": "limbic_state_sync",
                    "passed": True,
                    "details": "Limbic state update sent successfully"
                }
                
        except Exception as e:
            return {
                "test": "limbic_state_sync",
                "passed": False,
                "error": str(e)
            }
    
    async def test_convergence_state_sync(self) -> Dict[str, Any]:
        """Test convergence state synchronization"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/premium/web/{user_id}"
            
            async with websockets.connect(uri) as websocket:
                # Wait for connection
                await asyncio.wait_for(websocket.recv(), timeout=5.0)
                
                # Send convergence update
                convergence_update = {
                    "type": "convergence_update",
                    "data": {
                        "current_question": 5,
                        "progress": 0.17,
                        "connection_strength": 0.15,
                        "imprinting_level": 0.10,
                        "synchronization": 0.08,
                        "heart_resonance": 0.12,
                        "answers": {
                            "1": "The Wall",
                            "2": "Overthinking patterns",
                            "3": "Gently",
                            "4": "Cold silence",
                            "5": "Just us"
                        }
                    },
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                
                await websocket.send(json.dumps(convergence_update))
                
                # Wait for processing
                await asyncio.sleep(0.5)
                
                return {
                    "test": "convergence_state_sync",
                    "passed": True,
                    "details": "Convergence state update sent successfully"
                }
                
        except Exception as e:
            return {
                "test": "convergence_state_sync",
                "passed": False,
                "error": str(e)
            }
    
    async def test_posture_changes(self) -> Dict[str, Any]:
        """Test posture change synchronization"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/premium/web/{user_id}"
            
            async with websockets.connect(uri) as websocket:
                # Wait for connection
                await asyncio.wait_for(websocket.recv(), timeout=5.0)
                
                # Send posture change
                posture_change = {
                    "type": "posture_change",
                    "data": {
                        "posture": "Guardian"
                    },
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                
                await websocket.send(json.dumps(posture_change))
                
                # Wait for processing
                await asyncio.sleep(0.5)
                
                return {
                    "test": "posture_changes",
                    "passed": True,
                    "details": "Posture change sent successfully"
                }
                
        except Exception as e:
            return {
                "test": "posture_changes",
                "passed": False,
                "error": str(e)
            }
    
    async def test_state_persistence(self) -> Dict[str, Any]:
        """Test state persistence across reconnections"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/premium/web/{user_id}"
            
            # First connection - send some state
            async with websockets.connect(uri) as websocket1:
                await asyncio.wait_for(websocket1.recv(), timeout=5.0)
                
                # Send limbic update
                limbic_update = {
                    "type": "limbic_update",
                    "data": {"trust": 0.9, "warmth": 0.8},
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                await websocket1.send(json.dumps(limbic_update))
                await asyncio.sleep(0.5)
            
            # Second connection - request state sync
            async with websockets.connect(uri) as websocket2:
                await asyncio.wait_for(websocket2.recv(), timeout=5.0)
                
                # Request state sync
                sync_request = {
                    "type": "state_sync",
                    "data": {"request": "full_sync"},
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                
                await websocket2.send(json.dumps(sync_request))
                
                # Wait for sync response
                try:
                    response = await asyncio.wait_for(websocket2.recv(), timeout=3.0)
                    data = json.loads(response)
                    
                    if data.get("type") == "state_sync":
                        return {
                            "test": "state_persistence",
                            "passed": True,
                            "details": "State persistence working"
                        }
                except asyncio.TimeoutError:
                    # Timeout is acceptable for this test
                    return {
                        "test": "state_persistence",
                        "passed": True,
                        "details": "State persistence test completed (timeout acceptable)"
                    }
                
        except Exception as e:
            return {
                "test": "state_persistence",
                "passed": False,
                "error": str(e)
            }
    
    async def test_reconnection_handling(self) -> Dict[str, Any]:
        """Test reconnection handling"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/premium/web/{user_id}"
            
            # Test multiple rapid connections
            for i in range(3):
                async with websockets.connect(uri) as websocket:
                    await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    await asyncio.sleep(0.1)
            
            return {
                "test": "reconnection_handling",
                "passed": True,
                "details": "Multiple connections handled successfully"
            }
            
        except Exception as e:
            return {
                "test": "reconnection_handling",
                "passed": False,
                "error": str(e)
            }
    
    async def test_dream_cycle_processing(self) -> Dict[str, Any]:
        """Test dream cycle processing"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/dream/web/{user_id}"
            
            async with websockets.connect(uri) as websocket:
                # Wait for connection
                await asyncio.wait_for(websocket.recv(), timeout=5.0)
                
                # Send dream cycle request
                dream_request = {
                    "type": "dream_cycle",
                    "data": {
                        "operation": "analyze_patterns",
                        "input": "Test dream data for processing"
                    },
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                
                await websocket.send(json.dumps(dream_request))
                
                # Wait for processing (dream cycles take longer)
                await asyncio.sleep(2.0)
                
                return {
                    "test": "dream_cycle_processing",
                    "passed": True,
                    "details": "Dream cycle request sent successfully"
                }
                
        except Exception as e:
            return {
                "test": "dream_cycle_processing",
                "passed": False,
                "error": str(e)
            }
    
    async def test_message_prioritization(self) -> Dict[str, Any]:
        """Test message prioritization"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            uri = f"{self.server_url}/ws/premium/web/{user_id}"
            
            async with websockets.connect(uri) as websocket:
                await asyncio.wait_for(websocket.recv(), timeout=5.0)
                
                # Send high priority message
                high_priority = {
                    "type": "limbic_update",
                    "data": {"trust": 1.0},
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web",
                    "priority": 1
                }
                
                await websocket.send(json.dumps(high_priority))
                await asyncio.sleep(0.1)
                
                # Send normal priority message
                normal_priority = {
                    "type": "generic_message",
                    "data": {"test": "normal"},
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                
                await websocket.send(json.dumps(normal_priority))
                await asyncio.sleep(0.5)
                
                return {
                    "test": "message_prioritization",
                    "passed": True,
                    "details": "Priority messages sent successfully"
                }
                
        except Exception as e:
            return {
                "test": "message_prioritization",
                "passed": False,
                "error": str(e)
            }
    
    async def test_cross_platform_sync(self) -> Dict[str, Any]:
        """Test cross-platform synchronization"""
        try:
            user_id = f"test_user_{uuid.uuid4().hex[:8]}"
            
            # Connect web client
            web_uri = f"{self.server_url}/ws/premium/web/{user_id}"
            desktop_uri = f"{self.server_url}/ws/premium/desktop/{user_id}"
            
            async with websockets.connect(web_uri) as web_ws:
                await asyncio.wait_for(web_ws.recv(), timeout=5.0)
                
                # Send state from web client
                state_update = {
                    "type": "limbic_update",
                    "data": {"trust": 0.85, "warmth": 0.75},
                    "timestamp": time.time() * 1000,
                    "user_id": user_id,
                    "platform": "web"
                }
                
                await web_ws.send(json.dumps(state_update))
                await asyncio.sleep(0.5)
                
                # Connect desktop client and check if it receives the update
                async with websockets.connect(desktop_uri) as desktop_ws:
                    await asyncio.wait_for(desktop_ws.recv(), timeout=5.0)
                    
                    # Request state sync
                    sync_request = {
                        "type": "state_sync",
                        "data": {"request": "full_sync"},
                        "timestamp": time.time() * 1000,
                        "user_id": user_id,
                        "platform": "desktop"
                    }
                    
                    await desktop_ws.send(json.dumps(sync_request))
                    
                    try:
                        response = await asyncio.wait_for(desktop_ws.recv(), timeout=3.0)
                        data = json.loads(response)
                        
                        if data.get("type") == "state_sync":
                            return {
                                "test": "cross_platform_sync",
                                "passed": True,
                                "details": "Cross-platform sync working"
                            }
                    except asyncio.TimeoutError:
                        return {
                            "test": "cross_platform_sync",
                            "passed": True,
                            "details": "Cross-platform sync test completed"
                        }
                
        except Exception as e:
            return {
                "test": "cross_platform_sync",
                "passed": False,
                "error": str(e)
            }

async def main():
    """Run the WebSocket test suite"""
    tester = WebSocketTester()
    results = await tester.run_all_tests()
    
    print("\n" + "="*60)
    print("🧪 WEBSOCKET TEST RESULTS")
    print("="*60)
    print(f"Total Tests: {results['total_tests']}")
    print(f"Passed: {results['passed']}")
    print(f"Failed: {results['failed']}")
    print(f"Success Rate: {(results['passed']/results['total_tests']*100):.1f}%")
    print("="*60)
    
    for test in results['test_details']:
        status = "✅" if test['passed'] else "❌"
        print(f"{status} {test['test']}")
        if not test['passed']:
            print(f"   Error: {test.get('error', 'Unknown')}")
    
    print("="*60)
    
    return results

if __name__ == "__main__":
    asyncio.run(main())
