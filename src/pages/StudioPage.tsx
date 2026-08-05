import { useAdminAuth } from '../context/AdminAuth';
import {
  LoginPanel,
  MfaPanel,
  MisconfiguredPanel,
  StudioLoading,
} from '../components/studio/StudioAuth';
import { StudioWorkspace } from '../components/studio/StudioWorkspace';
import '../styles/studio.css';

export const StudioPageContent = () => {
  const auth = useAdminAuth();

  if (auth.status === 'misconfigured') return <MisconfiguredPanel />;
  if (auth.status === 'loading') return <StudioLoading />;
  if (auth.status === 'mfa-required') {
    return (
      <MfaPanel
        label={auth.mfaLabel}
        error={auth.error}
        onVerify={auth.verifyMfa}
        onCancel={auth.cancelMfa}
        onClearError={auth.clearError}
      />
    );
  }
  if (auth.status === 'signed-out') {
    return (
      <LoginPanel
        error={auth.error}
        onLogin={auth.login}
        onClearError={auth.clearError}
      />
    );
  }

  return (
    <StudioWorkspace
      userEmail={auth.user?.email || 'verified admin'}
      onLogout={auth.logout}
    />
  );
};

const StudioPage = () => (
  <div className="studio-root">
    <StudioPageContent />
  </div>
);

export default StudioPage;
