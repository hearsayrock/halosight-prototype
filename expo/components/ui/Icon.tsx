import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

const ICON_MAP: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  search: 'search',
  close: 'close',
  add: 'add',
  check: 'check',
  chevron_right: 'chevron-right',
  chevron_left: 'chevron-left',
  keyboard_arrow_down: 'keyboard-arrow-down',
  calendar_today: 'event',
  cancel: 'cancel',
  edit: 'edit',
  more_vert: 'more-vert',
  refresh: 'refresh',
  arrow_back: 'arrow-back',
  person: 'person',
  location_on: 'location-on',
  phone: 'phone',
  business: 'business',
};

interface Props {
  name: string;
  size?: number;
  color?: string;
}

export default function Icon({ name, size = 24, color = '#fff' }: Props) {
  const iconName = ICON_MAP[name] ?? 'help-outline';
  return <MaterialIcons name={iconName} size={size} color={color} />;
}
