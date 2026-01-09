import pytest
import asyncio
import time
import psutil
import statistics
from concurrent.futures import ThreadPoolExecutor
from unittest.mock import Mock, AsyncMock
import sys
import os

# Add the server directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sallie_server_with_sync import SallieServer, ConversationManager, AvatarManager, SettingsManager

@pytest.mark.performance
@pytest.mark.slow
class TestPerformance:
    """Performance tests for the Sallie server"""

    @pytest.mark.asyncio
    async def test_conversation_creation_performance(self, conversation_manager):
        """Test performance of conversation creation"""
        user_id = "perf-test-user"
        num_conversations = 100
        
        # Measure conversation creation time
        start_time = time.time()
        
        tasks = [
            conversation_manager.create_conversation(
                user_id=user_id,
                title=f"Performance Test Conversation {i}"
            )
            for i in range(num_conversations)
        ]
        
        conversations = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Performance assertions
        assert len(conversations) == num_conversations
        assert total_time < 5.0  # Should complete within 5 seconds
        assert total_time / num_conversations < 0.1  # Average < 100ms per conversation
        
        # Calculate statistics
        avg_time = total_time / num_conversations
        print(f"Created {num_conversations} conversations in {total_time:.2f}s")
        print(f"Average time per conversation: {avg_time:.3f}s")

    @pytest.mark.asyncio
    async def test_message_adding_performance(self, conversation_manager):
        """Test performance of adding messages to conversations"""
        # Create a conversation first
        conversation = await conversation_manager.create_conversation(
            user_id="perf-test-user",
            title="Performance Test Conversation"
        )
        
        num_messages = 1000
        
        # Measure message addition time
        start_time = time.time()
        
        tasks = [
            conversation_manager.add_message(
                conversation_id=conversation.id,
                role="user" if i % 2 == 0 else "assistant",
                content=f"Performance test message {i}"
            )
            for i in range(num_messages)
        ]
        
        messages = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Performance assertions
        assert len(messages) == num_messages
        assert total_time < 10.0  # Should complete within 10 seconds
        assert total_time / num_messages < 0.01  # Average < 10ms per message
        
        avg_time = total_time / num_messages
        print(f"Added {num_messages} messages in {total_time:.2f}s")
        print(f"Average time per message: {avg_time:.3f}s")

    @pytest.mark.asyncio
    async def test_concurrent_user_performance(self, conversation_manager):
        """Test performance with multiple concurrent users"""
        num_users = 50
        conversations_per_user = 10
        
        def create_user_conversations(user_id):
            """Create conversations for a single user"""
            async def user_task():
                tasks = [
                    conversation_manager.create_conversation(
                        user_id=user_id,
                        title=f"User {user_id} Conversation {i}"
                    )
                    for i in range(conversations_per_user)
                ]
                return await asyncio.gather(*tasks)
            return user_task()
        
        # Measure concurrent user performance
        start_time = time.time()
        
        user_tasks = [
            create_user_conversations(f"user-{i}")
            for i in range(num_users)
        ]
        
        results = await asyncio.gather(*user_tasks)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        total_conversations = sum(len(user_convs) for user_convs in results)
        
        # Performance assertions
        assert total_conversations == num_users * conversations_per_user
        assert total_time < 15.0  # Should complete within 15 seconds
        
        avg_time_per_user = total_time / num_users
        avg_time_per_conv = total_time / total_conversations
        
        print(f"Created {total_conversations} conversations for {num_users} users in {total_time:.2f}s")
        print(f"Average time per user: {avg_time_per_user:.3f}s")
        print(f"Average time per conversation: {avg_time_per_conv:.3f}s")

    @pytest.mark.asyncio
    async def test_avatar_update_performance(self, avatar_manager):
        """Test performance of avatar updates"""
        # Create avatar first
        avatar = await avatar_manager.create_avatar(
            user_id="perf-test-user",
            name="Performance Test Avatar",
            appearance={"skin_tone": "#f4c2a1", "hair_color": "#8b4513"}
        )
        
        num_updates = 100
        
        # Measure avatar update time
        start_time = time.time()
        
        tasks = [
            avatar_manager.update_avatar(
                avatar_id=avatar.id,
                mood=f"mood_{i % 10}",
                appearance={"skin_tone": f"#color{i % 20}"}
            )
            for i in range(num_updates)
        ]
        
        results = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Performance assertions
        assert len(results) == num_updates
        assert total_time < 5.0  # Should complete within 5 seconds
        assert total_time / num_updates < 0.05  # Average < 50ms per update
        
        avg_time = total_time / num_updates
        print(f"Updated avatar {num_updates} times in {total_time:.2f}s")
        print(f"Average time per update: {avg_time:.3f}s")

    @pytest.mark.asyncio
    async def test_settings_update_performance(self, settings_manager):
        """Test performance of settings updates"""
        # Create settings first
        settings = await settings_manager.create_settings(
            user_id="perf-test-user",
            theme="dark",
            language="en",
            notifications={"email": True, "push": False}
        )
        
        num_updates = 200
        
        # Measure settings update time
        start_time = time.time()
        
        tasks = [
            settings_manager.update_settings(
                settings_id=settings.id,
                theme="light" if i % 2 == 0 else "dark",
                language=f"lang_{i % 5}"
            )
            for i in range(num_updates)
        ]
        
        results = await asyncio.gather(*tasks)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Performance assertions
        assert len(results) == num_updates
        assert total_time < 3.0  # Should complete within 3 seconds
        assert total_time / num_updates < 0.015  # Average < 15ms per update
        
        avg_time = total_time / num_updates
        print(f"Updated settings {num_updates} times in {total_time:.2f}s")
        print(f"Average time per update: {avg_time:.3f}s")

    @pytest.mark.asyncio
    async def test_memory_usage_performance(self, conversation_manager):
        """Test memory usage during operations"""
        process = psutil.Process()
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB
        
        # Create many conversations
        num_conversations = 500
        user_id = "memory-test-user"
        
        for i in range(num_conversations):
            await conversation_manager.create_conversation(
                user_id=user_id,
                title=f"Memory Test Conversation {i}"
            )
            
            # Check memory every 100 conversations
            if i % 100 == 0 and i > 0:
                current_memory = process.memory_info().rss / 1024 / 1024
                memory_increase = current_memory - initial_memory
                
                print(f"After {i} conversations: {current_memory:.2f} MB (+{memory_increase:.2f} MB)")
                
                # Memory should not increase excessively
                assert memory_increase < 100  # Less than 100MB increase
        
        final_memory = process.memory_info().rss / 1024 / 1024
        total_increase = final_memory - initial_memory
        
        print(f"Final memory usage: {final_memory:.2f} MB (increase: {total_increase:.2f} MB)")
        print(f"Average memory per conversation: {total_increase/num_conversations:.2f} MB")
        
        # Memory assertions
        assert total_increase < 200  # Total increase should be less than 200MB

    @pytest.mark.asyncio
    async def test_database_query_performance(self, conversation_manager):
        """Test database query performance"""
        # Create test data
        user_id = "query-test-user"
        num_conversations = 100
        
        conversations = []
        for i in range(num_conversations):
            conv = await conversation_manager.create_conversation(
                user_id=user_id,
                title=f"Query Test Conversation {i}"
            )
            conversations.append(conv)
            
            # Add some messages
            for j in range(5):
                await conversation_manager.add_message(
                    conversation_id=conv.id,
                    role="user" if j % 2 == 0 else "assistant",
                    content=f"Message {j} in conversation {i}"
                )
        
        # Test query performance
        start_time = time.time()
        
        # Get all user conversations
        user_conversations = await conversation_manager.get_user_conversations(user_id)
        
        # Get each conversation with messages
        for conv in user_conversations:
            await conversation_manager.get_conversation(conv.id)
        
        end_time = time.time()
        query_time = end_time - start_time
        
        # Performance assertions
        assert len(user_conversations) == num_conversations
        assert query_time < 2.0  # Should complete within 2 seconds
        
        print(f"Queried {num_conversations} conversations in {query_time:.3f}s")
        print(f"Average query time per conversation: {query_time/num_conversations:.3f}s")

    @pytest.mark.asyncio
    async def test_websocket_performance(self, mock_websocket_manager):
        """Test WebSocket performance"""
        num_connections = 100
        messages_per_connection = 50
        
        # Create connections
        start_time = time.time()
        
        connections = []
        for i in range(num_connections):
            websocket = create_mock_websocket()
            await mock_websocket_manager.connect(f"user-{i}", websocket)
            connections.append(websocket)
        
        connection_time = time.time() - start_time
        
        # Send messages
        start_time = time.time()
        
        message_tasks = []
        for i, websocket in enumerate(connections):
            for j in range(messages_per_connection):
                message = {"type": "test", "content": f"Message {j} for user {i}"}
                task = mock_websocket_manager.send_message(f"user-{i}", message)
                message_tasks.append(task)
        
        await asyncio.gather(*message_tasks)
        
        message_time = time.time() - start_time
        
        # Performance assertions
        assert connection_time < 1.0  # Connections should be established quickly
        assert message_time < 5.0  # Messages should be sent quickly
        
        total_messages = num_connections * messages_per_connection
        avg_message_time = message_time / total_messages
        
        print(f"Established {num_connections} connections in {connection_time:.3f}s")
        print(f"Sent {total_messages} messages in {message_time:.3f}s")
        print(f"Average time per message: {avg_message_time:.6f}s")

    @pytest.mark.asyncio
    async def test_load_balancing_performance(self, conversation_manager):
        """Test performance under load"""
        num_concurrent_operations = 1000
        
        def random_operation():
            """Generate a random operation"""
            import random
            operation_type = random.choice(['create_conv', 'get_conv', 'add_message'])
            
            async def perform_operation():
                if operation_type == 'create_conv':
                    return await conversation_manager.create_conversation(
                        user_id="load-test-user",
                        title="Load Test Conversation"
                    )
                elif operation_type == 'get_conv':
                    return await conversation_manager.get_user_conversations("load-test-user")
                else:
                    # Get a conversation and add a message
                    conversations = await conversation_manager.get_user_conversations("load-test-user")
                    if conversations:
                        return await conversation_manager.add_message(
                            conversation_id=conversations[0].id,
                            role="user",
                            content="Load test message"
                        )
                    return None
            
            return perform_operation()
        
        # Measure load performance
        start_time = time.time()
        
        operations = [random_operation() for _ in range(num_concurrent_operations)]
        results = await asyncio.gather(*operations, return_exceptions=True)
        
        end_time = time.time()
        total_time = end_time - start_time
        
        successful_ops = [r for r in results if not isinstance(r, Exception)]
        
        # Performance assertions
        assert len(successful_ops) > num_concurrent_operations * 0.95  # At least 95% success rate
        assert total_time < 30.0  # Should complete within 30 seconds
        
        avg_time = total_time / num_concurrent_operations
        throughput = num_concurrent_operations / total_time
        
        print(f"Completed {len(successful_ops)}/{num_concurrent_operations} operations in {total_time:.2f}s")
        print(f"Average time per operation: {avg_time:.3f}s")
        print(f"Throughput: {throughput:.2f} operations/second")

    @pytest.mark.asyncio
    async def test_stress_test(self, conversation_manager, avatar_manager, settings_manager):
        """Comprehensive stress test"""
        duration_seconds = 30  # Run for 30 seconds
        operations_per_second = 50
        
        async def stress_worker(worker_id):
            """Worker that performs operations continuously"""
            operations = 0
            start_time = time.time()
            
            while time.time() - start_time < duration_seconds:
                try:
                    # Random operation
                    import random
                    operation = random.choice(['conversation', 'avatar', 'settings'])
                    
                    if operation == 'conversation':
                        await conversation_manager.create_conversation(
                            user_id=f"stress-user-{worker_id}",
                            title=f"Stress Test Conversation {operations}"
                        )
                    elif operation == 'avatar':
                        await avatar_manager.create_avatar(
                            user_id=f"stress-user-{worker_id}",
                            name=f"Stress Avatar {operations}",
                            appearance={"skin_tone": "#f4c2a1"}
                        )
                    else:
                        await settings_manager.create_settings(
                            user_id=f"stress-user-{worker_id}",
                            theme="dark",
                            language="en",
                            notifications={"email": True}
                        )
                    
                    operations += 1
                    
                    # Small delay to prevent overwhelming
                    await asyncio.sleep(1.0 / operations_per_second)
                    
                except Exception as e:
                    print(f"Worker {worker_id} error: {e}")
            
            return operations
        
        # Run multiple workers
        num_workers = 10
        start_time = time.time()
        
        worker_tasks = [stress_worker(i) for i in range(num_workers)]
        results = await asyncio.gather(*worker_tasks)
        
        end_time = time.time()
        actual_duration = end_time - start_time
        
        total_operations = sum(results)
        actual_ops_per_second = total_operations / actual_duration
        
        print(f"Stress test completed in {actual_duration:.2f}s")
        print(f"Total operations: {total_operations}")
        print(f"Actual operations per second: {actual_ops_per_second:.2f}")
        print(f"Worker performance: {results}")
        
        # Performance assertions
        assert actual_duration < duration_seconds + 5  # Should complete within reasonable time
        assert actual_ops_per_second > operations_per_second * 0.8  # At least 80% of target throughput

