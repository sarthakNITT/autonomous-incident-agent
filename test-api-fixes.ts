#!/usr/bin/env bun

const BASE_URL = "http://localhost:3006";
const STATE_SERVICE_URL = "http://localhost:3003";

const TEST_USER_ID = "user_2B9ODSeLLGJlc-JRKTDzagjlZnj";

interface TestResult {
  endpoint: string;
  status: number;
  success: boolean;
  message: string;
  data?: any;
}

async function testEndpoint(
  url: string,
  expectedStatus: number = 200,
): Promise<TestResult> {
  try {
    const response = await fetch(url);
    const data = await response.json().catch(() => null);

    const success = response.status === expectedStatus;

    return {
      endpoint: url,
      status: response.status,
      success,
      message: success
        ? `✅ Success`
        : `❌ Expected ${expectedStatus}, got ${response.status}`,
      data,
    };
  } catch (error: any) {
    return {
      endpoint: url,
      status: 0,
      success: false,
      message: `❌ Error: ${error.message}`,
    };
  }
}

async function runTests() {
  console.log("🧪 Testing Network Call Fixes\n");
  console.log("=".repeat(60));

  const tests: Promise<TestResult>[] = [
    testEndpoint(`${BASE_URL}/api/projects/user/${TEST_USER_ID}`, 200),

    testEndpoint(`${BASE_URL}/api/incidents`, 200),

    testEndpoint(`${BASE_URL}/privacy`, 200),

    testEndpoint(`${BASE_URL}/terms`, 200),

    testEndpoint(`${STATE_SERVICE_URL}/projects/user/${TEST_USER_ID}`, 200),

    testEndpoint(`${STATE_SERVICE_URL}/incidents`, 200),
  ];

  const results = await Promise.all(tests);

  console.log("\n📊 Test Results:\n");

  results.forEach((result, index) => {
    console.log(`Test ${index + 1}: ${result.endpoint}`);
    console.log(`  Status: ${result.status}`);
    console.log(`  ${result.message}`);

    if (result.data) {
      const dataType = Array.isArray(result.data)
        ? `Array (${result.data.length} items)`
        : typeof result.data === "object"
          ? `Object (${Object.keys(result.data).length} keys)`
          : typeof result.data;
      console.log(`  Data: ${dataType}`);

      if (Array.isArray(result.data)) {
        if (result.data.length === 0) {
          console.log(`    → Empty array (expected for user with no projects)`);
        } else {
          console.log(
            `    → Sample: ${JSON.stringify(result.data[0]).slice(0, 100)}...`,
          );
        }
      } else if (result.data.incidents !== undefined) {
        console.log(`    → Incidents: ${result.data.incidents.length} items`);
      }
    }

    console.log("");
  });

  const passedTests = results.filter((r) => r.success).length;
  const totalTests = results.length;

  console.log("=".repeat(60));
  console.log(`\n✨ Summary: ${passedTests}/${totalTests} tests passed\n`);

  if (passedTests === totalTests) {
    console.log("🎉 All tests passed! Network calls are working correctly.");
  } else {
    console.log("⚠️  Some tests failed. Please review the results above.");
    process.exit(1);
  }
}

runTests().catch(console.error);
