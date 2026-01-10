#!/usr/bin/env node
import { program } from 'commander';

program
  .name('tt')
  .description('Time tracking CLI')
  .version('1.0.0');

program.parse();
