"use client";

import { Loader2 } from "lucide-react";
import { LoginScreen } from "@/components/login/LoginScreen";
import { Sidebar } from "@/components/layout/Sidebar";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useAuth } from "@/hooks/useAuth";
import { useRooms } from "@/hooks/useRooms";
import { useSettings } from "@/hooks/useSettings";
import type { Room } from "@/hooks/useRooms";

export type AppShellProps = {
  children: React.ReactNode;
};

export const AppShell = ({ children }: AppShellProps) => {
  const auth = useAuth();
  const rooms = useRooms();
  const settings = useSettings(auth.isAuthenticated);

  if (auth.isAuthenticated === null) {
    return (
      <main className="min-h-screen bg-[color:var(--bg-primary)] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[color:var(--accent)]" />
      </main>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <LoginScreen
        username={auth.loginUsername}
        onUsernameChange={auth.setLoginUsername}
        password={auth.loginPassword}
        onPasswordChange={auth.setLoginPassword}
        error={auth.loginError}
        loading={auth.loginLoading}
        onSubmit={auth.handleLogin}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg-primary)] text-[color:var(--text-primary)] flex">
      <Sidebar
        rooms={rooms.rooms}
        selectedRoomId={rooms.selectedRoomId}
        newRoomName={rooms.newRoomName}
        onNewRoomNameChange={rooms.setNewRoomName}
        onCreateRoom={rooms.createRoom}
        onSelectRoom={rooms.selectRoom}
        onRenameRoom={rooms.renameRoom}
        onDeleteRoom={rooms.deleteRoom}
        onOpenSettings={() => settings.setIsSettingsOpen(true)}
        onLogout={() => {
          auth.handleLogout();
          settings.clearSettings();
        }}
      />
      {children}
      <SettingsModal
        open={settings.isSettingsOpen}
        onClose={() => settings.setIsSettingsOpen(false)}
        openaiApiKey={settings.openaiApiKey}
        onOpenaiApiKeyChange={settings.setOpenaiApiKey}
        deepgramApiKey={settings.deepgramApiKey}
        onDeepgramApiKeyChange={settings.setDeepgramApiKey}
        isSaving={settings.isSavingSettings}
        onSave={settings.saveSettings}
      />
    </main>
  );
};

export type { Room };
