import base64
import json
import os
import urllib.request
import urllib.error


def handler(request):
    if request.method != "POST":
        return {
            "statusCode": 405,
            "body": json.dumps({"error": "POST only"}),
        }

    try:
        # Read request body
        payload = request.body

        if isinstance(payload, bytes):
            payload = payload.decode("utf-8")

        data = json.loads(payload or "{}")

        # Environment variables from Vercel
        runner = os.environ.get("RUNNER_URL", "").strip()
        secret = os.environ.get("RUNNER_SECRET", "").strip()

        if not runner:
            return {
                "statusCode": 500,
                "body": json.dumps({
                    "error": "RUNNER_URL is not configured in Vercel."
                }),
            }

        if not secret:
            return {
                "statusCode": 500,
                "body": json.dumps({
                    "error": "RUNNER_SECRET is not configured in Vercel."
                }),
            }

        # The frontend must provide the actual file as base64.
        source_base64 = data.get("source_base64")

        if not source_base64:
            return {
                "statusCode": 400,
                "body": json.dumps({
                    "error": "No bot file was supplied."
                }),
            }

        filename = data.get(
            "filename",
            "bot.zip"
        )

        # Forward deployment to Render worker
        worker_payload = {
            "filename": filename,
            "source_base64": source_base64,
            "bot_token": data.get("bot_token"),
            "admin_ids": data.get("admin_ids", []),
        }

        body = json.dumps(
            worker_payload
        ).encode("utf-8")

        req = urllib.request.Request(
            runner,
            data=body,
            headers={
                "Content-Type": "application/json",
                "X-Runner-Secret": secret,
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(
                req,
                timeout=60
            ) as response:

                result = response.read().decode(
                    "utf-8",
                    errors="replace"
                )

                return {
                    "statusCode": response.status,
                    "body": result,
                }

        except urllib.error.HTTPError as error:

            error_body = error.read().decode(
                "utf-8",
                errors="replace"
            )

            return {
                "statusCode": error.code,
                "body": json.dumps({
                    "error": "Runner returned an error.",
                    "runner_response": error_body,
                }),
            }

    except Exception as error:

        return {
            "statusCode": 500,
            "body": json.dumps({
                "error": str(error)
            }),
        }
