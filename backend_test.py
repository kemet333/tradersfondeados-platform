import requests
import unittest
import sys
import json

class PropFirmAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                return success, response.json()
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_get_all_firms(self):
        """Test getting all prop firms"""
        success, response = self.run_test(
            "Get All Firms",
            "GET",
            "api/firms",
            200
        )
        
        if success:
            print(f"Retrieved {len(response)} prop firms")
            if len(response) == 6:
                print("✅ All 6 prop firms returned successfully")
            else:
                print(f"❌ Expected 6 firms, got {len(response)}")
                
            # Verify firm names
            firm_names = [firm['name'] for firm in response]
            expected_names = ["FTMO", "TopStepTrader", "MyForexFunds", "The5ers", "Funded Trading Plus", "FundedNext"]
            
            all_names_present = all(name in firm_names for name in expected_names)
            if all_names_present:
                print("✅ All expected firm names are present")
            else:
                print("❌ Some firm names are missing")
                print(f"Expected: {expected_names}")
                print(f"Got: {firm_names}")
                
        return success, response

    def test_get_statistics(self):
        """Test getting platform statistics"""
        success, response = self.run_test(
            "Get Statistics",
            "GET",
            "api/statistics",
            200
        )
        
        if success:
            print("Statistics retrieved:")
            for key, value in response.items():
                print(f"  - {key}: {value}")
                
            # Verify statistics fields
            required_fields = ["total_firms", "avg_profit_split", "avg_rating", 
                              "most_popular_platform", "lowest_evaluation_fee", "highest_payout"]
            
            all_fields_present = all(field in response for field in required_fields)
            if all_fields_present:
                print("✅ All required statistics fields are present")
            else:
                print("❌ Some statistics fields are missing")
                missing = [field for field in required_fields if field not in response]
                print(f"Missing fields: {missing}")
                
        return success, response

    def test_search_suggestions(self, query):
        """Test search suggestions endpoint"""
        success, response = self.run_test(
            f"Search Suggestions for '{query}'",
            "GET",
            "api/firms/search/suggestions",
            200,
            params={"q": query}
        )
        
        if success:
            print(f"Search suggestions for '{query}':")
            for suggestion in response.get('suggestions', []):
                print(f"  - {suggestion}")
                
            # Verify response structure
            if 'query' in response and 'suggestions' in response:
                print("✅ Response has correct structure")
            else:
                print("❌ Response is missing required fields")
                
        return success, response

    def test_filtered_firms(self, filter_params, expected_count=None):
        """Test filtering firms with various parameters"""
        param_desc = ", ".join([f"{k}={v}" for k, v in filter_params.items()])
        success, response = self.run_test(
            f"Filter Firms by {param_desc}",
            "GET",
            "api/firms",
            200,
            params=filter_params
        )
        
        if success:
            print(f"Retrieved {len(response)} filtered firms")
            
            if expected_count is not None:
                if len(response) == expected_count:
                    print(f"✅ Expected {expected_count} firms, got {len(response)}")
                else:
                    print(f"❌ Expected {expected_count} firms, got {len(response)}")
                    
        return success, response

    def test_compare_firms(self, firm_ids):
        """Test comparing multiple firms"""
        success, response = self.run_test(
            f"Compare Firms",
            "POST",
            "api/firms/compare",
            200,
            data={"firm_ids": firm_ids}
        )
        
        if success:
            print(f"Compared {len(response.get('firms', []))} firms")
            
            if len(response.get('firms', [])) == len(firm_ids):
                print("✅ All requested firms returned in comparison")
            else:
                print(f"❌ Expected {len(firm_ids)} firms, got {len(response.get('firms', []))}")
                
        return success, response

def main():
    # Use the public endpoint from the .env file
    base_url = "https://4f020d99-66a3-4322-8dbc-ae01e8ecdb0a.preview.emergentagent.com"
    tester = PropFirmAPITester(base_url)
    
    # Test 1: Get all firms
    all_firms_success, all_firms = tester.test_get_all_firms()
    
    # Test 2: Get statistics
    stats_success, stats = tester.test_get_statistics()
    
    # Test 3: Search suggestions
    suggestions_success, suggestions = tester.test_search_suggestions("FTMO")
    
    # If we have firms, use their IDs for further tests
    if all_firms_success and all_firms:
        # Get some firm IDs for testing
        firm_ids = [firm['id'] for firm in all_firms[:2]]
        
        # Test 4: Filter by account size
        tester.test_filtered_firms({"min_account_size": 10000})
        
        # Test 5: Filter by profit split
        tester.test_filtered_firms({"min_profit_split": 85})
        
        # Test 6: Filter by platform
        tester.test_filtered_firms({"platform": "MetaTrader 5"})
        
        # Test 7: Compare firms
        if firm_ids:
            tester.test_compare_firms(firm_ids)
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
