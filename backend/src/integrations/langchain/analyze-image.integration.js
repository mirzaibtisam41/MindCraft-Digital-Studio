import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { ProviderError } from '#src/utils/index.js';
import {
  VISION_SYSTEM_PROMPT,
  VISION_TASKS,
} from '#src/integrations/langchain/vision-tasks.integration.js';
import { mapLangChainErrorIntegration } from '#src/integrations/langchain/map-langchain-error.integration.js';

function buildMessages({ task, question, history, image }) {
  const definition = VISION_TASKS[task];
  const instruction = question
    ? `${definition.instruction}\n\nQuestion: ${question}`
    : definition.instruction;

  return [
    new SystemMessage(VISION_SYSTEM_PROMPT),
    ...history.flatMap((turn) => [
      new HumanMessage(turn.question),
      new AIMessage(turn.answer),
    ]),
    new HumanMessage({
      content: [
        { type: 'text', text: instruction },
        {
          type: 'image_url',
          image_url: {
            url: `data:${image.contentType};base64,${image.buffer.toString('base64')}`,
          },
        },
      ],
    }),
  ];
}

export async function analyzeImageIntegration({
  chatModel,
  task,
  question = null,
  history = [],
  image,
}) {
  const structuredModel = chatModel.withStructuredOutput(
    VISION_TASKS[task].schema,
    { name: `image_${task}`, method: 'jsonSchema', strict: true },
  );

  try {
    return await structuredModel.invoke(
      buildMessages({ task, question, history, image }),
    );
  } catch (error) {
    throw new ProviderError({
      category: mapLangChainErrorIntegration({ error }),
      cause: error,
    });
  }
}
