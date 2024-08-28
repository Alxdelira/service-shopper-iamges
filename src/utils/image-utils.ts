// utils/image-utils.ts
export function getImageTypeFromBase64(base64: string): string {
   const matches = base64.match(/^data:image\/(\w+);base64,/);
   if (matches && matches[1]) {
      return `image/${matches[1]}`;
   }
   throw new Error('Invalid base64 image format');
}

// Função para extrair números do texto
export const extractNumber = (text: string): number | null => {
   const match = text.match(/\d+(\.\d+)?/);
   if (match) {
      const number = parseFloat(match[0].replace(',', '.'));
      return isNaN(number) ? null : number;
   }
   return null;
};
