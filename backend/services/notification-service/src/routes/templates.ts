import { Router, Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

const router = Router();

// Get notification templates
router.get('/', [
  query('type').optional().isIn(['email', 'sms', 'push', 'in_app']),
  query('category').optional().isIn(['system', 'security', 'updates', 'marketing', 'social']),
  query('active').optional().isBoolean(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { type, category, active } = req.query;

    // TODO: Query templates from database
    const templates = [
      {
        id: 'template-1',
        name: 'Welcome Email',
        type: 'email',
        category: 'system',
        subject: 'Welcome to Sallie Studio',
        content: {
          html: '<h1>Welcome {{userName}}!</h1><p>Thank you for joining Sallie Studio.</p>',
          text: 'Welcome {{userName}}! Thank you for joining Sallie Studio.',
        },
        variables: ['userName', 'activationLink'],
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'template-2',
        name: 'Security Alert',
        type: 'email',
        category: 'security',
        subject: 'Security Alert - New Login Detected',
        content: {
          html: '<p>A new login was detected on your account.</p><p>Location: {{location}}</p><p>Time: {{timestamp}}</p>',
          text: 'A new login was detected on your account. Location: {{location}}. Time: {{timestamp}}',
        },
        variables: ['location', 'timestamp', 'device'],
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'template-3',
        name: 'Push Notification',
        type: 'push',
        category: 'social',
        title: 'New Message',
        content: {
          body: 'You have a new message from {{senderName}}',
          icon: 'message-icon',
          action: 'open_chat',
        },
        variables: ['senderName', 'messageId'],
        active: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    // Apply filters
    let filteredTemplates = templates;
    if (type) {
      filteredTemplates = filteredTemplates.filter(t => t.type === type);
    }
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }
    if (active !== undefined) {
      const isActive = active === 'true';
      filteredTemplates = filteredTemplates.filter(t => t.active === isActive);
    }

    res.json({
      success: true,
      data: {
        templates: filteredTemplates,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get template by ID
router.get('/:id', [
  param('id').isUUID(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    // TODO: Query template from database
    const template = {
      id,
      name: 'Welcome Email',
      type: 'email',
      category: 'system',
      subject: 'Welcome to Sallie Studio',
      content: {
        html: '<h1>Welcome {{userName}}!</h1><p>Thank you for joining Sallie Studio.</p>',
        text: 'Welcome {{userName}}! Thank you for joining Sallie Studio.',
      },
      variables: ['userName', 'activationLink'],
      active: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    res.json({
      success: true,
      data: {
        template,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Create notification template
router.post('/', [
  body('name').trim().isLength({ min: 1, max: 100 }),
  body('type').isIn(['email', 'sms', 'push', 'in_app']),
  body('category').isIn(['system', 'security', 'updates', 'marketing', 'social']),
  body('subject').optional().trim().isLength({ min: 1, max: 200 }),
  body('content').isObject(),
  body('variables').isArray(),
  body('active').isBoolean(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { name, type, category, subject, content, variables, active } = req.body;

    // TODO: Create template in database
    const template = {
      id: `template-${Date.now()}`,
      name,
      type,
      category,
      subject,
      content,
      variables,
      active,
      createdBy: (req as any).user?.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logger.info(`Template created: ${template.id}`);

    res.status(201).json({
      success: true,
      data: {
        template,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update notification template
router.put('/:id', [
  param('id').isUUID(),
  body('name').optional().trim().isLength({ min: 1, max: 100 }),
  body('subject').optional().trim().isLength({ min: 1, max: 200 }),
  body('content').optional().isObject(),
  body('variables').optional().isArray(),
  body('active').optional().isBoolean(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // TODO: Update template in database
    const updatedTemplate = {
      id,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: (req as any).user?.userId,
    };

    logger.info(`Template updated: ${id}`);

    res.json({
      success: true,
      data: {
        template: updatedTemplate,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete notification template
router.delete('/:id', [
  param('id').isUUID(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    // TODO: Delete template from database
    logger.info(`Template deleted: ${id}`);

    res.json({
      success: true,
      message: 'Template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Preview template with sample data
router.post('/:id/preview', [
  param('id').isUUID(),
  body('data').isObject(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { data } = req.body;

    // TODO: Get template from database
    const template = {
      id,
      name: 'Welcome Email',
      type: 'email',
      category: 'system',
      subject: 'Welcome to Sallie Studio',
      content: {
        html: '<h1>Welcome {{userName}}!</h1><p>Thank you for joining Sallie Studio.</p>',
        text: 'Welcome {{userName}}! Thank you for joining Sallie Studio.',
      },
      variables: ['userName', 'activationLink'],
    };

    // TODO: Render template with provided data
    const renderedContent = {
      subject: template.subject,
      html: template.content.html.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match),
      text: template.content.text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match),
    };

    res.json({
      success: true,
      data: {
        template,
        rendered: renderedContent,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Test template
router.post('/:id/test', [
  param('id').isUUID(),
  body('recipient').isEmail(),
  body('data').isObject(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { recipient, data } = req.body;

    // TODO: Get template and send test notification
    logger.info(`Template test sent: ${id} to ${recipient}`);

    res.json({
      success: true,
      message: 'Test notification sent successfully',
      data: {
        recipient,
        templateId: id,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get template usage statistics
router.get('/:id/stats', [
  param('id').isUUID(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // TODO: Query template usage statistics from database
    const stats = {
      templateId: id,
      totalSent: 1234,
      totalDelivered: 1189,
      totalOpened: 567,
      totalClicked: 123,
      deliveryRate: 0.964,
      openRate: 0.477,
      clickRate: 0.217,
      period: {
        startDate: startDate || '2024-01-01T00:00:00Z',
        endDate: endDate || '2024-01-31T23:59:59Z',
      },
      dailyUsage: [
        {
          date: '2024-01-01',
          sent: 45,
          delivered: 43,
          opened: 23,
          clicked: 5,
        },
        {
          date: '2024-01-02',
          sent: 67,
          delivered: 65,
          opened: 34,
          clicked: 8,
        },
      ],
    };

    res.json({
      success: true,
      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Duplicate template
router.post('/:id/duplicate', [
  param('id').isUUID(),
  body('name').trim().isLength({ min: 1, max: 100 }),
], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name } = req.body;

    // TODO: Get original template and create duplicate
    const duplicatedTemplate = {
      id: `template-${Date.now()}`,
      name,
      type: 'email',
      category: 'system',
      subject: 'Welcome to Sallie Studio',
      content: {
        html: '<h1>Welcome {{userName}}!</h1><p>Thank you for joining Sallie Studio.</p>',
        text: 'Welcome {{userName}}! Thank you for joining Sallie Studio.',
      },
      variables: ['userName', 'activationLink'],
      active: false,
      createdBy: (req as any).user?.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      duplicatedFrom: id,
    };

    logger.info(`Template duplicated: ${id} -> ${duplicatedTemplate.id}`);

    res.status(201).json({
      success: true,
      data: {
        template: duplicatedTemplate,
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as templateRoutes };
