interface Settings {
  opacity: number;
  selectedImgIdx: number;
  selectedIntervalIdx: number;
  selectedPauseIdx: number;
  keyboardShortcutElectron: string;
  keyboardShortcutDisplay: string;
  showScreenNextTime: boolean;
}

type ChangeKeyboardShortcut = Pick<
  Settings,
  'keyboardShortcutElectron' | 'keyboardShortcutDisplay'
>;

interface BackgroundImage {
  title: string;
  path: string;
}
