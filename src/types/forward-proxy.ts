import { Address4 } from 'ip-address';
export interface ForwardProxy {
  readonly host: Address4;
  readonly port: number;
}
