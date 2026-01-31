module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      "@react-native-community/datetimepicker",
    ],
  };
};
