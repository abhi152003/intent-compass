'use client';

import { useState, useEffect } from 'react';
import { X, Download, Trash2, Tag } from 'lucide-react';
import { useFlowStore } from '@/lib/stores/flowStore';
import { templateService } from '@/lib/services/templates';
import type { FlowTemplate } from '@/types/flow';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white">Template Library</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Example Templates */}
          {exampleTemplates.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-400 mb-3">Example Templates</h4>
              <div className="space-y-2">
                {exampleTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-white mb-1">{template.name}</h5>
                        <p className="text-sm text-gray-400">{template.description}</p>
                      </div>
                      <button
                        onClick={() => loadTemplate(template)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Load
                      </button>
                    </div>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Templates */}
          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-3">My Templates</h4>
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No saved templates yet. Create a flow and save it as a template!
              </div>
            ) : (
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-white mb-1">{template.name}</h5>
                        <p className="text-sm text-gray-400">{template.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => loadTemplate(template)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          Load
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {template.tags && template.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
