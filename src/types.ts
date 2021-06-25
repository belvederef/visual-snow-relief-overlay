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

export interface BackgroundImage {
  title: string;
  path: string;
}
