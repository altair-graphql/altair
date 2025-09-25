import { TouchbarManager } from './touchbar';

// Mock the ActionManager
const mockActionManager = {
  sendRequest: jest.fn(),
  reloadDocs: jest.fn(),
  showDocs: jest.fn(),
};

// Mock TouchBar components
const mockTouchBarButton = jest.fn();
const mockTouchBarSpacer = jest.fn();
const mockTouchBar = jest.fn();

jest.mock('electron', () => ({
  TouchBar: {
    TouchBarButton: mockTouchBarButton,
    TouchBarSpacer: mockTouchBarSpacer,
  },
}));

describe('TouchbarManager', () => {
  let touchbarManager: TouchbarManager;
  let mockDocsButton: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock button instance
    mockDocsButton = {
      label: 'Show Docs',
    };
    
    mockTouchBarButton.mockImplementation(({ label }) => {
      if (label === 'Show Docs') {
        return mockDocsButton;
      }
      return { label };
    });
    
    mockTouchBar.mockImplementation(() => ({}));
    
    // Mock TouchBar constructor
    (global as any).TouchBar = mockTouchBar;
    
    touchbarManager = new TouchbarManager(mockActionManager as any);
  });

  describe('createTouchBar', () => {
    it('should create a TouchBar with correct buttons', () => {
      touchbarManager.createTouchBar();
      
      expect(mockTouchBarButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Send Request',
          backgroundColor: '#7EBC59',
        })
      );
      
      expect(mockTouchBarButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Reload Docs',
        })
      );
      
      expect(mockTouchBarButton).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Show Docs',
        })
      );
    });
  });

  describe('updateDocsButtonState', () => {
    beforeEach(() => {
      touchbarManager.createTouchBar();
    });

    it('should update button label to "Hide Docs" when docs are visible', () => {
      touchbarManager.updateDocsButtonState(true);
      
      expect(mockDocsButton.label).toBe('Hide Docs');
    });

    it('should update button label to "Show Docs" when docs are not visible', () => {
      // First set to visible
      touchbarManager.updateDocsButtonState(true);
      expect(mockDocsButton.label).toBe('Hide Docs');
      
      // Then set to not visible
      touchbarManager.updateDocsButtonState(false);
      expect(mockDocsButton.label).toBe('Show Docs');
    });

    it('should handle cases when docsButton is not initialized', () => {
      const newTouchbarManager = new TouchbarManager(mockActionManager as any);
      
      // Should not throw when docsButton is undefined
      expect(() => {
        newTouchbarManager.updateDocsButtonState(true);
      }).not.toThrow();
    });
  });
});