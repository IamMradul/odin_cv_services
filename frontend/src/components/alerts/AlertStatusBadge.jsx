import React from 'react';
import { Badge } from '../common/Badge';

const STATUS_VARIANT = {
  New:           'new',
  Acknowledged:  'acknowledged',
  Investigating: 'investigating',
  Resolved:      'resolved',
};

export const AlertStatusBadge = ({ status }) => (
  <Badge variant={STATUS_VARIANT[status] || 'neutral'} dot>{status}</Badge>
);
