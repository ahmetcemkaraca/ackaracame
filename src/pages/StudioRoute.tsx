import { AdminAuthProvider } from '../context/AdminAuth';
import StudioPage from './StudioPage';

export default function StudioRoute() {
  return <AdminAuthProvider><StudioPage /></AdminAuthProvider>;
}
