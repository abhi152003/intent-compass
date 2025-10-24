import { create } from 'zustand';
import type { FlowStore, FlowTemplate } from '@/types/flow';

export const useFlowStore = create<FlowStore>((set, get) => ({
  // Nodes and Edges
  nodes: [],
  edges: [],

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node],
  })),

  updateNode: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } }
        : node
    ),
  })),

  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter((node) => node.id !== nodeId),
    edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
  })),

  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge],
  })),

  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter((edge) => edge.id !== edgeId),
  })),

  // Simulation
  simulation: null,
  setSimulation: (simulation) => set({ simulation }),

  // Execution
  execution: null,
  setExecution: (execution) => set({ execution }),

  updateExecutionStatus: (status) => set((state) => ({
    execution: state.execution
      ? { ...state.execution, status }
      : null,
  })),

  // Templates
  templates: [],

  addTemplate: (templateData) => {
    const template: FlowTemplate = {
      ...templateData,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      templates: [...state.templates, template],
    }));

    // Save to localStorage
    if (typeof window !== 'undefined') {
      const templates = [...get().templates, template];
      localStorage.setItem('intentcompass-templates', JSON.stringify(templates));
    }
  },

  removeTemplate: (id) => set((state) => {
    const templates = state.templates.filter((t) => t.id !== id);

    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('intentcompass-templates', JSON.stringify(templates));
    }

    return { templates };
  }),

  loadTemplate: (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (template) {
      set({
        nodes: template.nodes,
        edges: template.edges,
      });
    }
  },

  // Flow Actions
  clearFlow: () => set({
    nodes: [],
    edges: [],
    simulation: null,
    execution: null,
  }),

  resetExecution: () => set({
    execution: null,
    simulation: null,
  }),
}));

// Initialize templates from localStorage on client-side
if (typeof window !== 'undefined') {
  const savedTemplates = localStorage.getItem('intentcompass-templates');
  if (savedTemplates) {
    try {
      const templates = JSON.parse(savedTemplates);
      useFlowStore.setState({ templates });
    } catch (error) {
      console.error('Failed to load templates from localStorage:', error);
    }
  }
}
