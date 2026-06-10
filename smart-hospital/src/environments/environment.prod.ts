// Production config — used by `ng build` via angular.json fileReplacements.
//
// IMPORTANT: apiUrl must point at your deployed Render API (NOT the Vercel domain).
// Render assigns a URL like https://<service-name>.onrender.com. Your service is
// named "appointment-system", so it is most likely the URL below — but VERIFY it:
// open https://<your-render-url>/api/doctors and confirm it returns the doctors.
// If Render gave a different host (e.g. a -xxxx suffix), update this and redeploy.
export const environment = {
  production: true,
  apiUrl: 'https://appointment-system.onrender.com/api',
  wsUrl: '',
};
