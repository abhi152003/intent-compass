import type { FlowTemplate, FlowNode, FlowEdge } from '@/types/flow';

const STORAGE_KEY = 'intentcompass-templates';

/**
 * Template service for saving and loading flow templates
 */
export class TemplateService {
  /**
   * Get all templates from localStorage
   */
  getTemplates(): FlowTemplate[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load templates:', error);
      return [];
    }
  }

  /**
   * Save a template
   */
  saveTemplate(
    name: string,
    description: string,
    nodes: FlowNode[],
    edges: FlowEdge[],
    tags?: string[]
  ): FlowTemplate {
    const template: FlowTemplate = {
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      nodes,
      edges,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags,
    };

    const templates = this.getTemplates();
    templates.push(template);

    this.saveToStorage(templates);
    return template;
  }

  /**
   * Update a template
   */
  updateTemplate(
    id: string,
    updates: Partial<Omit<FlowTemplate, 'id' | 'createdAt'>>
  ): FlowTemplate | null {
    const templates = this.getTemplates();
    const index = templates.findIndex((t) => t.id === id);

    if (index === -1) return null;

    templates[index] = {
      ...templates[index],
      ...updates,
      updatedAt: Date.now(),
    };

    this.saveToStorage(templates);
    return templates[index];
  }

  /**
   * Delete a template
   */
  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filtered = templates.filter((t) => t.id !== id);

    if (filtered.length === templates.length) {
      return false; // Template not found
    }

    this.saveToStorage(filtered);
    return true;
  }

  /**
   * Get a template by ID
   */
  getTemplate(id: string): FlowTemplate | null {
    const templates = this.getTemplates();
    return templates.find((t) => t.id === id) || null;
  }

  /**
   * Get example templates
   */
  getExampleTemplates(): FlowTemplate[] {
    return [
      {
        id: 'example-bridge-stake',
        name: 'Bridge & Stake on Aave',
        description: 'Bridge USDC from Base to Ethereum and stake on Aave',
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 250, y: 50 },
            data: {
              label: 'Start',
              chain: 84532, // Base Sepolia
              token: 'USDC' as const,
              amount: '100',
            },
          },
          {
            id: 'bridge-1',
            type: 'bridge',
            position: { x: 250, y: 200 },
            data: {
              label: 'Bridge',
              fromChain: 84532,
              toChain: 11155111,
              token: 'USDC' as const,
              amount: '100',
            },
          },
          {
            id: 'execute-1',
            type: 'execute',
            position: { x: 250, y: 350 },
            data: {
              label: 'Execute',
              chain: 11155111,
              action: 'stake' as const,
              token: 'USDC' as const,
              amount: '100',
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 250, y: 500 },
            data: {
              label: 'End',
              chain: 11155111,
              expectedToken: 'USDC' as const,
              expectedAmount: '100',
              description: 'Earning yield on Aave',
            },
          },
        ] as FlowNode[],
        edges: [
          { id: 'e1-2', source: 'start-1', target: 'bridge-1', type: 'smoothstep', animated: true },
          { id: 'e2-3', source: 'bridge-1', target: 'execute-1', type: 'smoothstep', animated: true },
          { id: 'e3-4', source: 'execute-1', target: 'end-1', type: 'smoothstep', animated: true },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ['bridge', 'stake', 'aave'],
      },
      {
        id: 'example-simple-bridge',
        name: 'Simple Bridge',
        description: 'Bridge USDC from Base Sepolia to Ethereum Sepolia',
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 250, y: 50 },
            data: {
              label: 'Start',
              chain: 84532,
              token: 'USDC' as const,
              amount: '50',
            },
          },
          {
            id: 'bridge-1',
            type: 'bridge',
            position: { x: 250, y: 200 },
            data: {
              label: 'Bridge',
              fromChain: 84532,
              toChain: 11155111,
              token: 'USDC' as const,
              amount: '50',
            },
          },
          {
            id: 'end-1',
            type: 'end',
            position: { x: 250, y: 350 },
            data: {
              label: 'End',
              chain: 11155111,
              expectedToken: 'USDC' as const,
              expectedAmount: '50',
              description: 'Bridged successfully',
            },
          },
        ] as FlowNode[],
        edges: [
          { id: 'e1-2', source: 'start-1', target: 'bridge-1', type: 'smoothstep', animated: true },
          { id: 'e2-3', source: 'bridge-1', target: 'end-1', type: 'smoothstep', animated: true },
        ],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tags: ['bridge', 'simple'],
      },
    ];
  }

  /**
   * Save templates to localStorage
   */
  private saveToStorage(templates: FlowTemplate[]): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }
}

export const templateService = new TemplateService();
