export function createFakePromptEnhancer() {
  const calls = [];

  return {
    calls,
    nextError: null,
    nextResult: null,

    async enhancePrompt(request) {
      calls.push(request);

      if (this.nextError) {
        const error = this.nextError;
        this.nextError = null;
        throw error;
      }

      const result = this.nextResult ?? {
        enhancedPrompt: `${request.prompt}, soft morning light, wide shot`,
        addedDescriptors: ['soft morning light', 'wide shot'],
      };
      this.nextResult = null;

      return result;
    },
  };
}
