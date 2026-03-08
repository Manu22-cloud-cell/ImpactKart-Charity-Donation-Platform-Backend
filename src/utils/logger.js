const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");


// Create Logs Directory


const logDir = path.join(__dirname, "..", "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}


// Log Format

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}] : ${message}`;
  })
);


//Access Log Transport

const accessTransport = new DailyRotateFile({
  filename: path.join(logDir, "access-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
});


// Error Log Transport

const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "20m",
  maxFiles: "30d",
});


// Logger Instance

const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    accessTransport,
    errorTransport,
    new winston.transports.Console(),
  ],
});

module.exports = logger;