@pytest.mark.performance
class TestResourceUsage:
    """Tests for resource usage monitoring"""

    def test_cpu_usage_monitoring(self):
        """Test CPU usage monitoring"""
        process = psutil.Process()
        
        # Get initial CPU usage
        initial_cpu = process.cpu_percent()
        
        # Simulate some work
        start_time = time.time()
        while time.time() - start_time < 1.0:
            pass  # Busy work for 1 second
        
        # Get CPU usage after work
        final_cpu = process.cpu_percent()
        
        print(f"CPU usage: {final_cpu}%")
        
        # CPU usage should be reasonable
        assert final_cpu < 90  # Should not use excessive CPU

    def test_memory_monitoring(self):
        """Test memory monitoring"""
        process = psutil.Process()
        
        # Get memory info
        memory_info = process.memory_info()
        memory_mb = memory_info.rss / 1024 / 1024
        
        print(f"Memory usage: {memory_mb:.2f} MB")
        
        # Memory usage should be reasonable
        assert memory_mb < 500  # Should not use excessive memory

    def test_thread_monitoring(self):
        """Test thread monitoring"""
        process = psutil.Process()
        
        # Get thread count
        num_threads = process.num_threads()
        
        print(f"Number of threads: {num_threads}")
        
        # Thread count should be reasonable
        assert num_threads < 100  # Should not create excessive threads

    def test_file_descriptor_monitoring(self):
        """Test file descriptor monitoring"""
        process = psutil.Process()
        
        # Get file descriptor count (Unix systems)
        if hasattr(process, 'num_fds'):
            num_fds = process.num_fds()
            print(f"Number of file descriptors: {num_fds}")
            
            # File descriptor count should be reasonable
            assert num_fds < 1000  # Should not use excessive file descriptors

# Performance testing utilities
def measure_performance(func, *args, **kwargs):
    """Measure performance of a function"""
    start_time = time.time()
    result = func(*args, **kwargs)
    end_time = time.time()
    
    return result, end_time - start_time

async def measure_async_performance(func, *args, **kwargs):
    """Measure performance of an async function"""
    start_time = time.time()
    result = await func(*args, **kwargs)
    end_time = time.time()
    
    return result, end_time - start_time

def create_performance_report(test_results):
    """Create a performance report from test results"""
    report = {
        "timestamp": time.time(),
        "tests": test_results,
        "summary": {
            "total_tests": len(test_results),
            "passed_tests": len([r for r in test_results if r["passed"]]),
            "failed_tests": len([r for r in test_results if not r["passed"]]),
        }
    }
    
    # Calculate statistics
    if test_results:
        execution_times = [r["execution_time"] for r in test_results if "execution_time" in r]
        if execution_times:
            report["summary"]["avg_execution_time"] = statistics.mean(execution_times)
            report["summary"]["max_execution_time"] = max(execution_times)
            report["summary"]["min_execution_time"] = min(execution_times)
    
    return report
