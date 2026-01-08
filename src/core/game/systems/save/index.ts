/**
 * Save System - Public API
 * Single entry point for all save system operations
 * 
 * This module provides a clean, encapsulated API for save/load operations.
 * Internal implementation details are hidden in sub-modules.
 */

// Slot Management
export { setSaveSlot, getSaveSlot, deleteSaveSlot } from './SaveSlotManager'

// Save/Load Operations
export { saveAll, loadAll, restoreFromSave, autoSave } from './SaveOperations'

// Export/Import
export { exportSaveAsJSON, importSaveFromJSON, downloadSaveFile, readSaveFile } from './SaveExportImport'

// User Data
export { getUUID, getUsername, setUsername, isFirstTime, initSaveSystem } from './UserDataManager'


