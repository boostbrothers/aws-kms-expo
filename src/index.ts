// Reexport the native module. On web, it will be resolved to AwsKmsExpoModule.web.ts
// and on native platforms to AwsKmsExpoModule.ts
export { default } from './AwsKmsExpoModule';
export { default as AwsKmsExpoView } from './AwsKmsExpoView';
export * from  './AwsKmsExpo.types';
