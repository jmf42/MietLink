import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ContractParseResult {
  rent_chf: number;
  notice_months: number;
  key_count: number;
  obligations: string[];
}

export interface TaskGenResult {
  title: string;
  days_before_exit: number;
}

export interface DocClassifyResult {
  valid: boolean;
  confidence: number;
  doc_type: string;
  reason: string;
}

export interface CoverLetterResult {
  text: string;
}

export interface ScoreExplainResult {
  reason: string;
}

// Export all functions for use in routes
export default {
  parseContract,
  generateTasks,
  classifyDocument,
  generateCoverLetter,
  explainScore
};

export async function parseContract(text: string): Promise<ContractParseResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Swiss rental contract expert. Extract key information from rental contracts and return JSON in this exact format: {"rent_chf": number, "notice_months": number, "key_count": number, "obligations": [string array of tenant obligations]}. Use Swiss rental law defaults if information is missing.`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      rent_chf: result.rent_chf || 0,
      notice_months: result.notice_months || 3,
      key_count: result.key_count || 1,
      obligations: result.obligations || []
    };
  } catch (error) {
    throw new Error("Failed to parse contract: " + error);
  }
}

export async function generateTasks(obligations: string[]): Promise<TaskGenResult[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Convert tenant obligations into actionable tasks with due dates. Return JSON array: [{"title": "task description", "days_before_exit": number}]. Use Swiss rental standards for timing.`
        },
        {
          role: "user",
          content: `Obligations: ${obligations.join(", ")}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "[]");
    return Array.isArray(result) ? result : (result.tasks || []);
  } catch (error) {
    throw new Error("Failed to generate tasks: " + error);
  }
}

export async function classifyDocument(base64Image: string, filename?: string): Promise<DocClassifyResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a Swiss document validation expert. Classify and validate documents for rental applications. Return JSON: {"valid": boolean, "confidence": number (0-1), "doc_type": "id|permit|debt_extract|income|lease", "reason": "explanation"}. Be strict with Swiss document standards.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this document. Filename: ${filename || "unknown"}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      valid: result.valid || false,
      confidence: Math.max(0, Math.min(1, result.confidence || 0)),
      doc_type: result.doc_type || "unknown",
      reason: result.reason || "Unable to classify document"
    };
  } catch (error) {
    throw new Error("Failed to classify document: " + error);
  }
}

export async function generateCoverLetter(userInfo: any, propertyInfo: any, language: string = "de"): Promise<CoverLetterResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Write a professional, personal cover letter for a Swiss rental application in ${language}. Maximum 150 words. Sound human, not AI-generated. Avoid clichés. Return JSON: {"text": "cover letter"}.`
        },
        {
          role: "user",
          content: `User: ${JSON.stringify(userInfo)}, Property: ${JSON.stringify(propertyInfo)}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      text: result.text || "Unable to generate cover letter."
    };
  } catch (error) {
    throw new Error("Failed to generate cover letter: " + error);
  }
}

export async function explainScore(candidateData: any): Promise<ScoreExplainResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Explain in one sentence why this candidate received their score. Be specific about income ratio, document completeness, and debt status. Return JSON: {"reason": "explanation"}.`
        },
        {
          role: "user",
          content: JSON.stringify(candidateData)
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      reason: result.reason || "Score based on standard criteria."
    };
  } catch (error) {
    throw new Error("Failed to explain score: " + error);
  }
}

export async function generateRegieEmail(candidates: any[], language: string = "de"): Promise<{subject: string, body: string}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Write a professional email to a Swiss regie/landlord in ${language} with the top 3 candidates. Include a table with their scores and key info. Return JSON: {"subject": "email subject", "body": "email body"}.`
        },
        {
          role: "user",
          content: `Candidates: ${JSON.stringify(candidates)}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      subject: result.subject || "Top 3 Kandidaten für Ihre Wohnung",
      body: result.body || "Anbei finden Sie die drei besten Kandidaten."
    };
  } catch (error) {
    throw new Error("Failed to generate regie email: " + error);
  }
}
