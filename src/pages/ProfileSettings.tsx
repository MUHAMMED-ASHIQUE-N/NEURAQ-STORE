import { useState } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import { useAuth } from "../contexts/AuthContext";
import OrdersPage from "./Orders";

export default function ProfileSettingsPage() {
  const { user, updateUser, changePassword } = useAuth();
  const [username, setUsername] = useState(user?.username ?? "");
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);

  function saveProfile() {
    updateUser({ username, firstName, lastName, email });
  }

  function changePwd() {
    if (newPwd.length < 6) {
      setPwdMsg("Password must be at least 6 characters");
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg("Passwords do not match");
      return;
    }
    const res = changePassword(currentPwd, newPwd);
    setPwdMsg(
      res.ok ? "Password updated" : res.error || "Unable to update password"
    );
    if (res.ok) {
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    }
  }

  return (
    <div className="container py-8 md:py-10">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr,380px]">
        <section className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold">Profile</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={saveProfile}>Save changes</Button>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold">Change password</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="currentPwd">Current password</Label>
                <Input
                  id="currentPwd"
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="newPwd">New password</Label>
                <Input
                  id="newPwd"
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="confirmPwd">Confirm new password</Label>
                <Input
                  id="confirmPwd"
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Button onClick={changePwd}>Update password</Button>
              {pwdMsg && (
                <span className="text-sm text-muted-foreground">{pwdMsg}</span>
              )}
            </div>
          </div>

          <Separator />
        </section>

        <aside className="h-fit rounded-xl border p-4 text-sm text-muted-foreground">
          <div>
            Manage your profile information and password. Your changes are saved
            in your browser for this demo.
          </div>
        </aside>
      </div>
    </div>
  );
}
