import sys
import os
from pathlib import Path

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.limbic import LimbicSystem
from core.agency import AgencySystem, TrustTier

def test_agency():
    print("=== Testing Agency System ===")
    
    # 1. Initialize Limbic System
    limbic = LimbicSystem()
    agency = AgencySystem(limbic)
    
    # 2. Test Tier Calculation
    print("\n--- Testing Trust Tiers ---")
    
    # Default Trust is 0.1 -> Stranger
    # Note: LimbicSystem initializes with 0.55 trust by default in some versions, or 0.1. 
    # Let's force it to known values for testing.
    limbic.state.trust = 0.1
    print(f"Trust: {limbic.state.trust}, Tier: {agency.get_tier().name}")
    assert agency.get_tier() == TrustTier.STRANGER
    
    # Boost Trust to Associate (0.65)
    # limbic.update(delta_t=0.5) # We can skip update logic and set state directly for unit testing Agency
    limbic.state.trust = 0.65
    print(f"Trust: {limbic.state.trust}, Tier: {agency.get_tier().name}")
    assert agency.get_tier() == TrustTier.ASSOCIATE

    # Boost Trust to Partner (0.85)
    limbic.state.trust = 0.85
    print(f"Trust: {limbic.state.trust}, Tier: {agency.get_tier().name}")
    assert agency.get_tier() == TrustTier.PARTNER

    # Boost Trust to Surrogate (0.95)
    limbic.state.trust = 0.95
    print(f"Trust: {limbic.state.trust}, Tier: {agency.get_tier().name}")
    assert agency.get_tier() == TrustTier.SURROGATE

    # 3. Test Permissions
    print("\n--- Testing Permissions ---")
    
    # Reset to Stranger
    limbic.state.trust = 0.1
    print(f"Tier: {agency.get_tier().name}")
    print(f"Read Permission: {agency.check_permission('read')}")
    print(f"Write Permission: {agency.check_permission('write')}")
    assert agency.check_permission('read') == True
    assert agency.check_permission('write') == False

    # Set to Associate
    limbic.state.trust = 0.65
    print(f"Tier: {agency.get_tier().name}")
    # Write to random path -> Denied
    print(f"Write Random: {agency.check_permission('write', 'random.txt')}")
    assert agency.check_permission('write', 'random.txt') == False
    
    # Write to Whitelist -> Allowed
    draft_path = str(Path("progeny_root/drafts/test.txt").resolve())
    # Note: Whitelist check relies on path resolution, might be tricky in test env if dirs don't exist
    # But let's try.
    
    # 4. Test Tool Execution
    print("\n--- Testing Tool Execution ---")
    # Set to Partner for write access
    limbic.state.trust = 0.85 
    
    test_file = "test_agency_write.txt"
    result = agency.execute_tool("write_file", {"path": test_file, "content": "Hello Agency"})
    print(f"Write Result: {result}")
    
    if result["status"] == "success":
        print("File write successful.")
        # Clean up
        if os.path.exists(test_file):
            os.remove(test_file)
    else:
        print(f"File write failed: {result}")

    print("\n=== Agency System Tests Complete ===")

if __name__ == "__main__":
    test_agency()
