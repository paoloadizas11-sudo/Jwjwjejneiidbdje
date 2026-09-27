export async function GET() {
  return Response.json({
    status: "online",
    service: "BotHub deployment API",
  });
}

export async function POST(request) {
  try {
    const runnerUrl = process.env.RUNNER_URL;
    const runnerSecret = process.env.RUNNER_SECRET;

    if (!runnerUrl) {
      return Response.json(
        { error: "RUNNER_URL is not configured." },
        { status: 500 }
      );
    }

    if (!runnerSecret) {
      return Response.json(
        { error: "RUNNER_SECRET is not configured." },
        { status: 500 }
      );
    }

    const data = await request.json();

    if (!data?.filename || !data?.source_base64) {
      return Response.json(
        { error: "filename and source_base64 are required." },
        { status: 400 }
      );
    }

    const payload = {
      filename: data.filename,
      source_base64: data.source_base64,
      bot_token: data.bot_token || null,
      admin_ids: Array.isArray(data.admin_ids)
        ? data.admin_ids
        : [],
    };

    const response = await fetch(runnerUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Runner-Secret": runnerSecret,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = { message: text };
    }

    return Response.json(result, {
      status: response.status,
    });
  } catch (error) {
    console.error("Deploy API error:", error);

    return Response.json(
      {
        error: "Deployment request failed.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
