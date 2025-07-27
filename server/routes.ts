import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as openai from "./openai";
import { insertPropertySchema, insertCandidateSchema, insertDocumentSchema, insertTaskSchema, insertVisitSlotSchema } from "@shared/schema";
import { randomUUID } from "crypto";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // In a real application, you would have a proper authentication check here.
  // For local development, we'll just simulate a logged-in user.
  (req as any).user = { claims: { sub: 'local-user-id' } };
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Property routes
  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const propertyData = insertPropertySchema.parse({
        ...req.body,
        ownerId: userId,
        slug: randomUUID().substring(0, 8)
      });
      
      const property = await storage.createProperty(propertyData);
      res.json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(400).json({ message: "Failed to create property" });
    }
  });

  app.get('/api/properties/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const properties = await storage.getPropertiesByOwner(userId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const property = await storage.getPropertyBySlug(slug);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // AI contract parsing
  app.post('/api/ai/parse-contract', isAuthenticated, async (req: any, res) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Contract text is required" });
      }
      
      const parsedData = await openai.parseContract(text);
      res.json(parsedData);
    } catch (error) {
      console.error("Error parsing contract:", error);
      res.status(500).json({ message: "Failed to parse contract" });
    }
  });

  // Document upload and parsing
  app.post('/api/documents/upload', isAuthenticated, upload.single('document'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = req.user.claims.sub;
      const { propertyId, type } = req.body;
      
      // For demo purposes, create a mock URL. In production, upload to cloud storage
      const fileUrl = `https://storage.mietlink.ch/${randomUUID()}-${req.file.originalname}`;
      
      // Classify document using AI if it's an image
      let isValid = true;
      let confidence = 0.95;
      let validationReason = "Document accepted";
      
      if (req.file.mimetype.startsWith('image/')) {
        const base64 = req.file.buffer.toString('base64');
        const classification = await openai.classifyDocument(base64, req.file.originalname);
        isValid = classification.valid;
        confidence = classification.confidence;
        validationReason = classification.reason;
      }

      const documentData = insertDocumentSchema.parse({
        userId,
        propertyId: propertyId || null,
        type,
        url: fileUrl,
        filename: req.file.originalname,
        isValid,
        confidence,
        validationReason
      });

      const document = await storage.createDocument(documentData);
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get('/api/documents/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const documents = await storage.getDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // AI-powered contract parsing
  app.post('/api/ai/parse-contract', isAuthenticated, async (req, res) => {
    try {
      const { text } = req.body;
      const result = await openai.parseContract(text);
      res.json(result);
    } catch (error) {
      console.error("Error parsing contract:", error);
      res.status(500).json({ message: "Failed to parse contract" });
    }
  });

  // AI cover letter generation
  app.post('/api/ai/cover-letter', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { propertyId, userInfo, propertyInfo, language } = req.body;
      
      const result = await openai.generateCoverLetter(userInfo, propertyInfo, language);
      
      // Update candidate with cover letter
      const candidate = await storage.getCandidateByUserAndProperty(userId, propertyId);
      if (candidate) {
        await storage.updateCandidate(candidate.id, { coverLetter: result.text });
      }
      
      res.json(result);
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ message: "Failed to generate cover letter" });
    }
  });

  // Task management
  app.post('/api/tasks', isAuthenticated, async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.get('/api/tasks/:propertyId', isAuthenticated, async (req, res) => {
    try {
      const { propertyId } = req.params;
      const tasks = await storage.getTasksByProperty(propertyId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Visit slots
  app.post('/api/visit-slots', isAuthenticated, async (req, res) => {
    try {
      const slotData = insertVisitSlotSchema.parse(req.body);
      const slot = await storage.createVisitSlot(slotData);
      res.json(slot);
    } catch (error) {
      console.error("Error creating visit slot:", error);
      res.status(400).json({ message: "Failed to create visit slot" });
    }
  });

  app.get('/api/visit-slots/:propertyId', async (req, res) => {
    try {
      const { propertyId } = req.params;
      const slots = await storage.getVisitSlotsByProperty(propertyId);
      res.json(slots);
    } catch (error) {
      console.error("Error fetching visit slots:", error);
      res.status(500).json({ message: "Failed to fetch visit slots" });
    }
  });

  // Candidate management
  app.post('/api/candidates', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const candidateData = insertCandidateSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if candidate already exists
      const existing = await storage.getCandidateByUserAndProperty(userId, candidateData.propertyId);
      if (existing) {
        return res.status(400).json({ message: "Application already exists" });
      }
      
      const candidate = await storage.createCandidate(candidateData);
      res.json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      res.status(400).json({ message: "Failed to create application" });
    }
  });

  app.get('/api/candidates/:propertyId', isAuthenticated, async (req, res) => {
    try {
      const { propertyId } = req.params;
      const candidates = await storage.getCandidatesByProperty(propertyId);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  // AI score explanation
  app.post('/api/ai/explain-score', isAuthenticated, async (req, res) => {
    try {
      const { candidateData } = req.body;
      const result = await openai.explainScore(candidateData);
      res.json(result);
    } catch (error) {
      console.error("Error explaining score:", error);
      res.status(500).json({ message: "Failed to explain score" });
    }
  });

  // Generate regie email
  app.post('/api/ai/regie-email', isAuthenticated, async (req, res) => {
    try {
      const { candidates, language } = req.body;
      const result = await openai.generateRegieEmail(candidates, language);
      res.json(result);
    } catch (error) {
      console.error("Error generating regie email:", error);
      res.status(500).json({ message: "Failed to generate email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
