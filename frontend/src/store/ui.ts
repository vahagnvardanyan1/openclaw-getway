import { create } from 'zustand';

interface UiState {
  chatPanelWidth: number;
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  gatewayStatus: 'connected' | 'disconnected';

  setChatPanelWidth: (width: number) => void;
  setConnectionStatus: (status: UiState['connectionStatus']) => void;
  setGatewayStatus: (status: UiState['gatewayStatus']) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  chatPanelWidth: 50,
  connectionStatus: 'connecting',
  gatewayStatus: 'disconnected',

  setChatPanelWidth: (width) => set({ chatPanelWidth: width }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setGatewayStatus: (status) => set({ gatewayStatus: status }),
}));
