export function createFakeOpenAi() {
  const calls = [];

  return {
    calls,
    nextError: null,
    nextImageBuffers: null,

    async generateImages(request) {
      calls.push(request);

      if (this.nextError) {
        const error = this.nextError;
        this.nextError = null;
        throw error;
      }

      const imageBuffers = this.nextImageBuffers;
      this.nextImageBuffers = null;

      return { imageBuffers, usage: null };
    },
  };
}
