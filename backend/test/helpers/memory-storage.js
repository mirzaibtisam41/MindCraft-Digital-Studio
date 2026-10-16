export function createMemoryStorage() {
  const files = new Map();

  return {
    files,

    async uploadFile({ key, body, contentType }) {
      files.set(key, { body, contentType });
    },

    async downloadFile({ key }) {
      return files.get(key).body;
    },

    async deleteFile({ key }) {
      files.delete(key);
    },

    async createSignedUrl({ key }) {
      return `https://storage.test/${key}?signature=test`;
    },

    close() {
      files.clear();
    },
  };
}
