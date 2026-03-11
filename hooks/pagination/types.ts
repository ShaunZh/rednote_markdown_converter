export interface Block {
  id: string;
  content: string;
  type: 'code' | 'standard' | 'image' | 'pagebreak';
}
