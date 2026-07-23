const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dns.resolveSrv("_mongodb._tcp.cluster0.3t7qofc.mongodb.net", (err, result) => {
  if (err) {
    console.log("DNS ERROR:", err);
  } else {
    console.log(result);
  }
});