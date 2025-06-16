import { requireNativeView } from 'expo';
import * as React from 'react';

import { AwsKmsExpoViewProps } from './AwsKmsExpo.types';

const NativeView: React.ComponentType<AwsKmsExpoViewProps> =
  requireNativeView('AwsKmsExpo');

export default function AwsKmsExpoView(props: AwsKmsExpoViewProps) {
  return <NativeView {...props} />;
}
