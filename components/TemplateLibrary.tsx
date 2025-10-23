'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, Tag } from 'lucide-react';
import { useFlowStore } from '@/lib/stores/flowStore';
import { templateService } from '@/lib/services/templates';
import type { FlowTemplate } from '@/types/flow';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Card from './ui/Card';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateLibrary({ isOpen, onClose }: TemplateLibraryProps) {
  const { setNodes, setEdges } = useFlowStore();
  const [templates, setTemplates] = useState<FlowTemplate[]>([]);
  const [exampleTemplates, setExampleTemplates] = useState<FlowTemplate[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTemplates(templateService.getTemplates());
      setExampleTemplates(templateService.getExampleTemplates());
    }
  }, [isOpen]);

  const loadTemplate = (template: FlowTemplate) => {
    setNodes(template.nodes);
    setEdges(template.edges);
    onClose();
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      templateService.deleteTemplate(id);
      setTemplates(templateService.getTemplates());
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="space-y-6 max-h-[60vh] overflow-y-auto">
      {/* Example Templates */}
      {exampleTemplates.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold font-heading text-text-primary mb-3">Example Templates</h4>
          <div className="space-y-2">
            {exampleTemplates.map((template) => (
              <Card key={template.id} variant="default" padding="md" className="hover:bg-bg-secondary transition-all duration-base">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold font-heading text-text-primary mb-1">{template.name}</h5>
                    <p className="text-sm text-text-secondary">{template.description}</p>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-0.5 bg-accent-blue/20 border border-accent-blue/30 rounded-full text-xs text-accent-blue"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => loadTemplate(template)}
                    variant="primary"
                    size="sm"
                    icon={<Download className="w-4 h-4" />}
                    className="flex-shrink-0"
                  >
                    Load
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* User Templates */}
      <div>
        <h4 className="text-sm font-semibold font-heading text-text-primary mb-3">My Templates</h4>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            No saved templates yet. Create a flow and save it as a template!
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <Card key={template.id} variant="default" padding="md" className="hover:bg-bg-secondary transition-all duration-base">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h5 className="font-semibold font-heading text-text-primary mb-1">{template.name}</h5>
                    <p className="text-sm text-text-secondary">{template.description}</p>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-0.5 bg-accent-green/20 border border-accent-green/30 rounded-full text-xs text-accent-green"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      onClick={() => loadTemplate(template)}
                      variant="primary"
                      size="sm"
                      icon={<Download className="w-4 h-4" />}
                    >
                      <span className="hidden sm:inline">Load</span>
                    </Button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-all duration-base cursor-pointer border border-transparent hover:border-error/30"
                      title="Delete template"
                      aria-label="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Template Library"
      description="Browse and load saved templates"
      size="lg"
      footer={
        <Button
          onClick={onClose}
          variant="secondary"
          size="md"
        >
          Close
        </Button>
      }
    >
      {content}
    </Modal>
  );
}
