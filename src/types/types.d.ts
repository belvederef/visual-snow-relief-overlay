interface Settings {
  opacity: number;
  speed: number;
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
  steps: number;
}

interface StaticStylesInterface {
  '--static-background': string;
  '--static-opacity': number;
  '--static-steps': number;
  '--static-animation-duration': string;
}
