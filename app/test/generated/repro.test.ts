import { expect, test } from "bun:test";

test("reproduce seeded failure", async () => {
    const response = await fetch("http://localhost:3000/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            request_id: "repro-test-1",
            payload: { action: "cause_error" }
        })
    });

    console.log(`Trigger status: ${response.status}`);
    
    // If bug is present, this returns 500
    // If bug is fixed, this might return 200 (or whatever default behavior is)
    
    // For a reproduction test, we typically want to assert that it FAILS (to prove the bug)
    // or we can write a test that passes if the fix works.
    // Given the prompt asks for "reproduction proof", capturing the 500 is the key.
    
    if (response.status === 500) {
        console.log("Bug reproduced: 500 Internal Server Error");
    } else {
        console.log("Bug NOT reproduced: Request succeeded");
    }
});
