# EVE Exchange Deepstream Router
This project provides an internal API consumed by various utilities within EVE Exchange that can publish data into Deepstream for consumption by the frontend clients. Deepstream does not have a fully featured native Python client, and since most core scripts are written in Python, this Node.js project acts as middleware for moving around data.

## Usage
Build server & start it:
```
npm start
```

## Technology
Realtime pub/sub makes use of a Deepstream client & server.
MongoDB is using for processing data.

## Author
Christopher Hampu

## License
MIT
