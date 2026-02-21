const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const callGemini = async (prompt) => {
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY_MISSING");

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API Call Failed:', error.message);
        throw error;
    }
};

const parseJSON = (text) => {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
        return null;
    }
};

/* ─── Mock Fallbacks ─── */
const mockOutreach = (body) => ({
    message: `Hi ${body.name || 'there'}! I've been following ${body.company || 'your company'}'s growth and I'm very interested in the ${body.role || 'open'} position. My background aligns perfectly with the requirements, and I'd love to chat more about how I can contribute. Cheers!`
});

const mockResume = () => ({
    score_before: 45,
    score_after: 88,
    improved_bullets: [
        "• Boosted system throughput by 40% through Redis implementation and SQL optimization.",
        "• Spearheaded the migration from monolithic architecture to microservices using Node.js.",
        "• Reduced frontend bundle size by 35% using code-splitting and modern Vite build tools."
    ],
    missing_keywords: ["Cloud Architecture", "System Design", "Unit Testing", "Microservices"],
    suggestions: [
        "Include more quantifiable achievements with percentages and timeframes.",
        "Highlight experience with distributed systems and cloud providers (AWS/GCP).",
        "Add a dedicated skills section for better ATS parsing."
    ]
});

const mockInterview = (body) => ({
    questions: [
        {
            question: `How would you handle a high-concurrency event at ${body.company || 'this company'}?`,
            answer_star_format: "SITUATION: Handling sudden traffic spikes. TASK: Maintain zero downtime. ACTION: Implementing load balancers and horizontal scaling. RESULT: 100% uptime during peak holidays.",
            tips: "Focus on scalability and reliable system design patterns."
        },
        {
            question: "Tell me about a time you had to learn a complex technology quickly.",
            answer_star_format: "SITUATION: Needed to use GraphQL for a new project. TASK: Integrate it within 1 week. ACTION: Intensive documentation review and prototype building. RESULT: Successfully launched feature on schedule.",
            tips: "Demonstrate your learning agility and resourcefulness."
        }
    ],
    company_tips: [
        "Look into their recent engineering blog posts.",
        "Prepare questions about their 'On Call' culture and developer experience."
    ]
});

/* ─── Routes ─── */

router.post('/generate-outreach', auth, async (req, res) => {
    console.log('AI Request: Outreach Generation');
    try {
        const prompt = `Act as a professional career coach. Write a highly personalized LinkedIn message (max 300 characters) for a ${req.body.role} position at ${req.body.company}. The recipient's name is ${req.body.name || 'Hiring Manager'}. 
        Return ONLY a JSON object in this format: {"message": "the message text"}`;

        const result = await callGemini(prompt);
        const data = parseJSON(result);
        res.json(data || mockOutreach(req.body));
    } catch (err) {
        res.json(mockOutreach(req.body));
    }
});

router.post('/tailor-resume', auth, async (req, res) => {
    console.log('AI Request: Resume Tailoring');
    try {
        const prompt = `Act as an expert ATS (Applicant Tracking system) specialist.
        Job Description: ${req.body.jdText}
        User Resume Content: ${req.body.resumeText}
        
        Analyze the match and provide improvements.
        Return ONLY a JSON object in this exact format:
        {
          "score_before": number(0-100),
          "score_after": number(0-100),
          "improved_bullets": ["3-4 rewritten bullet points for the resume"],
          "missing_keywords": ["list of 5 missing technical keywords"],
          "suggestions": ["3 actionable tips to improve match"]
        }`;

        const result = await callGemini(prompt);
        const data = parseJSON(result);
        res.json(data || mockResume());
    } catch (err) {
        res.json(mockResume());
    }
});

router.post('/interview-prep', auth, async (req, res) => {
    console.log('AI Request: Interview Prep');
    try {
        const prompt = `Act as a senior engineering manager at ${req.body.company}. Prepare the candidate for a ${req.body.role} interview.
        Return ONLY a JSON object in this exact format:
        {
          "questions": [
            {
              "question": "string",
              "answer_star_format": "Detailed answer in Situation, Task, Action, Result format",
              "tips": "specific tip for this question"
            }
          ],
          "company_tips": ["unique tip about ${req.body.company} engineering culture"]
        }`;

        const result = await callGemini(prompt);
        const data = parseJSON(result);
        res.json(data || mockInterview(req.body));
    } catch (err) {
        res.json(mockInterview(req.body));
    }
});

module.exports = router;
