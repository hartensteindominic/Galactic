import './tailwind.css';
import { PrototypeNetworkGuard } from './prototype-network-guard';

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrototypeNetworkGuard />
      {children}
    </>
  );
}
