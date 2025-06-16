import { registerWebModule, NativeModule } from 'expo';

import { AwsKmsExpoModuleEvents } from './AwsKmsExpo.types';

class AwsKmsExpoModule extends NativeModule<AwsKmsExpoModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(AwsKmsExpoModule, 'AwsKmsExpoModule');
