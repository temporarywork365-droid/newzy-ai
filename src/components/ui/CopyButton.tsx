import { useState } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Button } from './Button';

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

export function CopyButton({ text, label = 'Copy', variant = 'secondary', style }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      label={copied ? 'Copied' : label}
      icon={copied ? 'checkmark-outline' : 'copy-outline'}
      variant={copied ? 'secondary' : variant}
      onPress={copy}
      style={style}
    />
  );
}
