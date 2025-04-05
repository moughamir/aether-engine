import type {Body} from 'cannon'
import { ComponentMap } from './componentMap';

export interface Entity<T extends ComponentMap = ComponentMap> {
  id: string;
  type: string;
  components: T;
  tags?: string[];
  body?: Body;
  createdAt?: Date;
  updatedAt?: Date;
}
