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
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/api/**/*.ts"],
};
