import * as React from 'react';

import { AwsKmsExpoViewProps } from './AwsKmsExpo.types';

export default function AwsKmsExpoView(props: AwsKmsExpoViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
