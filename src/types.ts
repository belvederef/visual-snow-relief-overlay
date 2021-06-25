export interface Settings {
  opacity: number;
  selectedImgIdx: number;
  keyboardShortcutElectron: string;
  keyboardShortcutDisplay: string;
  showScreenNextTime: boolean;
}

export type ChangeKeyboardShortcut = Pick<
  Settings,
  'keyboardShortcutElectron' | 'keyboardShortcutDisplay'
>;

export interface BackgroundImage {
  title: string;
  path: string;
}
