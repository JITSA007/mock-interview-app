// app/api/chat/route.js
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req) {
  try {
    const { history, newMessage, jobDetails } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing in .env.local");
    }

    const systemPrompt = `
      You are a seasoned, expert interviewer with 20 years of experience.
      
      CONTEXT:
      - Candidate Name: ${jobDetails.name}
      - Target Company: ${jobDetails.company}
      - Role: ${jobDetails.job}
      - Job Description: ${jobDetails.desc}

      YOUR BEHAVIOR:
      1. **Domain Adaptability:** If the role is Technical (BTech/BCA), focus on problem-solving and technical depth. If the role is Management (MBA/BBA), focus on strategy, leadership, and behavioral situations. If generic, focus on soft skills.
      2. **Human Tone:** Do NOT be robotic. Use phrases like "That's an interesting perspective," "Let's dig deeper into that," or "I see." Be polite but rigorous.
      3. **Structure:** - Acknowledge their previous answer briefly.
         - Ask ONE clear follow-up question.
         - Do not ask multiple questions at once.
      
      CRITICAL RULE:
      - Keep your response conversational and spoken-style (no complex bullet points, no markdown).
      - Maximum 2-3 sentences per turn so the voice output is natural.
    `;

    // Prepare conversation history
    const conversation = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    conversation.unshift({ role: 'system', content: systemPrompt });
    conversation.push({ role: 'user', content: newMessage });

    const completion = await groq.chat.completions.create({
      messages: conversation,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7, // Slightly higher for more "human" variance
    });

    const reply = completion.choices[0]?.message?.content || "Could you clarify that?";
    return Response.json({ reply });

  } catch (error) {
    console.error("❌ BACKEND ERROR:", error);
    return Response.json({ reply: "I'm having trouble connecting. Let's try again." }, { status: 500 });
  }
}