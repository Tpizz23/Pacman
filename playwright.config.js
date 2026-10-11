import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir:'./tests',testMatch:'browser.spec.js',timeout:30000,fullyParallel:true,
  use:{baseURL:'http://127.0.0.1:5173',headless:true,trace:'retain-on-failure'},
  webServer:{command:'npm run dev',url:'http://127.0.0.1:5173',reuseExistingServer:true},
  projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'webkit',use:{browserName:'webkit'}}],
});
