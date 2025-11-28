import type { AppLoadContext, EntryContext } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

const ABORT_DELAY = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  const prohibitOutOfOrderStreaming =
    isBotRequest(request.headers.get("user-agent")) || remixContext.isSpaMode;

  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: prohibitOutOfOrderStreaming
        ? null
        : AbortSignal.timeout(ABORT_DELAY),
      onError(error: unknown) {
        console.error(error);
        responseStatusCode = 500;
      },
    }
  );

  if (prohibitOutOfOrderStreaming) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

function isBotRequest(userAgent: string | null) {
  if (!userAgent) {
    return false;
  }

  return isbot(userAgent);
}
