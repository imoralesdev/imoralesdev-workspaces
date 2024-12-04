export const getApiDocs = async () => {
    // Import Swagger specification statically
    const swaggerSpec = (await import("@/swagger.json")).default;
    return swaggerSpec;
  };