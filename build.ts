#!/usr/bin/env -S deno run -A

// Manual build script for SilverBullet plugin

import { bundle } from "https://deno.land/x/emit@0.31.0/mod.ts";

async function buildPlugin() {
  console.log("Building D&D Mapping Plugin...");
  
  try {
    // Bundle the main TypeScript file
    const result = await bundle("./dnd-mapping.ts", {
      compilerOptions: {
        lib: ["dom", "dom.iterable", "es2022"],
        target: "es2022",
        strict: true,
      },
    });

    // Write the bundled code to the output file
    const outputPath = "./dnd-mapping.plug.js";
    await Deno.writeTextFile(outputPath, result.code);
    
    console.log(`✅ Plugin built successfully: ${outputPath}`);
    console.log(`📦 Size: ${(result.code.length / 1024).toFixed(1)}KB`);
    
  } catch (error) {
    console.error("❌ Build failed:", error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  await buildPlugin();
}