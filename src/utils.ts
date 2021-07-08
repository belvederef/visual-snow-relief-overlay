import keyCodes from '@/data/keyCodes';

export const getKeycodeKeyName = (keyCode: number, isForDisplay: boolean) => {
  const val = keyCodes[keyCode.toString()];
  return val.includes('||') ? val.split('||')[isForDisplay ? 1 : 0] : val;
};
