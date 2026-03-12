import { NextResponse } from "next/server";
import { agents } from "@/app/lib/agents";

export async function GET() {
  try {
    const vapiKey = process.env.VAPI_API_KEY;

    const enriched = await Promise.all(
      agents.map(async (agent) => {
        let metadata = null;

        if (vapiKey) {
          try {
            const res = await fetch(`https://api.vapi.ai/assistant/${agent.assistantId}`, {
              headers: { Authorization: `Bearer ${vapiKey}` },
              next: { revalidate: 3600 }, // cache for 1 hour
            });

            if (res.ok) {
              const data = await res.json();
              metadata = {
                model: data.model
                  ? { provider: data.model.provider, model: data.model.model }
                  : null,
                voice: data.voice
                  ? { provider: data.voice.provider, voiceId: data.voice.voiceId }
                  : null,
                transcriber: data.transcriber
                  ? { provider: data.transcriber.provider, model: data.transcriber.model }
                  : null,
                firstMessage: data.firstMessage ?? null,
              };
            }
          } catch {
            // If Vapi fetch fails, return agent without metadata
          }
        }

        return {
          assistantId: agent.assistantId,
          name: agent.name,
          description: agent.description,
          costPerMinutePence: agent.costPerMinutePence,
          metadata,
        };
      })
    );

    return NextResponse.json({ agents: enriched });
  } catch (error: any) {
    console.error("Error fetching agents:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
