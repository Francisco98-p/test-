module.exports = {
  // Entorno de testing
  testEnvironment: 'node',
  
  // Patrones para encontrar archivos de test
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  
  // Carpetas y archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/data/'
  ],
  
  // Timeout más largo para operaciones asíncronas
  testTimeout: 10000,
  
  // Limpiar mocks automáticamente
  clearMocks: true,
  
  // Configuración básica
  verbose: true,
  
  // Evitar que Jest se cuelgue
  forceExit: true,
  detectOpenHandles: true,
  
  // Configuración adicional para manejar módulos con cache
  resetModules: true
};