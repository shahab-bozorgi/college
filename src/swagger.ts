export const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      version: "1.0.0",
      title: "CollegeGram API",
      description: "CollegeGram API Information",
      contact: {
        name: "Cherry Ring",
      },
    },
    servers: [
      {
        url: "https://cherry-ring.dev1403.rahnemacollege.ir/api",
      },
      {
        url: "http://localhost:" + process.env.PORT,
      },
    ],
  },
  apis: ["src/api/**/*.ts", "src/api/**/*.js"],
};
