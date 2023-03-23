import {
  applyChangesToString,
  formatFiles,
  generateFiles,
  getProjects,
  joinPathFragments,
  logger,
  names,
  ProjectConfiguration,
  Tree,
} from '@nrwl/devkit';
import { ensureTypescript } from '@nrwl/js/src/utils/typescript/ensure-typescript';
import { addImport } from '@nrwl/react/src/utils/ast-utils';
import { NormalizedSchema, Schema } from './types';

export default async function (host: Tree, schema: Schema) {
  const project = getProject(host, schema);
  const options = await normalizeOptions(schema, project);
  createComponentFiles(host, options);

  addExportsToBarrel(host, options);

  await formatFiles(host);
}

async function normalizeOptions(
  options: Schema,
  project: ProjectConfiguration
): Promise<NormalizedSchema> {
  const { className } = names(options.name);
  const directory = getDirectory(options, project);

  return {
    ...options,
    directory,
    className,
    fileName: className,
    projectSourceRoot: project.sourceRoot ?? '',
  };
}

function getProject(host: Tree, options: Schema) {
  const project = getProjects(host).get(options.project);
  if (!project) {
    logger.error(
      `Cannot find the ${options.project} project. Please double check the project name.`
    );
    throw new Error();
  }
  return project;
}

function getDirectory(options: Schema, project: ProjectConfiguration) {
  const genNames = names(options.name);
  const fileName = genNames.className;
  const baseDir = options.directory
    ? options.directory
    : project.projectType === 'library'
    ? 'lib/components'
    : 'components';
  return joinPathFragments(baseDir, fileName);
}

function createComponentFiles(host: Tree, options: NormalizedSchema) {
  const componentDir = joinPathFragments(
    options.projectSourceRoot,
    options.directory
  );
  const filesPath = joinPathFragments(__dirname, './files');
  generateFiles(host, filesPath, componentDir, { ...options, tmpl: '' });
}

let tsModule: typeof import('typescript');

function addExportsToBarrel(host: Tree, options: NormalizedSchema) {
  if (!tsModule) tsModule = ensureTypescript();
  const indexFilePath = joinPathFragments(
    options.projectSourceRoot,
    options.directory,
    '../',
    'index.ts'
  );
  const indexSource = host.read(indexFilePath, 'utf-8');
  if (indexSource !== null) {
    const indexSourceFile = tsModule.createSourceFile(
      indexFilePath,
      indexSource,
      tsModule.ScriptTarget.Latest,
      true
    );
    const changes = applyChangesToString(
      indexSource,
      addImport(indexSourceFile, `export * from './${options.fileName}';`)
    );
    host.write(indexFilePath, changes);
  }
}
