/**
 * Email Service Implementation
 * Implements Section 8.2.2: Communication capabilities
 * Handles email drafting, extracted voice application, and trust-tier gated sending
 */

import nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { EmailDraft, EmailRequest, ServiceStatus } from '../models/types';

export class EmailService {
  private transporter: nodemailer.Transporter;
  private drafts: Map<string, EmailDraft> = new Map();
  private outbox: Map<string, EmailDraft> = new Map();
  private sentEmails: Map<string, EmailDraft> = new Map();
  private extractedVoiceProfile: any = null;

  constructor() {
    this.initializeTransporter();
    this.loadDraftsFromStorage();
  }

  private initializeTransporter(): void {
    // Configure SMTP transporter
    const config = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    this.transporter = nodemailer.createTransporter(config);
  }

  private async loadDraftsFromStorage(): Promise<void> {
    try {
      const draftsPath = path.join(process.cwd(), 'data', 'email-drafts.json');
      const data = await fs.readFile(draftsPath, 'utf-8');
      const drafts = JSON.parse(data);
      
      this.drafts = new Map(drafts.drafts || []);
      this.outbox = new Map(drafts.outbox || []);
      this.sentEmails = new Map(drafts.sent || []);
    } catch (error) {
      console.log('No existing email drafts found, starting fresh');
    }
  }

  private async saveDraftsToStorage(): Promise<void> {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      await fs.mkdir(dataDir, { recursive: true });
      
      const draftsPath = path.join(dataDir, 'email-drafts.json');
      const data = {
        drafts: Array.from(this.drafts.entries()),
        outbox: Array.from(this.outbox.entries()),
        sent: Array.from(this.sentEmails.entries())
      };
      
      await fs.writeFile(draftsPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save email drafts:', error);
    }
  }

