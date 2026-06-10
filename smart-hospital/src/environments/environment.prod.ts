// Production config — used by `ng build` via angular.json fileReplacements.
//
// Set apiUrl to your hosted mock-server URL (Render/Railway/Fly) + '/api'.
// Example: 'https://shapms-api.onrender.com/api'
// Until you deploy the API, login + data calls will fail (the UI still renders).
export const environment = {
  production: true,
  apiUrl: 'https://YOUR-HOSTED-API.onrender.com/api',
  wsUrl: '',
};
