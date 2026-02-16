function must(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

module.exports = {
  APP_JWT_SECRET: () => must("APP_JWT_SECRET"),
  MONGODB_URI: () => must("MONGODB_URI"),
  PI_SERVER_API_KEY: () => must("PI_SERVER_API_KEY") // from Pi developer portal
};