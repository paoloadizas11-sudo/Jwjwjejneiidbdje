import json
import os
import urllib.request

def handler(request):
    if request.method != "POST":
        return {"statusCode": 405, "body": json.dumps({"error": "POST only"})}

    try:
        payload = request.body
        if isinstance(payload, bytes):
            payload = payload.decode()
        data = json.loads(payload or "{}")

        runner = os.environ.get("RUNNER_URL")
        if not runner:
            return {
                "statusCode": 200,
                "body": json.dumps({
                    "status": "Manifest ready",
                    "logs": [
                        "Vercel dashboard is online.",
                        "No RUNNER_URL is configured.",
                        "Connect a persistent Python worker to enable live deployment."
                    ]
                })
            }

        req = urllib.request.Request(
            runner,
            data=json.dumps(data).encode(),
            headers={"content-type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as r:
            result = r.read().decode()

        return {"statusCode": 200, "body": result}
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}