  async createDraft(request: EmailRequest): Promise<EmailDraft> {
    const draftId = uuidv4();
    
    // Generate email content based on context and extracted voice
    const subject = request.subject || this.generateSubject(request.context);
    const body = await this.generateEmailBody(request);

    const draft: EmailDraft = {
      id: draftId,
      to: request.to,
      cc: request.cc,
      bcc: request.bcc,
      subject,
      body,
      tone: request.tone || 'professional',
      extractedVoiceApplied: request.useExtractedVoice || false,
      trustTierRequired: this.calculateRequiredTrustTier(request),
      status: 'draft',
      metadata: {
        urgency: this.inferUrgency(request.context),
        context: request.context,
        suggestedEdits: await this.generateSuggestions(body)
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Apply extracted voice if requested and available
    if (request.useExtractedVoice && this.extractedVoiceProfile) {
      draft.body = await this.applyExtractedVoice(draft.body);
      draft.extractedVoiceApplied = true;
    }

    this.drafts.set(draftId, draft);
    await this.saveDraftsToStorage();

    return draft;
  }

  async sendDraft(draftId: string, trustTier: number): Promise<EmailDraft> {
    const draft = this.drafts.get(draftId) || this.outbox.get(draftId);
    
    if (!draft) {
      throw new Error(`Draft ${draftId} not found`);
    }

    // Check trust tier requirements
    if (trustTier < draft.trustTierRequired) {
      throw new Error(`Trust tier ${trustTier} insufficient. Required: ${draft.trustTierRequired}`);
    }

    // Move to outbox if not already there
    if (draft.status === 'draft') {
      draft.status = 'outbox';
      this.drafts.delete(draftId);
      this.outbox.set(draftId, draft);
      await this.saveDraftsToStorage();
    }

    try {
      // Send email
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'sallie@localhost',
        to: draft.to.join(', '),
        cc: draft.cc?.join(', '),
        bcc: draft.bcc?.join(', '),
        subject: draft.subject,
        html: this.formatEmailHtml(draft.body),
        text: draft.body
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      // Update draft status
      draft.status = 'sent';
      draft.updatedAt = new Date();
      
      // Move to sent emails
      this.outbox.delete(draftId);
      this.sentEmails.set(draftId, draft);
      await this.saveDraftsToStorage();

      console.log(`Email sent successfully: ${result.messageId}`);
      return draft;

    } catch (error) {
      draft.status = 'failed';
      draft.updatedAt = new Date();
      await this.saveDraftsToStorage();
      
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async getOutbox(): Promise<EmailDraft[]> {
    return Array.from(this.outbox.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async getDraft(draftId: string): Promise<EmailDraft | null> {
    return this.drafts.get(draftId) || this.outbox.get(draftId) || this.sentEmails.get(draftId) || null;
  }

  async updateDraft(draftId: string, updates: Partial<EmailDraft>): Promise<EmailDraft> {
    const draft = this.drafts.get(draftId);
    
    if (!draft) {
      throw new Error(`Draft ${draftId} not found`);
    }

    // Prevent modification of sent emails
    if (draft.status === 'sent') {
      throw new Error('Cannot modify sent emails');
    }

    Object.assign(draft, updates);
    draft.updatedAt = new Date();
    
    await this.saveDraftsToStorage();
    return draft;
  }

  async deleteDraft(draftId: string): Promise<void> {
    const draft = this.drafts.get(draftId) || this.outbox.get(draftId);
    
    if (!draft) {
      throw new Error(`Draft ${draftId} not found`);
    }

    // Prevent deletion of sent emails
    if (draft.status === 'sent') {
      throw new Error('Cannot delete sent emails');
    }

    this.drafts.delete(draftId);
    this.outbox.delete(draftId);
    await this.saveDraftsToStorage();
  }

  private generateSubject(context?: string): string {
    if (!context) return 'Message from Sallie';
    
    const subjectPatterns = {
      'follow-up': 'Following up on our conversation',
      'meeting': 'Regarding our upcoming meeting',
      'project': 'Project update and next steps',
      'personal': 'Checking in',
      'urgent': 'Time-sensitive matter',
      'thank-you': 'Thank you',
      'apology': 'My apologies',
      'question': 'Quick question',
      'information': 'Information you requested',
      'default': 'A note from Sallie'
    };

    const lowerContext = context.toLowerCase();
    for (const [key, subject] of Object.entries(subjectPatterns)) {
      if (lowerContext.includes(key)) {
        return subject;
      }
    }

    return subjectPatterns.default;
  }

  private async generateEmailBody(request: EmailRequest): Promise<string> {
    const { context, tone, to } = request;
    
    let body = '';
    
    // Generate opening based on tone
    const openings = {
      professional: ['I hope this email finds you well.', 'Dear ', 'Good ', ],
      casual: ['Hey ', 'Hi ', 'Hello '],
      warm: ['Hope you\'re doing well!', 'Thinking of you', 'Just wanted to reach out'],
      formal: ['Dear ', 'To whom it may concern', 'Esteemed ']
    };

    const opening = openings[tone || 'professional'][Math.floor(Math.random() * openings[tone || 'professional'].length)];
    body += opening + (to[0]?.split('@')[0] || 'there') + ',\n\n';

    // Generate body based on context
    if (context) {
      body += await this.expandContext(context, tone);
    } else {
      body += 'I wanted to reach out regarding ';
      body += this.generateDefaultContent(tone);
    }

    // Generate closing based on tone
    const closings = {
      professional: ['Best regards,', 'Sincerely,', 'Regards,'],
      casual: ['Cheers,', 'Best,', 'Talk soon,'],
      warm: ['Warmly,', 'With care,', 'Thinking of you,'],
      formal: ['Respectfully yours,', 'Yours sincerely,', 'Cordially,']
    };

    const closing = closings[tone || 'professional'][Math.floor(Math.random() * closings[tone || 'professional'].length)];
    body += '\n\n' + closing + '\nSallie';

    return body;
  }

  private async expandContext(context: string, tone?: string): Promise<string> {
    // This would integrate with the AI service to expand context
    // For now, return a basic expansion
    const expansions = {
      'follow-up': 'following up on our recent conversation. I wanted to check in on the progress we discussed and see if there\'s anything I can help with.',
      'meeting': 'our upcoming meeting. I\'ve been thinking about the topics we\'ll cover and wanted to share a few thoughts beforehand.',
      'project': 'the project we\'ve been working on. There have been some developments that I thought you\'d like to know about.',
      'personal': 'just wanted to see how you\'re doing. It\'s been a little while since we last connected.',
      'default': context
    };

    const lowerContext = context.toLowerCase();
    for (const [key, expansion] of Object.entries(expansions)) {
      if (lowerContext.includes(key)) {
        return expansion;
      }
    }

    return context;
  }

  private generateDefaultContent(tone?: string): string {
    const contents = {
      professional: 'a matter that I believe deserves your attention.',
      casual: 'something I thought you might find interesting.',
      warm: 'something that\'s been on my mind.',
      formal: 'an important matter that requires your consideration.'
    };

    return contents[tone || 'professional'];
  }

  private async applyExtractedVoice(body: string): Promise<string> {
    if (!this.extractedVoiceProfile) return body;

    // Apply extracted voice patterns
    let modifiedBody = body;

    // Apply vocabulary markers
    if (this.extractedVoiceProfile.vocabularyMarkers) {
      // This would integrate with a more sophisticated voice application system
      // For now, keep the original body
    }

    // Apply sentence rhythm
    switch (this.extractedVoiceProfile.sentenceRhythm) {
      case 'short':
        modifiedBody = this.shortenSentences(modifiedBody);
        break;
      case 'long':
        modifiedBody = this.lengthenSentences(modifiedBody);
        break;
      case 'varied':
        modifiedBody = this.varySentenceLength(modifiedBody);
        break;
    }

    // Apply humor style
    if (this.extractedVoiceProfile.humorStyle === 'playful') {
      modifiedBody = this.addPlayfulElements(modifiedBody);
    } else if (this.extractedVoiceProfile.humorStyle === 'dry') {
      modifiedBody = this.addDryHumor(modifiedBody);
    }

    return modifiedBody;
  }

  private shortenSentences(text: string): string {
    return text.split('. ').map(sentence => {
      const words = sentence.trim().split(' ');
      if (words.length > 10) {
        return words.slice(0, 10).join(' ') + '.';
      }
      return sentence;
    }).join('. ');
  }

  private lengthenSentences(text: string): string {
    return text.split('. ').map(sentence => {
      const words = sentence.trim().split(' ');
      if (words.length < 8 && words.length > 2) {
        return sentence + ' I wanted to provide a bit more detail on this topic.';
      }
      return sentence;
    }).join('. ');
  }

  private varySentenceLength(text: string): string {
    // Simple implementation - could be more sophisticated
    return text;
  }

  private addPlayfulElements(text: string): string {
    return text.replace(/\./g, '. 😊');
  }

  private addDryHumor(text: string): string {
    return text.replace(/!/g, '.');
  }

  private calculateRequiredTrustTier(request: EmailRequest): number {
    // Tier 1: Drafts only
    // Tier 2: Can send to outbox (manual send required)
    // Tier 3: Can send automatically
    
    if (request.to.length > 5) return 3; // Mass emails
    if (request.context?.includes('urgent')) return 2; // Urgent emails
    return 1; // Standard emails
  }

  private inferUrgency(context?: string): 'low' | 'medium' | 'high' {
    if (!context) return 'medium';
    
    const lowerContext = context.toLowerCase();
    if (lowerContext.includes('urgent') || lowerContext.includes('asap')) return 'high';
    if (lowerContext.includes('when you have time') || lowerContext.includes('no rush')) return 'low';
    return 'medium';
  }

  private async generateSuggestions(body: string): Promise<string[]> {
    const suggestions = [];
    
    if (body.length > 500) {
      suggestions.push('Consider shortening this email for better readability');
    }
    
    if (!body.includes('?')) {
      suggestions.push('Consider adding a question to encourage response');
    }
    
    if (body.split('\n').length < 3) {
      suggestions.push('Consider adding paragraphs to improve structure');
    }

    return suggestions;
  }

  private formatEmailHtml(body: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email from Sallie</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .signature { margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          ${body.replace(/\n/g, '<br>')}
          <div class="signature">
            <p>Best regards,<br>Sallie</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async cleanupOldDrafts(): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days old

    for (const [id, draft] of this.drafts) {
      if (draft.createdAt < cutoffDate) {
        this.drafts.delete(id);
      }
    }

    for (const [id, draft] of this.outbox) {
      if (draft.createdAt < cutoffDate) {
        this.outbox.delete(id);
      }
    }

    await this.saveDraftsToStorage();
  }

  getStatus(): ServiceStatus {
    return {
      service: 'email-service',
      status: 'healthy',
      lastCheck: new Date(),
      details: {
        draftsCount: this.drafts.size,
        outboxCount: this.outbox.size,
        sentCount: this.sentEmails.size,
        transporterConfigured: !!this.transporter,
        extractedVoiceLoaded: !!this.extractedVoiceProfile
      }
    };
  }

  setExtractedVoiceProfile(profile: any): void {
    this.extractedVoiceProfile = profile;
  }
}
