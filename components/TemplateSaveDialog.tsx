'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { useFlowStore } from '@/lib/stores/flowStore';
import { templateService } from '@/lib/services/templates';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';

interface TemplateSaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TemplateSaveDialog({ isOpen, onClose }: TemplateSaveDialogProps) {
  const { nodes, edges } = useFlowStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a template name');
      return;
    }

    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    templateService.saveTemplate(name, description, nodes, edges, tagArray);

    setName('');
    setDescription('');
    setTags('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Save Template"
      description="Save your flow as a template for future use"
      size="md"
      footer={
        <>
          <Button
            onClick={onClose}
            variant="ghost"
            size="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="primary"
            size="md"
            icon={<Save className="w-4 h-4" />}
          >
            Save Template
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input
          label="Template Name"
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome Flow"
          helperText="Give your flow a descriptive name"
        />

        <Textarea
          label="Description"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this flow does..."
          helperText="Explain the purpose of this template"
        />

        <Input
          label="Tags (comma-separated)"
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="bridge, stake, aave"
          helperText="Add tags to organize your templates"
        />
      </div>
    </Modal>
  );
}
