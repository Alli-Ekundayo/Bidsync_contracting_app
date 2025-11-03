module.exports = {
  apps: [{
    name: "bidsync-app",
    script: "npm",
    args: "start",
    env: {
      NODE_ENV: "production",
      PORT: "3000"  // You can change this port as needed
    }
  }]
}