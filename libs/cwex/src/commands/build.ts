import { resolve, basename } from 'path';
import { remove, copy, outputFile } from 'fs-extra';
import {
  getConfig,
  ExtensionInfoGenerator,
  ExtensionCompiler,
  CwexConfig,
} from '../config.js';
import {
  getFiles,
  getResolvedTargetModule,
  getResolvedModule,
} from '../utils/index.js';
import log from '../utils/logger.js';

export const buildTarget = async (
  config: CwexConfig,
  target: string,
  { outDir = '' }
) => {
  const resolvedTargetModule = getResolvedTargetModule(target);
  log('resolved module:', resolvedTargetModule);
  if (!resolvedTargetModule) {
    log('No module found for target:', target);
    return;
  }
  const targetModule = await import(resolvedTargetModule);
  const generateExtensionInfo: ExtensionInfoGenerator =
    targetModule.generateExtensionInfo;

  // TODO: Build target steps: beforeBuild:target, afterBuild:target, preCompile:target, postCompile:target

  // Compile templates with config data
  const extensionInfo = await generateExtensionInfo(config);
  log(`${target} extension info:`, extensionInfo);

  const extensionOutDir = resolve(outDir, `${target}-files`);
  log('Resolved output directory:', outDir);

  log('Removing output directory..');
  await remove(extensionOutDir);

  const includedFiles = await getFiles(config.include, {
    ignore: config.exclude,
    onlyFiles: false,
    expandDirectories: false,
    absolute: true,
    cwd: resolve(config.rootDir),
  });
  log('Included files:', includedFiles);

  log('Copying included files to output directory..');
  for (const file of includedFiles) {
    await copy(file, resolve(extensionOutDir, basename(file)), {
      filter: (src) => {
        return !config.exclude.find((excludeRegex) => {
          return new RegExp(excludeRegex).test(src);
        });
      },
    });
  }

  log('Copying manifest file to output directory..');
  const manifestOutputPath = resolve(extensionOutDir, extensionInfo.fileName);
  outputFile(manifestOutputPath, extensionInfo.content, 'utf8');

  const compileExtension: ExtensionCompiler = targetModule.compileExtension;

  if (compileExtension) {
    if (config.beforeCompile) {
      const resolvedBeforeCompileModule = getResolvedModule(
        resolve(process.cwd(), config.beforeCompile)
      );
      if (resolvedBeforeCompileModule) {
        log('Executing beforeCompile script..', resolvedBeforeCompileModule);
        const beforeCompileModule = await import(resolvedBeforeCompileModule);
        await beforeCompileModule({
          config,
          extensionFilesDir: extensionOutDir,
        });
      }
    }
    log('Compiling extension..');
    await compileExtension({
      config,
      extensionFilesDir: extensionOutDir,
      extensionBuildOutputDir: resolve(outDir, `${target}-build`),
    });
  }

  log('Build completed.');
};

export const buildProject = async ({ configPath = '' } = {}) => {
  log('Current working directory:', process.cwd());
  const config = await getConfig(configPath);
  log('Config:', config);

  const outDir = resolve(config.rootDir, config.outDir);
  log('Resolved output directory:', outDir);

  log('Removing output directory..');
  await remove(outDir);

  log(`Building for ${config.targets.length} targets:`, config.targets);
  for (const target of config.targets) {
    let targetConfig = config;
    if (config.targetOptions?.[target]) {
      targetConfig = { ...config, ...config.targetOptions[target] };
    }

    await buildTarget(targetConfig, target, { outDir });
  }
};
