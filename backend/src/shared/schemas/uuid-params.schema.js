export function uuidParamsSchema(...names) {
  const properties = {};

  for (const name of names) {
    properties[name] = {
      type: 'string',
      format: 'uuid',
    };
  }

  return {
    type: 'object',
    required: names,
    properties,
    additionalProperties: false,
  };
}
