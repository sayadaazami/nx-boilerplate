import {
  formatFiles,
  generateFiles,
  getProjects,
  joinPathFragments,
  logger,
  names,
  ProjectConfiguration,
  Tree,
} from '@nrwl/devkit';
import { NormalizedSchema, Schema } from './types';

function riseError(msg: string) {
  logger.error(msg);
  throw new Error(msg);
}

export default async function (host: Tree, schema: Schema) {
  const project = getProject(host, schema);
  const options = await normalizeOptions(schema, project);
  createComponentFiles(host, options);
  await formatFiles(host);
}

async function normalizeOptions(
  options: Schema,
  project: ProjectConfiguration
): Promise<NormalizedSchema> {
  const { className } = names(options.name);
  const directory = getDirectory(options);

  return {
    ...options,
    directory,
    className,
    fileName: className,
    projectSourceRoot: project.sourceRoot ?? '',
  };
}

function getProject(host: Tree, options: Schema) {
  const project = getProjects(host).get(options.project)!;
  if (!project)
    riseError(
      `Cannot find the ${options.project} project. Please double check the project name.`
    );

  if (project.projectType === 'library')
    riseError(`Cannot add page in libraries!`);

  return project;
}

function getDirectory(options: Schema) {
  const genNames = names(options.name);
  const fileName = genNames.className;
  let baseDir = options.directory ?? 'pages';

  return joinPathFragments(baseDir, fileName);
}

function createComponentFiles(host: Tree, options: NormalizedSchema) {
  const componentDir = joinPathFragments(
    options.projectSourceRoot,
    options.directory.toLowerCase()
  );
  const filesPath = joinPathFragments(__dirname, './files');
  generateFiles(host, filesPath, componentDir, { ...options, tmpl: '' });
}
