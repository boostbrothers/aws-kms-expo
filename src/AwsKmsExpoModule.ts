import { NativeModule, requireNativeModule } from 'expo';

import { AwsKmsExpoModuleEvents } from './AwsKmsExpo.types';

declare class AwsKmsExpoModule extends NativeModule<AwsKmsExpoModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<AwsKmsExpoModule>('AwsKmsExpo');
