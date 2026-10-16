import {
  AlignLeft,
  Boxes,
  HelpCircle,
  LayoutTemplate,
  MessageSquareQuote,
  ScanText,
} from 'lucide-react';

export const VISION_TASKS = [
  { value: 'describe', label: 'Describe image', icon: AlignLeft },
  { value: 'question', label: 'Ask a question', icon: HelpCircle },
  { value: 'ocr', label: 'Extract text · OCR', icon: ScanText },
  { value: 'objects', label: 'Identify objects', icon: Boxes },
  { value: 'design', label: 'Analyze design', icon: LayoutTemplate },
  { value: 'caption', label: 'Generate caption', icon: MessageSquareQuote },
];

export function findVisionTask(value) {
  return VISION_TASKS.find((task) => task.value === value);
}

export function analysisToText(analysis) {
  const { result } = analysis;

  if (!result) return '';

  switch (analysis.task) {
    case 'describe':
      return `${result.summary}\n\n${result.details}`;
    case 'question':
      return result.answer;
    case 'ocr':
      return result.hasText ? result.text : '';
    case 'objects':
      return result.objects
        .map((object) => `${object.name} (${object.location})`)
        .join('\n');
    case 'design':
      return [
        `Layout: ${result.layout}`,
        `Style: ${result.style}`,
        `Mood: ${result.mood}`,
        `Typography: ${result.typography}`,
        ...result.suggestions.map((suggestion) => `- ${suggestion}`),
      ].join('\n');
    case 'caption':
      return result.captions.join('\n');
    default:
      return '';
  }
}

export function analysisToPrompt(analysis) {
  if (analysis.task === 'describe') return analysis.result.details;
  if (analysis.task === 'caption') return analysis.result.captions[0];

  return null;
}
