module.exports = {
  // Autres propriétés de configuration Jest...

  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },

  transformIgnorePatterns: [
    "/node_modules/(?!(react-markdown))/"
  ]
};
