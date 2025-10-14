const baseConfig = require('../../jest.preset.cjs');

module.exports = {
  ...baseConfig,
  roots: ['<rootDir>/src'],
  displayName: 'inventory-service'
};
