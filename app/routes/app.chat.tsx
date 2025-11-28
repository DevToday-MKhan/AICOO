import { json } from "@remix-run/node";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useActionData } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  TextField,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  const history = await prisma.chatHistory.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return json({
    shop: session.shop,
    history,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const message = formData.get("message") as string;

  if (!message) {
    return json({ error: "Message is required" }, { status: 400 });
  }

  // Save user message
  await prisma.chatHistory.create({
    data: {
      shop: session.shop,
      role: "user",
      content: message,
    },
  });

  try {
    // Get GPT response
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant for an e-commerce business management platform called AI-COO. 
          You help merchants with inventory management, pricing strategies, marketing recommendations, 
          order fulfillment optimization, and business insights. Be helpful, professional, and actionable.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const assistantMessage = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Save assistant response
    await prisma.chatHistory.create({
      data: {
        shop: session.shop,
        role: "assistant",
        content: assistantMessage,
      },
    });

    return json({
      success: true,
      message: assistantMessage,
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    const fallbackMessage = "I'm currently experiencing technical difficulties. Please try again later.";
    
    await prisma.chatHistory.create({
      data: {
        shop: session.shop,
        role: "assistant",
        content: fallbackMessage,
      },
    });

    return json({
      success: true,
      message: fallbackMessage,
    });
  }
}

export default function ChatPage() {
  const { shop, history } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("message", message);
    submit(formData, { method: "post" });
    setMessage("");
  };

  useEffect(() => {
    if (actionData) {
      setIsLoading(false);
    }
  }, [actionData]);

  return (
    <Page title="AI Assistant" subtitle="Get GPT-powered business insights">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <div
                style={{
                  maxHeight: "500px",
                  overflowY: "auto",
                  padding: "1rem",
                  backgroundColor: "#f6f6f7",
                  borderRadius: "8px",
                }}
              >
                <BlockStack gap="400">
                  {history.length === 0 && (
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Start a conversation with your AI assistant...
                    </Text>
                  )}
                  {history.map((msg: any) => (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: msg.role === "user" ? "#005bd3" : "#fff",
                          color: msg.role === "user" ? "#fff" : "#000",
                          padding: "12px 16px",
                          borderRadius: "12px",
                          maxWidth: "80%",
                        }}
                      >
                        <Text as="p" variant="bodyMd">
                          {msg.content}
                        </Text>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div style={{ alignSelf: "flex-start" }}>
                      <div
                        style={{
                          backgroundColor: "#fff",
                          padding: "12px 16px",
                          borderRadius: "12px",
                        }}
                      >
                        <Text as="p" variant="bodyMd" tone="subdued">
                          Thinking...
                        </Text>
                      </div>
                    </div>
                  )}
                </BlockStack>
              </div>

              <Divider />

              <form onSubmit={handleSubmit}>
                <InlineStack gap="300" align="end">
                  <div style={{ flex: 1 }}>
                    <TextField
                      label=""
                      value={message}
                      onChange={setMessage}
                      placeholder="Ask about inventory, pricing, marketing strategies..."
                      autoComplete="off"
                    />
                  </div>
                  <Button variant="primary" submit disabled={!message.trim() || isLoading}>
                    Send
                  </Button>
                </InlineStack>
              </form>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
