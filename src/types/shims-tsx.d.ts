import Vue, { VNode } from 'vue';
import { IpcRenderer } from 'electron';

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}
