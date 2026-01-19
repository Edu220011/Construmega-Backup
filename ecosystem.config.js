{
  "apps": [
    {
      "name": "construmega-backend",
      "script": "index.js",
      "cwd": "/var/www/construmega/backend",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "1G",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      },
      "error_file": "/var/log/pm2/construmega-error.log",
      "out_file": "/var/log/pm2/construmega-out.log",
      "log_file": "/var/log/pm2/construmega.log",
      "time": true
    }
  ]
}