module.exports = {
  modulePaths:["./"],
  testMatch: [ "**/__tests__/**/*-test.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ],
  testPathIgnorePatterns: ["<rootDir>/lib/", "<rootDir>/node_modules/"]
};
