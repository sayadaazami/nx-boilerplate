export interface Schema {
  name: string;
  project: string;
  directory?: string;
  fileName?: string;
  flat?: boolean;
  skipTests?: boolean
}

export interface NormalizedSchema extends Required<Schema> {
  projectSourceRoot: string;
  fileName: string;
  className: string;
}