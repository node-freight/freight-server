<p align="center"><img src="http://v14d.com/freight/freight-250.png" height="150" /></p>
# Freight Server
### Learn more about [Freight](https://github.com/vladikoff/freight).

### Server Quick Setup

Install [Redis](http://redis.io/). OS X: `brew install redis` or Ubuntu `sudo apt-get install redis-server`.

Start the server:
```
git clone https://github.com/vladikoff/freight-server.git && cd freight-server
npm install
npm start
```

Server will start on port `8872`. You should be able to navigate to the dashboard: 

![](http://v14d.com/freight/freight-server-view.jpg)

### Configure 

#### Password

Freight Server automatically configures a password for you. You can change it by modifying the [development.json](https://github.com/vladikoff/freight-server/blob/master/config/development.json-dist) file.

#### Other Configuration

See [config/config.js](https://github.com/vladikoff/freight-server/blob/master/config/config.js#L12) for available 
configuration options and environment variables.

### Author

| [![twitter/vladikoff](https://avatars3.githubusercontent.com/u/128755?s=70)](https://twitter.com/vladikoff "Follow @vladikoff on Twitter") |
|---|
| [Vlad Filippov](http://vf.io/) |


### Release History
See the [CHANGELOG](CHANGELOG).
