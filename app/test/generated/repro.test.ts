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
    
    if (response.status === 500) {
        console.log("Bug reproduced: 500 Internal Server Error");
    } else {
        console.log("Bug NOT reproduced: Request succeeded");
    }
});
