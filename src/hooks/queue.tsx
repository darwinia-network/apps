import { useContext } from 'react';
import { QueueContext, QueueCtx } from '../providers';

export const useQueue = () => useContext(QueueContext) as Exclude<QueueCtx, null>;
