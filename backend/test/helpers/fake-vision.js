export function createFakeVision() {
  const calls = [];

  return {
    calls,
    nextError: null,
    nextResult: null,

    async analyzeImage(request) {
      calls.push(request);

      if (this.nextError) {
        const error = this.nextError;
        this.nextError = null;
        throw error;
      }

      const result = this.nextResult ?? { answer: 'A test answer' };
      this.nextResult = null;

      return result;
    },
  };
}
