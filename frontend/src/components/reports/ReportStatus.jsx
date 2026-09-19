import React from 'react';
import { Badge } from '../common/Badge';
import './reports.css';

const STATUS_VARIANT = {
  Draft:      'neutral',
  Queued:     'info',
  Generating: 'processing',
  Ready:      'success',
  Failed:     'critical',
};

export const ReportStatus = ({ status }) => (
  <Badge variant={STATUS_VARIANT[status] || 'neutral'} dot>
    {status}
  </Badge>
);
