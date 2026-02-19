const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const API_KEY = process.env.CLAUDE_API_KEY;

const callClaude = async (prompt) => {
    if (!API_KEY) {
        throw new Error("Missing CLAUDE_API_KEY environment variable");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1024,
            messages: [
                { role: "user", content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Creating message failed");
    }

    const data = await response.json();
    return data.content[0].text;
};

// AI Resume Tailor
router.post('/tailor-resume', auth, async (req, res) => {
    try {
        const { jdText, resumeText } = req.body;

        const prompt = `
      You are an expert ATS resume optimizer. 
      Job Description: ${jdText}
      Resume: ${resumeText}
      
      Rewrite the resume bullet points to maximize keyword match with the JD.
      Return strictly a JSON object: { "score_before": number, "score_after": number, "improved_bullets": [], "missing_keywords": [], "suggestions": [] }
    `;

        const aiResponse = await callClaude(prompt);
        // Attempt to parse JSON from AI response if it wraps it in text
        // This is simplified; in production, use structured output enforcement or better parsing
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };

        res.json(parsed);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'AI processing failed' });
    }
});

// AI Interview Prep
router.post('/interview-prep', auth, async (req, res) => {
    try {
        const { role, company, jdText } = req.body;

        const prompt = `
      Generate interview prep for the role of ${role} at ${company}.
      Job Description context: ${jdText}

      Return strictly a JSON object with:
      {
        "questions": [
           { "question": "string", "answer_star_format": "string", "tips": "string" }
        ],
        "company_tips": []
      }
    `;

        const aiResponse = await callClaude(prompt);
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { error: "Failed to parse AI response" };

        res.json(parsed);
    } catch (error) {
        res.status(500).json({ error: 'AI processing failed' });
    }
});

module.exports = router;
