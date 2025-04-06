// index.ts (Main Entry Point)
import { startServer } from "./createServer"; // Assuming server.ts is in the same directory

async function main() {
  try {
    const { app, server, io, supabase, redis, gameServer } =
      await startServer();

    // You can optionally do more with the server, app, etc. here if needed
    // For example, set up more routes on 'app' after the base server is created.

    console.log("Aether server initialized and started.");

    // Optionally export if you need to access these in tests or other modules
    return { app, server, io, supabase, redis, gameServer };
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1); // Exit process on startup failure
  }
}

// Run the main function to start the server
main().catch((err) => {
  console.error("Unhandled error during startup:", err);
  process.exit(1);
});
