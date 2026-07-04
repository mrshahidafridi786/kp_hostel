module.exports = {
  apps: [
    {
      name: 'kp-hostel',
      script: 'node_modules/.bin/next',
      args: 'start',
      cwd: 'c:/Users/A2Z/Desktop/kp hostel',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
