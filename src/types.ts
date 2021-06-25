export interface Settings {
  opacity: number;
  selectedImgIdx: number;
  keyboardShortcutElectron: string;
  keyboardShortcutDisplay: string;
}

export type ChangeKeyboardShortcut = Pick<
  Settings,
  'keyboardShortcutElectron' | 'keyboardShortcutDisplay'
>;
