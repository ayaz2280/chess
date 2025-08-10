import { renameLaunchTestFiles } from "./rename_launch_test_file";

const name = process.argv[0] ?? 'unit/applyMove.test.ts';

renameLaunchTestFiles(name);