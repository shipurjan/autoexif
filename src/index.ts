#!/usr/bin/env node
import { Command } from "commander";
import { version } from "~/package.json";
import { autoexif } from "@/programs/autoexif";

const program = new Command();

program
  .name("autoexif")
  .description("Automatically remove excess EXIF data from a file")
  .version(version)
  .requiredOption(
    "-i, --input <path>",
    "Input file path to the file with EXIF data that should be removed",
  )
  .option(
    "-o, --output <path>",
    "Output file path to save the file with removed EXIF data",
  )
  .action(autoexif);

program.parse();
