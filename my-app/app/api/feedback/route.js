// app/api/feedback/route.js
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { history, jobDetails } = await req.json();

    const systemPrompt = `
      You are an expert Hiring Manager. Analyze the following interview transcript for the role of ${jobDetails.job} at ${jobDetails.company}.
      
      Job Description: ${jobDetails.desc}

      OUTPUT FORMAT:
      Return ONLY a valid JSON object (no markdown, no extra text) with this structure:
      {
        "score": (number 0-100),
        "feedback": "A short summary paragraph of performance.",
        "strengths": ["point 1", "point 2", "point 3"],
        "weaknesses": ["point 1", "point 2", "point 3"],
        "verdict": "Hire" or "No Hire" or "Strong Hire"
      }
    `;

    // Convert history to text format for the AI to read easily
    const transcriptText = history.map(msg => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`
    ).join("\n");

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcriptText }
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" } // Forces AI to give strict JSON
    });

    const report = JSON.parse(completion.choices[0].message.content);
    return Response.json(report);

  } catch (error) {
    console.error("FEEDBACK ERROR:", error);
    return Response.json({ error: "Failed to generate report" }, { status: 500 });
  }
}