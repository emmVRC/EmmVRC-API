module.exports = {
  apps : [{
    name: 'emmVRC network',
    script: 'index.js',
    instances: 'max',
    exec_mode:  'cluster',
    watch: '.',
    env: {
      "NODE_ENV": "production"
    }
  }],
  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
